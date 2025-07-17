"use client";

import { useEffect, useState } from "react";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import RightSmallPreview from "./components/RightSmallPreview";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import LayerContextMenu from "./components/LayerContextMenu";
import useCanvasContextMenu from "./hooks/useCanvasContextMenu";

const CustomizerLayout = () => {

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


  const textColor = "#000";
  const fontFamily = "Ubuntu";
  const fontStyle = "normal";
  const flipX = false;
  const flipY = false;
  const textFlipX = false;
  const textFlipY = false;

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [showChatBox, setShowChatBox] = useState(false);
  const { editor, onReady } = useFabricJSEditor();
  const [customText, setCustomText] = useState("");
  const [showAddModal, setShowAddModal] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [textSize, setTextSize] = useState(28);
  const [textSpacing, setTextSpacing] = useState(0);
  const [textArc, setTextArc] = useState(0);
  const [selectedColor, setSelectedColor] = useState({});
  const [showSidebar, setShowSidebar] = useState(true);
  const [clippingPath, setClippingPath] = useState(null);

  const [setTextColor, setChangeTextColor] = useState("#000");
  const [setTextFontFamily, setChangeFontFamily] = useState("Ubuntu");
  const [setFontStyle, setChangeFontStyle] = useState("normal");
  const [setFlipX, setChangeFlipX] = useState(false);
  const [setFlipY, setChangeFlipy] = useState(false);
  const [setTextFlipX, setChangeTextFlipX] = useState(false);
  const [setTextFlipY, setChangeTextFlipY] = useState(false);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const createClippingPath = (imageObj) => {
    if (!imageObj || !editor?.canvas) return null;

    import("fabric").then(({ Rect }) => {
      const imageBounds = imageObj.getBoundingRect();

      const clipPath = new Rect({
        left: imageBounds.left,
        top: imageBounds.top,
        width: imageBounds.width,
        height: imageBounds.height,
        originX: 'left',
        originY: 'top',
        absolutePositioned: true,
        inverted: false,
        exclude: false
      });

      setClippingPath(clipPath);
      return clipPath;
    });
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

  useEffect(() => {
    const backendProducts = [
      {
        id: 1,
        image: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1751090639/168e035a-9303-40ec-a455-351ddfb4cd9d_z4oxn2.png",
        size: "M",
        color: "White",
        width: 300,
        description: "White T-Shirt",
        textTopRatio: 3.5,
         designs: [
          {
            id: 1,
            name: "Angry Doberman",
            position: "center-top",
            offsetX: 0,
            offsetY: 40,
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1751967112/2234.preview_gd75zf.png"
          },
          {
            id: 2,
            name: "Bulldog Growl",
            position: "center-top",
            offsetX: 0,
            offsetY: 40,
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1751967113/2237.preview_okqvhu.png"
          },
          {
            id: 3,
            name: "Spiked Bulldog",
            position: "center-top",
            offsetX: 0,
            offsetY: 40,
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1751967113/2236.preview_xkl5hf.png"
          },
          {
            id: 4,
            name: "Roaring Wolf",
            position: "center-top",
            offsetX: 0,
            offsetY: 40,
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1751967113/2238.preview_bhedmv.png"
          },
          {
            id: 5,
            name: "Fighter",
            position: "center",
            offsetX: 0,
            offsetY: -15,
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1751967113/2243.preview_cgju7z.png"
          },
          {
            id: 6,
            name: "Husky Dog",
            position: "center",
            offsetX: 0,
            offsetY: -15,
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1751967112/2235.preview_pftmvw.png"
          },
          {
            id: 7,
            name: "Bird",
            position: "center-top",
            offsetX: 0,
            offsetY: 40,
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1751967113/2241.preview_h9pntb.png"
          },
          {
            id: 8,
            name: "Devil",
            position: "center",
            offsetX: 0,
            offsetY: -15,
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1751967112/2242.preview_gtqo2w.png"
          },
          {
            id: 9,
            name: "Roaring Tiger",
            position: "center",
            offsetX: 15,
            offsetY: -45,
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1751967113/2240.preview_zbpw5z.png"
          },
          {
            id: 10,
            name: "Tiger",
            position: "top-center",
            offsetX: 0,
            offsetY: 60,
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1751967113/2239.preview_nrrieg.png"
          },
          {
            id: 11,
            name: "Bee",
            position: "bottom-left",
            offsetX: 45,
            offsetY: -60,
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1751967114/2246.preview_rx4u62.png"
          },
          {
            id: 12,
            name: "Dragon",
            position: "center-top",
            offsetX: -15,
            offsetY: 20,
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1751967114/2245.preview_g7s5ml.png"
          },
          {
            id: 13,
            name: "Pirate Face",
            position: "bottom-left",
            offsetX: 55,
            offsetY: -60,
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1751967114/2244.preview_f4vowr.png"
          }
        ],
      },
      {
        id: 2,
        image: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1752304872/WhatsApp-Image-2025-07-10-at-3.53_zd5fbb.png",
        size: "L",
        color: "White",
        width: 300,
        description: "White Sando",
        textTopRatio: 2.8,
        designs: [
          {
            id: 1,
            name: "Angry Doberman",
            position: "center-top",
            offsetX: 0,
            offsetY: 40,
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1751967112/2234.preview_gd75zf.png"
          },
          {
            id: 2,
            name: "Bulldog Growl",
            position: "center-top",
            offsetX: 0,
            offsetY: 40,
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1751967113/2237.preview_okqvhu.png"
          },
          {
            id: 3,
            name: "Spiked Bulldog",
            position: "center-top",
            offsetX: 0,
            offsetY: 40,
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1751967113/2236.preview_xkl5hf.png"
          },
          {
            id: 4,
            name: "Roaring Wolf",
            position: "center-top",
            offsetX: 0,
            offsetY: 40,
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1751967113/2238.preview_bhedmv.png"
          },
          {
            id: 5,
            name: "Fighter",
            position: "center",
            offsetX: 0,
            offsetY: -15,
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1751967113/2243.preview_cgju7z.png"
          },
          {
            id: 6,
            name: "Husky Dog",
            position: "center",
            offsetX: 0,
            offsetY: -15,
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1751967112/2235.preview_pftmvw.png"
          },
          {
            id: 7,
            name: "Bird",
            position: "center-top",
            offsetX: 0,
            offsetY: 40,
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1751967113/2241.preview_h9pntb.png"
          },
          {
            id: 8,
            name: "Devil",
            position: "center",
            offsetX: 0,
            offsetY: -15,
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1751967112/2242.preview_gtqo2w.png"
          },
          {
            id: 9,
            name: "Roaring Tiger",
            position: "center",
            offsetX: 15,
            offsetY: -45,
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1751967113/2240.preview_zbpw5z.png"
          },
          {
            id: 10,
            name: "Tiger",
            position: "top-center",
            offsetX: 0,
            offsetY: 60,
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1751967113/2239.preview_nrrieg.png"
          },
          {
            id: 11,
            name: "Bee",
            position: "bottom-left",
            offsetX: 45,
            offsetY: -60,
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1751967114/2246.preview_rx4u62.png"
          },
          {
            id: 12,
            name: "Dragon",
            position: "center-top",
            offsetX: -15,
            offsetY: 20,
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1751967114/2245.preview_g7s5ml.png"
          },
          {
            id: 13,
            name: "Pirate Face",
            position: "bottom-left",
            offsetX: 55,
            offsetY: -60,
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1751967114/2244.preview_f4vowr.png"
          }
        ],
        patterns: [
          {
            id: 1,
            name: "Pattern 1",
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1752239240/2_1_oazqo6.jpg"
          },
          {
            id: 2,
            name: "Pattern 2",
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1752239240/1_mvfosf.jpg"
          },
          {
            id: 3,
            name: "Pattern 3",
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1752143461/2219.preview_p5wup6.png"
          },
          {
            id: 4,
            name: "Pattern 4",
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1752143461/2221.preview_ij7u1b.png"
          },
          {
            id: 5,
            name: "Pattern 5",
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1752143461/2223.preview_zpedw7.png"
          },
          {
            id: 6,
            name: "Pattern 6",
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1752143461/2220.preview_uzy9xy.png"
          },
          {
            id: 7,
            name: "Pattern 7",
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1752143462/2226.preview_dkhkth.png"
          },
          {
            id: 8,
            name: "Pattern 8",
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1752143462/2225.preview_jopp92.png"
          },
          {
            id: 9,
            name: "Pattern 9",
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1752143462/2224.preview_fwheor.png"
          },
          {
            id: 10,
            name: "Pattern 10",
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1752143462/2229.preview_yemknx.png"
          },
          {
            id: 11,
            name: "Pattern 11",
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1752143462/2227.preview_ixqzpl.png"
          },
          {
            id: 12,
            name: "Pattern 12",
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1752143462/2230.preview_mjhidt.png"
          },
          {
            id: 13,
            name: "Pattern 13",
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1752143462/2222.preview_poqyfa.png"
          },
          {
            id: 14,
            name: "Pattern 14",
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1752143463/2231.preview_eozedv.png"
          },
          {
            id: 15,
            name: "Pattern 15",
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1752143462/2228.preview_sy0c6v.png"
          }
        ]
      }
    ];

    setAllProducts(backendProducts);

    const mergedProduct = {
      ...backendProducts[0],
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
    };

    setProducts([mergedProduct]);
  }, []);

  const handleColorChange = (colorObj) => {
    setSelectedColor(colorObj);
    updateLastProduct("color", colorObj.color);
    updateTshirtColor(colorObj.color);
  };

  const updateTshirtColor = (color) => {
    const canvas = editor.canvas;
    canvas.getObjects().forEach((obj) => {
      if (obj.type === "image" && obj.isTshirtBase) {
        import("fabric").then(({ filters }) => {
          obj.filters = [
            new filters.BlendColor({
              color: color,
              mode: "multiply",
              alpha: 1,
            }),
          ];
          obj.applyFilters();
          canvas.renderAll();
        });
      }
    });
  };

  // const handleAddCustomText = () => {
  //   if (!editor || !customText.trim()) return;

  //   import("fabric").then((fabric) => {
  //     const canvas = editor.canvas;

  //     canvas.getObjects().forEach((obj) => {
  //       if (obj.type === "i-text") {
  //         canvas.remove(obj);
  //       }
  //     });

  //     const imageObj = canvas.getObjects().find((obj) => obj.type === "image" && obj.isTshirtBase);
  //     if (!imageObj) return;

  //     const imageBounds = imageObj.getBoundingRect();
  //     const currentProduct = products[products.length - 1];
  //     const topRatio = currentProduct?.textTopRatio || 3.5;

  //     const textObject = new fabric.IText(customText.slice(0, 9), {
  //       left: imageBounds.left + imageBounds.width / 2,
  //       top: imageBounds.top + imageBounds.height / topRatio,
  //       originX: "center",
  //       originY: "center",
  //       fontSize: 28,
  //       fill: setTextColor,
  //       fontFamily: setTextFontFamily,
  //       fontStyle: setFontStyle,
  //       selectable: true,
  //       evented: true,
  //       moveCursor: "move",
  //       hasControls: true,
  //       hasBorders: true,
  //       lockMovementX: false,
  //       lockMovementY: false,
  //       lockScalingX: false,
  //       lockScalingY: false,
  //       lockRotation: false,
  //       editable: true
  //     });

  //     textObject.setControlsVisibility({
  //       mt: true, mb: true, ml: true, mr: true,
  //       bl: true, br: true, tl: true, tr: true,
  //       mtr: true
  //     });

  //     canvas.add(textObject);
  //     canvas.setActiveObject(textObject);

  //     applyClippingToObject(textObject, imageObj);
  //     canvas.requestRenderAll();

  //     setProducts((prev) => {
  //       const updated = [...prev];
  //       const lastIndex = updated.length - 1;
  //       updated[lastIndex] = {
  //         ...updated[lastIndex],
  //         text: customText.slice(0, 9),
  //         fabricObject: textObject,
  //       };
  //       return updated;
  //     });

  //     setTextSize(28);
  //     setTextSpacing(0);
  //     setTextArc(0);
  //     setCustomText("");
  //     setShowAddModal(false);
  //     setShowEditModal(true);
  //   });
  // };

  const handleAddCustomText = () => {
  if (!editor || !customText.trim()) return;

  import("fabric").then((fabric) => {
    const canvas = editor.canvas;

    canvas.getObjects().forEach((obj) => {
      if (obj.type === "i-text") {
        canvas.remove(obj);
      }
    });

    const imageObj = canvas.getObjects().find((obj) => obj.type === "image" && obj.isTshirtBase);
    if (!imageObj) return;

    const imageBounds = imageObj.getBoundingRect();
    const currentProduct = products[products.length - 1];
    const topRatio = currentProduct?.textTopRatio || 3.5;

    const textObject = new fabric.IText(customText.slice(0, 9), {
      left: imageBounds.left + imageBounds.width / 2,
      top: imageBounds.top + imageBounds.height / topRatio,
      originX: "center",
      originY: "center",
      fontSize: 28,
      fill: setTextColor,
      fontFamily: setTextFontFamily,
      fontStyle: setFontStyle,
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

    constrainObjectToProduct(textObject, imageObj);
    applyClippingToObject(textObject, imageObj);
    canvas.requestRenderAll();

    setProducts((prev) => {
      const updated = [...prev];
      const lastIndex = updated.length - 1;
      updated[lastIndex] = {
        ...updated[lastIndex],
        text: customText.slice(0, 9),
        fabricObject: textObject,
      };
      return updated;
    });

    setTextSize(28);
    setTextSpacing(0);
    setTextArc(0);
    setCustomText("");
    setShowAddModal(false);
    setShowEditModal(true);
  });
};

  // const handleImageUpload = (e) => {
  //   const file = e.target.files[0];
  //   if (!file || !editor || !editor.canvas) return;

  //   const reader = new FileReader();
  //   reader.onload = (f) => {
  //     const dataUrl = f.target.result;
  //     const img = new window.Image();
  //     img.crossOrigin = "anonymous";
  //     img.src = dataUrl;

  //     img.onload = () => {
  //       import("fabric").then(({ Image }) => {
  //         const canvas = editor.canvas;
  //         canvas.clear();

  //         const desiredWidth = 300;
  //         const scale = desiredWidth / img.width;

  //         const fabricImg = new Image(img, {
  //           originX: "center",
  //           originY: "center",
  //           selectable: false,
  //           evented: false,
  //           isTshirtBase: true, 
  //           scaleX: scale,
  //           scaleY: scale,
  //           left: canvas.getWidth() / 2,
  //           top: canvas.getHeight() / 2,
  //           hasControls: false,
  //           hasBorders: false,
  //           lockMovementX: true,
  //           lockMovementY: true,
  //           lockScalingX: true,
  //           lockScalingY: true,
  //           lockRotation: true
  //         });

  //         canvas.add(fabricImg);
  //         canvas.sendToBack(fabricImg);
  //         canvas.renderAll();

  //         const newProduct = {
  //           id: Date.now(), 
  //           image: dataUrl,
  //           size: "Custom",
  //           color: "Custom",
  //           width: desiredWidth,
  //           description: "Custom Upload",
  //           textTopRatio: 3.5, 
  //           opacity: 100,
  //           rotate: 0,
  //           alignment: "center",
  //           text: customText,
  //           textSize,
  //           textSpacing,
  //           textArc,
  //           fontFamily: setTextFontFamily,
  //           fontStyle: setFontStyle,
  //           fill: setTextColor,
  //           imgflipX: setFlipX,
  //           imgflipY: setFlipY,
  //           flipX: setTextFlipX,
  //           flipY: setTextFlipY,
  //         };

  //         setProducts([newProduct]);

  //         setSelectedProduct(newProduct);

  //         console.log("New product created from upload:", newProduct);
  //       });
  //     };
  //   };

  //   reader.readAsDataURL(file);
  // };

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

  const addAndBringToFront = (obj) => {
    const imageObj = editor.canvas.getObjects().find((o) => o.type === "image" && o.isTshirtBase);

    editor.canvas.add(obj);
    editor.canvas.bringToFront?.(obj);
    editor.canvas.setActiveObject(obj);

    if (imageObj) {
      applyClippingToObject(obj, imageObj);
    }

    editor.canvas.requestRenderAll();
  };

  // const addEmojiTextToCanvas = (emojiChar) => {
  //   if (!editor || !editor.canvas) return;

  //   import("fabric").then(({ IText }) => {
  //     const canvas = editor.canvas;

  //     const existingEmoji = canvas.getObjects().find(
  //       (obj) => obj.isEmoji === true
  //     );
  //     if (existingEmoji) {
  //       canvas.remove(existingEmoji);
  //     }

  //     const emojiText = new IText(emojiChar, {
  //       left: canvas.getWidth() / 2,
  //       top: canvas.getHeight() / 2,
  //       originX: "center",
  //       originY: "center",
  //       fontSize: 48,
  //       fill: "#000",
  //       selectable: true,
  //       evented: true,
  //       hasBorders: true,
  //       hasControls: true,
  //       moveCursor: "move",
  //       lockMovementX: false,
  //       lockMovementY: false,
  //       lockScalingX: false,
  //       lockScalingY: false,
  //       lockRotation: false,
  //       editable: true
  //     });

  //     emojiText.isEmoji = true;
  //     addAndBringToFront(emojiText);
  //   });
  // };

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

  // const handleAddDesignToCanvas = (url, position = "center", offsetX = 0, offsetY = 0) => {
  //   if (!editor || !url) return;

  //   import("fabric").then((fabric) => {
  //     const canvas = editor.canvas;
  //     const productImage = canvas.getObjects().find((obj) => obj.isTshirtBase);
  //     if (!productImage) return;

  //     const imageBounds = productImage.getBoundingRect();
  //     const imgElement = new Image();
  //     imgElement.crossOrigin = "anonymous";
  //     imgElement.src = url;

  //     imgElement.onload = () => {
  //       const maxWidth = imageBounds.width * 0.4;
  //       const maxHeight = imageBounds.height * 0.4;
  //       const scale = Math.min(maxWidth / imgElement.width, maxHeight / imgElement.height);

  //       const imgInstance = new fabric.Image(imgElement, {
  //         originX: "center",
  //         originY: "center",
  //         scaleX: scale,
  //         scaleY: scale,
  //         name: "design-image",
  //         selectable: true,
  //         evented: true,
  //         hasControls: true,
  //         hasBorders: true,
  //         moveCursor: "move",
  //         lockMovementX: false,
  //         lockMovementY: false,
  //         lockScalingX: false,
  //         lockScalingY: false,
  //         lockRotation: false
  //       });

  //       const existing = canvas.getObjects().find(obj => obj.name === "design-image");
  //       if (existing) canvas.remove(existing);

  //       let left = imageBounds.left + imageBounds.width / 2;
  //       let top = imageBounds.top + imageBounds.height / 2;

  //       switch (position) {
  //         case "top-left":
  //           left = imageBounds.left + maxWidth / 2;
  //           top = imageBounds.top + maxHeight / 2;
  //           break;
  //         case "top-right":
  //           left = imageBounds.left + imageBounds.width - maxWidth / 2;
  //           top = imageBounds.top + maxHeight / 2;
  //           break;
  //         case "bottom-left":
  //           left = imageBounds.left + maxWidth / 2;
  //           top = imageBounds.top + imageBounds.height - maxHeight / 2;
  //           break;
  //         case "bottom-right":
  //           left = imageBounds.left + imageBounds.width - maxWidth / 2;
  //           top = imageBounds.top + imageBounds.height - maxHeight / 2;
  //           break;
  //         case "top-center":
  //           top = imageBounds.top + maxHeight / 2;
  //           break;
  //         case "bottom-center":
  //           top = imageBounds.top + imageBounds.height - maxHeight / 2;
  //           break;
  //         case "center-top":
  //           top = imageBounds.top + imageBounds.height * 0.3;
  //           break;
  //         case "center-left":
  //           left = imageBounds.left + maxWidth / 2;
  //           break;
  //         case "center-right":
  //           left = imageBounds.left + imageBounds.width - maxWidth / 2;
  //           break;
  //         case "center":
  //         default:
  //           break;
  //       }

  //       imgInstance.set({
  //         left: left + offsetX,
  //         top: top + offsetY
  //       });

  //       canvas.add(imgInstance);
  //       canvas.bringToFront(imgInstance);
  //       canvas.setActiveObject(imgInstance);

  //       applyClippingToObject(imgInstance, productImage);
  //       canvas.requestRenderAll();
  //     };
  //   });
  // };

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
          applyClippingToObject(imgInstance, productImage);
          canvas.requestRenderAll();
        };

        resizedImg.src = resizedDataUrl;
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

  useEffect(() => {
    if (!editor || products.length === 0) return;

    const lastProduct = products[products.length - 1];
    if (!lastProduct?.image) return;

    import("fabric").then(({ Image, IText, filters }) => {
      const img1 = new window.Image();
      img1.crossOrigin = "anonymous";
      img1.src = lastProduct.image;

      img1.onload = () => {
        const desiredWidth = 300;
        const scale = desiredWidth / img1.width;

        const fabricImg = new Image(img1, {
          left: editor.canvas.getWidth() / 2,
          top: editor.canvas.getHeight() / 2,
          isTshirtBase: true,
          originX: "center",
          originY: "center",
          flipX: lastProduct.flipX,
          flipY: lastProduct.flipY,
          angle: lastProduct.rotate || 0,
          opacity: (lastProduct.opacity || 100) / 100,
          selectable: false,
          evented: false,
          scaleX: scale,
          scaleY: scale,
          hasControls: false,
          hasBorders: false,
          lockMovementX: true,
          lockMovementY: true,
          lockScalingX: true,
          lockScalingY: true,
          lockRotation: true
        });

        fabricImg.customId = lastProduct.id;
        editor.canvas.add(fabricImg);

        if (lastProduct.text && lastProduct.text.trim()) {
          const textObject = new IText(lastProduct.text, {
            left: editor.canvas.getWidth() / 2,
            top: editor.canvas.getHeight() / 3.5,
            fontSize: lastProduct.textSize || 28,
            fill: lastProduct.fill || "#000",
            fontFamily: lastProduct.fontFamily || "Ubuntu",
            fontStyle: lastProduct.fontStyle || "normal",
            originX: "center",
            originY: "center",
            flipX: lastProduct.flipX,
            flipY: lastProduct.flipY,
            selectable: true,
            evented: true,
            hasControls: true,
            hasBorders: true,
            lockMovementX: false,
            lockMovementY: false,
            lockScalingX: false,
            lockScalingY: false,
            lockRotation: false,
            moveCursor: "move",
            editable: true
          });

          textObject.customId = lastProduct.id;
          editor.canvas.add(textObject);
          editor.canvas.setActiveObject(textObject);

          applyClippingToObject(textObject, fabricImg);
          editor.canvas.requestRenderAll();
        } else {
          editor.canvas.renderAll();
        }
      };
    });
  }, [editor]);

  useEffect(() => {
    if (!editor || !editor.canvas || products.length === 0) return;

    const lastProduct = products[products.length - 1];

    editor.canvas.getObjects().forEach((obj) => {
      if (obj.customId === lastProduct.id) {
        if (obj.type === "image") {
          obj.set({
            opacity: lastProduct.opacity / 100,
            angle: lastProduct.rotate,
            flipX: setFlipX,
            flipY: setFlipY,
          });
        } else if (obj.type === "i-text") {
          obj.set({
            selectable: true,
            evented: true,
            hasControls: true,
            hasBorders: true,
            lockMovementX: false,
            lockMovementY: false,
            editable: false,
            moveCursor: "move",
          });
        }
      }
    });

    editor.canvas.renderAll();
  }, [products]);

  const updateLastProduct = (key, value) => {
    setProducts((prev) => {
      const updated = [...prev];
      const lastIndex = updated.length - 1;
      updated[lastIndex] = {
        ...updated[lastIndex],
        [key]: value,
      };
      return updated;
    });
  };

  const handleSave = () => {
    console.log("handleSave called!");

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
      console.log("Screenshot created, length:", screenshotDataURL.length);

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

      const saveData = {
        id: Date.now(),
        timestamp: new Date().toISOString(),

        product: {
          id: selectedProduct.id,
          image: selectedProduct.image,
          description: selectedProduct.description,
          size: selectedProduct.size,
          color: selectedProduct.color,
          width: selectedProduct.width,
          textTopRatio: selectedProduct.textTopRatio
        },

        canvas: {
          width: editor.canvas.getWidth(),
          height: editor.canvas.getHeight(),
          objects: canvasObjects,
          backgroundColor: editor.canvas.backgroundColor || ""
        },

        design: {
          appliedDesigns: canvasObjects.filter(obj =>
            obj.type === 'image' &&
            !obj.isTshirtBase &&
            obj.name === 'design-image'
          ),
          appliedPatterns: canvasObjects.filter(obj =>
            obj.type === 'image' &&
            obj.name === 'pattern-image'
          ),
          customUploads: canvasObjects.filter(obj =>
            obj.type === 'image' &&
            !obj.isTshirtBase &&
            !obj.name
          )
        },

        text: {
          textObjects: canvasObjects.filter(obj => obj.type === 'i-text'),
          currentTextColor: setTextColor,
          currentFontFamily: setTextFontFamily,
          currentFontStyle: setFontStyle,
          currentTextSize: textSize,
          currentTextSpacing: textSpacing,
          currentTextArc: textArc,
          textFlipX: setTextFlipX,
          textFlipY: setTextFlipY
        },

        clipart: {
          emojis: canvasObjects.filter(obj => obj.isEmoji),
          icons: canvasObjects.filter(obj => obj.isIcon),
          customIcons: canvasObjects.filter(obj =>
            obj.type === 'image' &&
            obj.name === 'icon-image'
          )
        },

        pattern: {
          appliedPattern: null 
        },

        imageSettings: {
          flipX: setFlipX,
          flipY: setFlipY,
          selectedColor: selectedColor,
          opacity: selectedProduct.opacity || 100,
          rotation: selectedProduct.rotate || 0
        },

        uiState: {
          showSidebar: showSidebar,
          clippingPath: clippingPath,
          customTextState: {
            text: customText,
            showEditModal: showEditModal,
            showAddModal: showAddModal
          }
        },

        metadata: {
          canvasObjectCount: canvasObjects.length,
          hasText: canvasObjects.some(obj => obj.type === 'i-text'),
          hasDesign: canvasObjects.some(obj =>
            obj.type === 'image' &&
            !obj.isTshirtBase
          ),
          hasCustomUpload: canvasObjects.some(obj =>
            obj.type === 'image' &&
            !obj.isTshirtBase &&
            !obj.name
          )
        },

        screenshot: screenshotDataURL
      };

      const existingSaves = JSON.parse(localStorage.getItem('customizations') || '[]');
      existingSaves.push(saveData);
      localStorage.setItem('customizations', JSON.stringify(existingSaves));

      console.log("✅ Saved to localStorage!");
      console.log("Save data structure:", saveData);
      console.log("Total saves:", existingSaves.length);

      fetch(screenshotDataURL)
        .then(res => res.blob())
        .then(blob => {
          const viewableURL = URL.createObjectURL(blob);
          console.log("🖼️ CLICK THIS URL TO VIEW SCREENSHOT:");
          console.log(viewableURL);

          window.open(viewableURL, '_blank');
        })
        .catch(err => console.log("Blob creation failed:", err));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      alert('Saved successfully! Screenshot opened in new tab.');

    } catch (error) {
      console.error('Save error:', error);
      alert('Save failed: ' + error.message);
    } finally {
      setIsSaving(false);
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


  useEffect(() => {
    if (!editor || !editor.canvas || products.length === 0) return;

    const lastProduct = products[products.length - 1];

    editor.canvas.getObjects().forEach((obj) => {
      if (obj.customId === lastProduct.id) {
        const canvasW = editor.canvas.getWidth();
        const canvasH = editor.canvas.getHeight();

        switch (lastProduct.alignment) {
          case "left":
            obj.set({ left: 0 });
            break;
          case "center":
            obj.set({ left: canvasW / 2 });
            break;
          case "right":
            obj.set({ left: canvasW });
            break;
          case "top":
            obj.set({ top: 0 });
            break;
          case "middle":
            obj.set({ top: canvasH / 2 });
            break;
          case "bottom":
            obj.set({ top: canvasH });
            break;
          default:
            break;
        }

        obj.setCoords();
      }
    });

    editor.canvas.renderAll();
  }, [products[products.length - 1]?.alignment]);

  useEffect(() => {
    if (!editor || !editor.canvas) return;

    const activeObject = editor.canvas.getActiveObject();

    if (activeObject && activeObject.type === "i-text") {
      activeObject.set({
        fill: setTextColor,
        fontFamily: setTextFontFamily,
        fontStyle: setFontStyle,
        flipX: setTextFlipX,
        flipY: setTextFlipY
      });
      editor.canvas.renderAll();
    }
  }, [setTextColor, setTextFontFamily, setFontStyle, setTextFlipX, setTextFlipY]);

  useEffect(() => {
    if (!editor || !editor.canvas) return;

    import("fabric").then(({ Canvas }) => {
      if (!Canvas.prototype.bringToFront) {
        Canvas.prototype.bringToFront = function (object) {
          const objects = this.getObjects();
          const currentIndex = objects.indexOf(object);
          if (currentIndex !== -1 && currentIndex < objects.length - 1) {
            this.remove(object);
            this.add(object);
          }
          return this;
        };
      }

      if (!Canvas.prototype.sendToBack) {
        Canvas.prototype.sendToBack = function (object) {
          const objects = this.getObjects();
          const currentIndex = objects.indexOf(object);
          if (currentIndex !== -1 && currentIndex > 0) {
            this.remove(object);
            if (typeof this.insertAt === 'function') {
              this.insertAt(object, 0);
            } else {
              objects.splice(0, 0, object);
              this._objects = objects;
              this.renderAll();
            }
          }
          return this;
        };
      }

      if (!Canvas.prototype.bringForward) {
        Canvas.prototype.bringForward = function (object) {
          const objects = this.getObjects();
          const currentIndex = objects.indexOf(object);
          if (currentIndex !== -1 && currentIndex < objects.length - 1) {
            const nextIndex = currentIndex + 1;
            [objects[currentIndex], objects[nextIndex]] = [objects[nextIndex], objects[currentIndex]];
            this.renderAll();
          }
          return this;
        };
      }

      if (!Canvas.prototype.sendBackwards) {
        Canvas.prototype.sendBackwards = function (object) {
          const objects = this.getObjects();
          const currentIndex = objects.indexOf(object);
          if (currentIndex !== -1 && currentIndex > 0) {
            const prevIndex = currentIndex - 1;
            [objects[currentIndex], objects[prevIndex]] = [objects[prevIndex], objects[currentIndex]];
            this.renderAll();
          }
          return this;
        };
      }
    });
  }, [editor]);

  let clippingTimeout = null;
  let isClippingInProgress = false;

  const debouncedUpdateClipping = (obj) => {
    if (isClippingInProgress) return;

    if (clippingTimeout) {
      clearTimeout(clippingTimeout);
    }

    clippingTimeout = setTimeout(() => {
      isClippingInProgress = true;
      updateClippingForObject(obj);
      isClippingInProgress = false;
    }, 100); 
  };

  let lastRenderTime = 0;
  const throttledRender = (canvas) => {
    const now = Date.now();
    if (now - lastRenderTime > 16) { 
      canvas.renderAll();
      lastRenderTime = now;
    }
  };


  useEffect(() => {
  if (!editor || !editor.canvas) return;

  editor.canvas.selection = true;
  editor.canvas.skipTargetFind = false;
  editor.canvas.hoverCursor = 'move';
  editor.canvas.defaultCursor = 'move';
  editor.canvas.allowTouchScrolling = false;
  editor.canvas.targetFindTolerance = 10;

  const canvas = editor.canvas;

  const getProductImage = () => {
    return canvas.getObjects().find((o) => o.type === "image" && o.isTshirtBase);
  };

  const handleObjectMoving = (e) => {
    const productImage = getProductImage();
    if (productImage) {
      constrainObjectToProduct(e.target, productImage);
    }
    throttledRender(canvas);
  };

  const handleObjectScaling = (e) => {
    const productImage = getProductImage();
    if (productImage) {
      constrainObjectToProduct(e.target, productImage);
    }
    throttledRender(canvas);
  };

  const handleObjectRotating = (e) => {
    const productImage = getProductImage();
    if (productImage) {
      constrainObjectToProduct(e.target, productImage);
    }
    throttledRender(canvas);
  };

  const handleObjectModified = (e) => {
    const productImage = getProductImage();
    if (productImage) {
      constrainObjectToProduct(e.target, productImage);
    }
    debouncedUpdateClipping(e.target);
  };

  const handleObjectMovingStart = (e) => {
    e.target.isMoving = true;
    if (clippingTimeout) {
      clearTimeout(clippingTimeout);
    }
  };

  const handleObjectMovingEnd = (e) => {
    e.target.isMoving = false;
    const productImage = getProductImage();
    if (productImage) {
      constrainObjectToProduct(e.target, productImage);
    }
    debouncedUpdateClipping(e.target);
  };

  const handleObjectAdded = (e) => {
    const productImage = getProductImage();
    if (productImage && !e.target.isTshirtBase) {
      setTimeout(() => {
        constrainObjectToProduct(e.target, productImage);
        canvas.renderAll();
      }, 50);
    }
  };

  canvas.on('object:moving', handleObjectMoving);
  canvas.on('object:scaling', handleObjectScaling);
  canvas.on('object:rotating', handleObjectRotating);
  canvas.on('object:modified', handleObjectModified);
  canvas.on('object:moving', handleObjectMovingStart);
  canvas.on('object:moved', handleObjectMovingEnd);
  canvas.on('object:added', handleObjectAdded);

  canvas.renderAll();

  return () => {
    canvas.off('object:moving', handleObjectMoving);
    canvas.off('object:scaling', handleObjectScaling);
    canvas.off('object:rotating', handleObjectRotating);
    canvas.off('object:modified', handleObjectModified);
    canvas.off('object:moving', handleObjectMovingStart);
    canvas.off('object:moved', handleObjectMovingEnd);
    canvas.off('object:added', handleObjectAdded);

    if (clippingTimeout) {
      clearTimeout(clippingTimeout);
    }
  };
}, [editor]);

  const bringForward = () => {
    const canvas = editor?.canvas;
    const activeObj = canvas?.getActiveObject();

    if (!activeObj || !canvas) return;

    const objects = canvas.getObjects();
    const currentIndex = objects.indexOf(activeObj);

    if (currentIndex !== -1 && currentIndex < objects.length - 1) {
      const nextIndex = currentIndex + 1;
      [objects[currentIndex], objects[nextIndex]] = [objects[nextIndex], objects[currentIndex]];

      canvas._objects = objects;
      activeObj.setCoords();
      canvas.renderAll();
    }
  };


  useEffect(() => {
    if (editor?.canvas) {
      console.log("Canvas initialized with", editor.canvas.getObjects().length, "objects");
      console.log("Canvas objects:", editor.canvas.getObjects());
    }
  }, [editor?.canvas]);

  return (
    <div className="w-full h-screen flex justify-center items-center bg-gray-100 relative max-w-[1720px] mx-auto">

      <Topbar
        setShowSidebar={setShowSidebar}
        onSave={handleSave}
        isSaving={isSaving}
      />
      {
        (showSidebar && selectedProduct) && (
          <Sidebar
            bringForward={bringForward}
            editor={editor}
            products={products}
            setProducts={setProducts}
            selectedProduct={selectedProduct}           
            setSelectedProduct={setSelectedProduct}     
            customText={customText}                     
            textSize={textSize}                         
            textSpacing={textSpacing}                   
            textArc={textArc}                           
            setTextFontFamily={setTextFontFamily}       
            setFontStyle={setFontStyle}                 
            setTextColor={setTextColor}                 
            setFlipX={setFlipX}                         
            setFlipY={setFlipY}                         
            setTextFlipX={setTextFlipX}                 
            setTextFlipY={setTextFlipY}                 
            handleAddCustomText={handleAddCustomText}
            setCustomText={setCustomText}
            updateLastProduct={updateLastProduct}
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
            setChangeTextColor={setChangeTextColor}
            setChangeFontFamily={setChangeFontFamily}
            setChangeFontStyle={setChangeFontStyle}
            setChangeFlipX={setChangeFlipX}
            setChangeFlipy={setChangeFlipy}
            alignFabricObject={alignFabricObject}
            setChangeTextFlipX={setChangeTextFlipX}
            setChangeTextFlipY={setChangeTextFlipY}
            // handleImageUpload={handleImageUpload}
            handleAddDesignToCanvas={handleAddDesignToCanvas}
            addIconToCanvas={addIconToCanvas}
          />
        )
      }

      {
        selectedProduct && <RightSmallPreview products={products} />
      }

      {
        selectedProduct && <FabricJSCanvas className="canvas-container" onReady={onReady} />
      }

      {
        !selectedProduct && (
          <div className="flex gap-4">
            {allProducts.map((product) => (
              <div
                key={product.id}
                className={`p-3 border rounded cursor-pointer w-44 transition hover:shadow-lg ${selectedProduct?.id === product.id ? "border-blue-600 ring-2 ring-blue-300" : "border-gray-300"
                  }`}
                onClick={() => {
                  const mergedProduct = {
                    ...product,
                    text: customText,
                    textSize,
                    textSpacing,
                    textArc,
                    fontFamily: setTextFontFamily,
                    fontStyle: setFontStyle,
                    fill: setTextColor,
                    imgflipX: setFlipX,
                    imgflipY: setFlipY,
                    flipX: setTextFlipX,
                    flipY: setTextFlipY,
                    opacity: 100,
                    rotate: 0,
                    alignment: "center",
                  };
                  setSelectedProduct(product);
                  setProducts([mergedProduct]);
                }}
              >
                <img src={product.image} alt={product.description} className="w-full h-44 object-contain" />
                <div className="mt-2 text-center">
                  <p className="font-semibold text-sm">{product.description}</p>
                  <p className="text-xs text-gray-500">Size: {product.size}</p>
                  <p className="text-xs text-gray-500">Color: {product.color}</p>
                </div>
              </div>
            ))}
          </div>
        )
      }

      {
        selectedProduct && (
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
        )
      }

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
            <span>Customization saved successfully!</span>
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
