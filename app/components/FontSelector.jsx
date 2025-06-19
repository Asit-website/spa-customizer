
import React, { useEffect, useState } from "react";

const googleFonts = [
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Source Sans Pro",
  "Raleway",
  "Noto Sans",
  "Ubuntu",
  "Merriweather",
  "Nunito",
  "Playfair Display",
  "Rubik",
  "Work Sans",
  "PT Sans",
  "Oswald",
  "Inter",
  "Quicksand",
  "DM Sans",
  "Roboto Condensed",
  "Bebas Neue",
  "Anton",
  "Dancing Script",
  "Cabin",
  "Fira Sans",
  "Mukta",
  "Josefin Sans",
  "Abel",
  "Teko",
  "Titillium Web"
];

const FontSelector = ({ setSelectedFont,selectedFont, setShowTextSelectTab }) => {


  return (
    <div className="bg-white rounded-lg border border-[#D3DBDF] w-80 h-fit max-h-[460px] overflow-y-scroll">

      <div className='flex items-center justify-between py-2 px-3'>
        <div className='flex items-center gap-2'>
          <h3 className='text-[16px] text-black font-semibold'>Typeface</h3>
        </div>
        <div className="cursor-pointer" onClick={() => setShowTextSelectTab(false)}>
          <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749341803/Vector_hm0yzo.png" alt="Close" />
        </div>
      </div>
      <hr className="border-t border-[#D3DBDF] h-px" />

      <div className="p-3 flex flex-col gap-5">
        <div onClick={() => setShowTextSelectTab(prev => !prev)} className='border border-[#D3DBDF] w-full cursor-pointer flex items-center justify-between rounded-md p-2'>
          <span className='text-[14px] text-gray-500 font-medium'>{selectedFont}</span>
          <img className="transform rotate-90" src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1750138078/chevron-right_p6kmcp.svg" alt="arrow" />
        </div>

        <div className="flex flex-col gap-4">
        {googleFonts.map((font) => (
          <div
            key={font}
            className="px-3"
            onClick={() => setSelectedFont(font)}
          >
            <p className="text-black">{font}</p>
          </div>
        ))}
      </div>
      </div>

    </div>
  );
};

export default FontSelector;
