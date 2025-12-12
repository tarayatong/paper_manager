import { GoogleGenAI } from "@google/genai";
import { Paper } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

// --- Helpers ---

const cleanAndParseJSON = (text: string): any => {
  try {
    // 1. Try parsing directly
    return JSON.parse(text);
  } catch (e) {
    // 2. Try extracting from markdown code blocks
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1]);
      } catch (e2) {
        // continue
      }
    }
    
    // 3. Try finding the first '{' and last '}'
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      try {
        return JSON.parse(text.substring(start, end + 1));
      } catch (e3) {
        // continue
      }
    }
    
    throw new Error("Failed to parse JSON from response");
  }
};

// --- Functions ---

export const analyzePaper = async (paper: Partial<Paper>): Promise<Partial<Paper>> => {
  const ai = getAiClient();
  
  const prompt = `
    Conduct a technical analysis of the paper titled "${paper.title}" (Authors: ${paper.authors?.join(', ')}).
    
    Search for the paper's abstract, methodology, and experimental results online.
    Extract the following attributes:
    1. Architecture Type: Is the proposed method based on CNN, Transformer, or a Hybrid of both?
    2. Datasets: Which specific datasets were used (e.g., NUAA-SIRST, NUDT-SIRST, IRSTD-1k)?
    3. Data Split: How was the data divided for training/testing (e.g., 80/20, 50/50, Cross-validation)?
    4. Data Annotation: What is the annotation form (e.g., pixel-level mask, bounding box, centroid)?
    5. Metrics: What accuracy metrics were used (e.g., IoU, Pd, Fa, nIoU)?
    6. Results: Briefly summarize the quantitative performance (e.g., "Achieved 78.5% IoU").
    7. Innovation Point: Specifically, which part of the network architecture is the main innovation targeting (e.g., Feature Extraction Backbone, Neck/Fusion module, Attention Mechanism, Detection Head)?

    OUTPUT FORMAT:
    Strictly return a valid JSON object with the following keys:
    - "architecture": "CNN", "Transformer", "Hybrid", or "Other"
    - "datasets": array of strings
    - "dataSplit": string
    - "annotationType": string
    - "metrics": array of strings
    - "resultsSummary": string
    - "innovationPoint": string

    Do not include any markdown formatting or explanation outside the JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType and responseSchema are NOT supported with googleSearch
      }
    });

    const text = response.text;
    if (!text) throw new Error("No analysis generated");
    
    const extractedData = cleanAndParseJSON(text);
    
    // Sanitize extracted data to ensure arrays are valid
    const safeExtractedData = {
        ...extractedData,
        datasets: Array.isArray(extractedData?.datasets) ? extractedData.datasets : [],
        metrics: Array.isArray(extractedData?.metrics) ? extractedData.metrics : [],
    };
    
    return {
      ...paper,
      isAnalyzed: true,
      status: 'done',
      ...safeExtractedData
    };

  } catch (error) {
    console.error("Analysis failed:", error);
    return {
      ...paper,
      status: 'error',
      resultsSummary: "Analysis Failed"
    };
  }
};