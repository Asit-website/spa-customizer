"use client"

import React, { useEffect, useCallback } from 'react'

const PreviewTab = ({
    updateArrange,
    setShowImageEditModal,
    constrainObjectToProduct,
    applyClippingToObject, 
    editor
}) => {

    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    const canvas = editor?.canvas;

    const [isRemovingBg, setIsRemovingBg] = React.useState(false);

    const isCanvasReady = useCallback(() => {
        return canvas && canvas._objects !== undefined && editor && editor.canvas;
    }, [canvas, editor]);

    const getActiveDesignObject = useCallback(() => {
        if (!isCanvasReady()) {
            return null;
        }

        const activeObj = canvas.getActiveObject();
        if (activeObj && activeObj.type === "image" && !activeObj.isTshirtBase) {
            return activeObj;
        }

        const objects = canvas.getObjects();
        const designObjects = objects.filter(obj =>
            obj.type === "image" &&
            !obj.isTshirtBase &&
            obj.name === "design-image"
        );

        if (designObjects.length > 0) {
            return designObjects[designObjects.length - 1];
        }

        return null;
    }, [canvas, isCanvasReady]);

    const handleAlign = useCallback((alignment) => {
        if (!isCanvasReady()) return;

        const designObj = getActiveDesignObject();
        if (!designObj) return;

        try {
            const productImage = canvas.getObjects().find(obj => obj.isTshirtBase);
            if (!productImage) {
                console.warn("Product image not found, cannot align to product");
                return;
            }

            const productBounds = productImage.getBoundingRect();
            const padding = 10; 

            const productLeft = productBounds.left + padding;
            const productRight = productBounds.left + productBounds.width - padding;
            const productTop = productBounds.top + padding;
            const productBottom = productBounds.top + productBounds.height - padding;
            const productCenterX = productBounds.left + productBounds.width / 2;
            const productCenterY = productBounds.top + productBounds.height / 2;

            const objWidth = designObj.width * designObj.scaleX;
            const objHeight = designObj.height * designObj.scaleY;

            switch (alignment) {
                case 'left':
                    designObj.set({ left: productLeft + objWidth / 2 });
                    break;
                case 'center':
                    designObj.set({ left: productCenterX });
                    break;
                case 'right':
                    designObj.set({ left: productRight - objWidth / 2 });
                    break;
                case 'top':
                    designObj.set({ top: productTop + objHeight / 2 });
                    break;
                case 'middle':
                    designObj.set({ top: productCenterY });
                    break;
                case 'bottom':
                    designObj.set({ top: productBottom - objHeight / 2 });
                    break;
            }

            // Apply constraints to keep within bounds
            constrainObjectToProduct(designObj, productImage);

            // 🔥 IMPORTANT: Apply clipping mask after alignment
            if (applyClippingToObject && typeof applyClippingToObject === 'function') {
                applyClippingToObject(designObj, productImage);
                console.log('✂️ Clipping mask applied after alignment');
            }

            designObj.setCoords();
            canvas.renderAll();
            
            console.log(`✅ Design aligned to ${alignment} with clipping mask`);
        } catch (error) {
            console.error("Error aligning design:", error);
        }
    }, [canvas, getActiveDesignObject, isCanvasReady, constrainObjectToProduct, applyClippingToObject]);

    const handleFlip = useCallback((direction) => {
        if (!isCanvasReady()) return;

        const designObj = getActiveDesignObject();
        if (!designObj) return;

        try {
            if (direction === 'horizontal') {
                const newFlipX = !designObj.flipX;
                designObj.set('flipX', newFlipX);
            } else if (direction === 'vertical') {
                const newFlipY = !designObj.flipY;
                designObj.set('flipY', newFlipY);
            }

            // Apply clipping after flip as well
            const productImage = canvas.getObjects().find(obj => obj.isTshirtBase);
            if (productImage && applyClippingToObject) {
                applyClippingToObject(designObj, productImage);
            }

            designObj.setCoords();
            canvas.renderAll();
        } catch (error) {
            console.error("Error flipping design:", error);
        }
    }, [canvas, getActiveDesignObject, isCanvasReady, applyClippingToObject]);

    const handleOpacityChange = useCallback((value) => {
        if (!isCanvasReady()) return;

        const designObj = getActiveDesignObject();
        if (!designObj) return;

        try {
            const opacityValue = Math.max(0, Math.min(100, value)) / 100;
            designObj.set('opacity', opacityValue);
            designObj.setCoords();
            canvas.renderAll();
        } catch (error) {
            console.error("Error changing design opacity:", error);
        }
    }, [canvas, getActiveDesignObject, isCanvasReady]);

    const handleRotateChange = useCallback((value) => {
        if (!isCanvasReady()) return;

        const designObj = getActiveDesignObject();
        if (!designObj) return;

        try {
            const rotationValue = parseInt(value) || 0;
            designObj.set('angle', rotationValue);

            // Apply clipping after rotation
            const productImage = canvas.getObjects().find(obj => obj.isTshirtBase);
            if (productImage && applyClippingToObject) {
                applyClippingToObject(designObj, productImage);
            }

            designObj.setCoords();
            canvas.renderAll();
        } catch (error) {
            console.error("Error rotating design:", error);
        }
    }, [canvas, getActiveDesignObject, isCanvasReady, applyClippingToObject]);

    const handleArrange = useCallback((action) => {
        if (!isCanvasReady()) return;

        const designObj = getActiveDesignObject();
        if (!designObj) return;

        try {
            if (updateArrange && typeof updateArrange === 'function') {
                canvas.setActiveObject(designObj);
                updateArrange(action);
            }

            // Apply clipping after arrange
            const productImage = canvas.getObjects().find(obj => obj.isTshirtBase);
            if (productImage && applyClippingToObject) {
                applyClippingToObject(designObj, productImage);
            }

            canvas.renderAll();
        } catch (error) {
            console.error("Error arranging design:", error);
        }
    }, [canvas, getActiveDesignObject, updateArrange, isCanvasReady, applyClippingToObject]);

    const getFlipStates = useCallback(() => {
        const designObj = getActiveDesignObject();
        return {
            flipX: designObj?.flipX || false,
            flipY: designObj?.flipY || false
        };
    }, [getActiveDesignObject]);

    const getDesignProperties = useCallback(() => {
        const designObj = getActiveDesignObject();
        if (!designObj) return null;

        return {
            opacity: Math.round((designObj.opacity || 1) * 100),
            rotation: Math.round(designObj.angle || 0),
            width: Math.round(designObj.width || 0),
            height: Math.round(designObj.height || 0),
            imageSrc: designObj.getSrc ? designObj.getSrc() : null
        };
    }, [getActiveDesignObject]);

    const flipStates = getFlipStates();
    const designProps = getDesignProperties();

    const [, forceUpdate] = React.useReducer(x => x + 1, 0);

    useEffect(() => {
        const interval = setInterval(() => {
            if (getActiveDesignObject()) {
                forceUpdate();
            }
        }, 100);

        return () => clearInterval(interval);
    }, [getActiveDesignObject]);

    const handleRemoveBackground = useCallback(async () => {
        if (!isCanvasReady()) return;

        const designObj = getActiveDesignObject();
        if (!designObj) return;

        try {
            setIsRemovingBg(true);

            const currentImageSrc = designObj.getSrc();
            if (!currentImageSrc) {
                console.error("No image source found");
                return;
            }

            const response = await fetch(currentImageSrc);
            const blob = await response.blob();

            const form = new FormData();
            form.append("image_file", blob);

            const clipdropResponse = await fetch("https://clipdrop-api.co/remove-background/v1", {
                method: "POST",
                headers: {
                    "x-api-key": apiKey,
                },
                body: form,
            });

            if (clipdropResponse.ok) {
                const buffer = await clipdropResponse.arrayBuffer();
                const resultBlob = new Blob([buffer], { type: "image/png" });
                const resultImageUrl = URL.createObjectURL(resultBlob);

                import("fabric").then(({ Image }) => {
                    const img = new window.Image();
                    img.crossOrigin = "anonymous";
                    img.onload = () => {
                        const newFabricImg = new Image(img, {
                            left: designObj.left,
                            top: designObj.top,
                            originX: designObj.originX,
                            originY: designObj.originY,
                            scaleX: designObj.scaleX,
                            scaleY: designObj.scaleY,
                            angle: designObj.angle,
                            opacity: designObj.opacity,
                            flipX: designObj.flipX,
                            flipY: designObj.flipY,
                            name: "design-image",
                            selectable: true,
                            evented: true,
                            hasControls: true,
                            hasBorders: true,
                            moveCursor: "move",
                            lockMovementX: false,
                            lockMovementY: false,
                            lockScalingX: false,
                            lockScalingY: false,
                            lockRotation: false
                        });

                        canvas.remove(designObj);
                        canvas.add(newFabricImg);
                        canvas.setActiveObject(newFabricImg);

                        // Apply clipping to the new background-removed image
                        const productImage = canvas.getObjects().find(obj => obj.isTshirtBase);
                        if (productImage && applyClippingToObject) {
                            setTimeout(() => {
                                applyClippingToObject(newFabricImg, productImage);
                                console.log('✂️ Clipping applied to background-removed image');
                            }, 100);
                        }

                        canvas.renderAll();
                    };
                    img.src = resultImageUrl;
                });
            } else {
                alert("Failed to remove the background. Please try again.");
            }
        } catch (error) {
            alert("An error occurred while removing the background. Please try again.");
        } finally {
            setIsRemovingBg(false);
        }
    }, [canvas, getActiveDesignObject, isCanvasReady, applyClippingToObject]);

    const handleUpscale = useCallback(() => {
        console.log("Upscale design clicked");
    }, []);

    return (
        <div className="bg-white rounded-lg border border-[#D3DBDF] w-80 h-fit max-h-[600px] overflow-y-auto">
            <style jsx>{`
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    height: 16px;
                    width: 16px;
                    border-radius: 50%;
                    background: #3559C7;
                    cursor: pointer;
                    border: 2px solid #ffffff;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                .slider::-moz-range-thumb {
                    height: 16px;
                    width: 16px;
                    border-radius: 50%;
                    background: #3559C7;
                    cursor: pointer;
                    border: 2px solid #ffffff;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
            `}</style>
            <div className='flex items-center justify-between py-2 px-3'>
                <div className='flex items-center gap-2'>
                    <h3 className='text-[16px] text-black font-semibold'>Preview</h3>
                </div>
                <div
                    onClick={() => setShowImageEditModal && setShowImageEditModal(false)}
                    className='cursor-pointer'
                >
                    <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749341803/Vector_hm0yzo.png" alt="Close" />
                </div>
            </div>
            <hr className="border-t border-[#D3DBDF] h-px" />

            {designProps ? (
                <>
                    <div className='flex items-center gap-3 py-3 px-3'>
                        <div className="border border-[#D3DBDF] rounded-lg p-2 w-[30%]">
                            {designProps.imageSrc ? (
                                <img
                                    src={designProps.imageSrc}
                                    alt="Design"
                                    className="w-full h-12 object-contain rounded"
                                />
                            ) : (
                                <div className="w-full h-12 bg-gray-100 rounded flex items-center justify-center">
                                    <span className="text-xs text-gray-500">Design</span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-[12px] text-gray-600 mb-2">Width x Height</p>
                            <div className='flex items-center gap-2'>
                                <span className='rounded-full bg-gray-100 py-1 px-2 text-gray-600 text-[11px]'>
                                    {(designProps.width / 50).toFixed(2)} in
                                </span>
                                <span className='rounded-full bg-gray-100 py-1 px-2 text-gray-600 text-[11px]'>
                                    {(designProps.height / 50).toFixed(2)} in
                                </span>
                            </div>
                        </div>
                    </div>
                    <hr className="border-t border-[#D3DBDF] h-px" />

                    <div className='flex items-center justify-between py-3 px-3'>
                        <h3 className='text-[14px] text-black font-semibold'>Flip</h3>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleFlip('horizontal')}
                                className={`p-1 rounded ${flipStates.flipX ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                            >
                                <img
                                    className="w-[20px] h-[20px]"
                                    src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507255/tune-vertical_ezas8p.png"
                                    alt="Flip Horizontal"
                                />
                            </button>
                            <button
                                onClick={() => handleFlip('vertical')}
                                className={`p-1 rounded ${flipStates.flipY ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                            >
                                <img
                                    className="w-[20px] h-[20px]"
                                    src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507254/flip-vertical_ajs5ur.png"
                                    alt="Flip Vertical"
                                />
                            </button>
                        </div>
                    </div>
                    <hr className="border-t border-[#D3DBDF] h-px" />

                    <div className='py-3 px-3'>
                        <h3 className='text-[14px] text-black font-semibold mb-3'>Alignment</h3>
                        <div className="grid grid-cols-6 gap-2">
                            <button onClick={() => handleAlign("left")} className='p-2 hover:bg-gray-100 rounded'>
                                <img className='w-[18px] h-[18px] mx-auto' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507255/align-horizontal-left_fbsuoo.png" alt="Left" />
                            </button>
                            <button onClick={() => handleAlign("center")} className='p-2 hover:bg-gray-100 rounded'>
                                <img className='w-[18px] h-[18px] mx-auto' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507255/Frame_46_rrtm82.png" alt="Center" />
                            </button>
                            <button onClick={() => handleAlign("right")} className='p-2 hover:bg-gray-100 rounded'>
                                <img className='w-[18px] h-[18px] mx-auto' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507254/align-horizontal-right_adq5ap.png" alt="Right" />
                            </button>
                            <button onClick={() => handleAlign("top")} className='p-2 hover:bg-gray-100 rounded'>
                                <img className='w-[18px] h-[18px] mx-auto' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507254/align-vertical-top_nmalzx.png" alt="Top" />
                            </button>
                            <button onClick={() => handleAlign("middle")} className='p-2 hover:bg-gray-100 rounded'>
                                <img className='w-[18px] h-[18px] mx-auto' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507254/align-vertical-center_wguxnj.png" alt="Middle" />
                            </button>
                            <button onClick={() => handleAlign("bottom")} className='p-2 hover:bg-gray-100 rounded'>
                                <img className='w-[18px] h-[18px] mx-auto' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507254/align-vertical-bottom_damnnr.png" alt="Bottom" />
                            </button>
                        </div>
                    </div>
                    <hr className="border-t border-[#D3DBDF] h-px" />

                    <div className='py-3 px-3'>
                        <label className="text-[14px] text-black font-semibold block mb-2">Opacity</label>
                        <div className='flex items-center gap-2'>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={designProps?.opacity || 100}
                                onChange={(e) => handleOpacityChange(parseInt(e.target.value))}
                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                style={{
                                    background: `linear-gradient(to right, #3559C7 0%, #3559C7 ${designProps?.opacity || 100}%, #e5e7eb ${designProps?.opacity || 100}%, #e5e7eb 100%)`
                                }}
                            />
                            <span className='border border-[#D3DBDF] min-w-12 text-center rounded-md text-[12px] py-1 px-2'>
                                {designProps?.opacity || 100}%
                            </span>
                        </div>
                    </div>
                    <hr className="border-t border-[#D3DBDF] h-px" />

                    <div className='py-3 px-3'>
                        <label className="text-[14px] text-black font-semibold block mb-2">Rotate</label>
                        <div className='flex items-center gap-2'>
                            <input
                                type="range"
                                min="0"
                                max="360"
                                value={designProps?.rotation || 0}
                                onChange={(e) => handleRotateChange(parseInt(e.target.value))}
                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                style={{
                                    background: `linear-gradient(to right, #3559C7 0%, #3559C7 ${((designProps?.rotation || 0) / 360) * 100}%, #e5e7eb ${((designProps?.rotation || 0) / 360) * 100}%, #e5e7eb 100%)`
                                }}
                            />
                            <span className='border border-[#D3DBDF] min-w-12 text-center rounded-md text-[12px] py-1 px-2'>
                                {designProps?.rotation || 0}°
                            </span>
                        </div>
                    </div>
                    <hr className="border-t border-[#D3DBDF] h-px" />

                    <div className='py-3 px-3'>
                        <h3 className='text-[14px] text-black font-semibold mb-3'>Arrange</h3>
                        <div className="flex items-center gap-4">
                            <button onClick={() => handleArrange("bringForward")} className='p-2 hover:bg-gray-100 rounded'>
                                <img className='w-[18px] h-[18px]' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508122/arrange-bring-forward_vigco4.png" alt="Forward" />
                            </button>
                            <button onClick={() => handleArrange("bringToFront")} className='p-2 hover:bg-gray-100 rounded'>
                                <img className='w-[18px] h-[18px]' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508122/arrange-bring-to-front_povosv.png" alt="Front" />
                            </button>
                            <button onClick={() => handleArrange("sendBackward")} className='p-2 hover:bg-gray-100 rounded'>
                                <img className='w-[18px] h-[18px]' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508122/arrange-send-backward_buzw6f.png" alt="Backward" />
                            </button>
                            <button onClick={() => handleArrange("sendToBack")} className='p-2 hover:bg-gray-100 rounded'>
                                <img className='w-[18px] h-[18px]' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508121/arrange-send-to-back_bcyzlu.png" alt="Back" />
                            </button>
                        </div>
                    </div>
                    <hr className="border-t border-[#D3DBDF] h-px" />

                    <div className='py-3 px-3'>
                        <h3 className='text-[14px] text-black font-semibold mb-3'>Tools</h3>

                        <button
                            className={`w-full border border-gray-300 rounded-md py-3 text-[14px] flex items-center justify-start gap-3 mb-3 hover:bg-gray-50 transition-colors ${isRemovingBg ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={handleRemoveBackground}
                            disabled={isRemovingBg}
                        >
                            <img className="w-4 h-4 ml-3" src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508617/circle-opacity_zvwbfk.png" alt="" />
                            <span className='text-black'>
                                {isRemovingBg ? 'Removing...' : 'Remove Background'}
                            </span>
                        </button>

                        <button
                            className='w-full border border-gray-300 rounded-md py-3 text-[14px] flex items-center justify-start gap-3 hover:bg-gray-50 transition-colors'
                            onClick={handleUpscale}
                        >
                            <img className="w-4 h-4 ml-3" src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508617/move-resize-variant_karpuj.png" alt="" />
                            <span className='text-black'>Upscale</span>
                        </button>
                    </div>
                </>
            ) : (
                <div className="p-6 text-center text-gray-500">
                    <p className="text-[14px]">No design selected</p>
                    <p className="text-[12px] mt-1">Upload a design to start editing</p>
                </div>
            )}
        </div>
    )
}

export default PreviewTab