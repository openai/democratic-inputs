"use client";

import React, { useEffect, useState, useContext, useRef } from "react";

import Head from "next/head";
import Image from "next/image";

import useMediaQuery from "@mui/material/useMediaQuery";
import {
  AppBar,
  Toolbar,
  Typography,
  Grid,
  Divider,
  Button,
  Box,
  Menu,
  MenuItem,
  Stack,
  Drawer,
  Link,
  Container,
} from "@mui/material";
import { createSvgIcon } from "@mui/material/utils";

import { signInWithPopup, signOut, OAuthProvider } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../lib/firebase";

import ParticipantBox from "../components/ParticipantBox";
import QuestionBox from "../components/QuestionBox";
import ResponseBox from "../components/ResponseBox";
import UserAvatar from "../components/UserAvatar";
import SessionReg from "../components/SessionReg";
import PolicyGuidelinesTerms from "../components/PolicyGuidelinesTerms";

import {
  User_data,
  Question_data,
  Drawer_data,
  Session_data,
} from "../lib/context";

import { updateUserStatus } from "../lib/utils";
import anonymous from "../lib/anonanimals";
import uniqolor from "uniqolor";

const RapplerIcon = createSvgIcon(
  <svg
    width="48"
    height="41"
    viewBox="0 0 48 41"
    fill="#fff"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20.6008 39.6121C14.7202 38.2578 10.3871 34.9926 7.3622 30.7105C5.63816 28.2705 4.28467 25.3317 3.74304 21.6822C3.16392 17.7819 3.86575 13.8049 5.0131 10.8168C3.4027 13.8755 2.33273 17.2387 2.63196 21.4923C2.77039 23.4683 3.23042 25.2592 3.77508 26.8772C4.32336 28.5067 4.97985 29.9786 5.83885 31.3755C8.91638 36.3774 14.2481 39.4995 21.776 39.9915C22.2977 40.0256 22.9741 40.1383 23.3634 40.0548C23.3326 40.0621 22.8556 39.986 22.6332 39.9604C21.9005 39.8758 21.2223 39.7546 20.6008 39.6121ZM6.69544 27.2572C8.66793 31.5886 12.3705 34.5286 16.5053 36.4754C14.3871 28.5993 12.2672 20.7262 10.1556 12.844C9.16484 12.5547 8.2605 12.1796 7.26669 11.8934C6.02685 13.7026 5.19929 16.4282 5.1074 19.3378C5.01552 22.2747 5.70707 25.0881 6.69544 27.2572ZM25.1086 21.175C26.5141 20.4984 28.1565 19.2373 28.1565 17.2473C28.1565 16.0355 27.5726 14.8511 26.95 14.1429C26.2578 13.3555 25.1316 12.8434 23.7751 12.9073C21.4139 13.0187 19.3943 14.0095 17.235 14.4595C18.0353 17.1456 18.7819 19.8858 19.5526 22.6005C20.5168 22.4154 21.4877 22.1438 22.3781 21.9356C23.3399 21.7103 24.2466 21.5903 25.1086 21.175ZM40.1251 30.3939C41.8764 27.2602 43.1634 23.4786 42.9512 18.7995C42.7511 14.4029 40.9654 10.9337 39.014 8.25067C37.0168 5.50431 34.4307 3.19518 31.0769 1.69351C27.8736 0.258827 22.9723 -0.468867 18.6954 0.584614C27.8942 -0.116286 34.1188 3.54532 37.6811 8.85231C39.4608 11.5043 41.0808 14.672 41.6811 18.5772C42.3485 22.9208 41.4599 27.2949 39.8712 30.0766C39.3181 29.5091 38.6943 29.0122 38.2209 28.3661C40.4824 25.0369 40.6486 18.4591 39.2371 14.1106C37.883 9.93867 34.8484 6.80198 31.3634 4.79793C29.585 3.77489 27.3719 2.95464 24.9188 2.64347C22.2953 2.31098 19.5327 2.56187 17.2996 3.30905C13.3843 4.61768 10.34 7.27818 8.15652 10.3095C8.00298 10.5233 7.78173 10.7181 7.80712 10.9112C11.3568 9.97886 14.9421 9.02099 18.5377 8.06007C20.3125 7.58569 22.1067 6.97005 24.1571 6.88784C28.5561 6.71064 31.4698 8.63857 33.1099 11.4495C33.9519 12.8921 34.6332 14.6038 34.6973 16.6444C34.768 18.8987 34.1085 20.5307 33.2054 21.935C32.3161 23.3154 31.1821 24.417 29.776 25.2927C34.2965 28.9099 39.0388 32.4472 43.5871 35.9998C43.7201 36.104 43.896 36.1831 43.968 36.3482C36.3657 33.6487 28.6595 30.8847 21.0778 28.2698C22.0196 31.2902 22.7952 34.4762 23.7763 37.4564C27.1494 37.5478 29.4865 36.3329 31.6814 35.1443C37.1014 36.3676 42.5443 37.5679 48 38.7559C45.5209 36.0644 42.6767 33.1621 40.1251 30.3939ZM1.48884 17.9445C1.97788 12.4007 4.15894 8.06676 6.6634 4.70293C5.08504 6.31238 3.5103 8.12827 2.31399 10.2779C1.13521 12.397 0.187343 14.9534 0.0283587 17.9439C-0.146343 21.2194 0.506522 24.006 1.42537 26.4333C2.33636 28.8398 3.57015 30.9882 5.0131 32.7371C2.87255 28.8642 0.944183 24.1132 1.48884 17.9445ZM42.3158 29.6656C44.5265 26.4868 46.4089 21.5227 45.1733 16.2023C44.1215 11.6723 41.446 8.24579 38.5697 5.71683C40.9998 8.43579 43.1126 11.8569 43.9674 16.234C44.8977 20.9978 43.9256 26.2682 42.3158 29.6656Z"
    />
  </svg>,
  "Log In with Rappler"
);

