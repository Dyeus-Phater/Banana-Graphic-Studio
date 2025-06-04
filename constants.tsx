
import React from 'react';
import { TextSettings, BitmapFontSettings, HorizontalAlignment, VerticalAlignment } from './types';

export const DEFAULT_TEXT_SETTINGS: TextSettings = {
  lineHeight: 1, 
  positionX: 0,
  positionY: 0,
  scaleX: 1,
  scaleY: 1,
  zoomFactor: 1,
  horizontalAlignment: HorizontalAlignment.Left,
  verticalAlignment: VerticalAlignment.Top,
  lineWrapWidth: 0, 
  enableFontColorization: false,
  fontColor: '#000000',

  // Font Effects Defaults
  enableShadow: false,
  shadowColor: '#000000',
  shadowOffsetX: 2,
  shadowOffsetY: 2,
  shadowBlur: 3,
  enableOutline: false,
  outlineColor: '#FFFFFF',
  outlineWidth: 1,

  // New defaults for render mode and system fonts
  renderMode: 'bitmap', // Default to existing bitmap behavior
  fontFamily: 'Arial',
  fontSize: 16, // Default system font size
  fontWeight: 'normal',
  fontStyle: 'normal',
  systemFontColor: '#000000', // Default system font color
  customFontFileName: null,
  customFontFamilyName: null,
};

export const DEFAULT_BITMAP_FONT_SETTINGS: BitmapFontSettings = {
  characterSequence: ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~∎', // Updated default
  tileWidth: 8,
  tileHeight: 8,
  offsetX: 0,
  offsetY: 0,
  separationX: 1, 
  separationY: 1, 
  baselineX: 0,
  baselineY: 0,
  characterSpacing: 1,
  enablePixelScanning: false, 
  selectedFont: 'font1', 
};

export const CUSTOM_FONT_UPLOAD_VALUE = "upload_custom_font_action";

export const COMMON_FONT_FAMILIES: { value: string; label: string }[] = [
  { value: 'Arial, Helvetica, sans-serif', label: 'Arial' },
  { value: 'Verdana, Geneva, sans-serif', label: 'Verdana' },
  { value: 'Tahoma, Geneva, sans-serif', label: 'Tahoma' },
  { value: '"Trebuchet MS", Helvetica, sans-serif', label: 'Trebuchet MS' },
  { value: '"Times New Roman", Times, serif', label: 'Times New Roman' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Garamond, serif', label: 'Garamond' },
  { value: '"Courier New", Courier, monospace', label: 'Courier New' },
  { value: '"Lucida Console", Monaco, monospace', label: 'Lucida Console' },
  { value: 'Impact, Charcoal, sans-serif', label: 'Impact' },
  { value: '"Comic Sans MS", cursive, sans-serif', label: 'Comic Sans MS' },
  { value: '"Brush Script MT", cursive', label: 'Brush Script MT' },
  // System UI fonts can also be good defaults
  { value: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', label: 'System UI' },
];


export const ICONS = {
  save: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>,
  export: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M.75 3.75H16.5a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25h-1.5M12 9l3 3m0 0l-3 3m3-3H3" /></svg>, // ArrowRightOnRectangleIcon
  import: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>, // DocumentArrowDownIcon
  add: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
  clone: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 4.625V17.25m0 0A1.125 1.125 0 0118 18.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5m1.5-1.5v1.5" /></svg>,
  configure: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.11-1.11a12.001 12.001 0 0110.88 10.88c-.103.55-.568 1.02-1.11 1.11a9.015 9.015 0 01-2.64 1.19c-.828.312-1.726.478-2.64.534a9.016 9.016 0 01-2.861 0c-.914-.056-1.812-.222-2.64-.534a9.015 9.015 0 01-2.64-1.19c-.55-.103-1.007-.568-1.11-1.11A12.001 12.001 0 013.94 5.052c.542-.09.997-.56 1.11-1.11Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0Z" /></svg>,
  eye: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  upload: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>,
  trash: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.24.086 3.305.247m-3.305-.247c-.652.099-1.28.248-1.88.43M18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0H4.772" /></svg>,
  library: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3.75V3.75m3.75 0A2.25 2.25 0 0112 6V_DEFAULT_TEXT_SETTINGS" /></svg>,
  back: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>,
  collection: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
</svg>,
  sparkles: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09ZM18.25 12l.89-.525L17.885 9.5l.525-.89-1.94-.485L16 6.175l-1.47.98L12.55 6.5l-.485 1.94-.89.525L13.115 11l-.525.89 1.94.485L16 13.825l1.47-.98L19.45 13.5l.485-1.94.89-.525Z" />
</svg>
};

export const generateId = (): string => Math.random().toString(36).substring(2, 15);