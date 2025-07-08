"use client";

import { useEffect, useState } from "react";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import RightSmallPreview from "./components/RightSmallPreview";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";

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


  const [setTextColor, setChangeTextColor] = useState("#000");
  const [setTextFontFamily, setChangeFontFamily] = useState("Ubuntu");
  const [setFontStyle, setChangeFontStyle] = useState("normal");
  const [setFlipX, setChangeFlipX] = useState(false);
  const [setFlipY, setChangeFlipy] = useState(false);
  const [setTextFlipX, setChangeTextFlipX] = useState(false);
  const [setTextFlipY, setChangeTextFlipY] = useState(false);


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
      },
      {
        id: 2,
        image: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1751272152/Capture-2_ba0stc.png",
        size: "L",
        color: "White",
        width: 300,
        description: "Black Sando",
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
            name: "Wild Wolf",
            position: "center-top",
            offsetX: 0,
            offsetY: 40,
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1751967113/2238.preview_bhedmv.png"
          },
          {
            id: 5,
            name: "Roaring Tiger",
            position: "center",
            offsetX: 0,
            offsetY: -15,
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1751967113/2243.preview_cgju7z.png"
          },
          {
            id: 6,
            name: "Snarling Tiger",
            position: "center",
            offsetX: 0,
            offsetY: -15,
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1751967112/2235.preview_pftmvw.png"
          },
          {
            id: 7,
            name: "Angry Husky",
            position: "center-top",
            offsetX: 0,
            offsetY: 40,
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1751967113/2241.preview_h9pntb.png"
          },
          {
            id: 8,
            name: "Viking Beard",
            position: "center",
            offsetX: 0,
            offsetY: -15,
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1751967112/2242.preview_gtqo2w.png"
          },
          {
            id: 9,
            name: "Buzzing Bee",
            position: "center",
            offsetX: 15,
            offsetY: -45,
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1751967113/2240.preview_zbpw5z.png"
          },
          {
            id: 10,
            name: "Red Devil",
            position: "top-center",
            offsetX: 0,
            offsetY: 60,
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1751967113/2239.preview_nrrieg.png"
          },
          {
            id: 11,
            name: "Dino Roar",
            position: "bottom-left",
            offsetX: 45,
            offsetY: -60,
            url: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1751967114/2246.preview_rx4u62.png"
          },
          {
            id: 12,
            name: "Cardinal Bird",
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

      const imageObj = canvas.getObjects().find((obj) => obj.type === "image");
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
        editable: false
      });

      textObject.setControlsVisibility({
        mt: true, mb: true, ml: true, mr: true,
        bl: true, br: true, tl: true, tr: true,
        mtr: true
      });

      canvas.add(textObject);
      canvas.setActiveObject(textObject);
      textObject.setCoords();
      canvas.renderAll();

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


  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !editor || !editor.canvas) return;

    const reader = new FileReader();
    reader.onload = (f) => {
      const dataUrl = f.target.result;
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = dataUrl;

      img.onload = () => {
        import("fabric").then(({ Image }) => {
          const canvas = editor.canvas;

          canvas.getObjects().forEach((obj) => {
            if (obj.isTshirtBase) canvas.remove(obj);
          });

          const desiredWidth = 300;
          const scale = desiredWidth / img.width;

          const fabricImg = new Image(img, {
            originX: "center",
            originY: "center",
            selectable: false,
            isTshirtBase: true,
            scaleX: scale,
            scaleY: scale,
            left: canvas.getWidth() / 2,
            top: canvas.getHeight() / 2,
          });

          canvas.add(fabricImg);
          canvas.sendToBack(fabricImg);
          canvas.renderAll();

          setProducts((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            updated[lastIndex] = {
              ...updated[lastIndex],
              image: dataUrl,
              width: desiredWidth,
            };
            return updated;
          });
        });
      };
    };

    reader.readAsDataURL(file);
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

    canvas.renderAll();
  };

  const addAndBringToFront = (obj) => {
    editor.canvas.add(obj);
    editor.canvas.bringToFront?.(obj);
    editor.canvas.setActiveObject(obj);
    obj.setCoords();
    editor.canvas.renderAll();
  };

  const addEmojiTextToCanvas = (emojiChar) => {
    if (!editor || !editor.canvas) return;

    import("fabric").then(({ IText }) => {
      const canvas = editor.canvas;

      const existingEmoji = canvas.getObjects().find(
        (obj) => obj.isEmoji === true
      );
      if (existingEmoji) {
        canvas.remove(existingEmoji);
      }

      const emojiText = new IText(emojiChar, {
        left: canvas.getWidth() / 2,
        top: canvas.getHeight() / 2,
        originX: "center",
        originY: "center",
        fontSize: 48,
        fill: "#000",
        selectable: true,
        evented: true,
        hasBorders: true,
        hasControls: true,
      });

      emojiText.isEmoji = true;

      addAndBringToFront(emojiText);
    });
  };


  const handleAddDesignToCanvas = (url, position = "center", offsetX = 0, offsetY = 0) => {
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
        const maxWidth = imageBounds.width * 0.4;
        const maxHeight = imageBounds.height * 0.4;
        const scale = Math.min(maxWidth / imgElement.width, maxHeight / imgElement.height);

        const imgInstance = new fabric.Image(imgElement, {
          originX: "center",
          originY: "center",
          scaleX: scale,
          scaleY: scale,
          name: "design-image",
          selectable: false,
          evented: false,
          hasControls: false,
          hasBorders: false,
          moveCursor: "move"
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
        imgInstance.setCoords();
        canvas.renderAll();
      };
    });
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
          scaleX: scale,
          scaleY: scale,
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
            lockMovementX: true,
            lockMovementY: true,
            moveCursor: "move"
          });

          textObject.customId = lastProduct.id;
          editor.canvas.add(textObject);
          editor.canvas.setActiveObject(textObject);
        }

        editor.canvas.renderAll();
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
          this.remove(object);
          this.add(object);
        };
      }

      if (!Canvas.prototype.sendToBack) {
        Canvas.prototype.sendToBack = function (object) {
          this.remove(object);
          this.insertAt(object, 0);
        };
      }
    });
  }, [editor]);

  useEffect(() => {
    if (!editor || !editor.canvas) return;
    editor.canvas.selection = true;
    editor.canvas.skipTargetFind = false;
    editor.canvas.hoverCursor = 'move';
    editor.canvas.defaultCursor = 'move';
    editor.canvas.allowTouchScrolling = false;
    editor.canvas.targetFindTolerance = 10;
    editor.canvas.renderAll();
  }, [editor]);

  const bringForward = () => {
    const activeObj = editor?.canvas?.getActiveObject();
    if (activeObj && typeof editor.canvas.bringForward === "function") {
      editor.canvas.bringForward(activeObj);
      editor.canvas.renderAll();
    }
  };


  return (
    <div className="w-full h-screen flex justify-center items-center bg-gray-100 relative max-w-[1720px] mx-auto">
      <Topbar setShowSidebar={setShowSidebar} />
      {
        (showSidebar && selectedProduct) && (
          <Sidebar
            bringForward={bringForward}
            editor={editor}
            products={products}
            setProducts={setProducts}
            handleAddCustomText={handleAddCustomText}
            customText={customText}
            setCustomText={setCustomText}
            updateLastProduct={updateLastProduct}
            showAddModal={showAddModal}
            showEditModal={showEditModal}
            setShowAddModal={setShowAddModal}
            setShowEditModal={setShowEditModal}
            textSize={textSize}
            setTextSize={setTextSize}
            textSpacing={textSpacing}
            setTextSpacing={setTextSpacing}
            textArc={textArc}
            setTextArc={setTextArc}
            handleColorChange={handleColorChange}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            addEmojiTextToCanvas={addEmojiTextToCanvas}
            updateArrange={updateArrange}
            setTextColor={setTextColor}
            setChangeTextColor={setChangeTextColor}
            setTextFontFamily={setTextFontFamily}
            setChangeFontFamily={setChangeFontFamily}
            setFontStyle={setFontStyle}
            setChangeFontStyle={setChangeFontStyle}
            setChangeFlipX={setChangeFlipX}
            setChangeFlipy={setChangeFlipy}
            alignFabricObject={alignFabricObject}
            setChangeTextFlipX={setChangeTextFlipX}
            setChangeTextFlipY={setChangeTextFlipY}
            handleImageUpload={handleImageUpload}
            handleAddDesignToCanvas={handleAddDesignToCanvas}
          />
        )
      }

      {
        selectedProduct && <RightSmallPreview />
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

      {showChatBox && (
        <div className="w-[350px] h-[430px] absolute right-7 bottom-28 rounded-xl shadow-lg bg-white border border-gray-200 overflow-hidden z-70">
          <div className="bg-gradient-to-b from-[#1B2653] to-[#192248] text-white px-4 py-3">
            <div className="flex items-center justify-between">
              <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749345784/qqchat_jn7bok.png" alt="" />
              <img onClick={() => setShowChatBox(false)} src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749341803/Vector_hm0yzo.png" alt="" className="cursor-pointer" />
            </div>
            <div className="mt-3 mb-5">
              <h2 className="text-[22px] font-semibold">Customizer’s Help Center</h2>
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
