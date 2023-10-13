import { motion, useAnimate } from "framer-motion"
import { useRef, useState } from "react"

import { ConstitutionDemographics } from "@/components/live/constitution-demographics"
import { ConstitutionOutline } from "@/components/live/constitution-outline"
import RadialClusterGraph, { ConstitutionTab } from "@/components/live/radial-cluster-graph"
import { Button } from "@/components/ui/button"
import QueryDataLoader from "@/components/ui/query-data-loader"
import { energizeEngine } from "@/lib/energize-engine"
import { DEFAULT_SPACE_ID } from "@/lib/spaces"
import { cn, sleep } from "@/lib/utils"
import Link from "next/link"

export default function LivePage() {
  const [scope, animate] = useAnimate()
  const [contentScope, contentAnimate] = useAnimate()
  const [headerScope, headerAnimate] = useAnimate()
  const [tab, setTab] = useState<ConstitutionTab>("live")

  const constitution = energizeEngine.guidelines.getLiveConstitution.useQuery({
    spaceId: DEFAULT_SPACE_ID,
  })

  const totalConsensusScore = constitution.data?.items.length
    ? Math.floor(
        (constitution.data?.items.reduce((acc, curr) => acc + curr.consensusScore, 0) /
          constitution.data?.items.length) *
          100,
      )
    : 0

  const sampleData = constitution.data?.embeddings.filter((v) => v !== undefined) ?? []

  const isSwitching = useRef(false)
  const handleTabSwitch = async (newTab: ConstitutionTab) => {
    if (isSwitching.current) {
      return
    }
    isSwitching.current = true

    const containerElem = scope.current as HTMLElement

    // get the difference in x position between the first child and the last child
    const firstChild = containerElem.children[0] as HTMLElement
    const lastChild = containerElem.children[containerElem.children.length - 1] as HTMLElement

    const firstChildRect = firstChild.getBoundingClientRect()
    const lastChildRect = lastChild.getBoundingClientRect()

    const firstChildX = firstChildRect.x
    const lastChildX = lastChildRect.x

    let animateDistance = lastChildX - firstChildX

    if (newTab === "demographics") {
      animateDistance -= 110
    } else {
      animateDistance += 40
    }

    await contentAnimate(
      contentScope.current,
      {
        opacity: 0,
      },
      {
        duration: 0,
      },
    )

    await Promise.all([
      animate(
        scope.current,
        {
          x: newTab === "live" ? animateDistance : -animateDistance,
        },
        {
          ease: "easeInOut",
          duration: 0.5,
        },
      ),
      headerAnimate(
        headerScope.current,
        {
          opacity: 0,
        },
        {
          ease: "easeInOut",
          duration: 0.5,
        },
      ),
    ])

    setTab(newTab)

    await sleep(10)

    await animate(
      scope.current,
      {
        x: 0,
      },
      {
        ease: "easeInOut",
        duration: 0,
      },
    )

    await contentAnimate(
      contentScope.current,
      {
        opacity: 1,
      },
      {
        duration: 0.5,
      },
    )

    isSwitching.current = false
  }

  const constitutionHeader = tab === "live" && (
    <motion.div
      className="flex flex-col gap-7 text-left"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      ref={headerScope}
    >
      <h1 className="text-2xl font-semibold md:text-3xl lg:text-5xl">The Constitution</h1>
      <p className="mt-2 block">
        Aligned is the community shaping the future of AI. Our participants span the globe and encompass a diverse range
        of perspectives. &nbsp;
        <Button variant={"link"} className="px-0">
          <Link href={window.location.origin + "/algo"} target="_blank">
            How it works &rarr;
          </Link>
        </Button>
      </p>
      <p>{constitution.data?.totalContributors ?? "..."} people have spoken.</p>
    </motion.div>
  )

  const demographicsHeader = tab === "demographics" && (
    <motion.div
      className="flex flex-col gap-7 text-left"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      ref={headerScope}
    >
      <h1 className="text-2xl font-semibold md:text-3xl lg:text-5xl">Demographics</h1>
      <p className="mt-2 block">Find demographic statistics of our participants below.</p>
    </motion.div>
  )

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <div
        ref={scope}
        className={cn(
          "flex flex-col items-center justify-between gap-20 py-8 lg:grid lg:grid-cols-2 lg:gap-0 lg:py-24",
        )}
      >
        {constitutionHeader}
        <QueryDataLoader queryResults={constitution} skeletonItems={0}>
          <QueryDataLoader.IsSuccess>
            <RadialClusterGraph
              data={sampleData}
              centerText={totalConsensusScore + "%"}
              currentTab={tab}
              switchTab={handleTabSwitch}
            />
          </QueryDataLoader.IsSuccess>
        </QueryDataLoader>
        {demographicsHeader}
      </div>
      <div ref={contentScope} className="mx-auto flex w-full flex-col gap-4">
        {tab === "live" ? <ConstitutionOutline /> : <ConstitutionDemographics />}
      </div>
    </div>
  )
}
