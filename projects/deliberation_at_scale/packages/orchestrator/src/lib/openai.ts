import { OpenAI } from "openai";
import { OPENAI_API_KEY } from "src/contants";

const openaiClient = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

export default openaiClient;
