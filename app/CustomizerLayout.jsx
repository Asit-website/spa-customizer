"use client";

import { useEffect, useState } from "react";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import RightSmallPreview from "./components/RightSmallPreview";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { useFabricJSEditor, FabricJSCanvas } from "fabricjs-react";
import LayerContextMenu from "./components/LayerContextMenu";
import useCanvasContextMenu from "./hooks/useCanvasContextMenu";

const CustomizerLayout = ({ selectedProduct }) => {

  class SimpleLayerManager {
    constructor(canvas) {
      this.canvas = canvas;
      this.layerOrder = {
        COLOR: 0,     
        PATTERN: 1,    
        DESIGN: 2,    
        TEXT: 3,      
        PRODUCT: 4    
      };
    }

    setObjectLayer(obj) {
      if (!obj) return;

      let zIndex = 0;

      if (obj.isTshirtBase) {
        zIndex = this.layerOrder.PRODUCT; 
      } else if (obj.type === 'i-text') {
        zIndex = this.layerOrder.TEXT; 
      } else if (obj.type === 'image' && obj.isPattern) {
        zIndex = this.layerOrder.PATTERN; 
      } else if (obj.type === 'image' && !obj.isTshirtBase) {
        zIndex = this.layerOrder.DESIGN; 
      } else if (obj.isColorEffect) {
        zIndex = this.layerOrder.COLOR; 
      }

      obj.zIndex = zIndex;
      console.log(`✅ Object assigned layer: ${obj.type} -> zIndex: ${zIndex}`);
    }

    arrangeCanvasLayers() {
      const objects = this.canvas.getObjects();
      
      // Sort objects by their zIndex
      objects.sort((a, b) => {
        const aIndex = a.zIndex || 0;
        const bIndex = b.zIndex || 0;
        return aIndex - bIndex;
      });

      // Clear and re-add in correct order
      this.canvas._objects = [];
      objects.forEach(obj => {
        this.canvas._objects.push(obj);
      });

      this.canvas.renderAll();
      console.log('✅ Layer arrangement complete - Product on top');
    }
  }

  import("fabric").then(({ Canvas }) => {
    if (Canvas && !Canvas.prototype.updateZIndices) {
      Canvas.prototype.updateZIndices = function () {
        const objects = this.getObjects();
        objects.forEach((obj, index) => {
          obj.zIndex = index;
        });
      };
    }
  });

  // Text customization states
  const [customText, setCustomText] = useState("");
  const [textSize, setTextSize] = useState(28);
  const [textSpacing, setTextSpacing] = useState(0);
  const [textArc, setTextArc] = useState(0);

  // Text properties
  const [textColor, setTextColor] = useState("#000");
  const [fontFamily, setFontFamily] = useState("Ubuntu");
  const [fontStyle, setFontStyle] = useState("normal");
  const [textFlipX, setTextFlipX] = useState(false);
  const [textFlipY, setTextFlipY] = useState(false);

  // Image properties  
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [selectedColor, setSelectedColor] = useState({ color: "#ffffff", name: "White" });

  // UI states
  const [showAddModal, setShowAddModal] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showChatBox, setShowChatBox] = useState(false);

  // Save states
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);

  // Layer manager state
  const [layerManager, setLayerManager] = useState(null);

  const { editor, onReady } = useFabricJSEditor();

  const {
    contextMenu,
    closeContextMenu,
    handleDelete,
    handleLock,
    handleFlipHorizontal,
    handleFlipVertical,
    handleBringToFront,
    handleBringForward,
    handleSendBackward,
    handleSendToBack
  } = useCanvasContextMenu(editor);

  // Initialize layer manager when canvas is ready
  useEffect(() => {
    if (editor?.canvas && !layerManager) {
      const manager = new SimpleLayerManager(editor.canvas);
      setLayerManager(manager);
      console.log('🎯 Layer Manager initialized with correct order');
    }
  }, [editor?.canvas]);

  // Helper function to get current product data with customizations
  const getCurrentProductData = () => {
    if (!selectedProduct) return null;
    
    return {
      ...selectedProduct,
      text: customText,
      textSize,
      textSpacing,
      textArc,
      fontFamily,
      fontStyle,
      fill: textColor,
      imgflipX: flipX,
      imgflipY: flipY,
      flipX: textFlipX,
      flipY: textFlipY,
      opacity: 100,
      rotate: 0,
      alignment: "center",
      color: selectedColor.color,
    };
  };

  const handleColorChange = (colorObj) => {
    setSelectedColor(colorObj);
    updateCanvasColor(colorObj.color);
  };

  // Canvas background color change
  const updateCanvasColor = (color) => {
    if (!editor?.canvas) {
      console.error('❌ Canvas not available for color change');
      return;
    }
    
    console.log('🎨 Changing canvas background color to:', color);
    
    const canvas = editor.canvas;
    
    canvas.setBackgroundColor(color, () => {
      canvas.renderAll();
      console.log('✅ Canvas background color changed to:', color);
    });
  };

  const handleAddCustomText = () => {
    if (!editor || !customText.trim()) return;

    console.log('🔤 Adding custom text:', customText);

    import("fabric").then((fabric) => {
      const canvas = editor.canvas;

      // Remove existing text objects (but not emojis)
      const existingText = canvas.getObjects().filter(obj => obj.type === "i-text" && !obj.isEmoji);
      existingText.forEach(obj => canvas.remove(obj));

      const imageObj = canvas.getObjects().find((obj) => obj.type === "image" && obj.isTshirtBase);
      if (!imageObj) {
        console.error('❌ No base product image found');
        alert('Error: Product not loaded properly. Please refresh the page.');
        return;
      }

      const imageBounds = imageObj.getBoundingRect();
      const topRatio = selectedProduct?.textTopRatio || 3.5;

      const textObject = new fabric.IText(customText.slice(0, 9), {
        left: imageBounds.left + imageBounds.width / 2,
        top: imageBounds.top + imageBounds.height / topRatio,
        originX: "center",
        originY: "center",
        fontSize: textSize,
        fill: textColor,
        fontFamily: fontFamily,
        fontStyle: fontStyle,
        // FIXED: Make objects non-moveable
        selectable: false,
        evented: false,
        moveCursor: "default",
        hasControls: false,
        hasBorders: false,
        lockMovementX: true,
        lockMovementY: true,
        lockScalingX: true,
        lockScalingY: true,
        lockRotation: true,
        editable: false
      });

      canvas.add(textObject);

      // Apply layer management - IMMEDIATE arrangement
      if (layerManager) {
        layerManager.setObjectLayer(textObject);
        layerManager.arrangeCanvasLayers();
      }
      
      console.log('✅ Text added with proper layer (zIndex: 3) - Non-moveable');

      setCustomText("");
      setShowAddModal(false);
      setShowEditModal(true);
    });
  };

  const alignFabricObject = (_, canvas, alignment) => {
    const obj = canvas.getActiveObject();
    if (!obj) return;

    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const objWidth = obj.width * obj.scaleX;
    const objHeight = obj.height * obj.scaleY;

    switch (alignment) {
      case "left":
        obj.set({ left: objWidth / 2 });
        break;
      case "center":
        obj.set({ left: canvasWidth / 2 });
        break;
      case "right":
        obj.set({ left: canvasWidth - objWidth / 2 });
        break;
      case "top":
        obj.set({ top: objHeight / 2 });
        break;
      case "middle":
        obj.set({ top: canvasHeight / 2 });
        break;
      case "bottom":
        obj.set({ top: canvasHeight - objHeight / 2 });
        break;
    }

    obj.setCoords();
    canvas.renderAll();
  };

  const updateArrange = (action) => {
    if (!editor || !editor.canvas) return;

    const canvas = editor.canvas;
    const obj = canvas.getActiveObject();
    if (!obj) return;

    switch (action) {
      case "bringToFront":
        canvas.bringToFront(obj);
        break;
      case "sendToBack":
        canvas.sendToBack(obj);
        break;
      case "bringForward":
        canvas.bringForward(obj);
        break;
      case "sendBackward":
        canvas.sendBackwards(obj);
        break;
    }

    obj.setCoords();
    canvas.renderAll();
  };

  const addEmojiTextToCanvas = (emojiChar) => {
    if (!editor || !editor.canvas) return;

    import("fabric").then(({ IText }) => {
      const canvas = editor.canvas;
      const productImage = canvas.getObjects().find((obj) => obj.isTshirtBase);
      if (!productImage) return;

      const existingEmoji = canvas.getObjects().find(
        (obj) => obj.isEmoji === true
      );
      if (existingEmoji) {
        canvas.remove(existingEmoji);
      }

      const productBounds = productImage.getBoundingRect();

      const emojiText = new IText(emojiChar, {
        left: productBounds.left + productBounds.width / 2,
        top: productBounds.top + productBounds.height / 2,
        originX: "center",
        originY: "center",
        fontSize: 48,
        fill: "#000",
        // FIXED: Make objects non-moveable
        selectable: false,
        evented: false,
        hasBorders: false,
        hasControls: false,
        moveCursor: "default",
        lockMovementX: true,
        lockMovementY: true,
        lockScalingX: true,
        lockScalingY: true,
        lockRotation: true,
        editable: false
      });

      emojiText.isEmoji = true;

      canvas.add(emojiText);

      // Apply layer management - IMMEDIATE arrangement
      if (layerManager) {
        layerManager.setObjectLayer(emojiText);
        layerManager.arrangeCanvasLayers();
      }
      
      console.log('✅ Emoji added with proper layer (zIndex: 3) - Non-moveable');
    });
  };

  // Design function - Perfect merge with equal dimensions
  const handleAddDesignToCanvas = (url, position = "center", offsetX = 0, offsetY = 0) => {
    if (!editor || !url) return;

    import("fabric").then((fabric) => {
      const canvas = editor.canvas;
      const productImage = canvas.getObjects().find((obj) => obj.isTshirtBase);
      if (!productImage) return;

      const imgElement = new Image();
      imgElement.crossOrigin = "anonymous";
      imgElement.src = url;

      imgElement.onload = () => {
        // Get product dimensions for perfect matching
        const productBounds = productImage.getBoundingRect();
        
        // FIXED: Remove existing design before adding new one
        const existingDesign = canvas.getObjects().find(obj => obj.name === "design-image");
        if (existingDesign) {
          canvas.remove(existingDesign);
        }
        
        // Create design with EXACT same dimensions as product for perfect merge
        const imgInstance = new fabric.Image(imgElement, {
          left: productBounds.left,
          top: productBounds.top,
          originX: "left",
          originY: "top",
          // Scale to match product dimensions EXACTLY
          scaleX: productBounds.width / imgElement.width,
          scaleY: productBounds.height / imgElement.height,
          name: "design-image",
          // FIXED: Make objects non-moveable
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

        canvas.add(imgInstance);

        // Apply layer management - IMMEDIATE arrangement
        if (layerManager) {
          layerManager.setObjectLayer(imgInstance);
          layerManager.arrangeCanvasLayers();
        }
        
        console.log('✅ Design added with perfect merge dimensions (zIndex: 2) - Non-moveable');
      };
    });
  };

  // Pattern function - Perfect merge with equal dimensions + FIXED old pattern removal
  const handleAddPatternToCanvas = (url) => {
    if (!editor?.canvas || !url) return;

    const canvas = editor.canvas;

    import("fabric").then((fabric) => {
      const imgElement = new Image();
      imgElement.crossOrigin = "anonymous";
      imgElement.src = url;

      imgElement.onload = () => {
        // Get product dimensions for perfect matching
        const productImage = canvas.getObjects().find((obj) => obj.isTshirtBase);
        if (!productImage) return;

        const productBounds = productImage.getBoundingRect();

        // FIXED: Remove existing patterns before adding new one
        const existingPatterns = canvas.getObjects().filter(obj => obj.isPattern === true);
        existingPatterns.forEach(pattern => {
          canvas.remove(pattern);
        });

        // Create pattern with EXACT same dimensions as product for perfect merge
        const imgInstance = new fabric.Image(imgElement, {
          left: productBounds.left,
          top: productBounds.top,
          originX: "left",
          originY: "top",
          // Scale to match product dimensions EXACTLY
          scaleX: productBounds.width / imgElement.width,
          scaleY: productBounds.height / imgElement.height,
          name: "pattern-image",
          isPattern: true,
          // FIXED: Make objects non-moveable
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

        canvas.add(imgInstance);

        // Apply layer management - IMMEDIATE arrangement
        if (layerManager) {
          layerManager.setObjectLayer(imgInstance);
          layerManager.arrangeCanvasLayers();
        }
        
        console.log('✅ Pattern added with perfect merge dimensions (zIndex: 1) - Non-moveable');
      };
    });
  };

  const addIconToCanvas = async (iconData) => {
    if (!editor || !editor.canvas) return;

    try {
      const response = await fetch(`https://api.iconify.design/${iconData.name}.svg?color=%23000000&width=64&height=64`);
      const svgText = await response.text();
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
      const svgUrl = URL.createObjectURL(svgBlob);

      import("fabric").then(({ Image }) => {
        const canvas = editor.canvas;
        const productImage = canvas.getObjects().find((obj) => obj.isTshirtBase);
        if (!productImage) return;

        const productBounds = productImage.getBoundingRect();

        Image.fromURL(svgUrl, (img) => {
          img.set({
            left: productBounds.left + productBounds.width / 2,
            top: productBounds.top + productBounds.height / 2,
            originX: "center",
            originY: "center",
            scaleX: 0.8,
            scaleY: 0.8,
            // FIXED: Make objects non-moveable
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

          img.isIcon = true;
          img.iconData = iconData;
          img.name = "icon-image";

          canvas.add(img);

          // Apply layer management - IMMEDIATE arrangement
          if (layerManager) {
            layerManager.setObjectLayer(img);
            layerManager.arrangeCanvasLayers();
          }
          
          console.log('✅ Icon added with proper layer (zIndex: 2) - Non-moveable');

          URL.revokeObjectURL(svgUrl);
        });
      });

    } catch (error) {
      console.error('Failed to load icon:', error);
    }
  };

  const applySelectedDesign = (designData) => {
    if (!designData || !editor?.canvas) return;

    console.log('🎨 Applying user-selected design:', designData.name);

    handleAddDesignToCanvas(
      designData.url,
      designData.position,
      designData.offsetX,
      designData.offsetY
    );
  };

  // Initialize canvas with product - set proper dimensions
  useEffect(() => {
    if (!selectedProduct || !editor?.canvas) return;

    console.log(`🆕 Initializing canvas with perfect merge for product ${selectedProduct.id}`);

    const initializeCanvas = () => {
      import("fabric").then(({ Image }) => {
        editor.canvas.clear();

        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.src = selectedProduct.image;

        img.onload = () => {
          // Set consistent dimensions - this is the base size for all elements
          const targetWidth = selectedProduct.width || 300;
          const targetHeight = selectedProduct.height || (targetWidth * (img.height / img.width));
          
          const scaleX = targetWidth / img.width;
          const scaleY = targetHeight / img.height;

          const fabricImg = new Image(img, {
            left: editor.canvas.getWidth() / 2,
            top: editor.canvas.getHeight() / 2,
            isTshirtBase: true,
            originX: "center",
            originY: "center",
            scaleX: scaleX,
            scaleY: scaleY,
            selectable: false,
            evented: false,
            hasControls: false,
            hasBorders: false,
            lockMovementX: true,
            lockMovementY: true,
            lockScalingX: true,
            lockScalingY: true,
            lockRotation: true,
            flipX: flipX,
            flipY: flipY
          });

          fabricImg.customId = selectedProduct.id;
          
          editor.canvas.add(fabricImg);

          // Apply layer management - IMMEDIATE arrangement
          if (layerManager) {
            layerManager.setObjectLayer(fabricImg);
            layerManager.arrangeCanvasLayers();
          }
          
          fabricImg.setCoords();
          editor.canvas.renderAll();
          console.log(`✅ Product loaded with dimensions: ${targetWidth}x${targetHeight} (zIndex: 4)`);
        };

        img.onerror = () => {
          console.error('Failed to load product image:', selectedProduct.image);
        };
      });
    };

    const timeoutId = setTimeout(initializeCanvas, 100);
    return () => clearTimeout(timeoutId);
  }, [selectedProduct?.id, editor, layerManager]);

  // FIXED: Setup canvas event handlers - No selection allowed
  useEffect(() => {
    if (!editor || !editor.canvas) return;

    const canvas = editor.canvas;

    // FIXED: Disable selection completely
    canvas.selection = false;
    canvas.hoverCursor = 'default';
    canvas.defaultCursor = 'default';

    const handleObjectMoving = (e) => {
      // Product should stay in center
      if (e.target.isTshirtBase) {
        e.target.set({
          left: canvas.getWidth() / 2,
          top: canvas.getHeight() / 2
        });
        e.target.setCoords();
        return;
      }
      
      // Prevent any object from moving
      e.preventDefault();
      return false;
    };

    const handleObjectModified = (e) => {
      // Prevent any modifications
      e.preventDefault();
      return false;
    };

    const handleSelectionCreated = (e) => {
      // Prevent any selections
      canvas.discardActiveObject();
      canvas.renderAll();
    };

    // FIXED: Prevent canvas click from affecting layers
    const handleCanvasClick = (e) => {
      // Maintain layer order after any interaction
      if (layerManager) {
        setTimeout(() => {
          layerManager.arrangeCanvasLayers();
        }, 10);
      }
    };

    canvas.on('object:moving', handleObjectMoving);
    canvas.on('object:scaling', handleObjectMoving);
    canvas.on('object:rotating', handleObjectMoving);
    canvas.on('object:modified', handleObjectModified);
    canvas.on('selection:created', handleSelectionCreated);
    canvas.on('selection:updated', handleSelectionCreated);
    canvas.on('mouse:down', handleCanvasClick);

    return () => {
      canvas.off('object:moving', handleObjectMoving);
      canvas.off('object:scaling', handleObjectMoving);
      canvas.off('object:rotating', handleObjectMoving);
      canvas.off('object:modified', handleObjectModified);
      canvas.off('selection:created', handleSelectionCreated);
      canvas.off('selection:updated', handleSelectionCreated);
      canvas.off('mouse:down', handleCanvasClick);
    };
  }, [editor, selectedProduct?.id, layerManager]);

  // Update text properties for active text object
  useEffect(() => {
    if (!editor || !editor.canvas) return;

    const canvas = editor.canvas;
    const activeObject = canvas.getActiveObject();

    if (activeObject && activeObject.type === "i-text") {
      activeObject.set({
        fill: textColor,
        fontFamily: fontFamily,
        fontStyle: fontStyle,
        flipX: textFlipX,
        flipY: textFlipY
      });
      canvas.renderAll();
    }
  }, [textColor, fontFamily, fontStyle, textFlipX, textFlipY, editor]);

  const baseUrl = "https://my-backend-blond.vercel.app";

  const uploadToCloudinaryImg = async ({ image }) => {
    try {
      const formdata = new FormData();
      formdata.append("image", image);

      const response = await fetch(`${baseUrl}/uploadfile`, {
        method: "POST",
        body: formdata,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!editor?.canvas) {
      alert('Canvas not ready!');
      return;
    }

    if (!selectedProduct) {
      alert('No product selected!');
      return;
    }

    setIsSaving(true);

    try {
      const screenshotDataURL = editor.canvas.toDataURL('image/png', 0.8);
      
      if (!screenshotDataURL || screenshotDataURL === 'data:,') {
        throw new Error('Failed to capture design screenshot');
      }

      let screenshotCloudinaryUrl = screenshotDataURL;

      try {
        const response = await fetch(screenshotDataURL);
        const blob = await response.blob();
        const file = new File([blob], `design-screenshot-${Date.now()}.png`, {
          type: 'image/png'
        });

        const cloudinaryResponse = await uploadToCloudinaryImg({ image: file });

        if (cloudinaryResponse && cloudinaryResponse.url) {
          screenshotCloudinaryUrl = cloudinaryResponse.url;
        }
      } catch (uploadError) {
        console.error("Screenshot upload failed:", uploadError);
      }

      const canvasObjects = editor.canvas.getObjects().map(obj => {
        const baseData = {
          type: obj.type,
          left: obj.left,
          top: obj.top,
          scaleX: obj.scaleX,
          scaleY: obj.scaleY,
          angle: obj.angle,
          opacity: obj.opacity,
          flipX: obj.flipX,
          flipY: obj.flipY,
          originX: obj.originX,
          originY: obj.originY,
          selectable: obj.selectable,
          evented: obj.evented,
          visible: obj.visible,
          zIndex: obj.zIndex || 0
        };

        if (obj.type === 'i-text') {
          return {
            ...baseData,
            text: obj.text,
            fontSize: obj.fontSize,
            fontFamily: obj.fontFamily,
            fontStyle: obj.fontStyle,
            fontWeight: obj.fontWeight,
            fill: obj.fill,
            textAlign: obj.textAlign,
            charSpacing: obj.charSpacing,
            lineHeight: obj.lineHeight,
            isEmoji: obj.isEmoji || false,
            editable: obj.editable
          };
        } else if (obj.type === 'image') {
          return {
            ...baseData,
            src: obj.getSrc ? obj.getSrc() : obj._originalElement?.src,
            isTshirtBase: obj.isTshirtBase || false,
            isPattern: obj.isPattern || false,
            name: obj.name,
            isIcon: obj.isIcon || false,
            hasControls: obj.hasControls,
            hasBorders: obj.hasBorders,
            lockMovementX: obj.lockMovementX,
            lockMovementY: obj.lockMovementY,
            lockScalingX: obj.lockScalingX,
            lockScalingY: obj.lockScalingY,
            lockRotation: obj.lockRotation
          };
        }

        return baseData;
      });

      const currentProduct = getCurrentProductData();
      
      const saveData = {
        timestamp: new Date().toISOString(),
        product: {
          id: selectedProduct.id,
          image: selectedProduct.image,
          description: selectedProduct.description,
          size: selectedProduct.size,
          color: selectedColor.color,
          width: selectedProduct.width,
          textTopRatio: selectedProduct.textTopRatio
        },
        canvas: {
          width: editor.canvas.getWidth(),
          height: editor.canvas.getHeight(),
          objects: canvasObjects,
          backgroundColor: editor.canvas.backgroundColor || selectedColor.color
        },
        customizations: {
          text: customText,
          textSize: textSize,
          textSpacing: textSpacing,
          textArc: textArc,
          textColor: textColor,
          fontFamily: fontFamily,
          fontStyle: fontStyle,
          textFlipX: textFlipX,
          textFlipY: textFlipY,
          flipX: flipX,
          flipY: flipY,
          selectedColor: selectedColor
        },
        screenshot: screenshotCloudinaryUrl,
        clippingSystemUsed: 'none',
        layerSystemUsed: 'perfect-merge-fixed-layers'
      };

      let savedProductId = null;

      try {
        const response = await fetch('https://customizer-backend-ttv5.onrender.com/api/save-product', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(saveData)
        });

        if (response.ok) {
          const result = await response.json();
          savedProductId = result._id || result.data?._id || result.product?._id;
          
          if (savedProductId) {
            setCurrentProductId(savedProductId);
          }
        }
      } catch (apiError) {
        console.error("Database save error:", apiError);
      }

      try {
        const response = await fetch(screenshotDataURL);
        const blob = await response.blob();
        const viewableURL = URL.createObjectURL(blob);
        window.open(viewableURL, '_blank');
      } catch (err) {
        console.log("Screenshot preview failed:", err);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      const successMessage = `Fixed layer design saved! 📸\n\nMongoDB ID: ${savedProductId}`;
      alert(successMessage);

      return {
        success: true,
        productId: savedProductId
      };

    } catch (error) {
      console.error('Save error:', error);
      alert('Save failed: ' + error.message);
      return { success: false, error: error.message };
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center bg-gray-100 relative max-w-[1720px] mx-auto">

      <Topbar
        setShowSidebar={setShowSidebar}
        onSave={handleSave}
        isSaving={isSaving}
      />

      {(showSidebar && selectedProduct) && (
        <Sidebar
          bringForward={() => updateArrange('bringForward')}
          editor={editor}
          selectedProduct={selectedProduct}
          customText={customText}
          textSize={textSize}
          textSpacing={textSpacing}
          textArc={textArc}
          setTextFontFamily={setFontFamily}
          setFontStyle={setFontStyle}
          setTextColor={setTextColor}
          setFlipX={setFlipX}
          setFlipY={setFlipY}
          setTextFlipX={setTextFlipX}
          setTextFlipY={setTextFlipY}
          handleAddCustomText={handleAddCustomText}
          setCustomText={setCustomText}
          showAddModal={showAddModal}
          showEditModal={showEditModal}
          setShowAddModal={setShowAddModal}
          setShowEditModal={setShowEditModal}
          setTextSize={setTextSize}
          setTextSpacing={setTextSpacing}
          setTextArc={setTextArc}
          handleColorChange={handleColorChange}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          addEmojiTextToCanvas={addEmojiTextToCanvas}
          updateArrange={updateArrange}
          setChangeTextColor={setTextColor}
          setChangeFontFamily={setFontFamily}
          setChangeFontStyle={setFontStyle}
          setChangeFlipX={setFlipX}
          setChangeFlipy={setFlipY}
          alignFabricObject={alignFabricObject}
          setChangeTextFlipX={setTextFlipX}
          setChangeTextFlipY={setTextFlipY}
          handleAddDesignToCanvas={handleAddDesignToCanvas}
          addIconToCanvas={addIconToCanvas}
          handleAddPatternToCanvas={handleAddPatternToCanvas}
          applySelectedDesign={applySelectedDesign}
        />
      )}

      {selectedProduct && (
        <RightSmallPreview 
          currentProduct={getCurrentProductData()}
        />
      )}

      {selectedProduct && (
        <FabricJSCanvas 
          className="canvas-container" 
          onReady={onReady}
          editor={editor}
          savedProductId={currentProductId} 
        />
      )}

      {selectedProduct && (
        <div className="bottom-7 left-1/2 transform -translate-x-1/2 absolute flex items-center gap-2 border border-[#D3DBDF] bg-white p-3.5 rounded-lg">
          <div className="flex items-center gap-2">
            <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749345256/undo_kp3eto.png" alt="undo" />
            <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749345256/undo_kp3eto.png" alt="redo" className="transform scale-x-[-1]" />
          </div>
          <hr className="rotate-90 border-t border-[#D3DBDF] h-px w-[20px]" />
          <div className="flex items-center gap-3">
            <FaMinus />
            <span>100%</span>
            <FaPlus />
          </div>
        </div>
      )}

      <LayerContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        isVisible={contextMenu.isVisible}
        selectedObject={contextMenu.selectedObject}
        onClose={closeContextMenu}
        onDelete={handleDelete}
        onLock={handleLock}
        onFlipHorizontal={handleFlipHorizontal}
        onFlipVertical={handleFlipVertical}
        onBringToFront={handleBringToFront}
        onBringForward={handleBringForward}
        onSendBackward={handleSendBackward}
        onSendToBack={handleSendToBack}
      />

      {saveSuccess && (
        <div className="fixed top-20 right-7 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Fixed layer design saved!</span>
          </div>
        </div>
      )}

      {showChatBox && (
        <div className="w-[350px] h-[430px] absolute right-7 bottom-28 rounded-xl shadow-lg bg-white border border-gray-200 overflow-hidden z-70">
          <div className="bg-gradient-to-b from-[#1B2653] to-[#192248] text-white px-4 py-3">
            <div className="flex items-center justify-between">
              <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749345784/qqchat_jn7bok.png" alt="" />
              <img onClick={() => setShowChatBox(false)} src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749341803/Vector_hm0yzo.png" alt="" className="cursor-pointer" />
            </div>
            <div className="mt-3 mb-5">
              <h2 className="text-[22px] font-semibold">Customizer's Help Center</h2>
              <p className="text-[14px] text-white/70">How can we help you today?</p>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="px-4 py-3 hover:bg-gray-50 flex items-center justify-between cursor-pointer">
                  <span className="text-[16px] text-gray-800 font-medium">How customizer work?</span>
                  <span className="text-gray-400">›</span>
                </div>
                <hr className="border-t border-[#D3DBDF] h-px" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div onClick={() => setShowChatBox(!showChatBox)} className="flex items-center justify-center p-5 rounded-full bg-[#3559C7] absolute right-7 bottom-7 cursor-pointer">
        <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749345784/qqchat_jn7bok.png" alt="chat" />
      </div>

    </div>
  );
};

export default CustomizerLayout;