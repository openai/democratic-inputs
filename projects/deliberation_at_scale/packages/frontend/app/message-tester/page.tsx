"use client";
import Link from "next/link";

import useProfile from "@/hooks/useProfile";
import LogoutButton from "@/components/LogoutButton";
import Messages from "@/components/Messages";
import useRoom from "@/hooks/useRoom";

export default function Index() {
    const { user, authUser } = useProfile();
    const room = useRoom();
    const isLoggedIn = !!user && !!authUser;

    return (
        <div className="w-full flex flex-col items-center">
            <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
                <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm text-foreground">
                    <div />
                    <div>
                        {isLoggedIn && (
                            <div className="flex items-center gap-4">
                                Hey, {user?.nick_name} ({authUser?.email})
                                {room ? <p>Current room: {room.id}</p> : ''}
                                <LogoutButton />
                            </div>
                        )}
                        {!isLoggedIn && (
                            <Link
                                href="/login"
                                className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {isLoggedIn && (
                <div className="grid grid-cols-1 grid-rows-2 md:grid-rows-1 md:grid-cols-2">
                    <div className="h-[calc(50dvh-100px)] md:h-[calc(100dvh-110px)] grid gap-4 grid-cols-2 md:grid-rows-2 md:grid-cols-1 m-5 mb-0 md:mr-0 md:mb-5 relative">
                        <img
                            src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fmedia.giphy.com%2Fmedia%2FIhLq8fGZw2SEE%2Fgiphy.gif&f=1&nofb=1&ipt=ccca2c7a9b973e3d349abfcb927b04f84d216d60bcf64579127443e5359181fe&ipo=images"
                            alt=""
                            className="object-cover object-center h-full w-full rounded"
                        />
                        <img
                            src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fmedia1.tenor.com%2Fimages%2F885b334573ef7e48ea15cfbcc127e667%2Ftenor.gif%3Fitemid%3D13886831&f=1&nofb=1&ipt=6115b86a0b05782d6954bf9a405883ed1b9ec00359dcffbe253a36c9d76d5138&ipo=images"
                            alt=""
                            className="object-cover object-center h-full w-full rounded"
                        />
                        <div className="absolute bottom-0 right-0 w-24 md:w-48 m-5">
                            <img
                                src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fs3.amazonaws.com%2Fatiwl%2Fgifs%2F1521918972150-390a2opep2n-8cb695ff7402fbc2a574f8e64b2cace5%2Fblob.gif&f=1&nofb=1&ipt=ffceca88f898f2f3bbe0f790fa783e2720c98e0d31e1309238005259fe4ea64c&ipo=images"
                                alt=""
                                className="object-cover object-center h-full w-full rounded shadow"
                            />
                        </div>
                    </div>
                    <Messages />
                </div>
            )}
            {!isLoggedIn && (
                <div className="py-10 px-4 text-foreground">
                    <h1>Login to start deliberating</h1>
                </div>
            )}
        </div>
    );
}
