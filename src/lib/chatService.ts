import { nanoid } from "nanoid";
import axios from "axios";
import { useApiKeysStore } from "./store";

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

interface ChatOptions {
  model: string;
  temperature?: number;
  maxTokens?: number;
}

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export const parseSuggestionsFromResponse = (
  content: string
): Suggestion[] | null => {
  try {
    // Look for JSON blocks in the content, wrapped in ```json and ```
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);

    if (jsonMatch && jsonMatch[1]) {
      const jsonStr = jsonMatch[1];
      const parsedData = JSON.parse(jsonStr);

      // Ensure it's an array
      if (Array.isArray(parsedData)) {
        return parsedData as Suggestion[];
      }
    }
  } catch (error) {
    console.error("Error parsing suggestions JSON:", error);
  }

  return null;
};

export const removeJsonBlockFromContent = (content: string): string => {
  return content.replace(/```json\s*([\s\S]*?)\s*```/g, "").trim();
};

export const detectMood = (text: string): string => {
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

export const getRecommendationsForMood = (mood: string) => {
  const recommendations = {
    happy: {
      song: "Pharrell Williams - Happy",
      quote:
        "Happiness is not something ready-made. It comes from your own actions. - Dalai Lama",
      image: "Sunny beach with colorful umbrellas",
    },
    sad: {
      song: "Adele - Someone Like You",
      quote:
        "The word 'happy' would lose its meaning if it were not balanced by sadness. - Carl Jung",
      image: "Rainy day window view",
    },
    angry: {
      song: "Rage Against the Machine - Killing in the Name",
      quote:
        "For every minute you remain angry, you give up sixty seconds of peace of mind. - Ralph Waldo Emerson",
      image: "Stormy ocean waves crashing",
    },
    anxious: {
      song: "Weightless by Marconi Union",
      quote:
        "Anxiety's like a rocking chair. It gives you something to do, but it doesn't get you very far. - Jodi Picoult",
      image: "Secluded forest path",
    },
    calm: {
      song: "Ludovico Einaudi - Nuvole Bianche",
      quote: "Peace comes from within. Do not seek it without. - Buddha",
      image: "Misty morning lake with gentle ripples",
    },
    energetic: {
      song: "Daft Punk - One More Time",
      quote: "Energy and persistence conquer all things. - Benjamin Franklin",
      image: "Vibrant city lights at night",
    },
    contemplative: {
      song: "Max Richter - On The Nature of Daylight",
      quote: "The unexamined life is not worth living. - Socrates",
      image: "Ancient library with golden sunlight",
    },
    joyful: {
      song: "Pharrell Williams - Happy",
      quote: "Joy is not in things; it is in us. - Richard Wagner",
      image: "Field of sunflowers under blue sky",
    },
    melancholy: {
      song: "Radiohead - No Surprises",
      quote:
        "Even a happy life cannot be without a measure of darkness. - Carl Jung",
      image: "Autumn leaves falling in an empty park",
    },
    neutral: {
      song: "Jack Johnson - Upside Down",
      quote: "The middle path is the way to wisdom. - Rumi",
      image: "Balanced stones on a peaceful shoreline",
    },
  };

  return (
    recommendations[mood as keyof typeof recommendations] ||
    recommendations.neutral
  );
};

const formatMessagesForOpenRouter = (messages: Message[]) => {
  return messages.map((message) => ({
    role: message.type === "user" ? "user" : "assistant",
    content: message.content,
  }));
};

const callOpenRouter = async (messages: any[], options: ChatOptions) => {
  const apiKey = useApiKeysStore.getState().openRouterApiKey;

  if (!apiKey) {
    throw new Error("OpenRouter API key not set");
  }

  try {
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: options.model,
        messages: messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1000,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://vibecheck.ai",
          "X-Title": "VibeCheck.ai",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenRouter:", error);
    throw error;
  }
};

export const generateResponse = async (
  userMessage: string,
  previousMessages: Message[],
  options: ChatOptions
): Promise<Message> => {
  const detectedMood = detectMood(userMessage);

  const formattedMessages = formatMessagesForOpenRouter([
    ...previousMessages,
    {
      id: nanoid(),
      type: "user",
      content: userMessage,
      timestamp: new Date(),
    },
  ]);

  let systemPrompt = "";

  systemPrompt = `You are VibeCheck AI, an empathetic AI assistant focused on emotional well-being.
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

  try {
    let aiContent;

    aiContent = await callOpenRouter(formattedMessages, options);

    // Parse suggestions from the AI response
    const suggestions = parseSuggestionsFromResponse(aiContent);

    // Remove the JSON block from the displayed content
    const cleanedContent = removeJsonBlockFromContent(aiContent);

    return {
      id: nanoid(),
      type: "assistant",
      content: cleanedContent,
      timestamp: new Date(),
      mood: detectedMood,
      suggestions: suggestions || undefined,
    };
  } catch (error) {
    console.error("Error generating response:", error);

    // Return a fallback response
    return {
      id: nanoid(),
      type: "assistant",
      content:
        "I apologize, but I encountered an error while processing your message. Please check your API settings or try again later.",
      timestamp: new Date(),
    };
  }
};
