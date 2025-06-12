"use client";

import { useEffect, useRef, useState } from "react";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import RightSmallPreview from "./components/RightSmallPreview";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { BiCloudUpload } from "react-icons/bi";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import { FabricImage } from "fabric";

const CustomizerLayout = () => {
    const [products, setProducts] = useState(() => {
        try {
            const saved = localStorage.getItem("Products");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [showChatBox, setShowChatBox] = useState(false);
    const fileInputRef = useRef(null);
    const { editor, onReady } = useFabricJSEditor();
    const [pendingImage, setPendingImage] = useState(null);
    const [customText, setCustomText] = useState("");
    const [showAddModal, setShowAddModal] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [textSize, setTextSize] = useState(28);
    const [textSpacing, setTextSpacing] = useState(0);
    const [textArc, setTextArc] = useState(0);

    const lastImageRef = useRef(null);


    const handleUpload = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onloadend = () => {
            const base64Image = reader.result;

            setPendingImage(base64Image);

            const newProduct = {
                id: Date.now(),
                image: base64Image,
                size: "M",
                color: "white",
                text: customText,
                description: "",
                rotate: 0,
                opacity: 100,
                textSize: textSize,
                textSpacing: textSpacing,
                textArc: textArc,
            };

            setProducts((prev) => [...prev, newProduct]);
        };

        reader.readAsDataURL(file);
    };


    const triggerUpload = () => {
        fileInputRef.current?.click();
    };

    const lastProduct = products[products.length - 1];
    const hasUploaded = products.length > 0;

    useEffect(() => {
        if (!editor) return;
        editor.canvas.clear();

        const lastProduct = products[products.length - 1];
        if (!lastProduct || !lastProduct.image) return;

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

                editor.canvas.add(fabricImg);
                editor.canvas.renderAll();
            };

            img.onerror = (e) => {
                console.error("Failed to load image on canvas", e);
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

                editor.canvas.add(text);
                editor.canvas.renderAll();
            }
        });
    }, [editor, products])


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

            console.log("textObject", textObject)
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
            const prod = { ...updated[lastIndex] };

            if (prod.fabricObject) {
                const obj = prod.fabricObject;

                if (key === "rotate") {
                    const angle = parseInt(value);
                    obj.rotate(angle);
                    prod.rotate = angle;
                }

                if (key === "opacity") {
                    const opacity = parseInt(value) / 100;
                    obj.set("opacity", opacity);
                    prod.opacity = opacity * 100;
                }

                editor.canvas.renderAll();
            }

            updated[lastIndex] = prod;
            return updated;
        });
    };

    useEffect(() => {
        localStorage.setItem("Products", JSON.stringify(products));
    }, [products]);

    return (
        <div className="w-full h-screen flex justify-center items-center bg-gray-100 relative max-w-[1720px] mx-auto">
            <Topbar />
            {hasUploaded && (
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
            )}
            {hasUploaded && <RightSmallPreview />}

            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleUpload}
                className="hidden"
            />

            {!hasUploaded && (
                <div className="absolute z-10">
                    <div
                        onClick={triggerUpload}
                        className="h-[150px] w-[300px] flex flex-col gap-5 cursor-pointer items-center justify-center border-2 border-dashed border-[#3559C7] p-6 rounded-[10px] shadow-[0px_48px_35px_-48px_#e8e8e8]"
                    >
                        <BiCloudUpload color="#3559C7" fontSize={40} />
                        <span className="text-[#3559C7] font-semibold">Click to upload image</span>
                    </div>
                </div>
            )}

            {hasUploaded && lastProduct && (
                <FabricJSCanvas className="!w-screen !h-screen absolute top-0 left-0 z-0" onReady={onReady} />
            )}

            {hasUploaded && (
                <div className="absolute left-7 bottom-7 flex gap-3 items-center">
                    <span className="font-semibold">Add Product</span>
                    {products.map((prod, index) => (
                        <div
                            key={prod.id}
                            className="bg-white w-14 h-14 p-2 rounded-lg border border-[#D3DBDF] flex items-center justify-center"
                        >
                            <img src={prod.image} alt={`Product ${index + 1}`} className="object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                        </div>
                    ))}
                    <div
                        className="bg-white w-14 h-14 p-3 rounded-lg border border-[#D3DBDF] flex items-center justify-center cursor-pointer"
                        onClick={triggerUpload}
                    >
                        <FaPlus />
                    </div>
                </div>
            )}

            {hasUploaded && (
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
