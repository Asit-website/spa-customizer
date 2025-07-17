import React, { useState } from 'react'

const EditTab = ({ handleAddDesignToCanvas, editor, setShowImageEditModal, setHasUploadedImage }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {

            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }
            setSelectedFile(file);
        } else {
            alert('Please select a valid image file (JPG, PNG, SVG)');
        }
    };

    const handleUploadDesign = async () => {
        if (!selectedFile || !editor?.canvas) return;
        
        setIsUploading(true);
        
        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target.result;
                
                if (handleAddDesignToCanvas) {
                    handleAddDesignToCanvas(imageUrl, "center", 0, 0);
                    
                    setTimeout(() => {
                        if (setHasUploadedImage) {
                            setHasUploadedImage(true);
                        }
                        if (setShowImageEditModal) {
                            setShowImageEditModal(true);
                        }
                    }, 500);
                }
                
                setSelectedFile(null);
            };
            
            reader.readAsDataURL(selectedFile);
        } catch (error) {
            console.error("Design upload failed:", error);
            alert("Failed to upload design. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg border border-[#D3DBDF] w-80 h-fit">
            <div className='flex items-center justify-between py-2 px-3'>
                <div className='flex items-center gap-2'>
                    <h3 className='text-[16px] font-semibold'>Edit</h3>
                </div>
                <div className='cursor-pointer'>
                    <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749341803/Vector_hm0yzo.png" alt="Close" />
                </div>
            </div>
            <hr className="border-t border-[#D3DBDF] h-px" />

            <div className='py-6 px-6'>
                <div className='flex flex-col gap-4'>
                    <h3 className='text-[14px] font-medium'>Original vector artwork best, if you have?</h3>
                    
                    <label className="block bg-[#E4E9EC] py-12 px-4 rounded-lg cursor-pointer hover:bg-[#d9e2e6] transition-colors">
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleFileSelect} 
                        />
                        <div className="text-center">
                            <div className="bg-[#3559C7] text-white px-6 py-2 rounded-md inline-block mb-3">
                                {selectedFile ? "Image Uploaded" : "Choose a file"}
                            </div>
                            <p className='text-gray-500 text-[12px]'>
                                We support JPG, PNG, EAPS<br />
                                An max 5 MB
                            </p>
                        </div>
                    </label>

                    <button 
                        onClick={handleUploadDesign}
                        disabled={!selectedFile || isUploading || !editor?.canvas}
                        className={`w-full rounded-md py-3 text-[14px] font-medium cursor-pointer transition-colors ${
                            selectedFile && !isUploading && editor?.canvas
                                ? 'text-white bg-[#3559C7] hover:bg-[#2a47a3]' 
                                : 'bg-[#E6E9F3] text-[#B8C5E8] cursor-not-allowed'
                        }`}
                    >
                        {isUploading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EditTab