import axios from "axios";
import { useApiKeysStore } from "./store";
import { Message } from "./store";

interface ChatOptions {
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export const generateResponse = async (
  userMessage: string,
  previousMessages: Message[],
  options: ChatOptions
): Promise<Message> => {
  try {
    // Get the API key from the store
    const apiKey = useApiKeysStore.getState().openRouterApiKey;

    const response = await axios.post('/api/chat', {
      userMessage,
      previousMessages,
      options,
      apiKey, // Send the user's stored API key
    });

    return response.data.message;
  } catch (error: any) {
    console.error("Error generating response:", error);
    
    // Return a fallback error message
    return {
      id: Date.now().toString(),
      type: "assistant",
      content: error.response?.data?.error || error.message || "I apologize, but I encountered an error while processing your message. Please check your API settings or try again later.",
      timestamp: new Date(),
    };
  }
};
