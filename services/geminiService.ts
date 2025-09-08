import { GoogleGenAI, Modality } from "@google/genai";
import type { ImageFile } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const imageEditModel = 'gemini-2.5-flash-image-preview';
const textModel = 'gemini-2.5-flash';

const fileToGenerativePart = (image: ImageFile) => {
    return {
        inlineData: {
            data: image.base64.split(',')[1],
            mimeType: image.mimeType,
        },
    };
};

export const enhancePrompt = async (prompt: string): Promise<string> => {
    if (!prompt.trim()) {
        return prompt;
    }

    try {
        const systemInstruction = "You are a creative assistant for an AI image editor. Enhance the following user prompt to be more descriptive, vivid, and imaginative. Only return the enhanced prompt text, without any introductory phrases or explanations.";
        
        const response = await ai.models.generateContent({
            model: textModel,
            contents: `User prompt to enhance: "${prompt}"`,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        const enhancedText = response.text.trim();
        // Sometimes the model might still return the prompt in quotes, remove them.
        if (enhancedText.startsWith('"') && enhancedText.endsWith('"')) {
            return enhancedText.substring(1, enhancedText.length - 1);
        }
        return enhancedText;
    } catch (error) {
        console.error("Error enhancing prompt with Gemini API:", error);
        throw new Error("Failed to enhance prompt. The AI service might be unavailable.");
    }
};

export const editImage = async (
    originalImage: ImageFile,
    maskImage: ImageFile,
    prompt: string,
    numberOfImages: number
): Promise<ImageFile[]> => {
    const originalImagePart = fileToGenerativePart(originalImage);
    const maskImagePart = fileToGenerativePart(maskImage);
    const textPart = {
        text: `Using the second black and white image as a mask on the first color image, apply the following edit: "${prompt}". Only output the edited image.`,
    };

    const generationPromises = Array(numberOfImages).fill(0).map(async (_, index) => {
        try {
            const response = await ai.models.generateContent({
                model: imageEditModel,
                contents: {
                    parts: [originalImagePart, maskImagePart, textPart],
                },
                config: {
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                },
            });

            for (const part of response.candidates?.[0]?.content?.parts ?? []) {
                if (part.inlineData?.data) {
                    const mimeType = part.inlineData.mimeType || 'image/png';
                    return {
                        name: `edited-${index + 1}-${originalImage.name}`,
                        base64: `data:${mimeType};base64,${part.inlineData.data}`,
                        mimeType: mimeType,
                    };
                }
            }
             return null;
        } catch (error) {
            console.error(`Error generating image variation ${index + 1}:`, error);
            // Don't throw, just return null so other promises can complete
            return null;
        }
    });

    try {
        const results = await Promise.all(generationPromises);
        // Filter out any failed attempts (which are null)
        return results.filter((result): result is ImageFile => result !== null);
    } catch (error) {
         console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate images. The AI service might be unavailable or the request was blocked.");
    }
};

export const generateVideoPromptFromImage = async (image: ImageFile): Promise<string> => {
    try {
        const imagePart = fileToGenerativePart(image);
        const textPart = { text: "Analyze this image and generate a Veo prompt." };

        const systemInstruction = `You are an expert prompt writer for a generative text-to-video AI model like Google Veo. Your task is to analyze an input image and generate a highly detailed, cinematic prompt that brings the image to life as a short video clip. The prompt must be a single, detailed paragraph.

Follow these principles for crafting the prompt:
1.  **Define a unique visual style and tone:** Start the prompt by defining the sort of video you want to create. Examples: "Camping (Stop Motion):", "A medium shot frames...", "The scene explodes with the raw, visceral, and unpredictable energy of a hardcore off-road rally...".
2.  **Build a world:** Use evocative, sensory language to describe the environment. Detail the lighting, textures, weather, and overall atmosphere. Example: "A snow-covered plain of iridescent moon-dust under twilight skies. Thirty-foot crystalline flowers bloom, refracting light into slow-moving rainbows."
3.  **Craft your characters/subjects:** Use specific and detailed descriptions about each character’s appearance, voice, action, and dialogue. If it's an object, describe its journey. Example: "A paper boat sets sail in a rain-filled gutter. It navigates the current with unexpected grace."
4.  **Create complex action with extreme detail:** For ultimate control, leave nothing to chance. Map out exact play-by-plays to get the videos you want, even for simple scenes.
5.  **Fuse visuals with sound design:** Explicitly define the sounds you want to hear to match the audio to your visuals. Example: "Audio: Crunchy, sugary typing sounds, delighted giggles."

Your output must ONLY be the generated prompt text, without any introductory phrases, explanations, or markdown formatting.`;

        const response = await ai.models.generateContent({
            model: textModel,
            contents: { parts: [imagePart, textPart] },
            config: {
                systemInstruction: systemInstruction,
            }
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error generating video prompt with Gemini API:", error);
        throw new Error("Failed to generate video prompt. The AI service might be unavailable.");
    }
};