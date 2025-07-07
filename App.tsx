

import React, { useState, useCallback, useEffect } from 'react';
import { flushSync } from 'react-dom';
import JSZip from 'jszip';
import { Profile, TextModule, BitmapFontSettings, TextSettings, HorizontalAlignment, VerticalAlignment } from './types';
import { HeaderControls } from './components/HeaderControls';
import { PreviewArea } from './components/PreviewArea';
import { TextModuleEditor } from './components/TextModuleEditor';
import { ProfileLibraryView } from './components/ProfileLibraryView';
import { DEFAULT_TEXT_SETTINGS, DEFAULT_BITMAP_FONT_SETTINGS, generateId, COMMON_FONT_FAMILIES } from './constants';

const ACTIVE_PROFILE_STORAGE_KEY = 'romGraphicsEditorActiveProfile_v2';
const NEXT_MODULE_NUM_STORAGE_KEY = 'romGraphicsEditorNextModuleNum_v2';
const SAVED_PROFILES_LIST_STORAGE_KEY = 'romGraphicsEditorSavedProfilesList_v2';
const LANGUAGE_STORAGE_KEY = 'romGraphicsEditorLanguage_v2';
const PROFILES_MANIFEST_PATH = 'profiles/profiles-list.json';


export type Language = 'en' | 'pt';

const appAlertTranslations = {
  en: {
    generatingBatchImages: "Generating batch images, please wait...",
    profileImportSuccess: "Profile imported into active session successfully!",
    profileImportFailure: "Failed to import profile. Ensure the JSON file is valid. Error: {error}",
    profileImportReadError: "Error reading profile file.",
    provideProfileName: "Please provide a name for the profile in the library.",
    profileNameEmpty: "Profile name cannot be empty.",
    profileSavedToLibrary: "Profile \"{name}\" saved to library!",
    confirmProfileDelete: "Are you sure you want to delete \"{name}\" from the library? This will remove it from localStorage if stored there, but not from the file system.",
    profileRemovedFromLibrary: "Profile \"{name}\" removed from library view.",
    profileLoadedToEditor: "Profile \"{name}\" loaded into editor.",
    previewCanvasNotFound: "Preview canvas not found.",
    batchProcessingError: "An error occurred during batch processing: {error}",
  },
  pt: {
    generatingBatchImages: "Gerando imagens em lote, por favor aguarde...",
    profileImportSuccess: "Perfil importado para a sessão ativa com sucesso!",
    profileImportFailure: "Falha ao importar perfil. Verifique se o arquivo JSON é válido. Erro: {error}",
    profileImportReadError: "Erro ao ler o arquivo do perfil.",
    provideProfileName: "Por favor, forneça um nome para o perfil na biblioteca.",
    profileNameEmpty: "O nome do perfil não pode estar vazio.",
    profileSavedToLibrary: "Perfil \"{name}\" salvo na biblioteca!",
    confirmProfileDelete: "Tem certeza que deseja excluir \"{name}\" da biblioteca? Isso o removerá do localStorage se estiver armazenado lá, mas não do sistema de arquivos.",
    profileRemovedFromLibrary: "Perfil \"{name}\" removido da visualização da biblioteca.",
    profileLoadedToEditor: "Perfil \"{name}\" carregado no editor.",
    previewCanvasNotFound: "Canvas de pré-visualização não encontrado.",
    batchProcessingError: "Ocorreu um erro durante o processamento em lote: {error}",
  }
};

