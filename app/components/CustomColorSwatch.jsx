import { useState } from "react";

const colorOptions = [
    "#000000", "#434343", "#666666", "#999999", "#b7b7b7", "#cccccc", "#e6e6e6", "#f3f3f3", "#dbebe6",
    "#b3e5fc", "#4fc3f7", "#0288d1", "#512da8", "#002f6c",
    "#4a148c", "#c2185b", "#ce93d8", "#f8bbd0",
    "#f48fb1", "#ff5252", "#ef9a9a", "#ffab91", "#ffe0b2", "#fff59d",
    "#ffeb3b", "#ffd740", "#ffb300", "#a1887f", "#8d6e63",
    "#d7ccc8", "#80cbc4", "#a5d6a7", "#c5e1a5", "#8bc34a",
    "#388e3c", "#004d40", "#006064", "#e0f2f1", "#ffffff"
];

export default function CustomColorSwatch({setTextColor, setChangeTextColor, selectedColor, setSelectedColor, setShowColorTab }) {
    
    const handleColorClick = (color) => {
        setChangeTextColor(color); 
    };

    return (
        <div className="bg-white rounded-lg border border-[#D3DBDF] w-72 h-fit max-h-[460px] overflow-y-scroll">
            
            <div className='flex items-center justify-between py-2 px-3'>
                <div className='flex items-center gap-2'>
                    <h3 className='text-[16px] text-black font-semibold'>Choose Color</h3>
                </div>
                <div className="cursor-pointer" onClick={() => setShowColorTab(false)}>
                    <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749341803/Vector_hm0yzo.png" alt="Close" />
                </div>
            </div>
            <hr className="border-t border-[#D3DBDF] h-px" />
            
            <div className="p-3 flex flex-col gap-2">
                <div>
                    <h3 className="text-[12px] text-black font-semibold">USED IN YOUR DESIGN</h3>
                    <div className="mb-4 flex items-center gap-2 mt-2">
                        <div 
                            className={`w-6 h-6 rounded-full cursor-pointer border-2 transition-all duration-150`} 
                            style={{ backgroundColor: setTextColor }} 
                            onClick={() => handleColorClick(setTextColor)}
                        />
                        <span className="text-sm">{setTextColor}</span>
                    </div>
                </div>
                
                <div>
                    <h3 className="text-[12px] font-semibold text-black">ALL COLORS</h3>
                    <div className="grid grid-cols-6 items-center gap-2 mt-2">
                        {colorOptions.map((color) => (
                            <div
                                key={color}
                                className={`w-6 h-6 rounded-full cursor-pointer border-2 transition-all duration-150 ${
                                    selectedColor === color ? "border-black scale-110" : "border-transparent"
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => handleColorClick(color)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}