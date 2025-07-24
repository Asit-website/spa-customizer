import React, { useState, useEffect } from 'react';

const LayerContextMenu = ({ 
    x, 
    y, 
    isVisible, 
    onClose, 
    selectedObject, 
    onDelete, 
    onLock, 
    onFlipHorizontal, 
    onFlipVertical, 
    onBringToFront, 
    onBringForward, 
    onSendBackward, 
    onSendToBack 
}) => {
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        if (selectedObject) {
            setIsLocked(!selectedObject.selectable);
        }
    }, [selectedObject]);

    if (!isVisible) return null;

    const getObjectTypeLabel = () => {
        if (!selectedObject) return 'Object';
        
        if (selectedObject.type === 'i-text') return 'Text';
        if (selectedObject.type === 'image' && selectedObject.name === 'design-image') return 'Design';
        if (selectedObject.isEmoji) return 'Emoji';
        if (selectedObject.type === 'image') return 'Image';
        return 'Object';
    };

    const handleAction = (action) => {
        switch (action) {
            case 'delete':
                onDelete();
                break;
            case 'lock':
                onLock();
                setIsLocked(!isLocked);
                break;
            case 'flipHorizontal':
                onFlipHorizontal();
                break;
            case 'flipVertical':
                onFlipVertical();
                break;
            case 'bringToFront':
                onBringToFront();
                break;
            case 'bringForward':
                onBringForward();
                break;
            case 'sendBackward':
                onSendBackward();
                break;
            case 'sendToBack':
                onSendToBack();
                break;
        }
        onClose();
    };

    return (
        <>
            <div 
                className="fixed inset-0 z-40" 
                onClick={onClose}
            />
            
            <div 
                className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 min-w-[180px]"
                style={{ 
                    left: `${x}px`, 
                    top: `${y}px`,
                    transform: 'translate(-50%, -10px)'
                }}
            >
                <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100 bg-gray-50">
                    {getObjectTypeLabel()} Options
                </div>

                <div 
                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                    onClick={() => handleAction('delete')}
                >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                </div>

                <div 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleAction('lock')}
                >
                    {isLocked ? (
                        <>
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                            Unlock
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Lock
                        </>
                    )}
                </div>

                <hr className="my-1 border-gray-200" />

                <div 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleAction('flipHorizontal')}
                >
                    <img className="w-4 h-4 mr-3" src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507255/tune-vertical_ezas8p.png" alt="" />
                    Flip Horizontal
                </div>

                <div 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleAction('flipVertical')}
                >
                    <img className="w-4 h-4 mr-3" src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749507254/flip-vertical_ajs5ur.png" alt="" />
                    Flip Vertical
                </div>

                <hr className="my-1 border-gray-200" />

                <div 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleAction('bringToFront')}
                >
                    <img className="w-4 h-4 mr-3" src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508122/arrange-bring-to-front_povosv.png" alt="" />
                    Bring to front
                </div>

                <div 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleAction('bringForward')}
                >
                    <img className="w-4 h-4 mr-3" src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508122/arrange-bring-forward_vigco4.png" alt="" />
                    Bring forward
                </div>

                <div 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleAction('sendBackward')}
                >
                    <img className="w-4 h-4 mr-3" src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508122/arrange-send-backward_buzw6f.png" alt="" />
                    Bring backward
                </div>

                <div 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleAction('sendToBack')}
                >
                    <img className="w-4 h-4 mr-3" src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749508121/arrange-send-to-back_bcyzlu.png" alt="" />
                    Send to back
                </div>
            </div>
        </>
    );
};

export default LayerContextMenu;