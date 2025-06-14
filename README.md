
# KPresent Architect

KPresent Architect is a web application designed to interface with an AI agent for generating and customizing presentations (referred to as "KPresents"). Users can input topics and preferences, receive an AI-generated KPresent composed of SVG-based slides, and interactively edit content, themes, speaker notes, and even the raw SVG code before conceptually downloading a `.PPTX` file.

The application simulates an advanced AI-driven workflow, where "AI agents" conceptualize and render each slide as an SVG, offering different generation modes for varying complexity and detail.

## Features

*   **AI-Driven Slide Generation:** Conceptually uses AI (simulated via Gemini API structure) to generate entire slide content, including:
    *   SVG-based visuals for each slide.
    *   Speaker notes.
    *   Slide titles.
*   **Two Generation Modes:**
    *   **Normal Mode:** Utilizes `gemini-2.5-flash-preview-05-20` (conceptually) for faster generation.
    *   **Advanced Mode:** Utilizes `gemini-2.5-pro-preview-06-05` (conceptually) for potentially higher quality and more complex SVG generation.
*   **Interactive Editor:**
    *   View and navigate through generated slides.
    *   Edit slide titles and speaker notes.
    *   Customize presentation themes (colors, fonts).
    *   Modify slide transitions.
    *   Directly edit the raw SVG markup for each slide.
*   **AI Slide Regeneration:** Re-prompt the AI to regenerate individual slides with new focus points.
*   **Dynamic Loading Experience:** Features engaging, agentic-style loading messages that reflect the AI's "thinking" process.
*   **Responsive Design:** UI built with Tailwind CSS for various screen sizes.
*   **Conceptual PPTX Export:** Simulates the final step of downloading a presentation (logs JSON to console).

## Tech Stack (Frontend Focus)

*   **React 19:** For building the user interface.
*   **TypeScript:** For static typing and improved code quality.
*   **Tailwind CSS:** For utility-first styling.
*   **@google/genai (Gemini API):** Conceptually integrated for AI content generation. The application includes mock responses if an API key is not available, allowing UI and workflow demonstration.

## File Structure

The project is organized as follows:

```
.
├── components/                 # React components for different UI sections
│   ├── KPresentActiveSlideDisplay.tsx
│   ├── KPresentControlPanel.tsx
│   ├── KPresentEditorSection.tsx
│   ├── KPresentInputSection.tsx
│   ├── KPresentLoadingSection.tsx
│   └── KPresentSlideListPanel.tsx
├── services/                   # Logic for presentation generation and AI interaction
│   ├── KPresentGeminiService.ts  # Handles (mocked) Gemini API calls
│   └── KPresentService.ts        # Orchestrates presentation generation logic
├── KPresentApp.tsx             # Main application component
├── constants.ts                # Default themes, fonts, and other constants
├── index.html                  # Main HTML entry point
├── index.tsx                   # React root rendering
├── metadata.json               # Application metadata
├── types.ts                    # TypeScript type definitions
└── README.md                   # This file
```

## How It Works (High-Level Workflow)

1.  **Input:** The user provides a presentation topic, desired number of slides, optional tone/style preferences, and selects a Generation Mode (Normal or Advanced).
2.  **Loading & AI Simulation:** The application displays a dynamic loading screen with agentic messages simulating a complex AI generation process.
    *   `KPresentService.ts` orchestrates the creation of the KPresent structure.
    *   For each slide, `KPresentGeminiService.ts` is called (conceptually, or with mock data) to generate:
        *   An SVG string representing the entire visual content of the slide.
        *   Speaker notes.
        *   A suggested slide title.
    *   The AI is instructed (via system prompts) to adhere to theme constraints, ensure text readability, and create visually appealing SVG.
3.  **Editing:** The generated KPresent is displayed in the `KPresentEditorSection`. The user can:
    *   Navigate slides via `KPresentSlideListPanel`.
    *   View the active slide's SVG in `KPresentActiveSlideDisplay`.
    *   Use `KPresentControlPanel` to:
        *   Modify slide titles, background fallbacks, and transitions.
        *   Change the overall theme (colors, fonts).
        *   Edit speaker notes.
        *   Re-prompt the AI to regenerate the current slide's SVG.
        *   Directly edit the raw SVG code for the active slide.
4.  **Download (Conceptual):** A "Download .PPTX" button logs the KPresent JSON (including all SVG content) to the console. In a full application, this JSON would be sent to a backend service capable of converting this data (e.g., SVGs to images) into a native `.PPTX` file.

## Key Components

*   **`KPresentApp.tsx`:** The root component, managing application state (input, loading, editing) and orchestrating interactions between major sections.
*   **`KPresentInputSection.tsx`:** Handles user input for generating a new KPresent.
*   **`KPresentLoadingSection.tsx`:** Displays dynamic progress messages during KPresent generation.
*   **`KPresentEditorSection.tsx`:** The main workspace for viewing and customizing the generated KPresent. It integrates the slide list, active slide display, and control panel.
*   **`KPresentSlideListPanel.tsx`:** Shows thumbnails of all slides for navigation, adding, and deleting slides.
*   **`KPresentActiveSlideDisplay.tsx`:** Renders the SVG content of the currently selected slide.
*   **`KPresentControlPanel.tsx`:** Provides tools to edit properties of the active slide, change themes, edit speaker notes, regenerate slides with AI, and edit SVG code.

## Gemini API Integration (Conceptual)

*   `KPresentGeminiService.ts` is structured to interact with the Google GenAI SDK.
*   It includes functions like `generateSlideDataWithGemini` (to get SVG, notes, title) and `refineImagePromptWithGemini` (for image prompt enhancement, though image elements are not currently the primary focus).
*   **API Key:** The service attempts to initialize using `process.env.API_KEY`. If the key is not found (as would be the case in a purely frontend demo without a build step to inject environment variables), it gracefully falls back to using mock SVG and text responses. This allows the application's UI and workflow to be fully demonstrated.
*   **System Prompts:** Detailed system instructions are provided to the conceptual AI to guide its SVG generation, focusing on aesthetics, responsiveness (viewBox usage), text legibility, and theme adherence.

## Setup & Running (Conceptual)

As a frontend-focused application using ES Modules and direct CDN imports for React/Tailwind:
1.  Ensure you have a modern web browser.
2.  Serve the `index.html` file using a simple local web server (e.g., `python -m http.server`, Live Server extension in VS Code, or similar).
3.  Open the served `index.html` in your browser.

No complex build process is strictly necessary for this demonstration version. If `process.env.API_KEY` were to be used with actual API calls, a build environment (like Vite or Create React App) would typically be used to manage environment variables.

## Future Enhancements

*   **Real `.PPTX` Export:** Integrate a backend service (e.g., using libraries like `python-pptx` or Aspose.Slides) to convert the KPresent JSON (with SVGs rendered as images or embedded) into a downloadable `.PPTX` file.
*   **More Interactive SVG Editing:** Allow direct manipulation of elements within the SVG (drag, resize, text editing) on the canvas.
*   **Image Generation/Upload:** Fully integrate image generation (using AI like Imagen) and allow users to upload their own images to be incorporated into slides (potentially as part of the SVG or as separate elements).
*   **Advanced Animation Controls:** Provide more granular control over slide and element animations.
*   **User Accounts & Storage:** Allow users to save and manage their KPresents.
