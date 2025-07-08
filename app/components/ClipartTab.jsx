import React, { useState } from 'react';
import EmojiCategoryList from './EmojiCategoryList';
import EmojiList from './EmojiList';

const ClipartTab = ({ setShowClipartTab, addEmojiTextToCanvas, lastProduct, handleAddDesignToCanvas }) => {
    const [view, setView] = useState('main');
    const [selectedEmojis, setSelectedEmojis] = useState([]);

    const emojiData = [
        { category: "Smileys & People", emojis: ["😀", "😂", "😊", "😍", "😎", "😭"] },
        { category: "Animals & Nature", emojis: ["🐶", "🐱", "🦁", "🐯", "🌲", "🌸"] },
        { category: "Food & Drink", emojis: ["🍎", "🍕", "🍩", "🍺", "🥗", "🍔"] },
        { category: "Travel & Places", emojis: ["🚗", "✈️", "🏖️", "🏔️", "🚀", "🗽"] },
        { category: "Objects", emojis: ["📱", "💡", "📚", "💻", "🕰️", "🔒"] }
    ];

    const clipartList = [
        ...(lastProduct?.designs?.length > 0
            ? [{ logo: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1750165738/0cda6dd4b34dca3f32358dac9ac0d83ce0c89488_tujyyl.png", name: "Designs" }]
            : []),
        { logo: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1750165739/6ee41a6c790e3241b5fcae87139cfc2c34867022_r0tmbn.png", name: "Emoji" },
        { logo: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1750165738/0cda6dd4b34dca3f32358dac9ac0d83ce0c89488_tujyyl.png", name: "Shape" },
        { logo: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1750165737/2e2a09a694982b0069fbe4e8f22647b412021def_rpbyjg.png", name: "Illustrations" },
        { logo: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1750165737/683bca792571c84c0bbc62376ba6a5486d4a188a_y4cprw.png", name: "Typography" },
        { logo: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1750165737/7068b2cca3204e320d202468a90b39ac148a53cc_yxgrsv.png", name: "Decorative" },
        { logo: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1750165737/8ca453a37f955df70cb608571810fa9f42b2d0c9_dnrtnt.png", name: "Icons" },
        { logo: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1750165739/6ee41a6c790e3241b5fcae87139cfc2c34867022_r0tmbn.png", name: "Icons" },
        { logo: "https://res.cloudinary.com/dd9tagtiw/image/upload/v1750165738/0cda6dd4b34dca3f32358dac9ac0d83ce0c89488_tujyyl.png", name: "Thematic" },
    ];


    const handleClipartClick = (name) => {
        if (name === 'Emoji') {
            setView('emoji-categories');
        } else if (name === 'Designs') {
            setView('designs');
        }
    };

    const handleCategoryClick = (category) => {
        const selected = emojiData.find(item => item.category === category.category);
        setSelectedEmojis(selected.emojis);
        setView('emoji-list');
    };

    const handleBack = () => {
        if (view === 'emoji-list') {
            setView('emoji-categories');
        } else if (view === 'emoji-categories' || view === 'designs') {
            setView('main');
        }
    };

    const getHeaderTitle = () => {
        switch (view) {
            case 'main':
                return 'Clipart';
            case 'emoji-categories':
                return (
                    <span className='flex items-center gap-1 cursor-pointer' onClick={handleBack}>
                        <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1750138078/chevron-right_p6kmcp.svg" className="rotate-180 w-4" />
                        <span className='text-[16px] text-black font-semibold'>Emoji</span>
                    </span>
                );
            case 'emoji-list':
                return (
                    <span className='flex items-center gap-1 cursor-pointer' onClick={handleBack}>
                        <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1750138078/chevron-right_p6kmcp.svg" className="rotate-180 w-4" />
                        <span className='text-[16px] text-black font-semibold'>Emoji List</span>
                    </span>
                );
            case 'designs':
                return (
                    <span className='flex items-center gap-1 cursor-pointer' onClick={handleBack}>
                        <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1750138078/chevron-right_p6kmcp.svg" className="rotate-180 w-4" />
                        <span className='text-[16px] text-black font-semibold'>Designs</span>
                    </span>
                );
            default:
                return 'Clipart';
        }
    };

    return (
        <div className="bg-white rounded-lg border border-[#D3DBDF] w-72 h-fit max-h-[460px] overflow-y-scroll">
            <div className='flex items-center justify-between py-2 px-3'>
                <h3 className='text-[16px] text-black font-semibold'>
                    {getHeaderTitle()}
                </h3>
                <div className="cursor-pointer" onClick={() => setShowClipartTab(false)}>
                    <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749341803/Vector_hm0yzo.png" alt="Close" />
                </div>
            </div>
            <hr className="border-t border-[#D3DBDF]" />

            {view === 'main' && (
                <>
                    <div className='flex flex-col gap-3 py-3 px-3'>
                        <div className="relative">
                            <input type="search" id="default-search" className="block  w-full p-4 text-sm pr-8 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 " placeholder="Search Clipart" />
                            <div className="absolute inset-y-0 end-3 flex items-center ps-3 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 gap-y-6 mt-2 px-3 pb-4">
                        {clipartList.map((list, i) => (
                            <div key={i} onClick={() => handleClipartClick(list.name)} className="flex flex-col items-center cursor-pointer">
                                <img src={list.logo} alt={list.name} className='w-7' />
                                <span className='text-[12px] text-black font-semibold'>{list.name}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {view === 'emoji-categories' && (
                <EmojiCategoryList addEmojiTextToCanvas={addEmojiTextToCanvas} categories={emojiData} onCategoryClick={handleCategoryClick} />
            )}

            {view === 'emoji-list' && (
                <EmojiList emojis={selectedEmojis} addEmojiTextToCanvas={addEmojiTextToCanvas} />
            )}

            {view === 'designs' && (
                <div className="grid grid-cols-3 gap-2 p-3">
                    {lastProduct.designs?.map((design, index) => (
                        <img
                            key={index}
                            src={design.url}
                            alt={`design-${index}`}
                            className="w-16 h-16 object-contain cursor-pointer border border-gray-200 rounded hover:border-blue-500"
                            onClick={() => handleAddDesignToCanvas(design.url, design.position, design.offsetX, design.offsetY)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClipartTab;
