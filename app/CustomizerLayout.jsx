"use client";

import { useRef, useState } from "react";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import RightSmallPreview from "./components/RightSmallPreview";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { BiCloudUpload } from "react-icons/bi";

const CustomizerLayout = () => {
    const [products, setProducts] = useState([]);
    const [showChatBox,setShowChatBox] = useState(false);
    const fileInputRef = useRef(null);

    const handleUpload = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const imageUrl = URL.createObjectURL(file);

        const newProduct = {
            id: Date.now(),
            image: imageUrl,
            size: "M",
            color: "white",
            text: "",
            description: "",
            rotate: 0,
            opacity: 100,
        };

        setProducts((prev) => [...prev, newProduct]);
    };

    const triggerUpload = () => {
        fileInputRef.current?.click();
    };

    const lastProduct = products[products.length - 1];
    const hasUploaded = products.length > 0;

    return (
        <div className="w-full h-screen flex justify-center items-center bg-gray-100 relative max-w-[1720px] mx-auto">
            <Topbar />

            {hasUploaded && <Sidebar products={products} setProducts={setProducts} />}
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
                <img
                    src={lastProduct.image}
                    alt="Preview"
                    className="max-h-[400px] object-contain"
                    style={{
                        transform: `rotate(${lastProduct.rotate}deg)`,
                        opacity: lastProduct.opacity / 100,
                    }}
                />
            )}

            {hasUploaded && (
                <div className="absolute left-7 bottom-7 flex gap-3 items-center">
                    <span className="font-semibold">Add Product</span>
                    {products.map((prod, index) => (
                        <div
                            key={prod.id}
                            className="bg-white w-14 h-14 p-2 rounded-lg border border-[#D3DBDF] flex items-center justify-center"
                        >
                            <img src={prod.image} alt={`Product ${index + 1}`} className="object-contain" />
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
                        <img
                            src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749345256/undo_kp3eto.png"
                            alt="redo"
                            className="transform scale-x-[-1]"
                        />
                    </div>
                    <hr className="rotate-90 border-t border-[#D3DBDF] h-px w-[20px]" />
                    <div className="flex items-center gap-3">
                        <FaMinus />
                        <span>100%</span>
                        <FaPlus />
                    </div>
                </div>
            )}

            {
                showChatBox && (
                    <div className="w-[350px] h-[430px] 
             absolute right-7 bottom-28 rounded-xl shadow-lg bg-white border border-gray-200 overflow-hidden z-70">
                <div className="bg-gradient-to-b from-[#1B2653] to-[#192248] text-white px-4 py-3">
                    <div className="flex items-center justify-between">
                        <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749345784/qqchat_jn7bok.png" alt="" />
                        <img onClick={()=> setShowChatBox(false)} src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749341803/Vector_hm0yzo.png" alt="" className="cursor-pointer"/>
                    </div>
                    <div className="mt-3 mb-5">
                        <h2 className="text-[22px] font-semibold">Customizer’s Help Center</h2>
                        <p className="text-[14px] text-white/70">How can we help you today?</p>
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <div
                        className="px-4 py-3 hover:bg-gray-50 flex items-center justify-between cursor-pointer"
                    >
                        <span className="text-[16px] text-gray-800 font-medium">How customizer work?</span>
                        <span className="text-gray-400">›</span>
                    </div>
                    <hr className="border-t border-[#D3DBDF] h-px" />
                    <div
                        className="px-4 py-3 hover:bg-gray-50 flex items-center justify-between cursor-pointer"
                    >
                        <span className="text-[16px] text-gray-800 font-medium">How customizer work?</span>
                        <span className="text-gray-400">›</span>
                    </div>
                    <hr className="border-t border-[#D3DBDF] h-px" />
                    <div
                        className="px-4 py-3 hover:bg-gray-50 flex items-center justify-between cursor-pointer"
                    >
                        <span className="text-[16px] text-gray-800 font-medium">How customizer work?</span>
                        <span className="text-gray-400">›</span>
                    </div>
                    <hr className="border-t border-[#D3DBDF] h-px" />
                    <div
                        className="px-4 py-3 hover:bg-gray-50 flex items-center justify-between cursor-pointer"
                    >
                        <span className="text-[16px] text-gray-800 font-medium">How customizer work?</span>
                        <span className="text-gray-400">›</span>
                    </div>
                    <hr className="border-t border-[#D3DBDF] h-px" />
                </div>
            </div>
                )
            }

            <div onClick={()=> setShowChatBox(!showChatBox)} className="flex items-center justify-center p-5 rounded-full bg-[#3559C7] absolute right-7 bottom-7 cursor-pointer">
                <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749345784/qqchat_jn7bok.png" alt="chat" />
            </div>
        </div>
    );
};

export default CustomizerLayout;
