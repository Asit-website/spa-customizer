import React, { useState } from 'react'

const SelectColorsTab = ({handleColorChange,selectedColor,setShowBgColorsModal}) => {

    const colorOptionsWithNames = [
        { color: "#000000", name: "Black" },
        { color: "#434343", name: "Dark Gray" },
        { color: "#666666", name: "Gray" },
        { color: "#999999", name: "Medium Gray" },
        { color: "#b7b7b7", name: "Silver Gray" },
        { color: "#cccccc", name: "Light Gray" },
        { color: "#e6e6e6", name: "Lighter Gray" },
        { color: "#f3f3f3", name: "Off White" },
        { color: "#dbebe6", name: "Mint Gray" },
        { color: "#b3e5fc", name: "Sky Blue" },
        { color: "#4fc3f7", name: "Light Blue" },
        { color: "#0288d1", name: "Medium Blue" },
        { color: "#512da8", name: "Indigo" },
        { color: "#002f6c", name: "Navy Blue" },
        { color: "#4a148c", name: "Dark Purple" },
        { color: "#c2185b", name: "Deep Pink" },
        { color: "#ce93d8", name: "Lavender" },
        { color: "#f8bbd0", name: "Baby Pink" },
        { color: "#f48fb1", name: "Pink" },
        { color: "#ff5252", name: "Coral Red" },
        { color: "#ef9a9a", name: "Light Coral" },
        { color: "#ffab91", name: "Peach" },
        { color: "#ffe0b2", name: "Light Orange" },
        { color: "#fff59d", name: "Light Yellow" },
        { color: "#ffeb3b", name: "Yellow" },
        { color: "#ffd740", name: "Amber" },
        { color: "#ffb300", name: "Golden Orange" },
        { color: "#a1887f", name: "Brown Gray" },
        { color: "#8d6e63", name: "Brown" },
        { color: "#d7ccc8", name: "Beige" },
        { color: "#80cbc4", name: "Teal" },
        { color: "#a5d6a7", name: "Light Green" },
        { color: "#c5e1a5", name: "Lime Green" },
        { color: "#8bc34a", name: "Green" },
        { color: "#388e3c", name: "Dark Green" },
        { color: "#004d40", name: "Forest Green" },
        { color: "#006064", name: "Dark Teal" },
        { color: "#e0f2f1", name: "Aqua Mist" },
        { color: "#ffffff", name: "White" },
    ];

    // const [selectedColor , setSelectedColor] = useState({});

    return (
        <div className="bg-white rounded-lg border border-[#D3DBDF] w-72 h-fit max-h-[460px] overflow-y-scroll">
            <div className='flex items-center justify-between py-2 px-3'>
                <div className='flex items-center gap-2'>
                    <h3 className='text-[16px] text-black font-semibold'>Select Colors</h3>
                </div>
                <div onClick={()=> setShowBgColorsModal(false)} className="cursor-pointer" >
                    <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749341803/Vector_hm0yzo.png" alt="Close" />
                </div>
            </div>
            <hr className="border-t border-[#D3DBDF] h-px" />

            <div className='flex flex-col gap-3 py-3 px-3'>
                {
                    colorOptionsWithNames.map((color,index) => {
                        return (
                            <div key={index} onClick={() => handleColorChange(color)} className={`flex relative items-center p-2 rounded-md cursor-pointer gap-4 ${selectedColor.color === color.color ? "border border-[#D3DBDF]" : ""}`}>
                                <div className={`w-8 h-8 rounded-full cursor-pointer transition-all duration-150 `} style={{ backgroundColor: color.color }} />

                                <div className='flex flex-col'>
                                    <p className='text-[16px] text-black'>{color.name}</p>
                                    <span className='text-gray-500 underline text-[14px]'>8 sizes in stock</span>
                                </div>

                                {selectedColor.color === color.color && <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1750146342/check-circle_1_lry4rw.svg" alt="" className='absolute right-1.5 top-4'/>}
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default SelectColorsTab