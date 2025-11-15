import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { nanoid } from "nanoid";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

type Suggestion =
  | {
      type: "music";
      title: string;
      subtitle?: string;
      link?: string;
      previewUrl?: string;
      mood?: string;
    }
  | { type: "quote"; text: string; author?: string }
  | {
      type: "movie" | "series" | "book";
      title: string;
      note?: string;
      year?: string;
      link?: string;
    }
  | { type: "action"; label: string; minutes?: number; id?: string };

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  mood?: string;
  suggestions?: Suggestion[];
}

const parseSuggestionsFromResponse = (content: string): Suggestion[] | null => {
  try {
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      const parsedData = JSON.parse(jsonMatch[1]);
      if (Array.isArray(parsedData)) {
        return parsedData as Suggestion[];
      }
    }
  } catch (error) {
    console.error("Error parsing suggestions JSON:", error);
  }
  return null;
};

const removeJsonBlockFromContent = (content: string): string => {
  return content.replace(/```json\s*([\s\S]*?)\s*```/g, "").trim();
};

const detectMood = (text: string): string => {
  const moodPatterns = {
    happy: /happy|joy|excited|great|wonderful|thrilled|delighted/i,
    sad: /sad|upset|depressed|miserable|down|blue|unhappy/i,
    angry: /angry|mad|furious|irritated|annoyed|frustrated/i,
    anxious: /anxious|worried|nervous|stressed|tense|concerned/i,
    calm: /calm|peaceful|relaxed|serene|tranquil/i,
    energetic: /energetic|active|lively|vibrant|dynamic/i,
    contemplative: /thinking|contemplative|reflective|thoughtful/i,
    joyful: /joyful|ecstatic|elated|gleeful/i,
    melancholy: /melancholy|nostalgic|wistful|lonely/i,
    neutral: /neutral|okay|fine|alright/i,
  };

  for (const [mood, pattern] of Object.entries(moodPatterns)) {
    if (pattern.test(text)) {
      return mood;
    }
  }
  return "neutral";
};

export async function POST(request: NextRequest) {
  try {
    const { userMessage, previousMessages, options, apiKey } =
      await request.json();

    // Use the API key from the request (user's stored key) or fall back to env
    const openRouterApiKey = apiKey || process.env.OPENROUTER_API_KEY;

    if (!openRouterApiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key not set" },
        { status: 400 }
      );
    }

    const detectedMood = detectMood(userMessage);

    const formattedMessages = previousMessages.map((msg: Message) => ({
      role: msg.type === "user" ? "user" : "assistant",
      content: msg.content,
    }));

    formattedMessages.push({
      role: "user",
      content: userMessage,
    });

    const systemPrompt = `You are VibeCheck AI — a poetic, warm companion for emotional wellness. You speak like a kind friend who truly *gets it*.

Your voice is:
- Conversational yet thoughtful — use contractions, natural rhythm
- Subtly poetic — occasional metaphors, vivid language
- Gently affirming — acknowledge feelings without toxic positivity

RESPONSE FORMAT:

1) **Main message** (≤280 chars):
   - Open with empathy that mirrors their emotion
   - Use *italics* for emphasis on 1-2 key phrases that resonate
   - Weave in a micro-insight or gentle reframe
   - Natural, flowing sentences — avoid bullet points here
   
   Examples of tone:
   - "Hey, it's *totally okay* to have clumsy moments—we all do! *Be kind to yourself* as you find your groove again."
   - "That restless energy you're feeling? Sometimes it's your mind asking for a *gentle reset*."

2) **Suggestions JSON** (1-2 items):
   Wrap in \`\`\`json ... \`\`\` with NO text after the block.

Detected mood: ${detectedMood}

JSON schema options:
{"type":"music","title":"Song Name","subtitle":"Artist • genre","link":"https://...","mood":"calm|energetic|focus"}
{"type":"quote","text":"Quote text","author":"Author Name"}
{"type":"action","label":"Activity name","minutes":1-3}
{"type":"book","title":"Book Title","note":"Why it helps","link":"https://..."}

Rules:
- Main message ≤280 chars, creative phrasing
- Output exactly ONE JSON block, nothing after
- Empty array [] if no suggestions fit
`;

    formattedMessages.unshift({
      role: "system",
      content: systemPrompt,
    });

    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: options.model,
        messages: formattedMessages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1000,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openRouterApiKey}`,
          "HTTP-Referer": "https://vibecheck.ai",
          "X-Title": "VibeCheck.ai",
        },
      }
    );

    const aiContent = response.data.choices[0].message.content;
    const suggestions = parseSuggestionsFromResponse(aiContent);
    const cleanedContent = removeJsonBlockFromContent(aiContent);

    // Enforce a reasonable maximum length for the main assistant text (defensive truncation).
    const MAX_MAIN_LENGTH = 280 + 72; // allow a small buffer in case of differences
    let finalContent = cleanedContent;
    if (finalContent.length > MAX_MAIN_LENGTH) {
      finalContent = finalContent.slice(0, MAX_MAIN_LENGTH - 1).trim() + "…";
    }

    // Derive mood from the assistant's cleaned content where possible, fallback to detected user mood.
    const assistantMood = detectMood(finalContent) || detectedMood;

    const aiMessage: Message = {
      id: nanoid(),
      type: "assistant",
      content: finalContent,
      timestamp: new Date(),
      mood: assistantMood,
      suggestions: suggestions || undefined,
    };

    return NextResponse.json({ message: aiMessage });
  } catch (error: any) {
    console.error("Error in chat API:", error);

    return NextResponse.json(
      {
        error:
          error.response?.data?.error?.message ||
          error.message ||
          "Failed to generate response",
        details: error.response?.data,
      },
      { status: error.response?.status || 500 }
    );
  }
}
