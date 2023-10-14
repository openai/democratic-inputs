"use client";

import React, { useEffect, useState, useContext } from "react";

import { Session_data } from "../lib/context";

import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
} from "@mui/material";

import { query, collection, onSnapshot, where } from "firebase/firestore";

import { db } from "../lib/firebase";

import UserAvatar from "../components/UserAvatar";

const ParticipantBox = () => {
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const { session, setSession } = useContext(Session_data);

  useEffect(() => {
    if (session && session.id) {
      const q = query(
        collection(db, "users"),
        where("sessions", "array-contains-any", [session.id])
      );
      const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
        const fetchedUsers = [];
        QuerySnapshot.forEach((doc) => {
          fetchedUsers.push({ ...doc.data(), id: doc.id });
        });
        setParticipants(fetchedUsers);
        setLoading(false);
      });
      return () => unsubscribe;
    }
  }, [session]);

  return (
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
      {!loading && participants.length == 0 ? (
        <Typography sx={{ mt: 2, ml: 2 }} align="center" component="div">
          No one here yet
        </Typography>
      ) : (
        <List dense={true}>
          {participants?.map((user) => (
            <ListItem key={user.id}>
              <ListItemAvatar>
                <UserAvatar user={user} />
              </ListItemAvatar>
              <ListItemText
                primaryTypographyProps={{
                  variant: "h6",
                }}
                primary={user.name}
                secondary={user.status ? user.status : ""}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default ParticipantBox;
