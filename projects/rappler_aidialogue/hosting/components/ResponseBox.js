"use client";

import React, { useEffect, useState, useRef, useContext } from "react";

import parse from "html-react-parser";

import { Virtuoso } from "react-virtuoso";

import useMediaQuery from "@mui/material/useMediaQuery";

import {
  Typography,
  Box,
  Button,
  TextField,
  ListItem,
  ListItemText,
  ListItemAvatar,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Stack,
  IconButton,
  Snackbar,
  Alert,
  Slide,
} from "@mui/material";

import { LoadingButton } from "@mui/lab";

import { ThumbUpAltRounded, ThumbDownRounded } from "@mui/icons-material";

import {
  query,
  collection,
  orderBy,
  where,
  onSnapshot,
  serverTimestamp,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  getCountFromServer,
  deleteDoc,
  limit,
} from "firebase/firestore";

import { db } from "../lib/firebase";

import {
  User_data,
  Question_data,
  Transition_data,
  Drawer_data,
} from "../lib/context";

import UserAvatar from "../components/UserAvatar";

import { updateUserStatus } from "../lib/utils";

const TransitionDown = (props) => {
  return <Slide {...props} direction="down" />;
};

const ResponseBox = () => {
  const { activeQuestion } = useContext(Question_data);
  const { activeUser } = useContext(User_data);
  const { isPending } = useContext(Transition_data);
  const { drawerOpen, setDraweropen } = useContext(Drawer_data);
  const [notifyObj, setnotifyObj] = useState({
    open: false,
    msg: "",
    severity: "info",
  });
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [userVotes, setUservotes] = useState([]);
  const [userResponded, setUserresponded] = useState(false);
  const [submittingResponse, setSubmittingresponse] = useState(false);
  const [responseCount, setResponsecount] = useState(0);
  const [message, setMessage] = useState("");
  const virtuoso = useRef(null);
  const isSmallScreen = useMediaQuery("(max-width: 600px)");

  useEffect(() => {
    const now = new Date();
    const twoMinutesAgo = new Date(now - 2 * 60 * 1000);
    const q = query(
      collection(db, "aistatus"),
      where("createdAt", ">", twoMinutesAgo),
      orderBy("createdAt", "desc"),
      limit(1)
    );
    const unsubscribe = onSnapshot(q, (aiqs) => {
      let fetchedAiStatus = [];
      aiqs.forEach((doc) => {
        let d = doc.data();
        fetchedAiStatus.push({
          severity: "info",
          msg: d.message,
          open: true,
        });
      });
      setnotifyObj(fetchedAiStatus[0]);
    });
    return () => unsubscribe;
  }, []);

  useEffect(() => {
    if (activeQuestion.type === "policycheckheader") {
      const vq = query(
        collection(db, "votes"),
        where("user", "==", activeUser.uid)
      );
      const unsubscribe = onSnapshot(vq, (vqs) => {
        const fetchedVotes = [];
        vqs.forEach((doc) => {
          let d = doc.data();
          fetchedVotes.push({
            ...d,
            id: doc.id,
          });
        });
        setUservotes(fetchedVotes);
      });
      return () => unsubscribe;
    }
  }, [activeQuestion]);

  useEffect(() => {
    let qId = activeQuestion.id ? activeQuestion.id : "";
    if (activeQuestion.type === "policycheckheader") {
      const pq = query(
        collection(db, "questions"),
        where("parentId", "==", qId)
      );
      const unsubscribe = onSnapshot(pq, (pqs) => {
        const fetchedPolicies = [];
        pqs.forEach(async (doc) => {
          let d = doc.data();
          fetchedPolicies.push({
            ...d,
            id: doc.id,
          });
        });
        setPolicies(fetchedPolicies);
      });
      return () => unsubscribe;
    }
  }, [activeQuestion]);

  useEffect(() => {
    setResponses([]);
    let qId = activeQuestion.id ? activeQuestion.id : "";
    setLoading(true);
    setSubmittingresponse(false);
    const questionQuery = query(
      collection(db, "responses"),
      where("questionId", "==", qId),
      orderBy("createdAt", "asc")
    );
    const unsubscribe = onSnapshot(questionQuery, (QuerySnapshot) => {
      let activeUserHasResponded = false;
      const fetchedResponses = [];
      QuerySnapshot.forEach(async (doc) => {
        let d = doc.data();
        if (d.user.uid === activeUser.uid) {
          activeUserHasResponded = true;
        }
        fetchedResponses.push({
          ...d,
          id: doc.id,
        });
      });
      setResponsecount(fetchedResponses.length);
      setUserresponded(activeUserHasResponded);
      if (activeUserHasResponded || activeUser.isadmin === true) {
        setResponses(fetchedResponses);
      }
      setLoading(false);
    });
    return () => unsubscribe;
  }, [activeQuestion]);

  const sendResponse = async (event) => {
    event.preventDefault();
    if (message.trim() === "") {
      alert("Your response is empty");
      return;
    }
    setSubmittingresponse(true);
    try {
      await addDoc(collection(db, "responses"), {
        response: message,
        questionId: activeQuestion.id,
        createdAt: serverTimestamp(),
        user: activeUser,
      });
    } catch (error) {
      alert("There was an error submitting your response. Try again later.");
    }
    setMessage("");
    setSubmittingresponse(false);
    virtuoso.current.scrollToIndex({
      index: 1000,
      align: "end",
      behavior: "smooth",
    });
    await updateUserStatus(activeUser.uid, "online");
  };

  const vote = (v, u, p) => {
    const q = query(
      collection(db, "votes"),
      where("user", "==", u),
      where("subject", "==", p)
    );
    getCountFromServer(q).then((s) => {
      let c = s.data().count;
      if (c === 0) {
        addDoc(collection(db, "votes"), {
          vote: v,
          user: u,
          subject: p,
        });
      } else {
        getDocs(q).then((s) => {
          s.forEach((d) => {
            if (d.data().vote === v) {
              deleteDoc(doc(db, "votes", d.id));
            } else {
              updateDoc(doc(db, "votes", d.id), {
                vote: v,
              });
            }
          });
        });
      }
    });
  };

  return (
    <Box
      sx={{
        mt: "10px",
        mb: "10px",
        height: "90vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {notifyObj && (
        <Snackbar
          autoHideDuration={6000}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={notifyObj.open}
          onClose={() => {
            setnotifyObj({ open: false, msg: "", severity: "info" });
          }}
          TransitionComponent={TransitionDown}
          key={"top" + "center"}
        >
          <Alert
            variant="filled"
            onClose={() => {
              setnotifyObj({ open: false, msg: "", severity: "info" });
            }}
            severity={notifyObj.severity}
            sx={{ width: "100%" }}
          >
            {notifyObj.msg}
          </Alert>
        </Snackbar>
      )}
      {loading && (
        <div style={{ textAlign: "center" }}>
          <CircularProgress />
        </div>
      )}
      {!loading && !activeQuestion ? (
        <Typography sx={{ mt: 2, ml: 2 }} align="center" component="div">
          Choose a question.
        </Typography>
      ) : (
        ""
      )}
      {!loading && activeQuestion ? (
        <>
          {isSmallScreen && activeQuestion.question ? (
            <Button
              variant="outlined"
              color="warning"
              style={{ margin: "0 15px 15px 15px" }}
              onClick={() => {
                setDraweropen(true);
              }}
            >
              SHOW QUESTIONS
            </Button>
          ) : (
            ""
          )}
          <Virtuoso
            style={{ height: "100vh", marginBottom: "110px" }}
            data={responses}
            ref={virtuoso}
            components={{
              Header: () => (
                <>
                  {activeQuestion.question && (
                    <Card sx={{ mb: "20px" }}>
                      <CardContent>
                        <Typography
                          className="eyebrow"
                          component="div"
                          gutterBottom
                        >
                          {activeQuestion.type === "main" ||
                          activeQuestion.type === "followup"
                            ? "SELECTED QUESTION"
                            : ""}
                          {activeQuestion.type === "highlevel"
                            ? "HIGH LEVEL QUESTION"
                            : ""}
                          {activeQuestion.type === "policycheckheader"
                            ? "POLICY CHECK"
                            : ""}
                          {activeQuestion.type === "scenarios"
                            ? "SCENARIO"
                            : ""}
                        </Typography>
                        <Divider sx={{ bgcolor: "#ff6900", mb: "10px" }} />
                        <Typography variant="h5" component="div">
                          {activeQuestion.type === "policycheckheader" ? (
                            <Stack spacing={2} direction="column">
                              <Box>
                                Based on your responses, Rai has generated the
                                following rules. Please thumbs up / down to
                                indicate agreement.
                              </Box>
                              {policies.map((p, i) => (
                                <Box key={p.id}>
                                  <IconButton
                                    onClick={() => {
                                      vote("up", activeUser.uid, p.id);
                                    }}
                                  >
                                    <ThumbUpAltRounded
                                      color={
                                        userVotes.some(
                                          (obj) =>
                                            obj.subject === p.id &&
                                            obj.vote === "up"
                                        )
                                          ? "success"
                                          : ""
                                      }
                                    />
                                  </IconButton>
                                  <IconButton
                                    style={{ marginRight: "5px" }}
                                    onClick={() => {
                                      vote("down", activeUser.uid, p.id);
                                    }}
                                  >
                                    <ThumbDownRounded
                                      color={
                                        userVotes.some(
                                          (obj) =>
                                            obj.subject === p.id &&
                                            obj.vote === "down"
                                        )
                                          ? "error"
                                          : ""
                                      }
                                    />
                                  </IconButton>
                                  {p.question}
                                </Box>
                              ))}
                            </Stack>
                          ) : (
                            activeQuestion.question
                          )}
                        </Typography>
                        <br />
                        {activeQuestion.summary && (
                          <>
                            <Typography
                              className="eyebrow"
                              component="div"
                              gutterBottom
                            >
                              SUMMARY
                            </Typography>
                            <Divider sx={{ bgcolor: "#ff6900", mb: "10px" }} />
                            <Typography variant="body1" component="div">
                              {parse(activeQuestion.summary)}
                            </Typography>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </>
              ),
              EmptyPlaceholder: () => (
                <>
                  {activeQuestion.question ? (
                    <Typography
                      variant="h5"
                      component="div"
                      sx={{ textAlign: "center", margin: "5px" }}
                    >
                      {!loading && responseCount > 0 ? (
                        <div>
                          {responseCount === 1 ? (
                            "1 person has"
                          ) : (
                            <b>{responseCount} people </b>
                          )}{" "}
                          already responded to this. <br />
                          Submit your answer to see their responses.
                        </div>
                      ) : (
                        "Waiting for responses"
                      )}
                    </Typography>
                  ) : (
                    <Box textAlign="center" style={{ marginTop: "50px" }}>
                      <Button
                        size="large"
                        variant="contained"
                        color="warning"
                        onClick={() => {
                          setDraweropen(!drawerOpen);
                        }}
                      >
                        {isSmallScreen
                          ? "click here to start"
                          : "click on a question to start"}
                      </Button>
                    </Box>
                  )}
                </>
              ),
            }}
            itemContent={(index, r) => (
              <>
                <ListItem
                  flex="1"
                  alignItems="flex-start"
                  display="flex"
                  key={r.id}
                  style={{
                    margin: "auto",
                    width: "95%",
                    flexDirection:
                      r.user.uid === activeUser.uid ? "row-reverse" : "initial",
                  }}
                >
                  <ListItemAvatar>
                    <UserAvatar user={r.user} />
                  </ListItemAvatar>
                  <ListItemText
                    style={{
                      textAlign:
                        r.user.uid === activeUser.uid ? "right" : "left",
                      paddingRight:
                        r.user.uid === activeUser.uid ? "10px" : "0",
                    }}
                    primary={r.response}
                    secondary={
                      <>
                        {r.user.name}
                        <br />
                        {r.createdAt
                          ? new Date(r.createdAt.seconds * 1000).toLocaleString(
                              "en-US"
                            )
                          : new Date().toLocaleString("en-US")}
                      </>
                    }
                  />
                </ListItem>
                <Divider light />
              </>
            )}
          />
        </>
      ) : (
        ""
      )}
      {activeQuestion.id ? (
        <Box
          component="form"
          onSubmit={(event) => sendResponse(event)}
          noValidate
          autoComplete="off"
          display="flex"
          sx={{ position: "absolute", bottom: 0, width: "100%" }}
        >
          <TextField
            multiline
            fullWidth
            rows={3}
            flex="1"
            color="warning"
            style={{ width: "100%" }}
            id="messageInput"
            name="messageInput"
            placeholder="type a response..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <LoadingButton
            loading={submittingResponse}
            color="warning"
            type="submit"
            variant="contained"
          >
            Send
          </LoadingButton>
        </Box>
      ) : (
        <></>
      )}
    </Box>
  );
};

export default ResponseBox;
