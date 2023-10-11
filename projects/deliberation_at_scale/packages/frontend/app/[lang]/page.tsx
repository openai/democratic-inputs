"use client";
import { useCallback, useEffect } from "react";
import { faUser as profileIcon, faPenToSquare as registerIcon, faHandPointRight as loginIcon } from "@fortawesome/free-regular-svg-icons";
import { motion } from "framer-motion";

import Button from "@/components/Button";
import useProfile from "@/hooks/useProfile";
import { faArrowRightFromBracket, faSpinner, faVideo, faLightbulb, faShieldHeart, faScroll } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { supabaseClient } from '@/state/supabase';
import useLocalizedPush from "@/hooks/useLocalizedPush";

export default function Index() {
    const { push } = useLocalizedPush();
    const { authUser, loading } = useProfile();
    const isLoggedIn = !!authUser;
    const goToRegister = useCallback(() => push('/register'), [push]);
    const goToLogin = useCallback(() => push('/login'), [push]);
    const goToProfile = useCallback(() => push('/profile'), [push]);
    const logout = useCallback(() => supabaseClient.auth.signOut(), []);

    useEffect(() => {
        if (isLoggedIn) {
            goToProfile();
        }
    }, [isLoggedIn, goToProfile]);

    return (
        <section id="main-scroll-container" className="p-2 flex flex-col gap-3 overflow-y-scroll pt-24">
            <motion.div layout>
                <h1 className="mb-4 text-lg font-medium">Experience, Understand and Influence AI</h1>
                <p className="mb-4 text-gray-600">
                    Welcome to our conversation about AI in Eindhoven.<br/><br/>
                    We all want the <b>best for our city</b>. This is why we want to figure how AI can help.
                    We believe it is important that <b>people steer</b> this development.
                    Thank you for being part of this effort!
                </p>
                <p className="mb-4 text-gray-600">Your experience on Common Ground will look like:</p>
                <div className="grid sm:grid-cols-2 sm:grid-rows-2 gap-2 mb-4 text-green-700 text-lg font-medium text-center">
                    <div className="bg-green-50 p-4 py-6 rounded flex flex-col items-center gap-4">
                        <FontAwesomeIcon icon={faVideo} size="2x" fixedWidth />
                        <p><b>Setup your profile</b> via email in one minute</p>
                    </div>
                    <div className="bg-green-50 p-4 py-6 rounded flex flex-col items-center gap-4">
                        <FontAwesomeIcon icon={faScroll} size="2x" fixedWidth />
                        <p><b>Join a conversation</b> with two fellow participants</p>
                    </div>
                    <div className="bg-green-50 p-4 py-6 rounded flex flex-col items-center gap-4">
                        <FontAwesomeIcon icon={faShieldHeart} size="2x" fixedWidth />
                        <p>AI moderators help create a <b>healthy conversation</b></p>
                    </div>
                    <div className="bg-green-50 p-4 py-6 rounded flex flex-col items-center gap-4">
                        <FontAwesomeIcon icon={faLightbulb} size="2x" fixedWidth />
                        <p><b>Learn</b> from eachother and <b>contribute</b> to the 040 AI manifesto</p>
                    </div>
                </div>
                {!isLoggedIn && (
                    <p className="mb-4 text-gray-600">To get started, click the button below:</p>
                )}
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
