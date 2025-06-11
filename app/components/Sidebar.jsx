"use client";
import React, { useRef, useState } from "react";

const Sidebar = ({ products, setProducts, handleAddCustomText, customText, setCustomText, updateLastProduct }) => {
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
      <div className="bg-white p-5 rounded-lg border border-[#D3DBDF] flex flex-col h-fit items-center gap-7">
        {[
          { key: "editor", label: "Editor", icon: "Frame_4_vzkhrn" },
          { key: "edit", label: "Edit", icon: "pencil-outline_c6lwsj" },
          { key: "text", label: "Text", icon: "text-recognition_emsdp8" },
          { key: "colors", label: "Colors", icon: "invert-colors_bybi8l" },
          { key: "clipart", label: "Clipart", icon: "heart-multiple-outline_rjqkb7" },
        ].map(({ key, label, icon }) => (
          <div key={key} onClick={() => setActiveTab(key)} className="flex flex-col gap-2 cursor-pointer">
            <img
              src={`https://res.cloudinary.com/dd9tagtiw/image/upload/v1749641805/${icon}.svg`}
              alt={label}
              className="m-auto"
            />
            <p className={`text-[14px] text-center font-semibold ${activeTab === key ? "text-blue-600" : ""}`}>
              {label}
            </p>
          </div>
        ))}

      </div>

      {activeTab === "editor" && (
        <div className='bg-white rounded-lg border border-[#D3DBDF] w-80 h-fit'>
          <div className='flex items-center justify-between py-2 px-3'>
            <div className='flex items-center gap-2'>
              <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749341726/Frame_12_mbe4a0.png" alt="AI" />
              <h3 className='text-[18px] font-semibold'>Improve with AI</h3>
            </div>
            <div>
              <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749341803/Vector_hm0yzo.png" alt="Close" />
            </div>
          </div>
          <hr className="border-t border-[#D3DBDF] h-px" />
          <div className='py-3 px-4'>
            <div className='flex flex-col gap-2'>
              <label htmlFor="description">Description*</label>
              <div className='relative bg-[#E4E9EC] rounded-lg h-46'> <textarea name='description' className='p-2 resize-none w-full h-36 border-none focus:border-none outline-none overflow-y-scroll placeholder:text-[14px]' placeholder='Describe the design in a sentence' />
                <div className='bg-white flex gap-2 px-2 py-1 rounded-lg absolute bottom-2 right-2'>
                  <span className='text-[14px]'>Prompt</span>
                  <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749343021/Frame_12_1_jktiv7.png" alt="AI" />
                </div>
              </div>
              <div className='my-2 flex items-center gap-3'>
                <span className='px-5 py-1.5 rounded-full bg-gray-100'>Color</span>
                <span className='px-5 py-1.5 rounded-full bg-gray-200 text-gray-500'>Arts</span>
              </div>
              <button className='bg-[#D7DEF4] rounded-md py-3 text-[#AEBDEA] text-[16px]'>Generate</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "edit" && lastProduct && (
        <div className="bg-white rounded-lg border border-[#D3DBDF] w-80 h-fit max-h-[530px] overflow-y-scroll">

          {/* <div className='flex items-center justify-between py-2 px-3'>
          <div className='flex items-center gap-2'>
            <h3 className='text-[18px] font-semibold'>Edit</h3>
          </div>
          <div>
            <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749341803/Vector_hm0yzo.png" alt="Close" />
          </div>
        </div>
        <hr className="border-t border-[#D3DBDF] h-px" />

        <div className='py-3 px-4'>
          <div className='flex flex-col gap-2'>
            <h3>Original vector artwork best, if you have?</h3>
            <label className="block bg-[#E4E9EC] py-8 px-4 rounded-lg cursor-pointer">
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
              <p className="text-[#3559C7] font-semibold text-center">Choose a file</p>
              <p className='text-sm text-gray-500 mt-1 text-center'>We support JPG, PNG, EAPS<br />Max 5MB</p>
            </label>

            <button className='bg-[#D7DEF4] rounded-md py-3 text-[#AEBDEA] text-[16px]'>Upload</button>
          </div>
        </div> */}

          <div className='flex items-center justify-between py-2 px-3'>
            <div className='flex items-center gap-2'>
              <h3 className='text-[18px] font-semibold'>Preview</h3>
            </div>
            <div>
              <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749341803/Vector_hm0yzo.png" alt="Close" />
            </div>
          </div>
          <hr className="border-t border-[#D3DBDF] h-px" />

          <div className='flex items-center gap-2 py-1 px-3'>
            <div className="border border-[#D3DBDF] rounded-lg p-2 w-[35%]">
              <img
                src={lastProduct.image}
                alt="Preview"
                className="max-h-14 object-contain m-auto"
              />
            </div>

            <div className="p-2 w-[65%]">
              <p className="font-semibold text-[16px] text-gray-500">Width x Height</p>
              <div className='my-2 flex items-center gap-3'>
                <span className='rounded-full bg-gray-100 py-1.5 px-3 text-gray-500 text-[14px]'>6.00 in</span>
                <span className='rounded-full bg-gray-100 py-1.5 px-3 text-gray-500 text-[14px]'>6.00 in</span>
              </div>
            </div>

          </div>
          <hr className="border-t border-[#D3DBDF] h-px" />

          <div className='flex items-center justify-between py-4 px-3'>
            <div className='flex items-center gap-2'>
              <h3 className='text-[16px] font-semibold'>Flip</h3>
            </div>
            <div className="flex items-center gap-3">
              <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507255/tune-vertical_ezas8p.png" alt="flip" />
              <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507254/flip-vertical_ajs5ur.png" alt="flip" />
            </div>
          </div>

          <hr className="border-t border-[#D3DBDF] h-px" />

          <div className='flex flex-col gap-3 justify-between py-4 px-3'>
            <h3 className='text-[16px] font-semibold'>Alignment</h3>
            <div className="grid grid-cols-7 gap-5">
              <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507255/align-horizontal-left_fbsuoo.png" alt="" />
              <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507255/Frame_46_rrtm82.png" alt="" />
              <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507254/align-horizontal-right_adq5ap.png" alt="" />
              <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507254/align-vertical-top_nmalzx.png" alt="" />
              <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507254/align-vertical-center_wguxnj.png" alt="" />
              <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507254/align-vertical-bottom_damnnr.png" alt="" />
              <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507254/format-align-justify_qzuiww.png" alt="" />
            </div>
          </div>

          <hr className="border-t border-[#D3DBDF] h-px" />

          <div className='flex flex-col gap-3 justify-between py-4 px-3'>
            <label className="text-[16px] font-medium">Opacity</label>
            <input
              type="range"
              min="0"
              max="100"
              value={lastProduct.opacity}
              onChange={(e) => updateLastProduct("opacity", e.target.value)}
              className="w-full"
            />

            <label className="text-[16px] font-medium">Rotate</label>
            <input
              type="range"
              min="0"
              max="360"
              value={lastProduct.rotate}
              onChange={(e) => updateLastProduct("rotate", e.target.value)}
              className="w-full"
            />
          </div>
          <hr className="border-t border-[#D3DBDF] h-px" />

          <div className='flex flex-col gap-3 justify-between py-4 px-3'>
            <h3 className='text-[16px] font-semibold'>Arrange</h3>
            <div className="flex items-center gap-7">
              <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508122/arrange-bring-forward_vigco4.png" alt="" />
              <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508122/arrange-bring-to-front_povosv.png" alt="" />
              <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508122/arrange-send-backward_buzw6f.png" alt="" />
              <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508121/arrange-send-to-back_bcyzlu.png" alt="" />
            </div>
          </div>

          <hr className="border-t border-[#D3DBDF] h-px" />

          <div className='flex flex-col gap-3 py-4 px-3'>
            <h3 className='text-[16px] font-semibold'>Tools</h3>

            <button className='border-[#D3DBDF] border rounded-md py-3 px-8  text-[16px] flex items-center justify-start gap-2'><img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508617/circle-opacity_zvwbfk.png" alt="" /> Remove Background</button>
            <button className='border-[#D3DBDF] border rounded-md py-3 px-8  text-[16px] flex items-center justify-start gap-2'> <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508617/move-resize-variant_karpuj.png" alt="" /> Upscale</button>
          </div>

        </div>
      )}

      {activeTab === "text" && (
        <div className='bg-white rounded-lg border border-[#D3DBDF] w-80 h-fit'>
          <div className='flex items-center justify-between py-2 px-3'>
            <div className='flex items-center gap-2'>
              <h3 className='text-[18px] font-semibold'>Add text</h3>
            </div>
            <div>
              <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749341803/Vector_hm0yzo.png" alt="Close" />
            </div>
          </div>
          <hr className="border-t border-[#D3DBDF] h-px" />
          <div className='py-3 px-4'>
            <div className='flex flex-col gap-2'>
              <input type="text" value={customText}
                onChange={(e) => setCustomText(e.target.value)} name="" id="" placeholder="Add Headline" className="border border-[#D3DBDF] rounded-lg p-3 min-h-20 placeholder:font-semibold" />
              <input type="text" name="" id="" placeholder="Add Paragraph" className="border border-[#D3DBDF] rounded-lg p-3 placeholder:font-semibold" />
            </div>
            <button onClick={handleAddCustomText} className='bg-[#D7DEF4] rounded-md mt-5 py-3 text-[#AEBDEA] w-full text-[16px] cursor-pointer'>Add text</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Sidebar;
