import React from 'react'

const EditorTab = ({setShowEditorModal}) => {
    return (
        <div className='bg-white rounded-lg border border-[#D3DBDF] w-full sm:w-80 h-fit'>
            <div className='flex items-center justify-between py-2 px-3'>
                <div className='flex items-center gap-2'>
                    <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749341726/Frame_12_mbe4a0.png" alt="AI" />
                    <h3 className='text-[16px] text-black font-semibold'>Improve with AI</h3>
                </div>
                <div onClick={()=> setShowEditorModal(false)} className="cursor-pointer">
                    <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749341803/Vector_hm0yzo.png" alt="Close" />
                </div>
            </div>
            <hr className="border-t border-[#D3DBDF] h-px" />
            <div className='py-3 px-4'>
                <div className='flex flex-col gap-2'>
                    <label htmlFor="description" className="text-[14px] text-black">Description*</label>
                    <div className='relative bg-[#E4E9EC] rounded-lg h-46'> <textarea name='description' className='p-2 text-black resize-none w-full text-[13px] h-36 border-none focus:border-none outline-none overflow-y-scroll placeholder:text-[13px]' placeholder='Describe the design in a sentence' />
                        <div className='bg-white flex gap-2 px-2 py-1 rounded-lg absolute bottom-2 right-2'>
                            <span className='text-[14px] text-black'>Prompt</span>
                            <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749343021/Frame_12_1_jktiv7.png" alt="AI" />
                        </div>
                    </div>
                    <div className='my-2 flex items-center gap-3'>
                        <span className='px-5 py-1.5 text-black text-[13px] rounded-full bg-gray-100'>Color</span>
                        <span className='px-5 py-1.5 text-[13px] rounded-full bg-gray-200 text-gray-600'>Arts</span>
                    </div>
                    <button className='disabled:bg-[#D7DEF4] text-white bg-blue-600 rounded-md py-2 disabled:text-[#AEBDEA] text-[14px]'>Generate</button>
                </div>
            </div>
        </div>
    )
}

export default EditorTab