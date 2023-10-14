"use client";

import React, { useEffect, useState, useContext } from "react";

import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Tooltip,
  Button,
  Stack,
  CircularProgress,
  Divider,
} from "@mui/material";

import {
  query,
  collection,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

import { db, functions } from "../lib/firebase";

import {
  User_data,
  Question_data,
  Transition_data,
  Drawer_data,
  Session_data,
} from "../lib/context";

import TextTruncate from "react-text-truncate";

const QuestionBox = () => {
  const { activeUser } = useContext(User_data);
  const { activeQuestion, setActivequestion } = useContext(Question_data);
  const { drawerOpen, setDraweropen } = useContext(Drawer_data);
  const { session, setSession } = useContext(Session_data);
  const { startTransition } = useContext(Transition_data);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);

  const generateQuestion = async (questionId) => {
    const gq = httpsCallable(functions, "generateQuestion");
    const params = {
      topic: process.env.NEXT_PUBLIC_TOPIC,
      type: "main",
    };
    if (questionId) {
      params.type = "followup";
      params.questionId = questionId;
    }
    await gq(params);
  };

  const summarizeResponses = async (qid) => {
    const s = httpsCallable(functions, "summarizeResponses");
    const params = {
      questionId: qid,
    };
    await s(params);
  };

  const generatePolicy = async () => {
    const s = httpsCallable(functions, "generatePolicies");
    await s({
      session,
    });
  };

  useEffect(() => {
    if (session && session.id) {
      const q = query(
        collection(db, "questions"),
        where("visible", "==", true),
        where("session", "==", session.id),
        orderBy("seq", "asc")
      );
      const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
        const fetchedQuestions = [];
        QuerySnapshot.forEach(async (doc) => {
          fetchedQuestions.push({ ...doc.data(), id: doc.id });
        });
        setQuestions(fetchedQuestions);
        setLoading(false);
      });
      return () => unsubscribe;
    }
  }, [session]);

  return (
    <Box>
      <Box style={{ maxHeight: "80vh", overflow: "auto" }}>
        {loading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              marginTop: "10px",
            }}
          >
            <CircularProgress />
          </div>
        )}
        {!loading && questions.length == 0 ? (
          <Typography sx={{ mt: 2, ml: 2 }} align="center" component="div">
            No questions at this time
          </Typography>
        ) : (
          <List sx={{ width: "100%", height: "100%" }}>
            {questions
              .filter((q) => q.type === "main")
              ?.map((q, i) => (
                <div key={q.id}>
                  <ListItem key={q.id}>
                    <ListItemButton
                      style={{ borderRadius: "10px" }}
                      selected={activeQuestion.id === q.id}
                      onClick={() => {
                        startTransition(() => {
                          setDraweropen(false);
                          setActivequestion(q);
                        });
                      }}
                    >
                      <Stack spacing={2} style={{ width: "100%" }}>
                        {activeUser.isadmin && (
                          <Stack spacing={1}>
                            <Tooltip title="Generate a summary for this question">
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => {
                                  summarizeResponses(q.id);
                                }}
                              >
                                Summarize
                              </Button>
                            </Tooltip>
                            <Tooltip title="Generate a follow up question">
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => {
                                  generateQuestion(q.id);
                                }}
                              >
                                Followup
                              </Button>
                            </Tooltip>
                          </Stack>
                        )}
                        <ListItemText
                          className="truncate block font-semibold"
                          primaryTypographyProps={{
                            variant: "h6",
                          }}
                        >
                          <Typography className="eyebrow" component="div">
                            QUESTION {i + 1}
                          </Typography>
                          <Divider sx={{ bgcolor: "#ff6900", mb: "10px" }} />
                          <TextTruncate
                            line={2}
                            text={q.question}
                            truncateText="... ?"
                          />
                        </ListItemText>
                      </Stack>
                    </ListItemButton>
                  </ListItem>
                  {questions
                    .filter((x) => x.parentId === q.id)
                    ?.map((qf, i) => (
                      <ListItem key={qf.id}>
                        <ListItemButton
                          style={{ borderRadius: "10px" }}
                          selected={activeQuestion.id === qf.id}
                          onClick={() => {
                            startTransition(() => {
                              setDraweropen(false);
                              setActivequestion(qf);
                            });
                          }}
                        >
                          <ListItemText
                            sx={{ ml: 2 }}
                            primaryTypographyProps={{
                              variant: "h6",
                            }}
                          >
                            <Typography className="eyebrow" component="div">
                              FOLLOW UP {i + 1}:
                            </Typography>
                            <TextTruncate
                              line={2}
                              text={qf.question}
                              truncateText="... ?"
                            />
                          </ListItemText>
                        </ListItemButton>
                      </ListItem>
                    ))}
                </div>
              ))}

            {activeUser.isadmin && (
              <Stack spacing={1}>
                <ListItem key="genadmin">
                  <ListItemButton>
                    <Stack spacing={1} style={{ width: "100%" }}>
                      <Tooltip title="Generate policies">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            generatePolicy();
                          }}
                        >
                          Generate Policies
                        </Button>
                      </Tooltip>
                      <Tooltip title="Generate a scenario">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {}}
                        >
                          Generate a Scenario
                        </Button>
                      </Tooltip>
                    </Stack>
                  </ListItemButton>
                </ListItem>
              </Stack>
            )}

            {questions
              .filter(
                (q) => q.type === "highlevel" || q.type === "policycheckheader"
              )
              ?.map((q, i) => (
                <ListItem key={q.id}>
                  <ListItemButton
                    style={{ borderRadius: "10px" }}
                    selected={activeQuestion.id === q.id}
                    onClick={() => {
                      startTransition(() => {
                        setDraweropen(false);
                        setActivequestion(q);
                      });
                    }}
                  >
                    <ListItemText
                      className="truncate block font-semibold"
                      primaryTypographyProps={{
                        variant: "h6",
                      }}
                    >
                      <Typography className="eyebrow" component="div">
                        {q.type === "highlevel" ? "HIGH LEVEL QUESTION" : ""}
                        {q.type === "policycheckheader" ? "POLICY CHECK" : ""}
                      </Typography>
                      <Divider sx={{ bgcolor: "#ff6900", mb: "10px" }} />
                      <TextTruncate
                        line={2}
                        text={q.question}
                        truncateText="..."
                      />
                    </ListItemText>
                  </ListItemButton>
                </ListItem>
              ))}

            {questions.some((obj) => obj.type === "scenarios") ? (
              <ListItem key="scenarios-header">
                <ListItemButton
                  style={{ borderRadius: "10px" }}
                  selected={false}
                  onClick={() => {}}
                >
                  <ListItemText
                    className="truncate block font-semibold"
                    primaryTypographyProps={{
                      variant: "h6",
                    }}
                  >
                    <Typography className="eyebrow" component="div">
                      SPECIFIC SCENARIOS
                    </Typography>
                    <Divider sx={{ bgcolor: "#ff6900", mb: "10px" }} />
                    <TextTruncate
                      line={2}
                      text="Click on a scenario below"
                      truncateText="..."
                    />
                  </ListItemText>
                </ListItemButton>
              </ListItem>
            ) : (
              <></>
            )}

            {questions
              .filter((q) => q.type === "scenarios")
              ?.map((qf, i) => (
                <ListItem key={qf.id}>
                  <ListItemButton
                    style={{ borderRadius: "10px" }}
                    selected={activeQuestion.id === qf.id}
                    onClick={() => {
                      startTransition(() => {
                        setDraweropen(false);
                        setActivequestion(qf);
                      });
                    }}
                  >
                    <ListItemText
                      sx={{ ml: 2 }}
                      primaryTypographyProps={{
                        variant: "h6",
                      }}
                    >
                      <Typography className="eyebrow" component="div">
                        SCENARIO {i + 1}:
                      </Typography>
                      <TextTruncate
                        line={2}
                        text={qf.question}
                        truncateText="... ?"
                      />
                    </ListItemText>
                  </ListItemButton>
                </ListItem>
              ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default QuestionBox;
