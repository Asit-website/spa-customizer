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
  addEmojiTextToCanvas,
  updateArrange,
  setTextColor,
  setChangeTextColor,
  setTextFontFamily,
  setChangeFontFamily,
  setFontStyle,
  setChangeFontStyle,
  setChangeFlipX,
  setChangeFlipy,
  alignFabricObject,
  setChangeTextFlipX,
  setChangeTextFlipY,
  handleImageUpload,
  bringForward,
  handleAddDesignToCanvas,
  setProducts,
  selectedProduct,
  setSelectedProduct,
  setFlipX,
  setFlipY,
  setTextFlipX,
  setTextFlipY
}) => {
  const [activeTab, setActiveTab] = useState("editor");
  const lastProduct = products[products.length - 1];
  const [showClipartTab, setShowClipartTab] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(true);
  const [showImageEditModal, setShowImageEditModal] = useState(false);
  const [showBgColorsModal, setShowBgColorsModal] = useState(false);

  const [hasUploadedImage, setHasUploadedImage] = useState(false);
  const [hasAddedText, setHasAddedText] = useState(false);

  const handleAddCustomTextWithTracking = () => {
    if (customText.trim() !== "") {
      handleAddCustomText();
      setHasAddedText(true);
      setShowAddModal(false);
      setShowEditModal(true); 
    }
  };

  const handleTabClick = (key) => {
    setShowEditorModal(false);
    setShowImageEditModal(false);
    setShowAddModal(false);
    setShowEditModal(false);
    setShowBgColorsModal(false);
    setShowClipartTab(false);

    setActiveTab(key);

    if (key === "editor") {
      setShowEditorModal(true);
    }
    if (key === "edit") {
      if (hasUploadedImage) {
        setShowImageEditModal(true); 
      } else {
        // Show edit tab for upload
      }
    }
    if (key === "text") {
      if (hasAddedText) {
        setShowEditModal(true);
      } else {
        setShowAddModal(true);
      }
    }
    if (key === "colors") {
      setShowBgColorsModal(true);
    }
    if (key === "clipart") {
      setShowClipartTab(true);
    }
  };

  return (
    <div className="absolute top-24 sm:top-28 left-7 w-[35%] flex gap-5 z-50 flex-col sm:flex-row">
      <div className="bg-white p-5 rounded-lg border border-[#D3DBDF] flex flex-row sm:flex-col h-fit items-center justify-between sm:justify-normal gap-6">
        {[
          { key: "editor", label: "Editor", icon: "Frame_4_vzkhrn" },
          { key: "edit", label: "Edit", icon: "pencil-outline_c6lwsj" },
          { key: "text", label: "Text", icon: "text-recognition_emsdp8" },
          { key: "colors", label: "Colors", icon: "invert-colors_bybi8l" },
          { key: "clipart", label: "Clipart", icon: "heart-multiple-outline_rjqkb7" },
        ].map(({ key, label, icon }) => (
          <div
            key={key}
            onClick={() => handleTabClick(key)}
            className="flex flex-col gap-2 cursor-pointer"
          >
            <img
              src={`https://res.cloudinary.com/dd9tagtiw/image/upload/v1749641805/${icon}.svg`}
              alt={label}
              className="m-auto w-[23px] h-[23px]"
            />
            <p className={`text-[12px] text-black text-center font-semibold ${activeTab === key ? "text-blue-600" : ""}`}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Editor Tab */}
      {activeTab === "editor" && showEditorModal && (
        <EditorTab setShowEditorModal={setShowEditorModal} />
      )}

      {/* Edit Tab Flow */}
      {activeTab === "edit" && (
        <>
          {!hasUploadedImage && (
            <EditTab 
              handleAddDesignToCanvas={handleAddDesignToCanvas} 
              editor={editor}
              setShowImageEditModal={setShowImageEditModal}
              setHasUploadedImage={setHasUploadedImage}
            />
          )}
          {hasUploadedImage && showImageEditModal && (
            <PreviewTab
              editor={editor}
              setShowImageEditModal={setShowImageEditModal}
              updateArrange={updateArrange}
            />
          )}
        </>
      )}

      {/* Text Tab Flow */}
      {activeTab === "text" && (
        <>
          {!hasAddedText && showAddModal && (
            <AddTextTab
              setShowAddModal={setShowAddModal}
              customText={customText}
              setCustomText={setCustomText}
              handleAddCustomText={handleAddCustomTextWithTracking}
            />
          )}
          {hasAddedText && showEditModal && (
            <EditTextTab
              setTextColor={setTextColor}
              setChangeTextColor={setChangeTextColor}
              editor={editor}
              setShowEditModal={setShowEditModal}
              customText={customText}
              setCustomText={setCustomText}
              textSize={textSize}
              setTextSize={setTextSize}
              textSpacing={textSpacing}
              setTextSpacing={setTextSpacing}
              setTextFontFamily={setTextFontFamily}
              setChangeFontFamily={setChangeFontFamily}
              setChangeFontStyle={setChangeFontStyle}
              setFontStyle={setFontStyle}
              setChangeTextFlipX={setChangeTextFlipX}
              setChangeTextFlipY={setChangeTextFlipY}
              bringForward={bringForward}
            />
          )}
        </>
      )}

      {/* Colors Tab */}
      {activeTab === "colors" && showBgColorsModal && (
        <SelectColorsTab
          setShowBgColorsModal={setShowBgColorsModal}
          handleColorChange={handleColorChange}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
        />
      )}

      {/* Clipart Tab */}
      {activeTab === "clipart" && showClipartTab && (
        <ClipartTab
          addEmojiTextToCanvas={addEmojiTextToCanvas}
          setShowClipartTab={setShowClipartTab}
          lastProduct={lastProduct}
          handleAddDesignToCanvas={handleAddDesignToCanvas}
        />
      )}
    </div>
  );
};

export default Sidebar;