"use client";

import {
  Typography,
  Link,
} from "@mui/material";

const PolicyGuidelinesTerms = () => {
  return (
    <Typography
      variant="body1"
      style={{ textAlign: "center", fontWeight: "bolder" }}
    >
      By joining this forum you are also registering with Rappler and are then
      agreeing to our{" "}
      <Link
        target="_blank"
        href="https://www.rappler.com/about/10941-rappler-privacy-statement/"
      >
        privacy policy
      </Link>
      ,{" "}
      <Link
        target="_blank"
        href="https://www.rappler.com/about/19840-rappler-community-and-site-use-rules/"
      >
        community guidelines
      </Link>
      , and{" "}
      <Link
        target="_blank"
        href="https://www.rappler.com/about/19840-rappler-community-and-site-use-rules/"
      >
        terms of reference
      </Link>
      .
    </Typography>
  );
};

export default PolicyGuidelinesTerms;
