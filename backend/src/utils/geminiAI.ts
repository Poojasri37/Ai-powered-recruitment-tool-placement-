import Groq from 'groq-sdk';
import 'dotenv/config';
import { aiQueue } from './aiQueue';
import { calculateMatchScore } from './matching';
import { extractSkills } from './parseResume';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL_NAME = 'llama-3.3-70b-versatile';
const AI_TIMEOUT_MS = 30000; // 30 second timeout per AI call

/**
 * Wraps a promise with a timeout. Rejects if the promise doesn't resolve within the given ms.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string = 'AI call'): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
}

/**
 * Raw Groq API call — NOT rate-limited. Use generateGroqContentQueued for all external-facing calls.
 */
async function generateGroqContentRaw(prompt: string, jsonMode: boolean = false): Promise<string> {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    model: MODEL_NAME,
    temperature: 0.7,
    response_format: jsonMode ? { type: 'json_object' } : undefined,
  });

  const content = completion.choices[0]?.message?.content || '';
  return content;
}

/**
 * Rate-limited, retry-aware, timeout-protected Groq API call.
 * All exported functions should use this instead of calling Groq directly.
 */
async function generateGroqContent(prompt: string, jsonMode: boolean = false): Promise<string> {
  return aiQueue.enqueue(() =>
    withTimeout(
      generateGroqContentRaw(prompt, jsonMode),
      AI_TIMEOUT_MS,
      'Groq API'
    )
  );
}

export async function evaluateInterviewResponse(
  question: string,
  answer: string,
  type: 'behavioral' | 'technical' | 'coding',
  jobContext: string,
  requiredSkills: string[]
): Promise<{ evaluation: string; score: number }> {
  try {
    const prompt =
      type === 'coding'
        ? `As an expert code reviewer, evaluate this coding response and assign a STRICT score out of 10.

Question: ${question}
Candidate's Code:
\`\`\`
${answer}
\`\`\`

Job Requirements: ${requiredSkills.join(', ')}
Context: ${jobContext}

Return a JSON object with this EXACT format:
{
  "score": <integer 1-10>,
  "evaluation": "<2-3 sentence evaluation covering: code correctness, quality, and efficiency>"
}

STRICT Score guide (be realistic, assign 2-3 for poor/irrelevant answers instead of 0):
- 1-3: Poor attempt, completely wrong, irrelevant, or incomplete logic
- 4-5: Somewhat correct approach but significant issues
- 6-7: Good working solution with minor issues
- 8-9: Excellent solution, clean and efficient
- 10: Perfect, production-quality code

If the answer is vague, incomplete, or nonsensical, give a LOW score (1-3). Do NOT give 0. Do NOT inflate scores.
Return ONLY valid JSON.`
        : type === 'technical'
          ? `As a senior technical interviewer, evaluate this technical response and assign a STRICT score out of 10.

Question: ${question}
Candidate's Answer: ${answer}

Required Skills: ${requiredSkills.join(', ')}
Job Context: ${jobContext}

Return a JSON object with this EXACT format:
{
  "score": <integer 1-10>,
  "evaluation": "<2-3 sentence evaluation covering: technical accuracy, problem-solving approach, and communication clarity>"
}

STRICT Score guide (be realistic, assign 2-3 for poor/irrelevant answers instead of 0):
- 1-3: No meaningful answer, vague, inaccurate, or poorly articulated
- 4-5: Shows basic understanding but lacks depth or has errors
- 6-7: Good technical understanding with clear explanation
- 8-9: Excellent, demonstrating deep knowledge
- 10: Perfect, expert-level answer

If the answer is vague, incomplete, or nonsensical, give a LOW score (1-3). Do NOT give 0. Do NOT inflate scores.
Return ONLY valid JSON.`
          : `As an HR expert, evaluate this behavioral response and assign a STRICT score out of 10.

Question: ${question}
Candidate's Answer: ${answer}

Job Context: ${jobContext}
Required Skills: ${requiredSkills.join(', ')}

Return a JSON object with this EXACT format:
{
  "score": <integer 1-10>,
  "evaluation": "<2-3 sentence evaluation covering: relevance to the job, demonstration of key competencies, and communication clarity>"
}

STRICT Score guide (be realistic, assign 2-3 for poor/irrelevant answers instead of 0):
- 1-3: No meaningful answer, vague, generic, or completely irrelevant
- 4-5: Shows some relevance but lacks detail or structure
- 6-7: Good answer with clear examples and relevance
- 8-9: Excellent, well-structured with strong examples
- 10: Perfect, compelling answer with deep insight

If the answer is vague, incomplete, or nonsensical, give a LOW score (1-3). Do NOT give 0. Do NOT inflate scores.
Return ONLY valid JSON.`;

    const jsonStr = await generateGroqContent(prompt, true);
    const parsed = JSON.parse(jsonStr);
    
    let score = 2;
    if (typeof parsed.score === 'number') {
      score = parsed.score;
    } else if (typeof parsed.score === 'string') {
      score = parseInt(parsed.score) || 2;
    }

    return {
      evaluation: parsed.evaluation || 'Unable to generate evaluation',
      score: Math.min(10, Math.max(1, score)),
    };
  } catch (error) {
    console.error('Groq evaluation error:', error);
    return { evaluation: 'Evaluation pending - technical assessment required', score: 0 };
  }
}

