import { ChatCompletionRequestMessage, OpenAIApi } from "openai-edge"
import config from "~/values-tools/articulator-configs/dft-default"
import { defaultSeedQuestion } from "~/lib/case"
import { capitalize } from "~/utils"
import fs from "fs"
import path from "path"
import { CanonicalValuesCard, ValuesCard } from "@prisma/client"

/**
 * Utility function for evaluating the last message sent by the assistant based on some high-level criteria.
 * For example: "Did the assisatnt refer back to the original question?"
 *
 * Example usage:
 *
 * ```ts
 * const messages: ChatCompletionRequestMessage[] = [
 *  ...
 * ]
 * const lastMessage = "How does this relate to ChatGPT?"
 * const evaluation = "Wether or not the last message relates back to ChatGPT"
 *
 * // Returns `true` or `false` wrt `evaluation`
 * // (in this case `true` as the `lastMessage` passes the `evaluation`)
 * evaluateTranscript(messages, lastMessage, evaluation)
 * ```
 */
export async function evaluateTranscript(
  evaluation: string,
  messages: ChatCompletionRequestMessage[],
  lastMessage: string,
  openai: OpenAIApi
): Promise<boolean> {
  let transcript = messages
    .filter((m) => m.role === "assistant" || m.role === "user")
    .map((m) => `${capitalize(m.role)}: ${m.content}`)
    .join("\n")

  transcript += "\n" + capitalize("assistant") + ": " + lastMessage

  const evaluationResponse = await openai.createChatCompletion({
    model: "gpt-4-0613",
    messages: [
      {
        role: "system",
        content: "Evaluate " + evaluation,
      },
      { role: "user", content: transcript },
    ],
    function_call: {
      name: "submit_evaluation",
    },
    functions: [
      {
        name: "submit_evaluation",
        description: "Submit an evaluation of " + evaluation,
        parameters: {
          type: "object",
          properties: {
            passes_evaluation: {
              type: "boolean",
              description: evaluation,
            },
          },
        },
      },
    ],
  })

  const evaluationData = await evaluationResponse.json()
  const params = JSON.parse(
    evaluationData.choices[0].message.function_call.arguments
  )

  return params.passes_evaluation as boolean
}

export function readTranscriptRaw(
  fileName: string
): ChatCompletionRequestMessage[] {
  const filePath = path.resolve(__dirname, `transcripts/${fileName}`)
  const rawData = fs.readFileSync(filePath, "utf-8")
  return JSON.parse(rawData) as any as ChatCompletionRequestMessage[]
}

export function readTranscript(
  fileName: string
): ChatCompletionRequestMessage[] {
  const filePath = path.resolve(__dirname, `transcripts/${fileName}`)
  const rawData = fs.readFileSync(filePath, "utf-8")

  const messages = JSON.parse(rawData) as any as ChatCompletionRequestMessage[]

  return [
    { role: "system", content: config.prompts.main.prompt },
    { role: "assistant", content: defaultSeedQuestion },
    ...messages,
  ] as ChatCompletionRequestMessage[]
}

export function readValue(
  fileName: string
): CanonicalValuesCard & { embedding: number[] } {
  const filePath = path.resolve(__dirname, `values/${fileName}`)
  const rawData = fs.readFileSync(filePath, "utf-8")
  return JSON.parse(rawData) as any as CanonicalValuesCard & {
    embedding: number[]
  }
}

export function readValues(fileName: string): ValuesCard[] {
  const filePath = path.resolve(__dirname, `values/${fileName}`)
  const rawData = fs.readFileSync(filePath, "utf-8")
  return JSON.parse(rawData) as any as ValuesCard[]
}
