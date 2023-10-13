import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import QueryDataLoader from "@/components/ui/query-data-loader"
import { energizeEngine } from "@/lib/energize-engine"
import { DEFAULT_SPACE_ID } from "@/lib/spaces"
import { toTitleCase } from "@/lib/utils"
import { BarChart, DonutChart } from "@tremor/react"

export const ConstitutionDemographics = () => {
  const demographics = energizeEngine.prolific.getDemographicData.useQuery({
    spaceId: DEFAULT_SPACE_ID,
  })

  // bucket by age with 5 year buckets
  const ageBarChartData =
    demographics.data?.reduce(
      (acc, curr) => {
        const age = curr.age ?? 0

        if (age < 18) {
          return acc
        }

        const bucket = Math.floor(age / 5) * 5
        const bucketName = `${bucket}-${bucket + 4}`

        const existingBucket = acc.find((v) => v.name === bucketName)

        if (existingBucket) {
          existingBucket["Number of Participants"] += 1
        } else {
          const newBucket = {
            name: bucketName,
            startingAge: bucket,
            ["Number of Participants"]: 1,
          }

          // insert in sorted order
          const index = acc.findIndex((v) => v.startingAge > bucket)
          if (index === -1) {
            acc.push(newBucket)
          } else {
            acc.splice(index, 0, newBucket)
          }
        }

        return acc
      },
      [] as {
        name: string
        startingAge: number
        ["Number of Participants"]: number
      }[],
    ) ?? []

  type DemoDataItem = typeof demographics.data extends (infer Item)[] | undefined ? Item : never
  const donutDataKeys = [
    {
      key: "sex",
      title: "Sex",
      description: "The sex of participants in the Aligned community.",
    },
    {
      key: "countryOfResidence",
      title: "Country of Residence",
      description: "The country of residence of participants in the Aligned community.",
    },
    {
      key: "employmentStatus",
      title: "Employment Status",
      description: "The employment status of participants in the Aligned community.",
    },
    {
      key: "ethnicitySpecified",
      title: "Ethnicity",
      description: "The ethnicity of participants in the Aligned community.",
    },
    {
      key: "nationality",
      title: "Nationality",
      description: "The nationality of participants in the Aligned community.",
    },
    {
      key: "studentStatus",
      title: "Student Status",
      description: "The student status of participants in the Aligned community.",
    },
    {
      key: "language",
      title: "Language",
      description: "The language of participants in the Aligned community.",
    },
    {
      key: "countryOfBirth",
      title: "Country of Birth",
      description: "The country of birth of participants in the Aligned community.",
    },
  ] as {
    key: keyof DemoDataItem
    title: string
    description: string
  }[]

  const donutData: {
    items: {
      name: string
      ["Number of Participants"]: number
    }[]
    title: string
    description: string
  }[] = []

  for (const donutDataKey of donutDataKeys) {
    const items =
      demographics.data?.reduce(
        (acc, curr) => {
          let bucketName = (curr[donutDataKey.key] as string) ?? "NA"
          bucketName = toTitleCase(bucketName)

          const existingBucket = acc.find((v) => v.name === bucketName)

          if (existingBucket) {
            existingBucket["Number of Participants"] += 1
          } else {
            acc.push({
              name: bucketName,
              ["Number of Participants"]: 1,
            })
          }

          return acc
        },
        [] as {
          name: string
          ["Number of Participants"]: number
        }[],
      ) ?? []

    donutData.push({
      items,
      title: donutDataKey.title,
      description: donutDataKey.description,
    })
  }

  const ageChart = (
    <Card>
      <CardHeader>
        <CardTitle>Age</CardTitle>
        <CardDescription>The age of participants in the Aligned community.</CardDescription>
      </CardHeader>
      <CardContent>
        <BarChart
          data={ageBarChartData}
          index="name"
          categories={["Number of Participants"]}
          colors={["blue"]}
          yAxisWidth={48}
        />
      </CardContent>
    </Card>
  )

  const donutCharts = donutData.map((donutDataItem) => (
    <Card key={donutDataItem.title}>
      <CardHeader>
        <CardTitle>{donutDataItem.title}</CardTitle>
        <CardDescription>{donutDataItem.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <DonutChart
          data={donutDataItem.items}
          index="name"
          category="Number of Participants"
          className="h-64"
          label={`${donutDataItem.items.length}`}
        />
      </CardContent>
    </Card>
  ))

  return (
    <QueryDataLoader queryResults={demographics}>
      <QueryDataLoader.IsSuccess>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">{donutCharts}</div>
        {ageChart}
      </QueryDataLoader.IsSuccess>
    </QueryDataLoader>
  )
}
