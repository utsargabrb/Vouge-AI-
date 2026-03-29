import { GoogleGenAI, Modality } from "@google/genai";
import { ModelSettings } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to clean base64 string
const cleanBase64 = (data: string) => {
  return data.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
};

// 1. Virtual Try-On / Editing (Nano Banana)
// Uses gemini-2.5-flash-image to transform input image (cloth) based on prompt
export const generateTryOn = async (
  clothBase64: string,
  settings: ModelSettings
): Promise<string> => {
  try {
    const model = "gemini-2.5-flash-image";
    const prompt = `
      Generate a high-fashion, photorealistic full-body photograph of a ${settings.gender} model.
      Model attributes: Body size ${settings.size}, ${settings.ethnicity} ethnicity.
      The model MUST be wearing the clothing item depicted in the input image.
      Setting/Vibe: ${settings.vibe || "Clean studio background, professional lighting"}.
      Ensure the clothing texture, details, and fit are preserved and realistically draped on the model.
      High resolution, 8k, fashion magazine quality.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/png",
              data: cleanBase64(clothBase64),
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts && parts[0]?.inlineData?.data) {
      return `data:image/png;base64,${parts[0].inlineData.data}`;
    }
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Try-On Error:", error);
    throw error;
  }
};

// 2. Pure Image Generation (Imagen 4)
// Uses imagen-4.0-generate-001
export const generateConcept = async (
  prompt: string,
  settings: ModelSettings
): Promise<string> => {
  try {
    const fullPrompt = `
      Fashion photography of a ${settings.gender} model, size ${settings.size}, ${settings.ethnicity}.
      Wearing: ${prompt}.
      Setting: ${settings.vibe || "Professional studio"}.
      Photorealistic, 8k, highly detailed, dramatic lighting.
    `;

    const response = await ai.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt: fullPrompt,
      config: {
        numberOfImages: 1,
        aspectRatio: "3:4", // Portrait for fashion
        outputMimeType: "image/jpeg",
      },
    });

    const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (imageBytes) {
      return `data:image/jpeg;base64,${imageBytes}`;
    }
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Concept Gen Error:", error);
    throw error;
  }
};

// 3. Edit Existing Image (Nano Banana)
// Uses gemini-2.5-flash-image to edit the result
export const editImage = async (
  imageBase64: string,
  editInstruction: string
): Promise<string> => {
  try {
    const model = "gemini-2.5-flash-image";
    
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/png",
              data: cleanBase64(imageBase64),
            },
          },
          { text: `Edit this image: ${editInstruction}. Maintain the original subject identity and composition where possible, only applying the requested changes. High quality.` },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts && parts[0]?.inlineData?.data) {
      return `data:image/png;base64,${parts[0].inlineData.data}`;
    }
    throw new Error("No edited image generated.");
  } catch (error) {
    console.error("Edit Error:", error);
    throw error;
  }
};
