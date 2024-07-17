import { NextRequest, NextResponse } from "next/server";
import { getSiteData } from "../gemini/route";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface Body {
  url: string;
  manner: "detailed" | "summarised" | "analysis";
}

export async function POST(request: NextRequest) {
  if (!request.body) {
    return NextResponse.json("No request body found", { status: 400 });
  }

  const body: Body = await request.json().catch(() => {
    throw NextResponse.json("Failed to parse JSON body", { status: 400 });
  });

  if (!body.url) {
    return NextResponse.json("Missing 'url' in request body", {
      status: 400,
    });
  }

  if (!body.manner) {
    return NextResponse.json("Missing 'manner' in request body", {
      status: 400,
    });
  }

  const { url, manner } = body;
  console.log(body);

  const responseType = {
    detailed:
      "The response should be highly detailed and you can use points or subtopics to explain each aspect.",
    summarised:
      "The response should be highly summarised, preferably in a single paragraph and concise.",
    analysis:
      "The respone should be a detailed analysis of article for correctness or factual inaccuracies.",
  };

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `You are an expert researcher. Use the context to answer. You can also add your own input if you deem necessary. Donot covey that the context you used are from articles or mention article. You should reply should be highly ${manner}. ${responseType[manner]}`,
    });

    const siteData = await getSiteData(url);

    const responseFromGemini = await model.generateContent(siteData);

    console.log("Gemini API called with the scraped data.");

    return NextResponse.json({
      data: responseFromGemini.response.text(),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(error, { status: 500 });
  }
}
