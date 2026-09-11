import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up JSON body parser with increased limit for base64 image uploads
app.use(express.json({ limit: "15mb" }));

// API routes go here FIRST
app.post("/api/analyze", async (req, res) => {
  try {
    const { image, mimeType, sampleUrl } = req.body;

    let imageData = image;
    let imageMimeType = mimeType;

    if (sampleUrl) {
      try {
        const imgFetch = await fetch(sampleUrl);
        if (!imgFetch.ok) {
          throw new Error(`HTTP error! status: ${imgFetch.status}`);
        }
        const arrayBuf = await imgFetch.arrayBuffer();
        imageData = Buffer.from(arrayBuf).toString("base64");
        imageMimeType = imgFetch.headers.get("content-type") || "image/jpeg";
      } catch (err: any) {
        return res.status(400).json({ error: `Failed to fetch and process sample image: ${err.message}` });
      }
    }

    if (!imageData || !imageMimeType) {
      return res.status(400).json({ error: "Missing image data or mimeType/sampleUrl" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not configured on the server." });
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const promptText = `Analyze the uploaded food image carefully and output your response in JSON format matching the schema. 
Provide a highly accurate, professional, and empathetic nutritional analysis. 
If an item cannot be perfectly identified, provide your best professional estimate based on visual cues.
Be extremely precise with calorie and macronutrient estimation. 
The healthiness score should be on a scale of 1 to 10 (10 being exceptionally nutrient-dense and whole-food based).`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        foodIdentification: {
          type: Type.OBJECT,
          properties: {
            dishName: {
              type: Type.STRING,
              description: "Name of the main dish or list of individual food items visible",
            },
            portionSize: {
              type: Type.STRING,
              description: "Estimated portion size (e.g., 1 cup, 200g, standard restaurant serving)",
            },
          },
          required: ["dishName", "portionSize"],
        },
        nutritionalProfile: {
          type: Type.OBJECT,
          properties: {
            calories: {
              type: Type.INTEGER,
              description: "Total kcal",
            },
            protein: {
              type: Type.INTEGER,
              description: "Protein in grams",
            },
            carbohydrates: {
              type: Type.INTEGER,
              description: "Carbohydrates in grams (Net carbs if applicable)",
            },
            fats: {
              type: Type.INTEGER,
              description: "Fats in grams",
            },
            fiber: {
              type: Type.INTEGER,
              description: "Fiber in grams",
            },
          },
          required: ["calories", "protein", "carbohydrates", "fats", "fiber"],
        },
        healthAssessment: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.INTEGER,
              description: "NutriMind Health Score out of 10",
            },
            explanation: {
              type: Type.STRING,
              description: "2-3 sentence explanation of why it received this score, highlighting nutrient density, processing level, or macronutrient balance.",
            },
          },
          required: ["score", "explanation"],
        },
        properties: {
          type: Type.OBJECT,
          properties: {
            micronutrients: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of key vitamins and minerals (e.g. High in Vitamin C, Iron, Calcium)",
            },
            attributes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of dietary attributes (e.g. Whole-food, high-protein, low-glycemic, processed, high-sodium)",
            },
          },
          required: ["micronutrients", "attributes"],
        },
        actionableTip: {
          type: Type.STRING,
          description: "One positive, actionable tip to make this meal even healthier or how to balance it throughout the rest of the day",
        },
      },
      required: [
        "foodIdentification",
        "nutritionalProfile",
        "healthAssessment",
        "properties",
        "actionableTip",
      ],
    };

    // Candidate models in priority order:
    // 1. gemini-3.1-flash-lite: High throughput, sub-2s latency, resilient against 503 high-demand surges
    // 2. gemini-3.6-flash: Robust mid-tier model with fast response
    // 3. gemini-3.8-flash: Advanced reasoning model
    const candidateModels = ["gemini-3.1-flash-lite", "gemini-3.6-flash", "gemini-3.8-flash"];
    let lastError: any = null;
    let parsedResult: any = null;

    for (const model of candidateModels) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const config: any = {
            responseMimeType: "application/json",
            responseSchema,
          };
          // For models that support thinking, use LOW thinkingLevel to reduce latency and server load
          if (model !== "gemini-3.1-flash-lite") {
            config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
          }

          const response = await ai.models.generateContent({
            model,
            contents: [
              {
                inlineData: {
                  mimeType: imageMimeType,
                  data: imageData,
                },
              },
              promptText,
            ],
            config,
          });

          const resultText = response.text;
          if (!resultText) {
            throw new Error("Empty response from AI model");
          }

          parsedResult = JSON.parse(resultText);
          break;
        } catch (err: any) {
          lastError = err;
          const status = err?.status || err?.code || (err?.error && (err.error.code || err.error.status));
          const errMsg = String(err?.message || "");
          const isHighDemandOrTransient =
            status === 503 ||
            status === 429 ||
            errMsg.includes("503") ||
            errMsg.includes("429") ||
            errMsg.includes("high demand") ||
            errMsg.includes("UNAVAILABLE") ||
            errMsg.includes("RESOURCE_EXHAUSTED");

          console.warn(`Model ${model} attempt ${attempt} returned error:`, errMsg);

          if (isHighDemandOrTransient && attempt < 2) {
            // Short backoff before retrying same model
            await new Promise((resolve) => setTimeout(resolve, 800));
            continue;
          }
          break; // Switch to next candidate model
        }
      }

      if (parsedResult) {
        break;
      }
    }

    if (!parsedResult) {
      throw lastError || new Error("Failed to generate analysis after trying candidate models.");
    }

    res.json(parsedResult);
  } catch (error: any) {
    console.error("Analysis failed:", error);
    let errorMsg = error?.message || "An error occurred during food analysis";
    if (errorMsg.includes("503") || errorMsg.includes("high demand") || errorMsg.includes("UNAVAILABLE")) {
      errorMsg = "The AI service is experiencing high temporary demand. Please try again in a few moments.";
    }
    res.status(500).json({ error: errorMsg });
  }
});

// Vite middleware for development or static file serving for production
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
