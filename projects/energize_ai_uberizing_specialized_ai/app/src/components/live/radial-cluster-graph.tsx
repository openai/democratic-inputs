import { motion } from "framer-motion"
import React, { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export type ConstitutionTab = "live" | "demographics"

interface RadialClusterGraphProps {
  data: number[]
  centerText: string
  currentTab: ConstitutionTab
  switchTab: (newTab: ConstitutionTab) => void
}

const mapToDegrees = (numbers: number[]): number[] => {
  const max = Math.max(...numbers)
  const min = Math.min(...numbers)
  const range = max - min

  if (range === 0) {
    return numbers.map(() => 0)
  }

  return numbers.map((number) => {
    return ((number - min) / range) * 360
  })
}

const randomOffset = () => Math.random() * 10 - 10

const RadialClusterGraph: React.FC<RadialClusterGraphProps> = ({ data, centerText, switchTab, currentTab }) => {
  const [degreeBuckets, setDegreeBuckets] = useState<{ [degree: number]: number }>({})

  useEffect(() => {
    const degrees = mapToDegrees(data)
    const buckets: { [degree: number]: number } = {}

    degrees.forEach((degree) => {
      if (!degree) return
      const roundedDegree = Math.round(degree / 10) * 10
      if (!buckets[roundedDegree]) {
        buckets[roundedDegree] = 0
      }
      buckets[roundedDegree]++
    })

    setDegreeBuckets(buckets)
  }, [data])

  return (
    <div className="relative mx-auto flex h-[200px] w-[200px] items-center justify-center lg:h-[300px] lg:w-[300px]">
      {Object.keys(degreeBuckets)
        .reverse()
        .map((degreeStr, ix) => {
          const degree = parseInt(degreeStr, 10)
          const count = degreeBuckets[degree]
          return Array.from({ length: count }).map((_, i) => {
            // 0 deg should be top middle
            // 90 deg should be right middle
            // 180 deg should be bottom middle
            // 270 deg should be left middle
            // 360 deg should be top middle
            const x = 50 * (1 + Math.sin((degree * Math.PI) / 180))
            const y = 50 * (1 + Math.cos((degree * Math.PI) / 180))

            return (
              <motion.div
                key={`${degree}-${i}`}
                initial={{ opacity: 0, scale: 0, x: randomOffset(), y: randomOffset() }}
                animate={{ opacity: 1, scale: 1, x: randomOffset(), y: randomOffset() }}
                transition={{ duration: 0.5, delay: i * 0.1 + ix * 0.02 }}
                className="absolute h-2 w-2 rounded-full bg-blue-500"
                style={{ left: `${x}%`, top: `${y}%` }}
              ></motion.div>
            )
          })
        })}
      <div className="flex w-full flex-col text-center font-outfit text-2xl font-semibold">
        {centerText}
        <Button
          variant={"link"}
          className="-mt-2 px-0 text-sm"
          onClick={() => switchTab(currentTab === "live" ? "demographics" : "live")}
        >
          {currentTab === "live" ? "demographics " : "constitution "}
          &rsaquo;
        </Button>
      </div>
    </div>
  )
}

export default RadialClusterGraph
