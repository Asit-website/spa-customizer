import React, { useState } from 'react'
import FontSelector from './FontSelector';
import CustomColorSwatch from './CustomColorSwatch';

const EditTextTab = ({setChangeTextFlipX,setChangeTextFlipY, setTextColor, setChangeTextColor, editor, setShowEditModal, customText, setCustomText, textSize, setTextSize, setTextSpacing, textSpacing, setTextFontFamily, setChangeFontFamily, setFontStyle, setChangeFontStyle, bringForward }) => {

    const [showColorTab, setShowColorTab] = useState(false);
    // const [selectedFont, setSelectedFont] = useState("Montserrat");
    const [showTextSelectTab, setShowTextSelectTab] = useState(false);

    return (
        <>
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
                    <input type="text" value={customText}
                        onChange={(e) => setCustomText(e.target.value)} name="" id="" placeholder="Add Headline" className="border border-[#D3DBDF] text-black rounded-lg p-3 min-h-20  w-full placeholder:font-semibold" />
                </div>


                <hr className="border-t border-[#D3DBDF] h-px" />

                <div className='flex items-center justify-between py-3 px-3'>
                    <div className='flex items-center gap-2'>
                        <h3 className='text-[14px] text-black font-semibold'>Flip</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <img onClick={()=> setChangeTextFlipX(prev => !prev)} className='w-[22px] cursor-pointer' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507255/tune-vertical_ezas8p.png" alt="flip" />
                        <img onClick={()=> setChangeTextFlipY(prev => !prev)} className='w-[22px] cursor-pointer' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507254/flip-vertical_ajs5ur.png" alt="flip" />
                    </div>
                </div>

                <hr className="border-t border-[rgb(211,219,223)] h-px" />

                <div className=' py-3 px-3'>
                    <div className='flex items-center gap-2'>
                        <h3 className='text-[14px] text-black font-semibold'>Font</h3>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                        <div onClick={() => setShowTextSelectTab(prev => !prev)} className='border border-[#D3DBDF] min-w-[165px] cursor-pointer flex items-center justify-between rounded-md p-2'>
                            <span className='text-[14px] text-gray-500 font-medium'>{setTextFontFamily}</span>
                            <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1750138078/chevron-right_p6kmcp.svg" alt="arrow" />
                        </div>

                        <img className='cursor-pointer' onClick={() => setChangeFontStyle(setFontStyle === "bold" ? "normal" : "bold")} src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1750137959/alpha-b_aygypw.svg" alt="bold" />
                        <img className='cursor-pointer' onClick={() => setChangeFontStyle(setFontStyle === 'italic' ? "normal" : 'italic')} src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1750137959/format-italic_d9ndma.svg" alt="italic" />

                        <div
                            className={`w-6 h-6 rounded-full cursor-pointer border-2 transition-all duration-150 `}
                            style={{ backgroundColor: setTextColor }}
                            onClick={() => setShowColorTab(prev => !prev)}
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
                            const activeObj = editor.canvas.getActiveObject();
                            if (activeObj && activeObj.type === "i-text") {
                                activeObj.set("fontSize", newSize);
                                editor.canvas.renderAll();
                            }
                        }}
                        className="w-full "
                    />

                    <label className="text-[14px] text-black font-medium">Arc</label>
                    <input
                        type="range"
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
                            const activeObj = editor.canvas.getActiveObject();
                            if (activeObj && activeObj.type === "i-text") {
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
                        <img onClick={bringForward} className='w-[20px]' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508122/arrange-bring-forward_vigco4.png" alt="" />
                        <img className='w-[20px]' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508122/arrange-bring-to-front_povosv.png" alt="" />
                        <img className='w-[20px]' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508122/arrange-send-backward_buzw6f.png" alt="" />
                        <img className='w-[20px]' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508121/arrange-send-to-back_bcyzlu.png" alt="" />
                    </div>
                </div>

            </div>

            {showTextSelectTab && (
                <FontSelector selectedFont={setTextFontFamily} setShowTextSelectTab={setShowTextSelectTab} setSelectedFont={setChangeFontFamily} />
            )}

            {
                showColorTab && (
                    <CustomColorSwatch setTextColor={setTextColor} setChangeTextColor={setChangeTextColor} setShowColorTab={setShowColorTab} />

                )
            }
        </>
    )
}

export default EditTextTab