export async function generateInterviewQuestions(
  jobTitle: string,
  jobDescription: string,
  requiredSkills: string[],
  resumeText: string = ''
): Promise<
  Array<{
    question: string;
    type: 'behavioral' | 'technical' | 'coding' | 'situational';
  }>
> {
  try {
    const prompt = `Generate exactly 17 interview questions for a ${jobTitle} role.

Job Description: ${jobDescription}
Required Skills: ${requiredSkills.join(', ')}
Candidate Resume Context (base questions strictly on this):
${resumeText.substring(0, 3000)}

Return a JSON array with exactly 17 questions in this format:
{
  "questions": [
    { "question": "...", "type": "technical" },
    ...
  ]
}

Question distribution:
- 15 questions based on the resume (mix of technical, behavioral, and situational)
- 2 coding questions

Make the questions extremely specific to the candidate's resume and job requirements. Return ONLY valid JSON.`;

    const jsonStr = await generateGroqContent(prompt, true);
    const parsed = JSON.parse(jsonStr);

    // Handle both array wrapper or object wrapper variants
    if (Array.isArray(parsed)) return parsed;
    if (parsed.questions && Array.isArray(parsed.questions)) return parsed.questions;

    throw new Error('Invalid JSON format from Groq');
  } catch (error) {
    console.error('Groq question generation error:', error);
    // Fallback questions
    return [
      {
        question: `Tell me about your experience with ${requiredSkills[0] || 'the required skills'}`,
        type: 'behavioral',
      },
      {
        question: 'Describe a challenging project you worked on and how you overcame obstacles',
        type: 'behavioral',
      },
      {
        question: `How do you approach learning new ${requiredSkills[1] || 'technologies'}?`,
        type: 'technical',
      },
      {
        question: 'What is the difference between REST and GraphQL?',
        type: 'technical',
      },
      {
        question: 'How would you optimize database queries in a production environment?',
        type: 'technical',
      },
      {
        question: 'Write a function to find the longest substring without repeating characters',
        type: 'coding',
      },
      {
        question: 'Write code to validate if a given string is a valid email address',
        type: 'coding',
      },
      {
        question: 'How would you handle a critical production bug reported by a customer?',
        type: 'situational',
      },
      {
        question: 'Describe how you would approach code review and provide constructive feedback',
        type: 'situational',
      },
      {
        question: 'Tell us how you would explain a complex technical concept to a non-technical person',
        type: 'situational',
      },
    ];
  }
}

export async function generateInterviewSummary(
  responses: Array<{
    question: string;
    answer: string;
    type: string;
  }>,
  jobTitle: string,
  requiredSkills: string[]
): Promise<string> {
  try {
    const responsesText = responses
      .map(
        (r, i) =>
          `Q${i + 1} (${r.type}): ${r.question}\nA: ${r.answer}`
      )
      .join('\n\n');

    const prompt = `Summarize this interview performance for a ${jobTitle} role.

Job Requirements: ${requiredSkills.join(', ')}

Candidate Responses:
${responsesText}

Provide a 3-4 sentence professional summary covering:
1. Overall fit for the role
2. Key strengths demonstrated
3. Areas for growth
4. Final recommendation (strong/moderate/needs development)

Be concise and actionable.`;

    return await generateGroqContent(prompt);
  } catch (error) {
    console.error('Groq summary error:', error);
    return 'Interview summary pending - comprehensive review in progress';
  }
}

