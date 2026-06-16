import express, { Request, Response } from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON
app.use(express.json());

// Initialize Google GenAI client lazily or safely
let ai: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not defined. Predictions will fail.");
    }
    ai = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return ai;
}

// REST API for Case Prediction
app.post("/api/predict", async (req: Request, res: Response): Promise<void> => {
  try {
    const { caseDescription, selectedEvidence, caseType, caseCategory, subcategory, questionnaireAnswers } = req.body;

    if (!caseDescription || typeof caseDescription !== "string" || caseDescription.trim() === "") {
      res.status(400).json({ error: "Case description is required and must be a valid string." });
      return;
    }

    const genAI = getGenAI();
    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({
        error: "Gemini API key is not configured on the server. Please add GEMINI_API_KEY to your Secrets panel or .env file.",
      });
      return;
    }

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        caseClassification: {
          type: Type.OBJECT,
          properties: {
            caseType: { type: Type.STRING, description: "CRIMINAL CASE / CIVIL CASE / MIXED CASE" },
            explanation: { type: Type.STRING, description: "Detailed explanation of why the case falls into this category" },
          },
          required: ["caseType", "explanation"],
        },
        applicableLaws: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              sectionNumber: { type: Type.STRING, description: "Section number, e.g., BNS Section 115 / IPC Section 323" },
              actName: { type: Type.STRING, description: "Act name, e.g., Bharatiya Nyaya Sanhita, 2023 / Indian Penal Code, 1860 / Code of Criminal Procedure, 1973" },
              covers: { type: Type.STRING, description: "What offense or rule this section covers" },
              punishment: { type: Type.STRING, description: "Minimum and maximum jail term, fine, or both" },
              bailability: { type: Type.STRING, description: "Bailable / Non-bailable" },
              cognizability: { type: Type.STRING, description: "Cognizable / Non-cognizable / Not Applicable" },
              analysis: { type: Type.STRING, description: "How this specific section applies to the provided facts" },
            },
            required: ["sectionNumber", "actName", "covers", "punishment", "bailability", "cognizability", "analysis"],
          },
        },
        chargePrediction: {
          type: Type.OBJECT,
          properties: {
            primaryCharge: { type: Type.STRING, description: "The most serious likely charge to be filed" },
            supportingCharges: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of secondary/supporting charges",
            },
            likelyFramedOrDropped: { type: Type.STRING, description: "LIKELY FRAMED / LIKELY DROPPED" },
            reasoning: { type: Type.STRING, description: "Detailed explanation of whether charges will likely be framed or dropped based on facts" },
          },
          required: ["primaryCharge", "supportingCharges", "likelyFramedOrDropped", "reasoning"],
        },
        probabilityAnalysis: {
          type: Type.OBJECT,
          properties: {
            convictionProbability: { type: Type.INTEGER, description: "Probability of conviction (0 to 100)" },
            acquittalProbability: { type: Type.INTEGER, description: "Probability of acquittal (0 to 100)" },
            bailProbability: { type: Type.INTEGER, description: "Probability of bail being granted (0 to 100)" },
            jailProbability: { type: Type.INTEGER, description: "Probability of jail sentence if convicted (0 to 100)" },
            keyFactors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of key evidentiary and circumstantial factors that drive these percentages (e.g., strength of evidence, alibi indicators, pre-planning, etc.)",
            },
          },
          required: ["convictionProbability", "acquittalProbability", "bailProbability", "jailProbability", "keyFactors"],
        },
        expectedPunishment: {
          type: Type.OBJECT,
          properties: {
            minimumSentence: { type: Type.STRING, description: "Minimum sentence if convicted (jail duration / fine amount)" },
            maximumSentence: { type: Type.STRING, description: "Maximum sentence if convicted (jail duration / fine amount / death penalty)" },
            mostLikelySentence: { type: Type.STRING, description: "Most likely sentence duration or outcome" },
            imprisonmentType: { type: Type.STRING, description: "Simple / Rigorous / Not Applicable (for purely civil matters)" },
            paroleLikelihood: { type: Type.STRING, description: "Yes / No / Possible" },
          },
          required: ["minimumSentence", "maximumSentence", "mostLikelySentence", "imprisonmentType", "paroleLikelihood"],
        },
        bailPrediction: {
          type: Type.OBJECT,
          properties: {
            isBailable: { type: Type.STRING, description: "Bailable / Non-bailable" },
            anticipatoryBailApplicability: { type: Type.STRING, description: "Can anticipatory bail be applied (e.g. Under Section 438 CrPC / Section 482 BNSS)?" },
            regularBailApplicability: { type: Type.STRING, description: "Can regular bail be applied (e.g. Under Section 437/439 CrPC / Section 480/483 BNSS)?" },
            estimatedBailAmount: { type: Type.STRING, description: "Estimated range of bail bond in Rupees, e.g., ₹15,000 to ₹50,000" },
            likelyConditions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Likely bail conditions (e.g., weekly police station visits, no contact with victim, surrender passport, etc.)",
            },
            verdict: { type: Type.STRING, description: "LIKELY GRANTED / LIKELY DENIED / UNCERTAIN" },
          },
          required: ["isBailable", "anticipatoryBailApplicability", "regularBailApplicability", "estimatedBailAmount", "likelyConditions", "verdict"],
        },
        civilOutcome: {
          type: Type.OBJECT,
          properties: {
            remedy: { type: Type.STRING, description: "Type of civil remedy (Injunction, Damages, Compensation, Partition, Specific Performance, Divorce, or Not Applicable)" },
            likelyCourt: { type: Type.STRING, description: "Suitable court (e.g. District Court / Family Court / Consumer Tribunal / High Court / N/A)" },
            compensationRange: { type: Type.STRING, description: "Expected compensation/damages range in Rupees (e.g. ₹50,000 - ₹2,000,000 or N/A)" },
            timeToResolution: { type: Type.STRING, description: "Estimated time to resolution, e.g., 12 to 18 months" },
            winProbability: { type: Type.INTEGER, description: "Probability of win in civil court (0 to 100)" },
          },
          required: ["remedy", "likelyCourt", "compensationRange", "timeToResolution", "winProbability"],
        },
        defenseStrategies: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Title of defense (e.g. Absence of Mens Rea / Private Defence / Procedural Police Lapse / Alibi / Mutual Consent)" },
              description: { type: Type.STRING, description: "How this specific defense can be contextualized and argued for the accused based on user's statement" },
            },
            required: ["title", "description"],
          },
        },
        caseSummary: {
          type: Type.OBJECT,
          properties: {
            caseType: { type: Type.STRING, description: "Criminal / Civil / Mixed" },
            primaryCharge: { type: Type.STRING, description: "E.g., BNS Section 115 (IPC 323) or Specific Act section" },
            convictionPercent: { type: Type.INTEGER, description: "Conviction Probability (0 to 100)" },
            acquittalPercent: { type: Type.INTEGER, description: "Acquittal Probability (0 to 100)" },
            bailProbability: { type: Type.INTEGER, description: "Bail Probability (0 to 100) - Set to 0 if purely civil or consumer court case where bail is not applicable" },
            expectedSentence: { type: Type.STRING, description: "E.g., Compensation of ₹1,00,000 and nominal fine" },
            fineRange: { type: Type.STRING, description: "E.g., ₹10,000 to ₹50,000" },
            recommendedCourt: { type: Type.STRING, description: "E.g., District Consumer Disputes Redressal Commission or family court" },
            confidenceScore: { type: Type.INTEGER, description: "Confidence score out of 100 showing AI modeling reliability" },
          },
          required: ["caseType", "primaryCharge", "convictionPercent", "acquittalPercent", "bailProbability", "expectedSentence", "fineRange", "recommendedCourt", "confidenceScore"],
        },
        required_documents: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of recommended documents the user should collect as evidence, e.g., Salary slips, Employment letter, Bank statements, WhatsApp messages, Rent receipts, etc."
        }
      },
      required: [
        "caseClassification",
        "applicableLaws",
        "chargePrediction",
        "probabilityAnalysis",
        "expectedPunishment",
        "bailPrediction",
        "civilOutcome",
        "defenseStrategies",
        "caseSummary",
        "required_documents"
      ],
    };

    const systemInstruction = `You are an AI Legal Case Prediction System specializing in Indian law.
Analyze the case facts carefully and identify whether the case is Civil, Criminal, Consumer, Family, Labour, Property, Contract, or another legal category.

IMPORTANT RULES:

1. For Civil Cases (including Consumer, Family, Labour, Property, Contract, etc.):
   * Do NOT use "Conviction Probability" or "Acquittal Probability" to represent the outcome.
   * Instead, calculate and assign:
     * Plaintiff Success Probability (populate inside the "convictionProbability"/"convictionPercent" fields)
     * Defendant Success Probability (populate inside the "acquittalProbability"/"acquittalPercent" fields)
   * Set bailProbability/bailPercent to 0 as it is not applicable to civil matters.

2. For Criminal Cases:
   * Use and calculate:
     * Conviction Probability (populate inside "convictionProbability"/"convictionPercent")
     * Acquittal Probability (populate inside "acquittalProbability"/"acquittalPercent")
     * Bail Probability (populate inside the "bailProbability" fields)

3. Determine the most relevant legal provisions based on the facts. Cite old laws (IPC, CrPC, IEA) alongside the new 2023 laws (BNS, BNSS, BSA) when relevant under current transition.
4. Estimate outcomes only when sufficient facts are available.
5. Avoid hallucinating legal sections that are unrelated to the case.
6. Provide concise legal reasoning based on the facts.
7. Always use the Indian Rupee symbol '₹' consistently for any fines, compensation or damages (e.g. ₹50,050 to ₹1,00,000).
8. Ensure convictionProbability/convictionPercent and acquittalProbability/acquittalPercent always sum up to exactly 100%.

Always prioritize legal accuracy over confidence. If information is insufficient, explicitly state "Insufficient facts available for reliable prediction" in the reasoning fields.`;

    // Robust multi-model fallback and retry flow to handle temporary API demand spikes or limits (like 503 UNAVAILABLE)
    const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    let response = null;
    let apiError: any = null;

    for (const model of modelsToTry) {
      let retries = 3; // Allow up to 3 retries (4 total attempts) per model under transient errors
      while (retries >= 0) {
        try {
          console.log(`Analyzing case with model: ${model} (Retries remaining: ${retries})`);
          
          let userPrompt = `Evaluate the following Indian legal case description and provide a highly detailed, professional legal analysis matching the requested JSON schema.\n\nCase Description:\n${caseDescription}`;
          
          if (caseCategory) {
            userPrompt += `\n\nUser Case Category Track: ${caseCategory}`;
            if (subcategory) {
              userPrompt += ` (Subcategory: ${subcategory})`;
            }
          }

          if (questionnaireAnswers && Object.keys(questionnaireAnswers).length > 0) {
            userPrompt += `\n\nIntake Questionnaire responses provided by the client:\n` +
              Object.entries(questionnaireAnswers)
                .filter(([_, val]) => val !== undefined && val !== null && val !== "")
                .map(([key, value]) => {
                  const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                  return `- ${label}: ${value}`;
                })
                .join("\n");
          }
          
          if (caseType) {
            userPrompt += `\n\nUser Selection Classification Track: ${caseType.toUpperCase()} CASE. Ensure your assessment focuses primarily on this legal track (e.g. BNS penal code, criminal procedural code vs. civil civil/remedial statutes) as indicated.`;
          }
          
          if (Array.isArray(selectedEvidence) && selectedEvidence.length > 0) {
            userPrompt += `\n\nSupporting Evidence possessed by the user:\n` + 
              selectedEvidence.map(item => `- ${item}`).join("\n") +
              `\n\nIMPORTANT SYSTEM INSTRUCTION: The user has explicitly selected and confirmed possession of the pieces of evidence listed above. Refine and adjust your legal probability assessments, key factors, and tactical summaries to account for this possessed evidence. Specifically:\n` +
              `1. The presence of strong concrete evidence (such as CCTV camera footage, signed agreements, GPS logs, or official medical reports) should increase the Conviction Probability (convictionPercent) or civil winProbability (winProbability) significantly compared to a baseline scenario without concrete proof.\n` +
              `2. Mention these explicitly as key catalytic elements inside your "probabilityAnalysis.keyFactors" and "chargePrediction.reasoning" fields to reflect their substantive value.\n` +
              `3. Tailor the strategic counsel or "defenseStrategies" to address the strengths or mitigating nature of these possessed documents appropriately.`;
          }

          response = await genAI.models.generateContent({
            model: model,
            contents: [
              {
                text: userPrompt,
              },
            ],
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema,
              temperature: 0.1, // low temperature for precise legal matching
            },
          });
          
          if (response && response.text) {
            break; // Succeeded!
          }
        } catch (err: any) {
          apiError = err;
          const errMsg = err?.message || String(err);
          console.warn(`Transient or model-specific error on model ${model}:`, errMsg);

          const isTransient = errMsg.includes("503") || 
                              errMsg.includes("UNAVAILABLE") || 
                              errMsg.includes("high demand") || 
                              errMsg.includes("overloaded") || 
                              errMsg.includes("Rate limit") ||
                              errMsg.includes("429");

          if (isTransient && retries > 0) {
            // Progressive exponential backoff starting at 1.5 seconds up to 6 seconds to breathe on transient demand spike
            const backoff = (4 - retries) * 1500;
            console.log(`Transient limit hit on ${model}. Retrying in ${backoff}ms...`);
            await new Promise((resolve) => setTimeout(resolve, backoff));
            retries--;
          } else {
            break; // Move to next model
          }
        }
      }
      if (response && response.text) {
        break; // Stop evaluating models if we have a successful response
      }
    }

    if (!response || !response.text) {
      throw apiError || new Error("All candidate Gemini models threw an exception or returned empty output.");
    }

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error evaluating legal case prediction:", error);
    res.status(500).json({
      error: "An error occurred while generating the legal prediction. Please try again.",
      details: error?.message || String(error),
    });
  }
});

