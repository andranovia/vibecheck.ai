import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { nanoid } from 'nanoid';

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

type Suggestion =
  | { type: "music"; title: string; subtitle?: string; link?: string; previewUrl?: string; mood?: string }
  | { type: "quote"; text: string; author?: string }
  | { type: "movie" | "series" | "book"; title: string; note?: string; year?: string; link?: string }
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
    const { userMessage, previousMessages, options, apiKey } = await request.json();

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

    const systemPrompt = `You are VibeCheck AI, an empathetic AI assistant focused on emotional well-being.
    Analyze the user's message to understand their emotional state.
    The detected mood is: ${detectedMood}.
    
    Respond in a supportive, understanding way that acknowledges their feelings.
    Include personalized recommendations that might help enhance or improve their current emotional state.
    Your response should be warm, personal, and insightful.
    
    IMPORTANT FORMATTING INSTRUCTIONS:
    - Use *asterisks* for emphasis (italic text)
    - Use **double asterisks** for strong emphasis (bold text)
    - Use ~~tildes~~ for strikethrough text
    - Use > for blockquotes to highlight important messages
    
    RESPONSE STRUCTURE:
    1. Your main message should focus on empathizing with the user's mood
    2. After your main response, provide 2 personalized suggestions to help them
    
    After your main response, add special recommendations in JSON format wrapped in triple backticks.
    Provide an array of 1-2 suggestions from these types:
    
    - Music suggestion: {"type": "music", "title": "Song Name", "subtitle": "Artist • genre", "link": "spotify/youtube URL", "previewUrl": "optional", "mood": "calm|focus|energetic"}
    - Quote: {"type": "quote", "text": "The quote text", "author": "Author Name"}
    - Action/Exercise: {"type": "action", "label": "Brief activity name", "minutes": 2-5}
    - Movie: {"type": "movie", "title": "Movie Title", "note": "Brief description", "year": "2024", "link": "imdb URL"}
    - Series: {"type": "series", "title": "Series Title", "note": "Brief description", "link": "URL"}
    - Book: {"type": "book", "title": "Book Title", "note": "Brief description", "link": "goodreads URL"}
    
    Example format:
    \`\`\`json
    [
      {
        "type": "music",
        "title": "Lo-fi Breathing Loop",
        "subtitle": "60 BPM • gentle pads",
        "link": "https://open.spotify.com/",
        "mood": "calm"
      },
      {
        "type": "quote",
        "text": "The quieter you become, the more you are able to hear.",
        "author": "Ram Dass"
      }
    ]
    \`\`\`
    
    Choose suggestions that genuinely match the user's emotional state and would be helpful.`;

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

    const aiMessage: Message = {
      id: nanoid(),
      type: "assistant",
      content: cleanedContent,
      timestamp: new Date(),
      mood: detectedMood,
      suggestions: suggestions || undefined,
    };

    return NextResponse.json({ message: aiMessage });
  } catch (error: any) {
    console.error("Error in chat API:", error);
    
    return NextResponse.json(
      { 
        error: error.response?.data?.error?.message || error.message || "Failed to generate response",
        details: error.response?.data 
      },
      { status: error.response?.status || 500 }
    );
  }
}