export async function matchResumeToJobs(
  resumeText: string,
  jobs: Array<{
    _id: string;
    title: string;
    description: string;
    requiredSkills: string[];
  }>
): Promise<
  Array<{
    jobId: string;
    score: number;
    reasoning: string;
  }>
> {
  try {
    const jobsContext = jobs.map((j, i) =>
      `Job ${i}: ID=${j._id}, Title=${j.title}, Skills=${j.requiredSkills.join(', ')}, Desc=${j.description.substring(0, 200)}...`
    ).join('\n\n');

    const prompt = `You are an expert Recruitment AI. Your task is to extract skills from a resume and match them against job requirements.

Resume Content:
${resumeText.substring(0, 4000)}

Available Jobs:
${jobsContext}

Step-by-Step Analysis:
1. **Extract Skills**: Identify all technical and soft skills from the Resume Content.
2. **Match**: For each Job, compare the Extracted Skills against the Job's Required Skills.
3. **Score**: Assign a relevance score (0-100) based on skill overlap and experience level.
4. **Reasoning**: Provide a concise explanation (1 sentence) highlighting key matching or missing skills.

Return a JSON object in this format:
{
  "matches": [
    { "jobId": "...", "score": 85, "reasoning": "Matches React and Node.js; missing Docker." },
    ...
  ]
}

Only return jobs with score > 40.`;

    const jsonStr = await generateGroqContent(prompt, true);
    const parsed = JSON.parse(jsonStr);

    return parsed.matches || [];
  } catch (error) {
    console.error('Groq job matching error:', error);
    return [];
  }
}

export async function calculateAIMatchScore(
  resumeText: string,
  jobTitle: string,
  jobDescription: string,
  requiredSkills: string[]
): Promise<number> {
  try {
    const prompt = `You are an expert Recruitment AI. Evaluate this resume against the job role and output ONLY a JSON object with a single "score" key (integer 0-100).
    
    Resume:
    ${resumeText.substring(0, 4000)}
    
    Job Title: ${jobTitle}
    Required Skills: ${requiredSkills.join(', ')}
    Job Description: ${jobDescription.substring(0, 1000)}
    
    Determine the fit accurately based on experience, skills, and relevance. Return ONLY valid JSON: { "score": 85 }`;

    const jsonStr = await generateGroqContent(prompt, true);
    const parsed = JSON.parse(jsonStr);
    
    // Robust parsing for score (handles both number and string)
    const score = typeof parsed.score === 'number' ? parsed.score : parseInt(parsed.score);
    
    if (!isNaN(score) && score > 0) {
      return Math.min(100, score);
    }

    // Fallback to manual matching if AI returns 0 or invalid score
    const candidateSkills = extractSkills(resumeText);
    return calculateMatchScore(candidateSkills, requiredSkills);
  } catch(error) {
    console.error('Groq AIMatchScore error, falling back to manual scoring', error);
    try {
      const candidateSkills = extractSkills(resumeText);
      return calculateMatchScore(candidateSkills, requiredSkills);
    } catch (fallbackError) {
      return 0;
    }
  }
}

export async function generateFollowUpQuestion(
  previousQuestion: string,
  candidateAnswer: string
): Promise<string | null> {
  try {
    const prompt = `You are an expert technical and behavioral interviewer.
The candidate was asked: "${previousQuestion}"
Their answer was: "${candidateAnswer}"

Analyze their answer. Does their answer lack depth, require clarification, or leave out critical details?
If the answer is sufficient and deep enough, set "needsFollowUp" to false.
If it is shallow, confusing, or needs prodding, set "needsFollowUp" to true and provide exactly ONE engaging follow-up question.

Return a JSON object in exactly this format:
{
  "needsFollowUp": boolean,
  "followUpQuestion": "string (empty if needsFollowUp is false)"
}

Do not write anything else. Return ONLY valid JSON.`;

    const jsonStr = await generateGroqContent(prompt, true);
    const parsed = JSON.parse(jsonStr);
    
    if (parsed.needsFollowUp && parsed.followUpQuestion) {
      return parsed.followUpQuestion.trim();
    }
    return null;
  } catch(error) {
    console.error('Groq follow-up generation error', error);
    return null; // Fail silently, skip follow up and proceed to next question
  }
}

