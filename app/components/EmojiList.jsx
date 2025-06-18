import React from 'react';

const EmojiList = ({ emojis,addEmojiTextToCanvas }) => {
    return (
        <div className="grid grid-cols-2 gap-5 items-center p-3">
            {emojis.map((emoji, index) => (
                <span onClick={()=> addEmojiTextToCanvas(emoji)} key={index} className="text-3xl cursor-pointer flex justify-center items-center">
                    {emoji}
                </span>
            ))}
        </div>
    );
};

export default EmojiList;
