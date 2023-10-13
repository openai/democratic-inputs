import { motion, useAnimate } from "framer-motion"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/router"

export default function Instructions() {
  const [isStarted, setIsStarted] = useState(false)
  const [step, setStep] = useState(0)
  const [scope, animate] = useAnimate()
  const [scope2, animate2] = useAnimate()
  const { space_id } = useRouter().query

  const items = [
    {
      title: "Choose a topic",
      description:
        "\nYou'll find a list of grey-area topics that require AI to carefully respond.  Select a topic of interest, e.g. 'Sensitive Political Events'.",
      img: ["/images/blogs/howitworks/topic.png"],
    },
    {
      title: "Choose a guideline",
      description:
        "Users like yourself have suggested guidelines for AI to follow. These appear in Needs Your Help. Or, propose your own guideline -- express your thoughts, and AI helps you write it.",
      img: ["/images/blogs/howitworks/propose.png", "/images/blogs/howitworks/needs-your-help.png"],
    },
    {
      title: "Test the guideline",
      description:
        "Check that the now-Active Guideline is helpful. Talk to the AI, which is instructed to follow the guideline. We also show what a normal ChatGPT response would have been.",
      img: ["/images/blogs/howitworks/chat.png"],
    },
    {
      title: "Submit your review",
      description:
        "Once you've tested it enough, mark it as Helpful or Unhelpful. If it's your own proposed guideline, proudly hit propose to send it to others for review!",
      img: ["/images/blogs/howitworks/rate.png"],
    },
  ]

  const handleGetStarted = async () => {
    const offsetLeft = scope.current.offsetLeft as number

    await animate(scope.current, {
      opacity: 0,
      transition: {
        duration: 4,
      },
    })

    await animate(scope.current, {
      opacity: 0,
      x: -50,
      transition: {
        duration: 0,
      },
    })

    setIsStarted(true)

    await animate(scope.current, {
      opacity: 1,
      x: 0,
    })
  }

  const incrementStep = async (val: number) => {
    await animate2(scope2.current, {
      opacity: 0,
      x: val > 0 ? -50 : 50,
      transition: {
        duration: 0.4,
      },
    })

    await animate2(scope2.current, {
      opacity: 0,
      x: val > 0 ? 50 : -50,
      transition: {
        duration: 0,
      },
    })

    setStep(step + val)

    await animate2(scope2.current, {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
      },
    })
  }

  return (
    <div
      className={cn(
        "grid h-full w-full grid-cols-2 items-start gap-20 px-12 py-8 font-semibold",
        !isStarted && "flex w-full flex-col",
      )}
    >
      <motion.div
        ref={scope}
        className={cn("flex max-w-lg flex-col gap-6", !isStarted && "mx-auto flex-1")}
        id="instructions"
      >
        <h1 className="text-4xl font-bold">Walkthrough</h1>
        <p className="mt-2 font-normal text-muted-foreground">
          We&apos;re crafting <u>principled and practical</u> guidelines for AI to follow in grey-area topics. Your
          input is crucial. Your objective is to <u>test the model for weaknesses</u> in a topic like politics and{" "}
          <u>identify helpful guidelines</u> which fix it.
        </p>
        <p className="font-normal text-muted-foreground">
          Something not making sense? Reach us via our feedback page
          <Link className="ml-1 underline" href="/feedback">
            here
          </Link>
          .
        </p>
        <p className="mr-9 text-right font-normal text-muted-foreground">- The Aligned Team</p>
        {!isStarted && (
          <Button className="mx-auto mt-4 flex w-[250px] whitespace-nowrap" onClick={handleGetStarted}>
            Start the Walkthrough
          </Button>
        )}
      </motion.div>
      {isStarted && (
        <motion.div
          className="space-y-6"
          initial={{
            opacity: 0,
            x: 100,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          ref={scope2}
        >
          <h2 className="flex gap-2 text-lg font-semibold">
            <div className="inline-block flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-400 to-green-400 text-sm text-white">
              {step + 1}
            </div>
            {items[step].title}
          </h2>
          <p className="font-normal text-muted-foreground">{items[step].description}</p>
          {items[step].img.length === 1 ? (
            <img src={items[step].img[0]} alt="Choose topic" className="rounded-md shadow-md" />
          ) : items[step].img.length === 2 ? (
            <div className="flex h-min w-full pb-4">
              {items[step].img.map((img, ix) => (
                <motion.img
                  src={img}
                  key={img}
                  alt="Walkthrough image"
                  className="h-min h-min w-[50%] rounded-md object-contain shadow-md"
                  initial={{
                    rotate: ix === 0 ? -40 : 40,
                  }}
                  animate={{
                    rotate: ix === 0 ? -5 : 5,
                  }}
                  transition={{
                    duration: 0.2,
                    delay: 0.05,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          ) : null}
          <div className="mt-2 grid grid-cols-2 gap-4">
            <Button
              disabled={step === 0}
              variant={"secondary"}
              onClick={() => {
                if (step > 0) {
                  incrementStep(-1)
                }
              }}
            >
              Back
            </Button>
            {step < items.length - 1 ? (
              <Button
                onClick={() => {
                  if (step < items.length - 1) {
                    incrementStep(1)
                  }
                }}
              >
                Next
              </Button>
            ) : (
              <Link href={`/spaces/${space_id}`} className="w-full">
                <Button variant={"success"} className="w-full">
                  Done!
                </Button>
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
