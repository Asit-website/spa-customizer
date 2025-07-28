import React, { useState } from 'react'

const SelectColorsTab = ({
  handleColorChange,
  selectedColor,
  setShowBgColorsModal,
  // NEW: Props for gradient colors
  handleTopColorChange,
  handleBottomColorChange,
  selectedTopColor,
  selectedBottomColor,
  selectedProduct
}) => {

  const [activeTab, setActiveTab] = useState('background'); // 'background', 'topColor', 'bottomColor'

  // Fallback colors if product doesn't have color arrays
  const defaultColorOptions = [
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

  // Get colors from product or use defaults
  const getColorsForTab = (tab) => {
    if (!selectedProduct) return defaultColorOptions;

    switch (tab) {
      case 'background':
        return defaultColorOptions; // Background colors remain the same
      case 'topColor':
        // FIXED: Access colors.topColor instead of just topColor
        return selectedProduct.colors?.topColor || defaultColorOptions;
      case 'bottomColor':
        // FIXED: Access colors.bottomColor instead of just bottomColor  
        return selectedProduct.colors?.bottomColor || defaultColorOptions;
      default:
        return defaultColorOptions;
    }
  };

  const getCurrentSelectedColor = (tab) => {
    switch (tab) {
      case 'background':
        return selectedColor;
      case 'topColor':
        return selectedTopColor;
      case 'bottomColor':
        return selectedBottomColor;
      default:
        return null;
    }
  };

  const handleColorSelect = (colorObj, tab) => {
    switch (tab) {
      case 'background':
        handleColorChange && handleColorChange(colorObj);
        break;
      case 'topColor':
        handleTopColorChange && handleTopColorChange(colorObj);
        break;
      case 'bottomColor':
        handleBottomColorChange && handleBottomColorChange(colorObj);
        break;
    }
  };

  const renderColorPreview = (colorObj, tab) => {
    if (tab === 'background') {
      // For background colors, show the solid color
      return (
        <div 
          className={`w-8 h-8 rounded-full cursor-pointer transition-all duration-150`} 
          style={{ backgroundColor: colorObj.color }} 
        />
      );
    } else {
      // For gradient colors, show the image if available
      if (colorObj.url) {
        return (
          <div className="w-8 h-8 rounded-full cursor-pointer transition-all duration-150 overflow-hidden border border-gray-200">
            <img 
              src={colorObj.url} 
              alt={colorObj.name}
              className="w-full h-full object-cover"
            />
          </div>
        );
      } else {
        // Fallback to solid color if no URL
        return (
          <div 
            className={`w-8 h-8 rounded-full cursor-pointer transition-all duration-150`} 
            style={{ backgroundColor: colorObj.color || '#ccc' }} 
          />
        );
      }
    }
  };

  const currentColors = getColorsForTab(activeTab);
  const currentSelected = getCurrentSelectedColor(activeTab);

  // Check if gradient tabs should be shown
  const hasGradientColors = selectedProduct?.colors?.topColor || selectedProduct?.colors?.bottomColor;

  return (
    <div className="bg-white rounded-lg border border-[#D3DBDF] w-72 h-fit max-h-[460px] overflow-hidden">
      <div className='flex items-center justify-between py-2 px-3'>
        <div className='flex items-center gap-2'>
          <h3 className='text-[16px] text-black font-semibold'>Select Colors</h3>
        </div>
        <div onClick={() => setShowBgColorsModal(false)} className="cursor-pointer">
          <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749341803/Vector_hm0yzo.png" alt="Close" />
        </div>
      </div>
      <hr className="border-t border-[#D3DBDF] h-px" />

      {/* Tab Navigation - Only show if there are gradient colors */}
      <div className="flex border-b border-[#D3DBDF]">
        <button
          onClick={() => setActiveTab('background')}
          className={`flex-1 py-2 px-3 text-sm font-medium transition-colors duration-200 ${
            activeTab === 'background'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Background
        </button>
        
        {/* Only show gradient tabs if product has gradient colors */}
        {selectedProduct?.colors?.topColor && (
          <button
            onClick={() => setActiveTab('topColor')}
            className={`flex-1 py-2 px-3 text-sm font-medium transition-colors duration-200 ${
              activeTab === 'topColor'
                ? 'bg-red-50 text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Top Color
          </button>
        )}
        
        {selectedProduct?.colors?.bottomColor && (
          <button
            onClick={() => setActiveTab('bottomColor')}
            className={`flex-1 py-2 px-3 text-sm font-medium transition-colors duration-200 ${
              activeTab === 'bottomColor'
                ? 'bg-green-50 text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Bottom Color
          </button>
        )}
      </div>

      {/* Color Grid */}
      <div className='max-h-[320px] overflow-y-auto'>
        <div className='flex flex-col gap-3 py-3 px-3'>
          {currentColors.map((colorObj, index) => {
            const isSelected = currentSelected && (
              (activeTab === 'background' && currentSelected.color === colorObj.color) ||
              (activeTab !== 'background' && currentSelected?.id === colorObj.id)
            );

            return (
              <div 
                key={`${activeTab}-${index}`} 
                onClick={() => handleColorSelect(colorObj, activeTab)} 
                className={`flex relative items-center p-2 rounded-md cursor-pointer gap-4 transition-all duration-200 hover:bg-gray-50 ${
                  isSelected ? "border border-blue-400 bg-blue-50" : "border border-transparent"
                }`}
              >
                {renderColorPreview(colorObj, activeTab)}

                <div className='flex flex-col'>
                  <p className='text-[16px] text-black font-medium'>{colorObj.name}</p>
                  <span className='text-gray-500 text-[14px]'>
                    {activeTab === 'background' ? '8 sizes in stock' : 'Gradient effect'}
                  </span>
                </div>

                {isSelected && (
                  <img 
                    src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1750146342/check-circle_1_lry4rw.svg" 
                    alt="Selected" 
                    className='absolute right-1.5 top-4'
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Footer */}
      <div className="px-3 py-2 bg-gray-50 text-xs text-gray-600">
        {activeTab === 'background' && "Background colors change the base canvas color"}
        {activeTab === 'topColor' && "Top colors create gradient effects on the upper part"}
        {activeTab === 'bottomColor' && "Bottom colors create gradient effects on the lower part"}
        {!hasGradientColors && activeTab === 'background' && " • This product doesn't support gradient colors"}
      </div>
    </div>
  );
};

export default SelectColorsTab;