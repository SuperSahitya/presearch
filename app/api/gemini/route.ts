import { NextResponse, type NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import puppeteer from "puppeteer-core";

export interface Body {
  manner: "detailed" | "summarised";
  searchPrompt: string;
  contextFromSites: 1 | 2 | 3;
}

async function getDataFromGoogle(search: string) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath: process.env.CHROME_BIN || "/usr/bin/google-chrome",
  });
  const page = await browser.newPage();
  await page.goto("https://www.google.com");
  page.setDefaultNavigationTimeout(2 * 60 * 1000);

  await page.setViewport({ width: 1080, height: 1024 });

  await page.waitForSelector("textarea");
  await page.type("textarea", search);
  await page.waitForSelector("input");

  await page.keyboard.press("Enter");

  await page.waitForNavigation();

  await page.waitForSelector("#rso a");
  const fullLinks = await page.evaluate(() => {
    const links = Array.from(
      document.querySelectorAll("#rso a")
    ) as HTMLElement[];
    return links.map((link: HTMLElement) => link.getAttribute("href"));
  });

  const requiredLinks = fullLinks
    .filter((e) => e != "")
    .filter((e) => !e?.startsWith("/search"));
  console.log("Websites received from Google");
  await browser.close();
  return requiredLinks;
}

async function getSiteData(url: string) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath: process.env.CHROME_BIN || "/usr/bin/google-chrome",
  });
  const page = await browser.newPage();
  await page.goto(url);
  // page.setDefaultNavigationTimeout(12000);
  await page.setViewport({ width: 1080, height: 1024 });

  // await page.waitForNavigation({ timeout: 12000 });
  await page.waitForSelector("body");
  const data = await page.evaluate(() => {
    return document.querySelector("body")!.innerText;
  });
  console.log("Data scraped from website");
  console.log(url);
  // console.log(data);
  await browser.close();
  return data;
}

export async function POST(request: NextRequest) {
  if (!request.body) {
    return NextResponse.json("No request body found", { status: 400 });
  }

  const body: Body = await request.json().catch(() => {
    throw NextResponse.json("Failed to parse JSON body", { status: 400 });
  });

  if (!body.manner) {
    return NextResponse.json("Missing 'manner' in request body", {
      status: 400,
    });
  }

  if (!body.searchPrompt) {
    return NextResponse.json("Missing 'searchPrompt' in request body", {
      status: 400,
    });
  }

  if (!body.contextFromSites) {
    return NextResponse.json("Missing 'contextFromSites' in request body", {
      status: 400,
    });
  }

  const { searchPrompt, manner, contextFromSites } = body;
  console.log(body);

  const responseType = {
    detailed:
      "The response should be highly detailed and you can use points or subtopics to explain each aspect.",
    summarised:
      "The response should be highly summarised, preferably in a single paragraph and concise.",
  };

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `You are an expert researcher. Use the prompt to answer about ${searchPrompt}. You can also add your own input if you deem necessary. Donot include information unrelated to the ${searchPrompt}. Donot covey that the context you used are from articles or mention article. You should reply should be highly ${manner}. Make sure the response answers about ${searchPrompt}. ${responseType[manner]}`,
    });

    const websiteLinks = await getDataFromGoogle(searchPrompt);
    const contextArray: string[] = [];
    // const scrapedData = await getSiteData(websiteLinks[0]!);
    // const scrapedData2 = await getSiteData(websiteLinks[1]!);

    for (let i = 0; i < contextFromSites; i++) {
      contextArray.push(await getSiteData(websiteLinks[i]!));
    }

    // const responseFromGemini = await model.generateContent([
    //   scrapedData,
    //   scrapedData2,
    // ]);

    const responseFromGemini = await model.generateContent(contextArray);

    // const responseFromGemini = await model.generateContent(
    //   `react compiler`
    // );

    console.log("Gemini API called with the scraped data.");
    // console.log(contextArray);

    return NextResponse.json({
      data: responseFromGemini.response.text(),
      websites: websiteLinks,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(error, { status: 500 });
  }
}
