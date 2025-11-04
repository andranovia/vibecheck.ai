import { nanoid } from "nanoid";
import axios from "axios";
import { useApiKeysStore, CustomProxy } from "./store";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  mood?: string;
  recommendations?: {
    song?: string;
    quote?: string;
    image?: string;
  };
}

interface ChatOptions {
  model: string;
  temperature?: number;
  maxTokens?: number;
}

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Helper function to parse JSON recommendations from the AI response
export const parseRecommendationsFromResponse = (
  content: string
): { song?: string; quote?: string; image?: string } | null => {
  try {
    // Look for JSON blocks in the content, wrapped in ```json and ```
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);

    if (jsonMatch && jsonMatch[1]) {
      const jsonStr = jsonMatch[1];
      const parsedData = JSON.parse(jsonStr);

      return {
        song: parsedData.song,
        quote: parsedData.quote,
        image: parsedData.moodImage || parsedData.image,
      };
    }
  } catch (error) {
    console.error("Error parsing recommendations JSON:", error);
  }

  return null;
};

// Helper function to remove the JSON block from the content
export const removeJsonBlockFromContent = (content: string): string => {
  // Remove the ```json ... ``` block from the content
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

const callCustomProxy = async (
  proxy: CustomProxy,
  messages: any[],
  options: ChatOptions
) => {
  try {
    // If the proxy has a custom prompt, replace the system message
    if (proxy.customPrompt) {
      // Find and replace the system message if present
      const systemMessageIndex = messages.findIndex(
        (msg) => msg.role === "system"
      );
      if (systemMessageIndex !== -1) {
        messages[systemMessageIndex] = {
          role: "system",
          content: proxy.customPrompt,
        };
      } else {
        // Add a system message if none exists
        messages.unshift({
          role: "system",
          content: proxy.customPrompt,
        });
      }
    }

    const response = await axios.post(
      proxy.endpoint,
      {
        model: proxy.modelName, // Use the specific model name from the config
        messages: messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1000,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: proxy.apiKey ? `Bearer ${proxy.apiKey}` : undefined,
        },
      }
    );

    // Different proxies might have different response formats
    // Here we assume it follows OpenAI format
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(`Error calling custom config ${proxy.configName}:`, error);
    throw error;
  }
};

export const generateResponse = async (
  userMessage: string,
  previousMessages: Message[],
  options: ChatOptions
): Promise<Message> => {
  const detectedMood = detectMood(userMessage);

  const modelId = options.model;

  // Check if it's a custom configuration
  const customConfig = useApiKeysStore
    .getState()
    .customProxies.find((proxy) => proxy.id === modelId);

  // Format messages for API
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
    2. Include song recommendations relevant to their mood 
    3. Include an inspiring quote that matches their emotional state
    
    After your main response, add special recommendations in JSON format wrapped in triple backticks like this:
    
    \`\`\`json
    {
      "song": "Song Name - Artist",
      "quote": "The quote text - Author",
      "moodImage": "Brief description of an image that represents this mood"
    }
    \`\`\`
    
    The app will parse this JSON to display recommendations to the user.`;

  // Add system message
  formattedMessages.unshift({
    role: "system",
    content: systemPrompt,
  });

  try {
    let aiContent;

    if (customConfig) {
      aiContent = await callCustomProxy(
        customConfig,
        formattedMessages,
        options
      );
    } else {
      aiContent = await callOpenRouter(formattedMessages, options);
    }

    // Parse recommendations from the JSON block in the response if available
    const recommendations =
      parseRecommendationsFromResponse(aiContent) ||
      getRecommendationsForMood(detectedMood);

    // Remove the JSON block from the displayed content
    const cleanedContent = removeJsonBlockFromContent(aiContent);

    return {
      id: nanoid(),
      type: "assistant",
      content: cleanedContent,
      timestamp: new Date(),
      mood: detectedMood,
      recommendations: recommendations,
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
