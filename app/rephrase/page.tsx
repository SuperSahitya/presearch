"use client";
import FormattedContent from "@/components/FormattedContent";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { Body } from "../api/gemini/route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const Page = () => {
  const componentRef = useRef(null);
  const isFirstRender = useRef(true);
  const [websiteLinks, setWebsiteLinks] = useState<string[]>([]);
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const [error, setError] = useState("");
  const [manner, setManner] = useState("summarised");
  const [loading, setLoading] = useState(false);
  const [tone, setTone] = useState("");
  const [data, setData] = useState("");
  const [searchPrompt, setSearchPrompt] = useState("");
  async function scrapedSearch(searchPrompt: string) {
    try {
      const response = await fetch("/api/rephrase", {
        method: "POST",
        body: JSON.stringify({
          tone,
          manner,
          context: searchPrompt,
        }),
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
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (error) {
      toast({
        variant: "destructive",
        duration: 2000,
        description: error,
      });
    }
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
      if (response.data == "" || !response.data || !response) {
        throw new Error(
          "An error occururd while analysing the video. Please try again"
        );
      }

      console.log(response);
      setData(response.data.replace("/n", "<br>"));
      setWebsiteLinks(response.websites);
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
  const handleTone = (e: string) => {
    console.log(e);
    setTone(e);
  };
  if (session && session.user && session.user.email) {
    return (
      <>
        <main
          ref={componentRef}
          className="bg-zinc-950 w-screen min-h-custom py-7 px-4 flex flex-col justify-start gap-6 items-center max-w-full text-zinc-50"
        >
          <h1 className="text-4xl font-mono font-extrabold">RePhrase</h1>
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
            <Select
              value={tone}
              onValueChange={(e) => handleTone(e)}
              defaultValue="1"
            >
              <SelectTrigger className="w-40 bg-zinc-900 text-zinc-50">
                <SelectValue placeholder="Tone" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 text-zinc-50">
                <SelectGroup>
                  <SelectLabel className="mb-1">Tone</SelectLabel>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="humble" defaultChecked={true}>
                    Humble
                  </SelectItem>
                  <SelectItem value="formal" defaultChecked={true}>
                    Formal
                  </SelectItem>
                  <SelectItem value="optimistic" defaultChecked={true}>
                    Optimistic
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button
              variant={"outline"}
              type="submit"
              className="text-zinc-900 font-bold hover:bg-zinc-300"
            >
              Search
            </Button>
          </form>
          {loading && (
            <div className="flex flex-col justify-center items-center gap-2 w-full mt-10">
              <Skeleton className="max-w-[780px] w-2/3 h-6 bg-zinc-950"></Skeleton>
              <Skeleton className="max-w-[780px] w-11/12 h-6 bg-zinc-800"></Skeleton>
              <Skeleton className="max-w-[780px] w-3/4 h-6 bg-zinc-800"></Skeleton>
              <Skeleton className="max-w-[780px] w-11/12 h-6 bg-zinc-800"></Skeleton>
              <Skeleton className="max-w-[500px] w-3/4 h-6 bg-zinc-800"></Skeleton>
            </div>
          )}
          {data && (
            <>
              <FormattedContent>{data}</FormattedContent>
              {/* <div>
                <div>Context</div>
                {websiteLinks.map((e, idx) => {
                  return <div key={idx}>{e}</div>;
                })}
              </div> */}
            </>
          )}
        </main>
      </>
    );
  } else {
    return (
      <main className="bg-zinc-950 w-screen min-h-screen py-7 px-4 flex flex-col justify-center gap-6 items-center max-w-full text-zinc-50">
        <Button onClick={() => signIn("google")} variant={"default"}>
          Log In
        </Button>
      </main>
    );
  }
};

export default Page;
