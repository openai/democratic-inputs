'use client';
import Link from 'next/link';

import useAuth from '@/hooks/useAuth'
import LogoutButton from '@/components/LogoutButton'
import Messages from '@/components/Messages';

export default function Index() {
  const { user } = useAuth();
  const isLoggedIn = !!user;

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
              <Link href="/login" className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover">
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {isLoggedIn && (
        <Messages />
      )}
      {!isLoggedIn && (
        <div className="py-10 px-4 text-foreground">
          <h1>Login to start deliberating</h1>
        </div>
      )}
    </div>
  );
}
