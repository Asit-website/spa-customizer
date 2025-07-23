'use client';

import { useState, useEffect } from 'react';
import { FabricJSCanvas } from "fabricjs-react";
import ModelViewer3D from './ModalViewer3D';
import { use3DGeneration } from '../hooks/use3DGeneration';
import { useProductFromDatabase } from '../hooks/useProductFromDatabase';

// Loading component for 3D generation
function Generating3D({ progress }) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mb-4"></div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Generating 3D Model</h3>
      <p className="text-sm text-gray-600 text-center max-w-xs px-4">{progress}</p>

      <div className="w-64 bg-gray-200 rounded-full h-2 mt-4">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
          style={{
            width: progress.includes('ready') || progress.includes('🎉') ? '100%' :
              progress.includes('Converting') || progress.includes('Processing') ? '70%' :
                progress.includes('Starting') || progress.includes('generation') ? '40%' :
                  progress.includes('Uploading') || progress.includes('Preparing') ? '20%' : '10%'
          }}
        ></div>
      </div>

      <p className="text-xs text-gray-500 mt-2 text-center">
        This usually takes 2-5 minutes
      </p>
    </div>
  );
}

// Toggle button component
function ViewToggleButton({
  view3D,
  onLoadFromDatabase,
  databaseLoading,
  onGenerate3D,
  generating3D,
  hasModel
}) {
  return (
    <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
      {/* Toggle 2D/3D View Button */}
      <button
        onClick={() => { }} // Will be handled by parent component
        className={`px-4 py-2 rounded-lg font-medium transition-all ${view3D
            ? 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white'
            : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
          } shadow-lg hover:shadow-xl`}
      >
        {view3D ? '🎨 2D Editor' : '🎯 3D View'}
      </button>

      {/* Generate 3D Button */}
      {!view3D && (
        <button
          onClick={onGenerate3D}
          disabled={generating3D}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${generating3D
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl'
            }`}
        >
          {generating3D ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Generating...</span>
            </div>
          ) : (
            '🚀 Generate 3D'
          )}
        </button>
      )}

      {/* Load from Database Button */}
      {!view3D && (
        <button
          onClick={onLoadFromDatabase}
          disabled={databaseLoading}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${databaseLoading
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl'
            }`}
        >
          {databaseLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Loading...</span>
            </div>
          ) : (
            '💾 Load from DB'
          )}
        </button>
      )}
    </div>
  );
}

