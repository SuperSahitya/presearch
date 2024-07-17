"use client";
import { Button } from "@/components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <>
      <main className="min-h-custom w-screen bg-zinc-950 text-zinc-50 flex gap-2 flex-col justify-center items-center">
        <h1 className="text-6xl font-extrabold">PreSearch</h1>
        <div className="text-xl font-bold ">
          Everything, &nbsp;Everywhere,&nbsp; All At Once
        </div>
        <div className="w-11/12 bg-zinc-800 rounded-md p-4 flex flex-col justify-center items-center gap-4 mt-4 sm:w-3/4">
          <div className="flex w-full justify-between gap-1 flex-col sm:flex-row">
            <Link href={"/apollo"}>
              <Button className="text-lg w-full hover:bg-zinc-950">
                Apòllo
              </Button>
            </Link>
            <div className="text-base text-zinc-200 font-bold flex justify-center items-center">
              AI Powered Search Engine
            </div>
          </div>
          <div className="flex w-full justify-between flex-col gap-1 sm:flex-row">
            <Link href={"/summery"}>
              <Button className="text-lg w-full hover:bg-zinc-950">
                Summèry
              </Button>
            </Link>
            <div className="text-base text-zinc-200 font-bold flex justify-center items-center">
              Summarise YouTube Videos or Articles
            </div>
          </div>
          <div className="flex w-full justify-between flex-col gap-1 sm:flex-row">
            <Link href={"rephrase"}>
              <Button className="text-lg w-full hover:bg-zinc-950">
                Reṗhrase
              </Button>
            </Link>
            <div className=" text-zinc-200 font-bold flex justify-center items-center">
              Rephrase Paragraphs
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
