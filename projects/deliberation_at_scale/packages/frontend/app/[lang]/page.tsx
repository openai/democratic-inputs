"use client";
import { useCallback } from "react";
import { faUser as profileIcon, faPenToSquare as registerIcon, faHandPointRight as loginIcon } from "@fortawesome/free-regular-svg-icons";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import Button from "@/components/Button";
import useProfile from "@/hooks/useProfile";
import { faArrowRightFromBracket, faRotate, faSpinner, faVideo, faMessage, faHandshake } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { supabaseClient } from '@/state/supabase';

export default function Index() {
    const { push } = useRouter();
    const { authUser, loading } = useProfile();
    const isLoggedIn = !!authUser;
    const goToRegister = useCallback(() => push('/register'), [push]);
    const goToLogin = useCallback(() => push('/login'), [push]);
    const goToProfile = useCallback(() => push('/profile'), [push]);
    const logout = useCallback(() => supabaseClient.auth.signOut(), []);

    return (
        <section className="p-4 flex flex-col gap-3 overflow-y-scroll pt-24">
            <motion.div layout>
                <h1 className="mb-4 text-lg font-medium">Welcome to Deliberation at Scale</h1>
                <p className="mb-4 text-gray-600">The development of artificial intelligence (AI) affects all of us. With Deliberation at Scale, we want to ensure that guidelines and rules that will come to guide artifical intelligence development are <span className="font-semibold">well-sourced</span>, <span className="font-semibold">representative</span> and <span className="font-semibold">fair</span>.</p>
                <p className="mb-4 text-gray-600">In Deliberation at Scale you will:</p>
                <div className="grid grid-cols-2 grid-rows-2 gap-2 mb-4 hyphens-auto text-green-700 text-lg font-medium text-center">
                    <div className="bg-green-50 p-4 py-6 rounded flex flex-col items-center gap-4">
                        <FontAwesomeIcon icon={faVideo} size="2x" fixedWidth />
                        <span>Meet two other participants in a video call</span>
                    </div>
                    <div className="bg-green-50 p-4 py-6 rounded flex flex-col items-center gap-4">
                        <FontAwesomeIcon icon={faMessage} size="2x" fixedWidth />
                        <span>Discuss topics surrounding AI governance</span>
                    </div>
                    <div className="bg-green-50 p-4 py-6 rounded flex flex-col items-center gap-4">
                        <FontAwesomeIcon icon={faHandshake} size="2x" fixedWidth />
                        <span>Agree on statements capturing a topic</span>
                    </div>
                    <div className="bg-green-50 p-4 py-6 rounded flex flex-col items-center gap-4">
                        <FontAwesomeIcon icon={faRotate} size="2x" fixedWidth />
                        <span>Contribute to a large body of agreement</span>
                    </div>
                </div>
                <p className="mb-4 text-gray-600">Are you ready to help create guidelines for the next generation of artificial intelligence?</p>
            </motion.div>
            <motion.div className="flex flex-col gap-2">
                {loading ? (
                    <FontAwesomeIcon icon={faSpinner} spin className="text-gray-400" />
                ) : (
                    isLoggedIn ? (
                        <>
                            <Button icon={profileIcon} onClick={goToProfile}>Go to profile</Button>
                            <Button icon={faArrowRightFromBracket} onClick={logout}>Log out</Button>
                        </>
                    ) : (
                        <>
                            <Button icon={registerIcon} onClick={goToRegister}>Register</Button>
                            <Button icon={loginIcon} onClick={goToLogin}>Login</Button>
                        </>
                    )
                )}
            </motion.div>
        </section>
    );
}
