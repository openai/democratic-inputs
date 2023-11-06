import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"

import { isNullish } from "./utils"
import { useRouter } from "next/router"

type SerializeFn<T> = (value: T) => string
type DeserializeFn<T> = (value: string) => T

type UseQueryOptions<T> = {
  defaultValue: T
  pushStateInHistory?: boolean
  serialize?: SerializeFn<T>
  deserialize?: DeserializeFn<T>
}

export default function useQueryState<T>(
  param: string,
  {
    defaultValue,
    pushStateInHistory = false,
    serialize = (x: T) => (isNullish(x) ? "" : String(x)),
    deserialize = (x: string) => x as unknown as T,
  }: UseQueryOptions<T>,
): [T, Dispatch<SetStateAction<T>>] {
  const router = useRouter()
  const [value, setValue] = useState<T>(() => {
    const initial = router.query[param]
    return !isNullish(initial) ? deserialize(initial as string) : defaultValue
  })
  const valueRef = useRef(value)

  useEffect(() => {
    valueRef.current = value
  }, [value])

  useEffect(() => {
    if (router.query[param]) {
      setValue(deserialize(router.query[param] as string))
    } else if (defaultValue !== undefined) {
      setValue(defaultValue)
    }
  }, [router.query[param]])

  useEffect(() => {
    let args = {}
    if (isNullish(value) && router.query[param]) {
      const { [param]: removed, ...rest } = router.query
      args = {
        pathname: router.pathname,
        query: rest,
      }
    } else if (!isNullish(value) && router.query[param] !== serialize(value)) {
      args = {
        pathname: router.pathname,
        query: { ...router.query, [param]: serialize(value) },
      }
    }

    if (Object.keys(args).length === 0) {
      return
    }

    if (pushStateInHistory) {
      router.push(args, undefined, { shallow: true })
    } else {
      router.replace(args, undefined, { shallow: true })
    }
  }, [value])

  return [value, setValue]
}
