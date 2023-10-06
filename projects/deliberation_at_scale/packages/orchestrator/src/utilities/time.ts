export async function waitFor(timeoutMs: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeoutMs);
    });
}
