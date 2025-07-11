import React, { useState } from 'react'

const EditTab = ({ handleImageUpload }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleUploadClick = async () => {
        if (!selectedFile) return;
        
        setIsUploading(true);
        
        // Create a fake event object to pass to handleImageUpload
        const fakeEvent = {
            target: {
                files: [selectedFile]
            }
        };
        
        try {
            await handleImageUpload(fakeEvent);
            setSelectedFile(null); // Clear selection after successful upload
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setIsUploading(false);
        }
    };

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
                    <h3 className='text-[14px]'>Upload your design</h3>
                    <label className="block bg-[#E4E9EC] py-8 px-4 rounded-lg cursor-pointer">
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleFileSelect} 
                        />
                        <p className="text-[#3559C7] font-semibold text-center text-[14px]">
                            {selectedFile ? selectedFile.name : "Choose a file"}
                        </p>
                        <p className='text-gray-500 mt-1 text-center text-[14px]'>
                            We support JPG, PNG, SVG<br />Max 5MB
                        </p>
                    </label>

                    <button 
                        onClick={handleUploadClick}
                        disabled={!selectedFile || isUploading}
                        className={`rounded-md py-2 text-[14px] font-semibold ${
                            selectedFile && !isUploading 
                                ? 'text-white bg-blue-600 hover:bg-blue-700' 
                                : 'bg-[#D7DEF4] text-[#AEBDEA] cursor-not-allowed'
                        }`}
                    >
                        {isUploading ? 'Uploading...' : 'Upload Design'}
                    </button>
                    
                    {selectedFile && (
                        <p className="text-xs text-gray-600 mt-1">
                            Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default EditTab