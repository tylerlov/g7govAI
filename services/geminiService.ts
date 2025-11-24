
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Score, ScorecardData } from "../types";

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
        }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type
    },
  };
};

export const analyzeContract = async (
  file: File,
  modelClauses: Record<string, string>
): Promise<ScorecardData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const filePart = await fileToGenerativePart(file);

  const modelClausesText = Object.entries(modelClauses)
    .map(([topic, clause]) => `${topic}: ${clause}`)
    .join('\n    ');

  const topics = Object.keys(modelClauses);

  const prompt = `
    You are an expert legal AI specializing in contract analysis for AI products. Your task is to analyze the provided contract file against a company's model contractual clauses.

    **Our Model Clauses:**
    ---
    ${modelClausesText}
    ---

    **Analysis Instructions:**
    For each of the topics (${topics.join(', ')}), please perform the following:
    1. Identify the relevant clause(s) in the provided contract. If no relevant clause is found, state that clearly.
    2. Compare the contract clause(s) with our corresponding Model Clause.
    3. Assign a risk score based on the deviation:
       - 'GREEN': The clauses are substantially aligned with only minor, non-material differences.
       - 'YELLOW': There are minor deviations that may require clarification or small amendments.
       - 'RED': There is a substantial deviation, indicating a high risk that needs to be addressed.
    4. Provide a concise summary (1-2 sentences) explaining your reasoning for the score.
    5. Extract the exact text of the relevant clause from the contract. If none is found, return an empty string.
    6. Identify the specific section number or clause reference in the contract (e.g., "Section 5.1", "Clause 12.3", "Recital A"). If the clause is missing or not found, return "N/A".
    7. Provide a "Plain Language Explanation". This should explain the analysis and risks using clear, college-level writing that is easy for a layperson to understand. It must be no more than two sentences long and free of complex legal jargon.
    8. Provide a "Suggested Revision". Rewrite the contract clause (or draft a new one if missing) so that it is conceptually compliant with the standard set out in the Model Clause. If the original clause is already compliant (GREEN), strictly return the original text.
    9. Provide a "Suggested Revision HTML". This must be the exact same text as the "Suggested Revision", but formatted using HTML <del> tags for deleted text and <ins> tags for inserted/new text to show the changes relative to the original Contract Clause (Track Changes style). If it is a completely new clause, wrap the whole thing in <ins>.

    Return your analysis as a JSON object matching the provided schema. Ensure every field is populated for every topic provided.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: {
      parts: [filePart, { text: prompt }],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING, enum: topics },
            score: { type: Type.STRING, enum: Object.values(Score) },
            summary: { type: Type.STRING },
            plainLanguageExplanation: { type: Type.STRING },
            contractClause: { type: Type.STRING },
            sectionReference: { type: Type.STRING },
            suggestedRevision: { type: Type.STRING },
            suggestedRevisionHtml: { type: Type.STRING },
            modelClause: { type: Type.STRING },
          },
          required: ["topic", "score", "summary", "plainLanguageExplanation", "contractClause", "sectionReference", "suggestedRevision", "suggestedRevisionHtml", "modelClause"]
        }
      }
    }
  });

  const analysisResult = JSON.parse(response.text);
  
  // Ensure the modelClause is populated from our input, as the model might not return it.
   return analysisResult.map((item: any) => ({
    ...item,
    modelClause: modelClauses[item.topic as string] || "Model clause not found.",
  }));
};

export const generateAddendum = async (
  file: File,
  analysisResults: ScorecardData,
  modelClauses: Record<string, string>
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const filePart = await fileToGenerativePart(file);

  const problematicClauses = analysisResults.filter(
    item => item.score === Score.RED || item.score === Score.YELLOW
  );

  if (problematicClauses.length === 0) {
    return "No addendum needed as all clauses are compliant.";
  }

   const modelClausesText = Object.entries(modelClauses)
    .map(([topic, clause]) => `${topic}: ${clause}`)
    .join('\n    ');

  const prompt = `
    You are an expert legal AI tasked with drafting a contract addendum. Based on the original contract file and a risk analysis, generate remedial clauses to align the contract with our company's standard positions.

    **Analysis of Deviations:**
    ---
    ${JSON.stringify(problematicClauses, null, 2)}
    ---

    **Our Model Clauses (Target Position):**
    ---
    ${modelClausesText}
    ---

    **Drafting Instructions:**
    Generate a formal "AI Services Addendum". The addendum should:
    1. Be written in clear, professional legal language.
    2. Specifically address the topics identified with 'RED' or 'YELLOW' risk scores.
    3. Propose new language that replaces or supplements the existing clauses in the original contract to align them with our model clauses. Use the original contract for context on tone and style.
    4. Be structured as a standalone document that can be attached to the main agreement. 
    5. Include a preamble, placeholder sections for party names ([Party A Name], [Party B Name]), effective date ([Date]), and signature blocks.
    6. Output the entire addendum as a single block of text. Do not use JSON or Markdown formatting. Start with "AI SERVICES ADDENDUM".
  `;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: {
      parts: [filePart, { text: prompt }],
    },
  });

  return response.text;
};

const formatTopicList = (items: ScorecardData): string => {
    const topics = items.map(item => `'${item.topic}'`);
    if (topics.length === 0) return '';
    if (topics.length === 1) return topics[0];
    const last = topics.pop() as string;
    return `${topics.join(', ')} and ${last}`;
};

export const generateScorecardSummarySpeech = async (
  scorecardData: ScorecardData
): Promise<string> => {
    const redItems = scorecardData.filter(item => item.score === Score.RED);
    const yellowItems = scorecardData.filter(item => item.score === Score.YELLOW);
    const greenItems = scorecardData.filter(item => item.score === Score.GREEN);
    const totalIssues = redItems.length + yellowItems.length;

    const summaryParts: string[] = ["The contract analysis is complete."];
    
    if (totalIssues === 0) {
        if (greenItems.length > 0) {
            summaryParts.push("All clauses reviewed are compliant with our model standards.");
        } else {
            summaryParts.push("No scorable clauses were found in the contract.");
        }
    } else {
        const plural = totalIssues > 1 ? 'issues' : 'issue';
        summaryParts.push(`We found a total of ${totalIssues} ${plural} requiring attention.`);
        
        redItems.forEach(item => {
            summaryParts.push(`The '${item.topic}' clause is rated as high-risk.`);
        });

        yellowItems.forEach(item => {
            summaryParts.push(`The '${item.topic}' clause is rated as medium-risk.`);
        });

        if (greenItems.length > 0) {
            const pluralClauses = greenItems.length > 1 ? 'clauses are' : 'clause is';
            summaryParts.push(`The ${formatTopicList(greenItems)} ${pluralClauses} compliant.`);
        }
    }

    const summaryText = summaryParts.join(' ');

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say with a professional and clear tone: ${summaryText}` }] }],
      config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
              voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Kore' },
              },
          },
      },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
      throw new Error("No audio data returned from API.");
  }

  return base64Audio;
};