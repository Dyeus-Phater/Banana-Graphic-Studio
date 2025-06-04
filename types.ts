
export enum HorizontalAlignment {
  Left = 'Left',
  Center = 'Center',
  Right = 'Right',
}

export enum VerticalAlignment {
  Top = 'Top',
  Center = 'Center',
  Bottom = 'Bottom',
}

export interface TextSettings {
  lineHeight: number;
  positionX: number;
  positionY: number;
  scaleX: number;
  scaleY: number;
  zoomFactor: number;
  horizontalAlignment: HorizontalAlignment;
  verticalAlignment: VerticalAlignment;
  lineWrapWidth: number; 
  enableFontColorization: boolean; 
  fontColor: string; 

  // Font Effects
  enableShadow: boolean;
  shadowColor: string;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowBlur: number;
  enableOutline: boolean;
  outlineColor: string;
  outlineWidth: number; // in pixels

  // New for render mode and system fonts
  renderMode: 'bitmap' | 'system';
  fontFamily: string; 
  fontSize: number; // in pixels for system font
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  systemFontColor: string; // hex color for system font
  customFontFileName: string | null; // Name of the uploaded font file
  customFontFamilyName: string | null; // Dynamically generated font-family name for @font-face
}

export interface BitmapFontSettings {
  characterSequence: string;
  tileWidth: number;
  tileHeight: number;
  offsetX: number;
  offsetY: number;
  separationX: number;
  separationY: number;
  baselineX: number;
  baselineY: number;
  characterSpacing: number;
  enablePixelScanning: boolean; 
  selectedFont: 'font1' | 'font2'; 
}

export interface TextModule {
  id: string;
  name: string;
  text: string;
  textSettings: TextSettings;
  bitmapFontSettings: BitmapFontSettings;
  isConfiguring: boolean;
  isBatchMode?: boolean;
  currentBatchLineIndex?: number; // 0-based index of the line to preview in batch mode
}

export interface Profile {
  // Fields for the active editor profile
  originalImage?: string | null;
  editableImage?: string | null;
  
  bitmapFontImage?: string |null; // Font 1
  bitmapFontTransparentColor: string; 
  bitmapFontEnableTransparency: boolean;
  bitmapFontSoftTransparency: boolean; 
  bitmapFontSoftTransparencyRadius: number;

  bitmapFontImage2?: string | null; // Font 2
  bitmapFontTransparentColor2: string;
  bitmapFontEnableTransparency2: boolean;
  bitmapFontSoftTransparency2: boolean;
  bitmapFontSoftTransparencyRadius2: number;

  textModules: TextModule[];

  // Optional fields for profiles stored in the library
  profileId?: string; // Unique ID for the profile in the library
  profileLibraryName?: string; // User-defined name for the profile in the library
  isFromFileSystem?: boolean; // Flag to indicate if the profile was loaded from the file system
}