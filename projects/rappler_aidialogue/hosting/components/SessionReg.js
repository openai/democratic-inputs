"use client";

import React, { useEffect, useState, useContext } from "react";

import Image from "next/image";

import {
  Typography,
  Box,
  MenuItem,
  Stack,
  FormControl,
  InputLabel,
  Input,
  FormHelperText,
  Select,
  CircularProgress,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateField } from "@mui/x-date-pickers/DateField";
import { LoadingButton } from "@mui/lab";

import { auth, db } from "../lib/firebase";
import { signInWithCustomToken } from "firebase/auth";
import {
  doc,
  collection,
  getDoc,
  setDoc,
  serverTimestamp,
  arrayUnion,
  updateDoc,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { functions } from "../lib/firebase";

import PolicyGuidelinesTerms from "../components/PolicyGuidelinesTerms";

import { User_data, Session_data } from "../lib/context";

import { updateUserStatus, isValidEmail } from "../lib/utils";
import anonymous from "../lib/anonanimals";
import uniqolor from "uniqolor";

const SessionReg = () => {
  const { session, setSession } = useContext(Session_data);
  const { activeUser, setActiveuser } = useContext(User_data);
  const [submittingRegistration, setSubmittingRegistration] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [birthDate, setBirthdate] = useState(null);
  const [code, setCode] = useState("");
  const [initials, setInitials] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (session.emailrequired === true) {
      if (
        code !== "" &&
        initials !== "" &&
        birthDate !== "" &&
        gender !== "" &&
        email !== "" &&
        errors.length === 0
      ) {
        setSubmitDisabled(false);
      } else {
        setSubmitDisabled(true);
      }
    } else {
      if (
        code !== "" &&
        initials !== "" &&
        birthDate !== "" &&
        gender !== "" &&
        errors.length === 0
      ) {
        setSubmitDisabled(false);
      } else {
        setSubmitDisabled(true);
      }
    }
  }, [errors]);

  const updateError = (action, errorObj) => {
    let idx;
    let newErrors = errors;
    switch (action) {
      case "set":
        // if the field already exists in errors array replace it
        idx = newErrors.findIndex((e) => e.field === errorObj.field);
        idx === -1 ? newErrors.push(errorObj) : (newErrors[idx] = errorObj);
        break;
      case "remove":
        // use filter to remove error for field from array
        newErrors = newErrors.filter((e) => e.field !== errorObj.field);
        break;
    }
    setErrors(newErrors);
  };

  const regFormSetValue = (fieldName, value) => {
    if (value !== null) {
      switch (fieldName) {
        case "birthDate":
          setBirthdate(value.format("MM/DD/YYYY"));
          break;
        case "code":
          setCode(value);
          updateError("remove", { field: "code" });
          break;
        case "initials":
          setInitials(value);
          break;
        case "gender":
          setGender(value);
          break;
        case "email":
          setEmail(value);
          if (!isValidEmail(value)) {
            updateError("set", {
              field: "email",
              message: "Email address format is invalid",
            });
          } else {
            updateError("remove", { field: "email" });
          }
          break;
      }
    }
  };

  const registerSessionUser = async (
    session,
    code,
    initials,
    gender,
    birthDate
  ) => {
    const gq = httpsCallable(functions, "registerSessionUser");
    const params = {
      session: session.id,
      code,
      initials,
      gender,
      birthDate,
      email,
    };
    const response = await gq(params);
    // parse response
    const {
      success = false,
      existing = true,
      uid = null,
      token = null,
      field = null,
      message = null,
    } = response.data;
    if (!success) {
      // contains either an error
      updateError("set", { field, message });
      setSubmitDisabled(true);
    } else {
      // or a token used to login the user
      if (token) {
        signInWithCustomToken(auth, token)
          .then(async () => {
            let userRecord;
            if (!existing) {
              // user is a new user let's get random color imsgsrc and name
              let { name, animal } = await anonymous.generate();
              userRecord = {
                name,
                status: "online",
                imgsrc: `/static/images/${animal}.png`,
                color: uniqolor(name).color,
                lastactive: serverTimestamp(),
                sessions: [session.id],
              };
              await setDoc(doc(collection(db, "users"), uid), userRecord, {
                merge: true,
              });
            } else {
              // user already exists, query from firestore
              const df = doc(db, "users", uid);
              const d = await getDoc(df);
              userRecord = d.data();
            }
            let u = {
              ...userRecord,
              uid,
            };
            updateUserStatus(uid, "online");
            setActiveuser(u);
            window.scrollTo(0, 0);
          })
          .catch((error) => {
            console.error(error);
          });
      }
    }
  };

  const submitReg = async (e) => {
    e.preventDefault();
    if (errors.length === 0) {
      setSubmittingRegistration(true);
      await registerSessionUser(session, code, initials, gender, birthDate);
      setSubmittingRegistration(false);
    } else {
      console.log("form errors present", errors);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={submitReg}
      noValidate
      autoComplete="off"
      style={{ width: "360px" }}
      m="auto"
    >
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

        {session && session.name && session.id !== "main" ? (
          <>
            <Typography
              variant="h4"
              component="div"
              style={{ textAlign: "center" }}
            >
              {session.title}
            </Typography>

            <Stack spacing={3}>
              <FormControl variant="standard">
                <InputLabel htmlFor="session-code">Session code</InputLabel>
                <Input
                  id="session-code"
                  aria-describedby="Session code"
                  value={code}
                  error={
                    errors && errors.findIndex((e) => e.field === "code") !== -1
                      ? true
                      : false
                  }
                  onChange={(v) => {
                    regFormSetValue("code", v.target.value);
                  }}
                />
                <FormHelperText
                  id="session-code-helper"
                  error={
                    errors && errors.findIndex((e) => e.field === "code") !== -1
                      ? true
                      : false
                  }
                >
                  {errors && errors.findIndex((e) => e.field === "code") !== -1
                    ? errors[errors.findIndex((e) => e.field === "code")]
                        .message
                    : "Please enter the code shared with you to enter this session"}
                </FormHelperText>
              </FormControl>

              <FormControl variant="standard">
                <InputLabel htmlFor="initials">Initials</InputLabel>
                <Input
                  id="initials"
                  aria-describedby="Initials"
                  value={initials}
                  onChange={(v) => {
                    regFormSetValue("initials", v.target.value);
                  }}
                />
                <FormHelperText id="initials-helper">
                  Please enter your initials. eg. jpr, hgc
                </FormHelperText>
              </FormControl>

              <FormControl variant="standard">
                <InputLabel htmlFor="gender">Gender</InputLabel>
                <Select
                  labelId="gender"
                  id="gender-select"
                  label="Gender"
                  value={gender}
                  onChange={(v) => {
                    regFormSetValue("gender", v.target.value);
                  }}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                </Select>
              </FormControl>

              <FormControl variant="standard">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateField
                    variant="standard"
                    label="Birth Date"
                    value={birthDate}
                    onError={(newError) => {
                      if (newError !== null) {
                        updateError("set", {
                          field: "birthDate",
                          message: "Date is invalid",
                        });
                      } else {
                        updateError("remove", {
                          field: "birthDate",
                        });
                      }
                    }}
                    onChange={(v) => {
                      regFormSetValue("birthDate", v);
                    }}
                    disableFuture
                  />
                </LocalizationProvider>
                <FormHelperText
                  id="birthdate-helper"
                  error={
                    errors &&
                    errors.findIndex((e) => e.field === "birthDate") !== -1
                      ? true
                      : false
                  }
                >
                  {errors &&
                  errors.findIndex((e) => e.field === "birthDate") !== -1
                    ? errors[errors.findIndex((e) => e.field === "birthDate")]
                        .message
                    : "Please enter a valid date"}
                </FormHelperText>
              </FormControl>

              {session.emailrequired === true && (
                <FormControl variant="standard">
                  <InputLabel htmlFor="email">Email Address</InputLabel>
                  <Input
                    id="email"
                    aria-describedby="email"
                    value={email}
                    onChange={(v) => {
                      regFormSetValue("email", v.target.value);
                    }}
                  />
                  <FormHelperText
                    id="email-helper"
                    error={
                      errors &&
                      errors.findIndex((e) => e.field === "email") !== -1
                        ? true
                        : false
                    }
                  >
                    {errors &&
                    errors.findIndex((e) => e.field === "email") !== -1
                      ? errors[errors.findIndex((e) => e.field === "email")]
                          .message
                      : "Please enter a valid email address"}
                  </FormHelperText>
                </FormControl>
              )}

              <PolicyGuidelinesTerms />

              <LoadingButton
                loading={submittingRegistration}
                color="warning"
                type="submit"
                variant="contained"
                disabled={submitDisabled}
              >
                Join
              </LoadingButton>
            </Stack>
          </>
        ) : (
          <Typography
            variant="body1"
            style={{ textAlign: "center", fontWeight: "bolder" }}
          >
            {session === "notfound" ? (
              <>
                Sorry, the session you are trying to join does not exist or has
                expired.
              </>
            ) : (
              <CircularProgress />
            )}
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

export default SessionReg;
