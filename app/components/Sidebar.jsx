"use client";
import React, { useRef, useState } from "react";
import EditorTab from "./EditorTab";
import PreviewTab from "./PreviewTab";
import EditTab from "./EditTab";
import AddTextTab from "./AddTextTab";
import EditTextTab from "./EditTextTab";

const Sidebar = ({ products, editor, handleAddCustomText, customText, setCustomText, updateLastProduct, showAddModal, showEditModal, setShowEditModal, setShowAddModal, textSize, setTextSize, textSpacing, setTextSpacing, textArc, setTextArc }) => {
  const [activeTab, setActiveTab] = useState("editor");
  const lastProduct = products[products.length - 1];

  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedFile(url);
    }
  };

  return (
    <div className="absolute top-28 left-7 flex gap-5 z-50">
      <div className="bg-white p-5 rounded-lg border border-[#D3DBDF] flex flex-col h-fit items-center gap-6">
        {[
          { key: "editor", label: "Editor", icon: "Frame_4_vzkhrn" },
          { key: "edit", label: "Edit", icon: "pencil-outline_c6lwsj" },
          { key: "text", label: "Text", icon: "text-recognition_emsdp8" },
          { key: "colors", label: "Colors", icon: "invert-colors_bybi8l" },
          { key: "clipart", label: "Clipart", icon: "heart-multiple-outline_rjqkb7" },
        ].map(({ key, label, icon }) => (
          <div key={key} onClick={() => {
            setActiveTab(key);
            if (key === "text") setShowAddModal(true);

          }} className="flex flex-col gap-2 cursor-pointer">
            <img
              src={`https://res.cloudinary.com/dd9tagtiw/image/upload/v1749641805/${icon}.svg`}
              alt={label}
              className="m-auto w-[23px] h-[23px]"
            />
            <p className={`text-[12px] text-center font-semibold ${activeTab === key ? "text-blue-600" : ""}`}>
              {label}
            </p>
          </div>
        ))}

      </div>

      {activeTab === "editor" && (
        <EditorTab />
      )}

      {activeTab === "edit" && lastProduct && (
        <>
          <EditTab fileInputRef={fileInputRef} handleFileChange={handleFileChange} />

          <PreviewTab lastProduct={lastProduct} updateLastProduct={updateLastProduct} />
        </>
      )}

      {activeTab === "text" && (
        <>
          {
            showAddModal && (
              <AddTextTab setShowAddModal={setShowAddModal} customText={customText } setCustomText={setCustomText} handleAddCustomText={handleAddCustomText} />
            )
          }



          {
            showEditModal && (
              <EditTextTab setShowEditModal={setShowEditModal} customText={customText} setCustomText={setCustomText} textSize={textSize} setTextSize={setTextSize} setTextSpacing={setTextSpacing} textSpacing={textSpacing}/>
            )
          }
        </>
      )}

    </div>
  );
};

export default Sidebar;
