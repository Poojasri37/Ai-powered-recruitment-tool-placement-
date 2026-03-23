import fs from 'fs';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  education: Array<{ degree: string; field: string; institution: string }>;
  experience: Array<{ title: string; company: string; duration: string }>;
  rawText?: string;
}

export const parseResume = async (filePath: string): Promise<ParsedResume> => {
  let text = '';

  // Determine file type and parse accordingly
  if (filePath.endsWith('.pdf')) {
    text = await parsePDF(filePath);
  } else if (filePath.endsWith('.docx')) {
    text = await parseDOCX(filePath);
  } else {
    throw new Error('Unsupported file format. Only PDF and DOCX are supported.');
  }

  // Extract information from text
  return extractResumeInfo(text);
};

const parsePDF = async (filePath: string): Promise<string> => {
  const fileBuffer = fs.readFileSync(filePath);
  const data = await pdf(fileBuffer);
  return data.text;
};

const parseDOCX = async (filePath: string): Promise<string> => {
  const buffer = fs.readFileSync(filePath);
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
};

const extractResumeInfo = (text: string): ParsedResume => {
  const result: ParsedResume = {
    name: extractName(text),
    email: extractEmail(text),
    phone: extractPhone(text),
    skills: extractSkills(text),
    education: extractEducation(text),
    experience: extractExperience(text),
    rawText: text,
  };

  return result;
};

const extractName = (text: string): string => {
  // Simple heuristic: first line or first few words
  const lines = text.split('\n').filter((l) => l.trim());
  return lines[0]?.substring(0, 100).trim() || 'Unknown';
};

const extractEmail = (text: string): string => {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const match = text.match(emailRegex);
  return match ? match[0] : '';
};

const extractPhone = (text: string): string => {
  const phoneRegex = /[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/;
  const match = text.match(phoneRegex);
  return match ? match[0] : '';
};

const extractSkills = (text: string): string[] => {
  const skillKeywords = [
    'JavaScript',
    'TypeScript',
    'React',
    'Node.js',
    'Express',
    'MongoDB',
    'SQL',
    'Python',
    'Java',
    'C++',
    'CSS',
    'HTML',
    'AWS',
    'Docker',
    'Kubernetes',
    'Git',
    'REST API',
    'GraphQL',
    'Django',
    'Flask',
    'Vue.js',
    'Angular',
    'Tailwind CSS',
    'PostgreSQL',
    'MySQL',
  ];

  const foundSkills: string[] = [];
  skillKeywords.forEach((skill) => {
    if (text.toLowerCase().includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });

  return foundSkills;
};

const extractEducation = (
  text: string
): Array<{ degree: string; field: string; institution: string }> => {
  // Simple extraction based on keywords
  const education: Array<{ degree: string; field: string; institution: string }> = [];
  const degreeKeywords = ['Bachelor', 'Master', 'PhD', 'Diploma', 'Associate'];

  degreeKeywords.forEach((degree) => {
    if (text.includes(degree)) {
      education.push({
        degree,
        field: 'Not specified',
        institution: 'Not specified',
      });
    }
  });

  return education;
};

const extractExperience = (
  text: string
): Array<{ title: string; company: string; duration: string }> => {
  // Simple extraction - looks for job title patterns
  const experience: Array<{ title: string; company: string; duration: string }> = [];
  const titleKeywords = [
    'Developer',
    'Engineer',
    'Manager',
    'Designer',
    'Analyst',
    'Consultant',
  ];

  titleKeywords.forEach((title) => {
    if (text.includes(title)) {
      experience.push({
        title,
        company: 'Not specified',
        duration: 'Not specified',
      });
    }
  });

  return experience;
};