const rapplerSignIn = () => {
  const provider = new OAuthProvider("oidc.fgdai");
  signInWithPopup(auth, provider)
    .then((result) => {
      const credential = OAuthProvider.credentialFromResult(result);
      if (credential) {
        const accessToken = credential.accessToken;
        const idToken = credential.idToken;
      } else {
        throw new Error("No credentials found");
      }
    })
    .catch((error) => {
      // Handle error.
      // alert('We encountered a problem logging you in. Please try again later');
    });
};

export default function Home() {
  const [user] = useAuthState(auth);
  const { activeQuestion, setActivequestion } = useContext(Question_data);
  const { activeUser, setActiveuser } = useContext(User_data);
  const { drawerOpen, setDraweropen } = useContext(Drawer_data);
  const { session, setSession } = useContext(Session_data);
  const [anchorEl, setAnchorEl] = useState(null);
  const [permChecked, setPermChecked] = useState(false);

  const isSmallScreen = useMediaQuery("(max-width: 600px)");
  const openMenu = anchorEl ? true : false;

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const firebaseSignOut = () => {
    setAnchorEl(null);
    setPermChecked(false);
    setActivequestion({});
    setActiveuser({});
    setSession({});
    signOut(auth);
  };

  const checkUser = async (uid) => {
    const df = doc(db, "users", uid);
    const d = await getDoc(df);
    const userRecord = d.data();
    if (!d.exists() || !userRecord?.name) {
      let { name, animal } = await anonymous.generate();
      if (name === null) {
        firebaseSignOut();
        alert("Unable to register user. Please try again later.");
      } else {
        let u = {
          uid,
          name,
          status: "online",
          imgsrc: `/static/images/${animal}.png`,
          color: uniqolor(name).color,
          lastactive: serverTimestamp(),
          sessions: ["main"],
        };
        await setDoc(doc(collection(db, "users"), uid), u, { merge: true });
        setActiveuser(u);
      }
    } else {
      let u = {
        ...userRecord,
        uid: uid,
      };
      updateUserStatus(uid, "online");
      setActiveuser(u);
    }
  };

  const checkSession = async (sessionId) => {
    const df = doc(db, "sessions", sessionId);
    const d = await getDoc(df);
    if (d.exists()) {
      const sessionRecord = d.data();
      const id = d.id;
      setSession({
        id,
        name: sessionRecord?.name,
        title: sessionRecord?.title,
        emailrequired: sessionRecord?.emailrequired,
      });
    } else {
      setSession("notfound");
    }
  };

  useEffect(() => {
    if (user) {
      let { uid } = user;
      checkUser(uid);
      window.scrollTo(0, 0);
    }
  }, [user]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionQs = urlParams.get("session");
    if (sessionQs === null || sessionQs === "main") {
      setSession({ id: "main", name: "aiDialogue", title: "aiDialogue" });
    } else {
      // lookup the session id
      // from sessions collection
      // set session state
      checkSession(sessionQs);
    }
  }, [user]);

  useEffect(() => {
    if (user && session) {
      if (!activeUser.isadmin) {
        if (
          activeUser &&
          activeUser.sessions &&
          !activeUser.sessions.includes(session.id)
        ) {
          // user is not suppose to be in this session
          // logout
          firebaseSignOut();
        }
      }
    }
    setPermChecked(true);
  }, [activeUser]);

  const showMoreRef = useRef(null);
  const intropart2Ref = useRef(null);

  return (
    <>
      <Head>
        <title>{process.env.NEXT_PUBLIC_APP_TITLE}</title>
      </Head>

      {session && session.id !== "main" && user == null ? <SessionReg /> : ""}

      {session && session.id == "main" && user == null ? (
        <Container>
          <Stack
            spacing={2}
            justifyContent="center"
            alignItems="center"
            sx={{ mt: "50px" }}
          >
            <Image
              src="/static/images/logo2.png"
              width={300}
              height={84}
              unoptimized
              alt="aiDialogue"
            />

            <Typography
              variant="h4"
              component="div"
              style={{ textAlign: "center" }}
            >
              {process.env.NEXT_PUBLIC_TOPIC}
            </Typography>

            <Stack sx={{ width: "90%" }} mx={{ width: "40%" }} spacing={2}>
              <Typography
                variant="body1"
                style={{ textAlign: "center", fontWeight: "bolder" }}
              >
                You are about to join aiDialogue, an experimental online
                consultation forum developed by Rappler to crowdsource inputs
                from the public on policies that should govern AI platforms.
              </Typography>

              <Divider />

              <div
                style={{
                  fontSize: "1.125rem",
                  fontFamily: "IBM Plex Sans",
                  letterSpacing: ".01em",
                }}
              >
                <p>
                  aiDialogue is an AI-moderated chatroom that functions as a
                  focused group discussion (FGD).{" "}
                </p>
                <p>
                  In aiDialogue, Rappler prompted ChatGPT to assume the persona
                  of Rai, an FGD moderator.{" "}
                </p>
                <p>Rai will be asking participants questions. </p>
                <p>
                  She will also synthesize insights from participant inputs, ask
                  relevant follow-up questions, and surface potential policy
                  ideas based on participant inputs.{" "}
                </p>
                <center ref={showMoreRef}>
                  <Link
                    onClick={() => {
                      if (showMoreRef.current !== null) {
                        showMoreRef.current.style.display = "none";
                      }
                      if (intropart2Ref.current !== null) {
                        intropart2Ref.current.style.display = "block";
                      }
                    }}
                  >
                    Read more
                  </Link>
                </center>
                <span ref={intropart2Ref} style={{ display: "none" }}>
                  <p>
                    aiDialogue is part of a multi-layered and multi-form
                    consultation process that Rappler proposed in response to
                    the{" "}
                    <Link
                      target="_blank"
                      href="https://openai.com/blog/democratic-inputs-to-ai"
                    >
                      OpenAI call for prototype democratic processes
                    </Link>{" "}
                    that could help guide the governance and behavior of AI
                    platforms.{" "}
                  </p>
                  <p>
                    Other layers to this process include surveys, and onground
                    focused group discussions.
                  </p>
                  <p>
                    Outputs and insights from this multi-layered experimental
                    consultation process will be presented in a report to
                    OpenAI.
                  </p>
                  <p>
                    Identities of participants will be anonymized. Only
                    demographic summaries will form part of any reports derived
                    from this experiment.
                  </p>
                  <p>
                    When you join the chatroom you will be assigned a random
                    name in order to protect your identity.
                  </p>
                </span>
              </div>

              <Divider />

              <PolicyGuidelinesTerms />
            </Stack>

            <Button
              style={{ marginBottom: "50px" }}
              onClick={rapplerSignIn}
              variant="contained"
              color="warning"
              startIcon={<RapplerIcon />}
            >
              Login with Rappler
            </Button>
          </Stack>
        </Container>
      ) : (
        ""
      )}

      {permChecked && user !== null ? (
        <Box>
          <AppBar
            color="primary"
            position="static"
            style={{ backgroundColor: "#ff5f1b" }}
          >
            <Toolbar>
              <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
                <Image
                  src="/static/images/logo1.png"
                  width={150}
                  height={42}
                  unoptimized
                  alt="aiDialogue"
                  style={{ float: "left" }}
                />
                {session && session.id !== "main" ? (
                  <Typography
                    sx={{
                      typography: { sm: "body1", xs: "body2" },
                      width: "120px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    : {session.title}
                  </Typography>
                ) : (
                  ""
                )}
              </Box>

              <Button
                size="medium"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <UserAvatar user={activeUser} sx={{ width: 32, height: 32 }} />
              </Button>
            </Toolbar>
          </AppBar>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={openMenu}
            onClose={() => {
              setAnchorEl(null);
            }}
          >
            {" "}
            <MenuItem>
              Logged in as&nbsp;<b>{activeUser.name}</b>
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                if (activeUser.uid) {
                  updateUserStatus(activeUser.uid, "offline");
                }
                firebaseSignOut();
              }}
            >
              Logout
            </MenuItem>
          </Menu>
          <Grid container spacing={2}>
            {isSmallScreen ? (
              <Drawer open={drawerOpen}>
                <Grid item md xs>
                  <QuestionBox />
                </Grid>
              </Drawer>
            ) : (
              <Grid item md xs>
                <QuestionBox />
              </Grid>
            )}
            <Grid item md={7} xs={12}>
              <ResponseBox />
            </Grid>
            <Grid item md={2} display={{ xs: "none", md: "block" }}>
              <ParticipantBox />
            </Grid>
          </Grid>
        </Box>
      ) : (
        ""
      )}
    </>
  );
}
