"use client";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { authOptions } from "./api/auth/[...nextauth]/route";

export default function Home() {
  const { data, status } = useSession();
  return (
    <>
      <div>Hello</div>
      <button onClick={(e) => signIn("google")}>SignIn</button>
      <div>{data?.user?.email}</div>
    </>
  );
}
