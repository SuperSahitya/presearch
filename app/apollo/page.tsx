"use client";
import FormattedContent from "@/components/FormattedContent";
import React, { FormEvent, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { Body } from "../api/gemini/route";

const Page = () => {
  const { data: session, status } = useSession();
  const [data, setData] = useState("");
  const [searchPrompt, setSearchPrompt] = useState("");
  async function scrapedSearch(searchPrompt: string) {
    const response = await fetch("/api/gemini", {
      method: "POST",
      body: JSON.stringify({
        contextFromSites: 2,
        manner: "detailed",
        searchPrompt: searchPrompt,
      } as Body),
    });
    return await response.json();
  }
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("submitted");
    const response = (await scrapedSearch(searchPrompt)) as {
      data: string;
      websites: string[];
    };
    console.log(response);
    setData(response.data.replace("/n", "<br>"));
  };
  return (
    <>
      <form onSubmit={(e) => handleSubmit(e)}>
        <input
          placeholder="search"
          value={searchPrompt}
          onChange={(e) => setSearchPrompt(e.target.value)}
        ></input>
        <button type="submit">Search</button>
      </form>
      <FormattedContent>{data}</FormattedContent>
    </>
  );
};

export default Page;
