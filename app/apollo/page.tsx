"use client";
import FormattedContent from "@/components/FormattedContent";
import React, { FormEvent, useEffect, useState } from "react";
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
import { SelectGroup, SelectLabel } from "@radix-ui/react-select";
import { Skeleton } from "@/components/ui/skeleton";

const Page = () => {
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const [error, setError] = useState("");
  const [manner, setManner] = useState("summarised");
  const [loading, setLoading] = useState(false);
  const [contextFromSites, setContextSize] = useState(1);
  const [data, setData] = useState("");
  const [searchPrompt, setSearchPrompt] = useState("");
  async function scrapedSearch(searchPrompt: string) {
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        body: JSON.stringify({
          contextFromSites,
          manner,
          searchPrompt: searchPrompt,
        } as Body),
      });
      if (!response.ok) {
        throw new Error("An Error Occured while Fetching Response.");
      }
      return await response.json();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setError(errorMessage);
      console.error(error);
    }
  }
  useEffect(() => {
    toast({
      title: "An Errr Occured",
      variant: "destructive",
      duration: 2000,
      description: error,
    });
  }, [error]);
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      setData("");
      setLoading(true);
      if (searchPrompt == "") {
        toast({
          title: "Searchbox is Empty",
          description: "Please search with a valid string.",
          variant: "default",
          duration: 1500,
        });
        return;
      }
      console.log("submitted");

      const response = (await scrapedSearch(searchPrompt)) as {
        data: string;
        websites: string[];
      };

      console.log(response);
      setData(response.data.replace("/n", "<br>"));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setError(errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
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
      <main className="bg-zinc-950 w-screen min-h-screen py-7 px-4 flex flex-col justify-start gap-6 items-center max-w-full text-zinc-50">
        <h1 className="text-4xl font-mono font-extrabold">Apollo</h1>
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
            defaultValue="summarised"
          >
            <SelectTrigger className="w-40 bg-zinc-900 text-zinc-50">
              <SelectValue placeholder="Manner" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 text-zinc-50">
              <SelectGroup>
                <SelectLabel className="mb-1">Manner</SelectLabel>
                <SelectItem value="summarised" defaultChecked={true}>
                  Summarised
                </SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select onValueChange={(e) => handleContext(e)} defaultValue="1">
            <SelectTrigger className="w-40 bg-zinc-900 text-zinc-50">
              <SelectValue placeholder="Context" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 text-zinc-50">
              <SelectGroup>
                <SelectLabel className="mb-1">Context</SelectLabel>
                <SelectItem value="1">Default</SelectItem>
                <SelectItem value="2" defaultChecked={true}>
                  Large
                </SelectItem>
                <SelectItem value="3" defaultChecked={true}>
                  Massive
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            variant={"outline"}
            type="submit"
            className="text-zinc-900 font-bold"
          >
            Search
          </Button>
        </form>
        {loading ? (
          <div className="flex flex-col justify-center items-center gap-2 w-full mt-10">
            <Skeleton className="max-w-[780px] w-2/3 h-6 bg-zinc-800"></Skeleton>
            <Skeleton className="max-w-[780px] w-11/12 h-6 bg-zinc-800"></Skeleton>
            <Skeleton className="max-w-[780px] w-3/4 h-6 bg-zinc-800"></Skeleton>
            <Skeleton className="max-w-[780px] w-11/12 h-6 bg-zinc-800"></Skeleton>
            <Skeleton className="max-w-[500px] w-3/4 h-6 bg-zinc-800"></Skeleton>
          </div>
        ) : (
          <FormattedContent>{data}</FormattedContent>
        )}
      </main>
    </>
  );
};

export default Page;
