import { Message } from "ai"
import { removeLastMatchAndPrecedingFunctions } from "~/routes/api.messages.$chatId.delete"

describe("removeLastUserAndPrecedingFunctions", () => {
  it("removes last user message and preceding functions", () => {
    const messages: Message[] = [
      { id: "1", role: "user", content: "hi" },
      { id: "2", role: "function", content: "loading" },
      { id: "3", role: "assistant", content: "hello" },
      { id: "4", role: "user", content: "bye" },
      { id: "5", role: "function", content: "logging" },
    ]
    const predicate = (message: Message) => message.content === "bye"
    const result = removeLastMatchAndPrecedingFunctions(messages, predicate)
    expect(result).toEqual([
      { id: "1", role: "user", content: "hi" },
      { id: "2", role: "function", content: "loading" },
      { id: "3", role: "assistant", content: "hello" },
      { id: "5", role: "function", content: "logging" },
    ])
  })

  it("removes last user message and preceding functions, but not system message", () => {
    const messages: Message[] = [
      { id: "1", role: "system", content: "foo" },
      { id: "2", role: "function", content: "loading" },
      { id: "3", role: "assistant", content: "hello" },
    ]
    const predicate = (message: Message) => message.content === "hello"
    const result = removeLastMatchAndPrecedingFunctions(messages, predicate)
    expect(result).toEqual([{ id: "1", role: "system", content: "foo" }])
  })

  it("removes last user message and all preceding functions", () => {
    const messages: Message[] = [
      { id: "1", role: "user", content: "hi" },
      { id: "2", role: "function", content: "loading" },
      { id: "3", role: "function", content: "loading again" },
      { id: "4", role: "user", content: "bye" },
      { id: "5", role: "function", content: "logging" },
    ]
    const predicate = (message: Message) => message.content === "bye"
    const result = removeLastMatchAndPrecedingFunctions(messages, predicate)
    expect(result).toEqual([
      { id: "1", role: "user", content: "hi" },
      { id: "5", role: "function", content: "logging" },
    ])
  })

  it("removes last user message and all preceding functions, including assistant function calls", () => {
    const messages: Message[] = [
      { id: "1", role: "user", content: "hi" },
      { id: "2", role: "assistant", content: "null", function_call: "foo" },
      { id: "3", role: "function", content: "loading again" },
      { id: "4", role: "user", content: "bye" },
      { id: "5", role: "function", content: "logging" },
    ]
    const predicate = (message: Message) => message.content === "bye"
    const result = removeLastMatchAndPrecedingFunctions(messages, predicate)
    expect(result).toEqual([
      { id: "1", role: "user", content: "hi" },
      { id: "5", role: "function", content: "logging" },
    ])
  })

  it("removes nothing if no match found", () => {
    const messages: Message[] = [
      { id: "seed", role: "system", content: "foo" },
      { id: "1", role: "user", content: "hi" },
      { id: "2", role: "function", content: "loading" },
      { id: "3", role: "assistant", content: "hello" },
    ]
    const predicate = (message: Message) => message.content === "bye"
    const result = removeLastMatchAndPrecedingFunctions(messages, predicate)
    expect(result).toEqual(messages)
  })

  it("handles an empty array", () => {
    const messages: Message[] = []
    const predicate = (message: Message) => message.content === "bye"
    const result = removeLastMatchAndPrecedingFunctions(messages, predicate)
    expect(result).toEqual([])
  })
})
