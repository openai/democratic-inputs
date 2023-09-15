/**
 * Async func that can be awaited to create intervals between events.
 * @param timeout: number in ms to wait before returning promise
 * @returns Promise (void)
 */
export default function sleep(timeout: number){
    return new Promise((resolve) => setTimeout(resolve, timeout));
}