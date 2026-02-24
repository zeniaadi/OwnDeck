import { GoogleGenAI, Type } from "@google/genai";
import { UserInput, CardData } from "../types";
import { SYSTEM_PROMPT } from "../constants";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateCardContent = async (input: UserInput): Promise<CardData> => {
  const ai = getClient();
  
  const userMessage = `
    USER INPUT:
    - sender_name: ${input.sender_name}
    - recipient_name: ${input.recipient_name}
    - wish_text: ${input.wish_text}
    - optional_theme: ${input.optional_theme === "Auto-Select" ? "auto" : input.optional_theme}
    - deck_title: ${input.deck_title || "N/A"}
  `;

  // We use gemini-3-pro-preview for better complex JSON generation and instruction following to avoid loops.
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: userMessage,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      maxOutputTokens: 4000, 
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          card_spec: {
            type: Type.OBJECT,
            properties: {
              sender_name: { type: Type.STRING },
              recipient_name: { type: Type.STRING },
              wish_text: { type: Type.STRING },
              tone: { type: Type.STRING },
              mood: { type: Type.STRING },
              theme_keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              selected_design_theme: { type: Type.STRING },
              color_palette: { type: Type.ARRAY, items: { type: Type.STRING } },
              card_archetype: { type: Type.STRING },
              short_tagline: { type: Type.STRING },
            },
            required: ["selected_design_theme", "color_palette", "card_archetype"]
          },
          card_copy: {
            type: Type.OBJECT,
            properties: {
              card_title: { type: Type.STRING },
              primary_stat_name: { type: Type.STRING },
              primary_stat_value: { type: Type.NUMBER }, 
              abilities: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    cost_icons: { type: Type.ARRAY, items: { type: Type.STRING } },
                    description: { type: Type.STRING },
                    power_value: { type: Type.STRING }
                  }
                }
              },
              flavor_quote: { type: Type.STRING },
            },
            required: ["card_title", "primary_stat_name", "abilities"]
          },
          art_prompt_package: {
            type: Type.OBJECT,
            properties: {
              art_prompt: { type: Type.STRING },
              negative_prompt: { type: Type.STRING },
              composition_notes: { type: Type.STRING },
            },
            required: ["art_prompt"]
          },
          render_spec: {
            type: Type.OBJECT,
            properties: {
              colors: { type: Type.ARRAY, items: { type: Type.STRING } },
              fonts: { type: Type.ARRAY, items: { type: Type.STRING } },
            }
          },
          export_settings: {
            type: Type.OBJECT,
            properties: {
              resolution_notes: { type: Type.STRING }
            }
          }
        },
        required: ["card_spec", "card_copy", "art_prompt_package", "render_spec", "export_settings"]
      }
    },
  });

  const jsonText = response.text || "{}";
  try {
    const parsed = JSON.parse(jsonText);
    
    // Validate essential fields exist to prevent undefined errors later
    if (!parsed.card_spec || !parsed.card_copy || !parsed.art_prompt_package) {
      console.error("Invalid AI response structure:", parsed);
      throw new Error("The AI returned incomplete card data.");
    }
    
    // Pass the user's deck title through to the card spec manually
    parsed.card_spec.deck_title = input.deck_title;

    return parsed as CardData;
  } catch (e) {
    console.error("Failed to parse Gemini JSON response", e);
    console.debug("Raw Response Text:", jsonText.substring(0, 500) + "..."); 
    throw new Error("The Card Forge malfunctioned. The AI generated invalid data. Please try again.");
  }
};

export const generateCardImage = async (prompt: string, theme: string): Promise<string> => {
  const ai = getClient();
  
  const enhancedPrompt = `${prompt}. Style: ${theme}. High quality, detailed, abstract, trading card art, centered composition.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: enhancedPrompt }
      ]
    },
    config: {}
  });

  let base64Image = "";
  if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
              base64Image = part.inlineData.data;
              break;
          }
      }
  }

  if (!base64Image) {
    throw new Error("Failed to generate visual artifact.");
  }

  return `data:image/png;base64,${base64Image}`;
};