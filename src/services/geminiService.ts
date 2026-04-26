import { GoogleGenAI, GenerateContentResponse, ThinkingLevel, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface MessagePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface Message {
  role: 'user' | 'model';
  parts: MessagePart[];
}

export async function* streamChat(history: Message[], userInput: string, imageData?: { mimeType: string, data: string }, language: string = 'English') {
  try {
    const userParts: MessagePart[] = [{ text: userInput }];
    if (imageData) {
      userParts.push({ inlineData: imageData });
    }

    const contents = [
      ...history,
      { role: 'user', parts: userParts }
    ];

    const streamResponse = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: {
        systemInstruction: `You are Zoya, a sophisticated and highly capable AI personal assistant. Your personality is professional, precise, and tech-forward. You provide concise, accurate information and excel at complex reasoning. You have access to note-taking and calendar tools. Format your responses with clear structure, using markdown when helpful. If an image is provided, analyze it thoroughly and answer questions related to it. ALWAYS RESPOND IN THE LANGUAGE: ${language}`,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        temperature: 0.7,
      },
    });

    for await (const chunk of streamResponse) {
      const c = chunk as GenerateContentResponse;
      yield c.text || "";
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    yield "I encountered an error processing your request. Please check your connection.";
  }
}

export async function textToSpeech(text: string, voiceName: string = 'Kore'): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Say this precisely: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
}

export async function suggestCategory(content: string): Promise<string> {
  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: 'user', parts: [{ text: `Based on the following note content, suggest a single, concise category name (e.g., Work, Personal, Ideas, Finance, Travel). Output ONLY the category name.\n\nContent: ${content}` }] }],
      config: {
        temperature: 0.3,
      }
    });
    return result.text.trim();
  } catch (error) {
    console.error("Category suggestion error:", error);
    return "General";
  }
}
