import React from 'react';

const EmojiCategoryList = ({ categories, onCategoryClick, addEmojiTextToCanvas }) => {
    return (
        <>
            <div className='flex flex-col gap-3 py-3 px-3'>
                <div className="relative">
                    <input type="search" id="default-search" className="block w-full p-4 text-sm pr-8 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 " placeholder="Search Emoji" />
                    <div className="absolute inset-y-0 end-3 flex items-center ps-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                        </svg>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-2 pb-3">
                {categories.map((category, index) => {
                    if (category.category === "Emoji" && category.emojis?.length > 0) {
                        return (
                            <div key={index}>
                                <h3 className="px-6 py-2 text-black text-[16px] font-semibold">Emoji</h3>
                                <div className="grid grid-cols-5 gap-2 px-6 py-2">
                                    {category.emojis.map((emoji, i) => (
                                        <span
                                            key={i}
                                            onClick={() => addEmojiTextToCanvas(emoji)}
                                            className="text-[24px] cursor-pointer hover:scale-110 transition"
                                        >
                                            {emoji}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    } else {
                        return (
                            <h3
                                key={index}
                                onClick={() => onCategoryClick(category)}
                                className="cursor-pointer px-6 py-2 text-[16px] text-black hover:bg-gray-100"
                            >
                                {category.category}
                            </h3>
                        );
                    }
                })}

            </div>
        </>
    );
};

export default EmojiCategoryList;
