import { createTheme, ThemeOptions } from '@mui/material/styles'
import { EB_Garamond, Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
const ebGaramond = EB_Garamond({ subsets: ['latin'] })

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontSize: 14,
    fontFamily: inter.style.fontFamily,
    h1: {
      fontFamily: ebGaramond.style.fontFamily,
    },
    h2: {
      fontFamily: ebGaramond.style.fontFamily,
    },
    h3: {
      fontFamily: ebGaramond.style.fontFamily,
    },
    h4: {
      fontFamily: ebGaramond.style.fontFamily,
    },
    h5: {
      fontFamily: ebGaramond.style.fontFamily,
    },
    h6: {
      fontFamily: ebGaramond.style.fontFamily,
    },
  },
  // components: {
  //   MuiLink: {
  //     defaultProps: {
  //       component: LinkBehaviour,
  //     },
  //   },
  //   MuiButtonBase: {
  //     defaultProps: {
  //       LinkComponent: LinkBehaviour,
  //     },
  //   },
  // },
}

const customTheme = createTheme(themeOptions)

export default customTheme
