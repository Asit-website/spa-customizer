"use client"

import React from 'react'

const RightSmallPreview = () => {
  return (
    <div className='flex sm:flex-col gap-5 absolute left-1/2 transform -translate-x-1/2 sm:left-auto sm:right-7 bottom-28 sm:bottom-auto sm:top-28 z-10'>
        <div className='w-20 h-20'>
            <div className='bg-white p-3 rounded-lg border border-[#D3DBDF] flex items-center justify-center'>
                <img className='w-18' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749339416/dbc0bb00825d26e862a94ed6222ab51c6c2c6c08_ky92hj.png" alt="front" />
            </div>
            <p className='text-center text-black text-[14px]'>Front</p>
        </div>

        <div className='w-20 h-20'>
            <div className='bg-white p-3 rounded-lg border border-[#D3DBDF] flex items-center justify-center'>
                <img className='w-18' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749339416/dbc0bb00825d26e862a94ed6222ab51c6c2c6c08_ky92hj.png" alt="front" />
            </div>
            <p className='text-center text-black text-[14px]'>Back</p>
        </div>
    </div>
  )
}

export default RightSmallPreview