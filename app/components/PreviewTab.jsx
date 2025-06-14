import React from 'react'

const PreviewTab = ({lastProduct,updateLastProduct}) => {
    return (
        <>
            <div className="bg-white rounded-lg border border-[#D3DBDF] w-80 h-fit max-h-[475px] overflow-y-scroll">
                <div className='flex items-center justify-between py-2 px-3'>
                    <div className='flex items-center gap-2'>
                        <h3 className='text-[16px] font-semibold'>Preview</h3>
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
                        <p className="font-semibold text-[14px] text-gray-500">Width x Height</p>
                        <div className='my-2 flex items-center gap-3'>
                            <span className='rounded-full bg-gray-100 py-1.5 px-3 text-gray-500 text-[13px]'>6.00 in</span>
                            <span className='rounded-full bg-gray-100 py-1.5 px-3 text-gray-500 text-[13px]'>6.00 in</span>
                        </div>
                    </div>

                </div>
                <hr className="border-t border-[#D3DBDF] h-px" />

                <div className='flex items-center justify-between py-3 px-3'>
                    <div className='flex items-center gap-2'>
                        <h3 className='text-[14px] font-semibold'>Flip</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <img className='w-[22px]' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507255/tune-vertical_ezas8p.png" alt="flip" />
                        <img className='w-[22px]' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507254/flip-vertical_ajs5ur.png" alt="flip" />
                    </div>
                </div>

                <hr className="border-t border-[#D3DBDF] h-px" />

                <div className='flex flex-col gap-3 justify-between py-3 px-3'>
                    <h3 className='text-[14px] font-semibold'>Alignment</h3>
                    <div className="grid grid-cols-7 gap-5">
                        <img className='w-[20px]' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507255/align-horizontal-left_fbsuoo.png" alt="" />
                        <img className='w-[20px]' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507255/Frame_46_rrtm82.png" alt="" />
                        <img className='w-[20px]' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507254/align-horizontal-right_adq5ap.png" alt="" />
                        <img className='w-[20px]' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507254/align-vertical-top_nmalzx.png" alt="" />
                        <img className='w-[20px]' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507254/align-vertical-center_wguxnj.png" alt="" />
                        <img className='w-[20px]' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507254/align-vertical-bottom_damnnr.png" alt="" />
                        <img className='w-[20px]' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507254/format-align-justify_qzuiww.png" alt="" />
                    </div>
                </div>

                <hr className="border-t border-[#D3DBDF] h-px" />

                <div className='flex flex-col gap-3 justify-between py-3 px-3'>
                    <label className="text-[14px] font-medium">Opacity</label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={lastProduct.opacity}
                        onChange={(e) => updateLastProduct("opacity", e.target.value)}
                        className="w-full"
                    />

                    <label className="text-[14px] font-medium">Rotate</label>
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

                <div className='flex flex-col gap-3 justify-between py-3 px-3'>
                    <h3 className='text-[14px] font-semibold'>Arrange</h3>
                    <div className="flex items-center gap-7">
                        <img className='w-[20px]' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508122/arrange-bring-forward_vigco4.png" alt="" />
                        <img className='w-[20px]' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508122/arrange-bring-to-front_povosv.png" alt="" />
                        <img className='w-[20px]' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508122/arrange-send-backward_buzw6f.png" alt="" />
                        <img className='w-[20px]' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508121/arrange-send-to-back_bcyzlu.png" alt="" />
                    </div>
                </div>

                <hr className="border-t border-[#D3DBDF] h-px" />

                <div className='flex flex-col gap-3 py-3 px-3'>
                    <h3 className='text-[14px] font-semibold'>Tools</h3>

                    <button className='border-[#D3DBDF] border rounded-md py-3 px-8  text-[14px] flex items-center justify-start gap-2'><span className='flex items-center gap-2'><img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508617/circle-opacity_zvwbfk.png" alt="" /> Remove Background</span></button>
                    <button className='border-[#D3DBDF] border rounded-md py-3 px-8  text-[14px] flex items-center justify-start gap-2'> <span className='flex items-center gap-2'><img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508617/move-resize-variant_karpuj.png" alt="" /> Upscale</span></button>
                </div>

            </div >
        </>
    )
}

export default PreviewTab