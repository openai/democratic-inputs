import { format as formatTz, utcToZonedTime } from "date-fns-tz"
import { DownloadIcon } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { ResponsePreview } from "./response-preview"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { SmallSpinner } from "@/components/ui/small-spinner"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { energizeEngine } from "@/lib/energize-engine"
import { arrayToCSV, downloadCSV, sleep } from "@/lib/utils"
import { EnergizeEngineOutputs, TopicTree, TopicTreeBuildConfig } from "@energizeai/engine"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/router"

type FormValues = z.infer<typeof TopicTreeBuildConfig>

const defaultValues: Partial<FormValues> = {
  topic__space_id: true,
  topic__author_id: true,
  topic__created_at: true,
  topic__updated_at: true,
  topic__updated_by: true,
  topic__sparkline: true,
  guidelines: true,
  guideline__value_hash: false,
  guideline__author_id: true,
  guideline__created_at: true,
  guideline__updated_at: true,
  guideline__updated_by: true,
  ratings: true,
  rating__author_id: true,
  rating__created_at: true,
  rating__updated_at: true,
  rating__updated_by: true,
}

type Topic = Exclude<EnergizeEngineOutputs["topics"]["getTopicByName"], undefined>

export const ExportForm = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(TopicTreeBuildConfig),
    defaultValues: defaultValues,
  })
  const { space_id } = useRouter().query
  const [exportType, setExportType] = useState<"json" | "csv">("json")

  const { toast } = useToast()

  const getDownloadFileName = (extension: string, suffix?: string) => {
    const now = new Date()
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const zonedDate = utcToZonedTime(now, timeZone)
    const output = formatTz(zonedDate, "yyyy-MM-dd HH:mm:ssXXX", { timeZone })

    if (suffix) {
      return `energize-engine-export-${space_id}-${output}-${suffix}.${extension}`
    }

    return `energize-engine-export-${space_id}-${output}.${extension}`
  }

  const handleDownloadJson = (data: TopicTree) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = getDownloadFileName("json")
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const __downloadCsvHelper = (
    values: z.infer<typeof TopicTreeBuildConfig>,
    topics: Array<any>,
    guidelines: Array<any>,
    ratings: Array<any>,
    data: TopicTree,
    parentId: string | null,
  ) => {
    for (const k of Object.keys(data)) {
      const { guidelines: topicGuidelines, children, ...topic } = data[k]
      topics.push({
        ...topic,
        parentId,
        id: k,
      })

      if (values.guidelines && Object.keys(topicGuidelines ?? {}).length > 0) {
        for (const guidelineId of Object.keys(topicGuidelines ?? {})) {
          const { ratings: guidelineRatings, ...guideline } = (topicGuidelines ?? {})[guidelineId]
          guidelines.push({
            ...guideline,
            topicId: k,
            id: guidelineId,
          })

          if (values.ratings && Object.keys(guidelineRatings ?? {}).length > 0) {
            for (const ratingId of Object.keys(guidelineRatings ?? {})) {
              const { ...rating } = (guidelineRatings ?? {})[ratingId]
              ratings.push({
                ...rating,
                guidelineId: guidelineId,
                id: ratingId,
              })
            }
          }
        }
      }

      if (Object.keys(children).length > 0) {
        __downloadCsvHelper(values, topics, guidelines, ratings, data[k].children, k)
      }
    }
  }

  const handleDownloadCsv = async (values: z.infer<typeof TopicTreeBuildConfig>, data: TopicTree) => {
    const topics: Array<any> = []
    const guidelines: Array<any> = []
    const ratings: Array<any> = []

    __downloadCsvHelper(values, topics, guidelines, ratings, data, null)

    if (topics.length > 0) {
      const topicsCsv = arrayToCSV(topics)
      const filename = getDownloadFileName("csv", "topics")
      downloadCSV(topicsCsv, filename)
      await sleep(500)
    }

    if (values.guidelines && guidelines.length > 0) {
      const guidelinesCsv = arrayToCSV(guidelines)
      const filename = getDownloadFileName("csv", "guidelines")
      downloadCSV(guidelinesCsv, filename)
      await sleep(250)
    }

    if (values.ratings && ratings.length > 0) {
      const ratingsCsv = arrayToCSV(ratings)
      const filename = getDownloadFileName("csv", "ratings")
      downloadCSV(ratingsCsv, filename)
    }
  }

  const exportMutation = energizeEngine.exports.exportTopicTree.useMutation()
  function onSubmit(values: z.infer<typeof TopicTreeBuildConfig>) {
    exportMutation.mutate(
      {
        spaceId: space_id as string,
        config: values,
      },
      {
        onSuccess: (data) => {
          if (exportType === "json") {
            handleDownloadJson(data)
          } else {
            handleDownloadCsv(values, data)
          }
          toast({
            title: "Success!",
            description: "Your export has been generated and downloaded.",
            variant: "success",
          })
        },
        onError: (error) => {
          toast({
            title: "Error!",
            description: error.message,
            variant: "destructive",
          })
        },
      },
    )
  }

  return (
    <div className="grid h-full grid-cols-2 gap-10 overflow-y-hidden">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col gap-6 overflow-hidden">
          <div className="flex h-full flex-1 flex-col gap-8 overflow-hidden">
            <div className="flex-none space-y-4">
              <h3 className="text-lg font-medium">⚡ Energize Engine Export Tool</h3>
              <small className="text-muted-foreground">
                Export your data from Energize Engine. You can export your data at any time.
              </small>
              <Separator />
            </div>
            <div className="relative -mt-3 flex h-full flex-1 flex-col gap-8 overflow-y-auto">
              <div className="flex flex-col">
                <h3 className="mb-4 flex items-center gap-3 text-lg font-medium">
                  <div className="h-8 w-1 rounded-md bg-gradient-to-r from-blue-500 to-purple-500" />
                  Topic Data
                </h3>
                <div className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="topic__space_id"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Space ID</FormLabel>
                          <FormDescription>The ID of the space that the topic belongs to.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="topic__sparkline"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Sparkline</FormLabel>
                          <FormDescription>The sparkline of the topic.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="topic__author_id"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Author ID</FormLabel>
                          <FormDescription>The user ID of the author of the topic.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="topic__updated_by"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Updated By</FormLabel>
                          <FormDescription>The user ID of the last person to update the topic.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="topic__created_at"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Created At</FormLabel>
                          <FormDescription>The ISO date string of when the topic was created.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="topic__updated_at"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Updated At</FormLabel>
                          <FormDescription>The ISO date string of when the topic was last updated.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <h3 className="mb-4 flex items-center gap-3 text-lg font-medium">
                  <div className="h-8 w-1 rounded-md bg-gradient-to-r from-blue-500 to-purple-500" />
                  Guidelines Data
                </h3>
                <div className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="guidelines"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Include Guidelines</FormLabel>
                          <FormDescription>Whether or not to include the guidelines in the export.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="guideline__author_id"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Author ID</FormLabel>
                          <FormDescription>The user ID of the author of the guideline.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="guideline__updated_by"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Updated By</FormLabel>
                          <FormDescription>The user ID of the last person to update the guideline.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="guideline__created_at"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Created At</FormLabel>
                          <FormDescription>The ISO date string of when the guideline was created.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="guideline__updated_at"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Updated At</FormLabel>
                          <FormDescription>The ISO date string of when the guideline was last updated.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <h3 className="mb-4 flex items-center gap-3 text-lg font-medium">
                  <div className="h-8 w-1 rounded-md bg-gradient-to-r from-blue-500 to-purple-500" />
                  Ratings Data
                </h3>
                <div className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="ratings"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Include Ratings</FormLabel>
                          <FormDescription>Whether or not to include the ratings in the export.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rating__author_id"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Author ID</FormLabel>
                          <FormDescription>The user ID of the author of the rating.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rating__updated_by"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Updated By</FormLabel>
                          <FormDescription>The user ID of the last person to update the rating.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rating__created_at"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Created At</FormLabel>
                          <FormDescription>The ISO date string of when the rating was created.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rating__updated_at"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Updated At</FormLabel>
                          <FormDescription>The ISO date string of when the rating was last updated.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={exportMutation.isLoading}>
            Export Data
            {exportMutation.isLoading ? <SmallSpinner className="ml-2" /> : <DownloadIcon className="ml-2 h-4 w-4" />}
          </Button>
        </form>
      </Form>
      <ResponsePreview values={form.getValues()} exportType={exportType} setExportType={setExportType} />
    </div>
  )
}
