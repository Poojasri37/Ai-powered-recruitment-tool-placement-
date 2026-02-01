import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function evaluateInterviewResponse(
  question: string,
  answer: string,
  type: 'behavioral' | 'technical' | 'coding',
  jobContext: string,
  requiredSkills: string[]
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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

    const result = await model.generateContent(prompt);
    const evaluation = result.response.text();
    return evaluation || 'Unable to generate evaluation';
  } catch (error) {
    console.error('Gemini evaluation error:', error);
    return 'Evaluation pending - technical assessment required';
  }
}

export async function generateInterviewQuestions(
  jobTitle: string,
  jobDescription: string,
  requiredSkills: string[]
): Promise<
  Array<{
    question: string;
    type: 'behavioral' | 'technical' | 'coding' | 'situational';
  }>
> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Generate 10 interview questions for a ${jobTitle} role.

Job Description: ${jobDescription}
Required Skills: ${requiredSkills.join(', ')}

Return a JSON array with exactly 10 questions in this format:
[
  { "question": "...", "type": "behavioral" },
  { "question": "...", "type": "behavioral" },
  { "question": "...", "type": "technical" },
  { "question": "...", "type": "technical" },
  { "question": "...", "type": "technical" },
  { "question": "...", "type": "coding" },
  { "question": "...", "type": "coding" },
  { "question": "...", "type": "situational" },
  { "question": "...", "type": "situational" },
  { "question": "...", "type": "situational" }
]

Question distribution:
- 2 behavioral (about past experiences)
- 3 technical (about technical knowledge)
- 2 coding (practical coding problems)
- 3 situational (how would you handle scenarios)

Make questions specific to the role and skills. Keep each question concise (1-2 sentences).
Return ONLY valid JSON, no other text.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const questions = JSON.parse(jsonMatch[0]);
      return questions;
    }

    // Fallback questions if parsing fails
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
  } catch (error) {
    console.error('Gemini question generation error:', error);
    return [
      {
        question: `Tell me about your experience with ${requiredSkills[0] || 'this role'}`,
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
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

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

    const result = await model.generateContent(prompt);
    return result.response.text() || 'Summary pending detailed review';
  } catch (error) {
    console.error('Gemini summary error:', error);
    return 'Interview summary pending - comprehensive review in progress';
  }
}
