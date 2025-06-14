import React from 'react'
import FontSelector from './FontSelector';

const EditTextTab = ({ setShowEditModal, customText, setCustomText, textSize, setTextSize, setTextSpacing, textSpacing }) => {

    return (
        <div className="bg-white rounded-lg border border-[#D3DBDF] w-80 h-fit max-h-[530px] overflow-y-scroll">

            <div className='flex items-center justify-between py-2 px-3'>
                <div className='flex items-center gap-2'>
                    <h3 className='text-[16px] font-semibold'>Edit text</h3>
                </div>
                <div className="cursor-pointer" onClick={() => setShowEditModal(false)}>
                    <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749341803/Vector_hm0yzo.png" alt="Close" />
                </div>
            </div>
            <hr className="border-t border-[#D3DBDF] h-px" />
            <div className='py-3 px-4'>
                <input type="text" value={customText}
                    onChange={(e) => setCustomText(e.target.value)} name="" id="" placeholder="Add Headline" className="border border-[#D3DBDF] rounded-lg p-3 min-h-20  w-full placeholder:font-semibold" />
            </div>


            <hr className="border-t border-[#D3DBDF] h-px" />

            <div className='flex items-center justify-between py-3 px-3'>
                <div className='flex items-center gap-2'>
                    <h3 className='text-[14px] font-semibold'>Flip</h3>
                </div>
                <div className="flex items-center gap-3">
                    <img className='w-[22px]' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507255/tune-vertical_ezas8p.png" alt="flip" />
                    <img className='w-[22px]' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507254/flip-vertical_ajs5ur.png" alt="flip" />
                </div>
            </div>

            <hr className="border-t border-[#D3DBDF] h-px" />

            <FontSelector />

            <hr className="border-t border-[#D3DBDF] h-px" />

            <div className='flex flex-col gap-3 justify-between py-4 px-3'>
                <label className="text-[14px] font-medium">Size</label>
                <input
                    type="range"
                    min={10}
                    max={100}
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
                    className="w-full"
                />

                <label className="text-[14px] font-medium">Arc</label>
                <input
                    type="range"
                    className="w-full"
                />

                <label className="text-[14px] font-medium">Spacing</label>
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
                <h3 className='text-[14px] font-semibold'>Arrange</h3>
                <div className="flex items-center gap-7">
                    <img className='w-[20px]' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508122/arrange-bring-forward_vigco4.png" alt="" />
                    <img className='w-[20px]' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508122/arrange-bring-to-front_povosv.png" alt="" />
                    <img className='w-[20px]' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508122/arrange-send-backward_buzw6f.png" alt="" />
                    <img className='w-[20px]' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508121/arrange-send-to-back_bcyzlu.png" alt="" />
                </div>
            </div>

        </div>
    )
}

export default EditTextTab