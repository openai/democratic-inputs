"use client";
import { useCallback } from "react";
import { faUser as profileIcon, faPenToSquare as registerIcon, faHandPointRight as loginIcon } from "@fortawesome/free-regular-svg-icons";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import Button from "@/components/Button";
import useProfile from "@/hooks/useProfile";

export default function Index() {
    const { push } = useRouter();
    const { authUser } = useProfile();
    const isLoggedIn = !!authUser;
    const goToRegister = useCallback(() => push('/register'), [push]);
    const goToLogin = useCallback(() => push('/login'), [push]);
    const goToProfile = useCallback(() => push('/profile'), [push]);

    return (
        <section className="m-4 flex flex-col justify-center gap-3">
            <motion.div layout>
                <h1>Welcome,</h1>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vel ipsum nec odio vestibulum varius. Fusce efficitur, dui id laoreet eleifend, sapien tortor venenatis quam, vel tincidunt metus sapien eget elit. Integer </p>
            </motion.div>
            <motion.div className="flex flex-col gap-2">
                {isLoggedIn ? (
                    <Button icon={profileIcon} onClick={goToProfile}>Go to profile</Button>
                ) : (
                    <>
                        <Button icon={registerIcon} onClick={goToRegister}>Register</Button>
                        <Button icon={loginIcon} onClick={goToLogin}>Login</Button>
                    </>
                )}
            </motion.div>
        </section>
    );
}
