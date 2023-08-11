"use client"
import Link from "next/link"

import useAuth from "@/hooks/useAuth"
import LogoutButton from "@/components/LogoutButton"
import Messages from "@/components/Messages"

export default function Index() {
  const { user } = useAuth()
  const isLoggedIn = !!user

  return (
    <div className="w-full flex flex-col items-center">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm text-foreground">
          <div />
          <div>
            {isLoggedIn && (
              <div className="flex items-center gap-4">
                Hey, {user.email}!
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
              src="https://media.istockphoto.com/id/1173667014/photo/happy-senior-retired-man-looking-talking-to-camera-webcam.jpg?s=612x612&w=0&k=20&c=p_r3UNUGoMh8wdQKIh1f4z80A_8QJDIvqaLHhh_Xy5U="
              alt=""
              className="object-cover object-center h-full w-full rounded"
            />
            <img
              src="https://media.istockphoto.com/id/1189198083/photo/smiling-attractive-young-lady-looking-talking-to-camera-at-home.jpg?s=612x612&w=0&k=20&c=rQv-HePZ9th7bvdpIkK4Sxk3p_Q9LwNId5P2GiqJGc4="
              alt=""
              className="object-cover object-center h-full w-full rounded"
            />
            <div className="absolute bottom-0 right-0 h-24 m-5">
              <img
                src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fas1.ftcdn.net%2Fjpg%2F03%2F66%2F07%2F94%2F220_F_366079479_AHlIEKMaEreWLM3aSTvS2Ff7i816EMiE.jpg&f=1&nofb=1&ipt=d5c26442b00c50c49c2c9eedc9da8ea97e2f1dd9e05d62da5018957296c25940&ipo=images"
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
  )
}
