import React from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";
import PostList from "./PostList";

export default function Home() {
  return (
    <div>
      <Navbar />
      <PostList />
      <Footer />
    </div>
  );
}
