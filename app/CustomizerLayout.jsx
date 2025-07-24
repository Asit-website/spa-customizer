"use client";

import { useEffect, useState } from "react";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import RightSmallPreview from "./components/RightSmallPreview";
import CenterCanvas3D from "./components/CenterCanvas3D";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { useFabricJSEditor } from "fabricjs-react";
import LayerContextMenu from "./components/LayerContextMenu";
import useCanvasContextMenu from "./hooks/useCanvasContextMenu";
import tripo3DService from './services/tripo3DService';

const CustomizerLayout = ({ selectedProduct }) => {

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
  const [savingWith3D, setSavingWith3D] = useState(false);
  const [save3DProgress, setSave3DProgress] = useState('');
  const [currentProductId, setCurrentProductId] = useState(null);

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

  const createTshirtMask = (imageObj, callback) => {
    if (!imageObj) return;

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    const img = imageObj.getElement();
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;

    tempCtx.drawImage(img, 0, 0);

    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;

    let minX = tempCanvas.width, minY = tempCanvas.height;
    let maxX = 0, maxY = 0;

    for (let y = 0; y < tempCanvas.height; y++) {
      for (let x = 0; x < tempCanvas.width; x++) {
        const alpha = data[(y * tempCanvas.width + x) * 4 + 3];
        if (alpha > 0) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    const maskCanvas = document.createElement('canvas');
    const maskCtx = maskCanvas.getContext('2d');
    maskCanvas.width = tempCanvas.width;
    maskCanvas.height = tempCanvas.height;

    maskCtx.fillStyle = 'white';
    for (let y = 0; y < tempCanvas.height; y++) {
      for (let x = 0; x < tempCanvas.width; x++) {
        const alpha = data[(y * tempCanvas.width + x) * 4 + 3];
        if (alpha > 0) {
          maskCtx.fillRect(x, y, 1, 1);
        }
      }
    }

    callback(maskCanvas.toDataURL(), {
      minX, minY, maxX, maxY,
      width: maxX - minX,
      height: maxY - minY
    });
  };

  const applyClippingToObject = (obj, imageObj) => {
    if (!imageObj || !obj) return;

    import("fabric").then(({ Image }) => {
      createTshirtMask(imageObj, (maskDataUrl, bounds) => {
        const maskImg = new window.Image();
        maskImg.onload = () => {
          const imageBounds = imageObj.getBoundingRect();

          const maskFabricImg = new Image(maskImg, {
            left: imageBounds.left - obj.left,
            top: imageBounds.top - obj.top,
            scaleX: imageObj.scaleX,
            scaleY: imageObj.scaleY,
            originX: 'left',
            originY: 'top',
            absolutePositioned: false
          });

          obj.clipPath = maskFabricImg;
          obj.dirty = true;
          editor.canvas.requestRenderAll();
        };
        maskImg.src = maskDataUrl;
      });
    });
  };

  const updateClippingForObject = (obj) => {
    const canvas = editor?.canvas;
    if (!canvas || !obj || obj.isTshirtBase) return;

    const imageObj = canvas.getObjects().find((o) => o.type === "image" && o.isTshirtBase);
    if (imageObj) {
      applyClippingToObject(obj, imageObj);
    }
  };

  const constrainObjectToProduct = (obj, productImage) => {
    if (!obj || !productImage || obj.isTshirtBase) return;

    const productBounds = productImage.getBoundingRect();
    const objBounds = obj.getBoundingRect();

    const padding = 10;
    const minX = productBounds.left + padding;
    const maxX = productBounds.left + productBounds.width - padding;
    const minY = productBounds.top + padding;
    const maxY = productBounds.top + productBounds.height - padding;

    const objWidth = objBounds.width;
    const objHeight = objBounds.height;

    let newLeft = obj.left;
    let newTop = obj.top;

    if (objBounds.left < minX) {
      newLeft = minX + objWidth / 2;
    } else if (objBounds.left + objWidth > maxX) {
      newLeft = maxX - objWidth / 2;
    }

    if (objBounds.top < minY) {
      newTop = minY + objHeight / 2;
    } else if (objBounds.top + objHeight > maxY) {
      newTop = maxY - objHeight / 2;
    }

    obj.set({
      left: newLeft,
      top: newTop
    });

    obj.setCoords();
  };

  const handleColorChange = (colorObj) => {
    setSelectedColor(colorObj);
    updateTshirtColor(colorObj.color);
  };

  const updateTshirtColor = (color) => {
    if (!editor?.canvas) {
      console.error('❌ Canvas not available for color change');
      return;
    }
    
    console.log('🎨 Changing t-shirt color to:', color);
    
    const canvas = editor.canvas;
    const baseLayer = canvas.getObjects().find((obj) => obj.type === "image" && obj.isTshirtBase);
    
    if (!baseLayer) {
      console.error('❌ No base layer found for color change');
      return;
    }
    
    import("fabric").then(({ filters }) => {
      baseLayer.filters = [
        new filters.BlendColor({
          color: color,
          mode: "multiply",
          alpha: 1,
        }),
      ];
      baseLayer.applyFilters();
      
      // Ensure base layer remains locked after color change
      baseLayer.set({
        selectable: false,
        evented: false,
        lockMovementX: true,
        lockMovementY: true,
        lockScalingX: true,
        lockScalingY: true,
        lockRotation: true,
        hasControls: false,
        hasBorders: false
      });
      
      baseLayer.setCoords();
      canvas.renderAll();
      console.log('✅ Color changed and base layer re-locked');
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

      console.log('📍 Image bounds:', imageBounds);
      console.log('📏 Text position ratio:', topRatio);

      const textObject = new fabric.IText(customText.slice(0, 9), {
        left: imageBounds.left + imageBounds.width / 2,
        top: imageBounds.top + imageBounds.height / topRatio,
        originX: "center",
        originY: "center",
        fontSize: textSize,
        fill: textColor,
        fontFamily: fontFamily,
        fontStyle: fontStyle,
        selectable: true,
        evented: true,
        moveCursor: "move",
        hasControls: true,
        hasBorders: true,
        lockMovementX: false,
        lockMovementY: false,
        lockScalingX: false,
        lockScalingY: false,
        lockRotation: false,
        editable: true
      });

      textObject.setControlsVisibility({
        mt: true, mb: true, ml: true, mr: true,
        bl: true, br: true, tl: true, tr: true,
        mtr: true
      });

      canvas.add(textObject);
      canvas.setActiveObject(textObject);

      // Apply constraints after a small delay
      setTimeout(() => {
        constrainObjectToProduct(textObject, imageObj);
        applyClippingToObject(textObject, imageObj);
        canvas.renderAll();
        console.log('✅ Text added successfully');
      }, 100);

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

    const objects = canvas.getObjects();
    const currentIndex = objects.indexOf(obj);

    if (currentIndex === -1) return;

    switch (action) {
      case "bringToFront":
        if (currentIndex < objects.length - 1) {
          canvas.remove(obj);
          canvas.add(obj);
        }
        break;

      case "sendToBack":
        if (currentIndex > 0) {
          canvas.remove(obj);
          const newObjects = [obj, ...objects.filter(o => o !== obj)];
          canvas._objects = newObjects;
          canvas.renderAll();
        }
        break;

      case "bringForward":
        if (currentIndex < objects.length - 1) {
          const nextIndex = currentIndex + 1;
          [objects[currentIndex], objects[nextIndex]] = [objects[nextIndex], objects[currentIndex]];
          canvas.renderAll();
        }
        break;

      case "sendBackward":
        if (currentIndex > 0) {
          const prevIndex = currentIndex - 1;
          [objects[currentIndex], objects[prevIndex]] = [objects[prevIndex], objects[currentIndex]];
          canvas.renderAll();
        }
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
        selectable: true,
        evented: true,
        hasBorders: true,
        hasControls: true,
        moveCursor: "move",
        lockMovementX: false,
        lockMovementY: false,
        lockScalingX: false,
        lockScalingY: false,
        lockRotation: false,
        editable: true
      });

      emojiText.isEmoji = true;

      canvas.add(emojiText);
      canvas.bringToFront(emojiText);
      canvas.setActiveObject(emojiText);

      constrainObjectToProduct(emojiText, productImage);
      applyClippingToObject(emojiText, productImage);
      canvas.requestRenderAll();
    });
  };

  const handleAddDesignToCanvas = (url, position = "center", offsetX = 0, offsetY = 0, targetWidth = 80, targetHeight = 80, quality = 0.8) => {
    if (!editor || !url) return;

    import("fabric").then((fabric) => {
      const canvas = editor.canvas;
      const productImage = canvas.getObjects().find((obj) => obj.isTshirtBase);
      if (!productImage) return;

      const imageBounds = productImage.getBoundingRect();
      const imgElement = new Image();
      imgElement.crossOrigin = "anonymous";
      imgElement.src = url;

      imgElement.onload = () => {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        const aspectRatio = imgElement.width / imgElement.height;
        let newWidth = targetWidth;
        let newHeight = targetHeight;

        if (aspectRatio > 1) {
          newHeight = targetWidth / aspectRatio;
        } else {
          newWidth = targetHeight * aspectRatio;
        }

        tempCanvas.width = newWidth;
        tempCanvas.height = newHeight;
        tempCtx.clearRect(0, 0, newWidth, newHeight);
        tempCtx.imageSmoothingEnabled = true;
        tempCtx.imageSmoothingQuality = 'high';
        tempCtx.drawImage(imgElement, 0, 0, newWidth, newHeight);

        const resizedDataUrl = tempCanvas.toDataURL('image/png', quality);

        const resizedImg = new Image();
        resizedImg.onload = () => {
          const maxWidth = imageBounds.width * 0.4;
          const maxHeight = imageBounds.height * 0.4;
          const scale = Math.min(maxWidth / resizedImg.width, maxHeight / resizedImg.height);

          const imgInstance = new fabric.Image(resizedImg, {
            originX: "center",
            originY: "center",
            scaleX: scale,
            scaleY: scale,
            name: "design-image",
            selectable: true,
            evented: true,
            hasControls: true,
            hasBorders: true,
            moveCursor: "move",
            lockMovementX: false,
            lockMovementY: false,
            lockScalingX: false,
            lockScalingY: false,
            lockRotation: false
          });

          const existing = canvas.getObjects().find(obj => obj.name === "design-image");
          if (existing) canvas.remove(existing);

          let left = imageBounds.left + imageBounds.width / 2;
          let top = imageBounds.top + imageBounds.height / 2;

          switch (position) {
            case "top-left":
              left = imageBounds.left + maxWidth / 2;
              top = imageBounds.top + maxHeight / 2;
              break;
            case "top-right":
              left = imageBounds.left + imageBounds.width - maxWidth / 2;
              top = imageBounds.top + maxHeight / 2;
              break;
            case "bottom-left":
              left = imageBounds.left + maxWidth / 2;
              top = imageBounds.top + imageBounds.height - maxHeight / 2;
              break;
            case "bottom-right":
              left = imageBounds.left + imageBounds.width - maxWidth / 2;
              top = imageBounds.top + imageBounds.height - maxHeight / 2;
              break;
            case "top-center":
              top = imageBounds.top + maxHeight / 2;
              break;
            case "bottom-center":
              top = imageBounds.top + imageBounds.height - maxHeight / 2;
              break;
            case "center-top":
              top = imageBounds.top + imageBounds.height * 0.3;
              break;
            case "center-left":
              left = imageBounds.left + maxWidth / 2;
              break;
            case "center-right":
              left = imageBounds.left + imageBounds.width - maxWidth / 2;
              break;
            case "center":
            default:
              break;
          }

          imgInstance.set({
            left: left + offsetX,
            top: top + offsetY
          });

          canvas.add(imgInstance);
          canvas.bringToFront(imgInstance);
          canvas.setActiveObject(imgInstance);

          constrainObjectToProduct(imgInstance, productImage);
          applyClippingToObject(imgInstance, productImage);
          canvas.requestRenderAll();
        };

        resizedImg.src = resizedDataUrl;
      };
    });
  };

  const handleAddPatternToCanvas = (url, position = "bottom") => {
    if (!handleAddDesignToCanvas || !editor?.canvas || !url) {
      return;
    }

    const canvas = editor.canvas;

    let baseBounds;
    try {
      const baseImage = canvas.getObjects().find(obj =>
        obj.isTshirtBase || obj.type === 'image' || (obj.width > 200 && obj.height > 200)
      );

      if (baseImage?.getBoundingRect) {
        baseBounds = baseImage.getBoundingRect();
      } else {
        baseBounds = {
          left: canvas.getWidth() * 0.2,
          top: canvas.getHeight() * 0.1,
          width: canvas.getWidth() * 0.6,
          height: canvas.getHeight() * 0.8
        };
      }
    } catch (error) {
      baseBounds = {
        left: canvas.getWidth() * 0.2,
        top: canvas.getHeight() * 0.1,
        width: canvas.getWidth() * 0.6,
        height: canvas.getHeight() * 0.8
      };
    }

    const targetWidth = baseBounds.width * 0.9;
    const targetHeight = baseBounds.height * 0.5;

    let offsetY = 0;
    if (position === 'top') {
      offsetY = -(baseBounds.height * 0.25);
    } else {
      offsetY = (baseBounds.height * 0.25);
    }

    try {
      canvas.getObjects()
        .filter(obj => obj.name && (obj.name.includes('pattern') || obj.name.includes('design-image')))
        .forEach(obj => canvas.remove(obj));
    } catch (error) {
      console.warn("Pattern cleanup error:", error);
    }

    try {
      handleAddDesignToCanvas(
        url,
        "center",
        0,
        offsetY,
        targetWidth,
        targetHeight,
        0.9
      );
    } catch (error) {
      console.error("Pattern addition failed:", error);
    }
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
            selectable: true,
            evented: true,
            hasControls: true,
            hasBorders: true,
            moveCursor: "move",
            lockMovementX: false,
            lockMovementY: false,
            lockScalingX: false,
            lockScalingY: false,
            lockRotation: false
          });

          img.isIcon = true;
          img.iconData = iconData;
          img.name = "icon-image";

          canvas.add(img);
          canvas.bringToFront(img);
          canvas.setActiveObject(img);

          constrainObjectToProduct(img, productImage);
          applyClippingToObject(img, productImage);
          canvas.requestRenderAll();

          URL.revokeObjectURL(svgUrl);
        });
      });

    } catch (error) {
      console.error('Failed to load icon:', error);

      import("fabric").then(({ IText }) => {
        const canvas = editor.canvas;
        const productImage = canvas.getObjects().find((obj) => obj.isTshirtBase);
        if (!productImage) return;

        const productBounds = productImage.getBoundingRect();

        const iconText = new IText('🔸', {
          left: productBounds.left + productBounds.width / 2,
          top: productBounds.top + productBounds.height / 2,
          originX: "center",
          originY: "center",
          fontSize: 48,
          fill: "#000",
          selectable: true,
          evented: true,
          hasControls: true,
          hasBorders: true
        });

        iconText.isIcon = true;
        canvas.add(iconText);
        canvas.setActiveObject(iconText);

        constrainObjectToProduct(iconText, productImage);
        applyClippingToObject(iconText, productImage);
        canvas.requestRenderAll();
      });
    }
  };

  // Initialize canvas when selectedProduct changes - REMOVED PERSISTENCE
  useEffect(() => {
    if (!selectedProduct || !editor?.canvas) return;

    console.log(`🆕 Initializing fresh canvas for product ${selectedProduct.id}`);

    const initializeCanvas = () => {
      // Always initialize fresh canvas - no more checking for saved state
      console.log(`📝 Creating fresh canvas for product ${selectedProduct.id}`);
      
      import("fabric").then(({ Image }) => {
        editor.canvas.clear();

        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.src = selectedProduct.image;

        img.onload = () => {
          const desiredWidth = 300;
          const scale = desiredWidth / img.width;

          const fabricImg = new Image(img, {
            left: editor.canvas.getWidth() / 2,
            top: editor.canvas.getHeight() / 2,
            isTshirtBase: true,
            originX: "center",
            originY: "center",
            scaleX: scale,
            scaleY: scale,
            // Lock properties
            selectable: false,
            evented: false,
            hasControls: false,
            hasBorders: false,
            lockMovementX: true,
            lockMovementY: true,
            lockScalingX: true,
            lockScalingY: true,
            lockRotation: true,
            // Visual properties
            flipX: flipX,
            flipY: flipY
          });

          fabricImg.customId = selectedProduct.id;
          
          editor.canvas.add(fabricImg);
          
          // Ensure it's locked and render
          setTimeout(() => {
            fabricImg.setCoords();
            editor.canvas.renderAll();
            console.log(`✅ Fresh canvas ready with locked base layer`);
          }, 50);
        };

        img.onerror = () => {
          console.error('Failed to load product image:', selectedProduct.image);
        };
      });
    };

    // Initialize after small delay
    const timeoutId = setTimeout(initializeCanvas, 100);
    return () => clearTimeout(timeoutId);
  }, [selectedProduct?.id, editor]);

  // Setup canvas event handlers - REMOVED PERSISTENCE SAVING
  useEffect(() => {
    if (!editor || !editor.canvas) return;

    const canvas = editor.canvas;

    // Basic canvas settings
    canvas.selection = true;
    canvas.hoverCursor = 'move';
    canvas.defaultCursor = 'default';

    const getProductImage = () => {
      return canvas.getObjects().find((o) => o.type === "image" && o.isTshirtBase);
    };

    const handleObjectMoving = (e) => {
      // Don't allow base layer to move
      if (e.target.isTshirtBase) {
        e.target.set({
          left: canvas.getWidth() / 2,
          top: canvas.getHeight() / 2
        });
        e.target.setCoords();
        return;
      }

      // Constrain other objects to product bounds
      const productImage = getProductImage();
      if (productImage) {
        constrainObjectToProduct(e.target, productImage);
      }
    };

    const handleObjectModified = (e) => {
      // Don't allow base layer modifications
      if (e.target.isTshirtBase) {
        return;
      }

      const productImage = getProductImage();
      if (productImage) {
        constrainObjectToProduct(e.target, productImage);
        updateClippingForObject(e.target);
      }
      
      // REMOVED: Canvas state saving to localStorage
    };

    const handleSelectionCreated = (e) => {
      // Prevent selection of base layer
      if (e.selected && e.selected.some(obj => obj.isTshirtBase)) {
        canvas.discardActiveObject();
        canvas.renderAll();
      }
    };

    // Add event listeners
    canvas.on('object:moving', handleObjectMoving);
    canvas.on('object:scaling', handleObjectMoving);
    canvas.on('object:rotating', handleObjectMoving);
    canvas.on('object:modified', handleObjectModified);
    canvas.on('selection:created', handleSelectionCreated);
    canvas.on('selection:updated', handleSelectionCreated);

    return () => {
      canvas.off('object:moving', handleObjectMoving);
      canvas.off('object:scaling', handleObjectMoving);
      canvas.off('object:rotating', handleObjectMoving);
      canvas.off('object:modified', handleObjectModified);
      canvas.off('selection:created', handleSelectionCreated);
      canvas.off('selection:updated', handleSelectionCreated);
    };
  }, [editor, selectedProduct?.id]);

  // Update text properties for active text object
  useEffect(() => {
    if (!editor || !editor.canvas) return;

    const canvas = editor.canvas;
    const activeObject = canvas.getActiveObject();

    if (activeObject && activeObject.type === "i-text") {
      console.log('🔤 Updating text properties');
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

  // Debug canvas state
  useEffect(() => {
    if (editor?.canvas) {
      const canvas = editor.canvas;
      const objects = canvas.getObjects();
      console.log('🖼️ Canvas objects:', objects.length);
      console.log('📋 Objects detail:', objects.map(obj => ({
        type: obj.type,
        isTshirtBase: obj.isTshirtBase,
        selectable: obj.selectable,
        evented: obj.evented
      })));
    }
  }, [editor?.canvas]);

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

  const handleSave = async (generateWith3D = false) => {
    if (!editor?.canvas) {
      alert('Canvas not ready!');
      return;
    }

    if (!selectedProduct) {
      alert('No product selected!');
      return;
    }

    setIsSaving(true);
    if (generateWith3D) {
      setSavingWith3D(true);
      setSave3DProgress('Preparing design for 3D...');
    }

    try {
      // Take screenshot
      const screenshotDataURL = editor.canvas.toDataURL('image/png', 0.8);
      
      if (!screenshotDataURL || screenshotDataURL === 'data:,') {
        throw new Error('Failed to capture design screenshot');
      }

      // Upload screenshot to Cloudinary
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

      // Collect canvas data
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
          visible: obj.visible
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

      // Create save data structure using getCurrentProductData()
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
          backgroundColor: editor.canvas.backgroundColor || "#ffffff"
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
        model3D: null
      };

      // Generate 3D model if requested
      if (generateWith3D) {
        try {
          setSave3DProgress('Generating 3D model...');

          const meaningfulObjects = canvasObjects.filter(obj => {
            if (obj.isTshirtBase) return false;
            if (obj.type === 'i-text') return obj.text && obj.text.trim().length > 0;
            return true;
          });

          if (meaningfulObjects.length === 0) {
            throw new Error('No custom content found. Please add text, designs, or images to generate 3D model.');
          }

          const imageUrlForTripo = screenshotCloudinaryUrl.startsWith('http')
            ? screenshotCloudinaryUrl
            : screenshotDataURL;

          const model3DResult = await tripo3DService.generate3DFromScreenshot(
            imageUrlForTripo,
            (message) => setSave3DProgress(message),
            {
              face_limit: 10000,
              texture_resolution: 1024,
              pbr: true
            }
          );

          if (!model3DResult || !model3DResult.model) {
            throw new Error('3D generation failed');
          }

          // Upload GLB to Cloudinary
          setSave3DProgress('Uploading 3D model...');
          
          let finalGlbUrl = model3DResult.model;
          let storageType = 'tripo3d';

          try {
            const formData = new FormData();
            formData.append("url", finalGlbUrl);

            const response = await fetch(`${baseUrl}/uploadfile`, {
              method: "POST",
              body: formData
            });

            if (response.ok) {
              const uploadResult = await response.json();
              if (uploadResult && uploadResult.url) {
                finalGlbUrl = uploadResult.url;
                storageType = 'cloudinary';
              }
            }
          } catch (uploadError) {
            console.warn('GLB upload to Cloudinary failed:', uploadError);
          }

          saveData.model3D = {
            url: finalGlbUrl,
            originalTripoUrl: model3DResult.model,
            cloudinaryUrl: storageType === 'cloudinary' ? finalGlbUrl : null,
            renderedImage: model3DResult.rendered_image,
            taskId: model3DResult.task_id,
            generatedAt: model3DResult.generatedAt,
            format: 'glb',
            screenshotUrl: screenshotCloudinaryUrl,
            storage: storageType,
            isReal: true
          };

          setSave3DProgress('3D model generated successfully!');

        } catch (error) {
          console.error("3D generation failed:", error);
          setSave3DProgress('3D generation failed');
          alert(`3D generation failed: ${error.message}`);
          return { success: false, error: error.message };
        }
      }

      // Save to MongoDB
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

      // Show screenshot in new tab
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

      let successMessage = 'Design saved successfully! 📸';

      if (generateWith3D && saveData.model3D && saveData.model3D.isReal) {
        const storageInfo = saveData.model3D.storage === 'cloudinary'
          ? '✅ Cloudinary Storage'
          : '⚠️ Tripo3D Storage';

        successMessage = `🎉 Design + 3D Model Saved!\n\nMongoDB ID: ${savedProductId}\nStorage: ${storageInfo}\nGLB URL: ${saveData.model3D.url}`;
      }

      alert(successMessage);

      return {
        success: true,
        productId: savedProductId,
        has3D: !!(saveData.model3D && saveData.model3D.isReal),
        model3DUrl: saveData.model3D?.url || null,
        storageType: saveData.model3D?.storage || null
      };

    } catch (error) {
      console.error('Save error:', error);
      alert('Save failed: ' + error.message);
      return { success: false, error: error.message };
    } finally {
      setIsSaving(false);
      setSavingWith3D(false);
      setSave3DProgress('');
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center bg-gray-100 relative max-w-[1720px] mx-auto">

      <Topbar
        setShowSidebar={setShowSidebar}
        onSave={handleSave}
        isSaving={isSaving}
        savingWith3D={savingWith3D}
        save3DProgress={save3DProgress}
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
          constrainObjectToProduct={constrainObjectToProduct}
        />
      )}

      {selectedProduct && (
        <RightSmallPreview 
          currentProduct={getCurrentProductData()}
        />
      )}

      {selectedProduct && (
        <CenterCanvas3D
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
            <span>Design saved successfully!</span>
          </div>
        </div>
      )}

      {savingWith3D && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-500 mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Saving with 3D Model</h3>
              <p className="text-sm text-gray-600 text-center">{save3DProgress}</p>

              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: save3DProgress.includes('ready') || save3DProgress.includes('🎉') ? '100%' :
                      save3DProgress.includes('Converting') || save3DProgress.includes('Creating') ? '70%' :
                        save3DProgress.includes('Generating') || save3DProgress.includes('Starting') ? '40%' :
                          save3DProgress.includes('Uploading') || save3DProgress.includes('cloud') ? '20%' : '10%'
                  }}
                ></div>
              </div>

              <p className="text-xs text-gray-500 mt-2 text-center">
                This may take 2-5 minutes. Please don't close the browser.
              </p>
            </div>
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