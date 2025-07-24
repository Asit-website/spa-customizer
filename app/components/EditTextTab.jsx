import React, { useState, useEffect } from 'react'
import FontSelector from './FontSelector';
import CustomColorSwatch from './CustomColorSwatch';

const EditTextTab = ({ 
    setTextFlipX,      // ✅ Fixed: was setChangeTextFlipX
    setTextFlipY,      // ✅ Fixed: was setChangeTextFlipY
    setTextColor,      // ✅ Direct state setter
    editor, 
    setShowEditModal, 
    customText, 
    setCustomText, 
    textSize, 
    setTextSize, 
    setTextSpacing, 
    textSpacing, 
    setTextFontFamily, // ✅ Direct state setter
    setFontStyle,      // ✅ Direct state setter  
    bringForward 
}) => {

    const [showColorTab, setShowColorTab] = useState(false);
    const [showTextSelectTab, setShowTextSelectTab] = useState(false);
    const [currentFont, setCurrentFont] = useState('Arial'); 
    const [currentColor, setCurrentColor] = useState('#000000'); 

    const getActiveTextObject = () => {
        if (!editor?.canvas) return null;
        const activeObj = editor.canvas.getActiveObject();
        return activeObj && activeObj.type === "i-text" ? activeObj : null;
    };

    useEffect(() => {
        const activeTextObj = getActiveTextObject();
        if (activeTextObj) {
            if (activeTextObj.text !== customText) {
                setCustomText(activeTextObj.text);
            }
            setCurrentFont(activeTextObj.fontFamily || 'Arial');
            setCurrentColor(activeTextObj.fill || '#000000');
        }
    }, [editor?.canvas?.getActiveObject()]);

    const handleTextChange = (e) => {
        const newText = e.target.value;
        setCustomText(newText);
        
        const activeTextObj = getActiveTextObject();
        if (activeTextObj) {
            activeTextObj.set('text', newText);
            editor.canvas.renderAll();
        }
    };

    const handleFontSelection = (font) => {
        setTextFontFamily(font);  // ✅ Fixed: direct state update
        setCurrentFont(font);
        
        const activeTextObj = getActiveTextObject();
        if (activeTextObj) {
            activeTextObj.set('fontFamily', font);
            editor.canvas.renderAll();
        }
        
        setShowTextSelectTab(false); 
    };

    const handleColorSelection = (color) => {
        setTextColor(color);  // ✅ Fixed: direct state update
        setCurrentColor(color);
        
        const activeTextObj = getActiveTextObject();
        if (activeTextObj) {
            activeTextObj.set('fill', color);
            editor.canvas.renderAll();
        }
        
        setShowColorTab(false); 
    };

    const handleFontStyleChange = (styleType) => {
        const activeTextObj = getActiveTextObject();
        if (!activeTextObj) return;

        if (styleType === 'bold') {
            const currentWeight = activeTextObj.fontWeight;
            const newWeight = currentWeight === 'bold' ? 'normal' : 'bold';
            activeTextObj.set('fontWeight', newWeight);
            setFontStyle(newWeight);  // ✅ Fixed: direct state update
        } else if (styleType === 'italic') {
            const currentStyle = activeTextObj.fontStyle;
            const newStyle = currentStyle === 'italic' ? 'normal' : 'italic';
            activeTextObj.set('fontStyle', newStyle);
            setFontStyle(newStyle);  // ✅ Fixed: direct state update
        }
        
        editor.canvas.renderAll();
    };

    const handleFlipX = () => {
        const activeTextObj = getActiveTextObject();
        if (activeTextObj) {
            const currentFlipX = activeTextObj.flipX;
            const newFlipX = !currentFlipX;
            activeTextObj.set('flipX', newFlipX);
            setTextFlipX(newFlipX);  // ✅ Update state
            editor.canvas.renderAll();
        }
    };

    const handleFlipY = () => {
        const activeTextObj = getActiveTextObject();
        if (activeTextObj) {
            const currentFlipY = activeTextObj.flipY;
            const newFlipY = !currentFlipY;
            activeTextObj.set('flipY', newFlipY);
            setTextFlipY(newFlipY);  // ✅ Update state
            editor.canvas.renderAll();
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
                    </div>

                    <hr className="border-t border-[#D3DBDF] h-px" />

                    <div className='flex items-center justify-between py-3 px-3'>
                        <div className='flex items-center gap-2'>
                            <h3 className='text-[14px] text-black font-semibold'>Flip</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <img 
                                onClick={handleFlipX}  // ✅ Fixed: proper handler
                                className='w-[22px] cursor-pointer' 
                                src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507255/tune-vertical_ezas8p.png" 
                                alt="flip horizontal" 
                            />
                            <img 
                                onClick={handleFlipY}  // ✅ Fixed: proper handler
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
                            onChange={(e) => {
                                const newSize = parseInt(e.target.value);
                                setTextSize(newSize);
                                const activeObj = getActiveTextObject();
                                if (activeObj) {
                                    activeObj.set("fontSize", newSize);
                                    editor.canvas.renderAll();
                                }
                            }}
                            className="w-full"
                        />

                        <label className="text-[14px] text-black font-medium">Spacing</label>
                        <input
                            type="range"
                            min={-10}
                            max={100}
                            value={textSpacing}
                            onChange={(e) => {
                                const newSpacing = parseInt(e.target.value);
                                setTextSpacing(newSpacing);
                                const activeObj = getActiveTextObject();
                                if (activeObj) {
                                    activeObj.set("charSpacing", newSpacing * 10);
                                    editor.canvas.renderAll();
                                }
                            }}
                            className="w-full"
                        />
                    </div>
                    
                    <hr className="border-t border-[#D3DBDF] h-px" />

                    <div className='flex flex-col gap-3 justify-between py-3 px-3'>
                        <h3 className='text-[14px] font-semibold text-black'>Arrange</h3>
                        <div className="flex items-center gap-7">
                            <img 
                                onClick={bringForward} 
                                className='w-[20px] cursor-pointer' 
                                src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508122/arrange-bring-forward_vigco4.png" 
                                alt="bring forward" 
                            />
                            <img 
                                className='w-[20px] cursor-pointer' 
                                src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508122/arrange-bring-to-front_povosv.png" 
                                alt="bring to front" 
                            />
                            <img 
                                className='w-[20px] cursor-pointer' 
                                src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508122/arrange-send-backward_buzw6f.png" 
                                alt="send backward" 
                            />
                            <img 
                                className='w-[20px] cursor-pointer' 
                                src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508121/arrange-send-to-back_bcyzlu.png" 
                                alt="send to back" 
                            />
                        </div>
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