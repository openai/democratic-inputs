import { Box, SxProps } from '@mui/material'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartDataset,
  DefaultDataPoint,
  ChartOptions,
  TimeScale,
} from 'chart.js'
import { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'

import { SnapshotProposal, SnapshotProposalVote } from '@/types'
import {
  findNearestIndexOfValue,
  numToCompactString,
  timestampToDateHourString,
} from '@/utils/misc'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Title,
  Tooltip,
  Legend,
)

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index',
  },
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
        borderRadius: 0,
        boxHeight: 6,
        boxWidth: 6,
      },
    },
    title: {
      display: true,
      text: 'Votes',
    },
    tooltip: {
      callbacks: {
        title: function (tooltipItems) {
          const yLabel = tooltipItems[0].label
          return timestampToDateHourString(Number(yLabel || 0)).slice(5) // Remove year
        },
        label: function (tooltipItem) {
          return ' ' + numToCompactString((tooltipItem.raw as number) || 0)
        },
        footer: function (tooltipItems) {
          let sum = 0
          tooltipItems.forEach(function (tooltipItem) {
            sum += tooltipItem.parsed.y
          })
          return 'Sum: ' + numToCompactString(sum)
        },
      },
    },
  },
  scales: {
    x: {
      // type: 'time',
      ticks: {
        display: true,
        autoSkip: false,
        // Note: Fetching the actual label data requires `getLabelForValue`.
        //       Need to use function expression to access `this`.
        callback: function (_, index) {
          const label = this.getLabelForValue(index)
          return timestampToDateHourString(Number(label)).slice(5) // Remove year
        },
      },
    },
    y: {
      ticks: {
        display: true,
        autoSkip: false,
        callback: function (value, index) {
          return numToCompactString(Number(value))
        },
      },
    },
  },
}

const LABEL_LENGTH = 10

const LINE_COLORS = [
  // {
  //   borderColor: 'rgb(53, 162, 235)',
  //   backgroundColor: 'rgba(53, 162, 235, 0.5)',
  // },
  {
    borderColor: 'rgb(75, 192, 192)',
    backgroundColor: 'rgba(75, 192, 192, 0.5)',
  },
  {
    borderColor: 'rgb(255, 99, 132)',
    backgroundColor: 'rgba(255, 99, 132, 0.5)',
  },
  {
    borderColor: 'rgb(247, 218, 105)',
    backgroundColor: 'rgba(247, 218, 105, 0.5)',
  },
  {
    borderColor: 'rgb(220, 137, 77)',
    backgroundColor: 'rgba(220, 137, 77, 0.5)',
  },
  {
    borderColor: 'rgb(54, 162, 235)',
    backgroundColor: 'rgba(54, 162, 235, 0.5)',
  },
]

export type VotesChartProps = {
  proposal: SnapshotProposal
  votes: SnapshotProposalVote[]
  sx?: SxProps
}

export function VotesChart(props: VotesChartProps) {
  const [labels, setLables] = useState<ChartData<'line'>['labels']>([])
  const [datasets, setDatasets] = useState<ChartData<'line'>['datasets']>([])

  useEffect(() => {
    const { proposal, votes } = props

    const tsStart = proposal.start * 1000
    const tsEnd = proposal.end * 1000
    const interval = (tsEnd - tsStart) / (LABEL_LENGTH - 1)

    // Timestamps of equal interval between start and end (inclusive)
    const labels: number[] = []
    for (let i = 0; i < LABEL_LENGTH; i++) {
      labels.push(tsStart + interval * i)
    }

    // Votes per choice, aggregated into each vote timestamp's nearest labeld timestamp
    const aggVotesPerChoice = proposal.choices.reduce(
      (rec, choice) => {
        rec[choice] = Array(LABEL_LENGTH).fill(0)
        return rec
      },
      {} as Record<string, number[]>,
    )

    votes.map((vote) => {
      const weightedChoiceIdxs = Object.keys(vote.choice).map((k) => Number(k))
      weightedChoiceIdxs.forEach((choiceIdx) => {
        const choice = proposal.choices[Number(choiceIdx) - 1] // vote index starts at 1
        const nearestLabelIndex = findNearestIndexOfValue(
          labels,
          vote.created * 1000,
        )

        // console.log(aggVotesPerChoice, choiceIdx, nearestLabelIndex)
        aggVotesPerChoice[choice][nearestLabelIndex] += (
          vote.choice as Record<string, number>
        )[choiceIdx]
      })
    })

    // Cumulative sum (up to current timestamp of the agg votes per choice)
    // Requires in-place update of value (for next element to add the prev element)
    for (let i = 0; i < proposal.choices.length; i++) {
      const choice = proposal.choices[i]
      aggVotesPerChoice[choice].forEach((vp, i) => {
        const prev = i > 0 ? aggVotesPerChoice[choice][i - 1] : 0
        aggVotesPerChoice[choice][i] = vp + prev
      })
    }

    const voteDatasets = Object.keys(aggVotesPerChoice).map(
      (choice, i) =>
        ({
          label: choice,
          data: aggVotesPerChoice[choice],
          ...(LINE_COLORS[i] || {}),
        }) as ChartDataset<'line', DefaultDataPoint<'line'>>,
    )

    setLables(labels)
    setDatasets([
      // {
      //   label: 'Quorum',
      //   data: Array(labels.length).fill(proposal.quorum),
      //   borderColor: 'rgb(200, 200, 200)',
      //   backgroundColor: 'rgba(200, 200, 200, 0.5)',
      // },
      ...voteDatasets,
    ])
  }, [props])

  return (
    <Box width="100%" sx={props.sx}>
      <Line options={chartOptions} data={{ labels, datasets }} />
    </Box>
  )
}