const App: React.FC = () => {
  const [activeProfile, setActiveProfile] = useState<Profile>({
    originalImage: null,
    editableImage: null,
    bitmapFontImage: null,
    bitmapFontTransparentColor: '#000000',
    bitmapFontEnableTransparency: false,
    bitmapFontSoftTransparency: false,
    bitmapFontSoftTransparencyRadius: 75,
    bitmapFontImage2: null,
    bitmapFontTransparentColor2: '#000000',
    bitmapFontEnableTransparency2: false,
    bitmapFontSoftTransparency2: false,
    bitmapFontSoftTransparencyRadius2: 75,
    textModules: [],
  });
  const [nextModuleNumber, setNextModuleNumber] = useState(1);
  const [currentView, setCurrentView] = useState<'editor' | 'library'>('editor');
  const [savedProfiles, setSavedProfiles] = useState<Profile[]>([]);
  const [language, setLanguage] = useState<Language>(() => {
    const storedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return (storedLang === 'en' || storedLang === 'pt') ? storedLang : 'en';
  });

  const tApp = appAlertTranslations[language];

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  };

  const mapLoadedTextSettings = (loadedSettings: any): TextSettings => {
    return {
      ...DEFAULT_TEXT_SETTINGS,
      ...(loadedSettings || {}),
      lineHeight: typeof loadedSettings?.lineHeight === 'number' ? loadedSettings.lineHeight : DEFAULT_TEXT_SETTINGS.lineHeight,
      positionX: typeof loadedSettings?.positionX === 'number' ? loadedSettings.positionX : DEFAULT_TEXT_SETTINGS.positionX,
      positionY: typeof loadedSettings?.positionY === 'number' ? loadedSettings.positionY : DEFAULT_TEXT_SETTINGS.positionY,
      scaleX: typeof loadedSettings?.scaleX === 'number' ? loadedSettings.scaleX : DEFAULT_TEXT_SETTINGS.scaleX,
      scaleY: typeof loadedSettings?.scaleY === 'number' ? loadedSettings.scaleY : DEFAULT_TEXT_SETTINGS.scaleY,
      zoomFactor: typeof loadedSettings?.zoomFactor === 'number' ? loadedSettings.zoomFactor : DEFAULT_TEXT_SETTINGS.zoomFactor,
      horizontalAlignment: Object.values(HorizontalAlignment).includes(loadedSettings?.horizontalAlignment)
        ? loadedSettings.horizontalAlignment
        : DEFAULT_TEXT_SETTINGS.horizontalAlignment,
      verticalAlignment: Object.values(VerticalAlignment).includes(loadedSettings?.verticalAlignment)
        ? loadedSettings.verticalAlignment
        : DEFAULT_TEXT_SETTINGS.verticalAlignment,
      lineWrapWidth: typeof loadedSettings?.lineWrapWidth === 'number'
        ? loadedSettings.lineWrapWidth
        : DEFAULT_TEXT_SETTINGS.lineWrapWidth,
      enableFontColorization: typeof loadedSettings?.enableFontColorization === 'boolean'
        ? loadedSettings.enableFontColorization
        : DEFAULT_TEXT_SETTINGS.enableFontColorization,
      fontColor: typeof loadedSettings?.fontColor === 'string'
        ? loadedSettings.fontColor
        : DEFAULT_TEXT_SETTINGS.fontColor,
      // Font Effects
      enableShadow: typeof loadedSettings?.enableShadow === 'boolean' ? loadedSettings.enableShadow : DEFAULT_TEXT_SETTINGS.enableShadow,
      shadowColor: typeof loadedSettings?.shadowColor === 'string' ? loadedSettings.shadowColor : DEFAULT_TEXT_SETTINGS.shadowColor,
      shadowOffsetX: typeof loadedSettings?.shadowOffsetX === 'number' ? loadedSettings.shadowOffsetX : DEFAULT_TEXT_SETTINGS.shadowOffsetX,
      shadowOffsetY: typeof loadedSettings?.shadowOffsetY === 'number' ? loadedSettings.shadowOffsetY : DEFAULT_TEXT_SETTINGS.shadowOffsetY,
      shadowBlur: typeof loadedSettings?.shadowBlur === 'number' ? loadedSettings.shadowBlur : DEFAULT_TEXT_SETTINGS.shadowBlur,
      enableOutline: typeof loadedSettings?.enableOutline === 'boolean' ? loadedSettings.enableOutline : DEFAULT_TEXT_SETTINGS.enableOutline,
      outlineColor: typeof loadedSettings?.outlineColor === 'string' ? loadedSettings.outlineColor : DEFAULT_TEXT_SETTINGS.outlineColor,
      outlineWidth: typeof loadedSettings?.outlineWidth === 'number' ? loadedSettings.outlineWidth : DEFAULT_TEXT_SETTINGS.outlineWidth,
      // System font settings
      renderMode: (loadedSettings?.renderMode === 'bitmap' || loadedSettings?.renderMode === 'system')
        ? loadedSettings.renderMode
        : DEFAULT_TEXT_SETTINGS.renderMode,
      fontFamily: typeof loadedSettings?.fontFamily === 'string' ? loadedSettings.fontFamily : DEFAULT_TEXT_SETTINGS.fontFamily,
      fontSize: typeof loadedSettings?.fontSize === 'number' ? loadedSettings.fontSize : DEFAULT_TEXT_SETTINGS.fontSize,
      fontWeight: (loadedSettings?.fontWeight === 'normal' || loadedSettings?.fontWeight === 'bold')
        ? loadedSettings.fontWeight
        : DEFAULT_TEXT_SETTINGS.fontWeight,
      fontStyle: (loadedSettings?.fontStyle === 'normal' || loadedSettings?.fontStyle === 'italic')
        ? loadedSettings.fontStyle
        : DEFAULT_TEXT_SETTINGS.fontStyle,
      systemFontColor: typeof loadedSettings?.systemFontColor === 'string' ? loadedSettings.systemFontColor : DEFAULT_TEXT_SETTINGS.systemFontColor,
      customFontFileName: typeof loadedSettings?.customFontFileName === 'string' ? loadedSettings.customFontFileName : null,
      customFontFamilyName: typeof loadedSettings?.customFontFamilyName === 'string' ? loadedSettings.customFontFamilyName : null,
    };
  };

  const mapLoadedBitmapFontSettings = (loadedSettings: any): BitmapFontSettings => {
    return {
      ...DEFAULT_BITMAP_FONT_SETTINGS,
      ...(loadedSettings || {}),
       characterSequence: typeof loadedSettings?.characterSequence === 'string'
        ? loadedSettings.characterSequence
        : DEFAULT_BITMAP_FONT_SETTINGS.characterSequence,
      tileWidth: typeof loadedSettings?.tileWidth === 'number' ? loadedSettings.tileWidth : DEFAULT_BITMAP_FONT_SETTINGS.tileWidth,
      tileHeight: typeof loadedSettings?.tileHeight === 'number' ? loadedSettings.tileHeight : DEFAULT_BITMAP_FONT_SETTINGS.tileHeight,
      offsetX: typeof loadedSettings?.offsetX === 'number' ? loadedSettings.offsetX : DEFAULT_BITMAP_FONT_SETTINGS.offsetX,
      offsetY: typeof loadedSettings?.offsetY === 'number' ? loadedSettings.offsetY : DEFAULT_BITMAP_FONT_SETTINGS.offsetY,
      separationX: typeof loadedSettings?.separationX === 'number' ? loadedSettings.separationX : DEFAULT_BITMAP_FONT_SETTINGS.separationX,
      separationY: typeof loadedSettings?.separationY === 'number' ? loadedSettings.separationY : DEFAULT_BITMAP_FONT_SETTINGS.separationY,
      baselineX: typeof loadedSettings?.baselineX === 'number' ? loadedSettings.baselineX : DEFAULT_BITMAP_FONT_SETTINGS.baselineX,
      baselineY: typeof loadedSettings?.baselineY === 'number' ? loadedSettings.baselineY : DEFAULT_BITMAP_FONT_SETTINGS.baselineY,
      characterSpacing: typeof loadedSettings?.characterSpacing === 'number' ? loadedSettings.characterSpacing : DEFAULT_BITMAP_FONT_SETTINGS.characterSpacing,
      enablePixelScanning: typeof loadedSettings?.enablePixelScanning === 'boolean'
        ? loadedSettings.enablePixelScanning
        : DEFAULT_BITMAP_FONT_SETTINGS.enablePixelScanning,
      selectedFont: (loadedSettings?.selectedFont === 'font1' || loadedSettings?.selectedFont === 'font2')
        ? loadedSettings.selectedFont
        : DEFAULT_BITMAP_FONT_SETTINGS.selectedFont,
    };
  };

  const validateProfileStructure = (profileData: any, isFromFile: boolean = false, filename?: string): Profile => {
    const baseProfileId = profileData.profileId || generateId();
    return {
        profileId: isFromFile && filename ? `file-${filename}-${baseProfileId}` : baseProfileId,
        profileLibraryName: profileData.profileLibraryName || (isFromFile && filename ? filename.replace(/\.json$/i, '') : `Profile ${baseProfileId.substring(0,5)}`),
        originalImage: profileData.originalImage || null,
        editableImage: profileData.editableImage || null,

        bitmapFontImage: profileData.bitmapFontImage || null,
        bitmapFontTransparentColor: profileData.bitmapFontTransparentColor || '#000000',
        bitmapFontEnableTransparency: typeof profileData.bitmapFontEnableTransparency === 'boolean' ? profileData.bitmapFontEnableTransparency : false,
        bitmapFontSoftTransparency: typeof profileData.bitmapFontSoftTransparency === 'boolean' ? profileData.bitmapFontSoftTransparency : false,
        bitmapFontSoftTransparencyRadius: typeof profileData.bitmapFontSoftTransparencyRadius === 'number' ? profileData.bitmapFontSoftTransparencyRadius : 75,

        bitmapFontImage2: profileData.bitmapFontImage2 || null,
        bitmapFontTransparentColor2: profileData.bitmapFontTransparentColor2 || '#000000',
        bitmapFontEnableTransparency2: typeof profileData.bitmapFontEnableTransparency2 === 'boolean' ? profileData.bitmapFontEnableTransparency2 : false,
        bitmapFontSoftTransparency2: typeof profileData.bitmapFontSoftTransparency2 === 'boolean' ? profileData.bitmapFontSoftTransparency2 : false,
        bitmapFontSoftTransparencyRadius2: typeof profileData.bitmapFontSoftTransparencyRadius2 === 'number' ? profileData.bitmapFontSoftTransparencyRadius2 : 75,

        textModules: (profileData.textModules || []).map((m: any) => ({
          ...m,
          id: m.id || generateId(),
          name: m.name || `Module ${generateId().substring(0,3)}`,
          textSettings: mapLoadedTextSettings(m.textSettings),
          bitmapFontSettings: mapLoadedBitmapFontSettings(m.bitmapFontSettings),
          isConfiguring: typeof m.isConfiguring === 'boolean' ? m.isConfiguring : false,
          isBatchMode: typeof m.isBatchMode === 'boolean' ? m.isBatchMode : false,
          currentBatchLineIndex: m.isBatchMode ? (typeof m.currentBatchLineIndex === 'number' ? m.currentBatchLineIndex : 0) : undefined,
        })),
        isFromFileSystem: isFromFile,
    };
  };


  useEffect(() => {
    try {
      const savedActiveProfileData = localStorage.getItem(ACTIVE_PROFILE_STORAGE_KEY);
      const savedNextModuleNum = localStorage.getItem(NEXT_MODULE_NUM_STORAGE_KEY);

      if (savedActiveProfileData) {
        const loadedProfileData = JSON.parse(savedActiveProfileData);
        setActiveProfile(validateProfileStructure(loadedProfileData));
      }
      if (savedNextModuleNum) {
        setNextModuleNumber(parseInt(savedNextModuleNum, 10) || 1);
      }
    } catch (error) {
      console.error("Error loading active profile from local storage:", error);
      setActiveProfile({
        originalImage: null, editableImage: null,
        bitmapFontImage: null, bitmapFontTransparentColor: '#000000', bitmapFontEnableTransparency: false, bitmapFontSoftTransparency: false, bitmapFontSoftTransparencyRadius: 75,
        bitmapFontImage2: null, bitmapFontTransparentColor2: '#000000', bitmapFontEnableTransparency2: false, bitmapFontSoftTransparency2: false, bitmapFontSoftTransparencyRadius2: 75,
        textModules: [],
      });
      setNextModuleNumber(1);
    }
  }, []);

  useEffect(() => {
    try {
        const profileToSave = {
            ...activeProfile,
            textModules: activeProfile.textModules.map(tm => {
                // Do not save currentBatchLineIndex for active profile to avoid stale preview line index on reload
                const { currentBatchLineIndex, ...restTm } = tm; 
                return restTm;
            })
        };
        delete profileToSave.isFromFileSystem; // Don't persist this flag for active profile in LS
        localStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, JSON.stringify(profileToSave));
        localStorage.setItem(NEXT_MODULE_NUM_STORAGE_KEY, nextModuleNumber.toString());
    } catch (error) {
        console.error("Error saving active session to local storage:", error);
    }
  }, [activeProfile, nextModuleNumber]);

  useEffect(() => {
    const loadProfiles = async () => {
      let profilesFromStorage: Profile[] = [];
      try {
        const savedProfilesData = localStorage.getItem(SAVED_PROFILES_LIST_STORAGE_KEY);
        if (savedProfilesData) {
          const loadedProfiles: any[] = JSON.parse(savedProfilesData);
          profilesFromStorage = loadedProfiles.map(p => validateProfileStructure(p));
        }
      } catch (error) {
        console.error("Error loading saved profiles list from local storage:", error);
      }

      let profilesFromFileSystem: Profile[] = [];
      try {
        console.log(`Attempting to fetch manifest from: ${PROFILES_MANIFEST_PATH}`);
        const manifestResponse = await fetch(PROFILES_MANIFEST_PATH);

        if (!manifestResponse.ok) {
          if (manifestResponse.status === 404) {
            console.log(`Profiles manifest not found at ${PROFILES_MANIFEST_PATH}. This is okay if you don't intend to use file-based profiles.`);
          } else {
            console.error(`Error fetching profiles manifest from ${PROFILES_MANIFEST_PATH}: ${manifestResponse.status} ${manifestResponse.statusText}`);
          }
          // profilesFromFileSystem will remain empty. Processing continues to merge with localStorage.
        } else {
          console.log(`Successfully fetched manifest: ${PROFILES_MANIFEST_PATH}`);
          const profileFilenames: any = await manifestResponse.json(); // Read as any for type checking
          console.log('Raw content from manifest:', profileFilenames);

          if (Array.isArray(profileFilenames)) {
            for (const filename of profileFilenames) {
              if (typeof filename === 'string' && filename.endsWith('.json')) {
                const profileFilePath = `profiles/${filename}`;
                console.log(`Attempting to fetch profile: ${profileFilePath}`);
                try {
                  const profileResponse = await fetch(profileFilePath);
                  if (profileResponse.ok) {
                    const profileData = await profileResponse.json();
                    console.log(`Successfully fetched and parsed ${profileFilePath}. Data (first 100 chars):`, JSON.stringify(profileData).substring(0,100) + "...");
                    profilesFromFileSystem.push(validateProfileStructure(profileData, true, filename));
                  } else {
                    console.warn(`Failed to fetch profile ${profileFilePath}: ${profileResponse.status} ${profileResponse.statusText}`);
                  }
                } catch (e) {
                  console.error(`Error parsing JSON or processing profile file ${profileFilePath}:`, e);
                }
              } else {
                console.warn(`Invalid filename in manifest: '${JSON.stringify(filename)}'. Expected a string ending in .json. Skipping.`);
              }
            }
          } else {
            console.warn(`Profiles manifest content at ${PROFILES_MANIFEST_PATH} is not a valid JSON array. Found:`, profileFilenames);
          }
        }
      } catch (error) {
        // This catch handles errors in fetching manifestResponse itself (e.g., network error)
        // or manifestResponse.json() if the manifest content is not valid JSON.
        console.error(`Critical error fetching or processing manifest ${PROFILES_MANIFEST_PATH}:`, error);
        // profilesFromFileSystem will remain empty. Processing continues to merge with localStorage.
      }
      
      // Merge and deduplicate: localStorage profiles take precedence if IDs clash,
      // but file system profiles get a unique prefix, so direct ID clash is unlikely unless manually crafted.
      // The map ensures that profiles from file system are added, then localStorage profiles are added if their ID is not already present.
      console.log('Profiles loaded from file system:', profilesFromFileSystem.map(p => ({name: p.profileLibraryName, id: p.profileId})));
      console.log('Profiles loaded from local storage:', profilesFromStorage.map(p => ({name: p.profileLibraryName, id: p.profileId})));

      const combinedProfilesMap = new Map<string, Profile>();

      // Add file system profiles first
      profilesFromFileSystem.forEach(p => {
        if(p.profileId) combinedProfilesMap.set(p.profileId, p);
      });
      
      // Add localStorage profiles, only if their ID isn't already in the map from a file system profile
      profilesFromStorage.forEach(lsp => {
        if (lsp.profileId && !combinedProfilesMap.has(lsp.profileId)) {
          combinedProfilesMap.set(lsp.profileId, lsp);
        }
      });

      const finalCombinedProfiles = Array.from(combinedProfilesMap.values());
      console.log('Final combined profiles for library view:', finalCombinedProfiles.map(p => ({name: p.profileLibraryName, id: p.profileId, fromFS: p.isFromFileSystem })));
      setSavedProfiles(finalCombinedProfiles);
    };

    loadProfiles();
  }, []); // Empty dependency array ensures this runs once on mount


  const handleUpdateActiveProfileImage = useCallback((
    imageType: 'originalImage' | 'editableImage' | 'bitmapFontImage' | 'bitmapFontImage2',
    dataUrl: string | null
  ) => {
    setActiveProfile(p => ({ ...p, [imageType]: dataUrl }));
  }, []);

  const handleUpdateTextModules = useCallback((modules: TextModule[]) => {
    setActiveProfile(p => ({ ...p, textModules: modules }));
  }, []);

  const handleUpdateProfileFontSettings = useCallback((
    fontNumber: 1 | 2,
    settings: Partial<Pick<Profile,
      'bitmapFontEnableTransparency' | 'bitmapFontTransparentColor' | 'bitmapFontSoftTransparency' | 'bitmapFontSoftTransparencyRadius' |
      'bitmapFontEnableTransparency2' | 'bitmapFontTransparentColor2' | 'bitmapFontSoftTransparency2' | 'bitmapFontSoftTransparencyRadius2'
    >>
  ) => {
    setActiveProfile(p => {
      if (fontNumber === 1) {
        return {
          ...p,
          bitmapFontEnableTransparency: settings.bitmapFontEnableTransparency ?? p.bitmapFontEnableTransparency,
          bitmapFontTransparentColor: settings.bitmapFontTransparentColor ?? p.bitmapFontTransparentColor,
          bitmapFontSoftTransparency: settings.bitmapFontSoftTransparency ?? p.bitmapFontSoftTransparency,
          bitmapFontSoftTransparencyRadius: settings.bitmapFontSoftTransparencyRadius ?? p.bitmapFontSoftTransparencyRadius,
         };
      } else { // Font 2
        return {
          ...p,
          bitmapFontEnableTransparency2: settings.bitmapFontEnableTransparency2 ?? p.bitmapFontEnableTransparency2,
          bitmapFontTransparentColor2: settings.bitmapFontTransparentColor2 ?? p.bitmapFontTransparentColor2,
          bitmapFontSoftTransparency2: settings.bitmapFontSoftTransparency2 ?? p.bitmapFontSoftTransparency2,
          bitmapFontSoftTransparencyRadius2: settings.bitmapFontSoftTransparencyRadius2 ?? p.bitmapFontSoftTransparencyRadius2,
        };
      }
    });
  }, []);

  const handleUpdateModulePosition = useCallback((moduleId: string, newPosition: { x: number, y: number }) => {
    setActiveProfile(prevProfile => {
      const updatedTextModules = prevProfile.textModules.map(module => {
        if (module.id === moduleId) {
          return {
            ...module,
            textSettings: {
              ...module.textSettings,
              positionX: newPosition.x,
              positionY: newPosition.y,
            },
          };
        }
        return module;
      });
      return { ...prevProfile, textModules: updatedTextModules };
    });
  }, []);

  const handleClearAllFiles = () => {
    setActiveProfile(p => {
        const newTextModules = p.textModules.map(module => {
            if (module.textSettings.customFontFamilyName) {
                return {
                    ...module,
                    textSettings: {
                        ...module.textSettings,
                        customFontFileName: null,
                        customFontFamilyName: null,
                        fontFamily: COMMON_FONT_FAMILIES[0].value
                    }
                };
            }
            return module;
        });

        return {
            ...p,
            originalImage: null,
            editableImage: null,
            bitmapFontImage: null,
            bitmapFontImage2: null,
            textModules: newTextModules
        };
    });
  };
  
  const handleSavePreview = async () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      alert(tApp.previewCanvasNotFound);
      return;
    }

    const originalTextModules = activeProfile.textModules;
    const batchModules = originalTextModules.filter(m => m.isBatchMode);

    if (batchModules.length === 0) {
      // SINGLE IMAGE SAVE LOGIC (no batch modules):
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'rom_graphic_preview.png';
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // BATCH PROCESSING (ZIP) LOGIC:
    const batchModulesWithText = batchModules.filter(m => m.text && m.text.trim());
    const batchLineSets = batchModulesWithText.map(m => m.text.split('\n'));
    const maxLines = Math.max(0, ...batchLineSets.map(lines => lines.length));
    
    if (maxLines <= 1) {
       // All batch modules have 0 or 1 line, treat as single save.
       const modulesForSingleFrame = originalTextModules.map(tm => {
        if (tm.isBatchMode) {
          const firstLine = tm.text.split('\n')[0] ?? '';
          return { ...tm, text: firstLine };
        }
        return tm;
      });

       // Temporarily set the state for rendering, save, then restore.
      await new Promise<void>(resolve => {
        flushSync(() => {
          setActiveProfile(prev => ({ ...prev, textModules: modulesForSingleFrame }));
        });
        requestAnimationFrame(() => resolve());
      });
      
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'rom_graphic_preview.png';
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Restore original modules state
      await new Promise<void>(resolve => {
        flushSync(() => {
          setActiveProfile(prev => ({ ...prev, textModules: originalTextModules }));
        });
        requestAnimationFrame(() => resolve());
      });
       return;
    }

    const zip = new JSZip();
    const loadingAlert = document.createElement('div');
    loadingAlert.textContent = tApp.generatingBatchImages;
    loadingAlert.style.position = 'fixed'; loadingAlert.style.top = '50%'; loadingAlert.style.left = '50%';
    loadingAlert.style.transform = 'translate(-50%, -50%)'; loadingAlert.style.padding = '20px';
    loadingAlert.style.background = 'white';
    loadingAlert.style.border = '1px solid black';
    loadingAlert.style.zIndex = '1000';
    loadingAlert.style.color = 'black';
    document.body.appendChild(loadingAlert);

    try {
      for (let i = 0; i < maxLines; i++) {
        const modulesForThisFrame = originalTextModules.map(module => {
          if (module.isBatchMode) {
            const lines = module.text.split('\n');
            const lineText = lines[i] !== undefined ? lines[i] : (lines.length > 0 ? lines[lines.length-1] : '');
            return { ...module, text: lineText };
          }
          return module;
        });

        await new Promise<void>(resolve => {
          flushSync(() => {
            setActiveProfile(prev => ({ ...prev, textModules: modulesForThisFrame }));
          });
          requestAnimationFrame(() => resolve());
        });

        const dataUrl = canvas.toDataURL('image/png');
        const filename = `frame_${String(i + 1).padStart(3, '0')}.png`;
        zip.file(filename, dataUrl.split(',')[1], { base64: true });
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const link = document.createElement('a');
      link.download = 'rom_graphic_batch_preview.zip';
      link.href = URL.createObjectURL(zipBlob);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

    } catch (error) {
        console.error("Error during batch image generation:", error);
        alert(tApp.batchProcessingError.replace('{error}', error instanceof Error ? error.message : String(error)));
    } finally {
        document.body.removeChild(loadingAlert);
        // Restore original modules state after the loop
        await new Promise<void>(resolve => {
            flushSync(() => {
              setActiveProfile(prev => ({ ...prev, textModules: originalTextModules }));
            });
            requestAnimationFrame(() => resolve());
        });
    }
  };


  const handleExportProfile = () => {
    const profileToExport = {
        ...activeProfile,
        textModules: activeProfile.textModules.map(tm => {
            // Do not export currentBatchLineIndex as it's a transient preview state
            const { currentBatchLineIndex, ...restTm } = tm;
            return restTm;
        })
    };
    delete profileToExport.isFromFileSystem; // This flag is for library internal logic, not export
    const jsonString = JSON.stringify(profileToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'rom_graphics_active_profile.json';
    link.href = url;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportProfile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonString = event.target?.result as string;
        const importedProfileData = JSON.parse(jsonString);
        if (!importedProfileData || typeof importedProfileData !== 'object') throw new Error("Invalid profile structure: not an object.");
        
        const validatedProfile = validateProfileStructure(importedProfileData); // Not from file system by direct import
        setActiveProfile(validatedProfile);

        if (validatedProfile.textModules.length > 0) {
            const maxNum = validatedProfile.textModules.reduce((max, mod) => {
                const numFromName = parseInt(mod.name.replace(/[^0-9]/g, ''), 10);
                return isNaN(numFromName) ? max : Math.max(max, numFromName);
            }, 0);
            setNextModuleNumber(maxNum + 1);
        } else { setNextModuleNumber(1); }
        alert(tApp.profileImportSuccess);
      } catch (error) {
        console.error('Error importing profile:', error);
        alert(tApp.profileImportFailure.replace('{error}', error instanceof Error ? error.message : String(error)));
      }
    };
    reader.onerror = () => alert(tApp.profileImportReadError);
    reader.readAsText(file);
  }, [tApp]);

  useEffect(() => {
    if ('launchQueue' in window && 'files' in (window as any).launchQueue) {
      (window as any).launchQueue.setConsumer(async (launchParams: any) => {
        if (launchParams.files && launchParams.files.length > 0) {
          for (const fileHandle of launchParams.files) {
            const file = await fileHandle.getFile();
            handleImportProfile(file);
          }
        }
      });
    }
  }, [handleImportProfile]);

  const toggleView = () => setCurrentView(prev => prev === 'editor' ? 'library' : 'editor');

  const handleSaveCurrentProfileToLibrary = (name: string) => {
    if (!name.trim()) {
      alert(tApp.provideProfileName);
      return;
    }
    const profileForLibrary: Profile = {
        ...JSON.parse(JSON.stringify(activeProfile)), // Deep clone
        textModules: activeProfile.textModules.map(tm => {
            // Don't save currentBatchLineIndex to library, it's transient
            const { currentBatchLineIndex, ...restTm } = tm;
            return restTm;
        }),
        profileId: activeProfile.profileId && activeProfile.isFromFileSystem ? activeProfile.profileId : generateId(), // Retain ID if originally from file and being re-saved, else new
        profileLibraryName: name.trim(),
        isFromFileSystem: activeProfile.isFromFileSystem // Retain flag if it was from file
    };
    
    if(!activeProfile.isFromFileSystem) delete profileForLibrary.isFromFileSystem;


    setSavedProfiles(prevProfiles => {
        const existingIndex = prevProfiles.findIndex(p => p.profileId === profileForLibrary.profileId);
        let updatedProfiles;
        if (existingIndex > -1) { 
            updatedProfiles = [...prevProfiles];
            // If it's a file system profile being "saved", it means it's now a localStorage copy
            // unless the intent is to overwrite (which we don't do for FS files).
            // Let's assume saving always makes it a non-FS entry in LS if it was an FS one.
            // Or, if ID matches an FS one, we might be updating a localStorage copy *derived* from an FS one.
            // The current `validateProfileStructure` gives FS profiles `file-${filename}-${baseId}`.
            // If `activeProfile.isFromFileSystem` is true, and we save it, it should ideally become a new entry or update an existing LS entry.
            // The profileId generation: `activeProfile.profileId && activeProfile.isFromFileSystem ? activeProfile.profileId : generateId()`
            // This means if it's from FS, it keeps its `file-...` ID. If we then save THIS to localStorage, LS will have a `file-...` ID.
            // This is probably okay. The `isFromFileSystem` flag helps distinguish.
            // When saving, if the `profileForLibrary.profileId` matches an existing `profileId` AND `profileForLibrary.isFromFileSystem` is true,
            // it means we are 're-saving' a file-system based profile (perhaps with a new name).
            // It should be treated as a localStorage copy from this point.
            const newEntryForLibrary = {...profileForLibrary, isFromFileSystem: false }; // Explicitly make it a localStorage copy
            delete newEntryForLibrary.profileId; // Give it a new ID if it's a copy from FS
            newEntryForLibrary.profileId = generateId();

            // If it's *not* from FS, or if it *is* from FS but we're saving a copy:
            const trulyExistingIndex = prevProfiles.findIndex(p => p.profileId === newEntryForLibrary.profileId && !p.isFromFileSystem);
            if(trulyExistingIndex > -1 && !profileForLibrary.isFromFileSystem) { // Updating an existing LS profile
                 updatedProfiles[trulyExistingIndex] = profileForLibrary; // Use original if not from FS
            } else if (profileForLibrary.isFromFileSystem) { // Saving a *copy* of an FS profile
                 updatedProfiles.push(newEntryForLibrary);
            }
            else { // Adding a new non-FS profile or updating one if ID matched
                 const idx = prevProfiles.findIndex(p => p.profileId === profileForLibrary.profileId);
                 if (idx > -1) updatedProfiles[idx] = profileForLibrary;
                 else updatedProfiles.push(profileForLibrary);
            }


        } else { // Adding a brand new profile (was not from FS, or is a fresh save)
            const newProfile = {...profileForLibrary, isFromFileSystem: false};
            if(profileForLibrary.isFromFileSystem) { // if it was a file system profile, new ID
                newProfile.profileId = generateId();
            }
            updatedProfiles = [...prevProfiles, newProfile];
        }
        
        const profilesToStoreInLocalStorage = updatedProfiles.filter(p => !p.isFromFileSystem);
        try {
            localStorage.setItem(SAVED_PROFILES_LIST_STORAGE_KEY, JSON.stringify(profilesToStoreInLocalStorage));
        } catch (error) {
            console.error("Error saving profiles list to local storage after add/update:", error);
        }
        return updatedProfiles.filter(p => p.profileId); // Ensure all profiles have an ID
    });
    alert(tApp.profileSavedToLibrary.replace('{name}', name.trim()));
  };

  const handleSaveActiveProfileToLibraryWithPrompt = () => {
    // Use a default name that prefers existing library name, then current active profile name (if it was loaded from FS), or empty.
    const defaultName = activeProfile.profileLibraryName || '';
    const profileName = window.prompt(tApp.provideProfileName, defaultName);
    if (profileName && profileName.trim()) {
        handleSaveCurrentProfileToLibrary(profileName.trim());
    } else if (profileName !== null) { // User entered something but it was empty after trim
        alert(tApp.profileNameEmpty);
    }
    // If profileName is null, user cancelled prompt, do nothing.
  };

  const handleLoadProfileFromLibrary = (profileId: string) => {
    const profileToLoad = savedProfiles.find(p => p.profileId === profileId);
    if (profileToLoad) {
      // When loading, ensure the currentBatchLineIndex is initialized if modules are in batch mode.
      const validatedProfileToLoad = validateProfileStructure(
          JSON.parse(JSON.stringify(profileToLoad)), // Deep clone
          profileToLoad.isFromFileSystem, 
          profileToLoad.isFromFileSystem ? profileToLoad.profileLibraryName : undefined
      );
      setActiveProfile(validatedProfileToLoad);

      if (validatedProfileToLoad.textModules.length > 0) {
        const maxNum = validatedProfileToLoad.textModules.reduce((max, mod) => {
            const numFromName = parseInt(mod.name.replace(/[^0-9]/g, ''), 10);
            return isNaN(numFromName) ? max : Math.max(max, numFromName);
        }, 0);
        setNextModuleNumber(maxNum + 1);
      } else { setNextModuleNumber(1); }
      setCurrentView('editor');
      alert(tApp.profileLoadedToEditor.replace('{name}', validatedProfileToLoad.profileLibraryName || 'Untitled'));
    }
  };

  const handleDeleteProfileFromLibrary = (profileId: string) => {
    const profileToDelete = savedProfiles.find(p => p.profileId === profileId);
    if (profileToDelete && window.confirm(tApp.confirmProfileDelete.replace('{name}', profileToDelete.profileLibraryName || 'Untitled'))) {
        setSavedProfiles(prevProfiles => {
            const updatedProfiles = prevProfiles.filter(p => p.profileId !== profileId);
            const profilesToStoreInLocalStorage = updatedProfiles.filter(p => !p.isFromFileSystem);
            try {
                localStorage.setItem(SAVED_PROFILES_LIST_STORAGE_KEY, JSON.stringify(profilesToStoreInLocalStorage));
            } catch (error) {
                console.error("Error saving profiles list to local storage after delete:", error);
            }
            return updatedProfiles;
        });
        alert(tApp.profileRemovedFromLibrary.replace('{name}', profileToDelete.profileLibraryName || 'Untitled'));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <HeaderControls
        onSavePreview={handleSavePreview}
        onSaveActiveProfileToLibraryPrompt={handleSaveActiveProfileToLibraryWithPrompt}
        onExportProfile={handleExportProfile}
        onImportProfile={handleImportProfile}
        onToggleLibraryView={toggleView}
        currentView={currentView}
        language={language}
        onLanguageChange={handleLanguageChange}
      />
      <main className="flex-grow flex flex-col md:flex-row p-2">
        {currentView === 'editor' ? (
          <>
            <PreviewArea
              profile={activeProfile}
              onUpdateProfileImage={handleUpdateActiveProfileImage}
              onUpdateProfileFontSettings={handleUpdateProfileFontSettings}
              onUpdateModulePosition={handleUpdateModulePosition}
              onClearAllFiles={handleClearAllFiles}
              canvasWidth={512}
              canvasHeight={384}
              language={language}
            />
            <TextModuleEditor
              textModules={activeProfile.textModules}
              onUpdateTextModules={handleUpdateTextModules}
              nextModuleNumber={nextModuleNumber}
              onSetNextModuleNumber={setNextModuleNumber}
              language={language}
              bitmapFontImage1={activeProfile.bitmapFontImage}
              bitmapFontImage2={activeProfile.bitmapFontImage2}
            />
          </>
        ) : (
          <ProfileLibraryView
            savedProfiles={savedProfiles}
            onSaveCurrentToLibrary={handleSaveCurrentProfileToLibrary}
            onLoadProfile={handleLoadProfileFromLibrary}
            onDeleteProfile={handleDeleteProfileFromLibrary}
            language={language}
          />
        )}
      </main>
    </div>
  );
};

export default App;