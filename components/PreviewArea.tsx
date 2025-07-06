
import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { TextModule, Profile, HorizontalAlignment, VerticalAlignment, BitmapFontSettings, TextSettings } from '../types';
import { ICONS } from '../constants';
import { Button } from './ui/ButtonComponents';
import { FileInputButton, SliderInput } from './ui/InputComponents'; 
import { Language } from '../App';

interface PreviewAreaProps {
  profile: Profile;
  onUpdateProfileImage: (imageType: 'originalImage' | 'editableImage' | 'bitmapFontImage' | 'bitmapFontImage2', dataUrl: string | null) => void;
  onUpdateProfileFontSettings: (
    fontNumber: 1 | 2,
    settings: Partial<Pick<Profile, 
      'bitmapFontEnableTransparency' | 'bitmapFontTransparentColor' | 'bitmapFontSoftTransparency' | 'bitmapFontSoftTransparencyRadius' |
      'bitmapFontEnableTransparency2' | 'bitmapFontTransparentColor2' | 'bitmapFontSoftTransparency2' | 'bitmapFontSoftTransparencyRadius2'
    >>
  ) => void;
  onUpdateModulePosition: (moduleId: string, newPosition: { x: number, y: number }) => void;
  canvasWidth?: number;
  canvasHeight?: number;
  language: Language;
}

const previewAreaTranslations = {
  en: {
    previewTitle: "Preview",
    showEditable: "Show Editable",
    showOriginal: "Show Original",
    zoomLabel: "Zoom:",
    originalButton: "Original",
    editableButton: "Editable",
    font1Button: "Font 1",
    font2Button: "Font 2",
    font1TransparencyTitle: "Font 1 Transparency",
    font2TransparencyTitle: "Font 2 Transparency",
    neededForEffects: "Needed for colorization & effects.",
    enableGlobal: "Enable (Global)",
    transparentColorLabel: "Transparent Color:",
    softLabel: "Soft",
    uploadOriginalPlaceholder: "Upload Original Image",
    uploadEditablePlaceholder: "Upload Editable Image",
  },
  pt: {
    previewTitle: "Prévia",
    showEditable: "Mostrar Editável",
    showOriginal: "Mostrar Original",
    zoomLabel: "Zoom:",
    originalButton: "Original",
    editableButton: "Editável",
    font1Button: "Fonte 1",
    font2Button: "Fonte 2",
    font1TransparencyTitle: "Transparência da Fonte 1",
    font2TransparencyTitle: "Transparência da Fonte 2",
    neededForEffects: "Necessário para colorização e efeitos.",
    enableGlobal: "Habilitar (Global)",
    transparentColorLabel: "Cor Transparente:",
    softLabel: "Suave",
    uploadOriginalPlaceholder: "Carregar Imagem Original",
    uploadEditablePlaceholder: "Carregar Imagem Editável",
  }
};


interface GlyphMetrics {
  scanX: number;      
  scanWidth: number;  
  tileX: number;      
  tileY: number;      
  tileW: number;      
  tileH: number;      
}

interface RgbColor { r: number; g: number; b: number; }

