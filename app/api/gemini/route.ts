import { NextResponse, type NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import puppeteer from "puppeteer";

interface Body {
  identity: string;
  prompt: string;
  role: string;
}

async function getDataFromGoogle() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("https://www.google.com");
  page.setDefaultNavigationTimeout(2 * 60 * 1000);

  await page.setViewport({ width: 1080, height: 1024 });

  await page.waitForSelector("textarea");
  await page.type("textarea", "react compiler");
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
  console.log("requiredLinks");
  await browser.close();
  return requiredLinks;
}

async function getSiteData(url: string) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url);
  // page.setDefaultNavigationTimeout(12000);
  await page.setViewport({ width: 1080, height: 1024 });

  // await page.waitForNavigation({ timeout: 12000 });
  await page.waitForSelector("body");
  const data = await page.evaluate(() => {
    return document.querySelector("body")!.innerText;
  });
  console.log("data");
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

  if (!body.identity) {
    return NextResponse.json("Missing 'identity' in request body", {
      status: 400,
    });
  }

  if (!body.prompt) {
    return NextResponse.json("Missing 'prompt' in request body", {
      status: 400,
    });
  }

  if (!body.role) {
    return NextResponse.json("Missing 'role' in request body", { status: 400 });
  }

  const { prompt, identity, role } = body;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `You are an expert researcher.You should reply in concise and correct manner and produce great summary if necessary.`,
    });

    const data = await getDataFromGoogle();
    const myPrompt = await getSiteData(data[0]!);

    const responseFromGemini = await model.generateContent(
      `give me a great summary of this topic from context in a single paragraph, which is concise and doesn't loose too much valuable data. ${myPrompt}`
    );
    // const responseFromGemini = await model.generateContent(
    //   `react compiler`
    // );

    console.log("function called")

    return NextResponse.json({ data: responseFromGemini.response.text() });
  } catch (error) {
    console.error(error);
    return NextResponse.json(error, { status: 500 });
  }
}