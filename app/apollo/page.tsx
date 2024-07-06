"use client";
import FormattedContent from "@/components/FormattedContent";
import React, { FormEvent, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { Body } from "../api/gemini/route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Page = () => {
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const [error, setError] = useState("");
  const [manner, setManner] = useState("summarised");
  const [contextFromSites, setContextSize] = useState(1);
  const [data, setData] = useState("");
  const [searchPrompt, setSearchPrompt] = useState("");
  async function scrapedSearch(searchPrompt: string) {
    const response = await fetch("/api/gemini", {
      method: "POST",
      body: JSON.stringify({
        contextFromSites,
        manner,
        searchPrompt: searchPrompt,
      } as Body),
    });
    return await response.json();
  }
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchPrompt == "") {
      toast({ description: "search box is empty.", variant: "default" });
      return;
    }
    console.log("submitted");
    const response = (await scrapedSearch(searchPrompt)) as {
      data: string;
      websites: string[];
    };
    console.log(response);
    setData(response.data.replace("/n", "<br>"));
  };

  const handleManner = (e: string) => {
    console.log(e);
    setManner(e);
  };
  const handleContext = (e: string) => {
    console.log(Number(e));
    setContextSize(Number(e));
  };
  return (
    <>
      <main className="bg-zinc-950 w-screen min-h-screen p-10 flex flex-col justify-start gap-6 items-center">
        <form
          onSubmit={(e) => handleSubmit(e)}
          className="flex flex-row flex-wrap justify-center items-center gap-4 w-screen"
        >
          <Input
            placeholder="Search with Apollo"
            value={searchPrompt}
            type="text"
            className="w-1/3 bg-zinc-900 text-zinc-50 min-w-[350px]"
            onChange={(e) => setSearchPrompt(e.target.value)}
          ></Input>
          <Select
            onValueChange={(e) => handleManner(e)}
            defaultValue="Summarised"
          >
            <SelectTrigger className="w-40 bg-zinc-900 text-zinc-50">
              <SelectValue placeholder="Manner" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 text-zinc-50">
              <SelectItem value="summarised" defaultChecked={true}>
                Summarised
              </SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={(e) => handleContext(e)} defaultValue="1">
            <SelectTrigger className="w-40 bg-zinc-900 text-zinc-50">
              <SelectValue placeholder="Context" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 text-zinc-50">
              <SelectItem value="1">Default</SelectItem>
              <SelectItem value="2" defaultChecked={true}>
                Large
              </SelectItem>
              <SelectItem value="3" defaultChecked={true}>
                Massive
              </SelectItem>
            </SelectContent>
          </Select>
          <Button variant={"outline"} type="submit">
            Search
          </Button>
        </form>
        <FormattedContent>{data}</FormattedContent>
      </main>
    </>
  );
};

export default Page;