function hexToRgb(hex: string): RgbColor | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function calculateColorDistance(color1: RgbColor, color2: RgbColor): number {
  const dr = color1.r - color2.r;
  const dg = color1.g - color2.g;
  const db = color1.b - color2.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

const getCharRenderWidthBitmap = (
    char: string,
    fontSettings: BitmapFontSettings,
    textSettings: TextSettings, // Only for scaleX, zoomFactor
    fontImage: HTMLImageElement | undefined, 
    sequenceGlyphCache: Map<string, GlyphMetrics> | undefined
): number => {
    const { tileWidth, enablePixelScanning } = fontSettings;
    const effectiveScaleX = textSettings.scaleX * textSettings.zoomFactor;
    let baseWidth = 0;

    if (enablePixelScanning && sequenceGlyphCache) {
        const metrics = sequenceGlyphCache.get(char);
        if (metrics) {
            if (metrics.scanWidth > 0) {
                baseWidth = metrics.scanWidth;
            } else if (metrics.scanWidth === 0 && char === ' ') { 
                baseWidth = tileWidth / 2; 
            } else { 
                baseWidth = 0;
            }
        } else { 
            baseWidth = (char === ' ') ? (fontImage && fontImage.naturalWidth > 0 ? tileWidth / 2 : 0) : 0;
        }
    } else { 
        if (fontSettings.characterSequence.includes(char)) {
            baseWidth = tileWidth;
        } else { 
            baseWidth = (char === ' ') ? (fontImage && fontImage.naturalWidth > 0 ? tileWidth / 2 : 0) : 0;
        }
    }
    return baseWidth * effectiveScaleX;
};

const generateWrappedLinesBitmap = (
    moduleWithPotentiallyModifiedText: TextModule, 
    fontImage: HTMLImageElement | undefined, 
    sequenceGlyphCache: Map<string, GlyphMetrics> | undefined
): string[] => {
    const { text, textSettings, bitmapFontSettings } = moduleWithPotentiallyModifiedText;
    const { lineWrapWidth, scaleX, zoomFactor } = textSettings;
    const { characterSpacing } = bitmapFontSettings;

    const effectiveScaleX = scaleX * zoomFactor;
    const actualPixelWrapWidth = lineWrapWidth > 0 ? lineWrapWidth * effectiveScaleX : 0;

    if (actualPixelWrapWidth <= 0) {
        return text.split('\\n'); 
    }

    const finalLines: string[] = [];
    const paragraphs = text.split('\\n');
    const scaledInterCharSpacing = characterSpacing * effectiveScaleX;

    for (const paragraph of paragraphs) {
        if (paragraph.trim() === "" && paragraph !== "") {
            finalLines.push(paragraph); continue;
        }
        if (paragraph === "") {
            finalLines.push(""); continue;
        }

        const words = paragraph.split(' ');
        let currentLineText = "";
        let currentLineWidthPixels = 0;

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            if (word === "") { 
                if (currentLineText !== "" && !currentLineText.endsWith(" ")) { 
                    const spaceGlyphWidth = getCharRenderWidthBitmap(' ', bitmapFontSettings, textSettings, fontImage, sequenceGlyphCache);
                    if (currentLineWidthPixels + spaceGlyphWidth + scaledInterCharSpacing <= actualPixelWrapWidth || currentLineText === "") {
                        currentLineText += " ";
                        currentLineWidthPixels += spaceGlyphWidth + scaledInterCharSpacing;
                    } else { 
                        finalLines.push(currentLineText);
                        currentLineText = ""; currentLineWidthPixels = 0;
                    }
                }
                continue;
            }
            
            let wordVisualWidth = 0;
            let tempWordParseIndex = 0;
            let numVisibleCharsInWord = 0;
            while (tempWordParseIndex < word.length) {
                const tagMatch = word.substring(tempWordParseIndex).match(/^<C#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})>|<\/C>/i);
                if (tagMatch && tagMatch.index === 0) {
                    tempWordParseIndex += tagMatch[0].length;
                } else {
                    wordVisualWidth += getCharRenderWidthBitmap(word[tempWordParseIndex], bitmapFontSettings, textSettings, fontImage, sequenceGlyphCache);
                    numVisibleCharsInWord++;
                    tempWordParseIndex++;
                }
            }
            if (numVisibleCharsInWord > 1) {
                 wordVisualWidth += (numVisibleCharsInWord - 1) * scaledInterCharSpacing;
            }

            if (currentLineText === "") {
                currentLineText = word; currentLineWidthPixels = wordVisualWidth;
            } else {
                const spaceGlyphWidth = getCharRenderWidthBitmap(' ', bitmapFontSettings, textSettings, fontImage, sequenceGlyphCache);
                const widthWithSpaceAndWord = currentLineWidthPixels + spaceGlyphWidth + scaledInterCharSpacing + wordVisualWidth;

                if (widthWithSpaceAndWord <= actualPixelWrapWidth) {
                    currentLineText += " " + word; currentLineWidthPixels = widthWithSpaceAndWord;
                } else {
                    finalLines.push(currentLineText);
                    currentLineText = word; currentLineWidthPixels = wordVisualWidth;
                }
            }
        }
        if (currentLineText !== "") finalLines.push(currentLineText);
    }
    return finalLines;
};

const stripColorTags = (text: string): string => {
    return text
        .replace(/<C#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})>(.*?)<\/C>/gi, '$2') // Replace <C#...>content</C> with content
        .replace(/<C#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})>|<\/C>/gi, '');   // Remove dangling tags
};

const generateWrappedLinesSystem = (
    moduleText: string,
    textSettings: TextSettings,
    measureCtx: CanvasRenderingContext2D
): string[] => {
    const { lineWrapWidth, fontSize, fontFamily, fontWeight, fontStyle } = textSettings;
    measureCtx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;

    if (lineWrapWidth <= 0) {
        return moduleText.split('\\n'); // Return lines with tags
    }

    const finalLines: string[] = [];
    const paragraphs = moduleText.split('\\n');

    for (const paragraph of paragraphs) {
        const strippedParagraphForEmptyCheck = stripColorTags(paragraph);
        if (strippedParagraphForEmptyCheck.trim() === "" && paragraph.includes("<")) {
            finalLines.push(paragraph); 
            continue;
        }
        if (strippedParagraphForEmptyCheck.trim() === "") {
            finalLines.push(strippedParagraphForEmptyCheck); 
            continue;
        }

        // Tokenize paragraph: words, tags, spaces
        const tokens: { text: string, type: 'word' | 'tag' | 'space' }[] = [];
        let currentIdx = 0;
        while (currentIdx < paragraph.length) {
            const remaining = paragraph.substring(currentIdx);
            const tagMatch = remaining.match(/^(<C#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})>|<\/C>)/i);
            if (tagMatch) {
                tokens.push({ text: tagMatch[0], type: 'tag' });
                currentIdx += tagMatch[0].length;
            } else if (remaining.startsWith(' ')) {
                tokens.push({ text: ' ', type: 'space' });
                currentIdx++;
            } else {
                let wordEnd = currentIdx + 1;
                while (wordEnd < paragraph.length && paragraph[wordEnd] !== ' ' && paragraph[wordEnd] !== '<') {
                    wordEnd++;
                }
                tokens.push({ text: paragraph.substring(currentIdx, wordEnd), type: 'word' });
                currentIdx = wordEnd;
            }
        }
        
        let currentLineWithTags = "";
        let currentLineWidthPixels = 0;
        const spaceCharWidth = measureCtx.measureText(" ").width;

        for (const token of tokens) {
            if (token.type === 'tag') {
                currentLineWithTags += token.text;
            } else if (token.type === 'space') {
                if (stripColorTags(currentLineWithTags).length > 0 && !currentLineWithTags.endsWith(' ')) {
                    if (currentLineWidthPixels + spaceCharWidth <= lineWrapWidth) {
                        currentLineWithTags += " ";
                        currentLineWidthPixels += spaceCharWidth;
                    } else {
                        finalLines.push(currentLineWithTags);
                        currentLineWithTags = ""; // Start new line
                        currentLineWidthPixels = 0;
                    }
                } else if (stripColorTags(currentLineWithTags).length === 0 && currentLineWithTags.length > 0) {
                     currentLineWithTags += " "; 
                }
            } else { // token.type === 'word'
                const wordText = token.text; // This is a word, possibly with internal tags if not handled by tokenizer (should be plain)
                const wordVisualWidth = measureCtx.measureText(wordText).width; // wordText is assumed to be visually plain

                const lineHasVisualContent = stripColorTags(currentLineWithTags).length > 0;
                
                if (!lineHasVisualContent) {
                    currentLineWithTags += wordText;
                    currentLineWidthPixels = wordVisualWidth;
                } else {
                    const needsSpace = !currentLineWithTags.endsWith(' ');
                    const effectiveSpaceWidth = needsSpace ? spaceCharWidth : 0;

                    if (currentLineWidthPixels + effectiveSpaceWidth + wordVisualWidth <= lineWrapWidth) {
                        if (needsSpace) {
                            currentLineWithTags += " ";
                            currentLineWidthPixels += spaceCharWidth;
                        }
                        currentLineWithTags += wordText;
                        currentLineWidthPixels += wordVisualWidth;
                    } else {
                        finalLines.push(currentLineWithTags);
                        currentLineWithTags = wordText; 
                        currentLineWidthPixels = wordVisualWidth;
                    }
                }
            }
        }
        if (currentLineWithTags.length > 0) { // Push any remaining part of the line
            finalLines.push(currentLineWithTags);
        }
    }
    return finalLines;
};


const calculateModuleBounds = (
    moduleWithPotentiallyModifiedText: TextModule, 
    fontImage: HTMLImageElement | undefined, // For bitmap
    fontLevelGlyphCache: Map<string, Map<string, GlyphMetrics>> | undefined, // For bitmap
    measureCtx: CanvasRenderingContext2D | null // For system font
): { x: number, y: number, width: number, height: number, lines: string[], maxUnscaledLineWidth: number } | null => {
    if (!moduleWithPotentiallyModifiedText.text) return null;

    const { textSettings, bitmapFontSettings } = moduleWithPotentiallyModifiedText;
    const { positionX, positionY, scaleX, scaleY, zoomFactor, horizontalAlignment, verticalAlignment, lineHeight, renderMode, fontSize, fontFamily, fontWeight, fontStyle } = textSettings;
    
    const effectiveScaleX = scaleX * zoomFactor;
    const effectiveScaleY = scaleY * zoomFactor;

    let lines: string[];
    let maxUnscaledLineWidth = 0;
    let textBlockTotalUnscaledHeight = 0;

    if (renderMode === 'system' && measureCtx) {
        lines = generateWrappedLinesSystem(moduleWithPotentiallyModifiedText.text, textSettings, measureCtx);
        if (lines.length === 0) return null;

        measureCtx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`; 
        for (const line of lines) { // lines array has tags
            const strippedLine = stripColorTags(line);
            const lineWidth = measureCtx.measureText(strippedLine).width;
            if (lineWidth > maxUnscaledLineWidth) {
                maxUnscaledLineWidth = lineWidth;
            }
        }
        if (lines.length > 0) {
            textBlockTotalUnscaledHeight = lines.length * fontSize * lineHeight;
        }

    } else if (renderMode === 'bitmap') {
        const settingsIdentifier = `${bitmapFontSettings.tileWidth}x${bitmapFontSettings.tileHeight}-${bitmapFontSettings.offsetX},${bitmapFontSettings.offsetY}-${bitmapFontSettings.separationX},${bitmapFontSettings.separationY}`;
        const sequenceIdentifier = `${settingsIdentifier}_${bitmapFontSettings.characterSequence}`;
        const sequenceGlyphCache = fontLevelGlyphCache?.get(sequenceIdentifier);

        lines = generateWrappedLinesBitmap(moduleWithPotentiallyModifiedText, fontImage, sequenceGlyphCache);
        if (lines.length === 0) return null;

        const scaledInterCharSpacing = bitmapFontSettings.characterSpacing * effectiveScaleX;
        
        for (const line of lines) {
            let currentLineVisualWidth = 0;
            let tempLineParseIndexForWidth = 0;
            let visibleCharsInLineWidth = 0;
            while (tempLineParseIndexForWidth < line.length) {
                const tagMatch = line.substring(tempLineParseIndexForWidth).match(/^<C#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})>|<\/C>/i);
                if (tagMatch?.index === 0) {
                    tempLineParseIndexForWidth += tagMatch[0].length;
                } else {
                    currentLineVisualWidth += getCharRenderWidthBitmap(line[tempLineParseIndexForWidth], bitmapFontSettings, textSettings, fontImage, sequenceGlyphCache);
                    visibleCharsInLineWidth++;
                    tempLineParseIndexForWidth++;
                }
            }
            if (visibleCharsInLineWidth > 1) {
                currentLineVisualWidth += (visibleCharsInLineWidth - 1) * scaledInterCharSpacing;
            }
            if (currentLineVisualWidth / effectiveScaleX > maxUnscaledLineWidth) { 
                maxUnscaledLineWidth = currentLineVisualWidth / effectiveScaleX;
            }
        }
        
        if (lines.length > 0) {
            const scaledLineHeight = bitmapFontSettings.tileHeight * effectiveScaleY * lineHeight;
            textBlockTotalUnscaledHeight = (lines.length * scaledLineHeight - ((lineHeight > 0 && lines.length > 0) ? (bitmapFontSettings.tileHeight * effectiveScaleY * (lineHeight - 1)) : 0)) / effectiveScaleY;
        }
    } else {
        return null; 
    }

    const textBlockTotalScaledHeight = textBlockTotalUnscaledHeight * effectiveScaleY;
    const maxScaledVisualLineWidth = maxUnscaledLineWidth * effectiveScaleX;

    let blockTopY = positionY;
    if (verticalAlignment === VerticalAlignment.Center) {
        blockTopY = positionY - textBlockTotalScaledHeight / 2;
    } else if (verticalAlignment === VerticalAlignment.Bottom) {
        blockTopY = positionY - textBlockTotalScaledHeight;
    }

    let blockLeftX = positionX;
    if (horizontalAlignment === HorizontalAlignment.Center) {
        blockLeftX = positionX - maxScaledVisualLineWidth / 2;
    } else if (horizontalAlignment === HorizontalAlignment.Right) {
        blockLeftX = positionX - maxScaledVisualLineWidth;
    }
    
    return {
        x: blockLeftX, 
        y: blockTopY,   
        width: maxScaledVisualLineWidth,
        height: textBlockTotalScaledHeight,
        lines: lines, // These lines contain tags for both modes
        maxUnscaledLineWidth: maxUnscaledLineWidth
    };
};


export const PreviewArea: React.FC<PreviewAreaProps> = ({
  profile,
  onUpdateProfileImage,
  onUpdateProfileFontSettings,
  onUpdateModulePosition,
  canvasWidth = 512, 
  canvasHeight = 384,
  language,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [loadedImages, setLoadedImages] = useState<{
    original?: HTMLImageElement;
    editable?: HTMLImageElement;
    bitmapFont?: HTMLImageElement; // Font 1
    bitmapFont2?: HTMLImageElement; // Font 2
  }>({});
  const [processedBitmapFont, setProcessedBitmapFont] = useState<HTMLImageElement | null>(null); // Font 1
  const [processedBitmapFont2, setProcessedBitmapFont2] = useState<HTMLImageElement | null>(null); // Font 2
  
  // fontSrc -> sequenceIdentifier -> char -> metrics
  const [glyphMetricsCache, setGlyphMetricsCache] = useState<Map<string, Map<string, Map<string, GlyphMetrics>>>>(new Map());

  const tempColorCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const tempColorCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const measureCtxRef = useRef<CanvasRenderingContext2D | null>(null);


  const [draggingModuleId, setDraggingModuleId] = useState<string | null>(null);
  const dragStartCanvasCoordsRef = useRef<{ x: number, y: number } | null>(null);
  const dragStartModuleCoordsRef = useRef<{ x: number, y: number } | null>(null);

  const t = previewAreaTranslations[language];
  const ZOOM_MIN = 0.1;
  const ZOOM_MAX = 4.0;
  const ZOOM_STEP = 0.05;


  useEffect(() => {
    if (!tempColorCanvasRef.current) {
      tempColorCanvasRef.current = document.createElement('canvas');
      tempColorCtxRef.current = tempColorCanvasRef.current.getContext('2d', { willReadFrequently: true });
      if (tempColorCtxRef.current) {
        tempColorCtxRef.current.imageSmoothingEnabled = false; 
      }
    }
    if (!measureCtxRef.current) {
        const measureCanvas = document.createElement('canvas');
        measureCtxRef.current = measureCanvas.getContext('2d');
    }
  }, []);

  const loadImage = useCallback((src: string, type: 'original' | 'editable' | 'bitmapFont' | 'bitmapFont2') => {
    if (!src) {
      setLoadedImages(prev => ({ ...prev, [type]: undefined }));
      if (type === 'bitmapFont') setProcessedBitmapFont(null);
      if (type === 'bitmapFont2') setProcessedBitmapFont2(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous"; 
    img.onload = () => {
      setLoadedImages(prev => ({ ...prev, [type]: img }));
    };
    img.onerror = () => {
      console.error(`Error loading ${type} image from src: ${src.substring(0,100)}...`);
      setLoadedImages(prev => ({ ...prev, [type]: undefined }));
      if (type === 'bitmapFont') setProcessedBitmapFont(null);
      if (type === 'bitmapFont2') setProcessedBitmapFont2(null);
    };
    img.src = src;
  }, []);

  useEffect(() => {
    if (profile.originalImage) loadImage(profile.originalImage, 'original');
    else setLoadedImages(prev => ({...prev, original: undefined}));
  }, [profile.originalImage, loadImage]);

  useEffect(() => {
    if (profile.editableImage) loadImage(profile.editableImage, 'editable');
    else setLoadedImages(prev => ({...prev, editable: undefined}));
  }, [profile.editableImage, loadImage]);
  
  useEffect(() => {
    if (profile.bitmapFontImage) loadImage(profile.bitmapFontImage, 'bitmapFont');
    else {
      setLoadedImages(prev => ({...prev, bitmapFont: undefined}));
      setProcessedBitmapFont(null);
    }
  }, [profile.bitmapFontImage, loadImage]);

  useEffect(() => {
    if (profile.bitmapFontImage2) loadImage(profile.bitmapFontImage2, 'bitmapFont2');
    else {
      setLoadedImages(prev => ({...prev, bitmapFont2: undefined}));
      setProcessedBitmapFont2(null);
    }
  }, [profile.bitmapFontImage2, loadImage]);


  const processFontForTransparency = useCallback((
    fontImage: HTMLImageElement | undefined,
    transparentColorHex: string,
    enableTransparency: boolean,
    softTransparency: boolean,
    softRadius: number,
    setProcessedFontState: React.Dispatch<React.SetStateAction<HTMLImageElement | null>>,
    needsProcessingForColorizationOrTags: boolean
  ) => {
    if (
      (enableTransparency || needsProcessingForColorizationOrTags) && 
      transparentColorHex && 
      fontImage 
    ) {
      const targetTransparentRgb = hexToRgb(transparentColorHex);
      if (!targetTransparentRgb || !fontImage.complete || fontImage.naturalWidth === 0) {
        setProcessedFontState(fontImage || null); 
        return;
      }

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = fontImage.naturalWidth;
      tempCanvas.height = fontImage.naturalHeight;
      const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
      if (!tempCtx) {
          setProcessedFontState(fontImage); 
          return;
      }

      tempCtx.drawImage(fontImage, 0, 0);
      try {
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;

        if (enableTransparency) {
            for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const currentPixelRgb = { r, g, b };

            if (softTransparency) { 
                const distance = calculateColorDistance(currentPixelRgb, targetTransparentRgb);
                let alphaMultiplier = 1.0;
                if (distance <= softRadius) {
                alphaMultiplier = (softRadius === 0) ? ((distance === 0) ? 0 : 1) : Math.pow(distance / softRadius, 3); 
                }
                data[i + 3] = Math.floor(data[i + 3] * alphaMultiplier);
            } else { 
                if (r === targetTransparentRgb.r && g === targetTransparentRgb.g && b === targetTransparentRgb.b) {
                data[i + 3] = 0;
                }
            }
            }
        }
        tempCtx.putImageData(imageData, 0, 0);
        const processedImg = new Image();
        processedImg.onload = () => setProcessedFontState(processedImg);
        processedImg.onerror = () => setProcessedFontState(fontImage); 
        processedImg.src = tempCanvas.toDataURL();
      } catch (e) {
        console.error("Error processing bitmap font for transparency:", e);
        setProcessedFontState(fontImage); 
      }
    } else {
      setProcessedFontState(null); 
    }
  }, []);
  
  const needsProcessingForColorizationOrTagsFont1 = useMemo(() => {
    return profile.textModules.some(
      m => m.bitmapFontSettings.selectedFont === 'font1' && m.textSettings.renderMode === 'bitmap' &&
           (m.textSettings.enableFontColorization || m.text.match(/<C#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})>/i) || m.textSettings.enableOutline || m.textSettings.enableShadow)
    );
  }, [profile.textModules]);

  const needsProcessingForColorizationOrTagsFont2 = useMemo(() => {
    return profile.textModules.some(
      m => m.bitmapFontSettings.selectedFont === 'font2' && m.textSettings.renderMode === 'bitmap' &&
           (m.textSettings.enableFontColorization || m.text.match(/<C#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})>/i) || m.textSettings.enableOutline || m.textSettings.enableShadow)
    );
  }, [profile.textModules]);


  useEffect(() => {
    processFontForTransparency(
      loadedImages.bitmapFont,
      profile.bitmapFontTransparentColor,
      profile.bitmapFontEnableTransparency,
      profile.bitmapFontSoftTransparency,
      profile.bitmapFontSoftTransparencyRadius,
      setProcessedBitmapFont,
      needsProcessingForColorizationOrTagsFont1
    );
  }, [
    loadedImages.bitmapFont,
    profile.bitmapFontTransparentColor,
    profile.bitmapFontEnableTransparency,
    profile.bitmapFontSoftTransparency,
    profile.bitmapFontSoftTransparencyRadius,
    needsProcessingForColorizationOrTagsFont1, 
    processFontForTransparency
  ]);

  useEffect(() => {
    processFontForTransparency(
      loadedImages.bitmapFont2,
      profile.bitmapFontTransparentColor2,
      profile.bitmapFontEnableTransparency2,
      profile.bitmapFontSoftTransparency2,
      profile.bitmapFontSoftTransparencyRadius2,
      setProcessedBitmapFont2,
      needsProcessingForColorizationOrTagsFont2
    );
  }, [
    loadedImages.bitmapFont2,
    profile.bitmapFontTransparentColor2,
    profile.bitmapFontEnableTransparency2,
    profile.bitmapFontSoftTransparency2,
    profile.bitmapFontSoftTransparencyRadius2,
    needsProcessingForColorizationOrTagsFont2,
    processFontForTransparency
  ]);

  const scanAndCacheGlyphMetrics = useCallback((
    fontImageToScan: HTMLImageElement | undefined,
    modulesUsingThisFont: TextModule[]
  ) => {
    if (!fontImageToScan || !fontImageToScan.complete || fontImageToScan.naturalWidth === 0) {
      if(fontImageToScan?.src && glyphMetricsCache.has(fontImageToScan.src)){
        setGlyphMetricsCache(prevCache => {
            const newGlobalCache = new Map(prevCache);
            newGlobalCache.delete(fontImageToScan.src); 
            return newGlobalCache;
        });
      }
      return;
    }
    
    const fontCacheKey = fontImageToScan.src;
    const fontLevelCache = glyphMetricsCache.get(fontCacheKey) || new Map<string, Map<string, GlyphMetrics>>();
    let cacheNeedsUpdate = false;

    modulesUsingThisFont.forEach(module => {
      if (module.textSettings.renderMode !== 'bitmap') return;

      const { characterSequence, tileWidth, tileHeight, offsetX, offsetY, separationX, separationY, enablePixelScanning } = module.bitmapFontSettings;
      const settingsIdentifier = `${tileWidth}x${tileHeight}-${offsetX},${offsetY}-${separationX},${separationY}`;
      const sequenceIdentifier = `${settingsIdentifier}_${characterSequence}`;

      if (!enablePixelScanning || tileWidth <= 0 || tileHeight <= 0) return; 

      if (fontLevelCache.has(sequenceIdentifier)) {
        return; // Already cached for this exact sequence and settings.
      }

      cacheNeedsUpdate = true;
      const newCharMetricsMap = new Map<string, GlyphMetrics>();
      const uniqueChars = new Set(characterSequence.split(''));

      for (const char of uniqueChars) {
        const charIdx = characterSequence.indexOf(char); 
        const charsPerRowBitmap = Math.max(1, Math.floor((fontImageToScan.naturalWidth - offsetX + separationX) / (tileWidth + separationX)));
        const tileCol = charIdx % charsPerRowBitmap;
        const tileRow = Math.floor(charIdx / charsPerRowBitmap);

        const sX_tile = offsetX + tileCol * (tileWidth + separationX);
        const sY_tile = offsetY + tileRow * (tileHeight + separationY);

        if (sX_tile + tileWidth > fontImageToScan.naturalWidth || sY_tile + tileHeight > fontImageToScan.naturalHeight) {
          console.warn(`Char '${char}' tile for font ${fontCacheKey.substring(fontCacheKey.length - 20)} [${sX_tile},${sY_tile} ${tileWidth}x${tileHeight}] out of bounds.`);
          newCharMetricsMap.set(char, { scanX: 0, scanWidth: tileWidth, tileX: sX_tile, tileY: sY_tile, tileW: tileWidth, tileH: tileHeight }); 
          continue;
        }

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = tileWidth;
        tempCanvas.height = tileHeight;
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
        if (!tempCtx) continue;

        tempCtx.drawImage(fontImageToScan, sX_tile, sY_tile, tileWidth, tileHeight, 0, 0, tileWidth, tileHeight);
        
        let minVisibleX = tileWidth;
        let maxVisibleX = -1;
        try {
            const imageData = tempCtx.getImageData(0, 0, tileWidth, tileHeight);
            const data = imageData.data;
            for (let y = 0; y < tileHeight; y++) for (let x = 0; x < tileWidth; x++) if (data[(y * tileWidth + x) * 4 + 3] > 0) { if (x < minVisibleX) minVisibleX = x; if (x > maxVisibleX) maxVisibleX = x; }
        } catch (e) { console.error(`Error scanning glyph ${char} for font ${fontCacheKey.substring(fontCacheKey.length-20)}:`, e); minVisibleX = 0; maxVisibleX = tileWidth -1; }
        
        newCharMetricsMap.set(char, { 
            scanX: (maxVisibleX >= minVisibleX) ? minVisibleX : 0, 
            scanWidth: (maxVisibleX >= minVisibleX) ? (maxVisibleX - minVisibleX + 1) : 0, 
            tileX: sX_tile, tileY: sY_tile, tileW: tileWidth, tileH: tileHeight 
        });
      }
      fontLevelCache.set(sequenceIdentifier, newCharMetricsMap);
    });

    if (cacheNeedsUpdate) {
        glyphMetricsCache.set(fontCacheKey, fontLevelCache);
        setGlyphMetricsCache(new Map(glyphMetricsCache));
    }
  }, [glyphMetricsCache]);

  useEffect(() => {
    const font1Modules = profile.textModules.filter(m => m.bitmapFontSettings.selectedFont === 'font1' && m.textSettings.renderMode === 'bitmap');
    const imageToScan = (profile.bitmapFontEnableTransparency && profile.bitmapFontTransparentColor && processedBitmapFont) || 
                        (needsProcessingForColorizationOrTagsFont1 && processedBitmapFont) 
                        ? processedBitmapFont : loadedImages.bitmapFont;
    scanAndCacheGlyphMetrics(imageToScan, font1Modules);
  }, [loadedImages.bitmapFont, processedBitmapFont, profile.textModules, profile.bitmapFontEnableTransparency, profile.bitmapFontTransparentColor, needsProcessingForColorizationOrTagsFont1, scanAndCacheGlyphMetrics]);

  useEffect(() => {
    const font2Modules = profile.textModules.filter(m => m.bitmapFontSettings.selectedFont === 'font2' && m.textSettings.renderMode === 'bitmap');
    const imageToScan = (profile.bitmapFontEnableTransparency2 && profile.bitmapFontTransparentColor2 && processedBitmapFont2) ||
                        (needsProcessingForColorizationOrTagsFont2 && processedBitmapFont2)
                         ? processedBitmapFont2 : loadedImages.bitmapFont2;
    scanAndCacheGlyphMetrics(imageToScan, font2Modules);
  }, [loadedImages.bitmapFont2, processedBitmapFont2, profile.textModules, profile.bitmapFontEnableTransparency2, profile.bitmapFontTransparentColor2, needsProcessingForColorizationOrTagsFont2, scanAndCacheGlyphMetrics]);


  useEffect(() => {
    const canvas = canvasRef.current;
    const mainCtx = canvas?.getContext('2d');
    const measureCtx = measureCtxRef.current;
    if (!mainCtx || !canvas || !measureCtx) return;

    const activeImage = showOriginal ? loadedImages.original : loadedImages.editable;
    let currentCanvasBitmapWidth = canvasWidth, currentCanvasBitmapHeight = canvasHeight;
    if (activeImage?.complete && activeImage.naturalWidth > 0) {
      currentCanvasBitmapWidth = activeImage.naturalWidth;
      currentCanvasBitmapHeight = activeImage.naturalHeight;
    }
    if (canvas.width !== currentCanvasBitmapWidth) canvas.width = currentCanvasBitmapWidth;
    if (canvas.height !== currentCanvasBitmapHeight) canvas.height = currentCanvasBitmapHeight;
    canvas.style.width = `${currentCanvasBitmapWidth * previewZoom}px`;
    canvas.style.height = `${currentCanvasBitmapHeight * previewZoom}px`;
    
    mainCtx.clearRect(0, 0, canvas.width, canvas.height);
    mainCtx.imageSmoothingEnabled = false; 
    mainCtx.fillStyle = '#E5E7EB'; 
    mainCtx.fillRect(0, 0, canvas.width, canvas.height);

    if (activeImage?.complete && activeImage.naturalWidth > 0) {
      mainCtx.drawImage(activeImage, 0, 0, activeImage.naturalWidth, activeImage.naturalHeight);
    } else {
        mainCtx.imageSmoothingEnabled = true;
        mainCtx.fillStyle = 'black'; 
        mainCtx.textAlign = 'center'; 
        mainCtx.font = '16px Arial';
        mainCtx.fillText(showOriginal ? t.uploadOriginalPlaceholder : t.uploadEditablePlaceholder, canvas.width / 2, canvas.height / 2);
        mainCtx.imageSmoothingEnabled = false;
    }
    
    if (profile.textModules) { 
      profile.textModules.forEach(originalModule => {
        let moduleForPreview = { ...originalModule };
        if (moduleForPreview.isBatchMode && moduleForPreview.text) {
          const linesOfText = moduleForPreview.text.split('\n');
          const lineIdx = moduleForPreview.currentBatchLineIndex ?? 0;
          moduleForPreview.text = linesOfText[lineIdx] || (linesOfText.length > 0 && lineIdx === 0 ? linesOfText[0] : '') || '';
        }

        if (!moduleForPreview.text) return;
        
        const textSettings = moduleForPreview.textSettings;
        const { scaleX, scaleY, zoomFactor, lineHeight, horizontalAlignment } = textSettings;
        const effectiveScaleX = scaleX * zoomFactor;
        const effectiveScaleY = scaleY * zoomFactor;
        
        const currentRawFontImage = moduleForPreview.bitmapFontSettings.selectedFont === 'font1' ? loadedImages.bitmapFont : loadedImages.bitmapFont2;
        const currentProcessedFont = moduleForPreview.bitmapFontSettings.selectedFont === 'font1' ? processedBitmapFont : processedBitmapFont2;
        const imageSourceForBitmapOps = currentProcessedFont || currentRawFontImage;
        const fontLevelCache = imageSourceForBitmapOps ? glyphMetricsCache.get(imageSourceForBitmapOps.src) : undefined;
        
        const boundsData = calculateModuleBounds(moduleForPreview, imageSourceForBitmapOps, fontLevelCache, measureCtx);
        if (!boundsData) return;
        const { x: blockLeftX, y: blockTopY, lines, maxUnscaledLineWidth } = boundsData;

        if (textSettings.renderMode === 'system') {
            mainCtx.font = `${textSettings.fontStyle} ${textSettings.fontWeight} ${textSettings.fontSize * effectiveScaleY}px ${textSettings.fontFamily}`;
            mainCtx.textBaseline = 'top'; 
            mainCtx.textAlign = 'left'; 

            if (textSettings.enableShadow) {
                mainCtx.shadowColor = textSettings.shadowColor;
                mainCtx.shadowOffsetX = textSettings.shadowOffsetX * previewZoom;
                mainCtx.shadowOffsetY = textSettings.shadowOffsetY * previewZoom;
                mainCtx.shadowBlur = textSettings.shadowBlur * previewZoom;
            } else {
                mainCtx.shadowColor = 'rgba(0,0,0,0)'; mainCtx.shadowOffsetX = 0; mainCtx.shadowOffsetY = 0; mainCtx.shadowBlur = 0;
            }

            let currentLineY = blockTopY;
            for (const line of lines) { // Lines now contain color tags
                measureCtx.font = `${textSettings.fontStyle} ${textSettings.fontWeight} ${textSettings.fontSize}px ${textSettings.fontFamily}`;
                const strippedLineForMeasurement = stripColorTags(line);
                const unscaledLineWidth = measureCtx.measureText(strippedLineForMeasurement).width;
                
                let lineStartX = blockLeftX;
                if (horizontalAlignment === HorizontalAlignment.Center) {
                    lineStartX = blockLeftX + (maxUnscaledLineWidth * effectiveScaleX - unscaledLineWidth * effectiveScaleX) / 2;
                } else if (horizontalAlignment === HorizontalAlignment.Right) {
                    lineStartX = blockLeftX + (maxUnscaledLineWidth * effectiveScaleX - unscaledLineWidth * effectiveScaleX);
                }
                
                let currentSegmentX = lineStartX;
                let currentParseIndex = 0;
                let activeColor = textSettings.systemFontColor;

                while (currentParseIndex < line.length) {
                    const openTagMatch = line.substring(currentParseIndex).match(/^<C#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})>/i);
                    const closeTagMatch = line.substring(currentParseIndex).match(/^<\/C>/i);

                    if (openTagMatch) {
                        let colorHex = openTagMatch[1];
                        if (colorHex.length === 3) colorHex = `${colorHex[0]}${colorHex[0]}${colorHex[1]}${colorHex[1]}${colorHex[2]}${colorHex[2]}`;
                        activeColor = `#${colorHex}`;
                        currentParseIndex += openTagMatch[0].length;
                    } else if (closeTagMatch) {
                        activeColor = textSettings.systemFontColor;
                        currentParseIndex += closeTagMatch[0].length;
                    } else {
                        let nextOpenTag = line.indexOf("<C#", currentParseIndex);
                        let nextCloseTag = line.indexOf("</C>", currentParseIndex);
                        let endOfSegment = line.length;
                        if (nextOpenTag !== -1) endOfSegment = Math.min(endOfSegment, nextOpenTag);
                        if (nextCloseTag !== -1) endOfSegment = Math.min(endOfSegment, nextCloseTag);
                        
                        const textSegment = line.substring(currentParseIndex, endOfSegment);
                        if (textSegment) {
                            mainCtx.fillStyle = activeColor;
                            
                            if (textSettings.enableOutline && textSettings.outlineWidth > 0) {
                                mainCtx.strokeStyle = textSettings.outlineColor;
                                mainCtx.lineWidth = textSettings.outlineWidth * previewZoom; 
                                mainCtx.lineJoin = 'round';
                                mainCtx.strokeText(textSegment, currentSegmentX, currentLineY);
                            }
                            mainCtx.fillText(textSegment, currentSegmentX, currentLineY);
                            
                            // measureCtx font is already set for unscaled measurement
                            currentSegmentX += measureCtx.measureText(textSegment).width * effectiveScaleX;
                        }
                        currentParseIndex = endOfSegment;
                    }
                }
                currentLineY += (textSettings.fontSize * effectiveScaleY * lineHeight);
            }
            if (textSettings.enableShadow) { 
                mainCtx.shadowColor = 'rgba(0,0,0,0)'; mainCtx.shadowOffsetX = 0; mainCtx.shadowOffsetY = 0; mainCtx.shadowBlur = 0;
            }

        } else { // Bitmap rendering (existing logic)
            const fontSettings = moduleForPreview.bitmapFontSettings;
            const { characterSequence, tileWidth, tileHeight, characterSpacing, baselineX, baselineY, enablePixelScanning } = fontSettings;
            const scaledInterCharSpacing = characterSpacing * effectiveScaleX;
            const settingsIdentifier = `${fontSettings.tileWidth}x${fontSettings.tileHeight}-${fontSettings.offsetX},${fontSettings.offsetY}-${fontSettings.separationX},${fontSettings.separationY}`;
            const sequenceIdentifier = `${settingsIdentifier}_${characterSequence}`;
            const sequenceMetricsCache = fontLevelCache?.get(sequenceIdentifier);
            
            let currentDrawingY = blockTopY; 
            const scaledBitmapLineHeight = tileHeight * effectiveScaleY * lineHeight;

            lines.forEach((line) => { 
              let unscaledLineVisualWidth = 0;
              let tempLineParseIndexForWidth = 0;
              let visibleCharsInLineWidth = 0;
              while (tempLineParseIndexForWidth < line.length) {
                  const tagMatch = line.substring(tempLineParseIndexForWidth).match(/^<C#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})>|<\/C>/i);
                  if (tagMatch?.index === 0) tempLineParseIndexForWidth += tagMatch[0].length;
                  else { 
                      unscaledLineVisualWidth += getCharRenderWidthBitmap(line[tempLineParseIndexForWidth], fontSettings, textSettings, imageSourceForBitmapOps, sequenceMetricsCache) / effectiveScaleX; 
                      visibleCharsInLineWidth++; 
                      tempLineParseIndexForWidth++; 
                  }
              }
              if (visibleCharsInLineWidth > 1) unscaledLineVisualWidth += ((visibleCharsInLineWidth - 1) * scaledInterCharSpacing) / effectiveScaleX;

              let currentDrawingX = blockLeftX;
              if (horizontalAlignment === HorizontalAlignment.Center) {
                  currentDrawingX = blockLeftX + (maxUnscaledLineWidth * effectiveScaleX - unscaledLineVisualWidth * effectiveScaleX) / 2;
              } else if (horizontalAlignment === HorizontalAlignment.Right) {
                  currentDrawingX = blockLeftX + (maxUnscaledLineWidth * effectiveScaleX - unscaledLineVisualWidth * effectiveScaleX);
              }

              let activeTagColor: string | null = null, charIndexInLine = 0, visibleCharCountOnLine = 0;
              
              while (charIndexInLine < line.length) {
                const remainingLinePart = line.substring(charIndexInLine);
                const openTagMatch = remainingLinePart.match(/^<C#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})>/i);
                const closeTagMatch = remainingLinePart.match(/^<\/C>/i);
                
                if (openTagMatch?.index === 0) {
                    let colorHex = openTagMatch[1];
                    if (colorHex.length === 3) colorHex = `${colorHex[0]}${colorHex[0]}${colorHex[1]}${colorHex[1]}${colorHex[2]}${colorHex[2]}`;
                    activeTagColor = `#${colorHex}`; charIndexInLine += openTagMatch[0].length; continue;
                } else if (closeTagMatch?.index === 0) {
                    activeTagColor = null; charIndexInLine += closeTagMatch[0].length; continue;
                }
                
                const char = line[charIndexInLine]; visibleCharCountOnLine++;
                let sX_draw=0, sY_draw=0, sWidth_draw=0, sHeight_draw=0, charBaseWidthForAdvance = 0;
                
                if (!imageSourceForBitmapOps?.complete || imageSourceForBitmapOps.naturalWidth === 0) {
                    charBaseWidthForAdvance = (char === ' ') ? (tileWidth / 2) : 0;
                    currentDrawingX += (charBaseWidthForAdvance * effectiveScaleX);
                    let visibleCharsForSpacing = 0; 
                    for(let k=0; k<line.length; k++){ if(!line.substring(k).match(/^<C#.*?>(.*?)<\/C>/gi) && !line.substring(k).match(/^<C#.*?>/i) && !line.substring(k).match(/^<\/C>/i)) visibleCharsForSpacing++;}
                    if (visibleCharCountOnLine < visibleCharsForSpacing) currentDrawingX += scaledInterCharSpacing;
                    charIndexInLine++; continue;
                }

                if (enablePixelScanning && sequenceMetricsCache) {
                  const metrics = sequenceMetricsCache.get(char);
                  if (metrics) {
                    sX_draw = metrics.tileX + metrics.scanX; sY_draw = metrics.tileY;
                    sWidth_draw = metrics.scanWidth; sHeight_draw = metrics.tileH;
                    charBaseWidthForAdvance = (metrics.scanWidth > 0) ? metrics.scanWidth : (char === ' ' ? tileWidth / 2 : 0);
                    if(metrics.scanWidth === 0 && char !== ' ') sWidth_draw = 0; 
                  } else { charBaseWidthForAdvance = (char === ' ') ? tileWidth / 2 : 0; sWidth_draw = 0; }
                } else { 
                  const charIdx = characterSequence.indexOf(char);
                  if (charIdx !== -1) {
                    const charsPerRowBitmap = Math.max(1, Math.floor((imageSourceForBitmapOps.naturalWidth - fontSettings.offsetX + fontSettings.separationX) / (tileWidth + fontSettings.separationX)));
                    const tileCol = charIdx % charsPerRowBitmap; const tileRow = Math.floor(charIdx / charsPerRowBitmap);
                    sX_draw = fontSettings.offsetX + tileCol * (tileWidth + fontSettings.separationX);
                    sY_draw = fontSettings.offsetY + tileRow * (tileHeight + fontSettings.separationY);
                    sWidth_draw = tileWidth; sHeight_draw = tileHeight; charBaseWidthForAdvance = tileWidth;
                  } else { charBaseWidthForAdvance = (char === ' ') ? tileWidth / 2 : 0; sWidth_draw = 0; }
                }
                
                const dWidth_pixels = charBaseWidthForAdvance * effectiveScaleX, dHeight_pixels = tileHeight * effectiveScaleY; 
                const finalGlyphDrawX = Math.round(currentDrawingX + baselineX * effectiveScaleX), finalGlyphDrawY = Math.round(currentDrawingY + baselineY * effectiveScaleY);
                const finalGlyphDrawW = Math.round(dWidth_pixels), finalGlyphDrawH = Math.round(dHeight_pixels);

                if (sWidth_draw > 0 && sHeight_draw > 0 && imageSourceForBitmapOps && (finalGlyphDrawW > 0 || finalGlyphDrawH > 0)) {
                    if (textSettings.enableShadow) {
                        mainCtx.shadowColor = textSettings.shadowColor;
                        mainCtx.shadowOffsetX = textSettings.shadowOffsetX * previewZoom;
                        mainCtx.shadowOffsetY = textSettings.shadowOffsetY * previewZoom;
                        mainCtx.shadowBlur = textSettings.shadowBlur * previewZoom;
                    } else {
                        mainCtx.shadowColor = 'rgba(0,0,0,0)'; mainCtx.shadowOffsetX = 0; mainCtx.shadowOffsetY = 0; mainCtx.shadowBlur = 0;
                    }

                    if (textSettings.enableOutline && textSettings.outlineWidth > 0) {
                        const outlineTempCanvas = document.createElement('canvas');
                        outlineTempCanvas.width = sWidth_draw; outlineTempCanvas.height = sHeight_draw;
                        const outlineTempCtx = outlineTempCanvas.getContext('2d');
                        if (outlineTempCtx) {
                            outlineTempCtx.imageSmoothingEnabled = false;
                            outlineTempCtx.drawImage(imageSourceForBitmapOps, sX_draw, sY_draw, sWidth_draw, sHeight_draw, 0, 0, sWidth_draw, sHeight_draw);
                            outlineTempCtx.globalCompositeOperation = 'source-atop';
                            outlineTempCtx.fillStyle = textSettings.outlineColor;
                            outlineTempCtx.fillRect(0, 0, sWidth_draw, sHeight_draw);
                            outlineTempCtx.globalCompositeOperation = 'source-over';

                            const offset = textSettings.outlineWidth * previewZoom;
                            const outlineOffsets = [ [-offset, -offset], [0, -offset], [offset, -offset], [-offset, 0], [offset, 0], [-offset, offset], [0, offset], [offset, offset] ];
                            
                            for (const [dx, dy] of outlineOffsets) {
                                mainCtx.drawImage(outlineTempCanvas, finalGlyphDrawX + dx, finalGlyphDrawY + dy, finalGlyphDrawW, finalGlyphDrawH);
                            }
                        }
                    }

                    const glyphColorTempCanvas = tempColorCanvasRef.current;
                    const glyphColorTempCtx = tempColorCtxRef.current;

                    if (glyphColorTempCanvas && glyphColorTempCtx) {
                        if (glyphColorTempCanvas.width !== sWidth_draw) glyphColorTempCanvas.width = sWidth_draw;
                        if (glyphColorTempCanvas.height !== sHeight_draw) glyphColorTempCanvas.height = sHeight_draw;
                        
                        glyphColorTempCtx.clearRect(0, 0, sWidth_draw, sHeight_draw);
                        glyphColorTempCtx.imageSmoothingEnabled = false;
                        glyphColorTempCtx.drawImage(imageSourceForBitmapOps, sX_draw, sY_draw, sWidth_draw, sHeight_draw, 0, 0, sWidth_draw, sHeight_draw);

                        if (activeTagColor) {
                            glyphColorTempCtx.globalCompositeOperation = 'source-atop';
                            glyphColorTempCtx.fillStyle = activeTagColor;
                            glyphColorTempCtx.fillRect(0, 0, sWidth_draw, sHeight_draw);
                            glyphColorTempCtx.globalCompositeOperation = 'source-over';
                        } else if (textSettings.enableFontColorization && textSettings.fontColor) {
                            const targetColorRgb = hexToRgb(textSettings.fontColor);
                            if (targetColorRgb) {
                                try {
                                    const imageData = glyphColorTempCtx.getImageData(0, 0, sWidth_draw, sHeight_draw);
                                    const data = imageData.data;
                                    for (let k = 0; k < data.length; k += 4) {
                                        if (data[k + 3] > 0) { 
                                            data[k] = (data[k] * targetColorRgb.r) / 255;
                                            data[k + 1] = (data[k + 1] * targetColorRgb.g) / 255;
                                            data[k + 2] = (data[k + 2] * targetColorRgb.b) / 255;
                                        }
                                    }
                                    glyphColorTempCtx.putImageData(imageData, 0, 0);
                                } catch (e) { console.error("Error applying multiply filter:", e); }
                            }
                        }
                        mainCtx.drawImage(glyphColorTempCanvas, finalGlyphDrawX, finalGlyphDrawY, finalGlyphDrawW, finalGlyphDrawH);
                    } else { 
                        mainCtx.drawImage(imageSourceForBitmapOps, sX_draw, sY_draw, sWidth_draw, sHeight_draw, finalGlyphDrawX, finalGlyphDrawY, finalGlyphDrawW, finalGlyphDrawH);
                    }

                    if (textSettings.enableShadow) {
                        mainCtx.shadowColor = 'rgba(0,0,0,0)'; mainCtx.shadowOffsetX = 0; mainCtx.shadowOffsetY = 0; mainCtx.shadowBlur = 0;
                    }
                }
                
                currentDrawingX += dWidth_pixels; 
                let visibleCharsForSpacing = 0;
                let tempParseIndex = 0;
                while(tempParseIndex < line.length) {
                    const tagMatch = line.substring(tempParseIndex).match(/^<C#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})>|<\/C>/i);
                    if (tagMatch && tagMatch.index === 0) tempParseIndex += tagMatch[0].length;
                    else { visibleCharsForSpacing++; tempParseIndex++; }
                }
                if (visibleCharCountOnLine < visibleCharsForSpacing) currentDrawingX += scaledInterCharSpacing;
                charIndexInLine++;
              }
              currentDrawingY += scaledBitmapLineHeight; 
            });
        }
      });
    }
  }, [ profile, showOriginal, loadedImages, processedBitmapFont, processedBitmapFont2, glyphMetricsCache, canvasWidth, canvasHeight, previewZoom, scanAndCacheGlyphMetrics, needsProcessingForColorizationOrTagsFont1, needsProcessingForColorizationOrTagsFont2, language, t, ZOOM_MAX, ZOOM_MIN ]); 

  const handleFileSelected = (file: File, imageType: 'originalImage' | 'editableImage' | 'bitmapFontImage' | 'bitmapFontImage2') => {
    const reader = new FileReader();
    reader.onload = (e) => onUpdateProfileImage(imageType, e.target?.result as string);
    reader.onerror = () => { alert('Error reading file.'); onUpdateProfileImage(imageType, null); };
    reader.readAsDataURL(file);
  };

  const handleEnableTransparencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateProfileFontSettings(1, { bitmapFontEnableTransparency: e.target.checked });
  };
  const handleTransparentColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateProfileFontSettings(1, { bitmapFontTransparentColor: e.target.value });
  };
  const handleEnableSoftTransparencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateProfileFontSettings(1, { bitmapFontSoftTransparency: e.target.checked });
  };
  const handleSoftTransparencyRadiusChange = (newValue: number) => {
    onUpdateProfileFontSettings(1, { bitmapFontSoftTransparencyRadius: newValue });
  };

  const handleEnableTransparencyChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateProfileFontSettings(2, { bitmapFontEnableTransparency2: e.target.checked });
  };
  const handleTransparentColorChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateProfileFontSettings(2, { bitmapFontTransparentColor2: e.target.value });
  };
  const handleEnableSoftTransparencyChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateProfileFontSettings(2, { bitmapFontSoftTransparency2: e.target.checked });
  };
  const handleSoftTransparencyRadiusChange2 = (newValue: number) => {
    onUpdateProfileFontSettings(2, { bitmapFontSoftTransparencyRadius2: newValue });
  };


  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const measureCtx = measureCtxRef.current;
    if (!canvas || !measureCtx) return;

    const canvasRect = canvas.getBoundingClientRect();
    const canvasMouseX = event.clientX - canvasRect.left;
    const canvasMouseY = event.clientY - canvasRect.top;

    // Iterate modules in reverse for top-most hit
    for (let i = profile.textModules.length - 1; i >= 0; i--) {
        const originalModule = profile.textModules[i];
        
        let moduleForBounds = { ...originalModule };
        if (moduleForBounds.isBatchMode && moduleForBounds.text) {
            const linesOfText = moduleForBounds.text.split('\n');
            const lineIdx = moduleForBounds.currentBatchLineIndex ?? 0;
             moduleForBounds.text = linesOfText[lineIdx] || (linesOfText.length > 0 && lineIdx === 0 ? linesOfText[0] : '') || '';
        }
        
        if (!moduleForBounds.text) continue;
        
        const currentRawFontImage = moduleForBounds.bitmapFontSettings.selectedFont === 'font1' ? loadedImages.bitmapFont : loadedImages.bitmapFont2;
        const currentProcessedFont = moduleForBounds.bitmapFontSettings.selectedFont === 'font1' ? processedBitmapFont : processedBitmapFont2;
        const imageSourceForBounds = currentProcessedFont || currentRawFontImage;
        const fontLevelCache = imageSourceForBounds ? glyphMetricsCache.get(imageSourceForBounds.src) : undefined;

        const bounds = calculateModuleBounds(moduleForBounds, imageSourceForBounds, fontLevelCache, measureCtx);


        if (bounds) {
            // Convert canvas click to unzoomed world coordinates for hit testing
            const clickXUnzoomed = canvasMouseX / previewZoom;
            const clickYUnzoomed = canvasMouseY / previewZoom;

            if (
                clickXUnzoomed >= bounds.x &&
                clickXUnzoomed <= bounds.x + bounds.width &&
                clickYUnzoomed >= bounds.y &&
                clickYUnzoomed <= bounds.y + bounds.height
            ) {
                setDraggingModuleId(originalModule.id); // Drag the original module ID
                dragStartCanvasCoordsRef.current = { x: canvasMouseX, y: canvasMouseY };
                dragStartModuleCoordsRef.current = { x: originalModule.textSettings.positionX, y: originalModule.textSettings.positionY };
                canvas.style.cursor = 'grabbing';
                event.preventDefault(); 
                return; 
            }
        }
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggingModuleId || !dragStartCanvasCoordsRef.current || !dragStartModuleCoordsRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    const currentCanvasMouseX = event.clientX - canvasRect.left;
    const currentCanvasMouseY = event.clientY - canvasRect.top;
    
    const deltaCanvasX = currentCanvasMouseX - dragStartCanvasCoordsRef.current.x;
    const deltaCanvasY = currentCanvasMouseY - dragStartCanvasCoordsRef.current.y;

    const newModuleX = dragStartModuleCoordsRef.current.x + (deltaCanvasX / previewZoom);
    const newModuleY = dragStartModuleCoordsRef.current.y + (deltaCanvasY / previewZoom);
    
    onUpdateModulePosition(draggingModuleId, { x: newModuleX, y: newModuleY });
  };

  const handleMouseUpOrLeave = () => {
    if (draggingModuleId) {
        setDraggingModuleId(null);
        dragStartCanvasCoordsRef.current = null;
        dragStartModuleCoordsRef.current = null;
        if (canvasRef.current) {
            canvasRef.current.style.cursor = 'default'; 
        }
    }
  };

  const handleWheelZoom = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const scrollDelta = event.deltaY;
    let newZoom = previewZoom;

    if (scrollDelta < 0) { 
        newZoom = Math.min(ZOOM_MAX, previewZoom + ZOOM_STEP * 2); 
    } else { 
        newZoom = Math.max(ZOOM_MIN, previewZoom - ZOOM_STEP * 2); 
    }
    newZoom = parseFloat(newZoom.toFixed(2)); 
    setPreviewZoom(newZoom);
  };


  return (
    <div className="w-2/5 p-4 flex flex-col bg-white shadow-lg rounded-lg m-2 sticky top-[84px] max-h-[calc(100vh-100px)] overflow-y-auto self-start">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold text-gray-700">{t.previewTitle}</h2>
        <Button onClick={() => setShowOriginal(!showOriginal)} leftIcon={ICONS.eye} variant="ghost">
          {showOriginal ? t.showEditable : t.showOriginal}
        </Button>
      </div>

      <div className="mb-3 flex items-center space-x-2">
        <label htmlFor="previewZoomSlider" className="text-sm font-medium text-gray-700 whitespace-nowrap">{t.zoomLabel}</label>
        <input type="range" id="previewZoomSlider" min={ZOOM_MIN} max={ZOOM_MAX} step={ZOOM_STEP} value={previewZoom} onChange={(e) => setPreviewZoom(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" aria-label="Preview zoom slider" />
        <span className="text-sm text-gray-600 w-16 text-right">{(previewZoom * 100).toFixed(0)}%</span>
      </div>
      
      <div className="flex-grow overflow-auto border border-gray-300 rounded-md bg-gray-200 p-1">
        <canvas 
          ref={canvasRef} 
          className="block" 
          style={{ imageRendering: 'pixelated', cursor: 'default' }} 
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onWheel={handleWheelZoom}
          aria-label="Preview Canvas"
          tabIndex={0} 
        />
      </div>
      <div className="mt-4 grid grid-cols-4 gap-3">
        <FileInputButton 
          label={t.originalButton} 
          onFileSelect={(file) => handleFileSelected(file, 'originalImage')} 
          buttonVariant={profile.originalImage ? 'primary' : 'secondary'} 
        />
        <FileInputButton 
          label={t.editableButton} 
          onFileSelect={(file) => handleFileSelected(file, 'editableImage')} 
          buttonVariant={profile.editableImage ? 'primary' : 'secondary'} 
        />
        <FileInputButton 
          label={t.font1Button} 
          onFileSelect={(file) => handleFileSelected(file, 'bitmapFontImage')} 
          buttonVariant={profile.bitmapFontImage ? 'primary' : 'secondary'} 
        />
        <FileInputButton 
          label={t.font2Button} 
          onFileSelect={(file) => handleFileSelected(file, 'bitmapFontImage2')} 
          buttonVariant={profile.bitmapFontImage2 ? 'primary' : 'secondary'} 
        />
      </div>

      <div className="mt-4 flex flex-col md:flex-row md:gap-4">
        {/* Font 1 Transparency Settings */}
        <div className="md:w-1/2 pt-3 border-t md:border-t-0 border-gray-200 md:pt-0">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">{t.font1TransparencyTitle}</h3>
          <p className="text-[11px] text-gray-500 mb-1.5">{t.neededForEffects}</p>
          <div className="space-y-2">
            <div className="flex items-center">
              <input type="checkbox" id="enableTransparencyCheckbox1" checked={profile.bitmapFontEnableTransparency} onChange={handleEnableTransparencyChange} className="h-3.5 w-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
              <label htmlFor="enableTransparencyCheckbox1" className="ml-1.5 block text-xs text-gray-900">{t.enableGlobal}</label>
            </div>
            <div className="flex items-center">
              <label htmlFor="transparentColorInput1" className={`block text-xs font-medium text-gray-700 mr-1.5 ${!profile.bitmapFontEnableTransparency ? 'text-gray-400' : ''}`}>{t.transparentColorLabel}</label>
              <input 
                type="color" 
                id="transparentColorInput1" 
                value={profile.bitmapFontTransparentColor} 
                onChange={handleTransparentColorChange} 
                disabled={!profile.bitmapFontEnableTransparency}
                className={`w-20 h-7 p-0.5 border border-gray-300 rounded ${!profile.bitmapFontEnableTransparency ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
                aria-label="Bitmap font 1 transparent color picker"
              />
            </div>
            <div className="ml-4 flex items-center space-x-3">
              <div className="flex items-center flex-shrink-0">
                <input 
                  type="checkbox" 
                  id="enableSoftTransparencyCheckbox1" 
                  checked={profile.bitmapFontSoftTransparency} 
                  onChange={handleEnableSoftTransparencyChange} 
                  disabled={!profile.bitmapFontEnableTransparency} 
                  className="h-3.5 w-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                />
                <label 
                  htmlFor="enableSoftTransparencyCheckbox1" 
                  className={`ml-1.5 block text-xs ${!profile.bitmapFontEnableTransparency ? 'text-gray-400' : 'text-gray-900'}`}
                >
                  {t.softLabel}
                </label>
              </div>
              <div className="flex-grow">
                <SliderInput 
                  label="" 
                  labelClassName="hidden" 
                  id="softTransparencyRadius1" 
                  min={0} max={200} step={1} 
                  value={profile.bitmapFontSoftTransparencyRadius} 
                  onChange={handleSoftTransparencyRadiusChange} 
                  disabled={!profile.bitmapFontEnableTransparency || !profile.bitmapFontSoftTransparency} 
                  containerClassName="mb-0" 
                  numberInputClassName="w-20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Font 2 Transparency Settings */}
        <div className="md:w-1/2 pt-3 border-t mt-3 md:mt-0 md:border-t-0 border-gray-200 md:pt-0">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">{t.font2TransparencyTitle}</h3>
          <p className="text-[11px] text-gray-500 mb-1.5">{t.neededForEffects}</p>
          <div className="space-y-2">
            <div className="flex items-center">
              <input type="checkbox" id="enableTransparencyCheckbox2" checked={profile.bitmapFontEnableTransparency2} onChange={handleEnableTransparencyChange2} className="h-3.5 w-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
              <label htmlFor="enableTransparencyCheckbox2" className="ml-1.5 block text-xs text-gray-900">{t.enableGlobal}</label>
            </div>
            <div className="flex items-center">
              <label htmlFor="transparentColorInput2" className={`block text-xs font-medium text-gray-700 mr-1.5 ${!profile.bitmapFontEnableTransparency2 ? 'text-gray-400' : ''}`}>{t.transparentColorLabel}</label>
              <input 
                type="color" 
                id="transparentColorInput2" 
                value={profile.bitmapFontTransparentColor2} 
                onChange={handleTransparentColorChange2} 
                disabled={!profile.bitmapFontEnableTransparency2}
                className={`w-20 h-7 p-0.5 border border-gray-300 rounded ${!profile.bitmapFontEnableTransparency2 ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
                aria-label="Bitmap font 2 transparent color picker"
              />
            </div>
            <div className="ml-4 flex items-center space-x-3">
              <div className="flex items-center flex-shrink-0">
                <input 
                  type="checkbox" 
                  id="enableSoftTransparencyCheckbox2" 
                  checked={profile.bitmapFontSoftTransparency2} 
                  onChange={handleEnableSoftTransparencyChange2} 
                  disabled={!profile.bitmapFontEnableTransparency2}
                  className="h-3.5 w-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                />
                <label 
                  htmlFor="enableSoftTransparencyCheckbox2" 
                  className={`ml-1.5 block text-xs ${!profile.bitmapFontEnableTransparency2 ? 'text-gray-400' : 'text-gray-900'}`}
                >
                  {t.softLabel}
                </label>
              </div>
              <div className="flex-grow">
                <SliderInput 
                  label="" 
                  labelClassName="hidden" 
                  id="softTransparencyRadius2" 
                  min={0} max={200} step={1} 
                  value={profile.bitmapFontSoftTransparencyRadius2} 
                  onChange={handleSoftTransparencyRadiusChange2} 
                  disabled={!profile.bitmapFontEnableTransparency2 || !profile.bitmapFontSoftTransparency2} 
                  containerClassName="mb-0" 
                  numberInputClassName="w-20"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
