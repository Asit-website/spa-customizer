import React, { useState, useEffect } from 'react'
import FontSelector from './FontSelector';
import CustomColorSwatch from './CustomColorSwatch';

const EditTextTab = ({ 
    setTextFlipX,
    setTextFlipY,
    setTextColor,
    editor, 
    setShowEditModal, 
    customText, 
    setCustomText, 
    textSize, 
    setTextSize, 
    setTextSpacing, 
    textSpacing, 
    setTextFontFamily,
    setFontStyle,
    bringForward,
    layerManager // NEW: Accept layerManager from parent
}) => {

    const [showColorTab, setShowColorTab] = useState(false);
    const [showTextSelectTab, setShowTextSelectTab] = useState(false);
    const [currentFont, setCurrentFont] = useState('Arial'); 
    const [currentColor, setCurrentColor] = useState('#000000');
    const [activeTextObject, setActiveTextObject] = useState(null);
    const [textObjectsCount, setTextObjectsCount] = useState(0);

    // Get all i-text objects from canvas (excluding emojis)
    const getAllTextObjects = () => {
        if (!editor?.canvas) return [];
        return editor.canvas.getObjects().filter(obj => 
            obj.type === 'i-text' && !obj.isEmoji
        );
    };

    // Get the most recently added or selected text object
    const getActiveTextObject = () => {
        if (!editor?.canvas) return null;
        
        const textObjects = getAllTextObjects();
        
        if (textObjects.length === 0) {
            return null;
        }
        
        // Return the last added text object (highest index)
        return textObjects[textObjects.length - 1];
    };

    // Create a new text object with proper layer management
    const createNewTextObject = () => {
        if (!editor?.canvas) return null;
        
        import("fabric").then((fabric) => {
            const canvas = editor.canvas;
            const productImage = canvas.getObjects().find((obj) => obj.isTshirtBase);
            
            if (!productImage) {
                console.error('❌ No base product found for text placement');
                return null;
            }

            const productBounds = productImage.getBoundingRect();
            
            const newTextObj = new fabric.IText('Add your text here', {
                left: productBounds.left + productBounds.width * 0.25,
                top: productBounds.top + productBounds.height / 3.5,
                originX: "center",
                originY: "center",
                fontSize: textSize || 28,
                fill: currentColor || '#000000',
                fontFamily: currentFont || 'Arial',
                fontStyle: 'normal',
                selectable: false, // Consistent with parent component
                evented: false,    // Consistent with parent component
                hasControls: false,
                hasBorders: false,
                moveCursor: "default",
                lockMovementX: true,  // Consistent with parent component
                lockMovementY: true,
                lockScalingX: true,
                lockScalingY: true,
                lockRotation: true,
                editable: false // Consistent with parent component
            });

            canvas.add(newTextObj);
            
            // Apply proper layer management using the parent's layer system
            if (layerManager) {
                layerManager.setObjectLayer(newTextObj);
                layerManager.arrangeCanvasLayers();
            }
            
            setActiveTextObject(newTextObj);
            console.log('✅ New text object created with proper layering (zIndex: 5)');
            
            return newTextObj;
        });
    };

    // Auto-detect and sync with text objects
    useEffect(() => {
        if (!editor?.canvas) return;

        const syncWithTextObjects = () => {
            const textObjects = getAllTextObjects();
            const currentCount = textObjects.length;
            
            // Update count to trigger re-renders when text objects change
            setTextObjectsCount(currentCount);
            
            let targetTextObj = getActiveTextObject();
            
            // If we have text objects, work with the most recent one
            if (targetTextObj && targetTextObj !== activeTextObject) {
                setActiveTextObject(targetTextObj);
                
                // Sync all properties from the detected text object
                if (targetTextObj.text !== customText) {
                    setCustomText(targetTextObj.text || 'Add your text here');
                }
                setCurrentFont(targetTextObj.fontFamily || 'Arial');
                setCurrentColor(targetTextObj.fill || '#000000');
                setTextSize(targetTextObj.fontSize || 28);
                setTextSpacing(Math.round((targetTextObj.charSpacing || 0) / 10));
                setTextFontFamily(targetTextObj.fontFamily || 'Arial');
                setFontStyle(targetTextObj.fontWeight || 'normal');
                setTextFlipX(targetTextObj.flipX || false);
                setTextFlipY(targetTextObj.flipY || false);
                setTextColor(targetTextObj.fill || '#000000');
                
                console.log('🔄 Synced with existing text object:', targetTextObj.text);
            }
        };

        // Initial sync
        syncWithTextObjects();

        // Listen for canvas events to detect changes
        const handleCanvasEvents = () => {
            setTimeout(syncWithTextObjects, 50); // Small delay to ensure objects are properly added
        };

        // Monitor canvas changes
        editor.canvas.on('object:added', handleCanvasEvents);
        editor.canvas.on('object:removed', handleCanvasEvents);
        editor.canvas.on('object:modified', handleCanvasEvents);
        editor.canvas.on('path:created', handleCanvasEvents);

        // Cleanup
        return () => {
            if (editor?.canvas) {
                editor.canvas.off('object:added', handleCanvasEvents);
                editor.canvas.off('object:removed', handleCanvasEvents);
                editor.canvas.off('object:modified', handleCanvasEvents);
                editor.canvas.off('path:created', handleCanvasEvents);
            }
        };
    }, [editor?.canvas, activeTextObject, layerManager]);

    // Apply changes to the active text object
    const applyToTextObject = (updateFn) => {
        let textObj = activeTextObject || getActiveTextObject();
        
        if (!textObj) {
            // If no text object exists, create one
            textObj = createNewTextObject();
            if (!textObj) return;
        }
        
        if (textObj) {
            updateFn(textObj);
            editor.canvas.renderAll();
            
            // Ensure proper layering after any change
            if (layerManager) {
                setTimeout(() => {
                    layerManager.arrangeCanvasLayers();
                }, 10);
            }
        }
    };

    const handleTextChange = (e) => {
        const newText = e.target.value;
        setCustomText(newText);
        
        applyToTextObject((textObj) => {
            textObj.set('text', newText);
        });
    };

    const handleFontSelection = (font) => {
        setTextFontFamily(font);
        setCurrentFont(font);
        
        applyToTextObject((textObj) => {
            textObj.set('fontFamily', font);
        });
        
        setShowTextSelectTab(false); 
    };

    const handleColorSelection = (color) => {
        setTextColor(color);
        setCurrentColor(color);
        
        applyToTextObject((textObj) => {
            textObj.set('fill', color);
        });
        
        setShowColorTab(false); 
    };

    const handleFontStyleChange = (styleType) => {
        applyToTextObject((textObj) => {
            if (styleType === 'bold') {
                const currentWeight = textObj.fontWeight;
                const newWeight = currentWeight === 'bold' ? 'normal' : 'bold';
                textObj.set('fontWeight', newWeight);
                setFontStyle(newWeight);
            } else if (styleType === 'italic') {
                const currentStyle = textObj.fontStyle;
                const newStyle = currentStyle === 'italic' ? 'normal' : 'italic';
                textObj.set('fontStyle', newStyle);
                setFontStyle(newStyle);
            }
        });
    };

    const handleFlipX = () => {
        applyToTextObject((textObj) => {
            const currentFlipX = textObj.flipX;
            const newFlipX = !currentFlipX;
            textObj.set('flipX', newFlipX);
            setTextFlipX(newFlipX);
        });
    };

    const handleFlipY = () => {
        applyToTextObject((textObj) => {
            const currentFlipY = textObj.flipY;
            const newFlipY = !currentFlipY;
            textObj.set('flipY', newFlipY);
            setTextFlipY(newFlipY);
        });
    };

    const handleSizeChange = (e) => {
        const newSize = parseInt(e.target.value);
        setTextSize(newSize);
        
        applyToTextObject((textObj) => {
            textObj.set("fontSize", newSize);
        });
    };

    const handleSpacingChange = (e) => {
        const newSpacing = parseInt(e.target.value);
        setTextSpacing(newSpacing);
        
        applyToTextObject((textObj) => {
            textObj.set("charSpacing", newSpacing * 10);
        });
    };

    // Enhanced arrange functions that work with the layer system
    const handleBringForward = () => {
        const textObj = activeTextObject || getActiveTextObject();
        if (textObj && editor?.canvas) {
            // Use the parent's bringForward if available, otherwise use canvas method
            if (bringForward) {
                bringForward();
            } else {
                editor.canvas.bringForward(textObj);
                editor.canvas.renderAll();
            }
            
            // Re-apply layer management after arrange
            if (layerManager) {
                setTimeout(() => {
                    layerManager.arrangeCanvasLayers();
                }, 50);
            }
        }
    };

    const handleArrangeAction = (action) => {
        const textObj = activeTextObject || getActiveTextObject();
        if (!textObj || !editor?.canvas) return;

        const canvas = editor.canvas;
        
        switch (action) {
            case 'bringToFront':
                canvas.bringToFront(textObj);
                break;
            case 'bringForward':
                canvas.bringForward(textObj);
                break;
            case 'sendBackward':
                canvas.sendBackwards(textObj);
                break;
            case 'sendToBack':
                canvas.sendToBack(textObj);
                break;
        }

        textObj.setCoords();
        canvas.renderAll();
        
        // Re-apply layer management to maintain proper order
        if (layerManager) {
            setTimeout(() => {
                layerManager.arrangeCanvasLayers();
            }, 50);
        }
    };

    const shouldShowEditText = !showTextSelectTab && !showColorTab;

    return (
        <>
            {shouldShowEditText && (
                <div className="bg-white rounded-lg border border-[#D3DBDF] w-80 h-fit max-h-[460px] overflow-y-scroll">

                    <div className='flex items-center justify-between py-2 px-3'>
                        <div className='flex items-center gap-2'>
                            <h3 className='text-[16px] text-black font-semibold'>Edit text</h3>
                            {activeTextObject && (
                                <span className='text-xs text-green-600 font-medium'>
                                    ● Auto-detected ({textObjectsCount} text{textObjectsCount !== 1 ? 's' : ''})
                                </span>
                            )}
                            {!activeTextObject && textObjectsCount === 0 && (
                                <span className='text-xs text-blue-600 font-medium'>
                                    ● Ready to create
                                </span>
                            )}
                        </div>
                        <div className="cursor-pointer" onClick={() => setShowEditModal(false)}>
                            <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749341803/Vector_hm0yzo.png" alt="Close" />
                        </div>
                    </div>
                    <hr className="border-t border-[#D3DBDF] h-px" />
                    
                    <div className='py-3 px-4'>
                        <input 
                            type="text" 
                            value={customText}
                            onChange={handleTextChange} 
                            placeholder="Add Headline" 
                            className="border border-[#D3DBDF] text-black rounded-lg p-3 min-h-20 w-full placeholder:font-semibold" 
                        />
                        {!activeTextObject && (
                            <p className="text-xs text-gray-500 mt-2">
                                💡 Type text above to automatically create a text object
                            </p>
                        )}
                    </div>

                    <hr className="border-t border-[#D3DBDF] h-px" />

                    <div className='flex items-center justify-between py-3 px-3'>
                        <div className='flex items-center gap-2'>
                            <h3 className='text-[14px] text-black font-semibold'>Flip</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <img 
                                onClick={handleFlipX}
                                className='w-[22px] cursor-pointer' 
                                src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507255/tune-vertical_ezas8p.png" 
                                alt="flip horizontal" 
                            />
                            <img 
                                onClick={handleFlipY}
                                className='w-[22px] cursor-pointer' 
                                src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507254/flip-vertical_ajs5ur.png" 
                                alt="flip vertical" 
                            />
                        </div>
                    </div>

                    <hr className="border-t border-[rgb(211,219,223)] h-px" />

                    <div className=' py-3 px-3'>
                        <div className='flex items-center gap-2'>
                            <h3 className='text-[14px] text-black font-semibold'>Font</h3>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                            <div 
                                onClick={() => setShowTextSelectTab(true)} 
                                className='border border-[#D3DBDF] min-w-[165px] cursor-pointer flex items-center justify-between rounded-md p-2'
                            >
                                <span className='text-[14px] text-gray-500 font-medium'>
                                    {currentFont}
                                </span>
                                <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1750138078/chevron-right_p6kmcp.svg" alt="arrow" />
                            </div>

                            <img 
                                className='cursor-pointer' 
                                onClick={() => handleFontStyleChange('bold')} 
                                src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1750137959/alpha-b_aygypw.svg" 
                                alt="bold" 
                            />
                            <img 
                                className='cursor-pointer' 
                                onClick={() => handleFontStyleChange('italic')} 
                                src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1750137959/format-italic_d9ndma.svg" 
                                alt="italic" 
                            />

                            <div
                                className={`w-6 h-6 rounded-full cursor-pointer border-2 transition-all duration-150`}
                                style={{ backgroundColor: currentColor }}
                                onClick={() => setShowColorTab(true)}
                            />
                        </div>
                    </div>

                    <hr className="border-t border-[#D3DBDF] h-px" />

                    <div className='flex flex-col gap-3 justify-between py-4 px-3'>
                        <label className="text-[14px] text-black font-medium">Size</label>
                        <input
                            type="range"
                            min={23}
                            max={40}
                            value={textSize}
                            onChange={handleSizeChange}
                            className="w-full"
                        />

                        <label className="text-[14px] text-black font-medium">Spacing</label>
                        <input
                            type="range"
                            min={-10}
                            max={100}
                            value={textSpacing}
                            onChange={handleSpacingChange}
                            className="w-full"
                        />
                    </div>
                    
                    <hr className="border-t border-[#D3DBDF] h-px" />

                    <div className='flex flex-col gap-3 justify-between py-3 px-3'>
                        <h3 className='text-[14px] font-semibold text-black'>Arrange</h3>
                        <div className="flex items-center gap-7">
                            <img 
                                onClick={handleBringForward} 
                                className='w-[20px] cursor-pointer' 
                                src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508122/arrange-bring-forward_vigco4.png" 
                                alt="bring forward" 
                                title="Bring Forward"
                            />
                            <img 
                                onClick={() => handleArrangeAction('bringToFront')}
                                className='w-[20px] cursor-pointer' 
                                src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508122/arrange-bring-to-front_povosv.png" 
                                alt="bring to front" 
                                title="Bring to Front"
                            />
                            <img 
                                onClick={() => handleArrangeAction('sendBackward')}
                                className='w-[20px] cursor-pointer' 
                                src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508122/arrange-send-backward_buzw6f.png" 
                                alt="send backward" 
                                title="Send Backward"
                            />
                            <img 
                                onClick={() => handleArrangeAction('sendToBack')}
                                className='w-[20px] cursor-pointer' 
                                src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508121/arrange-send-to-back_bcyzlu.png" 
                                alt="send to back" 
                                title="Send to Back"
                            />
                        </div>
                        {layerManager && (
                            <p className="text-xs text-gray-500 mt-1">
                                ⚡ Layer system active - TEXT layer (zIndex: 5)
                            </p>
                        )}
                    </div>

                </div>
            )}

            {showTextSelectTab && (
                <FontSelector 
                    selectedFont={currentFont} 
                    setShowTextSelectTab={setShowTextSelectTab} 
                    setSelectedFont={handleFontSelection} 
                />
            )}

            {showColorTab && (
                <CustomColorSwatch 
                    setTextColor={setTextColor} 
                    setChangeTextColor={handleColorSelection} 
                    setShowColorTab={setShowColorTab} 
                />
            )}
        </>
    )
}

export default EditTextTab