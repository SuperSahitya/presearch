import { NextResponse, type NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import puppeteer from "puppeteer";

interface Body {
  identity: string;
  prompt: string;
  role: string;
}

async function getDataFromGoogle() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://www.google.com");

  await page.setViewport({ width: 1080, height: 1024 });

  // Type the search query
  await page.type("textarea", "puppetter");
  // await page
  //   .locator("input")
  //   .filter((input) => input.value == "Google Search")
  //   .click();

    await page.type('input[name="q"]', "puppeteer");

    // await Promise.all([
    //   page.waitForNavigation(), // Wait for the results page to load
    //   page.press('input[name="q"]', "Enter"), // Press 'Enter' key to submit the search form
    // ]);

  // Submit the search form
  // await Promise.all([
  //   page.waitForNavigation({ timeout: 60000 }), // Wait for the results page to load
  //   searchInput?.press("Enter"), // Press 'Enter' key to submit
  // ]);

  // Extract search results

  // await browser.close();
  const fullTitle = await page.evaluate(async () => {
    return await page.locator("#res");
  });

  //
  //

  // const browser = await puppeteer.launch({ headless: false });
  // const page = await browser.newPage();

  // // Navigate the page to a URL
  // await page.goto("https://developer.chrome.com/");

  // // Set screen size
  // await page.setViewport({ width: 1080, height: 1024 });

  // // Type into search box
  // await page.type(".devsite-search-field", "automate beyond recorder");

  // // Wait and click on first result
  // const searchResultSelector = ".devsite-result-item-link";
  // await page.waitForSelector(searchResultSelector);
  // await page.click(searchResultSelector);

  // // Locate the full title with a unique string
  // const textSelector = await page.waitForSelector(
  //   "text/Customize and automate"
  // );
  // const fullTitle = await textSelector?.evaluate((el) => el.textContent);

  // // Print the full title
  // console.log('The title of this blog post is "%s".', fullTitle);

  // await browser.close();
  // return fullTitle;
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
      systemInstruction: `You are an expert writer.`,
    });

    // const result = await model.generateContent(prompt);
    // const response = await result.response;
    // const text = await response.text(); // Correctly await the text response

    const data = await getDataFromGoogle(); // Await the getDataFromGoogle function
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(error, { status: 500 });
  }
}