export default function CenterCanvas3D({ onReady, editor, savedProductId = null }) {
  const [view3D, setView3D] = useState(false);

  // ✅ FIXED: Separate 3D model ID from current product ID
  const [modelToDisplay, setModelToDisplay] = useState(null);
  const [modelSource, setModelSource] = useState('none'); // 'database', 'generated', 'none'

  // 3D Generation hook (for new models)
  const {
    generate3D,
    isGenerating,
    progress,
    modelUrl: generatedModelUrl,
    error,
    reset,
    testCanvasScreenshot,
    debugCanvasState
  } = use3DGeneration();

  // Database hook (for saved models)
  const {
    loading: dbLoading,
    getAllProducts
  } = useProductFromDatabase();

  // ✅ FIXED: Handle savedProductId without changing canvas
  useEffect(() => {
    if (savedProductId && !modelToDisplay) {
      console.log('🔄 Loading saved product for 3D view only:', savedProductId);
      setModelToDisplay(savedProductId);
      setModelSource('database');
    }
  }, [savedProductId, modelToDisplay]);

  // ✅ FIXED: Handle generated model URL
  useEffect(() => {
    if (generatedModelUrl) {
      console.log('✅ New generated model available:', generatedModelUrl);
      setModelToDisplay(generatedModelUrl);
      setModelSource('generated');
    }
  }, [generatedModelUrl]);

  const hasModel = !!(modelToDisplay);

  // 3D Generation handler
  const handle3DGeneration = async () => {
    console.log("🚀 Starting 3D generation process...");

    if (!editor?.canvas) {
      console.error("❌ Canvas not ready");
      alert('Canvas not ready. Please wait for the editor to load.');
      return;
    }

    try {
      console.log("✅ Preparing for 3D generation...");

      if (typeof editor.canvas.renderAll === 'function') {
        console.log("🔄 Forcing canvas render...");
        editor.canvas.renderAll();
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      const result = await generate3D(editor.canvas);
      console.log('🎉 3D generation result:', result);

      // ✅ FIXED: Don't clear existing model, will be updated by useEffect
      // Auto switch to 3D view when ready
      setView3D(true);
      console.log("🎉 3D generation completed successfully!");

    } catch (err) {
      console.error('❌ 3D generation error:', err);

      let errorMessage = 'Failed to generate 3D model:\n\n';

      if (err.message.includes('No custom content')) {
        errorMessage += '❌ Please add some content to your t-shirt first!\n\n' +
          'Try adding:\n' +
          '• Custom text (from Text tab)\n' +
          '• Upload an image\n' +
          '• Add emoji or icons (from Clipart tab)\n' +
          '• Apply a design pattern';
      } else {
        errorMessage += err.message;
      }

      alert(errorMessage);
    }
  };

  const handleLoadFromDatabase = async () => {
    try {
      console.log('🔍 Loading products from database for 3D viewing only...');
      const products = await getAllProducts();

      console.log("📦 Raw products response:", products);

      if (!products || !Array.isArray(products)) {
        console.error("❌ Invalid products format:", products);
        alert('Invalid response format from database.');
        return;
      }

      if (products.length > 0) {
        console.log(`📦 Found ${products.length} products in database`);

        // ✅ FIXED: Filter products with 3D models based on your structure
        const productsWithModels = products.filter(p => {
          const has3D = !!(p.model3D && p.model3D.url);

          if (has3D) {
            console.log(`✅ Product with 3D model found:`, {
              id: p._id,
              description: p.product?.description || 'Unknown',
              model3DUrl: p.model3D.url,
              screenshot: p.screenshot
            });
          }

          return has3D;
        });

        console.log(`🎯 Found ${productsWithModels.length} products with 3D models`);

        if (productsWithModels.length === 0) {
          alert('No products with 3D models found in database.');
          return;
        }

        if (productsWithModels.length === 1) {
          const product = productsWithModels[0];
          const productId = product._id;

          if (productId) {
            console.log('✅ Loading single 3D model, _id:', productId);
            setModelToDisplay(productId);
            setModelSource('database');
            setView3D(true);
          } else {
            console.error('❌ No _id found in product:', product);
            alert('Invalid product ID format in database.');
          }
        } else {
          // Multiple products with 3D models - let user choose
          const productList = productsWithModels.map((p, index) => {
            const description = p.product?.description || 'Unknown Product';
            return `${index + 1}. ${description} (ID: ${p._id})`;
          }).join('\n');

          const choice = prompt(
            `Found ${productsWithModels.length} products with 3D models:\n\n${productList}\n\nEnter number (1-${productsWithModels.length}) to load:`
          );

          const choiceIndex = parseInt(choice) - 1;
          if (choiceIndex >= 0 && choiceIndex < productsWithModels.length) {
            const selectedProduct = productsWithModels[choiceIndex];
            const productId = selectedProduct._id;

            if (productId) {
              console.log('✅ User selected 3D model, _id:', productId);
              setModelToDisplay(productId);
              setModelSource('database');
              setView3D(true);
            } else {
              alert('Invalid product ID format for selected product.');
            }
          }
        }
      } else {
        alert('No products found in database.');
      }
    } catch (error) {
      console.error('❌ Database load error:', error);
      alert('Failed to load from database: ' + error.message);
    }
  };

  const handleToggleView = () => {
    if (view3D) {
      setView3D(false);
    } else {
      if (hasModel) {
        setView3D(true);
      } else {
        // If no 3D model, try to load from database first
        handleLoadFromDatabase();
      }
    }
  };

  const handleTestCapture = async () => {
    if (!editor?.canvas) {
      alert('Canvas not ready for testing');
      return;
    }

    try {
      console.log("🧪 Testing canvas capture...");
      const screenshot = await testCanvasScreenshot(editor.canvas);

      console.log('🔍 Current state:', {
        savedProductId,
        modelToDisplay,
        generatedModelUrl: !!generatedModelUrl,
        hasModel,
        modelSource
      });

      alert(`🧪 Test completed!\n\nCanvas: ${editor.canvas.getObjects().length} objects\nScreenshot: ${screenshot ? 'Success' : 'Failed'}\nCurrent Model: ${hasModel ? modelSource : 'None'}`);

    } catch (error) {
      console.error('🧪 Test failed:', error);
    }
  };

  const handleDebugCanvas = () => {
    if (!editor?.canvas) {
      alert('Canvas not ready for debugging');
      return;
    }

    console.log("🔍 Running canvas debug...");
    debugCanvasState(editor.canvas);

    console.log('🔍 Current 3D State:', {
      savedProductId,
      modelToDisplay,
      generatedModelUrl: !!generatedModelUrl,
      modelSource,
      hasModel,
      view3D,
      isGenerating,
      error
    });
  };

  return (
    <div className="relative w-full h-[600px]">

      {/* Toggle Controls */}
      {/* <ViewToggleButton
        view3D={view3D}
        onToggle={handleToggleView}
        onGenerate3D={handle3DGeneration}
        generating3D={isGenerating}
        hasModel={hasModel}
        onTestCapture={handleTestCapture}
        onDebugCanvas={handleDebugCanvas}
        onLoadFromDatabase={handleLoadFromDatabase}
        databaseLoading={dbLoading}
      /> */}

      {/* Error Display */}
      {error && (
        <div className="absolute top-16 right-4 bg-red-50 border border-red-200 rounded-lg p-3 shadow-lg z-30 max-w-sm">
          <div className="flex items-start gap-2">
            <span className="text-red-500">❌</span>
            <div>
              <p className="font-medium text-red-800 text-sm">3D Generation Failed</p>
              <p className="text-xs text-red-600 mt-1 break-words">{error}</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={reset}
                  className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                >
                  Try Again
                </button>
                <button
                  onClick={handleDebugCanvas}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                >
                  Debug
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success notification */}
      {hasModel && !view3D && !isGenerating && (
        <div className="absolute top-16 right-4 bg-green-50 border border-green-200 rounded-lg p-3 shadow-lg z-30 max-w-sm">
          <div className="flex items-start gap-2">
            <span className="text-green-500">✅</span>
            <div>
              <p className="font-medium text-green-800 text-sm">3D Model Ready!</p>
              <p className="text-xs text-green-600 mt-1">
                Source: {modelSource === 'database' ? 'Database' : 'Generated'}
              </p>
              <button
                onClick={() => setView3D(true)}
                className="mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
              >
                View Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="w-full h-full">

        {/* 2D Canvas View */}
        {!view3D && !isGenerating && (
          <FabricJSCanvas className="canvas-container w-full h-full" onReady={onReady} />
        )}

        {/* 3D Generation Loading */}
        {isGenerating && (
          <Generating3D progress={progress} />
        )}

        {/* 3D Model View */}
        {view3D && !isGenerating && (
          <div className="w-full h-full">
            {hasModel ? (
              <ModelViewer3D
                productId={modelSource === 'database' ? modelToDisplay : null}
                modelUrl={modelSource === 'generated' ? modelToDisplay : null}
                isVisible={view3D}
                onClose={() => setView3D(false)}
                className="w-full h-full"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No 3D Model</h3>
                <p className="text-gray-600 text-center mb-4">Generate a 3D model or load from database</p>

                <div className="flex gap-3">
                  <button
                    onClick={handleLoadFromDatabase}
                    disabled={dbLoading}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                  >
                    {dbLoading ? 'Loading...' : '💾 Load from Database'}
                  </button>

                  <button
                    onClick={handle3DGeneration}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
                  >
                    {isGenerating ? 'Generating...' : '🚀 Generate New 3D'}
                  </button>

                  <button
                    onClick={() => setView3D(false)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Back to 2D Editor
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Progress indicator for ongoing generation */}
      {isGenerating && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 shadow-lg z-30">
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="text-sm font-medium text-blue-700">
              {progress || 'Processing...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}