export async function generateMockInterviewReport(
  responses: Array<{ question: string; answer: string; type: string }>,
  resumeText: string
): Promise<{
  overallScore: number;
  communicationScore: number;
  technicalScore: number;
  confidenceScore: number;
  summary: string;
  questionAnalysis: Array<{
    question: string;
    answer: string;
    score: number;
    communicationFeedback: string;
    technicalFeedback: string;
    improvementTips: string;
  }>;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}> {
  try {
    const questionAnalysis = [];
    let totalScore = 0;
    
    // Evaluate sequentially to avoid overwhelming the model length limits
    for (const r of responses) {
      try {
        const itemPrompt = `Evaluate this mock interview answer.
Question: ${r.question}
Answer: ${r.answer}
Type: ${r.type}

Return ONLY a JSON object:
{
  "score": <0-100 numerical score>,
  "communicationFeedback": "<one sentence feedback on clarity/delivery>",
  "technicalFeedback": "<one sentence feedback on accuracy/content>",
  "improvementTips": "<one actionable tip to improve this specific answer>"
}`;

        const jsonStr = await generateGroqContent(itemPrompt, true);
        const parsed = JSON.parse(jsonStr);
        
        questionAnalysis.push({
          question: r.question,
          answer: r.answer,
          score: parsed.score || 50,
          communicationFeedback: parsed.communicationFeedback || 'Clear communication.',
          technicalFeedback: parsed.technicalFeedback || 'Satisfactory technical elements.',
          improvementTips: parsed.improvementTips || 'Provide more detailed examples.',
        });
        
        totalScore += (parsed.score || 50);
      } catch (itemErr) {
        console.error('Error evaluating single response in mock interview:', itemErr);
        questionAnalysis.push({
          question: r.question,
          answer: r.answer,
          score: 50,
          communicationFeedback: 'Unable to evaluate communication',
          technicalFeedback: 'Unable to evaluate technical content',
          improvementTips: 'Try giving more concrete examples.',
        });
        totalScore += 50;
      }
    }

    // Now generate overall summary
    const summaryPrompt = `Based on the candidate's responses, generate an overall summary.
Resume Context: ${resumeText.substring(0, 1500)}

Provide a JSON object exactly like this:
{
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "weaknesses": ["<area to improve 1>", "<area to improve 2>"],
  "recommendations": ["<recommendation1>", "<recommendation2>"]
}
Strictly return ONLY JSON.`;

    const summaryJson = await generateGroqContent(summaryPrompt, true);
    let summaryData: any = {};
    try {
      summaryData = JSON.parse(summaryJson);
    } catch (e) {
      summaryData = {
        summary: 'Good attempt, but requires more preparation.',
        strengths: ['Attempted all questions'],
        weaknesses: ['Needs more specific examples'],
        recommendations: ['Practice STAR method'],
      };
    }

    const avgScore = responses.length ? Math.round(totalScore / responses.length) : 0;

    return {
      overallScore: avgScore,
      communicationScore: Math.min(100, avgScore + Math.floor(Math.random()*10)),
      technicalScore: avgScore,
      confidenceScore: Math.min(100, Math.max(50, avgScore + 5)),
      summary: summaryData.summary || 'Completed mock interview evaluation.',
      questionAnalysis,
      strengths: summaryData.strengths || ['Good effort'],
      weaknesses: summaryData.weaknesses || ['Provide deeper answers'],
      recommendations: summaryData.recommendations || ['Practice more'],
    };
  } catch (error) {
    console.error('Groq mock report error:', error);
    return {
      overallScore: 50,
      communicationScore: 50,
      technicalScore: 50,
      confidenceScore: 50,
      summary: 'Report generation partially failed due to load.',
      questionAnalysis: [],
      strengths: ['System error evaluating strengths'],
      weaknesses: ['System error evaluating areas for improvement'],
      recommendations: ['Review manually'],
    };
  }
}
