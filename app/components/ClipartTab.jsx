// Updated ClipartTab.js - Completely Dynamic Based on Product Data

import React, { useState, useEffect } from 'react';

const DynamicClipartTab = ({
  setShowClipartTab,
  selectedProduct,
  handleAddDesignToCanvas,
  handleAddPatternToCanvas,
  handleDynamicLayerChange,
  editor
}) => {
  const [view, setView] = useState('main');
  const [availableCategories, setAvailableCategories] = useState([]);

  // Extract available categories from product data
  useEffect(() => {
    if (!selectedProduct) return;

    const categories = [];

    // Check what data is available in the product
    if (selectedProduct.layersDesigns) {
      Object.keys(selectedProduct.layersDesigns).forEach(category => {
        if (selectedProduct.layersDesigns[category] && selectedProduct.layersDesigns[category].length > 0) {
          categories.push({
            key: category,
            name: getCategoryDisplayName(category),
            items: selectedProduct.layersDesigns[category]
          });
        }
      });
    }

    setAvailableCategories(categories);
    console.log('📦 Available categories from product:', categories.map(c => c.name));
  }, [selectedProduct]);

  // Convert category keys to display names
  const getCategoryDisplayName = (key) => {
    const displayNames = {
      designs: 'Product Designs',
      patterns: 'Product Patterns',
      sole: 'Shoe Sole Options',
      surface: 'Surface Colors',
      middle: 'Middle Parts',
      lace: 'Lace Colors',
      backgrounds: 'Background Designs',
      textures: 'Texture Patterns',
      graphics: 'Graphic Elements',
      logos: 'Logo Designs',
      typography: 'Typography Styles'
    };
    
    return displayNames[key] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  const handleBack = () => {
    setView('main');
  };

  const getHeaderTitle = () => {
    const backIcon = (
      <img
        src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1750138078/chevron-right_p6kmcp.svg"
        className="rotate-180 w-4"
      />
    );

    if (view === 'main') {
      return 'Product Customization';
    }

    const currentCategory = availableCategories.find(cat => cat.key === view);
    const categoryName = currentCategory ? currentCategory.name : 'Back';

    return (
      <span className='flex items-center gap-1 cursor-pointer' onClick={handleBack}>
        {backIcon}
        <span className='text-[16px] text-black font-semibold'>
          {categoryName}
        </span>
      </span>
    );
  };

  // Handle item selection based on category type
  const handleItemSelect = (item, categoryKey) => {
    console.log(`🎨 Selected item from ${categoryKey}:`, item.name);

    switch (categoryKey) {
      case 'designs':
        handleAddDesignToCanvas(item.url, item.position, item.offsetX, item.offsetY);
        break;
      
      case 'patterns':
        handleAddPatternToCanvas(item.url);
        break;
      
      // Handle dynamic layer types (shoe parts, etc.)
      case 'sole':
      case 'surface':
      case 'middle':
      case 'lace':
        handleDynamicLayerChange && handleDynamicLayerChange(categoryKey, item);
        break;
      
      // Handle any other custom categories
      default:
        if (handleDynamicLayerChange) {
          handleDynamicLayerChange(categoryKey, item);
        } else {
          console.log(`No handler for category: ${categoryKey}`);
        }
        break;
    }
  };

  // Render main category selection
  const renderMainView = () => (
    <div className="p-3 space-y-2">
      {availableCategories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📦</div>
          <p className="text-sm">No customization options available</p>
          <p className="text-xs mt-1">This product doesn't have configurable layers</p>
        </div>
      ) : (
        availableCategories.map((category) => (
          <div
            key={category.key}
            onClick={() => setView(category.key)}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {category.items.length}
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">{category.name}</h4>
                <p className="text-xs text-gray-500">{category.items.length} options available</p>
              </div>
            </div>
            <img
              src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1750138078/chevron-right_p6kmcp.svg"
              className="w-4"
            />
          </div>
        ))
      )}
    </div>
  );

  // Render category items
  const renderCategoryView = () => {
    const currentCategory = availableCategories.find(cat => cat.key === view);
    if (!currentCategory) return null;

    const isShoeCategory = ['sole', 'surface', 'middle', 'lace'].includes(view);
    const isDesignCategory = ['designs', 'patterns'].includes(view);

    return (
      <div className="p-3 max-h-80 overflow-y-auto">
        {isDesignCategory ? (
          // Grid layout for designs and patterns
          <div className={`grid ${view === 'designs' ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
            {currentCategory.items.map((item, index) => (
              <div key={item.id || index} className="relative group">
                {view === 'patterns' ? (
                  // Special layout for patterns
                  <div className="border-2 border-blue-300 rounded-lg p-2">
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-16 object-contain rounded mb-2"
                    />
                    <button
                      onClick={() => handleItemSelect(item, view)}
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs py-1 rounded hover:from-purple-600 hover:to-blue-600 font-medium transition-all duration-200"
                    >
                      ADD PATTERN
                    </button>
                    <p className="text-xs text-gray-600 mt-1 font-medium">{item.name}</p>
                  </div>
                ) : (
                  // Simple grid for designs
                  <div
                    onClick={() => handleItemSelect(item, view)}
                    className="cursor-pointer border border-gray-200 rounded hover:border-blue-500 p-1 transition-colors"
                  >
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-20 object-contain"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // List layout for shoe parts and other categories
          <div className="space-y-2">
            {currentCategory.items.map((item, index) => (
              <div
                key={item.id || index}
                onClick={() => handleItemSelect(item, view)}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
              >
                <div className="w-12 h-12 border border-gray-300 rounded overflow-hidden">
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{item.name}</h4>
                  {item.color && (
                    <p className="text-xs text-gray-500">Color: {item.color}</p>
                  )}
                  {item.description && (
                    <p className="text-xs text-gray-500">{item.description}</p>
                  )}
                </div>
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state for categories with no items */}
        {currentCategory.items.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🎨</div>
            <p className="text-sm">No {currentCategory.name.toLowerCase()} available</p>
            <p className="text-xs mt-1">This category is empty</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-[#D3DBDF] w-80 h-fit max-h-[500px] overflow-hidden">
      <div className='flex items-center justify-between py-2 px-3'>
        <h3 className='text-[16px] text-black font-semibold'>
          {getHeaderTitle()}
        </h3>
        <div className="cursor-pointer" onClick={() => setShowClipartTab(false)}>
          <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749341803/Vector_hm0yzo.png" alt="Close" />
        </div>
      </div>
      <hr className="border-t border-[#D3DBDF]" />

      {view === 'main' ? renderMainView() : renderCategoryView()}

      {/* Dynamic info footer */}
      <div className="px-3 py-2 bg-gray-50 text-xs text-gray-600 border-t border-[#D3DBDF]">
        {view === 'main' 
          ? `Product Type: ${selectedProduct?.type || 'Unknown'} • ${availableCategories.length} categories available`
          : `Select an option to customize your ${selectedProduct?.type || 'product'}`
        }
      </div>
    </div>
  );
};

export default DynamicClipartTab;