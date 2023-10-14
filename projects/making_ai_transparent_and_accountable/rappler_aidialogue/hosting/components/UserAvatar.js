"use client";

import React from "react";

import { Avatar } from "@mui/material";

const UserAvatar = ({ user, sx }) => {
  let imgsrc = user.imgsrc;
  return (
    <Avatar
      alt={user.name}
      src={imgsrc}
      style={{ backgroundColor: user.color ? user.color : "#ccc" }}
      sx={sx}
    />
  );
};

export default UserAvatar;
