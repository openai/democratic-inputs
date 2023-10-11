"use client";
import { useCallback } from "react";
import { faUser as profileIcon, faPenToSquare as registerIcon, faHandPointRight as loginIcon } from "@fortawesome/free-regular-svg-icons";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import Button from "@/components/Button";
import useProfile from "@/hooks/useProfile";
import { faArrowRightFromBracket, faSpinner, faVideo, faLightbulb, faShieldHeart, faScroll } from '@fortawesome/free-solid-svg-icons';
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
        <section id="main-scroll-container" className="p-2 md:p-4 flex flex-col gap-3 overflow-y-scroll pt-24">
            <motion.div layout>
                <h1 className="mb-4 text-lg font-medium">Welcome to Eindhoven&apos;s deliberation about personalisation of AI assistants.</h1>
                <p className="mb-4 text-gray-600">The development of artificial intelligence affects all of us. We believe it is important that this development is steered by the will of the people. You will contribute to this via this deliberation. Thank you for being part of this!</p>
                <p className="mb-4 text-gray-600">Here&apos;s what you can expect:</p>
                <div className="grid sm:grid-cols-2 sm:grid-rows-2 gap-2 mb-4 text-green-700 text-lg font-medium text-center">
                    <div className="bg-green-50 p-4 py-6 rounded flex flex-col items-center gap-4">
                        <FontAwesomeIcon icon={faVideo} size="2x" fixedWidth />
                        <p><b>Setup your profile</b> via email in one minute</p>
                    </div>
                    <div className="bg-green-50 p-4 py-6 rounded flex flex-col items-center gap-4">
                        <FontAwesomeIcon icon={faScroll} size="2x" fixedWidth />
                        <p><b>Join a room</b> with two others, and deliberate on provided statements or create your own</p>
                    </div>
                    <div className="bg-green-50 p-4 py-6 rounded flex flex-col items-center gap-4">
                        <FontAwesomeIcon icon={faShieldHeart} size="2x" fixedWidth />
                        <p>AI moderators help creating a <b>healthy deliberation environment</b></p>
                    </div>
                    <div className="bg-green-50 p-4 py-6 rounded flex flex-col items-center gap-4">
                        <FontAwesomeIcon icon={faLightbulb} size="2x" fixedWidth />
                        <p><b>Contribute</b> to a large body of agreement, and <b>learn</b> from the perspective of others</p>
                    </div>
                </div>
                <p className="mb-4 text-gray-600">When you are ready to find common ground, please click Register below. You will be guided through your profile setup, this should only take about 1 minute. When this registration is completed, you will be guided to a room to start the deliberation.</p>
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
