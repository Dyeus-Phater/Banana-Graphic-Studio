
import React, { useState, useRef, useEffect } from 'react';
import { TextModule, TextSettings, BitmapFontSettings, HorizontalAlignment, VerticalAlignment } from '../types';
import { ICONS, DEFAULT_TEXT_SETTINGS, DEFAULT_BITMAP_FONT_SETTINGS, generateId, COMMON_FONT_FAMILIES, CUSTOM_FONT_UPLOAD_VALUE } from '../constants';
import { Button } from './ui/ButtonComponents';
import { SelectInput, TextArea, SliderInput, TextInput, NumberInput } from './ui/InputComponents'; 
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Language } from '../App'; // Assuming Language type is exported from App.tsx
import { VisualFontMapper } from './VisualFontMapper';

// Initialize GoogleGenAI client
let ai: GoogleGenAI | null = null;
try {
    if (process.env.API_KEY) {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } else {
        console.warn("API_KEY environment variable not found. AI features will be disabled.");
    }
} catch (error) {
    console.error("Error initializing GoogleGenAI:", error);
    ai = null; 
}

const textModuleEditorTranslations = {
  en: {
    genAiButton: "Gen AI",
    cloneButton: "Clone",
    configButton: "Config",
    hideButton: "Hide",
    deleteButton: "Delete",
    aiPromptLabel: "AI Prompt",
    aiPromptPlaceholder: "e.g., A witty one-liner for a space invader",
    generateTextButton: "Generate Text",
    generatingText: "Generating...",
    aiError: "Error",
    generatedTextLabel: "Generated Text:",
    replaceModuleTextButton: "Replace Module Text",
    appendModuleTextButton: "Append to Module Text",
    closeAiPanelButton: "Close AI Panel",
    aiServiceUnavailable: "AI service is not available. API key might be missing.",
    aiEnterPrompt: "Please enter a prompt for the AI.",
    aiUnknownError: "An unknown error occurred during AI text generation.",
    aiFeaturesUnavailable: "AI features are currently unavailable. Please ensure the API key is configured correctly.",
    textSettingsTitle: "Text Settings",
    renderMode: "Render Mode",
    renderModeBitmap: "Bitmap Font",
    renderModeSystem: "System Font",
    positionX: "Position X",
    positionY: "Position Y",
    scaleX: "Scale X",
    scaleY: "Scale Y",
    zoomFactor: "Zoom Factor",
    lineHeight: "Line Height",
    hAlign: "Horizontal Alignment",
    vAlign: "Vertical Alignment",
    lineWrapWidth: "Line Wrap Width (0 for no wrap)",
    fontColorizationTitle: "Font Colorization (Bitmap Multiply)",
    enableDefaultColorization: "Enable Default Colorization (Multiply Filter)",
    defaultColor: "Default Color",
    tagBasedColorizationTitle: "Tag-Based Text Colorization (Bitmap/System)",
    tagInstruction: "Use these tags to color specific parts of your text. Select text in the module's text area, then press Ctrl+P (or Cmd+P on Mac) to wrap it.",
    tagColorSelector: "Tag Color Selector",
    openingTag: "Opening Tag",
    closingTag: "Closing Tag",
    effectsTitle: "Effects (Both Modes)",
    enableShadow: "Enable Shadow",
    shadowColor: "Shadow Color",
    shadowOffsetX: "Offset X",
    shadowOffsetY: "Offset Y",
    shadowBlur: "Blur Radius",
    enableOutline: "Enable Outline",
    outlineColor: "Outline Color",
    outlineWidth: "Width (pixels)",
    bitmapFontSettingsTitle: "Bitmap Font Settings",
    selectedFont: "Selected Font",
    font1: "Font 1",
    font2: "Font 2",
    charSequence: "Character Sequence",
    tileWidth: "Tile Width",
    tileHeight: "Tile Height",
    offsetX: "Offset X",
    offsetY: "Offset Y",
    sepX: "Separation X",
    sepY: "Separation Y",
    baseX: "Baseline X",
    baseY: "Baseline Y",
    charSpacing: "Character Spacing",
    enablePixelScanning: "Enable Pixel Scanning (for precise glyph width)",
    systemFontSettingsTitle: "System Font Settings",
    fontFamily: "Font Family",
    fontSize: "Font Size (px)",
    fontWeight: "Font Weight",
    fontStyle: "Font Style",
    systemFontColor: "Font Color",
    fontWeightNormal: "Normal",
    fontWeightBold: "Bold",
    fontStyleNormal: "Normal",
    fontStyleItalic: "Italic",
    moduleTextPlaceholder: "Enter text... (use \\n for new lines, or Ctrl+P to wrap selection with color tags)",
    moduleTextPlaceholderBatch: "Enter one text variant per line for batch processing...",
    textModulesTitle: "Text Modules",
    addModuleButton: "Add Module",
    noModulesMessage: "No text modules added yet. Click \"Add Module\" to start.",
    alignLeft: "Left",
    alignCenter: "Center",
    alignRight: "Right",
    alignTop: "Top",
    alignBottom: "Bottom",
    batchModeLabel: "Batch Mode (each line is a new image)",
    uploadCustomFontOption: "Upload Custom Font...",
    customFontLabel: "Custom: {fontName}",
    removeCustomFontButton: "Remove Custom: {fontName}",
    fontUploadError: "Font upload failed: {error}",
    fontUploadSuccess: "Custom font '{fontName}' loaded.",
  },
  pt: {
    genAiButton: "Gerar IA",
    cloneButton: "Clonar",
    configButton: "Config",
    hideButton: "Ocultar",
    deleteButton: "Excluir",
    aiPromptLabel: "Prompt da IA",
    aiPromptPlaceholder: "Ex: Uma frase espirituosa para um invasor espacial",
    generateTextButton: "Gerar Texto",
    generatingText: "Gerando...",
    aiError: "Erro",
    generatedTextLabel: "Texto Gerado:",
    replaceModuleTextButton: "Substituir Texto do Módulo",
    appendModuleTextButton: "Anexar ao Texto do Módulo",
    closeAiPanelButton: "Fechar Painel IA",
    aiServiceUnavailable: "Serviço de IA indisponível. A chave da API pode estar ausente.",
    aiEnterPrompt: "Por favor, insira um prompt para a IA.",
    aiUnknownError: "Ocorreu um erro desconhecido durante a geração de texto pela IA.",
    aiFeaturesUnavailable: "Recursos de IA estão indisponíveis. Verifique se a chave da API está configurada corretamente.",
    textSettingsTitle: "Configurações de Texto",
    renderMode: "Modo de Renderização",
    renderModeBitmap: "Fonte Bitmap",
    renderModeSystem: "Fonte do Sistema",
    positionX: "Posição X",
    positionY: "Posição Y",
    scaleX: "Escala X",
    scaleY: "Escala Y",
    zoomFactor: "Fator de Zoom",
    lineHeight: "Altura da Linha",
    hAlign: "Alinhamento Horizontal",
    vAlign: "Alinhamento Vertical",
    lineWrapWidth: "Largura da Quebra de Linha (0 para não quebrar)",
    fontColorizationTitle: "Colorização da Fonte (Bitmap Multiplicar)",
    enableDefaultColorization: "Habilitar Colorização Padrão (Filtro Multiplicar)",
    defaultColor: "Cor Padrão",
    tagBasedColorizationTitle: "Colorização de Texto por Tags (Bitmap/Sistema)",
    tagInstruction: "Use estas tags para colorir partes específicas do seu texto. Selecione o texto na área de texto do módulo e pressione Ctrl+P (ou Cmd+P no Mac) para envolvê-lo.",
    tagColorSelector: "Seletor de Cor da Tag",
    openingTag: "Tag de Abertura",
    closingTag: "Tag de Fechamento",
    effectsTitle: "Efeitos (Ambos Modos)",
    enableShadow: "Habilitar Sombra",
    shadowColor: "Cor da Sombra",
    shadowOffsetX: "Desloc. X", 
    shadowOffsetY: "Desloc. Y", 
    shadowBlur: "Raio de Desfoque",
    enableOutline: "Habilitar Contorno",
    outlineColor: "Cor do Contorno",
    outlineWidth: "Largura (pixels)",
    bitmapFontSettingsTitle: "Configurações da Fonte Bitmap",
    selectedFont: "Fonte Selecionada",
    font1: "Fonte 1",
    font2: "Fonte 2",
    charSequence: "Sequência de Caracteres",
    tileWidth: "Largura do Bloco",
    tileHeight: "Altura do Bloco",
    offsetX: "Desloc. X", 
    offsetY: "Desloc. Y", 
    sepX: "Separação X",
    sepY: "Separação Y",
    baseX: "Linha de Base X",
    baseY: "Linha de Base Y",
    charSpacing: "Espaçamento entre Caracteres",
    enablePixelScanning: "Habilitar Varredura de Pixel (para largura precisa do glifo)",
    systemFontSettingsTitle: "Configurações da Fonte do Sistema",
    fontFamily: "Família da Fonte",
    fontSize: "Tamanho da Fonte (px)",
    fontWeight: "Peso da Fonte",
    fontStyle: "Estilo da Fonte",
    systemFontColor: "Cor da Fonte",
    fontWeightNormal: "Normal",
    fontWeightBold: "Negrito",
    fontStyleNormal: "Normal",
    fontStyleItalic: "Itálico",
    moduleTextPlaceholder: "Digite o texto... (use \\n para novas linhas, ou Ctrl+P para envolver a seleção com tags de cor)",
    moduleTextPlaceholderBatch: "Digite uma variante de texto por linha para processamento em lote...",
    textModulesTitle: "Módulos de Texto",
    addModuleButton: "Adicionar Módulo",
    noModulesMessage: "Nenhum módulo de texto adicionado ainda. Clique \"Adicionar Módulo\" para começar.",
    alignLeft: "Esquerda",
    alignCenter: "Centro",
    alignRight: "Direita",
    alignTop: "Topo",
    alignBottom: "Base",
    batchModeLabel: "Modo em Lote (cada linha é uma nova imagem)",
    uploadCustomFontOption: "Carregar Fonte Personalizada...",
    customFontLabel: "Personalizada: {fontName}",
    removeCustomFontButton: "Remover Personalizada: {fontName}",
    fontUploadError: "Falha ao carregar fonte: {error}",
    fontUploadSuccess: "Fonte personalizada '{fontName}' carregada.",
  }
};


