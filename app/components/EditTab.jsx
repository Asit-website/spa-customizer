import React from 'react'

const EditTab = ({fileInputRef,handleFileChange}) => {
    return (
        <div className="bg-white rounded-lg border border-[#D3DBDF] w-80 h-fit max-h-[530px] overflow-y-scroll">
            <div className='flex items-center justify-between py-2 px-3'>
                <div className='flex items-center gap-2'>
                    <h3 className='text-[16px] font-semibold'>Edit</h3>
                </div>
                <div className='cursor-pointer'>
                    <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749341803/Vector_hm0yzo.png" alt="Close" />
                </div>
            </div>
            <hr className="border-t border-[#D3DBDF] h-px" />

            <div className='py-3 px-4'>
                <div className='flex flex-col gap-2'>
                    <h3 className='text-[14px]'>Original vector artwork best, if you have?</h3>
                    <label className="block bg-[#E4E9EC] py-8 px-4 rounded-lg cursor-pointer">
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                        <p className="text-[#3559C7] font-semibold text-center text-[14px]">Choose a file</p>
                        <p className=' text-gray-500 mt-1 text-center text-[14px]'>We support JPG, PNG, EAPS<br />Max 5MB</p>
                    </label>

                    <button className='disabled:bg-[#D7DEF4] text-white bg-blue-600 rounded-md py-2 disabled:text-[#AEBDEA] text-[14px]'>Upload</button>
                </div>
            </div>
        </div>
    )
}

export default EditTab