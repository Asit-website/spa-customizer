"use client";
import React, { useState } from "react";
import EditorTab from "./EditorTab";
import PreviewTab from "./PreviewTab";
import EditTab from "./EditTab";
import AddTextTab from "./AddTextTab";
import EditTextTab from "./EditTextTab";
import SelectColorsTab from "./SelectColorsTab";
import ClipartTab from "./ClipartTab";

const Sidebar = ({
  products,
  editor,
  handleAddCustomText,
  customText,
  setCustomText,
  updateLastProduct,
  showAddModal,
  showEditModal,
  setShowEditModal,
  setShowAddModal,
  textSize,
  setTextSize,
  textSpacing,
  setTextSpacing,
  textArc,
  setTextArc,
  handleColorChange,
  selectedColor,
  setSelectedColor,
  addEmojiTextToCanvas
}) => {
  const [activeTab, setActiveTab] = useState("editor");
  const lastProduct = products[products.length - 1];
  const [showClipartTab, setShowClipartTab] = useState(false);

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
          <div
            key={key}
            onClick={() => {
              setActiveTab(key);
              if (key === "text") setShowAddModal(true);
              if (key === "clipart") setShowClipartTab(true);
            }}
            className="flex flex-col gap-2 cursor-pointer"
          >
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

      {activeTab === "editor" && <EditorTab />}

      {activeTab === "edit" && lastProduct && (
        <>
          {/* <EditTab /> */}
          <PreviewTab lastProduct={lastProduct} updateLastProduct={updateLastProduct} />
        </>
      )}

      {activeTab === "text" && (
        <>
          {showAddModal && (
            <AddTextTab
              setShowAddModal={setShowAddModal}
              customText={customText}
              setCustomText={setCustomText}
              handleAddCustomText={handleAddCustomText}
            />
          )}
          {showEditModal && (
            <EditTextTab
              setShowEditModal={setShowEditModal}
              customText={customText}
              setCustomText={setCustomText}
              textSize={textSize}
              setTextSize={setTextSize}
              textSpacing={textSpacing}
              setTextSpacing={setTextSpacing}
            />
          )}
        </>
      )}

      {activeTab === "colors" && <SelectColorsTab handleColorChange={handleColorChange} selectedColor={selectedColor} setSelectedColor={setSelectedColor} />}
      {activeTab === "clipart" && (showClipartTab && <ClipartTab addEmojiTextToCanvas={addEmojiTextToCanvas} setShowClipartTab={setShowClipartTab} />)}

    </div>
  );
};

export default Sidebar;
