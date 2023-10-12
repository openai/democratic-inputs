import { Stack, SxProps } from '@mui/material'

export type ColumnRowProps = {
  spacing?: number
  py?: number
  children?: React.ReactNode | undefined
  sx?: SxProps
}

export function ColumnRow(props: ColumnRowProps) {
  return (
    <Stack
      direction="row"
      spacing={props.spacing || 1}
      alignItems="center"
      justifyContent="space-between"
      py={props.py || 0.5}
      px={2}
      sx={props.sx}
    >
      {props.children}
    </Stack>
  )
}
