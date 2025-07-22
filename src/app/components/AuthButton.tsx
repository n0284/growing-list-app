"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div>
        <p>ログイン中: {session.user?.email}</p>
        <button
          onClick={() => signOut()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ログアウト
        </button>
      </div>
    );
  } else {
    return (
      <button
        onClick={() => signIn("google")}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Googleでログイン
      </button>
    );
  }
}
