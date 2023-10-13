import { ApexOptions } from "apexcharts"
import { useTheme } from "next-themes"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card"
import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs"
import dynamic from "next/dynamic"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

export const ReportsWidget = () => {
  const theme = useTheme()

  let options = {
    series: [
      {
        name: "Subjective (Strong Consensus)",
        data: [400, 300, 500, 450], // Actual data for Python, Databases, Algorithms, Debugging
      },
      {
        name: "Subjective (Moderate Consensus)",
        data: [300, 400, 460, 230], // Actual data for Python, Databases, Algorithms, Debugging
      },
      {
        name: "Subjective (Lacking Consensus)",
        data: [200, 100, 260, 430], // Actual data for Python, Databases, Algorithms, Debugging
      },
      {
        name: "Objective Issue",
        data: [500, 350, 420, 500], // Actual data for Python, Databases, Algorithms, Debugging
      },
    ],
    chart: {
      type: "bar", // Important to specify the "line" here for combined chart
      background: "var(--bg)",
      stacked: true,
    },
    theme: {
      mode: theme.theme === "dark" ? "dark" : "light",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        stacked: true,
        borderRadius: 6,
      },
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      show: false,
    },
    xaxis: {
      categories: ["Politics", "Self-Harm", "Extremism", "Erotica"],
    },
  } as ApexOptions

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex w-full items-start justify-between">
          <div>
            Feedback Engine Report <span className="ml-2">📊</span>
            <CardDescription className="mt-4">Analyze your model&apos;s feedback over time.</CardDescription>
          </div>
          <Tabs defaultValue="12hr">
            <TabsList>
              <TabsTrigger value="12hr">12h</TabsTrigger>
              <TabsTrigger value="24hr">24h</TabsTrigger>
              <TabsTrigger value="3d">3d</TabsTrigger>
              <TabsTrigger value="7d">7d</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-5 mt-3">
          {typeof window !== "undefined" && <Chart type="bar" width="100%" series={options.series} options={options} />}
        </div>
      </CardContent>
    </Card>
  )
}
