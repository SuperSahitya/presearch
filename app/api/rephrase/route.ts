import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

interface Body {
  context: string;
  manner: "detailed" | "summarised";
  tone: "default" | "formal" | "optimistic" | "humble";
}

export async function POST(request: NextRequest) {
  if (!request.body) {
    return NextResponse.json("No request body found", { status: 400 });
  }

  const body: Body = await request.json().catch(() => {
    throw NextResponse.json("Failed to parse JSON body", { status: 400 });
  });

  if (!body.context) {
    return NextResponse.json("Missing 'context' in request body", {
      status: 400,
    });
  }
  if (!body.manner) {
    return NextResponse.json("Missing 'manner' in request body", {
      status: 400,
    });
  }
  if (!body.tone) {
    return NextResponse.json("Missing 'tone' in request body", {
      status: 400,
    });
  }

  const { context, manner, tone } = body;
  console.log(body);

  const responseType = {
    detailed:
      "The response should be highly detailed and you can use points or subtopics to explain each aspect of how to improve the sentence, what are gramaticals errors if any and how to improve the sentence.",
    summarised:
      "The response should be highly summarised, preferably in a single paragraph or phrase and concise.",
  };

  const toneType = {
    formal:
      "The paragraph or phrase should be improved to be formal or give a formal phrase or paragraph conveying similar meaning.",
    optimistic:
      "The paragraph or phrase should be improved to be optimistic or give a optimistic phrase or paragraph conveying similar meaning.",
    humble:
      "The paragraph or phrase should be improved to be humble or give a humble phrase or paragraph conveying similar meaning.",
    default:
      "The paragraph or phrase should be improved with keeping the tone, same as the context given.",
  };

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `You are an expert english professor. Respond by improving the given paragraph or phrase. Firstly give the improved paragraph or phrase and then give explanation for changes you deem necessary. Critically analyse the given paragraph or phrase for grammatical mistakes or other type of mistakes. ${responseType[manner]}. ${toneType[tone]}. Keep the improved paragraph simple to understand.`,
    });

    const responseFromGemini = await model.generateContent(context);

    return NextResponse.json({
      data: responseFromGemini.response.text(),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(error, { status: 500 });
  }
}
