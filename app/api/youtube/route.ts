import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import { parseString } from "xml2js";

interface Body {
  websiteLink: string;
  manner: "detailed" | "summarised" | "analysis";
}

export async function POST(req: NextRequest) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath: process.env.CHROME_BIN || "/usr/bin/google-chrome",
  });
  const page = await browser.newPage();

  try {
    if (!req.body) {
      return NextResponse.json("No request body found", { status: 400 });
    }

    const body: Body = await req.json().catch(() => {
      throw NextResponse.json("Failed to parse JSON body", { status: 400 });
    });

    if (!body.manner) {
      return NextResponse.json("Missing 'manner' in request body", {
        status: 400,
      });
    }

    if (!body.websiteLink) {
      return NextResponse.json("Missing 'websiteLink' in request body", {
        status: 400,
      });
    }

    const manner = body.manner;
    const link = body.websiteLink;

    await page.goto(link, {
      waitUntil: "networkidle2",
    });

    const html = await page.content();

    await page.waitForSelector("#above-the-fold");
    const title = await page.evaluate(() => {
      const selector = document.querySelector(
        "#above-the-fold h1"
      ) as HTMLElement;
      return selector.innerText;
    });

    console.log(title);

    await page.waitForSelector("#text");
    const creator = await page.evaluate(() => {
      const selector = document.querySelector("#text a") as HTMLElement;
      return selector.innerText;
    });
    console.log(creator);

    const regex =
      /\{"captionTracks":\[(.*,)?(\{"baseUrl":"https:\/\/www\.youtube\.com\/api\/timedtext\?v=.*\}?"),"name":\{"simpleText":"English.*?\}/;
    const captionsJSON = html.match(regex);
    const captionsObject = JSON.parse(
      "[" + captionsJSON![2] + "}".replace(/\\\//g, "/") + "]"
    );

    // console.log(captionsObject[0].baseUrl);

    const caption = await browser.newPage();
    await caption.goto(captionsObject[0].baseUrl);

    const captionText = await caption.evaluate(() => {
      const body = document.querySelector("body");
      return body ? body.innerText : null;
    });

    let parsedCaption;
    const xml = captionText?.replace(
      "This XML file does not appear to have any style information associated with it. The document tree is shown below.\n\n",
      ""
    );
    parseString(xml!, (err, result) => {
      if (err) {
        throw new Error("Error parsing XML: " + err.message);
      }
      parsedCaption = result.transcript.text.map((e: { _: string }) => {
        return e._;
      });
    });

    // console.log(parsedCaption);

    const details = {
      summarised: `give a concise summary about this video titled ${title} from youtube channel ${creator} and keep the content from the video as well. be aware that there may be some spelling mistakes and other stuff.`,
      analysis: `give a very detailed analysis about this video titled ${title} from youtube channel ${creator} and keep the content from the video as well. be aware that there may be some spelling mistakes and other stuff. If you see some factual incorrectness or inaccuracies in the data, please acknowledge it in the response and correct it as well. You can give strengths and weakness like analysis to the video.`,
      detailed: `give a very detailed description about this video titled ${title} from youtube channel ${creator} and keep the content from the video as well. be aware that there may be some spelling mistakes and other stuff.`,
    };

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: details[manner],
    });

    const responseFromGemini = await model.generateContent(parsedCaption!);

    return NextResponse.json({
      url: captionsObject[0].baseUrl,
      caption: parsedCaption!.join(" "),
      summary: responseFromGemini.response.text(),
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error });
  } finally {
    await browser.close();
  }
}
