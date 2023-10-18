import { Configuration, OpenAIApi } from "openai-edge"
import { ArticulatorService } from "~/services/articulator"
import { PrismaClient } from "@prisma/client"
import { mockDeep } from "jest-mock-extended"
import DeduplicationService from "~/services/deduplication"
import { embeddingService } from "~/values-tools/embedding"
import { readTranscriptRaw, readTranscript } from "../utils"

let articulator: ArticulatorService
let openai: OpenAIApi

beforeAll(() => {
  openai = new OpenAIApi(
    new Configuration({ apiKey: process.env.OPENAI_API_KEY })
  )

  articulator = new ArticulatorService(
    "default",
    mockDeep<DeduplicationService>(),
    openai,
    mockDeep<PrismaClient>()
  )

  console.log("Heya")
})

test("Test not referring to 'her' in articulator fails with old prompt", async () => {
  const messages = readTranscriptRaw("her.json")

  const result = await articulator.articulateValuesCard(messages, null)

  expect(
    result.values_card.instructions_short.toLowerCase().includes("her")
  ).toBe(false)
  expect(
    result.values_card.instructions_short.toLowerCase().includes("the girl")
  ).toBe(false)
}, 60_000)
