import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Stack,
} from '@mui/material'

interface LikertScaleQuestionProps {
  label: string
  // choices: { label: string; value: string }[]
  currentChoice: number
  setCurrentChoice: (choice: number) => void
}

export function LikertScaleQuestion(props: LikertScaleQuestionProps) {
  return (
    <FormControl fullWidth>
      <FormLabel style={{ padding: '0 4px' }}>{props.label}</FormLabel>
      <RadioGroup
        row
        value={props.currentChoice}
        onChange={(e) => props.setCurrentChoice(Number(e.target.value) || 0)}
        sx={{ m: '8px auto 0' }}
      >
        {/* {props.choices.map((choice) => (
          <FormControlLabel
            value={choice.value}
            control={<Radio />}
            label={choice.label}
          />
        ))} */}
        <FormControlLabel
          value={1}
          control={<Radio />}
          label="1"
          labelPlacement="top"
          color="#dc2626" // tailwind red-600
        />
        <FormControlLabel
          value={2}
          control={<Radio />}
          label="2"
          labelPlacement="top"
          color="#f87171" // tailwind red-400
        />
        <FormControlLabel
          value={3}
          control={<Radio />}
          label="3"
          labelPlacement="top"
          color="#999"
        />
        <FormControlLabel
          value={4}
          control={<Radio />}
          label="4"
          labelPlacement="top"
          color="#4ade80" // tailwind green-400
        />
        <FormControlLabel
          value={5}
          control={<Radio />}
          label="5"
          labelPlacement="top"
          color="#16a34a" // tailwind green-600
        />
      </RadioGroup>
    </FormControl>
  )
}
