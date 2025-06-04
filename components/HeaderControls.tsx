
import React, { useRef } from 'react';
import { ICONS } from '../constants';
import { Button } from './ui/ButtonComponents';
import { Language } from '../App'; // Assuming Language type is exported from App.tsx

interface HeaderControlsProps {
  onSavePreview: () => void;
  onSaveActiveProfileToLibraryPrompt: () => void;
  onExportProfile: () => void;
  onImportProfile: (file: File) => void;
  onToggleLibraryView: () => void;
  currentView: 'editor' | 'library';
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

const headerTranslations = {
  en: {
    siteTitle: "🍌Banana Graphic Studio",
    savePreview: "Save Preview",
    saveToLibrary: "Save to Library",
    exportProfile: "Export JSON",
    importProfile: "Import Profile",
    profileLibrary: "Profile Library",
    backToEditor: "Back to Editor",
  },
  pt: {
    siteTitle: "🍌Banana Graphic Studio",
    savePreview: "Salvar Prévia",
    saveToLibrary: "Salvar na Biblioteca",
    exportProfile: "Exportar JSON",
    importProfile: "Importar Perfil",
    profileLibrary: "Biblioteca de Perfis",
    backToEditor: "Voltar ao Editor",
  }
};

export const HeaderControls: React.FC<HeaderControlsProps> = ({
  onSavePreview,
  onSaveActiveProfileToLibraryPrompt,
  onExportProfile,
  onImportProfile,
  onToggleLibraryView,
  currentView,
  language,
  onLanguageChange,
}) => {
  const importInputRef = useRef<HTMLInputElement>(null);
  const t = headerTranslations[language];

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportProfile(file);
      event.target.value = ''; // Reset input
    }
  };

  return (
    <header className="bg-white shadow-md p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-800">{t.siteTitle}</h1>
          <div className="ml-4 flex items-center space-x-2">
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-1 text-xs rounded-md ${
                language === 'en' 
                  ? 'bg-blue-600 text-white font-semibold' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              aria-pressed={language === 'en'}
              aria-label="Switch to English"
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange('pt')}
              className={`px-2 py-1 text-xs rounded-md ${
                language === 'pt' 
                  ? 'bg-blue-600 text-white font-semibold' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              aria-pressed={language === 'pt'}
              aria-label="Mudar para Português"
            >
              PT
            </button>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button onClick={onSavePreview} variant="primary" leftIcon={ICONS.save}>
            {t.savePreview}
          </Button>
          <Button onClick={onSaveActiveProfileToLibraryPrompt} variant="primary" leftIcon={ICONS.library}>
            {t.saveToLibrary}
          </Button>
          <Button onClick={onExportProfile} variant="secondary" leftIcon={ICONS.export}>
            {t.exportProfile}
          </Button>
          <Button onClick={handleImportClick} variant="secondary" leftIcon={ICONS.import}>
            {t.importProfile}
          </Button>
          <Button 
            onClick={onToggleLibraryView} 
            variant="secondary" 
            leftIcon={currentView === 'editor' ? ICONS.collection : ICONS.back}
          >
            {currentView === 'editor' ? t.profileLibrary : t.backToEditor}
          </Button>
          <input
            type="file"
            ref={importInputRef}
            className="hidden"
            accept=".json"
            onChange={handleFileImport}
          />
        </div>
      </div>
    </header>
  );
};
