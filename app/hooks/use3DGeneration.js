// hooks/use3DGeneration.js - Fixed version with no mock fallbacks

import { useState, useCallback } from 'react';
import tripo3DService from '../services/tripo3DService';

export function use3DGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState('');
  const [modelUrl, setModelUrl] = useState(null);
  const [error, setError] = useState(null);

  // ✅ Method 1: Generate 3D from screenshot (most reliable)
  const generate3DFromScreenshot = useCallback(async (screenshotDataURL) => {
    try {
      console.log('🚀 Hook: Starting 3D generation from screenshot...');
      
      // Reset states
      setIsGenerating(true);
      setError(null);
      setProgress('Preparing screenshot for 3D...');
      
      // Validate screenshot
      if (!screenshotDataURL || !screenshotDataURL.startsWith('data:image')) {
        throw new Error('Invalid screenshot data provided');
      }

      console.log('📸 Screenshot data received:', {
        length: screenshotDataURL.length,
        type: screenshotDataURL.substring(0, 50) + '...'
      });

      // Progress callback
      const onProgress = (message) => {
        console.log('📈 Progress update:', message);
        setProgress(message);
      };

      console.log('🔧 Calling tripo3DService.generate3DFromScreenshot...');
      
      // ✅ FIXED: Call the service and handle ALL errors properly
      // No more fallback to mock data
      const result = await tripo3DService.generate3DFromScreenshot(screenshotDataURL, onProgress);
      
      if (!result) {
        throw new Error('3D generation completed but no result returned');
      }

      if (!result.model) {
        throw new Error('3D generation completed but no model URL found');
      }

      // ✅ FIXED: Validate that we got a real model URL
      if (result.model.includes('example.com') || result.model.includes('mock-model') || result.model.includes('mock_')) {
        throw new Error('Received mock/dummy model URL instead of real model');
      }

      if (!result.model.startsWith('http')) {
        throw new Error(`Invalid model URL format: ${result.model}`);
      }

      console.log('✅ 3D generation completed successfully!');
      console.log('🎯 Real Model URL:', result.model);
      
      setModelUrl(result);
      setProgress('3D model ready! 🎉');
      
      return result;
      
    } catch (err) {
      console.error('❌ 3D generation failed in hook:', err);
      const errorMessage = err.message || 'Failed to generate 3D model';
      setError(errorMessage);
      setProgress('Generation failed ❌');
      
      // ✅ FIXED: Don't set any fallback model URL
      // Let the UI handle the error state properly
      setModelUrl(null);
      
      throw new Error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // ✅ Method 2: Generate 3D from canvas (converts to screenshot first)
  const generate3D = useCallback(async (canvas) => {
    try {
      console.log('🚀 Hook: Starting 3D generation from canvas...');
      
      // Reset states
      setIsGenerating(true);
      setError(null);
      setProgress('Analyzing canvas content...');
      
      // Validate canvas
      if (!canvas) {
        throw new Error('Canvas is required for 3D generation');
      }

      console.log('📊 Canvas object received:', {
        canvas: !!canvas,
        type: canvas?.constructor?.name,
        hasToDataURL: typeof canvas?.toDataURL === 'function',
        hasGetObjects: typeof canvas?.getObjects === 'function',
        hasRenderAll: typeof canvas?.renderAll === 'function'
      });

      // ✅ Enhanced content validation
      if (typeof canvas.getObjects === 'function') {
        const objects = canvas.getObjects();
        
        console.log('🎨 Canvas objects analysis:', {
          totalObjects: objects.length,
          objectDetails: objects.map((obj, index) => ({
            index,
            type: obj.type,
            isTshirtBase: obj.isTshirtBase || false,
            visible: obj.visible !== false,
            text: obj.text || null,
            hasRealContent: obj.type === 'i-text' ? !!(obj.text && obj.text.trim().length > 0) : true
          }))
        });

        // Find meaningful content (exclude t-shirt base and empty text)
        const meaningfulObjects = objects.filter(obj => {
          // Skip t-shirt base
          if (obj.isTshirtBase) {
            console.log(`⏭️ Skipping t-shirt base: ${obj.type}`);
            return false;
          }
          
          // For text, check if it has actual content
          if (obj.type === 'i-text') {
            const hasContent = obj.text && obj.text.trim().length > 0;
            console.log(`📝 Text object: "${obj.text}" - hasContent: ${hasContent}`);
            return hasContent;
          }
          
          // For images (not t-shirt base), include them
          if (obj.type === 'image') {
            console.log(`🖼️ Custom image found`);
            return true;
          }
          
          // Include other types
          console.log(`✅ Other object type: ${obj.type}`);
          return true;
        });

        console.log('🎯 Meaningful content analysis:', {
          meaningfulCount: meaningfulObjects.length,
          details: meaningfulObjects.map(obj => ({
            type: obj.type,
            content: obj.text || 'image/other',
            visible: obj.visible !== false
          }))
        });

        if (meaningfulObjects.length === 0) {
          throw new Error('No custom content found on your t-shirt.\n\nPlease add:\n• Custom text\n• Upload an image\n• Add emojis/icons\n• Apply design patterns');
        }

        // Check visibility
        const visibleMeaningfulObjects = meaningfulObjects.filter(obj => obj.visible !== false);
        if (visibleMeaningfulObjects.length === 0) {
          throw new Error('All custom content is hidden. Please make sure your designs are visible.');
        }

        console.log('✅ Canvas content validation passed!', {
          totalObjects: objects.length,
          meaningfulObjects: meaningfulObjects.length,
          visibleMeaningfulObjects: visibleMeaningfulObjects.length
        });
      }

      // Force canvas render before capture
      if (typeof canvas.renderAll === 'function') {
        console.log('🔄 Forcing canvas render...');
        setProgress('Preparing canvas for capture...');
        canvas.renderAll();
        // Wait for render to complete
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Generate screenshot from canvas
      console.log('📸 Generating screenshot from canvas...');
      setProgress('Creating design snapshot...');
      
      let screenshotDataURL;
      if (typeof canvas.toDataURL === 'function') {
        try {
          screenshotDataURL = canvas.toDataURL('image/png', 0.9);
        } catch (error) {
          console.error('❌ toDataURL failed:', error);
          throw new Error('Failed to capture canvas screenshot. Canvas may be tainted or corrupted.');
        }
      } else {
        throw new Error('Canvas does not support screenshot generation');
      }

      if (!screenshotDataURL || screenshotDataURL === 'data:,' || screenshotDataURL.length < 100) {
        throw new Error('Failed to capture canvas screenshot or screenshot is empty');
      }

      console.log('✅ Canvas screenshot captured:', {
        length: screenshotDataURL.length,
        preview: screenshotDataURL.substring(0, 50) + '...'
      });
      
      // Now use the screenshot method
      console.log('🔄 Switching to screenshot-based 3D generation...');
      return await generate3DFromScreenshot(screenshotDataURL);
      
    } catch (err) {
      console.error('❌ Canvas 3D generation failed:', err);
      const errorMessage = err.message || 'Failed to generate 3D model from canvas';
      setError(errorMessage);
      setProgress('Generation failed ❌');
      setIsGenerating(false);
      
      // ✅ FIXED: Don't set any fallback model URL
      setModelUrl(null);
      
      throw new Error(errorMessage);
    }
  }, [generate3DFromScreenshot]);

  // ✅ Reset function
  const reset = useCallback(() => {
    console.log('🔄 Resetting 3D generation state');
    setIsGenerating(false);
    setProgress('');
    setModelUrl(null);
    setError(null);
  }, []);

  // ✅ Test function for canvas screenshot
  const testCanvasScreenshot = useCallback(async (canvas) => {
    if (!canvas) {
      console.error('❌ No canvas provided for test');
      alert('No canvas provided for test');
      return;
    }

    try {
      console.log('🧪 Testing canvas screenshot...');
      
      // Force render first
      if (typeof canvas.renderAll === 'function') {
        console.log('🔄 Forcing render before test...');
        canvas.renderAll();
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Test screenshot generation
      const screenshot = canvas.toDataURL('image/png', 0.9);
      
      if (screenshot && screenshot !== 'data:,' && screenshot.length > 100) {
        console.log('✅ Canvas screenshot test PASSED!');
        console.log('📊 Screenshot info:', {
          length: screenshot.length,
          size: `${Math.round(screenshot.length / 1024)} KB`,
          preview: screenshot.substring(0, 100) + '...'
        });
        
        // Open screenshot in new tab for verification
        const blob = await fetch(screenshot).then(r => r.blob());
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        
        alert('✅ Canvas screenshot test PASSED!\nScreenshot opened in new tab for verification.');
        return screenshot;
      } else {
        throw new Error('Canvas screenshot is empty, invalid, or too small');
      }
    } catch (error) {
      console.error('❌ Canvas screenshot test FAILED:', error);
      alert(`❌ Canvas screenshot test FAILED:\n${error.message}`);
      throw error;
    }
  }, []);

  // ✅ Debug canvas state
  const debugCanvasState = useCallback((canvas) => {
    if (!canvas) {
      console.log('❌ No canvas provided for debug');
      return;
    }

    try {
      console.log('🔍 DEBUG: Canvas State Analysis');
      console.log('═══════════════════════════════');
      
      // Basic canvas info
      console.log('📊 Canvas Info:', {
        type: canvas.constructor.name,
        width: canvas.width || canvas.getWidth?.(),
        height: canvas.height || canvas.getHeight?.(),
        hasToDataURL: typeof canvas.toDataURL === 'function',
        hasGetObjects: typeof canvas.getObjects === 'function',
        hasRenderAll: typeof canvas.renderAll === 'function'
      });

      if (typeof canvas.getObjects === 'function') {
        const objects = canvas.getObjects();
        console.log('\n📋 Objects Analysis:');
        console.log('Total objects:', objects.length);
        
        objects.forEach((obj, index) => {
          console.log(`\n🔸 Object ${index + 1}:`);
          console.log(`  Type: ${obj.type}`);
          console.log(`  Visible: ${obj.visible !== false}`);
          console.log(`  Is T-shirt Base: ${obj.isTshirtBase || false}`);
          
          if (obj.type === 'i-text') {
            console.log(`  Text: "${obj.text || '(empty)'}"`);
            console.log(`  Text Length: ${obj.text ? obj.text.length : 0}`);
            console.log(`  Has Real Content: ${!!(obj.text && obj.text.trim().length > 0)}`);
            console.log(`  Font: ${obj.fontFamily || 'default'} (${obj.fontSize || 'default'}px)`);
          }
          
          if (obj.type === 'image') {
            console.log(`  Is Custom Image: ${!obj.isTshirtBase}`);
            console.log(`  Source: ${obj.getSrc ? obj.getSrc().substring(0, 50) + '...' : 'N/A'}`);
          }
          
          console.log(`  Position: {x: ${Math.round(obj.left || 0)}, y: ${Math.round(obj.top || 0)}}`);
          console.log(`  Size: {w: ${Math.round((obj.width || 0) * (obj.scaleX || 1))}, h: ${Math.round((obj.height || 0) * (obj.scaleY || 1))}}`);
        });

        // Meaningful content analysis
        const meaningfulObjects = objects.filter(obj => {
          if (obj.isTshirtBase) return false;
          if (obj.type === 'i-text') return obj.text && obj.text.trim().length > 0;
          return true;
        });

        console.log('\n🎯 Content Summary:');
        console.log(`  Total Objects: ${objects.length}`);
        console.log(`  Meaningful Objects: ${meaningfulObjects.length}`);
        console.log(`  T-shirt Bases: ${objects.filter(obj => obj.isTshirtBase).length}`);
        console.log(`  Custom Text: ${objects.filter(obj => obj.type === 'i-text' && obj.text && obj.text.trim().length > 0).length}`);
        console.log(`  Custom Images: ${objects.filter(obj => obj.type === 'image' && !obj.isTshirtBase).length}`);
        console.log(`  Ready for 3D: ${meaningfulObjects.length > 0 ? '✅ YES' : '❌ NO'}`);
      }
      
      console.log('\n═══════════════════════════════');
      
    } catch (error) {
      console.error('❌ Debug failed:', error);
    }
  }, []);

  return {
    // Main functions
    generate3D,
    generate3DFromScreenshot,
    
    // State
    isGenerating,
    progress,
    modelUrl,
    error,
    
    // Utility functions
    reset,
    testCanvasScreenshot,
    debugCanvasState
  };
}

// ✅ FIXED: Alternative direct function for standalone use - NO MORE MOCK FALLBACKS
export const generate3DModelFromImageUrl = async (imageUrl, onProgress) => {
  const apiKey = process.env.NEXT_PUBLIC_TRIPO_API_KEY; // Changed from MESHY to TRIPO

  if (!apiKey) {
    throw new Error('Tripo3D API key not found in environment variables');
  }

  if (!imageUrl) {
    throw new Error('Image URL is required');
  }

  console.log('🚀 Direct image-to-3D generation via Tripo3D:', imageUrl);
  
  onProgress?.('Sending image to Tripo3D AI...');

  try {
    // Use Tripo3D API endpoint instead of Meshy
    const res = await fetch('https://api.tripo3d.ai/v2/openapi/task', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'image_to_model',
        file: {
          type: 'url',
          url: imageUrl
        },
        // Tripo3D specific options
        face_limit: 10000,
        texture_resolution: 1024
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Tripo3D API error: ${res.status} - ${errorText}`);
    }

    const data = await res.json();
    
    if (!data.data?.task_id) {
      throw new Error('No task ID received from Tripo3D API');
    }

    const taskId = data.data.task_id;
    console.log('📋 Task ID:', taskId);

    return await pollTripo3DResult(taskId, onProgress, apiKey);
  } catch (error) {
    console.error('❌ Direct 3D generation failed:', error);
    throw error;
  }
};

// ✅ Helper function for polling Tripo3D results
const pollTripo3DResult = async (taskId, onProgress, apiKey) => {
  return new Promise((resolve, reject) => {
    let pollCount = 0;
    const maxPolls = 60; // 5 minutes
    
    const interval = setInterval(async () => {
      try {
        pollCount++;
        console.log(`📊 Polling ${pollCount}/${maxPolls}`);

        const res = await fetch(`https://api.tripo3d.ai/v2/openapi/task/${taskId}`, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Polling failed: ${res.status}`);
        }

        const data = await res.json();
        console.log(`📥 Poll ${pollCount} response:`, data);

        if (data.data?.status === 'success') {
          clearInterval(interval);
          onProgress?.('Model ready! 🎉');
          
          // ✅ FIXED: Extract real GLB URL from Tripo3D response
          let modelUrl = null;
          const output = data.data.output;
          
          if (output?.model) {
            modelUrl = output.model;
            console.log('✅ Found GLB URL in output.model:', modelUrl);
          } else if (output?.pbr_model) {
            modelUrl = output.pbr_model;
            console.log('✅ Found GLB URL in output.pbr_model:', modelUrl);
          } else {
            // Log all available keys for debugging
            console.error('❌ No GLB URL found. Available keys:');
            console.error('data keys:', Object.keys(data.data || {}));
            console.error('output keys:', output ? Object.keys(output) : 'output is null');
            console.error('Full response:', JSON.stringify(data, null, 2));
            
            reject(new Error('No GLB model URL found in Tripo3D response. Check console for details.'));
            return;
          }
          
          // ✅ FIXED: Validate the URL is real, not mock
          if (!modelUrl || !modelUrl.startsWith('http')) {
            reject(new Error(`Invalid GLB URL received: ${modelUrl}`));
            return;
          }

          if (modelUrl.includes('example.com') || modelUrl.includes('mock-model') || modelUrl.includes('mock_')) {
            reject(new Error(`Received mock/dummy URL instead of real model: ${modelUrl}`));
            return;
          }
          
          console.log('🎯 Final real GLB URL:', modelUrl);
          resolve(modelUrl);
          
        } else if (data.data?.status === 'failed') {
          clearInterval(interval);
          console.error('❌ 3D generation failed:', data);
          reject(new Error(`3D generation failed: ${data.data.error || data.data.message || 'Unknown error'}`));
        } else if (pollCount >= maxPolls) {
          clearInterval(interval);
          reject(new Error('3D generation timeout'));
        } else {
          const timeLeft = Math.max(0, 300 - pollCount * 5);
          const minutes = Math.floor(timeLeft / 60);
          const seconds = Math.floor(timeLeft % 60);
          onProgress?.(`Processing... ⏳ ${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
      } catch (error) {
        clearInterval(interval);
        reject(error);
      }
    }, 5000);

    // Cleanup after 5 minutes
    setTimeout(() => {
      clearInterval(interval);
      reject(new Error('Generation timeout'));
    }, 5 * 60 * 1000);
  });
};

// ✅ Debug functions for window
if (typeof window !== 'undefined') {
  window.debugCanvas = (canvas) => {
    console.log('🔍 Quick Canvas Debug:');
    if (!canvas) {
      console.log('❌ No canvas provided');
      return;
    }
    
    console.log('Canvas type:', canvas.constructor.name);
    console.log('Has objects:', typeof canvas.getObjects === 'function');
    console.log('Can screenshot:', typeof canvas.toDataURL === 'function');
    
    if (canvas.getObjects) {
      const objects = canvas.getObjects();
      console.log('Total objects:', objects.length);
      console.log('Object types:', objects.map(obj => obj.type));
      console.log('Meaningful objects:', objects.filter(obj => !obj.isTshirtBase).length);
    }
  };
  
  console.log('🧪 Debug available: window.debugCanvas(editor.canvas)');
}