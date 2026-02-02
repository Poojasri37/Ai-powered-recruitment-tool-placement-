import { matchResumeToJobs } from './utils/geminiAI';
import 'dotenv/config';

async function testGroq() {
    console.log('Testing Groq AI Integration...');

    const resumeText = "I contain skills in React, Node.js, and TypeScript. I have 5 years of experience.";
    const jobs = [
        {
            _id: "1",
            title: "Senior Frontend Engineer",
            description: "Looking for a React expert.",
            requiredSkills: ["React", "TypeScript", "CSS"]
        },
        {
            _id: "2",
            title: "Backend Developer",
            description: "Python and Django expert needed.",
            requiredSkills: ["Python", "Django", "SQL"]
        }
    ];

    try {
        const matches = await matchResumeToJobs(resumeText, jobs);
        console.log('Matches found:', JSON.stringify(matches, null, 2));

        if (matches.length > 0 && matches[0].score > 0) {
            console.log('✓ SUCCESS: Groq returned valid matches.');
        } else {
            console.log('⚠ WARNING: Groq returned empty or invalid matches.');
        }
    } catch (error) {
        console.error('✗ FAILED:', error);
    }
}

testGroq();
