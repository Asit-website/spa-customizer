import React from 'react'

const ClipartTab = () => {

    const clipartList = [
        {
            logo: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1750165739/6ee41a6c790e3241b5fcae87139cfc2c34867022_r0tmbn.png",
            name: "Emoji",
        },
        {
            logo: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1750165738/0cda6dd4b34dca3f32358dac9ac0d83ce0c89488_tujyyl.png",
            name: "Shape",
        },
        {
            logo: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1750165737/2e2a09a694982b0069fbe4e8f22647b412021def_rpbyjg.png",
            name: "Illustrations",
        },
        {
            logo: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1750165737/683bca792571c84c0bbc62376ba6a5486d4a188a_y4cprw.png",
            name: "Typography",
        },
        {
            logo: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1750165737/7068b2cca3204e320d202468a90b39ac148a53cc_yxgrsv.png",
            name: "Decorative",
        },
        {
            logo: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1750165737/8ca453a37f955df70cb608571810fa9f42b2d0c9_dnrtnt.png",
            name: "Icons",
        },
        {
            logo: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1750165739/6ee41a6c790e3241b5fcae87139cfc2c34867022_r0tmbn.png",
            name: "Icons",
        },
        {
            logo: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1750165738/0cda6dd4b34dca3f32358dac9ac0d83ce0c89488_tujyyl.png",
            name: "Thematic",
        },
    ]

    return (
        <>
            <div className="bg-white rounded-lg border border-[#D3DBDF] w-72 h-fit max-h-[460px] overflow-y-scroll">
                <div className='flex items-center justify-between py-2 px-3'>
                    <div className='flex items-center gap-2'>
                        <h3 className='text-[16px] font-semibold'>Clipart</h3>
                    </div>
                    <div className="cursor-pointer" >
                        <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749341803/Vector_hm0yzo.png" alt="Close" />
                    </div>
                </div>
                <hr className="border-t border-[#D3DBDF] h-px" />

                <div className='flex flex-col gap-3 py-3 px-3'>
                    <div class="relative">
                        <input type="search" id="default-search" class="block w-full p-4 text-sm pr-8 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search Clipart" />
                        <div class="absolute inset-y-0 end-3 flex items-center ps-3 pointer-events-none">
                            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                            </svg>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 gap-y-6 mt-2">
                        {
                            clipartList.map((list, index) => {
                                return (
                                    <div key={index} className="flex flex-col gap-2 items-center justify-center cursor-pointer">
                                        <img src={list.logo} alt={list.name} className='w-7' />
                                        <span className='text-[12px] font-semibold'>{list.name}</span>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        </>
    )
}

export default ClipartTab