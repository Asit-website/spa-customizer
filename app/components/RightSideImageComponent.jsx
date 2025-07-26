import React, { useState, useRef } from 'react';
import { FaUpload, FaArrowsAlt, FaSearchPlus, FaSearchMinus, FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight, FaTimes } from 'react-icons/fa';

const RightSideImageUpload = ({ 
  editor, 
  selectedProduct, 
  setShowrightImage,
  layerManager 
}) => {
  const [rightSideImage, setRightSideImage] = useState(null);
  const [imageScale, setImageScale] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const imageUrl = e.target.result;
      setRightSideImage(imageUrl);
      addRightSideImageToCanvas(imageUrl);
      setIsUploading(false);
    };
    
    reader.readAsDataURL(file);
  };

  // Add image to canvas (right side only) with proper clipping
  const addRightSideImageToCanvas = (url) => {
    if (!editor?.canvas || !url) return;

    const canvas = editor.canvas;

    import("fabric").then((fabric) => {
      const imgElement = new Image();
      imgElement.crossOrigin = "anonymous";
      imgElement.src = url;

      imgElement.onload = () => {
        const productImage = canvas.getObjects().find((obj) => obj.isTshirtBase);
        if (!productImage) return;

        const productBounds = productImage.getBoundingRect();

        // Remove existing right side image
        const existingRightElements = canvas.getObjects().filter(obj => 
          obj.isRightSideImage === true
        );
        existingRightElements.forEach(element => {
          canvas.remove(element);
        });

        // Create the uploaded image positioned in the right half
        const imgInstance = new fabric.Image(imgElement, {
          left: productBounds.left + (productBounds.width * 0.75) + imagePosition.x, // Center in right half + offset
          top: productBounds.top + (productBounds.height * 0.5) + imagePosition.y, // Center vertically + offset
          originX: "center",
          originY: "center",
          scaleX: imageScale * 0.3, // Base scale + user adjustment
          scaleY: imageScale * 0.3,
          name: "right-side-uploaded-image",
          isRightSideImage: true,
          selectable: false,
          evented: false,
          hasControls: false,
          hasBorders: false,
          moveCursor: "default",
          lockMovementX: true,
          lockMovementY: true,
          lockScalingX: true,
          lockScalingY: true,
          lockRotation: true
        });

        // Create a clipping path that masks the left 50% of the product
        // This ensures the image only appears on the right 50%
        const clipPath = new fabric.Rect({
          left: productBounds.left + (productBounds.width * 0.5), // Start from middle
          top: productBounds.top,
          width: productBounds.width * 0.5, // Right 50% only
          height: productBounds.height,
          absolutePositioned: true
        });

        // Apply the clip path to the image
        imgInstance.clipPath = clipPath;

        canvas.add(imgInstance);

        // Apply layer management - should be on top layer
        if (layerManager) {
          layerManager.setObjectLayer(imgInstance);
          layerManager.arrangeCanvasLayers();
        }

        console.log('✅ Right side image added with proper clipping to right 50% (top layer)');
      };
    });
  };

  // Update image scale
  const handleScaleChange = (newScale) => {
    setImageScale(newScale);
    updateRightSideImage({ scale: newScale });
  };

  // Update image position
  const handlePositionChange = (direction, amount = 10) => {
    let newPosition = { ...imagePosition };
    
    switch (direction) {
      case 'up':
        newPosition.y -= amount;
        break;
      case 'down':
        newPosition.y += amount;
        break;
      case 'left':
        newPosition.x -= amount;
        break;
      case 'right':
        newPosition.x += amount;
        break;
    }
    
    setImagePosition(newPosition);
    updateRightSideImage({ position: newPosition });
  };

  // Update existing image on canvas
  const updateRightSideImage = ({ scale, position }) => {
    if (!editor?.canvas) return;

    const canvas = editor.canvas;
    const rightImage = canvas.getObjects().find(obj => obj.isRightSideImage === true);
    
    if (!rightImage) return;

    const productImage = canvas.getObjects().find((obj) => obj.isTshirtBase);
    if (!productImage) return;

    const productBounds = productImage.getBoundingRect();

    // Update scale if provided
    if (scale !== undefined) {
      rightImage.set({
        scaleX: scale * 0.5, // Updated to match the addRightSideImageToCanvas scale
        scaleY: scale * 0.5
      });
    }

    // Update position if provided
    if (position !== undefined) {
      rightImage.set({
        left: productBounds.left + (productBounds.width * 0.75) + position.x,
        top: productBounds.top + (productBounds.height * 0.5) + position.y
      });
    }

    rightImage.setCoords();
    canvas.renderAll();
  };

  // Remove right side image
  const removeRightSideImage = () => {
    if (!editor?.canvas) return;

    const canvas = editor.canvas;
    const rightImage = canvas.getObjects().find(obj => obj.isRightSideImage === true);
    
    if (rightImage) {
      canvas.remove(rightImage);
      canvas.renderAll();
    }

    setRightSideImage(null);
    setImageScale(1);
    setImagePosition({ x: 0, y: 0 });
  };

  return (
    <div className="bg-white rounded-lg border p-3 border-[#D3DBDF] w-80 h-fit max-h-[500px] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Right Side Upload</h3>
        <div className="w-6 h-6"></div> {/* Spacer for balance */}
      </div>
      
      {/* Upload Section */}
      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50"
        >
          <FaUpload className="text-gray-500" />
          <span className="text-gray-600 text-sm">
            {isUploading ? 'Uploading...' : 'Upload for Right Side'}
          </span>
        </button>
      </div>

      {/* Controls - Only show when image is uploaded */}
      {rightSideImage && (
        <div className="space-y-4">
          {/* Preview */}
          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
            <img 
              src={rightSideImage} 
              alt="Right side preview" 
              className="w-10 h-10 object-cover rounded border"
            />
            <span className="text-xs text-gray-600 flex-1">Uploaded Image</span>
            <button
              onClick={removeRightSideImage}
              className="text-red-500 hover:text-red-700 p-1"
            >
              <FaTimes />
            </button>
          </div>

          {/* Scale Controls */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Size: {Math.round(imageScale * 100)}%
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleScaleChange(Math.max(0.2, imageScale - 0.1))}
                className="p-1.5 bg-gray-100 rounded hover:bg-gray-200 text-sm"
              >
                <FaSearchMinus />
              </button>
              <input
                type="range"
                min="0.2"
                max="3"
                step="0.1"
                value={imageScale}
                onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                className="flex-1"
              />
              <button
                onClick={() => handleScaleChange(Math.min(3, imageScale + 0.1))}
                className="p-1.5 bg-gray-100 rounded hover:bg-gray-200 text-sm"
              >
                <FaSearchPlus />
              </button>
            </div>
          </div>

          {/* Position Controls */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Position Controls
            </label>
            <div className="grid grid-cols-3 gap-1">
              <div></div>
              <button
                onClick={() => handlePositionChange('up')}
                className="p-2 bg-gray-100 rounded hover:bg-gray-200 flex justify-center"
              >
                <FaArrowUp className="text-sm" />
              </button>
              <div></div>
              
              <button
                onClick={() => handlePositionChange('left')}
                className="p-2 bg-gray-100 rounded hover:bg-gray-200 flex justify-center"
              >
                <FaArrowLeft className="text-sm" />
              </button>
              <div className="flex items-center justify-center">
                <FaArrowsAlt className="text-gray-400 text-sm" />
              </div>
              <button
                onClick={() => handlePositionChange('right')}
                className="p-2 bg-gray-100 rounded hover:bg-gray-200 flex justify-center"
              >
                <FaArrowRight className="text-sm" />
              </button>
              
              <div></div>
              <button
                onClick={() => handlePositionChange('down')}
                className="p-2 bg-gray-100 rounded hover:bg-gray-200 flex justify-center"
              >
                <FaArrowDown className="text-sm" />
              </button>
              <div></div>
            </div>
          </div>

          {/* Fine Position Controls */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">X: {imagePosition.x}</label>
              <input
                type="range"
                min="-100"
                max="100"
                value={imagePosition.x}
                onChange={(e) => {
                  const newPos = { x: parseInt(e.target.value), y: imagePosition.y };
                  setImagePosition(newPos);
                  updateRightSideImage({ position: newPos });
                }}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Y: {imagePosition.y}</label>
              <input
                type="range"
                min="-100"
                max="100"
                value={imagePosition.y}
                onChange={(e) => {
                  const newPos = { x: imagePosition.x, y: parseInt(e.target.value) };
                  setImagePosition(newPos);
                  updateRightSideImage({ position: newPos });
                }}
                className="w-full"
              />
            </div>
          </div>

          {/* Info */}
          <div className="text-xs text-gray-500 p-2 bg-blue-50 rounded">
            💡 Image appears behind product on right 50% - shows through transparent areas
          </div>
        </div>
      )}
    </div>
  );
};

export default RightSideImageUpload;