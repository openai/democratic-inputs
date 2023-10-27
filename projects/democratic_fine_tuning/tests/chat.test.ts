import { Configuration, OpenAIApi } from "openai-edge"
import config from "~/values-tools/articulator-configs/dft-default"
import { evaluateTranscript, readTranscript } from "./utils"

let openai: OpenAIApi

const model = "gpt-4-0613"

beforeAll(() => {
  openai = new OpenAIApi(
    new Configuration({ apiKey: process.env.OPENAI_API_KEY })
  )
})

test("No function call when insufficient information to articulate card", async () => {
  const response = await openai.createChatCompletion({
    model,
    messages: readTranscript("no_function_call.json"),
    temperature: 0.0,
    functions: config.prompts.main.functions,
  })

  const data = await response.json()
  const functionCall = data.choices[0].message.function_call

  expect(functionCall).toBe(undefined)
}, 10_000)

test("`articulate_values_card` called when sufficient information to articulate card", async () => {
  const response = await openai.createChatCompletion({
    model,
    messages: readTranscript("articulate_values_card_called.json"),
    temperature: 0.0,
    functions: config.prompts.main.functions,
  })

  const data = await response.json()
  const functionCall = data.choices[0].message.function_call

  expect(functionCall?.name).toBe("show_values_card")
}, 10_000)

test("After a long tangent, the assistant refers the user back to the original question", async () => {
  const messages = readTranscript("long_tangent.json")
  const response = await openai.createChatCompletion({
    model,
    messages,
    temperature: 0.0,
    functions: config.prompts.main.functions,
    function_call: "none",
  })

  const data = await response.json()
  const last = data.choices[0].message.content

  const refersBackToOriginalQuestion = await evaluateTranscript(
    "wether or not the assistant refers back to ChatGPT and the original question in the last message.",
    messages,
    last,
    openai
  )

  console.log(refersBackToOriginalQuestion)

  expect(refersBackToOriginalQuestion).toBe(true)
}, 30_000)
