require('dotenv').config();
import OpenAI from 'openai';

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            OPENAI_API_KEY: string;
        }
    }
}

// GUARD: Double-check that OPENAI_API_KEY are part of the environment
if (!('OPENAI_API_KEY' in process.env)) {
    throw new Error('Missing OPENAI_API_KEY environment variable. Please add it to your environment or .env file');
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default openai;