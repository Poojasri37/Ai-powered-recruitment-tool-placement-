import Groq from 'groq-sdk';
import 'dotenv/config';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL_NAME = 'llama-3.3-70b-versatile';

async function generateGroqContent(prompt: string, jsonMode: boolean = false): Promise<string> {
  try {
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
    if (jsonMode) console.log('DEBUG GROQ RAW:', content.substring(0, 200));
    return content;
  } catch (error) {
    console.error('Groq API error:', error);
    throw error;
  }
}

export async function evaluateInterviewResponse(
  question: string,
  answer: string,
  type: 'behavioral' | 'technical' | 'coding',
  jobContext: string,
  requiredSkills: string[]
): Promise<string> {
  try {
    const prompt =
      type === 'coding'
        ? `As an expert code reviewer, evaluate this coding response:
     
Question: ${question}
Candidate's Code:
\`\`\`
${answer}
\`\`\`

Job Requirements: ${requiredSkills.join(', ')}
Context: ${jobContext}

Provide a concise evaluation (2-3 sentences) covering:
1. Code correctness and logic
2. Code quality and best practices
3. Efficiency and optimization potential
Be constructive and specific.`
        : type === 'technical'
          ? `As a senior technical interviewer, evaluate this technical response:
     
Question: ${question}
Candidate's Answer: ${answer}

Required Skills: ${requiredSkills.join(', ')}
Job Context: ${jobContext}

Provide a concise evaluation (2-3 sentences) covering:
1. Technical accuracy and depth
2. Problem-solving approach
3. Communication clarity
Be constructive and encouraging.`
          : `As an HR expert, evaluate this behavioral response:
     
Question: ${question}
Candidate's Answer: ${answer}

Job Context: ${jobContext}
Required Skills: ${requiredSkills.join(', ')}

Provide a concise evaluation (2-3 sentences) covering:
1. Relevance to the job
2. Demonstration of key competencies
3. Communication and clarity
Be encouraging and specific.`;

    const evaluation = await generateGroqContent(prompt);
    return evaluation || 'Unable to generate evaluation';
  } catch (error) {
    console.error('Groq evaluation error:', error);
    return 'Evaluation pending - technical assessment required';
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

    return [];
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
    return typeof parsed.score === 'number' ? parsed.score : 0;
  } catch(error) {
    console.error('Groq AIMatchScore error', error);
    return 0;
  }
}

export async function generateFollowUpQuestion(
  previousQuestion: string,
  candidateAnswer: string
): Promise<string> {
  try {
    const prompt = `The candidate was asked: "${previousQuestion}"
Their answer was: "${candidateAnswer}"

Based on their answer, generate exactly ONE engaging follow-up question to probe deeper into their reasoning, technical knowledge, or experience. Do not write anything else, just the question itself.`;

    const followUp = await generateGroqContent(prompt, false);
    return followUp.replace(/["']/g, '').trim();
  } catch(error) {
    console.error('Groq follow-up generation error', error);
    return 'Could you elaborate more on that?';
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
    const responsesText = responses.map((r, i) =>
      `Q${i+1} [${r.type}]: ${r.question}\nAnswer: ${r.answer}`
    ).join('\n\n');

    const prompt = `You are an expert mock interview evaluator. Analyze these interview answers thoroughly.

Resume Context: ${resumeText.substring(0, 2000)}

Interview Responses:
${responsesText}

Return a detailed JSON analysis with this exact structure:
{
  "overallScore": <0-100>,
  "communicationScore": <0-100>,
  "technicalScore": <0-100>,
  "confidenceScore": <0-100>,
  "summary": "<2-3 sentence overall assessment>",
  "questionAnalysis": [
    {
      "question": "<the question>",
      "answer": "<the answer>",
      "score": <0-100>,
      "communicationFeedback": "<how well they communicated: clarity, structure, filler words>",
      "technicalFeedback": "<accuracy of technical content>",
      "improvementTips": "<specific actionable improvement advice>"
    }
  ],
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "weaknesses": ["<weakness1>", "<weakness2>"],
  "recommendations": ["<recommendation1>", "<recommendation2>", "<recommendation3>"]
}

Be specific and constructive. Return ONLY valid JSON.`;

    const jsonStr = await generateGroqContent(prompt, true);
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Groq mock report error:', error);
    return {
      overallScore: 0,
      communicationScore: 0,
      technicalScore: 0,
      confidenceScore: 0,
      summary: 'Report generation failed. Please try again.',
      questionAnalysis: [],
      strengths: [],
      weaknesses: [],
      recommendations: [],
    };
  }
}
