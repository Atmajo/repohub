import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} from "@google/genai";
import { config } from "../config/config";
import logger from "../logger/logger";
import { GeminiFileType, GeminiResponseType, GeminiTextType } from "@/types";

const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

export const testResponse = async ({
  text,
}: GeminiTextType): Promise<GeminiResponseType> => {
  const response = await ai.models.generateContent({
    model: config.model,
    contents: text,
  });

  if (!response || !response.text) {
    logger.error("Failed to generate content");
    return {
      error: "Failed to generate content",
      success: false,
    };
  }

  return {
    text: response.text,
    success: true,
  };
};

export const fileResponse = async (
  files: GeminiFileType[]
): Promise<GeminiResponseType> => {
  if (!files || !Array.isArray(files) || files.length === 0) {
    logger.error("Invalid files array");
    return {
      error: "Invalid files array",
      success: false,
    };
  }

  try {
    const uploadPromises = files.map(async ({ path, mimeType }) => {
      if (!path || !mimeType) {
        logger.error(`Invalid file path or MIME type: ${path}`);
        return null;
      }

      const uploadedFile = await ai.files.upload({
        file: path,
        config: { mimeType },
      });

      if (!uploadedFile || !uploadedFile.uri || !uploadedFile.mimeType) {
        logger.error(`File upload failed for: ${path}`);
        return null;
      }

      return {
        uri: uploadedFile.uri,
        mimeType: uploadedFile.mimeType,
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);
    const validFiles = uploadedFiles.filter((file) => file !== null);

    if (validFiles.length === 0) {
      logger.error("No files were successfully uploaded");
      return {
        error: "No files were successfully uploaded",
        success: false,
      };
    }
    const fileParts = validFiles.map((file) =>
      createPartFromUri(file.uri, file.mimeType)
    );

    const response = await ai.models.generateContent({
      model: config.model,
      contents: createUserContent([
        ...fileParts,
        "Generate a readme.md file summarizing the project.",
        "Please ensure the readme.md is well-structured and includes sections like Introduction, Installation, Usage, and Contributing.",
        "start with '```markdown\n' and end with '\n```' to format the markdown correctly.",
      ]),
    });
    
    if (!response || !response.text) {
      logger.error("Failed to generate content from files");
      return {
        error: "Failed to generate content from files",
        success: false,
      };
    }

    return {
      text: response.text.replace(/```markdown\n/, "").replace(/\n```$/, ""),
      success: true,
    };
  } catch (error) {
    logger.error(`Error processing files: ${error}`);
    return {
      error: `Error processing files: ${error}`,
      success: false,
    };
  }
};
