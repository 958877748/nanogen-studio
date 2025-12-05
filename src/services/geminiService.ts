import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
// We use process.env.GEMINI_API_KEY as strictly required.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// The specific model requested: "nano banana" or "gemini flash image"
// Mapped to 'gemini-2.5-flash-image' as per instructions.
const MODEL_NAME = 'gemini-2.5-flash-image';

export const generateImage = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [{ text: prompt }]
      },
    });

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const editImage = async (prompt: string, imageBase64: string): Promise<string | null> => {
  try {
    const cleanBase64 = imageBase64.split(',')[1] || imageBase64;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: cleanBase64
            }
          },
          { text: prompt }
        ]
      },
    });

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateOrEditImage = async (
  prompt: string,
  imageBase64?: string
): Promise<{ image: string | null; text: string | null }> => {
  try {
    const parts: any[] = [];

    // If we have an input image, this is an edit task
    if (imageBase64) {
      // Clean the base64 string if it contains the data header
      const cleanBase64 = imageBase64.split(',')[1] || imageBase64;
      
      parts.push({
        inlineData: {
          mimeType: 'image/png', // We assume PNG or convert to it before sending if possible, but generic works often
          data: cleanBase64
        }
      });
    }

    // Add the text prompt
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: parts
      },
      // Do not set responseMimeType or responseSchema for image generation models
    });

    // Parse the response to find image and text
    let outputImage: string | null = null;
    let outputText: string | null = null;

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          outputImage = `data:image/png;base64,${part.inlineData.data}`;
        } else if (part.text) {
          outputText = part.text;
        }
      }
    }

    return { image: outputImage, text: outputText };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
