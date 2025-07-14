import { useState, useEffect, useCallback } from 'react';

const useCanvasContextMenu = (editor) => {
    const [contextMenu, setContextMenu] = useState({
        isVisible: false,
        x: 0,
        y: 0,
        selectedObject: null
    });

    const closeContextMenu = useCallback(() => {
        setContextMenu(prev => ({
            ...prev,
            isVisible: false
        }));
    }, []);

    const showContextMenu = useCallback((x, y, object) => {
        setContextMenu({
            isVisible: true,
            x,
            y,
            selectedObject: object
        });
    }, []);

    // Canvas event handlers
    useEffect(() => {
        if (!editor?.canvas) return;

        const canvas = editor.canvas;

        const handleDoubleClick = (e) => {
            const pointer = canvas.getPointer(e.e);
            const target = canvas.findTarget(e.e);
            
            // Show context menu for ALL objects except the base t-shirt
            // This includes: uploaded designs, text, emojis, patterns, shapes, etc.
            if (target && !target.isTshirtBase) {
                canvas.setActiveObject(target);
                canvas.renderAll();
                
                // Get canvas bounds to position menu correctly
                const canvasBounds = canvas.getElement().getBoundingClientRect();
                showContextMenu(
                    canvasBounds.left + pointer.x,
                    canvasBounds.top + pointer.y,
                    target
                );
            }
        };

        const handleClick = () => {
            closeContextMenu();
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                closeContextMenu();
            }
        };

        // Add event listeners - using mouse:dblclick for double click
        canvas.on('mouse:dblclick', handleDoubleClick);
        canvas.on('mouse:down', handleClick);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            canvas.off('mouse:dblclick', handleDoubleClick);
            canvas.off('mouse:down', handleClick);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [editor, showContextMenu, closeContextMenu]);

    // Context menu actions
    const handleDelete = useCallback(() => {
        if (!editor?.canvas || !contextMenu.selectedObject) return;
        
        const canvas = editor.canvas;
        const obj = contextMenu.selectedObject;
        
        canvas.remove(obj);
        canvas.renderAll();
        closeContextMenu();
    }, [editor, contextMenu.selectedObject, closeContextMenu]);

    const handleLock = useCallback(() => {
        if (!editor?.canvas || !contextMenu.selectedObject) return;
        
        const obj = contextMenu.selectedObject;
        const isCurrentlyLocked = !obj.selectable;
        
        obj.set({
            selectable: isCurrentlyLocked,
            evented: isCurrentlyLocked,
            hasControls: isCurrentlyLocked,
            hasBorders: isCurrentlyLocked,
            lockMovementX: !isCurrentlyLocked,
            lockMovementY: !isCurrentlyLocked,
            lockScalingX: !isCurrentlyLocked,
            lockScalingY: !isCurrentlyLocked,
            lockRotation: !isCurrentlyLocked
        });
        
        editor.canvas.renderAll();
    }, [editor, contextMenu.selectedObject]);

    const handleFlipHorizontal = useCallback(() => {
        if (!editor?.canvas || !contextMenu.selectedObject) return;
        
        const obj = contextMenu.selectedObject;
        obj.set('flipX', !obj.flipX);
        obj.setCoords();
        editor.canvas.renderAll();
    }, [editor, contextMenu.selectedObject]);

    const handleFlipVertical = useCallback(() => {
        if (!editor?.canvas || !contextMenu.selectedObject) return;
        
        const obj = contextMenu.selectedObject;
        obj.set('flipY', !obj.flipY);
        obj.setCoords();
        editor.canvas.renderAll();
    }, [editor, contextMenu.selectedObject]);

    const handleBringToFront = useCallback(() => {
        if (!editor?.canvas || !contextMenu.selectedObject) return;
        
        const canvas = editor.canvas;
        const obj = contextMenu.selectedObject;
        
        canvas.bringToFront(obj);
        obj.setCoords();
        canvas.renderAll();
    }, [editor, contextMenu.selectedObject]);

    const handleBringForward = useCallback(() => {
        if (!editor?.canvas || !contextMenu.selectedObject) return;
        
        const canvas = editor.canvas;
        const obj = contextMenu.selectedObject;
        
        canvas.bringForward(obj);
        obj.setCoords();
        canvas.renderAll();
    }, [editor, contextMenu.selectedObject]);

    const handleSendBackward = useCallback(() => {
        if (!editor?.canvas || !contextMenu.selectedObject) return;
        
        const canvas = editor.canvas;
        const obj = contextMenu.selectedObject;
        
        canvas.sendBackwards(obj);
        obj.setCoords();
        canvas.renderAll();
    }, [editor, contextMenu.selectedObject]);

    const handleSendToBack = useCallback(() => {
        if (!editor?.canvas || !contextMenu.selectedObject) return;
        
        const canvas = editor.canvas;
        const obj = contextMenu.selectedObject;
        
        canvas.sendToBack(obj);
        obj.setCoords();
        canvas.renderAll();
    }, [editor, contextMenu.selectedObject]);

    return {
        contextMenu,
        closeContextMenu,
        handleDelete,
        handleLock,
        handleFlipHorizontal,
        handleFlipVertical,
        handleBringToFront,
        handleBringForward,
        handleSendBackward,
        handleSendToBack
    };
};

export default useCanvasContextMenu;