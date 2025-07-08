import React from 'react'

const AddTextTab = ({ setShowAddModal, customText, setCustomText, handleAddCustomText }) => {
    return (
        <div className='bg-white rounded-lg border border-[#D3DBDF] w-80 h-fit'>
            <div className='flex items-center justify-between py-2 px-3'>
                <div className='flex items-center gap-2'>
                    <h3 className='text-[16px] text-black font-semibold'>Add text</h3>
                </div>
                <div className="cursor-pointer" onClick={() => setShowAddModal(false)}>
                    <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749341803/Vector_hm0yzo.png" alt="Close" />
                </div>
            </div>
            <hr className="border-t border-[#D3DBDF] h-px" />
            <div className='py-3 px-4'>
                <div className='flex flex-col gap-2'>
                    <input type="text" value={customText}
                        onChange={(e) => setCustomText(e.target.value)} name="" id="" placeholder="Add Headline" className="border border-[#D3DBDF] text-black rounded-lg p-3 min-h-20 placeholder:font-semibold" />
                </div>
                <button onClick={handleAddCustomText} className={` rounded-md mt-3 py-3  w-full text-[16px] cursor-pointer ${customText.trim() !== "" ? "text-white bg-blue-600" : "bg-[#D7DEF4] text-[#AEBDEA]"}`}>Add text</button>
            </div>
        </div>
    )
}

export default AddTextTab