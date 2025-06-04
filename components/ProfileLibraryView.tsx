
import React, { useState } from 'react';
import { Profile } from '../types';
import { Button } from './ui/ButtonComponents';
import { ICONS } from '../constants';
import { Language } from '../App';

interface ProfileLibraryViewProps {
  savedProfiles: Profile[];
  onSaveCurrentToLibrary: (name: string) => void;
  onLoadProfile: (profileId: string) => void;
  onDeleteProfile: (profileId: string) => void;
  language: Language;
}

const profileLibraryTranslations = {
  en: {
    title: "Profile Library",
    saveCurrentSessionTitle: "Save Current Editor Session to Library",
    profileNamePlaceholder: "Enter profile name for library",
    saveToLibraryButton: "Save to Library",
    savedProfilesTitle: "Saved Profiles",
    noProfilesMessage: "No profiles saved to the library yet.",
    noOriginalImage: "No Original Image",
    untitledProfile: "Untitled Profile",
    idLabel: "ID:",
    modulesLabel: "Modules:",
    loadToEditorButton: "Load to Editor",
    deleteFromLibraryButton: "Delete from Library",
  },
  pt: {
    title: "Biblioteca de Perfis",
    saveCurrentSessionTitle: "Salvar Sessão Atual do Editor na Biblioteca",
    profileNamePlaceholder: "Digite o nome do perfil para a biblioteca",
    saveToLibraryButton: "Salvar na Biblioteca",
    savedProfilesTitle: "Perfis Salvos",
    noProfilesMessage: "Nenhum perfil salvo na biblioteca ainda.",
    noOriginalImage: "Sem Imagem Original",
    untitledProfile: "Perfil Sem Título",
    idLabel: "ID:",
    modulesLabel: "Módulos:",
    loadToEditorButton: "Carregar no Editor",
    deleteFromLibraryButton: "Excluir da Biblioteca",
  }
};


export const ProfileLibraryView: React.FC<ProfileLibraryViewProps> = ({
  savedProfiles,
  onSaveCurrentToLibrary,
  onLoadProfile,
  onDeleteProfile,
  language,
}) => {
  const [newProfileName, setNewProfileName] = useState('');
  const t = profileLibraryTranslations[language];

  const handleSaveClick = () => {
    if (!newProfileName.trim()) {
      alert('Please enter a name for the profile.'); // This alert could also be translated if desired
      return;
    }
    onSaveCurrentToLibrary(newProfileName.trim());
    setNewProfileName(''); // Reset input field
  };

  return (
    <div className="w-full p-4 bg-white shadow-lg rounded-lg m-2 overflow-y-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">{t.title}</h2>

      <div className="mb-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-lg font-medium text-gray-700 mb-2">{t.saveCurrentSessionTitle}</h3>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
            placeholder={t.profileNamePlaceholder}
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <Button onClick={handleSaveClick} variant="primary" leftIcon={ICONS.add}>
            {t.saveToLibraryButton}
          </Button>
        </div>
      </div>

      <h3 className="text-xl font-medium text-gray-700 mb-4">{t.savedProfilesTitle}</h3>
      {savedProfiles.length === 0 ? (
        <p className="text-gray-500">{t.noProfilesMessage}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {savedProfiles.map((profile) => (
            <div key={profile.profileId} className="border border-gray-200 rounded-lg shadow-md overflow-hidden flex flex-col bg-white">
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                {profile.originalImage ? (
                  <img 
                    src={profile.originalImage} 
                    alt={profile.profileLibraryName || t.untitledProfile} 
                    className="w-full h-full object-contain" 
                  />
                ) : (
                  <div className="text-gray-500 text-sm p-2 text-center">{t.noOriginalImage}</div>
                )}
              </div>
              <div className="p-4 flex-grow flex flex-col">
                <h4 className="text-md font-semibold text-gray-800 mb-2 truncate" title={profile.profileLibraryName || t.untitledProfile}>
                  {profile.profileLibraryName || t.untitledProfile}
                </h4>
                <p className="text-xs text-gray-500 mb-1">{t.idLabel} {profile.profileId?.substring(0,8)}...</p>
                <p className="text-xs text-gray-500 mb-3">{t.modulesLabel} {profile.textModules.length}</p>
                <div className="mt-auto flex flex-col space-y-2">
                  <Button 
                    onClick={() => profile.profileId && onLoadProfile(profile.profileId)} 
                    variant="secondary" 
                    size="sm"
                    disabled={!profile.profileId}
                    leftIcon={ICONS.upload} 
                    className="w-full"
                  >
                    {t.loadToEditorButton}
                  </Button>
                  <Button 
                    onClick={() => profile.profileId && onDeleteProfile(profile.profileId)} 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:bg-red-50 w-full"
                    disabled={!profile.profileId}
                    leftIcon={ICONS.trash}
                  >
                    {t.deleteFromLibraryButton}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
