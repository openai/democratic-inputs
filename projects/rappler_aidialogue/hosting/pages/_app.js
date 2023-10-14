import "../globals.css";

import { ThemeProvider, createTheme } from "@mui/material/styles";

import {
  QuestionContext,
  UserContext,
  TransitionContext,
  DrawerContext,
  SessionContext,
} from "../lib/context";

import "@fontsource/pt-serif"; // Defaults to weight 400
import "@fontsource/pt-serif/400.css"; // Specify weight
import "@fontsource/pt-serif/400-italic.css"; // Specify weight and style

import "@fontsource/ibm-plex-sans"; // Defaults to weight 400
import "@fontsource/ibm-plex-sans/400.css"; // Specify weight
import "@fontsource/ibm-plex-sans/400-italic.css"; // Specify weight and style

import "@fontsource/open-sans-condensed";

const theme = createTheme({
  typography: {
    body1: {
      fontSize: "1rem",
      fontFamily: "IBM Plex Sans",
      letterSpacing: ".01em",
    },
    body2: {
      fontSize: "1rem",
      fontFamily: "IBM Plex Sans",
      letterSpacing: ".01em",
    },
    h1: {
      fontFamily: "IBM Plex Sans",
    },
    h2: {
      fontFamily: "IBM Plex Sans",
    },
    h5: {
      fontFamily: "IBM Plex Sans",
      fontSize: "18px",
    },
    h6: {
      fontFamily: "IBM Plex Sans",
      fontSize: "16px",
    },
    button: {
      fontFamily: "PT Serif",
    },
  },
});

const App = ({ Component, pageProps }) => {
  return (
    <ThemeProvider theme={theme}>
      <SessionContext>
        <TransitionContext>
          <DrawerContext>
            <UserContext>
              <QuestionContext>
                <Component {...pageProps} />
              </QuestionContext>
            </UserContext>
          </DrawerContext>
        </TransitionContext>
      </SessionContext>
    </ThemeProvider>
  );
};

export default App;
