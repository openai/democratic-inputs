import { CheckCircle, ChevronsLeft } from "lucide-react"
import { useState } from "react"

import { ConstitutionOutline } from "../live/constitution-outline"
import { Label } from "../ui/label"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Separator } from "../ui/separator"
import { SmallSpinner } from "../ui/small-spinner"
import { useToast } from "../ui/use-toast"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { energizeEngine } from "@/lib/energize-engine"
import { cn } from "@/lib/utils"
import { useRouter } from "next/router"

const NUM_SCORE_OPTIONS = 5

type ScoreProps = {
  id: string
  value: number
  label: string
  onChange: (value: number) => void
}

const ScoreRadioGroup = ({ label, id, value, onChange }: ScoreProps) => {
  return (
    <>
      <p className="font-medium">{label}</p>
      <RadioGroup
        className="mx-auto my-2 flex w-full flex-row items-center justify-between gap-6"
        onValueChange={(value) => onChange(parseInt(value))}
        value={value.toString()}
      >
        <small className="w-24 text-xs text-muted-foreground">Strongly disagree</small>
        {Array.from({ length: NUM_SCORE_OPTIONS }).map((_, i) => {
          const score = i + 1
          return (
            <div className="flex flex-col items-center justify-between space-y-2" key={id + score}>
              <Label htmlFor={id + score}>{score}</Label>
              <RadioGroupItem value={score.toString()} id={id + score} />
            </div>
          )
        })}
        <small className="w-24 text-right text-xs text-muted-foreground">Agree</small>
      </RadioGroup>
    </>
  )
}

type Props = {
  code: string
}

export function ProlificCompletionDialog({ code }: Props) {
  const { space_id } = useRouter().query
  const [open, setOpen] = useState(false)

  const { toast } = useToast()

  const updateSurveryMutation = energizeEngine.users.setSurveyScores.useMutation()

  // enjoyment, trust, contribution, support
  const [enjoymentScore, setEnjoymentScore] = useState<number | undefined>(undefined)
  const [trustScore, setTrustScore] = useState<number | undefined>(undefined)
  const [contributionScore, setContributionScore] = useState<number | undefined>(undefined)
  const [supportScore, setSupportScore] = useState<number | undefined>(undefined)

  const [dialogStep, setDialogStep] = useState<"survey" | "constitution" | "completion">("survey")

  const handleComplete = async () => {
    const getNormalizedScore = (score: number | undefined) => {
      if (score === undefined) {
        return 0
      }
      return (score - 1) / (NUM_SCORE_OPTIONS - 1)
    }

    updateSurveryMutation.mutate(
      {
        enjoymentScore: getNormalizedScore(enjoymentScore),
        trustScore: getNormalizedScore(trustScore),
        contributionScore: getNormalizedScore(contributionScore),
        supportScore: getNormalizedScore(supportScore),
        spaceId: space_id as string,
      },
      {
        onSuccess: () => {
          // open the base url in a new tab
          const baseUrl = new URL("https://app.prolific.co/submissions/complete")
          baseUrl.searchParams.set("cc", code ?? "")
          window.open(baseUrl.toString(), "_blank")

          setOpen(false)
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          })
        },
      },
    )
  }

  const survey = (
    <div className="flex flex-col gap-6">
      <ScoreRadioGroup
        id="enjoyment"
        label="My experience on Aligned was enjoyable or meaningful."
        value={enjoymentScore ?? 0}
        onChange={(value) => setEnjoymentScore(value)}
      />
      <Separator />
      <ScoreRadioGroup
        id="trust"
        label="I would trust Aligned to make a representative constitution for AI."
        value={trustScore ?? 0}
        onChange={(value) => setTrustScore(value)}
      />
      <Separator />
      <ScoreRadioGroup
        label="My contributions (of rating guidelines previously on Aligned) will be used appropriately to create a representative constitution for Al."
        id="contribution"
        value={contributionScore ?? 0}
        onChange={(value) => setContributionScore(value)}
      />
      <Button
        className="w-full"
        disabled={enjoymentScore == undefined || trustScore === undefined || contributionScore === undefined}
        onClick={() => {
          setDialogStep("constitution")
        }}
      >
        Next
      </Button>
    </div>
  )

  const constitution = (
    <>
      <div className="max-h-[50vh] overflow-y-auto">
        <ConstitutionOutline showStart={false} spaceId={space_id as string} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant={"destructive"}
          onClick={() => {
            setSupportScore(1)
            setDialogStep("completion")
          }}
        >
          No
        </Button>
        <Button
          onClick={() => {
            setSupportScore(NUM_SCORE_OPTIONS)
            setDialogStep("completion")
          }}
        >
          Yes
        </Button>
      </div>
      <Button
        variant={"ghost"}
        onClick={() => {
          setDialogStep("survey")
        }}
        className="mx-auto py-1 text-muted-foreground"
      >
        <ChevronsLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
    </>
  )

  const completion = (
    <>
      <Button
        variant={"success"}
        className="w-full"
        onClick={handleComplete}
        disabled={updateSurveryMutation.isLoading}
      >
        {updateSurveryMutation.isLoading ? (
          <SmallSpinner className="mr-2 h-4 w-4" />
        ) : (
          <CheckCircle className="mr-2 h-4 w-4" />
        )}
        Complete study
      </Button>
    </>
  )

  const dialogBody = dialogStep === "survey" ? survey : dialogStep === "constitution" ? constitution : completion

  const dialogDescription =
    dialogStep === "survey"
      ? "Please answer the following questions about your experience."
      : dialogStep === "constitution"
      ? "Please read the current constitution and state your support."
      : "You are all done! Please click the button below to submit your completion code to Prolific."

  const dialogTitle =
    dialogStep === "survey"
      ? "Survey"
      : dialogStep === "constitution"
      ? "Would you say that overall you support this constitution?"
      : "Woohoo 🎉"

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setDialogStep("survey")
        setOpen(v)
      }}
    >
      <DialogTrigger asChild>
        <Button variant={"success"}>
          <CheckCircle className="mr-2 h-4 w-4" />
          Click here to finish
        </Button>
      </DialogTrigger>
      <DialogContent className={cn(dialogStep !== "completion" && "lg:min-w-[700px]")}>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        {dialogBody}
      </DialogContent>
    </Dialog>
  )
}