// Specialist Q&A API for Indian Criminal / Civil Law Assistants
app.post("/api/specialist-query", async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, mode } = req.body;

    if (!query || typeof query !== "string" || query.trim() === "") {
      res.status(400).json({ error: "Legal query is required." });
      return;
    }

    if (mode !== "criminal" && mode !== "civil") {
      res.status(400).json({ error: "Invalid assistant mode. Must be 'criminal' or 'civil'." });
      return;
    }

    const genAI = getGenAI();
    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({
        error: "Gemini API key is not configured on the server. Please add GEMINI_API_KEY to your Secrets panel.",
      });
      return;
    }

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        case_type: { type: Type.STRING, description: "Must be exactly 'Criminal' or 'Civil'" },
        subcategory: { type: Type.STRING, description: "Case subcategory" },
        applicable_act: { type: Type.STRING, description: "Governing Indian Act" },
        sections: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              section: { type: Type.STRING, description: "Section identifier" },
              title: { type: Type.STRING, description: "Short description/title of the section" },
              punishment: { type: Type.STRING, description: "consequence/punishment limited exactly to a 1-line sentence" },
            },
            required: ["section", "title", "punishment"],
          },
          description: "Maximum 2-3 sections only"
        },
        ipc_reference: { type: Type.STRING, description: "Old IPC section, or N/A" },
        bns_reference: { type: Type.STRING, description: "New BNS section, or N/A" },
        bail_available: { type: Type.STRING, description: "ONLY for Criminal Mode: 'Yes' or 'No'. For Civil Mode: leave empty or write 'N/A'" },
        verdict_chance: { type: Type.STRING, description: "Must ONLY be: Strong Case / Moderate Case / Weak Case" },
        one_line_advice: { type: Type.STRING, description: "concise one-line advice under 15 words" },
        error: { type: Type.STRING, description: "Populated ONLY if there is a jurisdictional mismatch error (e.g. asking civil queries to the criminal assistant or vice-versa)" }
      },
      required: [
        "case_type",
        "subcategory",
        "applicable_act",
        "sections",
        "ipc_reference",
        "bns_reference",
        "verdict_chance",
        "one_line_advice"
      ],
    };

    let systemInstruction = "";
    if (mode === "criminal") {
      systemInstruction = `You are an Indian criminal law assistant. Give short and clear answers only. You only handle criminal law cases.

Criminal case subcategories you cover:
- Murder (BNS Section 101 / IPC Section 302)
- Theft (BNS Section 303 / IPC Section 378)
- Robbery (BNS Section 309 / IPC Section 390)
- Rape & Sexual Assault (BNS Section 63 / IPC Section 375)
- Kidnapping (BNS Section 137 / IPC Section 359)
- Fraud & Cheating (BNS Section 318 / IPC Section 420)
- Assault & Battery (BNS Section 115 / IPC Section 351)
- Domestic Violence (Protection of Women from Domestic Violence Act 2005)
- Cybercrime (IT Act 2000, Section 66)
- Forgery (BNS Section 336 / IPC Section 463)
- Dacoity (BNS Section 310 / IPC Section 391)
- Dowry Death (BNS Section 80 / IPC Section 304B)

If the user asks about any civil, family, property, tax, or other non-criminal topic, respond with:
{"case_type": "Criminal", "subcategory": "N/A", "applicable_act": "N/A", "sections": [], "ipc_reference": "N/A", "bns_reference": "N/A", "bail_available": "No", "verdict_chance": "Weak Case", "one_line_advice": "Jurisdictional mismatch.", "error": "This assistant only handles criminal law cases. Please use the civil law assistant for your query."}

Rules:
- Give short and clear answers only
- Maximum 2-3 sections only
- punishment must be 1 line only inside each section object
- one_line_advice must be under 15 words
- verdict_chance only say: Strong Case / Moderate Case / Weak Case
- bail_available only say Yes or No (do not write any other text)
- No long explanations
- No strategies
- No disclaimers
- Always respond ONLY in valid JSON matches the requested schema with no markdown, no backticks, no preamble.`;
    } else {
      systemInstruction = `You are an Indian civil law assistant. Give short and clear answers only. You only handle civil law cases.

Civil case subcategories you cover:
- Property Disputes (Transfer of Property Act 1882)
- Contract Disputes (Indian Contract Act 1872)
- Cheque Bounce (Negotiable Instruments Act Section 138)
- Consumer Complaints (Consumer Protection Act 2019)
- Defamation (BNS Section 356 / IPC Section 499)
- Injunction & Stay Orders (CPC Order 39)
- Recovery of Money (CPC Section 9)
- Tort & Negligence (Law of Torts)
- Landlord Tenant Disputes (Rent Control Acts)
- Employment & Labour Disputes (Industrial Disputes Act 1947)
- Insurance Claims (Insurance Act 1938)
- Intellectual Property (Copyright Act / Trademark Act / Patents Act)

If the user asks about any criminal, family, tax, or other non-civil topic, respond with:
{"case_type": "Civil", "subcategory": "N/A", "applicable_act": "N/A", "sections": [], "ipc_reference": "N/A", "bns_reference": "N/A", "verdict_chance": "Weak Case", "one_line_advice": "Jurisdictional mismatch.", "error": "This assistant only handles civil law cases. Please use the criminal law assistant for your query."}

Rules:
- Give short and clear answers only
- Maximum 2-3 sections only
- punishment must be 1 line only inside each section object
- one_line_advice must be under 15 words
- verdict_chance only say: Strong Case / Moderate Case / Weak Case
- bail_available is not applicable for civil cases, set to N/A
- No long explanations
- No strategies
- No disclaimers
- Always respond ONLY in valid JSON matches the requested schema with no markdown, no backticks, no preamble.`;
    }

    const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    let response = null;
    let apiError: any = null;

    for (const model of modelsToTry) {
      try {
        console.log(`Analyzing specialist query with model: ${model}`);
        response = await genAI.models.generateContent({
          model: model,
          contents: [{ text: query }],
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema,
            temperature: 0.1,
          },
        });
        if (response && response.text) {
          break;
        }
      } catch (err: any) {
        apiError = err;
        console.warn(`Transient or model-specific error on specialist query model ${model}:`, err?.message || String(err));
      }
    }

    if (!response || !response.text) {
      throw apiError || new Error("All candidate Gemini models threw an exception or returned empty output on specialist query.");
    }

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error in specialist legal query:", error);
    res.status(500).json({
      error: "An error occurred while processing the specialist query.",
      details: error?.message || String(error),
    });
  }
});

// Setup Vite Dev Server / Serve Static files in Production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA fallback
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Indian Legal Prediction AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
