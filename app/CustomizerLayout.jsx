"use client";

import { useEffect, useState } from "react";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import RightSmallPreview from "./components/RightSmallPreview";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";

const CustomizerLayout = () => {
  const [products, setProducts] = useState([]);
  const [showChatBox, setShowChatBox] = useState(false);
  const { editor, onReady } = useFabricJSEditor();
  const [customText, setCustomText] = useState("");
  const [showAddModal, setShowAddModal] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [textSize, setTextSize] = useState(28);
  const [textSpacing, setTextSpacing] = useState(0);
  const [textArc, setTextArc] = useState(0);

  useEffect(() => {
    const defaultProduct = {
      id: Date.now(),
      image: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1749339416/dbc0bb00825d26e862a94ed6222ab51c6c2c6c08_ky92hj.png",
      size: "M",
      color: "white",
      text: "Sample Text",
      description: "Default product image",
      rotate: 0,
      opacity: 100,
      textSize: 28,
      textSpacing: 0,
      textArc: 0,
    };
    setProducts([defaultProduct]);
  }, []);


  useEffect(() => {
    if (!editor || products.length === 0) return;

    const lastProduct = products[products.length - 1];
    if (!lastProduct?.image) return;

    import("fabric").then(({ Image, IText }) => {
      const img = new window.Image();
      img.src = lastProduct.image;

      img.onload = () => {
        const fabricImg = new Image(img, {
          left: editor.canvas.getWidth() / 2,
          top: editor.canvas.getHeight() / 2,
          originX: "center",
          originY: "center",
          angle: lastProduct.rotate || 0,
          opacity: (lastProduct.opacity || 100) / 100,
          selectable: true,
        });

        fabricImg.customId = lastProduct.id;
        editor.canvas.add(fabricImg);
        editor.canvas.renderAll();
      };

      if (lastProduct.text) {
        const text = new IText(lastProduct.text, {
          left: editor.canvas.getWidth() / 2,
          top: editor.canvas.getHeight() / 2,
          fontSize: lastProduct.textSize || 28,
          fill: "#000000",
          originX: "center",
          originY: "center",
        });

        text.customId = lastProduct.id;
        editor.canvas.add(text);
        editor.canvas.renderAll();
      }
    });
  }, [editor]); 

  useEffect(() => {
    if (!editor || !editor.canvas || products.length === 0) return;

    const lastProduct = products[products.length - 1];

    editor.canvas.getObjects().forEach((obj) => {
      if (obj.customId === lastProduct.id) {
        obj.set({
          opacity: lastProduct.opacity / 100,
          angle: lastProduct.rotate,
        });
      }
    });

    editor.canvas.renderAll();
  }, [products]);

  const handleAddCustomText = () => {
    if (!editor || !customText.trim()) return;

    import("fabric").then((fabric) => {
      const textObject = new fabric.IText(customText, {
        left: editor.canvas.getWidth() / 2,
        top: editor.canvas.getHeight() / 2,
        fontSize: 28,
        fill: "#000000",
        originX: "center",
        originY: "center",
      });

      textObject.customId = products[products.length - 1].id;

      editor.canvas.add(textObject);
      editor.canvas.setActiveObject(textObject);
      editor.canvas.renderAll();

      setProducts((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        const prod = { ...updated[lastIndex] };

        prod.text = customText;
        prod.fabricObject = textObject;

        updated[lastIndex] = prod;
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

  return (
    <div className="w-full h-screen flex justify-center items-center bg-gray-100 relative max-w-[1720px] mx-auto">
      <Topbar />
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
      />
      <RightSmallPreview />

      <FabricJSCanvas className="!w-screen !h-screen absolute top-0 left-0 z-0" onReady={onReady} />

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
