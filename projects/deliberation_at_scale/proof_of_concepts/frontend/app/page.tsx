'use client';
import Link from 'next/link';

import LogoutButton from '@/components/LogoutButton'
import useAuth from '@/hooks/useAuth'
import useMessages from '@/hooks/useMessages';

export default function Index() {
  const { user } = useAuth();
  const { messages } = useMessages();

  return (
    <div className="w-full flex flex-col items-center">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm text-foreground">
          <div />
          <div>
            {user ? (
              <div className="flex items-center gap-4">
                Hey, {user.email}!
                <LogoutButton />
              </div>
            ) : (
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

      <div className="animate-in flex flex-col gap-14 opacity-0 max-w-4xl px-3 py-16 lg:py-24 text-foreground">
        {messages.map((message) => {
          return (
            <div key={message.id}>{message.id}</div>
          );
        })}
      </div>
    </div>
  )
}
