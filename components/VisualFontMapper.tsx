
import React, { useState, useEffect, useRef } from 'react';
import { BitmapFontSettings } from '../types';
import { Language } from '../App';
import { TextArea } from './ui/InputComponents';

const translations = {
    en: {
        title: "Visual Character Mapper",
        fontSheet: "Font Sheet Preview",
        noFontImage: "No font image loaded for this selection.",
        mappingControls: "Mapping Controls",
        selectedTile: "Selected Tile Index:",
        none: "None",
        mappedCharacter: "Mapped Character:",
        fullSequence: "Full Character Sequence:",
        clickTile: "Click a tile on the font sheet to select it.",
        enterChar: "Enter the character for the selected tile.",
        sequenceHelp: "The character sequence must exactly match the font sheet's layout. You can edit here directly or use the visual mapper. Click a character here to see its tile on the sheet."
    },
    pt: {
        title: "Mapeador Visual de Caracteres",
        fontSheet: "Pré-visualização da Folha da Fonte",
        noFontImage: "Nenhuma imagem de fonte carregada para esta seleção.",
        mappingControls: "Controles de Mapeamento",
        selectedTile: "Índice do Bloco Selecionado:",
        none: "Nenhum",
        mappedCharacter: "Caractere Mapeado:",
        fullSequence: "Sequência Completa de Caracteres:",
        clickTile: "Clique em um bloco na folha da fonte para selecioná-lo.",
        enterChar: "Digite o caractere para o bloco selecionado.",
        sequenceHelp: "A sequência de caracteres deve corresponder exatamente ao layout da folha da fonte. Você pode editar aqui diretamente ou usar o mapeador visual. Clique em um caractere aqui para ver seu bloco na folha."
    }
};

interface VisualFontMapperProps {
  fontImageSrc: string | null;
  settings: BitmapFontSettings;
  sequence: string;
  onSequenceChange: (newSequence: string) => void;
  language: Language;
}

export const VisualFontMapper: React.FC<VisualFontMapperProps> = ({ fontImageSrc, settings, sequence, onSequenceChange, language }) => {
    const t = translations[language];
    const [selectedTileIndex, setSelectedTileIndex] = useState<number | null>(null);
    const [fontImage, setFontImage] = useState<HTMLImageElement | null>(null);
    
    const charInputRef = useRef<HTMLInputElement>(null);
    const sequenceTextAreaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (fontImageSrc) {
            const img = new Image();
            img.onload = () => setFontImage(img);
            img.src = fontImageSrc;
        } else {
            setFontImage(null);
        }
    }, [fontImageSrc]);

    const handleTileClick = (index: number) => {
        setSelectedTileIndex(index);
        if (sequenceTextAreaRef.current) {
            sequenceTextAreaRef.current.focus();
            sequenceTextAreaRef.current.setSelectionRange(index, index + 1);
        }
        if (charInputRef.current) {
            charInputRef.current.focus();
            charInputRef.current.select();
        }
    };
    
    const handleMappedCharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (selectedTileIndex === null) return;
        
        const newChar = e.target.value;
        const charToInsert = newChar.slice(-1); // Take the last character if user pastes multiple
        
        let seqArray = sequence.split('');
        while (seqArray.length <= selectedTileIndex) {
            seqArray.push(' '); // Pad with spaces if sequence is shorter than clicked index
        }
        
        seqArray[selectedTileIndex] = charToInsert;
        onSequenceChange(seqArray.join(''));
    };

    const handleSequenceAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onSequenceChange(e.target.value);
    };

    const handleSequenceAreaSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
        const index = e.currentTarget.selectionStart;
        // Only update if selection is a single cursor point, not a range
        if (index === e.currentTarget.selectionEnd) {
            setSelectedTileIndex(index);
        } else {
            setSelectedTileIndex(null);
        }
    };
    
    const { tileWidth, tileHeight, offsetX, offsetY, separationX, separationY } = settings;
    const charsPerRow = fontImage ? Math.max(1, Math.floor((fontImage.naturalWidth - offsetX + separationX) / (tileWidth + separationX))) : 1;

    return (
        <div className="border-t pt-4 mt-4">
            <h5 className="text-sm font-semibold text-gray-700 mb-3">{t.title}</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                {/* Left side: Visual mapper */}
                <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700">{t.fontSheet}</label>
                    <div className="relative mt-1 bg-gray-200 border border-gray-300 p-1 overflow-auto max-h-64" style={{ minHeight: '100px' }}>
                        {fontImageSrc && fontImage ? (
                            <div className="relative" style={{ width: fontImage.naturalWidth, height: fontImage.naturalHeight }}>
                                <img src={fontImageSrc} alt="font sheet" style={{ imageRendering: 'pixelated' }} className="block" />
                                <div className="absolute top-0 left-0 w-full h-full">
                                    {sequence.split('').map((char, index) => {
                                        const tileCol = index % charsPerRow;
                                        const tileRow = Math.floor(index / charsPerRow);
                                        const top = offsetY + tileRow * (tileHeight + separationY);
                                        const left = offsetX + tileCol * (tileWidth + separationX);
                                        
                                        return (
                                            <div
                                                key={index}
                                                onClick={() => handleTileClick(index)}
                                                className={`absolute border border-dashed hover:border-solid hover:border-yellow-400 ${selectedTileIndex === index ? 'border-red-500 border-solid bg-red-500 bg-opacity-30' : 'border-blue-500 border-opacity-40'}`}
                                                style={{ top: `${top}px`, left: `${left}px`, width: `${tileWidth}px`, height: `${tileHeight}px`, cursor: 'pointer' }}
                                                title={`Index: ${index}, Char: '${char}'`}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-center py-10 text-xs text-gray-500">{t.noFontImage}</div>
                        )}
                    </div>
                </div>

                {/* Right side: Controls */}
                <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700">{t.mappingControls}</label>
                    <div className="mt-1 space-y-3 p-3 bg-gray-50 rounded-md border">
                        <div>
                            <label className="text-xs font-medium text-gray-700">{t.selectedTile}</label>
                            <p className="text-lg font-mono font-semibold text-indigo-600">{selectedTileIndex !== null ? selectedTileIndex : t.none}</p>
                        </div>
                        <div>
                            <label htmlFor="mapped-char-input" className="text-xs font-medium text-gray-700">{t.mappedCharacter}</label>
                            <input
                                id="mapped-char-input"
                                type="text"
                                ref={charInputRef}
                                value={(selectedTileIndex !== null && sequence[selectedTileIndex]) ? sequence[selectedTileIndex] : ''}
                                onChange={handleMappedCharChange}
                                disabled={selectedTileIndex === null}
                                maxLength={1}
                                className="mt-1 block w-20 text-center text-lg px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
                                placeholder={selectedTileIndex === null ? '-' : ' '}
                                aria-label="Mapped Character Input"
                            />
                             <p className="text-xs text-gray-500 mt-1">{selectedTileIndex !== null ? t.enterChar : t.clickTile}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom: Full sequence text area */}
            <div className="mt-4">
                 <TextArea 
                    label={t.fullSequence}
                    id={`charSeq-${settings.selectedFont}`} // Add unique part to id
                    value={sequence}
                    onChange={handleSequenceAreaChange}
                    onSelect={handleSequenceAreaSelect}
                    ref={sequenceTextAreaRef}
                    rows={3}
                    inputClassName="font-mono text-sm"
                    aria-label="Full Character Sequence"
                 />
                 <p className="text-xs text-gray-500 mt-1">{t.sequenceHelp}</p>
            </div>
        </div>
    );
};
