import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
import {createBrowserRouter} from "react-router-dom";
import Home from "../components/layout";
import CurrentPost from "../components/layout/CurrentPost";
import SubmitProject from "../components/layout/SubmitProject";

export const ROOT = "/";
export const LOGIN = "/login";
export const REGISTER = "/register";
export const SUBMITPROJECT = "/submit-project"

export const router = createBrowserRouter([
  {path: ROOT, element: <Home />},
  {path: LOGIN, element: <Login />},
  {path: REGISTER, element: <Register />},
  {path: SUBMITPROJECT, element: <SubmitProject />},
  {path: "/posts/:postId", element: <CurrentPost />},
]);
