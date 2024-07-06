"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";

const Navbar = () => {
  const { data: session, status } = useSession();
  return (
    <nav className="w-screen h-16 bg-zinc-950 text-zinc-50 flex justify-between px-6 items-center">
      <div className="flex gap-2 px-3 py-2 items-center justify-center hover:bg-zinc-900 text-lg rounded-md">
        {/* <image href={"../public/vercel.svg"} className="h-8 w-8 object-cover"></image> */}
        {/* <Image src={"/next.svg"} width={75} height={20} alt="logo"></Image> */}
        <Link href={"/"} className="font-extrabold text-xl">
          PreSearch
        </Link>
      </div>
      <div>
        <div className="flex items-center justify-center px-2 py-1 gap-2">
          {session && session.user && session.user.email ? (
            <>
              <Button onClick={() => signOut()} className="hover:bg-zinc-800">
                Log Out
              </Button>
              <Button className="hover:bg-zinc-800">
                <Link href={"/profile"}>Profile</Link>
              </Button>
            </>
          ) : (
            <Button
              onClick={() => signIn("google")}
              className="hover:bg-zinc-800"
            >
              Log In
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
