export function parseValidSnapshotProposalUrl(url: string): string | undefined {
  // Valid match URLs like `https://snapshot.org/#/aave.eth/proposal/0x34a735f4cbb0c91febe9e26a974811737b656fde16c82310073a821d3a654304`,
  // where (ignore case):
  // 1. `aave.eth` or `uniswap` is the space name
  // 2. `0x34a735f4cbb0c91febe9e26a974811737b656fde16c82310073a821d3a654304` is the proposal ID, a 64-character hex string (EVM address)
  const regex = new RegExp(
    /https:\/\/snapshot\.org\/#\/.+\/proposal\/0x[a-f0-9]{40}/i,
  )
  return regex.test(url) ? url.split('/').slice(-1)[0] : undefined
}

export function truncateIfAddressOrLong(
  str: string,
  maxLen: number = 20,
): string {
  const isAddress = /0x[a-f0-9]{40}/i.test(str) // no checksum check
  return isAddress ? `${str.slice(0, 8)}...${str.slice(-6)}` : str.slice(0, 20)
}

/**
 * Returns timestamp as a string in the format `yyyy-MM-dd`.
 * @param timestamp
 * @returns
 */
export function timestampToDateString(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10)
}

/**
 * Returns timestamp as a string in the format `yyyy-MM-dd HH:mm`.
 * @param timestamp
 * @returns
 */
export function timestampToDateHourString(timestamp: number): string {
  const pd = (nr: number) => `${nr}`.padStart(2, '0') // pad to double digit (with 0)
  const front = timestampToDateString(timestamp)
  const dt = new Date(timestamp)
  return `${front} ${pd(dt.getHours())}:${pd(dt.getMinutes())}`
}

export function timestampToChatDateString(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: undefined,
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: undefined,
  })
}

export function numToCompactString(num: number): string {
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num)
}

export function numToPercString(num: number): string {
  return Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: 2,
  }).format(num)
}

export function clampNum(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max)
}

export function parseQuorumReadable(
  quorum: number,
  votes: number,
): [string, string] {
  if (votes >= quorum) return ['Exceeded', '']
  const currPerc = (votes / quorum) * 100
  return [
    `Need ${numToCompactString(quorum - votes)} more`,
    `${currPerc.toFixed(2)}%`,
  ]
}

// Binary-search-like to find the nearest index of value in sorted array
export function findNearestIndexOfValue(arr: number[], target: number): number {
  let left = 0
  let right = arr.length - 1

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)

    if (arr[mid] === target) return mid
    else if (arr[mid] < target) left = mid + 1
    else right = mid - 1
  }

  // With two adjacent values for the target, return the element that is the nearest to the target
  return Math.abs(arr[left] - target) < Math.abs(arr[right] - target)
    ? left
    : right
}

export function capitalizeFirstLetters(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
