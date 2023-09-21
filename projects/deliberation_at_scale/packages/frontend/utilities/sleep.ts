/**
 * Async func that can be awaited to create intervals between events.
 * @param timeoutMs: number in ms to wait before returning promise
 * @returns Promise (void)
 */
export default function sleep(timeoutMs: number) {
    return new Promise((resolve) => setTimeout(resolve, timeoutMs));
}
