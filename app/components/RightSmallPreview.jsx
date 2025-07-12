"use client"

import React from 'react'

const RightSmallPreview = ({products}) => {

    const lastProduct = products[products.length - 1];

    return (
        <div className='flex sm:flex-col gap-5 absolute left-1/2 transform -translate-x-1/2 sm:left-auto sm:right-7 bottom-28 sm:bottom-auto sm:top-28 z-10'>
            <div className='w-20 h-20'>
                <div className='bg-white p-3 rounded-lg border border-[#D3DBDF] flex items-center justify-center'>
                    <img className='w-18 h-12 object-contain' src={lastProduct?.image || '/placeholder-image.jpg'} alt="front" />
                </div>
                <p className='text-center text-black text-[14px]'>Front</p>
            </div>

            <div className='w-20 h-20'>
                <div className='bg-white p-3 rounded-lg border border-[#D3DBDF] flex items-center justify-center'>
                    <img className='w-18 h-12 object-contain' src={lastProduct?.image || '/placeholder-image.jpg'} alt="front" />
                </div>
                <p className='text-center text-black text-[14px]'>Back</p>
            </div>
        </div>
    )
}

export default RightSmallPreview