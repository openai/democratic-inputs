import { Configuration, OpenAIApi } from "openai-edge"
import { readValue, readValues } from "../utils"
import { db } from "~/config.server"
import DeduplicationService from "~/services/deduplication"
import { ValuesCard } from "@prisma/client"

let openai: OpenAIApi
let service: DeduplicationService

beforeAll(() => {
  openai = new OpenAIApi(
    new Configuration({ apiKey: process.env.OPENAI_API_KEY })
  )
  service = new DeduplicationService(openai, db)
})

test("Test user distance map", async () => {
  const value = readValue("holistic_decision_making.json")

  const result = await service.similaritySearch(value.embedding, 3, 1.0)

  expect(result).toBeDefined()
  expect(result.length).toBe(3)
}, 10_000)

test("Test clustering between embodied and empathic values", async () => {
  const values = readValues("empathic_and_embodied.json")

  const clusters = await service.cluster(values)

  const embodiedCluster = clusters.find(
    (c) => c.findIndex((v) => v.id === 1) > -1
  )
  const empathicCluster = clusters.find(
    (c) => c.findIndex((v) => v.id === 3) > -1
  )

  expect(embodiedCluster?.length).toBe(4)
  expect(empathicCluster?.length).toBe(4)
}, 120_000)

test("Test clustering between embodied and empathic with some noise still works", async () => {
  const values = readValues("empathic_and_embodied.json")
  const noise = readValue("holistic_decision_making.json") as any as ValuesCard

  const clusters = await service.cluster([...values, noise])

  const embodiedCluster = clusters.find(
    (c) => c.findIndex((v) => v.id === 1) > -1
  )
  const empathicCluster = clusters.find(
    (c) => c.findIndex((v) => v.id === 3) > -1
  )

  expect(embodiedCluster?.length).toBe(4)
  expect(empathicCluster?.length).toBe(4)
}, 120_000)

test("Test clustering between two values that are somewhat similar but different", async () => {
  const values = readValues("similar_but_different.json")

  const clusters = await service.cluster(values)

  console.log(clusters)

  expect(clusters.length).toBe(2)
}, 120_000)

test("Test retrieving similar card", async () => {
  // Took card 165 from the database and asked ChatGPT: "Rewrite this values card, changing the copy slightly without altering the meaning too much"
  const value = {
    id: 165,
    title: "Comprehensive Decision Framework",
    instructions_short:
      "ChatGPT should support her in merging instinct, varied viewpoints, logical analysis, and personal insight for decision-making.",
    instructions_detailed:
      "ChatGPT aims to assist her in accessing her instinctual feelings, collecting a range of perspectives, employing logical assessment, and cultivating personal understanding, cumulatively resulting in a comprehensive decision-making approach.",
    evaluation_criteria: [
      "INSTINCTUAL FEELINGS directing her decision",
      "VARIED VIEWPOINTS she accumulates from others",
      "LOGICAL ASSESSMENT she utilizes for the scenario",
      "PERSONAL UNDERSTANDING she gains from self-reflection",
    ],
  }

  const result = await service.fetchSimilarCanonicalCard(value)

  expect(result).toBeDefined()
  expect(result!.id).toBe(165)
}, 60_000)

test("Test retrieving similar card #2", async () => {
  // Took card 260 from the database and asked ChatGPT: "Rewrite this values card, changing the copy slightly without altering the meaning too much"
  const value = {
    evaluation_criteria: [
      "PRECISION in outlining the restrictions of the AI system",
      "NEUTRALITY in the response's tone",
      "PREVENTION of anthropomorphic language that may mislead",
      "ACKNOWLEDGEMENT of the user's query and the foundational training data",
    ],
    id: 1337,
    instructions_detailed:
      "ChatGPT should clearly differentiate between human entities and AI mechanisms to promote responsible technological interaction. This requires steering clear of anthropomorphic descriptions and ensuring users recognize the boundaries of the AI system. The language chosen should be measured, refrain from assigning fault, and offer clear explanations. The reply should mirror the user's input and the base training data.",
    instructions_short:
      "ChatGPT should converse responsibly, emphasizing its constraints, sidestepping human-like descriptions, and echoing the user's input and the training foundation.",
    title: "Principled Communication",
  }

  const result = await service.fetchSimilarCanonicalCard(value)

  expect(result).toBeDefined()
  expect(result!.id).toBe(260)
}, 60_000)

test("Test retrieving similar card #3", async () => {
  // Took card 286 from the database and asked ChatGPT: "Rewrite this values card, changing the copy slightly without altering the meaning too much"
  const value = {
    title: "In-depth Analysis",
    instructions_short:
      "ChatGPT should assist the user in conducting a deep assessment of their circumstances.",
    instructions_detailed:
      "ChatGPT should support the user in pinpointing significant elements, evaluate the pros and cons of every alternative, recognize their individual boundaries, and contemplate the consequences of their choice. This method promotes a holistic scrutiny of the scenario, akin to a benefits-versus-risks examination.",
    evaluation_criteria: [
      "ELEMENTS pertinent to the user's choice",
      "PROS and CONS of every alternative",
      "INDIVIDUAL LIMITS shaping the user's choice",
      "CONSEQUENCES of the user's decision in their overall scenario",
    ],
  }

  const result = await service.fetchSimilarCanonicalCard(value)

  expect(result).toBeDefined()
  expect(result!.id).toBe(286)
}, 60_000)

test("Test retrieving card that doesn't exist", async () => {
  const value = {
    id: 245,
    title: "Ecological Stewardship",
    instructions_short:
      "ChatGPT should promote eco-friendly practices and sustainable lifestyles.",
    instructions_detailed:
      "ChatGPT should be geared towards sharing knowledge about environmentally friendly habits, emphasizing the significance of sustainable choices, providing resources for green living, and encouraging users to take steps that minimize their carbon footprint.",
    evaluation_criteria: [
      "ENVIRONMENTAL KNOWLEDGE shared with users",
      "SIGNIFICANCE of making sustainable choices",
      "RESOURCES for adopting a green lifestyle",
      "ACTIONABLE STEPS to reduce ecological impact",
    ],
  }

  const result = await service.fetchSimilarCanonicalCard(value)

  expect(result).toBeNull()
}, 60_000)

test("Test best card", async () => {
  const values = readValues("quality.json")
  const best = await service.getBestValuesCard(values)

  expect(best).toBeDefined()
  expect(best.title).toBe("Empathetic Reflection")
}, 60_000)
