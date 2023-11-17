import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
} from "firebase/auth";
import { useAuthState, useSignOut } from "react-firebase-hooks/auth";
import { auth, db } from "../lib/firebase";
import { useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { LOGIN, ROOT } from "../lib/routes";
import isUsernameExists from "../utils/isUsernameExists";


// This code is for fatching User data
// export function useAuth() {
//     const [authUser, authLoading, error] = useAuthState(auth);
//     const [isLoading, setLoading] = useState(true);
//     const [user, setUser] = useState(null);


//     useEffect(() => {
//         async function fetchData() {
//             setLoading(true);
//             const ref = doc(db, "users", authUser.uid);
//             const docSnap = await getDoc(ref);
//             setUser(docSnap.data());
//             setLoading(false);
//         }

//         if (!authLoading) {
//             if (authUser) fetchData();
//             else setLoading(false); // Not signed in
//         }
//     }, [authLoading]);

//     return { user, isLoading, error };
// }

// This code is for Login functionlity
// export function useLogin() {
//     const [isLoading, setLoading] = useState(false);
//     const toast = useToast();
//     const navigate = useNavigate();

//     // async function login({ email, password, redirectTo = ROOT }) {
//     //     setLoading(true);

//     //     // try {
//     //     //     await signInWithEmailAndPassword(auth, email, password);
//     //     //     toast({
//     //     //         title: "You are logged in",
//     //     //         status: "success",
//     //     //         isClosable: true,
//     //     //         position: "top",
//     //     //         duration: 5000,
//     //     //     });
//     //     //     navigate(redirectTo);
//     //     // } catch (error) {
//     //     //     toast({
//     //     //         title: "Logging in failed",
//     //     //         description: error.message,
//     //     //         status: "error",
//     //     //         isClosable: true,
//     //     //         position: "top",
//     //     //         duration: 5000,
//     //     //     });
//     //     //     setLoading(false);
//     //     // } finally {
//     //     //     setLoading(false);
//     //     // }
//     // }

//     return { login, isLoading };
// }

// This code is for logout functionlity 
// export function useLogout() {
//     const [signOut, isLoading, error] = useSignOut(auth);
//     const toast = useToast();
//     const navigate = useNavigate();

//     async function logout() {
//         // if (await signOut()) {
//         //     toast({
//         //         title: "Successfully logged out",
//         //         status: "success",
//         //         isClosable: true,
//         //         position: "top",
//         //         duration: 5000,
//         //     });
//         //     navigate(LOGIN);
//         // }
//         // else {
//         //     toast({
//         //         title: "Having difficulty to logging out of you ",
//         //         status: "warning",
//         //         isClosable: true,
//         //         position: "bottom-left",
//         //         duration: 5000,
//         //     });
//     }

//     return { logout, isLoading };
// }

// This code is for user register functionlity
// export function useRegister() {
//     const [isLoading, setLoading] = useState(false);
//     const toast = useToast();
//     const navigate = useNavigate();

//     async function register({
//         username,
//         email,
//         organisation,
//         country,
//         gender,
//         password,
//         redirectTo = DASHBOARD,
//     }) {
//         setLoading(true);

//         // const usernameExists = await isUsernameExists(username);

//         // if (usernameExists) {
//         //     toast({
//         //         title: "Username already exists",
//         //         status: "error",
//         //         isClosable: true,
//         //         position: "top",
//         //         duration: 5000,
//         //     });
//         //     setLoading(false);
//         // } else {
//         //     try {
//         //         const res = await createUserWithEmailAndPassword(auth, email, password, organisation, country, gender);

//         //         await setDoc(doc(db, "users", res.user.uid), {
//         //             id: res.user.uid,
//         //             username: username.toLowerCase(),
//         //             avatar: "",
//         //             date: Date.now(),
//         //         });

//         //         toast({
//         //             title: "Account created",
//         //             description: "You are logged in",
//         //             status: "success",
//         //             isClosable: true,
//         //             position: "top",
//         //             duration: 5000,
//         //         });

//         //         navigate(redirectTo);
//         //     } catch (error) {
//         //         toast({
//         //             title: "Signing Up failed",
//         //             description: error.message,
//         //             status: "error",
//         //             isClosable: true,
//         //             position: "top",
//         //             duration: 5000,
//         //         });
//         //     } finally {
//         //         setLoading(false);
//         //     }
//         // }
//     }

//     return { register, isLoading };
// }
