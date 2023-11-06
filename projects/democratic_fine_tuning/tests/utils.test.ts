import { calculateAverageEmbedding, splitToPairs } from "~/utils"

test("Test averaging over embedding vectors", () => {
  const embeddings = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
  ]

  const averageEmbedding = calculateAverageEmbedding(embeddings)
  expect(averageEmbedding).toEqual([3, 4, 5, 6])
})

test("Test averaging over embedding vectors fails if different dims", () => {
  const embeddings = [
    [1, 2, 3, 4],
    [5, 6, 7, 8, 9],
  ]
  const call = () => calculateAverageEmbedding(embeddings)
  expect(call).toThrowError()
})

test("Test split into pairs", () => {
  const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  const result = splitToPairs(array)
  expect(result).toEqual([
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [9, 10],
  ])
})

test("Test split into pairs of insufficient length", () => {
  const array = [1, 2, 3]
  const result = splitToPairs(array)
  for (const pair of result) {
    expect(pair.length).toBe(2)
  }
})
