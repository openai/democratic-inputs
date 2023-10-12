import { Autocomplete, Box, InputAdornment, TextField } from '@mui/material'
import React, { useState } from 'react'

import { allCountries, type Country } from '@/data/countries'
import Image from 'next/image'

const countryUS: Country = {
  abbr: 'US',
  name: 'United States',
  code: '1',
  suggested: true,
}

interface CountrySelectProps {
  // setCountryAbbr: React.Dispatch<React.SetStateAction<Country['abbr']>>
  setCountryAbbr: (abbr: Country['abbr']) => void
}

export function CountrySelect(props: CountrySelectProps) {
  const [value, setValue] = useState<Country>(countryUS)
  const [open, setOpen] = useState(false)
  return (
    <Autocomplete
      id="country-select"
      sx={{}}
      value={value}
      onChange={(e, newValue) => {
        if (newValue) {
          setValue(newValue)
          props.setCountryAbbr(newValue.abbr)
        }
      }}
      options={allCountries} // todo: show US at top as suggested
      autoHighlight
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      getOptionLabel={(option) => option.name}
      renderOption={(props, option) => (
        <Box
          component="li"
          sx={{ '& > img': { mr: 2, flexShrink: 0 } }}
          {...props}
        >
          <img
            loading="lazy"
            width="20"
            src={`https://flagcdn.com/w20/${option.abbr.toLowerCase()}.png`}
            srcSet={`https://flagcdn.com/w40/${option.abbr.toLowerCase()}.png 2x`}
            alt=""
          />
          {option.name} ({option.abbr})
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Choose a country"
          inputProps={{
            ...params.inputProps,
            autoComplete: 'country', // disable autocomplete and autofill
          }}
          InputProps={{
            ...params.InputProps,
            startAdornment: value ? (
              <InputAdornment position="start" onClick={() => setOpen(true)}>
                <Image
                  height="40"
                  width="40"
                  src={`https://flagcdn.com/w160/${value.abbr.toLowerCase()}.png`}
                  // srcSet={`https://flagcdn.com/w40/${value.abbr.toLowerCase()}.png 2x`}
                  alt={value.abbr}
                />
              </InputAdornment>
            ) : null,
          }}
        />
      )}
    />
  )
}
