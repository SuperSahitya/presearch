"use client";
import FormattedContent from "@/components/FormattedContent";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { signIn, useSession } from "next-auth/react";
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

interface Body {
  websiteLink: string;
  manner: "detailed" | "summarised";
}

const Page = () => {
  const componentRef = useRef(null);
  const isFirstRender = useRef(true);
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const [error, setError] = useState("");
  const [manner, setManner] = useState("summarised");
  const [context, setContext] = useState("youtube");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState("");
  const [title, setTitle] = useState("");
  const [creator, setCreator] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");

  function extractVideoID(url: string) {
    const regex =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|.+\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  async function youtubeScraper(websiteLink: string) {
    try {
      const response = await fetch("/api/youtube", {
        method: "POST",
        body: JSON.stringify({
          manner,
          websiteLink: websiteLink,
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

  async function websiteScraper(websiteLink: string) {
    try {
      const response = await fetch("/api/site", {
        method: "POST",
        body: JSON.stringify({
          manner,
          url: websiteLink,
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
    e.preventDefault();
    setData("");
    setLoading(true);
    if (websiteLink == "") {
      toast({
        title: "Invalid URL",
        description: "Please verify the youtube url.",
        variant: "destructive",
        duration: 1500,
      });
      return;
    }
    console.log("submitted");
    if (websiteLink.startsWith("https://www.youtube.com")) {
      setContext("youtube");
    } else {
      setContext("website");
    }
    const currentContext = websiteLink.startsWith("https://www.youtube.com")
      ? "youtube"
      : "website";
    if (currentContext == "youtube") {
      try {
        const videoID = extractVideoID(websiteLink);
        const videoURL = `https://youtu.be/${videoID}`;

        const response = (await youtubeScraper(videoURL)) as {
          url: string;
          caption: string;
          title: string;
          creator: string;
          summary: string;
        };

        console.log(response);
        if (response.summary == "" || !response.summary || !response) {
          throw new Error(
            "An error occurured while analysing the video. Please try again"
          );
        }
        setData(response.summary.replace("/n", "<br>"));
        setTitle(response.title);
        setCreator(response.creator);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        setError(errorMessage);
        console.error(error);
      } finally {
        setLoading(false);
      }
    } else if (currentContext == "website") {
      try {
        const response = (await websiteScraper(websiteLink)) as {
          data: string;
        };

        console.log(response);
        if (!response) {
          throw new Error(
            "An error occurured while analysing the video. Please try again"
          );
        }
        setData(response.data.replace("/n", "<br>"));
        // setCreator(websiteLink);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        setError(errorMessage);
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleManner = (e: string) => {
    console.log(e);
    setManner(e);
  };
  const handleContext = (e: string) => {
    console.log(e);
    setData("");
    setCreator("");
    setTitle("");
    setContext(e);
  };
  if (session && session.user && session.user.email) {
    return (
      <>
        <main
          ref={componentRef}
          className="bg-zinc-950 w-screen min-h-custom py-7 px-4 flex flex-col justify-start gap-6 items-center max-w-full text-zinc-50"
        >
          <h1 className="text-4xl font-mono font-extrabold">Summry</h1>
          <form
            onSubmit={(e) => handleSubmit(e)}
            className="flex flex-row flex-wrap justify-center items-center gap-4 w-screen"
          >
            <Input
              placeholder="Search with Apollo"
              value={websiteLink}
              type="text"
              className="w-1/3 bg-zinc-900 text-zinc-50 min-w-[350px]"
              onChange={(e) => setWebsiteLink(e.target.value)}
            ></Input>
            <Select
              value={context}
              onValueChange={(e) => handleContext(e)}
              defaultValue="youtube"
            >
              <SelectTrigger className="w-40 bg-zinc-900 text-zinc-50">
                <SelectValue placeholder="Context" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 text-zinc-50">
                <SelectGroup>
                  <SelectLabel className="mb-1">Context</SelectLabel>
                  <SelectItem value="youtube" defaultChecked={true}>
                    Youtube
                  </SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
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
                  <SelectItem value="analysis">Analysis</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button
              variant={"outline"}
              type="submit"
              className="text-zinc-900 font-bold hover:bg-zinc-300"
            >
              Summarise
            </Button>
          </form>
          {context == "youtube" && loading && (
            <div className="flex flex-col justify-center items-center gap-2 w-full mt-10">
              <Skeleton className="max-w-[700px] w-3/4 h-6 bg-zinc-800"></Skeleton>
              <Skeleton className="max-w-[600px] w-2/3 h-6 bg-zinc-800"></Skeleton>
              <Skeleton className="sm:w-[50vw] aspect-video w-[80vw] max-w-[500px] mb-8 mt-8"></Skeleton>
              <Skeleton className="max-w-[780px] w-3/4 h-6 bg-zinc-800"></Skeleton>
              <Skeleton className="max-w-[700px] w-2/3 h-6 bg-zinc-800"></Skeleton>
            </div>
          )}
          {context == "website" && loading && (
            <div className="flex flex-col justify-center items-center gap-2 w-full mt-10">
              <Skeleton className="max-w-[780px] w-3/4 h-6 bg-zinc-800"></Skeleton>
              <Skeleton className="max-w-[700px] w-2/3 h-6 bg-zinc-800"></Skeleton>
            </div>
          )}
          {context == "youtube" && data && (
            <>
              <div className="mt-10">
                <div className="text-xl font-bold">{title}</div>
                <div className="text-lg">{`By ${creator}`}</div>
              </div>
              <iframe
                src={`https://www.youtube.com/embed/${extractVideoID(
                  websiteLink
                )}`}
                className="sm:w-[50vw] aspect-video w-[80vw] max-w-[500px]"
              ></iframe>
              <FormattedContent>{data}</FormattedContent>
            </>
          )}
          {context == "website" && data && (
            <>
              <FormattedContent>{data}</FormattedContent>
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
