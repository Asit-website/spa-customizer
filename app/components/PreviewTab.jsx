"use client"

import React, { useEffect, useCallback } from 'react'
import { useFabricJSEditor } from "fabricjs-react";

const PreviewTab = ({ 
    alignFabricObject, 
    setChangeFlipX, 
    setChangeFlipy, 
    products, 
    updateArrange, 
    lastProduct, 
    updateLastProduct, 
    setShowImageEditModal 
}) => {

    const { editor } = useFabricJSEditor();
    const canvas = editor?.canvas;

    // Check if canvas is properly initialized
    const isCanvasReady = useCallback(() => {
        return canvas && canvas._objects !== undefined && editor && editor.canvas;
    }, [canvas, editor]);

    // Get only the base layer (t-shirt/product image)
    const getBaseLayerObject = useCallback(() => {
        if (!isCanvasReady()) {
            console.warn("Canvas not ready yet");
            return null;
        }
        
        // Find the t-shirt base object
        const objects = canvas.getObjects();
        console.log("Available objects:", objects.length);
        console.log("Objects:", objects.map(obj => ({ type: obj.type, isTshirtBase: obj.isTshirtBase })));
        
        const baseObj = objects.find(obj => obj.isTshirtBase === true);
        
        if (!baseObj) {
            console.warn("No object with isTshirtBase=true found. Available objects:", objects.length);
        }
        
        return baseObj || null;
    }, [canvas, isCanvasReady]);

    const handleAlign = useCallback((alignment) => {
        if (!isCanvasReady()) {
            console.warn("Canvas not ready for alignment");
            return;
        }

        const baseObj = getBaseLayerObject();
        if (!baseObj) {
            console.warn("No base layer object found to align. Make sure your base object has isTshirtBase: true");
            return;
        }

        try {
            // Temporarily make base layer selectable for alignment
            baseObj.set({
                selectable: true,
                evented: true
            });
            
            canvas.setActiveObject(baseObj);
            
            // If alignFabricObject function exists, use it
            if (alignFabricObject && typeof alignFabricObject === 'function') {
                alignFabricObject(baseObj, canvas, alignment);
            } else {
                // Fallback alignment logic
                const canvasCenter = canvas.getCenter();
                
                switch (alignment) {
                    case 'left':
                        baseObj.set({ left: 0 });
                        break;
                    case 'center':
                        baseObj.set({ left: canvasCenter.left - (baseObj.width * baseObj.scaleX) / 2 });
                        break;
                    case 'right':
                        baseObj.set({ left: canvas.width - (baseObj.width * baseObj.scaleX) });
                        break;
                    case 'top':
                        baseObj.set({ top: 0 });
                        break;
                    case 'middle':
                        baseObj.set({ top: canvasCenter.top - (baseObj.height * baseObj.scaleY) / 2 });
                        break;
                    case 'bottom':
                        baseObj.set({ top: canvas.height - (baseObj.height * baseObj.scaleY) });
                        break;
                }
                console.log(`Aligned object to ${alignment}`);
            }
            
            // Make it non-selectable again
            baseObj.set({
                selectable: false,
                evented: false
            });
            
            canvas.discardActiveObject();
            baseObj.setCoords();
            canvas.renderAll();
        } catch (error) {
            console.error("Error aligning object:", error);
        }
    }, [canvas, getBaseLayerObject, alignFabricObject, isCanvasReady]);

    const handleFlip = useCallback((direction) => {
        if (!isCanvasReady()) {
            console.warn("Canvas not ready for flipping");
            return;
        }

        const baseObj = getBaseLayerObject();
        if (!baseObj) {
            console.warn("No base layer object found to flip. Make sure your base object has isTshirtBase: true");
            return;
        }

        try {
            if (direction === 'horizontal') {
                const newFlipX = !baseObj.flipX;
                baseObj.set('flipX', newFlipX);
                console.log(`Flipped horizontally: ${newFlipX}`);
                
                // Update state functions if they exist
                if (setChangeFlipX && typeof setChangeFlipX === 'function') {
                    setChangeFlipX(newFlipX);
                }
                if (updateLastProduct && typeof updateLastProduct === 'function') {
                    updateLastProduct("imgflipX", newFlipX);
                }
            } else if (direction === 'vertical') {
                const newFlipY = !baseObj.flipY;
                baseObj.set('flipY', newFlipY);
                console.log(`Flipped vertically: ${newFlipY}`);
                
                // Update state functions if they exist
                if (setChangeFlipy && typeof setChangeFlipy === 'function') {
                    setChangeFlipy(newFlipY);
                }
                if (updateLastProduct && typeof updateLastProduct === 'function') {
                    updateLastProduct("imgflipY", newFlipY);
                }
            }
            
            baseObj.setCoords();
            canvas.renderAll();
        } catch (error) {
            console.error("Error flipping object:", error);
        }
    }, [canvas, getBaseLayerObject, setChangeFlipX, setChangeFlipy, updateLastProduct, isCanvasReady]);

    const handleOpacityChange = useCallback((value) => {
        if (!isCanvasReady()) {
            console.warn("Canvas not ready for opacity change");
            return;
        }

        const baseObj = getBaseLayerObject();
        if (!baseObj) {
            console.warn("No base layer object found to change opacity. Make sure your base object has isTshirtBase: true");
            return;
        }

        try {
            const opacityValue = Math.max(0, Math.min(100, value)) / 100;
            baseObj.set('opacity', opacityValue);
            baseObj.setCoords();
            canvas.renderAll();
            console.log(`Opacity changed to: ${value}%`);
            
            // Update the product state
            if (updateLastProduct && typeof updateLastProduct === 'function') {
                updateLastProduct("opacity", value);
            }
        } catch (error) {
            console.error("Error changing opacity:", error);
        }
    }, [canvas, getBaseLayerObject, updateLastProduct, isCanvasReady]);

    const handleRotateChange = useCallback((value) => {
        if (!isCanvasReady()) {
            console.warn("Canvas not ready for rotation");
            return;
        }

        const baseObj = getBaseLayerObject();
        if (!baseObj) {
            console.warn("No base layer object found to rotate. Make sure your base object has isTshirtBase: true");
            return;
        }

        try {
            const rotationValue = parseInt(value) || 0;
            baseObj.set('angle', rotationValue);
            baseObj.setCoords();
            canvas.renderAll();
            console.log(`Rotation changed to: ${rotationValue}°`);
            
            // Update the product state
            if (updateLastProduct && typeof updateLastProduct === 'function') {
                updateLastProduct("rotate", rotationValue);
            }
        } catch (error) {
            console.error("Error rotating object:", error);
        }
    }, [canvas, getBaseLayerObject, updateLastProduct, isCanvasReady]);

    const handleArrange = useCallback((action) => {
        if (!isCanvasReady()) {
            console.warn("Canvas not ready for arranging");
            return;
        }

        const baseObj = getBaseLayerObject();
        if (!baseObj) {
            console.warn("No base layer object found to arrange. Make sure your base object has isTshirtBase: true");
            return;
        }

        try {
            // Temporarily make selectable for arrange function
            baseObj.set({
                selectable: true,
                evented: true
            });
            
            canvas.setActiveObject(baseObj);
            
            // Call the arrange function if it exists
            if (updateArrange && typeof updateArrange === 'function') {
                updateArrange(action);
            } else {
                // Fallback arrangement logic
                switch (action) {
                    case 'bringForward':
                        canvas.bringForward(baseObj);
                        break;
                    case 'bringToFront':
                        canvas.bringToFront(baseObj);
                        break;
                    case 'sendBackward':
                        canvas.sendBackwards(baseObj);
                        break;
                    case 'sendToBack':
                        canvas.sendToBack(baseObj);
                        break;
                }
                console.log(`Arranged object: ${action}`);
            }
            
            // Make it non-selectable again
            baseObj.set({
                selectable: false,
                evented: false
            });
            
            canvas.discardActiveObject();
            canvas.renderAll();
        } catch (error) {
            console.error("Error arranging object:", error);
        }
    }, [canvas, getBaseLayerObject, updateArrange, isCanvasReady]);

    // Apply changes from product state to base layer object
    useEffect(() => {
        if (!isCanvasReady() || !lastProduct) return;

        const baseObj = getBaseLayerObject();
        if (!baseObj) return;

        try {
            let needsUpdate = false;

            // Apply opacity
            if (lastProduct.opacity !== undefined) {
                const opacityValue = Math.max(0, Math.min(100, lastProduct.opacity)) / 100;
                if (Math.abs(baseObj.opacity - opacityValue) > 0.01) {
                    baseObj.set('opacity', opacityValue);
                    needsUpdate = true;
                }
            }

            // Apply rotation
            if (lastProduct.rotate !== undefined) {
                const rotationValue = parseInt(lastProduct.rotate) || 0;
                if (baseObj.angle !== rotationValue) {
                    baseObj.set('angle', rotationValue);
                    needsUpdate = true;
                }
            }

            // Apply flips
            if (lastProduct.imgflipX !== undefined) {
                if (baseObj.flipX !== lastProduct.imgflipX) {
                    baseObj.set('flipX', lastProduct.imgflipX);
                    needsUpdate = true;
                }
            }
            
            if (lastProduct.imgflipY !== undefined) {
                if (baseObj.flipY !== lastProduct.imgflipY) {
                    baseObj.set('flipY', lastProduct.imgflipY);
                    needsUpdate = true;
                }
            }

            if (needsUpdate) {
                baseObj.setCoords();
                canvas.renderAll();
                console.log("Applied product state changes to base object");
            }
        } catch (error) {
            console.error("Error applying product changes:", error);
        }
    }, [canvas, lastProduct, getBaseLayerObject, isCanvasReady]);

    // Get current flip states from base object for UI display
    const getFlipStates = useCallback(() => {
        const baseObj = getBaseLayerObject();
        return {
            flipX: baseObj?.flipX || false,
            flipY: baseObj?.flipY || false
        };
    }, [getBaseLayerObject]);

    const flipStates = getFlipStates();

    const handleRemoveBackground = useCallback(() => {
        console.log("Remove product background clicked");
        // Add your background removal logic here
        // You might want to call an API or use a library like @imgly/background-removal
    }, []);

    const handleUpscale = useCallback(() => {
        console.log("Upscale product clicked");
        // Add your upscaling logic here
        // You might want to call an AI upscaling API
    }, []);

    return (
        <>
            <div className="bg-white rounded-lg border border-[#D3DBDF] w-80 h-fit max-h-[475px] overflow-y-scroll">
                <div className='flex items-center justify-between py-2 px-3'>
                    <div className='flex items-center gap-2'>
                        <h3 className='text-[16px] text-black font-semibold'>Product Preview</h3>
                    </div>
                    <div 
                        onClick={() => setShowImageEditModal && setShowImageEditModal(false)} 
                        className='cursor-pointer'
                    >
                        <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749341803/Vector_hm0yzo.png" alt="Close" />
                    </div>
                </div>
                <hr className="border-t border-[#D3DBDF] h-px" />

                <div className='flex items-center gap-2 py-1 px-3'>
                    <div className="border border-[#D3DBDF] rounded-lg p-2 w-[35%]">
                        <img
                            src={lastProduct?.image || '/placeholder-image.jpg'}
                            alt="Product Preview"
                            className="max-h-14 object-contain m-auto"
                        />
                    </div>

                    <div className="p-2 w-[65%]">
                        <p className="font-semibold text-[14px] text-gray-500">Width x Height</p>
                        <div className='my-2 flex items-center gap-3'>
                            <span className='rounded-full bg-gray-100 py-1.5 px-3 text-gray-500 text-[13px]'>
                                {lastProduct?.width ? (lastProduct.width / 50).toFixed(2) : '6.00'} in
                            </span>
                            <span className='rounded-full bg-gray-100 py-1.5 px-3 text-gray-500 text-[13px]'>
                                {lastProduct?.height ? (lastProduct.height / 50).toFixed(2) : '6.00'} in
                            </span>
                        </div>
                    </div>
                </div>
                <hr className="border-t border-[#D3DBDF] h-px" />

                <div className='flex items-center justify-between py-3 px-3'>
                    <div className='flex items-center gap-2'>
                        <h3 className='text-[14px] text-black font-semibold'>Flip Product</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <img
                            className={`w-[22px] cursor-pointer hover:opacity-70 transition-opacity ${flipStates.flipX ? 'ring-2 ring-blue-500 rounded' : ''}`}
                            src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507255/tune-vertical_ezas8p.png"
                            alt="Flip Product Horizontal"
                            onClick={() => handleFlip('horizontal')}
                        />
                        <img
                            className={`w-[22px] cursor-pointer hover:opacity-70 transition-opacity ${flipStates.flipY ? 'ring-2 ring-blue-500 rounded' : ''}`}
                            src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507254/flip-vertical_ajs5ur.png"
                            alt="Flip Product Vertical"
                            onClick={() => handleFlip('vertical')}
                        />
                    </div>
                </div>

                <hr className="border-t border-[#D3DBDF] h-px" />

                <div className='flex flex-col gap-3 justify-between py-3 px-3'>
                    <h3 className='text-[14px] text-black font-semibold'>Product Alignment</h3>
                    <div className="grid grid-cols-7 gap-5">
                        <img onClick={() => handleAlign("left")} className='w-[20px] cursor-pointer hover:opacity-70 transition-opacity' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507255/align-horizontal-left_fbsuoo.png" alt="Align Left" />
                        <img onClick={() => handleAlign("center")} className='w-[20px] cursor-pointer hover:opacity-70 transition-opacity' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507255/Frame_46_rrtm82.png" alt="Align Center" />
                        <img onClick={() => handleAlign("right")} className='w-[20px] cursor-pointer hover:opacity-70 transition-opacity' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507254/align-horizontal-right_adq5ap.png" alt="Align Right" />
                        <img onClick={() => handleAlign("top")} className='w-[20px] cursor-pointer hover:opacity-70 transition-opacity' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507254/align-vertical-top_nmalzx.png" alt="Align Top" />
                        <img onClick={() => handleAlign("middle")} className='w-[20px] cursor-pointer hover:opacity-70 transition-opacity' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507254/align-vertical-center_wguxnj.png" alt="Align Middle" />
                        <img onClick={() => handleAlign("bottom")} className='w-[20px] cursor-pointer hover:opacity-70 transition-opacity' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507254/align-vertical-bottom_damnnr.png" alt="Align Bottom" />
                        <img onClick={() => updateLastProduct && updateLastProduct("textAlign", "justify")} className='w-[20px] cursor-pointer hover:opacity-70 transition-opacity' src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507254/format-align-justify_qzuiww.png" alt="Justify" />
                    </div>
                </div>

                <hr className="border-t border-[#D3DBDF] h-px" />

                <div className='flex flex-col gap-3 justify-between py-3 px-3'>
                    <label className="text-[14px] text-black font-medium">Product Opacity</label>
                    <div className='flex items-center gap-2'>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={lastProduct?.opacity || 100}
                            onChange={(e) => handleOpacityChange(parseInt(e.target.value))}
                            className="w-full flex-1"
                        />
                        <span className='border border-[#D3DBDF] min-w-10 text-center rounded-md text-[14px] p-1'>
                            {lastProduct?.opacity || 100}%
                        </span>
                    </div>

                    <label className="text-[14px] text-black font-medium">Product Rotation</label>
                    <div className='flex items-center gap-2'>
                        <input
                            type="range"
                            min="0"
                            max="360"
                            value={lastProduct?.rotate || 0}
                            onChange={(e) => handleRotateChange(parseInt(e.target.value))}
                            className="w-full flex-1"
                        />
                        <span className='border border-[#D3DBDF] min-w-10 text-center rounded-md text-[14px] p-1'>
                            {lastProduct?.rotate || 0}°
                        </span>
                    </div>
                </div>
                <hr className="border-t border-[#D3DBDF] h-px" />

                <div className='flex flex-col gap-3 justify-between py-3 px-3'>
                    <h3 className='text-[14px] text-black font-semibold'>Product Layer</h3>
                    <div className="flex items-center gap-7">
                        <img 
                            onClick={() => handleArrange("bringForward")} 
                            className='w-[20px] cursor-pointer hover:opacity-70 transition-opacity' 
                            src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508122/arrange-bring-forward_vigco4.png" 
                            alt="Bring Forward" 
                        />
                        <img 
                            onClick={() => handleArrange("bringToFront")} 
                            className='w-[20px] cursor-pointer hover:opacity-70 transition-opacity' 
                            src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508122/arrange-bring-to-front_povosv.png" 
                            alt="Bring To Front" 
                        />
                        <img 
                            onClick={() => handleArrange("sendBackward")} 
                            className='w-[20px] cursor-pointer hover:opacity-70 transition-opacity' 
                            src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508122/arrange-send-backward_buzw6f.png" 
                            alt="Send Backward" 
                        />
                        <img 
                            onClick={() => handleArrange("sendToBack")} 
                            className='w-[20px] cursor-pointer hover:opacity-70 transition-opacity' 
                            src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508121/arrange-send-to-back_bcyzlu.png" 
                            alt="Send To Back" 
                        />
                    </div>
                </div>

                <hr className="border-t border-[#D3DBDF] h-px" />

                <div className='flex flex-col gap-3 py-3 px-3'>
                    <h3 className='text-[14px] text-black font-semibold'>Product Tools</h3>

                    <button 
                        className='border-[#D3DBDF] border rounded-md py-3 px-8 text-[14px] flex items-center justify-start gap-2 hover:bg-gray-50 transition-colors'
                        onClick={handleRemoveBackground}
                    >
                        <span className='flex text-black items-center gap-2'>
                            <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508617/circle-opacity_zvwbfk.png" alt="" /> 
                            Remove Background
                        </span>
                    </button>
                    
                    <button 
                        className='border-[#D3DBDF] border rounded-md py-3 px-8 text-[14px] flex items-center justify-start gap-2 hover:bg-gray-50 transition-colors'
                        onClick={handleUpscale}
                    >
                        <span className='flex text-black items-center gap-2'>
                            <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508617/move-resize-variant_karpuj.png" alt="" /> 
                            Upscale
                        </span>
                    </button>
                </div>
            </div>
        </>
    )
}

export default PreviewTab