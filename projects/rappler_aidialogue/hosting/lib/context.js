import { createContext, useState, useTransition } from "react";

export const Question_data = createContext();

export const QuestionContext = ({ children }) => {
  const [activeQuestion, setActivequestion] = useState({});

  return (
    <Question_data.Provider value={{ activeQuestion, setActivequestion }}>
      {children}
    </Question_data.Provider>
  );
};

export const User_data = createContext();

export const UserContext = ({ children }) => {
  const [activeUser, setActiveuser] = useState({});

  return (
    <User_data.Provider value={{ activeUser, setActiveuser }}>
      {children}
    </User_data.Provider>
  );
};

export const Drawer_data = createContext();

export const DrawerContext = ({ children }) => {
  const [drawerOpen, setDraweropen] = useState(false);

  return (
    <Drawer_data.Provider value={{ drawerOpen, setDraweropen }}>
      {children}
    </Drawer_data.Provider>
  );
};

export const Transition_data = createContext();

export const TransitionContext = ({ children }) => {
  const [isPending, startTransition] = useTransition({});

  return (
    <Transition_data.Provider value={{ isPending, startTransition }}>
      {children}
    </Transition_data.Provider>
  );
};

export const Session_data = createContext();

export const SessionContext = ({ children }) => {
  const [session, setSession] = useState({});

  return (
    <Session_data.Provider value={{ session, setSession }}>
      {children}
    </Session_data.Provider>
  );
};
