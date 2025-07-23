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

  const [savingWith3D, setSavingWith3D] = useState(false);
  const [save3DProgress, setSave3DProgress] = useState('');

  const [currentProductId, setCurrentProductId] = useState(null);

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
      },
      {
        id: 2,
        image: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1753167221/fb5aa71062827239fe1e8500148aea01e9f51fee_sldcl6.png",
        size: "M",
        color: "White",
        width: 300,
        description: "White Polo T-Shirt",
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
      },
      {
        id: 3,
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
      constrainObjectToProduct(obj, imageObj);
      applyClippingToObject(obj, imageObj);
    }

    editor.canvas.requestRenderAll();
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
    console.log("🎯 Adding pattern:", { url, position });

    if (!handleAddDesignToCanvas || !editor?.canvas || !url) {
      console.error("❌ Missing requirements");
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
      console.warn("Using fallback bounds");
      baseBounds = {
        left: canvas.getWidth() * 0.2,
        top: canvas.getHeight() * 0.1,
        width: canvas.getWidth() * 0.6,
        height: canvas.getHeight() * 0.8
      };
    }

    console.log("📐 Base bounds:", baseBounds);

    const targetWidth = baseBounds.width * 0.9;
    const targetHeight = baseBounds.height * 0.5;

    let offsetY = 0;
    if (position === 'top') {
      offsetY = -(baseBounds.height * 0.25);
    } else {
      offsetY = (baseBounds.height * 0.25);
    }

    console.log("📏 Calculated:", {
      targetWidth: targetWidth.toFixed(0),
      targetHeight: targetHeight.toFixed(0),
      offsetY: offsetY.toFixed(0)
    });

    try {
      canvas.getObjects()
        .filter(obj => obj.name && (obj.name.includes('pattern') || obj.name.includes('design-image')))
        .forEach(obj => canvas.remove(obj));
      console.log("🗑️ Cleaned existing patterns");
    } catch (error) {
      console.warn("Cleanup error:", error);
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

      console.log("✅ Pattern added successfully - NO MODIFICATION AT ALL");

      setTimeout(() => {
        try {
          const designObj = canvas.getObjects().find(obj => obj.name === "design-image");

          if (designObj) {
            console.log("✅ Pattern found and verified:", {
              position: position === 'top' ? 'TOP 50%' : 'BOTTOM 50%',
              left: designObj.left,
              top: designObj.top,
              width: (designObj.width * designObj.scaleX).toFixed(0),
              height: (designObj.height * designObj.scaleY).toFixed(0),
              visible: true,
              name: designObj.name
            });
          } else {
            console.warn("⚠️ Pattern object not found");
          }
        } catch (error) {
          console.warn("Verification error:", error);
        }
      }, 50);

    } catch (error) {
      console.error("❌ Pattern addition failed:", error);
    }
  }

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

  // Enhanced canvas event handlers
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

  // Canvas initialization useEffect
  useEffect(() => {
    if (!editor || !editor.canvas || products.length === 0) return;

    const lastProduct = products[products.length - 1];
    if (!lastProduct?.image) return;

    import("fabric").then(({ Image, IText }) => {
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

  // Canvas event handlers useEffect
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
    canvas.on('object:added', handleObjectAdded);

    canvas.renderAll();

    return () => {
      canvas.off('object:moving', handleObjectMoving);
      canvas.off('object:scaling', handleObjectScaling);
      canvas.off('object:rotating', handleObjectRotating);
      canvas.off('object:modified', handleObjectModified);
      canvas.off('object:added', handleObjectAdded);

      if (clippingTimeout) {
        clearTimeout(clippingTimeout);
      }
    };
  }, [editor]);

  // Product updates useEffect
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

  // Cloudinary upload function
  const baseUrl = "https://my-backend-blond.vercel.app";

  const uploadToCloudinaryImg = async ({ image }) => {
    try {
      const formdata = new FormData();
      formdata.append("image", image);

      console.log('📤 Uploading to cloudinary:', `${baseUrl}/uploadfile`);

      const response = await fetch(`${baseUrl}/uploadfile`, {
        method: "POST",
        body: formdata,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Upload success:', data);
      return data;

    } catch (error) {
      console.error('❌ Upload error:', error);
      throw error;
    }
  };

  function extractMongoId(product) {
    // Your database returns _id as a direct string property
    const id = product._id;

    if (id && typeof id === 'string' && id.length > 0) {
      console.log(`✅ Found MongoDB _id: ${id}`);
      return id;
    }

    console.warn("❌ No valid _id found in product:", product);
    return null;
  }

  const handleSave = async (generateWith3D = false) => {
    console.log("handleSave called with 3D generation:", generateWith3D);

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
      // 🎯 STEP 1: Take Screenshot
      console.log("📸 Step 1: Taking screenshot...");
      const screenshotDataURL = editor.canvas.toDataURL('image/png', 0.8);
      console.log("Screenshot created, length:", screenshotDataURL.length);

      if (!screenshotDataURL || screenshotDataURL === 'data:,') {
        throw new Error('Failed to capture design screenshot');
      }

      // 🎯 STEP 2: Upload Screenshot to Cloudinary
      console.log("☁️ Step 2: Uploading screenshot to Cloudinary...");
      let screenshotCloudinaryUrl = screenshotDataURL; // fallback

      try {
        const response = await fetch(screenshotDataURL);
        const blob = await response.blob();
        const file = new File([blob], `design-screenshot-${Date.now()}.png`, {
          type: 'image/png'
        });

        const cloudinaryResponse = await uploadToCloudinaryImg({ image: file });

        if (cloudinaryResponse && cloudinaryResponse.url) {
          screenshotCloudinaryUrl = cloudinaryResponse.url;
          console.log("✅ Step 2 Complete: Screenshot uploaded to Cloudinary:", screenshotCloudinaryUrl);
        }
      } catch (uploadError) {
        console.error("❌ Cloudinary screenshot upload failed:", uploadError);
        // Continue with base64 fallback
      }

      // Step 3: Collect canvas data
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

      // Create save data structure
      const saveData = {
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
          backgroundColor: editor.canvas.backgroundColor || "#ffffff"
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
          emojis: canvasObjects.filter(obj => obj.type === 'i-text' && obj.isEmoji),
          icons: canvasObjects.filter(obj => obj.type === 'image' && obj.isIcon),
          customIcons: []
        },
        imageSettings: {
          flipX: false,
          flipY: false,
          selectedColor: {
            color: "#ffffff",
            name: "White"
          },
          opacity: 1,
          rotation: 0
        },
        uiState: {
          showSidebar: true,
          clippingPath: {},
          customTextState: {
            text: "",
            showEditModal: false,
            showAddModal: false
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
        screenshot: screenshotCloudinaryUrl,
        model3D: null
      };

      // 🎯 STEP 4-8: Generate 3D model if requested (Following Handwritten Steps)
      if (generateWith3D) {
        try {
          console.log("🚀 Step 4: Starting 3D generation process...");

          const meaningfulObjects = canvasObjects.filter(obj => {
            if (obj.isTshirtBase) return false;
            if (obj.type === 'i-text') return obj.text && obj.text.trim().length > 0;
            return true;
          });

          if (meaningfulObjects.length === 0) {
            throw new Error('No custom content found. Please add text, designs, or images to generate 3D model.');
          }

          console.log(`✅ Found ${meaningfulObjects.length} meaningful objects for 3D generation`);

          setSave3DProgress('Step 4: Sending image to Tripo3D API...');

          const onProgress = (message) => {
            console.log('3D Progress:', message);
            setSave3DProgress(message);
          };

          const imageUrlForTripo = screenshotCloudinaryUrl.startsWith('http')
            ? screenshotCloudinaryUrl
            : screenshotDataURL;

          console.log("📤 Step 4: Using image URL for Tripo3D:", imageUrlForTripo.substring(0, 100) + "...");

          const model3DResult = await tripo3DService.generate3DFromScreenshot(
            imageUrlForTripo,
            onProgress,
            {
              face_limit: 10000,
              texture_resolution: 1024,
              pbr: true
            }
          );

          console.log('🎯 Step 5: 3D Generation Result:', model3DResult);

          if (!model3DResult || !model3DResult.model) {
            throw new Error('Step 5 Failed: 3D generation completed but no model URL returned');
          }

          if (!model3DResult.model.startsWith('http')) {
            throw new Error(`Step 5 Failed: Invalid model URL format: ${model3DResult.model}`);
          }

          console.log("✅ Step 5 Complete: GLB URL extracted from data.result.pbr_model.url:", model3DResult.model);

          setSave3DProgress('Step 6-7: Uploading GLB file to Cloudinary via server...');

          let finalGlbUrl = model3DResult.model;
          let storageType = 'tripo3d';
          let CloudGlbUrl = model3DResult.model;

          try {
            const formData = new FormData();
            formData.append("url", finalGlbUrl);

            const response = await fetch("https://my-backend-blond.vercel.app/uploadfile", {
              method: "POST",
              body: formData
            });

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Upload failed: ${response.status} ${errorText}`);
            }

            const uploadResult = await response.json();
            console.log("📦 Step 7: Cloudinary GLB upload response:", uploadResult);

            if (uploadResult && uploadResult.url) {
              CloudGlbUrl = uploadResult.url;
              storageType = 'cloudinary';
              console.log('🎉 Step 7 Complete: GLB uploaded to Cloudinary:', CloudGlbUrl);
            } else {
              console.warn('⚠️ Step 7 Warning: Invalid Cloudinary upload response, using original Tripo3D URL');
            }

          } catch (uploadError) {
            console.warn('⚠️ Step 6-7 Warning: GLB upload to Cloudinary failed:', uploadError);
          }

          saveData.model3D = {
            url: CloudGlbUrl,
            originalTripoUrl: model3DResult.model,
            cloudinaryUrl: storageType === 'cloudinary' ? CloudGlbUrl : null,
            renderedImage: model3DResult.rendered_image,
            taskId: model3DResult.task_id,
            generatedAt: model3DResult.generatedAt,
            format: 'glb',
            screenshotUrl: screenshotCloudinaryUrl,
            storage: storageType,
            isReal: true
          };

          console.log("✅ Step 8: 3D model data prepared for MongoDB!");
          console.log("🎯 Final GLB URL for database:", finalGlbUrl);
          console.log("📊 Storage type:", storageType);

          if (storageType === 'cloudinary') {
            setSave3DProgress('✅ Steps 1-8 Complete: 3D model on Cloudinary! No CORS! 🎉');
          } else {
            setSave3DProgress('⚠️ Steps 1-7 Complete: Using Tripo3D URL (might have CORS) 📦');
          }

        } catch (error) {
          console.error("❌ 3D generation process failed:", error);
          setSave3DProgress('3D generation failed ❌');

          let errorMessage = `3D generation failed: ${error.message}\n\n`;

          if (error.message.includes('No custom content')) {
            errorMessage += 'Please add custom text, images, or designs to your t-shirt first.';
          } else if (error.message.includes('Step 4')) {
            errorMessage += 'Failed to send image to Tripo3D API. Check your API key and connection.';
          } else if (error.message.includes('Step 5')) {
            errorMessage += 'Tripo3D API failed to generate 3D model from your image.';
          } else if (error.message.includes('Step 6-7')) {
            errorMessage += 'GLB upload to Cloudinary failed, but 3D model was generated.';
          }

          alert(errorMessage);
          return {
            success: false,
            error: error.message
          };
        }
      }

      // 🎯 STEP 8: Save to MongoDB Database
      console.log("💾 Step 8: Saving to MongoDB database...");
      let savedProductId = null;

      try {
        const response = await fetch('https://customizer-backend-ttv5.onrender.com/api/save-product', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(saveData)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(`Database API Error ${response.status}: ${errorData?.message || response.statusText}`);
        }

        const result = await response.json();
        console.log("✅ Step 8 Complete: Saved to MongoDB successfully!", result);

        savedProductId = result._id || result.data?._id || result.product?._id;
        console.log("🎯 MongoDB _id:", savedProductId);

        if (savedProductId) {
          localStorage.setItem('lastSavedProductId', savedProductId);
          console.log("💾 Saved product _id to localStorage:", savedProductId);
          setCurrentProductId && setCurrentProductId(savedProductId);
        }

        saveData._id = savedProductId;

      } catch (apiError) {
        console.error("❌ Step 8 Failed: Database save error:", apiError);

        const saveLocallyAnyway = confirm(
          `Database save failed: ${apiError.message}\n\nDo you want to save locally instead?`
        );

        if (!saveLocallyAnyway) {
          throw new Error(`Database save failed: ${apiError.message}`);
        }
      }

      // Backup to localStorage
      const existingSaves = JSON.parse(localStorage.getItem('customizations') || '[]');
      const localSaveData = {
        ...saveData,
        _id: savedProductId,
        localSaveTimestamp: new Date().toISOString()
      };
      existingSaves.push(localSaveData);
      localStorage.setItem('customizations', JSON.stringify(existingSaves));

      console.log("✅ Backup saved to localStorage!");

      // Show screenshot in new tab
      try {
        const response = await fetch(screenshotDataURL);
        const blob = await response.blob();
        const viewableURL = URL.createObjectURL(blob);
        window.open(viewableURL, '_blank');
      } catch (err) {
        console.log("Screenshot preview failed:", err);
      }

      // 🎯 STEP 9: Success - Ready to Get from Database
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      let successMessage = 'Design saved successfully! 📸';

      if (generateWith3D && saveData.model3D && saveData.model3D.isReal) {
        const storageInfo = saveData.model3D.storage === 'cloudinary'
          ? '✅ Cloudinary Storage (No CORS Issues)'
          : '⚠️ Tripo3D Storage (Might Have CORS Issues)';

        successMessage = `🎉 All Steps Complete! Design + 3D Model Saved!\n\nMongoDB ID: ${savedProductId}\nStorage: ${storageInfo}\nGLB URL: ${saveData.model3D.url}\n\n✅ Step 9: Ready to fetch from database!\nScreenshot opened in new tab.`;
      } else if (generateWith3D) {
        successMessage = `Design saved but 3D generation failed.\nMongoDB ID: ${savedProductId}\nPlease try generating 3D again. 📸`;
      } else {
        successMessage = `✅ Design saved successfully!\nMongoDB ID: ${savedProductId}\nScreenshot opened in new tab. 📸`;
      }

      alert(successMessage);

      return {
        success: true,
        productId: savedProductId,
        has3D: !!(saveData.model3D && saveData.model3D.isReal),
        model3DUrl: saveData.model3D?.url || null,
        storageType: saveData.model3D?.storage || null,
        followedHandwrittenSteps: true
      };

    } catch (error) {
      console.error('❌ HandleSave error:', error);
      alert('Save failed: ' + error.message);
      return {
        success: false,
        error: error.message
      };
    } finally {
      setIsSaving(false);
      setSavingWith3D(false);
      setSave3DProgress('');
    }
  };


  // useEffect(() => {
  //   const lastSavedId = localStorage.getItem('lastSavedProductId');
  //   if (lastSavedId) {
  //     console.log('🔄 Loading last saved product:', lastSavedId);
  //     setCurrentProductId(lastSavedId);
  //   }
  // }, []);


  // Alignment useEffect
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

  // Text updates useEffect
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

  // Fabric.js methods enhancement useEffect
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

  const [lastModel3DUrl, setLastModel3DUrl] = useState(null);

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
          handleAddDesignToCanvas={handleAddDesignToCanvas}
          addIconToCanvas={addIconToCanvas}
          handleAddPatternToCanvas={handleAddPatternToCanvas}
          constrainObjectToProduct={constrainObjectToProduct}
        />
      )}

      {selectedProduct && <RightSmallPreview products={products} />}

      {/* CENTER: 2D/3D Canvas Area (MAIN CHANGE) */}
      {selectedProduct && (
        // <CenterCanvas3D onReady={onReady} editor={editor} model3DUrl={lastModel3DUrl} />
        <CenterCanvas3D
          onReady={onReady}
          editor={editor}
          savedProductId={currentProductId}  // ✅ Pass saved product ID
        />
      )}

      {/* Product Selection (when no product selected) */}
      {!selectedProduct && (
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
      )}
      {/* Bottom Controls */}
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

