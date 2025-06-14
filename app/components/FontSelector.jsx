
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

const FontSelector = ({ canvas }) => {
  const [selectedFont, setSelectedFont] = useState("Montserrat");

  const loadFont = (fontName) => {
    const fontUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, "+")}&display=swap`;
    const existingLink = document.querySelector(`link[href="${fontUrl}"]`);
    if (!existingLink) {
      const link = document.createElement("link");
      link.href = fontUrl;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  };

  const handleFontChange = (font) => {
    setSelectedFont(font);
    loadFont(font);

    const activeObj = canvas?.getActiveObject();
    if (activeObj && activeObj.type === "text" || activeObj.type === "i-text") {
      activeObj.set("fontFamily", font);
      canvas.requestRenderAll();
    }
  };

  useEffect(() => {
    loadFont(selectedFont);
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <label>Font</label>
      <select
        value={selectedFont}
        onChange={(e) => handleFontChange(e.target.value)}
        style={{ padding: "8px", marginLeft: "10px" }}
      >
        {googleFonts.map((font) => (
          <option key={font} value={font} style={{ fontFamily: font }}>
            {font}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FontSelector;
