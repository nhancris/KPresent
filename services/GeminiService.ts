
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { KPresentAISlideResponse, Theme, SlideLayout, GenerationMode } from "../types";

let ai: GoogleGenAI | null = null;

const initializeGemini = () => {
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    try {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } catch (e) {
        console.warn("Failed to initialize GoogleGenAI. API_KEY might be missing or invalid.", e);
        ai = null;
    }
  } else {
    console.warn("API_KEY not found in process.env. GeminiService will use mock responses.");
    ai = null;
  }
};

initializeGemini();

const escapeXml = (unsafe: string): string => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
};

const generateMockSvg = (title: string, contentText: string, themeDesc: string, layoutHint: SlideLayout, theme: Theme): string => {
  const bgColor = theme.colorPalette.slideBackground || theme.colorPalette.background || '#FFFFFF';
  const titleColor = theme.colorPalette.titleText || theme.colorPalette.primary;
  const textColor = theme.colorPalette.bodyText || theme.colorPalette.textOnBackground;
  const accentColor = theme.colorPalette.accent;
  const primaryColor = theme.colorPalette.primary;
  const secondaryColor = theme.colorPalette.secondary;
  const textOnPrimary = theme.colorPalette.textOnPrimary;
  const textOnBackground = theme.colorPalette.textOnBackground;

  const headingFont = theme.fontPairing.heading.split(',')[0].replace(/"/g, '').trim() || 'Arial';
  const bodyFont = theme.fontPairing.body.split(',')[0].replace(/"/g, '').trim() || 'Helvetica';

  let svgElements = '';
  const defs = `
    <linearGradient id="titleBgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${primaryColor}; stop-opacity:0.9" />
      <stop offset="100%" style="stop-color:${secondaryColor}; stop-opacity:0.7" />
    </linearGradient>
    <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${accentColor}; stop-opacity:1" />
      <stop offset="60%" style="stop-color:${primaryColor}; stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:${secondaryColor}; stop-opacity:0.7" />
    </linearGradient>
    <filter id="subtleShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
      <feOffset dx="1" dy="1" result="offsetblur"/>
      <feFlood flood-color="${textColor}" flood-opacity="0.3"/>
      <feComposite in2="offsetblur" operator="in"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  `;
  
  svgElements += `<rect width="800" height="450" fill="${bgColor}" />`;

  const safeTitle = escapeXml(title);
  const safeContentText = escapeXml(contentText);

  const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number, font: string, size: number, color: string, weight: string = "normal", anchor: string = "start"): string => {
    const words = text.split(/\s+/);
    let lines = '';
    let currentLine = '';
    let lineCount = 0;
    const maxLines = layoutHint === SlideLayout.TITLE_SLIDE || layoutHint === SlideLayout.TITLE_ONLY ? 3 : 5; 

    words.forEach(word => {
      if (lineCount >= maxLines) return;
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      // Primitive width estimation, better would be to use getComputedTextLength if possible in context
      if (testLine.length * (size * 0.6) > maxWidth && currentLine) { 
        lines += `<tspan x="${x}" dy="${lineCount === 0 ? 0 : lineHeight}em">${currentLine}</tspan>`;
        currentLine = word;
        lineCount++;
      } else {
        currentLine = testLine;
      }
    });
    if (lineCount < maxLines && currentLine) {
      lines += `<tspan x="${x}" dy="${lineCount === 0 ? 0 : lineHeight}em">${currentLine}</tspan>`;
    } else if (lineCount >= maxLines && currentLine) {
        // Truncate the last possible line if it still overflows and we are at maxLines
        let truncatedLine = currentLine;
        while (truncatedLine.length * (size * 0.6) > maxWidth && truncatedLine.length > 0) {
            truncatedLine = truncatedLine.slice(0, -1);
        }
        lines += `<tspan x="${x}" dy="${lineCount === 0 ? 0 : lineHeight}em">${truncatedLine}...</tspan>`;
    }
    return `<text font-family="${font}" font-size="${size}" fill="${color}" font-weight="${weight}" text-anchor="${anchor}" y="${y}">${lines}</text>`;
  };


  switch (layoutHint) {
    case SlideLayout.TITLE_SLIDE:
      svgElements += `<rect x="0" y="0" width="800" height="450" fill="url(#titleBgGradient)" />`;
      svgElements += `<path d="M0 0 L400 0 L300 450 L0 450 Z" fill="${accentColor}" opacity="0.4"/>`;
      svgElements += `<path d="M800 0 L500 0 L600 450 L800 450 Z" fill="${accentColor}" opacity="0.4" transform="translate(800, 0) scale(-1, 1) translate(-800, 0)"/>`;
      svgElements += `<text x="400" y="200" dominant-baseline="middle" text-anchor="middle" font-family="${headingFont}" font-size="48" fill="${textOnPrimary}" font-weight="bold" filter="url(#subtleShadow)">${safeTitle}</text>`;
      svgElements += wrapText(safeContentText, 400, 280, 600, 1.4, bodyFont, 20, textOnPrimary, "normal", "middle");
      break;
    case SlideLayout.SECTION_HEADER:
      svgElements += `<rect x="0" y="150" width="800" height="150" fill="${primaryColor}" />`;
      svgElements += `<rect x="0" y="140" width="800" height="10" fill="${accentColor}" />`;
      svgElements += `<rect x="0" y="300" width="800" height="10" fill="${accentColor}" />`;
      svgElements += `<text x="400" y="225" dominant-baseline="middle" text-anchor="middle" font-family="${headingFont}" font-size="40" fill="${textOnPrimary}" font-weight="semibold" letter-spacing="2">${safeTitle}</text>`;
      break;
    case SlideLayout.TITLE_ONLY: // For "Thank You" or similar
      svgElements += `<rect x="0" y="0" width="800" height="450" fill="${bgColor}" />`;
      svgElements += `<path d="M0 350 Q100 320 200 350 L200 450 L0 450 Z" fill="${primaryColor}" opacity="0.3"/>`;
      svgElements += `<path d="M800 100 Q700 130 600 100 L600 0 L800 0 Z" fill="${secondaryColor}" opacity="0.3"/>`;
      svgElements += `<text x="400" y="200" dominant-baseline="middle" text-anchor="middle" font-family="${headingFont}" font-size="60" fill="${titleColor}" font-weight="bold">${safeTitle}</text>`;
      if (safeContentText && safeContentText.trim() !== '') {
          svgElements += `<text x="400" y="270" dominant-baseline="middle" text-anchor="middle" font-family="${bodyFont}" font-size="30" fill="${textColor}">${safeContentText}</text>`;
      }
      break;
    case SlideLayout.TITLE_CONTENT:
      svgElements += `<rect x="0" y="0" width="800" height="80" fill="${primaryColor}" />`;
      svgElements += `<text x="40" y="45" dominant-baseline="middle" font-family="${headingFont}" font-size="32" fill="${textOnPrimary}" font-weight="semibold">${safeTitle}</text>`;
      svgElements += `<rect x="750" y="10" width="30" height="60" fill="${accentColor}" rx="5"/>`;
      
      const contentBgIsDark = parseInt(bgColor.substring(1,3), 16) < 100; 
      const contentTextRectFill = contentBgIsDark ? `rgba(255,255,255,0.08)` : `rgba(0,0,0,0.04)`;

      svgElements += `<rect x="30" y="100" width="470" height="330" fill="${contentTextRectFill}" rx="8"/>`;
      svgElements += wrapText(safeContentText, 40, 120, 450, 1.5, bodyFont, 18, textColor);

      svgElements += `<rect x="520" y="100" width="250" height="320" fill="${secondaryColor}" opacity="0.3" rx="10" />`;
      svgElements += `<text x="645" y="260" dominant-baseline="middle" text-anchor="middle" font-family="${bodyFont}" font-size="16" fill="${textOnBackground}" opacity="0.7">[Visual Area for Image/Chart]</text>`;
      break;
    case SlideLayout.QUOTE_SLIDE:
      svgElements += `<path d="M50 50 Q100 20 150 50 L150 150 L50 150 Z" fill="${accentColor}" opacity="0.2"/>`;
      svgElements += `<path d="M750 400 Q700 430 650 400 L650 300 L750 300 Z" fill="${accentColor}" opacity="0.2"/>`;
      svgElements += wrapText(`“${safeContentText}”`, 400, 225, 650, 1.4, bodyFont, 30, primaryColor, "italic", "middle");
      svgElements += `<text x="400" y="350" dominant-baseline="middle" text-anchor="middle" font-family="${headingFont}" font-size="24" fill="${textColor}" font-weight="semibold">- ${safeTitle}</text>`;
      break;
    default: 
      svgElements += `<rect x="20" y="20" width="760" height="60" fill="${secondaryColor}" opacity="0.2" rx="5"/>`;
      svgElements += `<text x="40" y="50" dominant-baseline="middle" font-family="${headingFont}" font-size="28" fill="${titleColor}">${safeTitle}</text>`;
      svgElements += `<line x1="40" y1="90" x2="760" y2="90" stroke="${accentColor}" stroke-width="2" />`;
      const defaultTextBgFill = parseInt(bgColor.substring(1,3), 16) < 100 ? `rgba(255,255,255,0.05)` : `rgba(0,0,0,0.03)`;
      svgElements += `<rect x="30" y="105" width="740" height="325" fill="${defaultTextBgFill}" rx="5" />`;
      svgElements += wrapText(safeContentText, 40, 120, 720, 1.5, bodyFont, 18, textColor);
      svgElements += `<circle cx="50" cy="400" r="15" fill="${accentColor}" opacity="0.7"/>`;
      svgElements += `<circle cx="750" cy="50" r="10" fill="${primaryColor}" opacity="0.5"/>`;
  }
  
  return `<svg width="100%" height="100%" viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg"><defs>${defs}</defs>${svgElements}</svg>`;
};


export const generateSlideDataWithGemini = async (
  slideTopic: string, 
  layoutHint: SlideLayout, 
  theme: Theme, 
  slideNumber: number,
  overallPrompt: string,
  generationMode: GenerationMode = GenerationMode.NORMAL
): Promise<KPresentAISlideResponse> => {
  const themeDescription = `Current Theme: "${theme.name}". 
  Key Colors - Primary: ${theme.colorPalette.primary}, Secondary: ${theme.colorPalette.secondary}, Accent: ${theme.colorPalette.accent}, Slide Background: ${theme.colorPalette.slideBackground}, Title Text: ${theme.colorPalette.titleText}, Body Text: ${theme.colorPalette.bodyText}.
  Fonts - Heading: "${theme.fontPairing.heading}", Body: "${theme.fontPairing.body}".
  Design Style goal: Visually stunning, professional, and creative. Use the theme distinctively.`;

  if (!ai) {
    const mockTitle = `${slideTopic}`;
    let mockContent = `Content for: ${slideTopic.toLowerCase()}. Layout: ${layoutHint}. ${themeDescription}. Mode: ${generationMode}`;
    if (layoutHint === SlideLayout.TITLE_ONLY && (slideTopic.toLowerCase().includes("thank you") || slideTopic.toLowerCase().includes("q&a"))) {
        mockContent = "Q&A"; // Simpler content for "Thank You" type slides
    }

    const mockSvg = generateMockSvg(mockTitle, mockContent, themeDescription, layoutHint, theme);
    return {
      svgContent: mockSvg,
      speakerNotes: `Speaker notes for slide ${slideNumber}: Key discussion points for "${slideTopic}". Emphasize how this relates to the overall topic of "${overallPrompt}". Visually, this slide uses the "${theme.name}" theme and was generated in ${generationMode} mode. The layout hint was "${layoutHint}". Aim for clear, concise delivery.`,
      titleSuggestion: mockTitle,
    };
  }

  const modelName = generationMode === GenerationMode.ADVANCED 
    ? 'gemini-2.5-pro-preview-06-05' 
    : 'gemini-2.5-flash-preview-05-20';

  const systemInstruction = `You are an AI Presentation Design Agent. Your primary task is to generate data for a single, visually stunning presentation slide.
You MUST respond ONLY with a valid JSON object matching this exact structure: {"svgContent": "<svg_markup_here>", "speakerNotes": "notes_here", "titleSuggestion": "title_here"}. NO OTHER TEXT OR EXPLANATION.
The root SVG tag MUST use viewBox="0 0 800 450" (for 16:9 aspect ratio) and width="100%" height="100%" to ensure it's responsive within its container.
All visual elements (text, shapes, paths) MUST be drawn comfortably WITHIN the 0,0 to 800,450 coordinates of the viewBox. No elements should overflow or be clipped.
Text size MUST be appropriate for its role (title, body, caption) and ALWAYS legible. Ensure sufficient font size and contrast. For "TITLE_ONLY" layouts like "Thank You" or "Q&A", use large, clear, but well-scaled fonts that fit entirely within the viewBox.
The SVG design should be beautiful, professional, and highly engaging.
Creatively and effectively incorporate the provided theme (colors, fonts) into the SVG's design. Use gradients, shadows, and sophisticated layout.
Ensure all text has excellent readability and high contrast against its immediate background. If using a complex or dark background pattern for a text area, place the text within a lighter, contrasting shape/block or ensure the text color itself provides sufficient contrast.
The SVG content MUST be directly relevant to the slide topic and layout hint.
For text in SVG, use <text> elements with appropriate x, y, font-family, font-size, fill, and font-weight. Handle text wrapping carefully using <tspan> elements for multiple lines. Ensure all text is escaped for XML.
SVG must be well-formed and self-contained. Do not use external images unless embedded as data URIs (prefer pure SVG shapes and text).
Speaker notes should be insightful and complement the visual content.
The title suggestion should be concise and compelling.`;

  const userQuery = `Generate slide data for:
Slide Topic: "${slideTopic}"
Layout Hint: "${layoutHint}"
Theme Description: "${themeDescription}"
Generation Mode: "${generationMode}"
Slide Number: ${slideNumber}
Overall Presentation Context: "${overallPrompt}"
Instruction: Make this slide exceptionally beautiful and visually interesting, leveraging the theme to its fullest, ensuring all content fits within an 800x450 viewBox, and prioritizing text readability and appropriate scaling, especially for titles.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: userQuery,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) { 
      jsonStr = match[1].trim();
    }
    
    const parsedData = JSON.parse(jsonStr) as KPresentAISlideResponse;
    if (!parsedData.svgContent || typeof parsedData.speakerNotes === 'undefined' || typeof parsedData.titleSuggestion === 'undefined') {
      console.error("AI response missing one or more required fields or has incorrect types:", parsedData);
      throw new Error("AI response missing one or more required fields (svgContent, speakerNotes, titleSuggestion) or fields have incorrect types.");
    }
    if (!parsedData.svgContent.startsWith("<svg") || !parsedData.svgContent.endsWith("</svg>")) {
        console.error("Generated SVG content seems invalid:", parsedData.svgContent);
        throw new Error("Generated SVG content does not appear to be a valid SVG string.");
    }

    return parsedData;

  } catch (error) {
    console.error(`Error generating slide data with Gemini (${modelName}) for topic "${slideTopic}":`, error);
    const mockTitle = `${slideTopic} (API Error Fallback - ${generationMode} mode)`;
    let mockContent = `Error generating content for slide ${slideNumber}. Topic: ${slideTopic.toLowerCase()}.\nLayout: ${layoutHint}.\nError details: ${error instanceof Error ? error.message : String(error)}. Original Theme: ${theme.name}`;
    if (layoutHint === SlideLayout.TITLE_ONLY && (slideTopic.toLowerCase().includes("thank you") || slideTopic.toLowerCase().includes("q&a"))) {
        mockContent = "Q&A";
    }
    const mockSvg = generateMockSvg(mockTitle, mockContent, themeDescription, layoutHint, theme);
    return {
      svgContent: mockSvg,
      speakerNotes: `Error state speaker notes for slide ${slideNumber}. API call failed. Original topic: ${slideTopic}. The AI was instructed to create a visually rich slide based on layout hint '${layoutHint}' and theme '${theme.name}' in ${generationMode} mode. Error: ${error instanceof Error ? error.message : String(error)}`,
      titleSuggestion: mockTitle,
    };
  }
};

export const refineImagePromptWithGemini = async (originalPrompt: string, generationMode: GenerationMode = GenerationMode.NORMAL): Promise<string> => {
  if (!ai) {
    return `Mock refined (${generationMode}): High-quality, professional image depicting ${originalPrompt}, suitable for a presentation, clear visuals.`;
  }
  
  if (!originalPrompt || !originalPrompt.trim()) {
    return "A beautiful, generic placeholder image that is abstract and visually appealing.";
  }
  
  const modelName = generationMode === GenerationMode.ADVANCED 
    ? 'gemini-2.5-pro-preview-06-05' 
    : 'gemini-2.5-flash-preview-05-20';

  const systemInstruction = `You are an expert prompt engineer for text-to-image AI models. Your task is to take a user's basic idea for an image and transform it into a highly descriptive, artistically-informed prompt. The prompt should be concise (max 70 words) and specify style (e.g., photorealistic, watercolor, abstract, vector art), subject matter, composition details, lighting conditions, and overall mood. Aim for prompts that generate visually stunning and contextually relevant images for a professional presentation.`;
  const userQuery = `User's image idea: "${originalPrompt}" (Targeting ${generationMode} quality image generation)`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: userQuery,
      config: { systemInstruction: systemInstruction }
    });
    
    const refinedText = response.text;
    
    if (!refinedText || refinedText.trim() === '') {
        return `Detailed, professional quality image focusing on: ${originalPrompt}. Clear background, good lighting. (${generationMode} mode)`;
    }
    return refinedText.trim();

  } catch (error) {
    console.error(`Error refining image prompt with Gemini (${modelName}):`, error);
    return `Error refining prompt. Original idea: ${originalPrompt}. Please ensure the image is high quality. (${generationMode} mode)`;
  }
};