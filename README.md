
# 🍌Banana Graphic Studio

Welcome to Banana Graphic Studio! This is a web-based tool designed for editing graphics, particularly for ROM hacking projects, by overlaying text using bitmap fonts or standard system fonts. It features a real-time preview, comprehensive profile management, AI-powered text generation, batch processing, and various text effects.

## Features

*   **Real-time Preview:** Instantly see changes to your text and image compositions.
*   **Dual Render Modes:**
    *   **Bitmap Font Rendering:** Use custom bitmap font sheets for a retro look.
    *   **System Font Rendering:** Utilize standard system fonts or upload custom TTF/OTF/WOFF fonts.
*   **Text Module Management:** Create, configure, and manage multiple text overlays.
*   **Advanced Text Styling:**
    *   Positioning, scaling, line height, line wrapping, and alignment.
    *   Tag-based colorization for specific text segments (`<C#RRGGBB>...</C>`).
    *   Shadow and outline effects for both bitmap and system fonts.
*   **AI-Powered Text Generation:** Leverage Gemini API to generate creative text content (requires API key).
*   **Profile Management:**
    *   Save and load complete editor sessions (images, fonts, text modules) as JSON profiles.
    *   Export and import profiles for backup or sharing.
    *   In-browser Profile Library for quick access to saved sessions.
    *   Support for loading profiles from a local `profiles/` directory.
*   **Batch Image Generation:** Create multiple image variations from a single setup using batch mode in text modules, outputting to a ZIP file.
*   **Internationalization:** Available in English (EN) and Portuguese (PT).
*   **Custom Font Upload:** Support for uploading and using TTF, OTF, WOFF, and WOFF2 fonts in System Font mode.

## Getting Started

### Prerequisites
*   A modern web browser (e.g., Chrome, Firefox, Edge) with JavaScript enabled.

### Optional: AI Features (Gemini API)
To use the AI-powered text generation features:
1.  You need a Google Gemini API Key.
2.  The application must be run in an environment where this API key is available as an environment variable named `API_KEY`.
    *   Example: `API_KEY="YOUR_GEMINI_API_KEY"`
3.  The application **does not** provide a UI to enter this key; it must be pre-configured in the execution environment. If the key is not found, AI features will be disabled.

### Optional: File-Based Profiles
You can load pre-configured profiles from the file system when the application starts:
1.  Create a directory named `profiles` in the same location as the `index.html` file.
2.  Place your profile `.json` files inside this `profiles/` directory.
3.  Inside the `profiles/` directory, create a file named `profiles-list.json`. This file should contain a JSON array of strings, where each string is the filename of a profile you want to load.
    *   Example `profiles/profiles-list.json`:
        ```json
        [
          "profile1.json",
          "another_profile.json"
        ]
        ```
These profiles will appear in the "Profile Library" when you launch the application.

## Basic Usage

1.  **Launch:** Open the `index.html` file in your browser.
2.  **Load Images:**
    *   In the "Preview Area" (left panel), upload your "Original Image" and "Editable Image".
    *   If using Bitmap Font mode, upload your "Font 1" and (optionally) "Font 2" bitmap font sheets.
3.  **Add Text Modules:**
    *   In the "Text Module Editor" (right panel), click "+ Add Module".
    *   Enter text and configure its appearance using the module's "Config" panel. Choose between "Bitmap Font" or "System Font" render modes and adjust settings accordingly.
4.  **Preview & Adjust:** See your changes live in the Preview Area. Drag modules on the canvas to reposition.
5.  **Save Your Work:**
    *   Use "Save Preview" to get the final image (or a ZIP for batch mode).
    *   Use "Export JSON" to save your entire project setup.
    *   Use "Save to Library" to save the setup for quick access later within the browser.

For a detailed walkthrough of all features, please refer to the [User Guide (tutorial.md)](tutorial.md).

## Contributing

Feel free to contribute to this project with code or simple ideas.
```
