import React from "react";
import {ChakraProvider} from "@chakra-ui/react";
import "./App.css";
import {RouterProvider} from "react-router-dom";
import {router} from "./lib/routes";
function App() {
  return (
    <ChakraProvider>
      <RouterProvider router={router} />
    </ChakraProvider>
  );
}

export default App;
