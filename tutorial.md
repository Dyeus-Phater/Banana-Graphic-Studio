
# 🍌Banana Graphic Studio - User Guide

Welcome to 🍌Banana Graphic Studio! This web-based tool is designed for editing graphics, particularly for ROM hacking projects, by overlaying text using bitmap fonts or standard system fonts. It features a real-time preview, comprehensive profile management, AI-powered text generation, batch processing for multiple image outputs, and various text effects.

## Table of Contents
1.  [Getting Started](#getting-started)
    *   [Prerequisites](#prerequisites)
    *   [(Optional) AI Features](#optional-ai-features)
    *   [(Optional) File-Based Profiles](#optional-file-based-profiles)
2.  [User Interface Overview](#user-interface-overview)
    *   [Header Controls](#header-controls)
    *   [Preview Area](#preview-area)
    *   [Text Module Editor](#text-module-editor)
3.  [Step-by-Step Guide](#step-by-step-guide)
    *   [A. Initial Setup & Image Loading](#a-initial-setup--image-loading)
    *   [B. Working with the Preview Area](#b-working-with-the-preview-area)
    *   [C. Managing Text Modules](#c-managing-text-modules)
    *   [D. Detailed Text Module Configuration](#d-detailed-text-module-configuration)
        *   [General Text Settings](#general-text-settings)
        *   [Render Mode](#render-mode)
        *   [System Font Settings](#system-font-settings)
        *   [Bitmap Font Settings](#bitmap-font-settings-specific)
        *   [Colorization and Effects](#colorization-and-effects)
    *   [E. Using AI for Text Generation (Gen AI)](#e-using-ai-for-text-generation-gen-ai)
    *   [F. Batch Mode for Multiple Image Generation](#f-batch-mode-for-multiple-image-generation)
    *   [G. Saving and Managing Your Work](#g-saving-and-managing-your-work)
    *   [H. Using the Profile Library](#h-using-the-profile-library)
    *   [I. Changing Language](#i-changing-language)
4.  [Tips & Advanced Concepts](#tips--advanced-concepts)
5.  [Troubleshooting](#troubleshooting)

## 1. Getting Started

### Prerequisites
*   A modern web browser (e.g., Chrome, Firefox, Edge) with JavaScript enabled.

### (Optional) AI Features
The AI-powered text generation feature relies on the Gemini API. For this to work, the application must be run in an environment where the `API_KEY` (your Google Gemini API Key) is available as `process.env.API_KEY`. The application does not provide a UI to enter this key; it must be pre-configured.

### (Optional) File-Based Profiles
You can load pre-configured profiles from the file system:
1.  Create a `profiles/` directory at the root of where the application's `index.html` is served.
2.  Place your profile `.json` files inside this `profiles/` directory.
3.  Create a file named `profiles-list.json` inside the `profiles/` directory. This file should contain a JSON array of strings, where each string is the filename of a profile you want to load (e.g., `["profile1.json", "profile2.json"]`).
These profiles will then appear in the "Profile Library".

## 2. User Interface Overview

The application is divided into three main areas:

### Header Controls
Located at the top, this bar contains global actions:
*   **Save Preview:** Saves the current image from the preview area.
*   **Save to Library:** Saves the current entire editor setup as a profile in the browser's local storage.
*   **Export JSON:** Exports the current editor setup as a downloadable `.json` file.
*   **Import Profile:** Imports a `.json` profile file to load its settings into the editor.
*   **Profile Library / Back to Editor:** Toggles between the main editor view and the profile library.
*   **Language Switcher (EN/PT):** Changes the application's display language.

### Preview Area (Left Panel)
This area shows a live preview of your graphic with all text modules applied.
*   **Canvas:** Displays the image. You can drag text modules directly on it.
*   **Image Upload Buttons:** For "Original", "Editable", "Font 1" (Bitmap), and "Font 2" (Bitmap) images.
*   **View Toggle:** Switch between showing the "Original" or "Editable" base image.
*   **Zoom Controls:** Adjust the magnification of the preview canvas.
*   **Font Transparency Settings:** Global controls for processing Bitmap Font 1 and Font 2 images, including making a specific color transparent and applying soft transparency. (These settings apply only to Bitmap Font render mode).

### Text Module Editor (Right Panel)
This is where you create, manage, and customize individual text overlays (modules).
*   **Add Module Button:** Creates a new text module.
*   **Module List:** Each module has its own card with controls for its name, text content, and access to AI, cloning, configuration, and deletion.
*   **Configuration Panel (per module):** Appears when a module's "Config" button is active, allowing detailed adjustments to text appearance, effects, and font settings (Bitmap or System).

## 3. Step-by-Step Guide

### A. Initial Setup & Image Loading
1.  **Upload Base Images:**
    *   In the "Preview Area", click the **"Original"** button to upload your primary graphic (e.g., a game screenshot, title screen).
    *   Click the **"Editable"** button to upload the image that text will be rendered onto. Often, this is the same as the original image.
2.  **Upload Bitmap Font Images (Optional, for Bitmap Mode):**
    *   If using Bitmap Font rendering, click **"Font 1"** to upload your first bitmap font image (sprite sheet).
    *   Optionally, click **"Font 2"** for a second bitmap font.

### B. Working with the Preview Area
1.  **View Original/Editable:** Use the "Show Original" / "Show Editable" button (eye icon) at the top of the Preview Area to toggle the base image.
2.  **Zoom:** Use the "Zoom" slider or your mouse wheel while hovering over the canvas to zoom in or out.
3.  **Reposition Modules:** Click and drag any text module directly on the preview canvas to change its X/Y position.
4.  **Bitmap Font Transparency Settings:**
    *   For each bitmap font (Font 1 and Font 2), you can configure its global transparency processing. This is crucial if your font image has a background color you want to remove, or if you want to use colorization/effects which require the font glyphs to have transparent backgrounds.
    *   **Enable (Global):** Check this box to activate transparency processing for the selected font.
    *   **Transparent Color:** Use the color picker to select the color in your font image that should be made transparent.
    *   **Soft:** Check this to enable soft transparency (anti-aliasing effect at the edges of transparency).
    *   **Radius Slider (for Soft):** Adjusts the intensity/feathering of the soft transparency.
    *   *Note:* These settings process the uploaded bitmap font image. For effects like font colorization or outlines to work correctly with bitmap fonts, the font's background usually needs to be transparent. These settings do *not* apply to System Fonts.

### C. Managing Text Modules
1.  **Add Module:** Click the **"+ Add Module"** button in the "Text Module Editor" panel. A new module card will appear.
2.  **Name Module:** Click on the default module name (e.g., "Module 1") to edit it.
3.  **Enter Text:** Type your desired text into the large text area within the module card. Use `\n` to create new lines.
4.  **Module Controls (on each module card):**
    *   **Sparkles Icon (Gen AI):** Opens the AI text generation panel for this module.
    *   **Clone Icon:** Duplicates the current module with all its settings.
    *   **Configure Icon (Cog):** Toggles the detailed configuration panel for this module. Click again to hide it ("Hide").
    *   **Trash Icon:** Deletes the module.

### D. Detailed Text Module Configuration
Click the "Config" (cog) icon on a module to open its settings panel.

#### General Text Settings
These apply regardless of Render Mode:
*   **Position X/Y:** Adjusts the module's top-left origin point on the canvas. Can also be set by dragging on the preview.
*   **Scale X/Y:** Stretches or shrinks the text horizontally/vertically.
*   **Zoom Factor:** An additional scaling factor applied to the module's text, independent of the main preview zoom.
*   **Line Height:** Adjusts the vertical spacing between lines of text.
*   **Horizontal Alignment:** (Left, Center, Right) Aligns text within its calculated bounding box.
*   **Vertical Alignment:** (Top, Center, Bottom) Aligns the entire text block relative to its Y position.
*   **Line Wrap Width:** Set a pixel width at which text will automatically wrap to the next line. Set to 0 for no automatic wrapping (only `\n` will create new lines).

#### Render Mode
*   **Render Mode:** Choose between:
    *   **Bitmap Font:** Uses uploaded font images (Font 1 or Font 2) and their specific settings.
    *   **System Font:** Uses standard fonts available in the browser or custom TTF/OTF fonts you upload.

#### System Font Settings
These settings appear when **Render Mode** is set to **"System Font"**:
*   **Font Family:**
    *   Select a common web-safe font from the dropdown.
    *   Select **"Upload Custom Font..."** to upload your own TTF, OTF, WOFF, or WOFF2 font file. Once uploaded, this font will be used, and its filename will appear in the dropdown (e.g., "Custom: MyFont.ttf").
    *   If a custom font is active, a **"Remove Custom: {fontName}"** button appears below, allowing you to revert to standard fonts.
*   **Font Size (px):** Sets the size of the system font in pixels.
*   **Font Weight:** (Normal, Bold)
*   **Font Style:** (Normal, Italic)
*   **System Font Color:** Pick the base color for the text. This can be overridden by color tags.

#### Bitmap Font Settings (Specific)
These settings appear when **Render Mode** is set to **"Bitmap Font"**:
*   **Selected Font:** Choose whether this module uses "Font 1" or "Font 2".
*   **Character Sequence:** **Crucial!** This string defines the mapping of characters to tiles in your font image. The order of characters here *must* exactly match the order they appear in your font sheet (left-to-right, top-to-bottom).
*   **Tile Width/Height:** Dimensions of a single character tile in your font image.
*   **Offset X/Y:** Starting pixel offset (top-left) on the font image sheet before the first character tile.
*   **Separation X/Y:** Pixel spacing between individual character tiles on the font sheet.
*   **Baseline X/Y:** Fine-tuning offset applied when drawing each character.
*   **Character Spacing:** Additional horizontal space added between rendered characters in the module's text.
*   **Enable Pixel Scanning:** If checked, the tool attempts to determine the actual visual width of each character by scanning its pixels (requires font transparency). Useful for proportional fonts or fonts with empty space within their tiles. If unchecked, `Tile Width` is used for character advance.
*   **Font Colorization (Bitmap Multiply):**
    *   **Enable Default Colorization:** Check to apply a global color to the text in this module using a "multiply" filter effect. This requires the font to have a transparent background and typically works best with white or light-colored fonts. (This option is specific to Bitmap mode).
    *   **Default Color:** Pick the color to apply.

#### Colorization and Effects
These settings apply to **both Bitmap and System font modes**:

*   **Tag-Based Text Colorization:**
    *   Allows coloring specific parts of your text.
    *   **Instruction:** Use tags like `<C#RRGGBB>` or `<C#RGB>` to start a color and `</C>` to end it. Example: `Hello <C#FF0000>World</C>!`
    *   **Tag Color Selector:** Pick a color using the color picker.
    *   **Opening/Closing Tag:** These fields show the generated tags for the selected color.
    *   **Shortcut:** Select text in the module's text area, then press `Ctrl+P` (Windows/Linux) or `Cmd+P` (Mac) to automatically wrap the selection with the color tags generated from the "Tag Color Selector". This works for both Bitmap and System font modes.

*   **Effects (Both Modes):**
    *   **Shadow:**
        *   **Enable Shadow:** Check to add a drop shadow.
        *   **Shadow Color:** Color of the shadow.
        *   **Offset X/Y:** Shadow position relative to the text.
        *   **Blur Radius:** How blurry the shadow is.
    *   **Outline:**
        *   **Enable Outline:** Check to add an outline.
        *   **Outline Color:** Color of the outline.
        *   **Width:** Thickness of the outline in pixels.
    *   *Note for Bitmap Fonts:* For shadow and outline effects to render correctly, the font glyphs generally need to have transparent backgrounds. This is achieved via the global font transparency settings in the Preview Area. System fonts naturally handle transparency.

### E. Using AI for Text Generation (Gen AI)
(Requires `API_KEY` to be configured, see [Getting Started](#optional-ai-features))

1.  On a text module card, click the **Sparkles Icon (Gen AI)**.
2.  The AI panel will appear. Enter your desired prompt (e.g., "A witty one-liner for a game over screen") into the "AI Prompt" text area.
3.  Click **"Generate Text"**.
4.  Once generated, the AI's response will appear. You can then:
    *   Click **"Replace Module Text"** to overwrite the module's current text with the AI text.
    *   Click **"Append to Module Text"** to add the AI text to the end of the module's current text (on a new line).
5.  If the "Gen AI" button is not visible or functional, the API key may not be set up.

### F. Batch Mode for Multiple Image Generation
This mode is useful for generating multiple versions of your graphic where one or more text modules display different lines of text sequentially.

1.  **Enable Batch Mode:** On a text module, check the "Batch Mode (each line is a new image)" checkbox.
2.  **Enter Text Variants:** In that module's text area, enter each text variant on a new line.
    Example:
    ```
    Level 1 Complete
    Level 2 Complete
    Final Level!
    ```
3.  **Previewing:** As you click on different lines in the text area (or move the cursor between them), the Preview Area will update to show that specific line rendered by the batch module. Other non-batch modules will render normally. If multiple modules are in batch mode, the preview will show the respective line from each (e.g., line 1 from batch module A, line 1 from batch module B for the first image, then line 2 from A, line 2 from B for the second, etc. The shortest list of lines determines total images).
4.  **Saving Batch Previews:** When you click **"Save Preview"** in the Header Controls:
    *   If any module is in batch mode and has multiple lines, the application will generate a ZIP file.
    *   This ZIP file will contain a separate PNG image for each "frame" or combination of lines from the batch-enabled modules. The filenames will typically include the module name and a sequence number.
    *   A "Generating batch images, please wait..." message will appear during this process.

### G. Saving and Managing Your Work
1.  **Save Preview (Header Controls):**
    *   **Single Image (PNG):** If no modules are in "Batch Mode" or batch modules only have one line of text, this saves the current view from the Preview Area as a single `rom_graphic_preview.png` file.
    *   **Batch (ZIP):** If "Batch Mode" is active on any module with multiple lines, this generates `rom_graphic_batch_preview.zip` containing multiple PNGs (see [Batch Mode](#f-batch-mode-for-multiple-image-generation)).
2.  **Export JSON (Header Controls):**
    *   Saves the *entire current editor state* (all uploaded images as Base64, font settings, all text modules and their configurations) into a `.json` file (e.g., `rom_graphics_active_profile.json`). This file can be backed up or shared. Custom font files themselves are **not** embedded; only their filenames and generated family names are stored.
3.  **Import Profile (Header Controls):**
    *   Allows you to upload a `.json` file previously exported from this tool (or manually created, following the same structure). This will replace the current editor state with the settings from the imported file. If the profile used a custom font, you'll need to re-upload the font file if it's not already loaded in your browser session.

### H. Using the Profile Library
The Profile Library allows you to save and load complete editor sessions within your browser or from pre-configured files.

1.  **Accessing:** Click the "Profile Library" button in the header. To return to the editor, click "Back to Editor".
2.  **Saving Current Session to Library:**
    *   While in the "Profile Library" view, you can type a name in the "Enter profile name for library" field and click "Save to Library". This saves the session that was active in the editor.
    *   Alternatively, from the main editor view, click "Save to Library" in the header. You'll be prompted for a name.
    *   Saved profiles are stored in your browser's local storage.
3.  **Viewing Profiles:** The library displays cards for each saved profile, showing a preview (if an original image was part of the profile), name, ID, and module count.
    *   Profiles loaded from the `profiles/` directory (file-system based) are also shown here.
4.  **Loading a Profile:** Click "Load to Editor" on a profile card. This will load its settings into the main editor, and you'll be switched back to the editor view. If a profile used a custom font, you might need to re-upload it if the `FontFace` isn't active in your current browser session.
5.  **Deleting a Profile:** Click "Delete from Library" on a profile card.
    *   This only removes profiles stored in the browser's local storage.
    *   It **does not** delete file-system based profiles from your `profiles/` directory.

### I. Changing Language
*   In the Header Controls, click **"EN"** for English or **"PT"** for Portuguese. The UI will update accordingly. Your language preference is saved in the browser.

## 4. Tips & Advanced Concepts

*   **Bitmap Font Character Sequence:** This is one of the most critical settings for bitmap fonts. The string you enter in `Character Sequence` must precisely match the order of characters as they appear in your font image file (read left-to-right, then top-to-bottom). Any mismatch will result in wrong characters being displayed.
*   **Pixel Scanning (Bitmap):** For bitmap fonts where characters aren't all the same width (proportional fonts) or have significant empty space within their defined `Tile Width`, enabling "Pixel Scanning" can lead to more accurate character spacing and line wrapping. This requires the font to have a transparent background.
*   **Custom System Fonts:** Uploading TTF/OTF fonts allows for great flexibility. The font data is loaded into the browser session using `@font-face`. It's not stored in exported JSON profiles (only the filename is). If you load a profile using a custom font in a new session, you'll need to re-upload the font file for it to render correctly.
*   **Color Tags:** The format is `<C#RRGGBB>` (e.g., `<C#FF0000>` for red) or the shorthand `<C#RGB>` (e.g., `<C#F00>` for red). The closing tag is always `</C>`. Tags can be nested, but the innermost tag takes precedence. This works for both Bitmap and System font modes.
*   **Line Wrap Width:** This width is in pixels of the *source* image, before module-specific `Scale X` or `Zoom Factor` are applied. The actual wrap width on screen will be `Line Wrap Width * ScaleX * ZoomFactor`. For System Fonts, this is the unscaled pixel width.
*   **Bitmap Font Transparency vs. Effects:** For effects like "Font Colorization", "Shadow", and "Outline" to render correctly with bitmap fonts, the processed font glyphs need to have transparent backgrounds. This is achieved by correctly setting the "Transparent Color" for the font in the Preview Area's font settings, or by uploading a font image that already has a transparent background.

## 5. Troubleshooting

*   **AI Features Not Working:**
    *   Ensure the `API_KEY` is correctly configured in the application's environment (see [Getting Started](#optional-ai-features)).
    *   Check your internet connection.
    *   Check the browser's developer console for any error messages related to the API.
*   **Images/Fonts Not Loading:**
    *   If uploading, ensure the file is a valid image format (PNG, JPG, GIF are generally supported by browsers for base images; PNG is typical for font sheets).
    *   For TTF/OTF/WOFF/WOFF2 uploads, ensure the file is a valid font file.
    *   For file-based profiles from the `profiles/` directory, if images are not embedded as Base64, ensure paths are correct (though this app primarily uses Base64 for portability in JSON).
*   **Font Rendering Issues:**
    *   **Bitmap Fonts (Wrong Characters, Misaligned Text):**
        *   **Character Sequence:** Double-check this against your font image. This is the most common cause of incorrect characters.
        *   **Tile Width/Height:** Ensure these match the dimensions of a single character cell in your font image.
        *   **Offset X/Y & Separation X/Y:** Verify these accurately describe your font sheet's layout.
        *   **Enable Pixel Scanning:** Try toggling this. If it's on, ensure font transparency is set up correctly.
        *   **Font Transparency:** If characters have solid backgrounds when they shouldn't (affecting colorization or effects), review the global font transparency settings in the Preview Area.
    *   **System Fonts (Not Displaying Correctly):**
        *   If a custom uploaded font isn't appearing, try re-uploading it.
        *   Ensure the selected standard font family is commonly available or use a web-safe option.
        *   Check `Font Size` and `System Font Color` for visibility.
*   **Text Effects Not Appearing Correctly:**
    *   For Bitmap Fonts, this usually indicates that the font glyphs do not have a transparent background. See "Bitmap Font Transparency Settings" and ensure the font image is processed to remove its background color. System fonts handle this internally.

---

Happy Hacking with 🍌Banana Graphic Studio!
