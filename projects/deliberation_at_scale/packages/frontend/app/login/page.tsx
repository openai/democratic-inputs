'use client';

import Link from 'next/link';
import { useState } from 'react';

import { supabaseClient } from '@/state/supabase';
import { isEmpty } from 'radash';

export default function Login() {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const sendMagicLink = async () => {
    const formattedEmail = email.trim();

    // guard: skip when email invalid
    if (isEmpty(formattedEmail)) {
      return;
    }

    // guard: skip when already sending
    if (isSending) {
      return;
    }

    setIsSending(true);

    try {
      const result = await supabaseClient.auth.signInWithOtp({
        email,
      });
      const hasError = !!result.error;

      if (hasError) {
        throw new Error(result.error.message);
      }

      setEmail('');
    } catch (error) {
      // TODO: handle errors
    }

    setIsSending(false);
  };

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <Link
        href="/"
        className="absolute left-8 top-8 py-2 px-4 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group text-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>{' '}
        Back
      </Link>

      <form
        className="flex-1 flex flex-col w-full justify-center gap-2 text-foreground"
        onSubmit={(event) => {
          event.preventDefault();
          sendMagicLink();
        }}
      >
        <label className="text-md" htmlFor="email">
          Email
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6 text-foreground"
          name="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
          }}
        />
        <button type="submit" className="bg-btn-background hover:bg-btn-background-hover rounded px-4 py-2 text-foreground mb-2">
          {isSending ? 'Requesting...' : 'Send magic link'}
        </button>
      </form>
    </div>
  )
}