const normalizeHexColor = (hex: string): string => {
  if (!hex) return '#000000'; 
  let normalized = hex.startsWith('#') ? hex : `#${hex}`;
  if (normalized.length === 4) { 
    normalized = `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`;
  }
  if (normalized.length !== 7) return '#000000'; 
  return normalized.toUpperCase();
};

interface ConfigPanelProps {
  module: TextModule;
  onSettingChange: <K extends keyof (TextSettings & BitmapFontSettings)>(
    settingKey: K,
    value: (TextSettings & BitmapFontSettings)[K]
  ) => void;
  currentTagColor: string;
  onCurrentTagColorChange: (color: string) => void;
  generatedOpeningTag: string;
  generatedClosingTag: string;
  language: Language;
  bitmapFontImage1: string | null;
  bitmapFontImage2: string | null;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ 
  module, 
  onSettingChange,
  currentTagColor,
  onCurrentTagColorChange,
  generatedOpeningTag,
  generatedClosingTag,
  language,
  bitmapFontImage1,
  bitmapFontImage2,
}) => {
  const t = textModuleEditorTranslations[language];
  const customFontFileInputRef = useRef<HTMLInputElement>(null);

  const handleNumericSettingChange = <K extends keyof (TextSettings & BitmapFontSettings)>(
    key: K, 
    newValue: string | number // Allow string from input then parse
  ) => {
    const numValue = typeof newValue === 'string' ? parseFloat(newValue) : newValue;
    if (!isNaN(numValue)) {
        onSettingChange(key, numValue as (TextSettings & BitmapFontSettings)[K]);
    }
  };
  
  const handleStringSettingChange = <K extends keyof (TextSettings & BitmapFontSettings)>(
    key: K, 
    newValue: string | null // Allow null for clearing custom font fields
  ) => {
    onSettingChange(key, newValue as (TextSettings & BitmapFontSettings)[K]);
  };

  const handleBooleanSettingChange = <K extends keyof (TextSettings & BitmapFontSettings)>(
    key: K,
    newValue: boolean
  ) => {
    onSettingChange(key, newValue as (TextSettings & BitmapFontSettings)[K]);
  };

  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue === CUSTOM_FONT_UPLOAD_VALUE) {
      customFontFileInputRef.current?.click();
      // Do not change fontFamily yet, wait for file upload
      // Re-select the current fontFamily to avoid "Upload..." being shown as selected
      if (customFontFileInputRef.current) { // Ensure ref is valid before trying to set value
         // This is tricky, ideally the SelectInput would re-render with current module.textSettings.fontFamily
         // For now, we rely on the upload success to set the fontFamily
      }
    } else {
      if (selectedValue !== module.textSettings.customFontFamilyName) {
        // User selected a standard font or switched from a custom font
        handleStringSettingChange('customFontFileName', null);
        handleStringSettingChange('customFontFamilyName', null);
      }
      handleStringSettingChange('fontFamily', selectedValue);
    }
  };

  const handleCustomFontUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const fontData = await file.arrayBuffer();
        const uniqueFontFamilyName = `bgs-custom-${module.id}-${Date.now()}`;
        const fontFace = new FontFace(uniqueFontFamilyName, fontData);
        await fontFace.load();
        document.fonts.add(fontFace);

        handleStringSettingChange('customFontFileName', file.name);
        handleStringSettingChange('customFontFamilyName', uniqueFontFamilyName);
        handleStringSettingChange('fontFamily', uniqueFontFamilyName); // Set as active font
        alert(t.fontUploadSuccess.replace('{fontName}', file.name));
      } catch (err) {
        console.error("Error loading custom font:", err);
        alert(t.fontUploadError.replace('{error}', (err as Error).message || 'Unknown error'));
        // Clear custom font fields if upload fails
        handleStringSettingChange('customFontFileName', null);
        handleStringSettingChange('customFontFamilyName', null);
        // Revert fontFamily to default if it was pointing to a failed custom upload attempt
        if (module.textSettings.fontFamily.startsWith('bgs-custom-')) {
           handleStringSettingChange('fontFamily', COMMON_FONT_FAMILIES[0].value);
        }
      }
      // Reset file input to allow re-uploading the same file
      if (customFontFileInputRef.current) {
        customFontFileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveCustomFont = () => {
    handleStringSettingChange('customFontFileName', null);
    handleStringSettingChange('customFontFamilyName', null);
    handleStringSettingChange('fontFamily', COMMON_FONT_FAMILIES[0].value); // Revert to default
  };


  const renderModeOptions: { value: 'bitmap' | 'system'; label: string }[] = [
    { value: 'bitmap', label: t.renderModeBitmap },
    { value: 'system', label: t.renderModeSystem },
  ];

  const fontWeightOptions: { value: 'normal' | 'bold'; label: string }[] = [
    { value: 'normal', label: t.fontWeightNormal },
    { value: 'bold', label: t.fontWeightBold },
  ];

  const fontStyleOptions: { value: 'normal' | 'italic'; label: string }[] = [
    { value: 'normal', label: t.fontStyleNormal },
    { value: 'italic', label: t.fontStyleItalic },
  ];

  const horizontalAlignOptions = [
    { value: HorizontalAlignment.Left, label: t.alignLeft },
    { value: HorizontalAlignment.Center, label: t.alignCenter },
    { value: HorizontalAlignment.Right, label: t.alignRight },
  ];
  const verticalAlignOptions = [
    { value: VerticalAlignment.Top, label: t.alignTop },
    { value: VerticalAlignment.Center, label: t.alignCenter },
    { value: VerticalAlignment.Bottom, label: t.alignBottom },
  ];
  const fontSelectOptions: { value: 'font1' | 'font2'; label: string }[] = [
    { value: 'font1', label: t.font1 },
    { value: 'font2', label: t.font2 },
  ];

  const systemFontFamilyOptions = () => {
    const options: { value: string; label: string }[] = [];
    if (module.textSettings.customFontFamilyName && module.textSettings.customFontFileName) {
      options.push({
        value: module.textSettings.customFontFamilyName,
        label: t.customFontLabel.replace('{fontName}', module.textSettings.customFontFileName),
      });
    }
    options.push({ value: CUSTOM_FONT_UPLOAD_VALUE, label: t.uploadCustomFontOption });
    return options.concat(COMMON_FONT_FAMILIES);
  };


  return (
    <div className="mt-3 p-4 border border-gray-200 rounded-md bg-gray-50">
      <h4 className="text-md font-semibold text-gray-700 mb-3">{t.textSettingsTitle}</h4>
      <SelectInput 
        label={t.renderMode} 
        id={`${module.id}-renderMode`} 
        options={renderModeOptions} 
        value={module.textSettings.renderMode} 
        onChange={(e) => handleStringSettingChange('renderMode', e.target.value as 'bitmap' | 'system')} 
        containerClassName="md:col-span-2"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
        <SliderInput label={t.positionX} id={`${module.id}-positionX`} value={module.textSettings.positionX} onChange={(val) => handleNumericSettingChange('positionX', val)} min={-2048} max={2048} step={1} />
        <SliderInput label={t.positionY} id={`${module.id}-positionY`} value={module.textSettings.positionY} onChange={(val) => handleNumericSettingChange('positionY', val)} min={-2048} max={2048} step={1} />
        <SliderInput label={t.scaleX} id={`${module.id}-scaleX`} value={module.textSettings.scaleX} onChange={(val) => handleNumericSettingChange('scaleX', val)} min={0.1} max={10} step={0.05} />
        <SliderInput label={t.scaleY} id={`${module.id}-scaleY`} value={module.textSettings.scaleY} onChange={(val) => handleNumericSettingChange('scaleY', val)} min={0.1} max={10} step={0.05} />
        <SliderInput label={t.zoomFactor} id={`${module.id}-zoomFactor`} value={module.textSettings.zoomFactor} onChange={(val) => handleNumericSettingChange('zoomFactor', val)} min={0.1} max={10} step={0.05} />
        <SliderInput label={t.lineHeight} id={`${module.id}-lineHeight`} value={module.textSettings.lineHeight} onChange={(val) => handleNumericSettingChange('lineHeight', val)} min={0.1} max={5} step={0.1} />
        <SelectInput label={t.hAlign} id={`${module.id}-hAlign`} options={horizontalAlignOptions} value={module.textSettings.horizontalAlignment} onChange={(e) => handleStringSettingChange('horizontalAlignment', e.target.value as HorizontalAlignment)} />
        <SelectInput label={t.vAlign} id={`${module.id}-vAlign`} options={verticalAlignOptions} value={module.textSettings.verticalAlignment} onChange={(e) => handleStringSettingChange('verticalAlignment', e.target.value as VerticalAlignment)} />
        <SliderInput 
          label={t.lineWrapWidth}
          id={`${module.id}-lineWrapWidth`} 
          value={module.textSettings.lineWrapWidth} 
          onChange={(val) => handleNumericSettingChange('lineWrapWidth', val)} 
          min={0} max={2048} step={1} 
        />
      </div>

      {module.textSettings.renderMode === 'system' && (
        <>
          <h4 className="text-md font-semibold text-gray-700 mt-6 mb-3 border-t pt-4">{t.systemFontSettingsTitle}</h4>
          <input
            type="file"
            ref={customFontFileInputRef}
            onChange={handleCustomFontUpload}
            accept=".ttf,.otf,.woff,.woff2"
            className="hidden"
            aria-hidden="true"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <SelectInput 
              label={t.fontFamily} 
              id={`${module.id}-fontFamily`} 
              options={systemFontFamilyOptions()} 
              value={module.textSettings.fontFamily} // This should be customFontFamilyName or standard font string
              onChange={handleFontFamilyChange}
              key={module.textSettings.customFontFamilyName || 'no-custom-font-active'} // Force re-render on custom font change
            />
            <NumberInput label={t.fontSize} id={`${module.id}-fontSize`} value={module.textSettings.fontSize} onChange={(e) => handleNumericSettingChange('fontSize', e.target.value)} min={1} step={1} />
            <SelectInput label={t.fontWeight} id={`${module.id}-fontWeight`} options={fontWeightOptions} value={module.textSettings.fontWeight} onChange={(e) => handleStringSettingChange('fontWeight', e.target.value as 'normal' | 'bold')} />
            <SelectInput label={t.fontStyle} id={`${module.id}-fontStyle`} options={fontStyleOptions} value={module.textSettings.fontStyle} onChange={(e) => handleStringSettingChange('fontStyle', e.target.value as 'normal' | 'italic')} />
            <div className="mb-3 md:col-span-2">
              <label htmlFor={`${module.id}-systemFontColor`} className="block text-sm font-medium text-gray-700 mb-1">{t.systemFontColor}</label>
              <input type="color" id={`${module.id}-systemFontColor`} value={module.textSettings.systemFontColor} onChange={(e) => handleStringSettingChange('systemFontColor', e.target.value)} className="w-full h-10 px-1 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none" aria-label="System font color picker"/>
            </div>
          </div>
          {module.textSettings.customFontFileName && (
            <Button
              onClick={handleRemoveCustomFont}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50 mt-1 w-full md:w-auto"
              leftIcon={ICONS.trash}
            >
              {t.removeCustomFontButton.replace('{fontName}', module.textSettings.customFontFileName)}
            </Button>
          )}
        </>
      )}

      
      <h4 className="text-md font-semibold text-gray-700 mt-6 mb-3 border-t pt-4">{t.tagBasedColorizationTitle}</h4>
      <p className="text-xs text-gray-600 mb-3">{t.tagInstruction}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 items-end">
        <div className="mb-3"><label htmlFor={`${module.id}-tagColorPicker`} className="block text-sm font-medium text-gray-700 mb-1">{t.tagColorSelector}</label><input type="color" id={`${module.id}-tagColorPicker`} value={currentTagColor} onChange={(e) => onCurrentTagColorChange(e.target.value)} className="w-full h-10 px-1 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none" aria-label="Color picker for generating text color tags"/></div>
        <div className="mb-3"><label className="block text-sm font-medium text-gray-700 mb-1">{t.openingTag}</label><input type="text" readOnly value={generatedOpeningTag} className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-500 select-all" /></div>
        <div className="mb-3"><label className="block text-sm font-medium text-gray-700 mb-1">{t.closingTag}</label><input type="text" readOnly value={generatedClosingTag} className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-500 select-all" /></div>
      </div>
      
      {module.textSettings.renderMode === 'bitmap' && (
        <>
          <h4 className="text-md font-semibold text-gray-700 mt-6 mb-3 border-t pt-4">{t.fontColorizationTitle}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <div className="flex items-center mb-3 md:col-span-1">
              <input type="checkbox" id={`${module.id}-enableFontColorization`} checked={module.textSettings.enableFontColorization} onChange={(e) => handleBooleanSettingChange('enableFontColorization', e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
              <label htmlFor={`${module.id}-enableFontColorization`} className="ml-2 block text-sm text-gray-900">{t.enableDefaultColorization}</label>
            </div>
            <div className="mb-3 md:col-span-1">
              <label htmlFor={`${module.id}-fontColor`} className={`block text-sm font-medium mb-1 ${!module.textSettings.enableFontColorization ? 'text-gray-400' : 'text-gray-700'}`}>{t.defaultColor}</label>
              <input type="color" id={`${module.id}-fontColor`} value={module.textSettings.fontColor} onChange={(e) => handleStringSettingChange('fontColor', e.target.value)} disabled={!module.textSettings.enableFontColorization} className={`w-full h-10 px-1 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none ${!module.textSettings.enableFontColorization ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`} aria-label="Default font color picker for multiply filter"/>
            </div>
          </div>
        </>
      )}
      
      <h4 className="text-md font-semibold text-gray-700 mt-6 mb-3 border-t pt-4">{t.effectsTitle}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
        {/* Shadow Settings */}
        <div className="mb-4 p-3 border border-gray-200 rounded-md bg-gray-100">
          <div className="flex items-center mb-2">
            <input type="checkbox" id={`${module.id}-enableShadow`} checked={module.textSettings.enableShadow} onChange={(e) => handleBooleanSettingChange('enableShadow', e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
            <label htmlFor={`${module.id}-enableShadow`} className="ml-2 block text-sm text-gray-900">{t.enableShadow}</label>
          </div>
          {module.textSettings.enableShadow && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 pl-6">
              <div>
                <label htmlFor={`${module.id}-shadowColor`} className="block text-xs font-medium text-gray-700 mb-0.5">{t.shadowColor}</label>
                <input type="color" id={`${module.id}-shadowColor`} value={module.textSettings.shadowColor} onChange={(e) => handleStringSettingChange('shadowColor', e.target.value)} className="w-full h-8 px-1 py-1 border border-gray-300 rounded-md shadow-sm" aria-label="Shadow color"/>
              </div>
              <div /> {/* Spacer for grid alignment */}
              <SliderInput label={t.shadowOffsetX} id={`${module.id}-shadowOffsetX`} value={module.textSettings.shadowOffsetX} onChange={(val) => handleNumericSettingChange('shadowOffsetX', val)} min={-20} max={20} step={1} containerClassName="mb-0 mt-1" labelClassName="text-xs" />
              <SliderInput label={t.shadowOffsetY} id={`${module.id}-shadowOffsetY`} value={module.textSettings.shadowOffsetY} onChange={(val) => handleNumericSettingChange('shadowOffsetY', val)} min={-20} max={20} step={1} containerClassName="mb-0 mt-1" labelClassName="text-xs" />
              <SliderInput label={t.shadowBlur} id={`${module.id}-shadowBlur`} value={module.textSettings.shadowBlur} onChange={(val) => handleNumericSettingChange('shadowBlur', val)} min={0} max={30} step={1} containerClassName="mb-0 mt-1" labelClassName="text-xs" />
            </div>
          )}
        </div>

        {/* Outline Settings */}
        <div className="mb-4 p-3 border border-gray-200 rounded-md bg-gray-100">
          <div className="flex items-center mb-2">
            <input type="checkbox" id={`${module.id}-enableOutline`} checked={module.textSettings.enableOutline} onChange={(e) => handleBooleanSettingChange('enableOutline', e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
            <label htmlFor={`${module.id}-enableOutline`} className="ml-2 block text-sm text-gray-900">{t.enableOutline}</label>
          </div>
          {module.textSettings.enableOutline && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 pl-6">
              <div>
                <label htmlFor={`${module.id}-outlineColor`} className="block text-xs font-medium text-gray-700 mb-0.5">{t.outlineColor}</label>
                <input type="color" id={`${module.id}-outlineColor`} value={module.textSettings.outlineColor} onChange={(e) => handleStringSettingChange('outlineColor', e.target.value)} className="w-full h-8 px-1 py-1 border border-gray-300 rounded-md shadow-sm" aria-label="Outline color"/>
              </div>
              <div /> {/* Spacer */}
              <SliderInput label={t.outlineWidth} id={`${module.id}-outlineWidth`} value={module.textSettings.outlineWidth} onChange={(val) => handleNumericSettingChange('outlineWidth', val)} min={1} max={10} step={1} containerClassName="mb-0 mt-1" labelClassName="text-xs" />
            </div>
          )}
        </div>
      </div>

      {module.textSettings.renderMode === 'bitmap' && (
        <>
          <h4 className="text-md font-semibold text-gray-700 mt-6 mb-3 border-t pt-4">{t.bitmapFontSettingsTitle}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <SelectInput 
                label={t.selectedFont}
                id={`${module.id}-selectedFont`} 
                options={fontSelectOptions} 
                value={module.bitmapFontSettings.selectedFont} 
                onChange={(e) => handleStringSettingChange('selectedFont', e.target.value as 'font1' | 'font2')} 
                containerClassName="md:col-span-2"
            />
          </div>
          
          <VisualFontMapper
            fontImageSrc={module.bitmapFontSettings.selectedFont === 'font1' ? bitmapFontImage1 : bitmapFontImage2}
            settings={module.bitmapFontSettings}
            sequence={module.bitmapFontSettings.characterSequence}
            onSequenceChange={(newSequence) => handleStringSettingChange('characterSequence', newSequence)}
            language={language}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <SliderInput label={t.tileWidth} id={`${module.id}-tileWidth`} value={module.bitmapFontSettings.tileWidth} onChange={(val) => handleNumericSettingChange('tileWidth', val)} min={1} max={256} step={1} />
            <SliderInput label={t.tileHeight} id={`${module.id}-tileHeight`} value={module.bitmapFontSettings.tileHeight} onChange={(val) => handleNumericSettingChange('tileHeight', val)} min={1} max={256} step={1} />
            <SliderInput label={t.offsetX} id={`${module.id}-offsetX`} value={module.bitmapFontSettings.offsetX} onChange={(val) => handleNumericSettingChange('offsetX', val)} min={-128} max={128} step={1} />
            <SliderInput label={t.offsetY} id={`${module.id}-offsetY`} value={module.bitmapFontSettings.offsetY} onChange={(val) => handleNumericSettingChange('offsetY', val)} min={-128} max={128} step={1} />
            <SliderInput label={t.sepX} id={`${module.id}-sepX`} value={module.bitmapFontSettings.separationX} onChange={(val) => handleNumericSettingChange('separationX', val)} min={0} max={64} step={1} />
            <SliderInput label={t.sepY} id={`${module.id}-sepY`} value={module.bitmapFontSettings.separationY} onChange={(val) => handleNumericSettingChange('separationY', val)} min={0} max={64} step={1} />
            <SliderInput label={t.baseX} id={`${module.id}-baseX`} value={module.bitmapFontSettings.baselineX} onChange={(val) => handleNumericSettingChange('baselineX', val)} min={-64} max={64} step={1} />
            <SliderInput label={t.baseY} id={`${module.id}-baseY`} value={module.bitmapFontSettings.baselineY} onChange={(val) => handleNumericSettingChange('baselineY', val)} min={-64} max={64} step={1} />
            <SliderInput label={t.charSpacing} id={`${module.id}-charSpacing`} value={module.bitmapFontSettings.characterSpacing} onChange={(val) => handleNumericSettingChange('characterSpacing', val)} min={-32} max={64} step={1} />
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              <input type="checkbox" id={`${module.id}-enablePixelScanning`} checked={module.bitmapFontSettings.enablePixelScanning} onChange={(e) => handleBooleanSettingChange('enablePixelScanning', e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
              <label htmlFor={`${module.id}-enablePixelScanning`} className="ml-2 block text-sm text-gray-900">{t.enablePixelScanning}</label>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

interface TextModuleItemProps {
  module: TextModule;
  onUpdateModule: (updatedModule: TextModule) => void;
  onCloneModule: (moduleId: string) => void;
  onToggleConfigure: (moduleId: string) => void;
  onDeleteModule: (moduleId: string) => void; 
  currentTagColor: string; 
  onCurrentTagColorChange: (color: string) => void; 
  generatedOpeningTag: string; 
  generatedClosingTag: string;
  language: Language;
  bitmapFontImage1: string | null;
  bitmapFontImage2: string | null;
}

const TextModuleItem: React.FC<TextModuleItemProps> = ({ 
  module, 
  onUpdateModule, 
  onCloneModule, 
  onToggleConfigure, 
  onDeleteModule,
  currentTagColor, 
  onCurrentTagColorChange, 
  generatedOpeningTag,
  generatedClosingTag,
  language,
  bitmapFontImage1,
  bitmapFontImage2,
}) => {
  const t = textModuleEditorTranslations[language];
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatedAiText, setGeneratedAiText] = useState('');
  const [isGeneratingAiText, setIsGeneratingAiText] = useState(false);
  const [aiError, setAiErrorState] = useState<string | null>(null); // Renamed to avoid conflict

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    let currentLineIndex = module.currentBatchLineIndex ?? 0;
    if (module.isBatchMode) {
      const cursorPosition = e.target.selectionStart;
      const textUpToCursor = newText.substring(0, cursorPosition);
      currentLineIndex = (textUpToCursor.match(/\n/g) || []).length;
    }
    onUpdateModule({ ...module, text: newText, currentBatchLineIndex: currentLineIndex });
  };

  const handleCursorActivity = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    if (module.isBatchMode) {
      const textarea = event.currentTarget;
      const cursorPosition = textarea.selectionStart;
      const textUpToCursor = module.text.substring(0, cursorPosition);
      const currentLineIndex = (textUpToCursor.match(/\n/g) || []).length;
      
      if (module.currentBatchLineIndex !== currentLineIndex) {
        onUpdateModule({ ...module, currentBatchLineIndex: currentLineIndex });
      }
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateModule({ ...module, name: e.target.value });
  };

  const handleSettingChange = <K extends keyof (TextSettings & BitmapFontSettings)>(
    settingKey: K,
    value: (TextSettings & BitmapFontSettings)[K]
  ) => {
    const updatedModule = { ...module };
    if (settingKey in module.textSettings) {
      updatedModule.textSettings = { ...module.textSettings, [settingKey as keyof TextSettings]: value as any };
    } else if (settingKey in module.bitmapFontSettings) {
      updatedModule.bitmapFontSettings = { ...module.bitmapFontSettings, [settingKey as keyof BitmapFontSettings]: value as any };
    }
    onUpdateModule(updatedModule);
  };

  const handleTextAreaKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'p') { // Enable for both modes
      event.preventDefault();
      const textarea = event.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentText = module.text;
      const selectedText = currentText.substring(start, end);
      if (selectedText) {
        const newText = currentText.substring(0, start) + generatedOpeningTag + selectedText + generatedClosingTag + currentText.substring(end);
        onUpdateModule({ ...module, text: newText });
      }
    }
  };

  const toggleAiPanel = () => {
    setShowAiPanel(!showAiPanel);
    if (showAiPanel) { // If closing, reset AI state
        setAiPrompt('');
        setGeneratedAiText('');
        setAiErrorState(null);
    }
  };

  const handleAiGenerate = async () => {
    if (!ai) {
        setAiErrorState(t.aiServiceUnavailable);
        return;
    }
    if (!aiPrompt.trim()) {
        setAiErrorState(t.aiEnterPrompt);
        return;
    }
    setIsGeneratingAiText(true);
    setAiErrorState(null);
    setGeneratedAiText('');

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-04-17',
            contents: aiPrompt,
        });
        setGeneratedAiText(response.text);
    } catch (error) {
        console.error("Error generating text with AI:", error);
        setAiErrorState(error instanceof Error ? error.message : t.aiUnknownError);
    } finally {
        setIsGeneratingAiText(false);
    }
  };

  const handleReplaceTextWithAi = () => {
    if (generatedAiText) {
        onUpdateModule({ ...module, text: generatedAiText });
    }
  };

  const handleAppendTextWithAi = () => {
    if (generatedAiText) {
        const newText = module.text ? `${module.text}\\n${generatedAiText}` : generatedAiText; // Use \\n for new lines
        onUpdateModule({ ...module, text: newText });
    }
  };


  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex justify-between items-center mb-2">
        <input type="text" value={module.name} onChange={handleNameChange} className="text-lg font-semibold text-gray-800 bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 w-auto flex-grow mr-2" aria-label={`Edit name for module ${module.name}`} spellCheck="false"/>
        <div className="space-x-1 sm:space-x-2 flex-shrink-0 flex items-center">
          {ai && (
            <Button onClick={toggleAiPanel} size="sm" leftIcon={ICONS.sparkles} variant="ghost" aria-label={`Toggle AI text generation for module ${module.name}`}>
              <span className="hidden sm:inline">{t.genAiButton}</span>
            </Button>
          )}
          <Button onClick={() => onCloneModule(module.id)} size="sm" leftIcon={ICONS.clone} variant="ghost" aria-label={`Clone module ${module.name}`}>
             <span className="hidden sm:inline">{t.cloneButton}</span>
          </Button>
          <Button onClick={() => onToggleConfigure(module.id)} size="sm" leftIcon={ICONS.configure} variant={module.isConfiguring ? "secondary" : "ghost"} aria-label={`${module.isConfiguring ? t.hideButton : t.configButton} module ${module.name}`}>
            {module.isConfiguring ? <span className="hidden sm:inline">{t.hideButton}</span> : <span className="hidden sm:inline">{t.configButton}</span>}
            {!module.isConfiguring && !module.isConfiguring && <span className="sm:hidden">{t.configButton}</span>}
            {module.isConfiguring && <span className="sm:hidden">{t.hideButton}</span>}
          </Button>
           <Button onClick={() => onDeleteModule(module.id)} size="sm" leftIcon={ICONS.trash} variant="ghost" className="text-red-600 hover:bg-red-50" aria-label={`Delete module ${module.name}`}>
             <span className="hidden sm:inline">{t.deleteButton}</span>
           </Button>
        </div>
      </div>
      <TextArea 
        id={`text-${module.id}`} 
        label="" 
        value={module.text} 
        onChange={handleTextChange} 
        onKeyDown={handleTextAreaKeyDown} 
        onKeyUp={handleCursorActivity}
        onClick={handleCursorActivity}
        onFocus={handleCursorActivity}
        placeholder={module.isBatchMode ? t.moduleTextPlaceholderBatch : t.moduleTextPlaceholder} 
        rows={3} 
        inputClassName="min-h-[80px]" 
        aria-label={`Text content for ${module.name}`}
      />
       <div className="flex items-center mt-2 mb-1">
        <input
          type="checkbox"
          id={`${module.id}-batchMode`}
          checked={!!module.isBatchMode}
          onChange={(e) => onUpdateModule({ ...module, isBatchMode: e.target.checked, currentBatchLineIndex: e.target.checked ? (module.currentBatchLineIndex ?? 0) : undefined })}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          aria-labelledby={`${module.id}-batchMode-label`}
        />
        <label id={`${module.id}-batchMode-label`} htmlFor={`${module.id}-batchMode`} className="ml-2 block text-sm text-gray-900">
          {t.batchModeLabel}
        </label>
      </div>
      
      {showAiPanel && ai && (
        <div className="mt-3 p-3 border border-indigo-200 rounded-md bg-indigo-50 space-y-3">
          <TextArea
            id={`${module.id}-ai-prompt`}
            label={t.aiPromptLabel}
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder={t.aiPromptPlaceholder}
            rows={2}
            aria-label="Prompt for AI text generation"
          />
          <div className="flex items-center space-x-2">
            <Button 
              onClick={handleAiGenerate} 
              disabled={isGeneratingAiText || !aiPrompt.trim()}
              variant="primary"
              size="sm"
              leftIcon={ICONS.sparkles}
            >
              {t.generateTextButton}
            </Button>
            {isGeneratingAiText && <p className="text-sm text-indigo-700">{t.generatingText}</p>}
          </div>

          {aiError && <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md">{t.aiError}: {aiError}</p>}

          {generatedAiText && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-700">{t.generatedTextLabel}</h5>
              <div className="p-2 border border-gray-300 bg-gray-50 rounded-md whitespace-pre-wrap text-sm text-gray-900 max-h-40 overflow-y-auto">
                {generatedAiText}
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleReplaceTextWithAi} size="sm" variant="secondary">{t.replaceModuleTextButton}</Button>
                <Button onClick={handleAppendTextWithAi} size="sm" variant="secondary">{t.appendModuleTextButton}</Button>
              </div>
            </div>
          )}
          <Button onClick={toggleAiPanel} size="sm" variant="ghost" className="w-full mt-2">{t.closeAiPanelButton}</Button>
        </div>
      )}
       {!ai && showAiPanel && (
         <div className="mt-3 p-3 border border-yellow-300 rounded-md bg-yellow-50 text-yellow-700 text-sm">
            {t.aiFeaturesUnavailable}
            <Button onClick={toggleAiPanel} size="sm" variant="ghost" className="w-full mt-2 text-yellow-700">{t.closeAiPanelButton}</Button>
         </div>
       )}


      {module.isConfiguring && (
        <ConfigPanel 
          module={module} 
          onSettingChange={handleSettingChange}
          currentTagColor={currentTagColor} 
          onCurrentTagColorChange={onCurrentTagColorChange} 
          generatedOpeningTag={generatedOpeningTag} 
          generatedClosingTag={generatedClosingTag} 
          language={language}
          bitmapFontImage1={bitmapFontImage1}
          bitmapFontImage2={bitmapFontImage2}
        />
      )}
    </div>
  );
};

interface TextModuleEditorProps {
  textModules: TextModule[];
  onUpdateTextModules: (modules: TextModule[]) => void;
  nextModuleNumber: number;
  onSetNextModuleNumber: (num: number) => void;
  language: Language;
  bitmapFontImage1: string | null;
  bitmapFontImage2: string | null;
}

export const TextModuleEditor: React.FC<TextModuleEditorProps> = ({ 
  textModules, 
  onUpdateTextModules, 
  nextModuleNumber, 
  onSetNextModuleNumber, 
  language,
  bitmapFontImage1,
  bitmapFontImage2,
}) => {
  const t = textModuleEditorTranslations[language];
  const [currentTagColorForEditor, setCurrentTagColorForEditor] = useState<string>('#FF0000'); 
  const normalizedTagColor = normalizeHexColor(currentTagColorForEditor);
  const editorGeneratedOpeningTag = `<C${normalizedTagColor}>`;
  const editorGeneratedClosingTag = `</C>`; 

  const addModule = () => {
    const newModule: TextModule = {
      id: generateId(), name: `Module ${nextModuleNumber}`, text: '',
      textSettings: { ...DEFAULT_TEXT_SETTINGS },
      bitmapFontSettings: { ...DEFAULT_BITMAP_FONT_SETTINGS },
      isConfiguring: false,
      isBatchMode: false,
      currentBatchLineIndex: 0, // Initialize for batch mode preview
    };
    onUpdateTextModules([...textModules, newModule]);
    onSetNextModuleNumber(nextModuleNumber + 1);
  };

  const updateModule = (updatedModule: TextModule) => {
    onUpdateTextModules(textModules.map(m => (m.id === updatedModule.id ? updatedModule : m)));
  };

  const cloneModule = (moduleId: string) => {
    const moduleToClone = textModules.find(m => m.id === moduleId);
    if (moduleToClone) {
      const newModule: TextModule = {
        ...JSON.parse(JSON.stringify(moduleToClone)), 
        id: generateId(), name: `${moduleToClone.name} (Clone ${nextModuleNumber})`, 
        isConfiguring: false, 
        isBatchMode: moduleToClone.isBatchMode || false,
        currentBatchLineIndex: moduleToClone.isBatchMode ? (moduleToClone.currentBatchLineIndex ?? 0) : undefined,
      };
      onUpdateTextModules([...textModules, newModule]);
      onSetNextModuleNumber(nextModuleNumber + 1);
    }
  };

  const toggleConfigure = (moduleId: string) => {
    onUpdateTextModules(textModules.map(m => m.id === moduleId ? { ...m, isConfiguring: !m.isConfiguring } : m));
  };

  const deleteModule = (moduleId: string) => {
    onUpdateTextModules(textModules.filter(m => m.id !== moduleId));
  };

  return (
    <div className="w-3/5 p-4 flex flex-col bg-gray-50 m-2 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700">{t.textModulesTitle}</h2>
        <Button onClick={addModule} variant="primary" leftIcon={ICONS.add}>{t.addModuleButton}</Button>
      </div>
      <div className="flex-grow overflow-y-auto pr-2 space-y-4">
        {textModules.length === 0 && (<p className="text-gray-500 text-center py-8">{t.noModulesMessage}</p>)}
        {textModules.map(module => (
          <TextModuleItem
            key={module.id} module={module}
            onUpdateModule={updateModule} onCloneModule={cloneModule}
            onToggleConfigure={toggleConfigure} onDeleteModule={deleteModule}
            currentTagColor={currentTagColorForEditor} 
            onCurrentTagColorChange={setCurrentTagColorForEditor} 
            generatedOpeningTag={editorGeneratedOpeningTag} // Corrected prop name
            generatedClosingTag={editorGeneratedClosingTag} 
            language={language}
            bitmapFontImage1={bitmapFontImage1}
            bitmapFontImage2={bitmapFontImage2}
          />
        ))}
      </div>
    </div>
  );
};
