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
    const defaultProduct = {
      id: Date.now(),
      image: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1749339416/dbc0bb00825d26e862a94ed6222ab51c6c2c6c08_ky92hj.png",
      size: "M",
      color: "white",
      text: customText,
      description: "Default product image",
      rotate: 0,
      opacity: 100,
      textSize: textSize || 28,
      textSpacing: textSpacing || 0,
      textArc: textArc || 0,
      fontFamily: setTextFontFamily,
      fontStyle: setFontStyle,
      fill: setTextColor,
      imgflipX: setFlipX,
      imgflipY: setFlipY,
      flipX: setTextFlipX,
      flipY: setTextFlipY,
      alignment: "center",
    };

    setProducts([defaultProduct]);
  }, []);

  const handleColorChange = (colorObj) => {
    setSelectedColor(colorObj);
    updateLastProduct("color", colorObj.color);
    updateTshirtColor(colorObj.color);
  };


  const updateTshirtColor = (color) => {
    if (!editor || !editor.canvas) return;

    editor.canvas.getObjects().forEach((obj) => {
      if (obj.type === "image") {
        import("fabric").then(({ filters }) => {
          obj.filters = [];

          if (color && color !== "white") {
            obj.filters.push(
              new filters.BlendColor({
                color,
                mode: "tint",
                alpha: 1,
              })
            );
          }

          obj.applyFilters();
          editor.canvas.renderAll();
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

      const textObject = new fabric.IText(customText, {
        left: canvas.getWidth() / 2,
        top: canvas.getHeight() / 2,
        fontSize: 28,
        fill: setTextColor,
        fontFamily: setTextFontFamily,
        fontStyle: setFontStyle,
        originX: "center",
        originY: "center",
        selectable: true,
        evented: true,
        hasControls: true,
        hasBorders: true,
        lockMovementX: false,
        lockMovementY: false,
      });

      textObject.customId = products[products.length - 1]?.id;

      canvas.add(textObject);
      canvas.bringToFront(textObject);
      canvas.setActiveObject(textObject);
      textObject.bringToFront?.();
      textObject.setCoords();
      canvas.renderAll();

      setProducts((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        updated[lastIndex] = {
          ...updated[lastIndex],
          text: customText,
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
            if (obj.type === "image") {
              canvas.remove(obj);
            }
          });

          const fabricImg = new Image(img, {
            left: canvas.getWidth() / 2,
            top: canvas.getHeight() / 2,
            originX: "center",
            originY: "center",
            selectable: true,
          });

          canvas.add(fabricImg);
          canvas.setActiveObject(fabricImg);
          canvas.renderAll();

          setProducts((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            updated[lastIndex] = {
              ...updated[lastIndex],
              image: dataUrl,
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
      const emojiText = new IText(emojiChar, {
        left: editor.canvas.getWidth() / 2,
        top: editor.canvas.getHeight() / 2,
        originX: "center",
        originY: "center",
        fontSize: 48,
        fill: "#000",
        selectable: true,
        evented: true,
      });

      emojiText.customId = products[products.length - 1]?.id;
      addAndBringToFront(emojiText);
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
        const fabricImg = new Image(img1, {
          left: editor.canvas.getWidth() / 2,
          top: editor.canvas.getHeight() / 2,
          originX: "center",
          originY: "center",
          flipX: lastProduct.flipX,
          flipY: lastProduct.flipY,
          angle: lastProduct.rotate || 0,
          opacity: (lastProduct.opacity || 100) / 100,
          selectable: true,
          scaleX: lastProduct.flipX ? -1 : 1,
          scaleY: lastProduct.flipY ? -1 : 1,
        });

        fabricImg.customId = lastProduct.id;
        editor.canvas.add(fabricImg); 

        if (lastProduct.text && lastProduct.text.trim()) {
          const textObject = new IText(lastProduct.text, {
            left: editor.canvas.getWidth() / 2,
            top: editor.canvas.getHeight() / 2,
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
            editable: true
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

  useEffect(() => {
    if (!editor || !editor.canvas) return;

    const canvas = editor.canvas;

    console.log("Canvas Objects:", canvas.getObjects().map((obj, idx) => ({
      idx,
      type: obj.type,
      selectable: obj.selectable,
      evented: obj.evented,
      left: obj.left,
      top: obj.top,
      width: obj.width,
      height: obj.height,
      zIndex: obj.zIndex
    })));

    canvas.on("mouse:down", (e) => {
      console.log("Clicked on:", e.target);
      if (!e.target) {
        console.log("❌ Nothing selected — probably text is under image or not interactive.");
      }
    });
  }, [editor]);


  return (
    <div className="w-full h-screen flex justify-center items-center bg-gray-100 relative max-w-[1720px] mx-auto">
      <Topbar setShowSidebar={setShowSidebar} />
      {
        showSidebar && (
          <Sidebar
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
          />
        )
      }
      <RightSmallPreview />
      <FabricJSCanvas className="!w-screen !h-screen absolute top-0 left-0 z-10 pointer-events-auto" onReady={onReady} />


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
