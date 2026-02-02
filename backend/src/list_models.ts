import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';
import fs from 'fs';

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    let logOutput = '';

    const log = (msg: string) => {
        console.log(msg);
        logOutput += msg + '\n';
    };

    try {
        log('Using API Key: ' + (process.env.GEMINI_API_KEY ? 'Present' : 'Missing'));

        const modelNames = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-1.0-pro'];

        for (const name of modelNames) {
            try {
                log(`Testing: ${name}`);
                const model = genAI.getGenerativeModel({ model: name });
                const result = await model.generateContent('Hello');
                log(`✓ SUCCESS: ${name} works.`);
            } catch (e: any) {
                log(`✗ FAILED: ${name}. Error: ${e.message}`);
            }
        }

    } catch (error: any) {
        log('Global Error: ' + error.message);
    } finally {
        fs.writeFileSync('models_log.txt', logOutput);
    }
}

listModels();
