"use client";
import { signIn, useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <>
      <div>Hello</div>
      <button onClick={(e) => signIn("google")}>SignIn</button>
      <div>{session?.user?.email}</div>
    </>
  );
}
