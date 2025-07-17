'use client'
import React, { useEffect } from "react";

const families = [
  "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Source Sans Pro",
  "Raleway", "Noto Sans", "Ubuntu", "Merriweather", "Nunito", "Playfair Display",
  "Rubik", "Work Sans", "PT Sans", "Oswald", "Inter", "Quicksand", "DM Sans",
  "Roboto Condensed", "Bebas Neue", "Anton", "Dancing Script", "Cabin", "Fira Sans",
  "Mukta", "Josefin Sans", "Abel", "Teko", "Titillium Web",
  "Arimo", "Asap", "Barlow", "Cairo", "Chivo", "Cinzel", "Cormorant Garamond",
  "Domine", "EB Garamond", "Exo 2", "Francois One", "Heebo", "Hind", "IBM Plex Sans",
  "Inconsolata", "Kanit", "Karla", "Libre Baskerville", "Libre Franklin", "Lora",
  "Manrope", "Maven Pro", "Muli", "Noto Serif", "Overpass", "PT Serif",
  "Public Sans", "Questrial", "Righteous", "Signika", "Slabo 27px", "Spartan",
  "Sora", "Syne", "Tajawal", "Zilla Slab"
]

const FontSelector = ({ setSelectedFont, selectedFont, setShowTextSelectTab }) => {
  useEffect(() => {
    const loadFont = async () => {
      if (typeof window !== "undefined") {
        const WebFont = (await import('webfontloader')).default;
        WebFont.load({
          google: {
            families,
          },
        });
      }
    };
    
    loadFont();
  }, []);

  const handleFontClick = (font) => {
    setSelectedFont(font); 
  };

  return (
    <div className="bg-white rounded-lg border border-[#D3DBDF] w-80 h-fit max-h-[460px] overflow-y-scroll">
      <div className='flex items-center justify-between py-2 px-3'>
        <h3 className='text-[16px] text-black font-semibold'>Typeface</h3>
        <div className="cursor-pointer" onClick={() => setShowTextSelectTab(false)}>
          <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749341803/Vector_hm0yzo.png" alt="Close" />
        </div>
      </div>
      <hr className="border-t border-[#D3DBDF] h-px" />
      
      <div className="p-3 flex flex-col gap-4">
        {families.map((font) => (
          <div key={font} className="px-3 cursor-pointer" onClick={() => handleFontClick(font)}>
            <p className="text-black text-[14px]" style={{ fontFamily: font }}>
              {font}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FontSelector;