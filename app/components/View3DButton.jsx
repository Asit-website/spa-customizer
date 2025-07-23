'use client';

import { useState } from 'react';
import { use3DGeneration } from '../hooks/use3DGeneration';
import { useProductFromDatabase } from '../hooks/useProductFromDatabase';
import ModelViewer3D from './ModalViewer3D';

export default function View3DButton({ editor, savedProductId = null }) {
  const [show3DViewer, setShow3DViewer] = useState(false);
  const [currentProductId, setCurrentProduct] = useState(savedProductId);
  const [viewMode, setViewMode] = useState('generate'); // 'generate' or 'database'

  // 3D Generation hook
  const { 
    generate3D, 
    isGenerating, 
    progress, 
    modelUrl: generatedModelUrl, 
    error: generateError, 
    reset: resetGeneration 
  } = use3DGeneration();

  // Database hook
  const { 
    loading: dbLoading, 
    error: dbError, 
    getAllProducts,
    getProductById 
  } = useProductFromDatabase();

  console.log('🔍 View3DButton State:', {
    savedProductId,
    currentProductId,
    viewMode,
    generatedModelUrl: !!generatedModelUrl,
    isGenerating,
    dbLoading
  });

  // Handle 3D generation from canvas
  const handle3DGeneration = async () => {
    if (!editor?.canvas) {
      alert('Canvas not ready. Please wait for the editor to load.');
      return;
    }

    const objects = editor.canvas.getObjects();
    const meaningfulObjects = objects.filter(obj => 
      !obj.isTshirtBase && 
      (obj.type !== 'i-text' || (obj.text && obj.text.trim().length > 0))
    );

    if (meaningfulObjects.length === 0) {
      alert('Please add some design elements before generating 3D model.\n\nTry adding:\n• Custom text\n• Upload an image\n• Add emojis or designs');
      return;
    }

    try {
      console.log('🚀 Starting 3D generation...');
      setViewMode('generate');
      setCurrentProduct(null); // Clear database model
      
      await generate3D(editor.canvas);
      setShow3DViewer(true);
      
      console.log('✅ 3D generation completed');
    } catch (err) {
      console.error('❌ 3D generation failed:', err);
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

  // Close 3D viewer
  const close3DViewer = () => {
    setShow3DViewer(false);
    resetGeneration();
    setCurrentProduct(null);
    setViewMode('generate');
  };

  // Determine if we have any 3D model to show
  const hasModel = !!(generatedModelUrl || currentProductId);
  const isLoading = isGenerating || dbLoading;
  const error = generateError || dbError;

  return (
    <>
      <div className="flex gap-3">
        {/* Main 3D Generation Button */}
        <button
          onClick={handle3DGeneration}
          disabled={isLoading}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
          }`}
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>🎯</span>
              <span>View in 3D</span>
            </div>
          )}
        </button>

        {/* Database Load Button */}
        <button
          onClick={handleLoadFromDatabase}
          disabled={isLoading}
          className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          {dbLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Loading...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>💾</span>
              <span>{savedProductId ? 'Load Saved' : 'Load from DB'}</span>
            </div>
          )}
        </button>

        {/* Quick View Button (if model exists) */}
        {hasModel && (
          <button
            onClick={() => setShow3DViewer(true)}
            className="px-4 py-3 rounded-lg font-medium bg-white border-2 border-purple-500 text-purple-500 hover:bg-purple-50 transition-all duration-200"
          >
            <div className="flex items-center gap-2">
              <span>👁️</span>
              <span>Quick View</span>
            </div>
          </button>
        )}
      </div>

      {/* Progress indicator for 3D generation */}
      {isGenerating && (
        <div className="fixed top-4 right-4 bg-white border rounded-lg p-4 shadow-xl z-40 min-w-[300px]">
          <div className="flex items-center gap-3">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">Generating 3D Model</p>
              <p className="text-sm text-gray-600">{progress}</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: progress.includes('ready') || progress.includes('🎉') ? '100%' : 
                           progress.includes('Converting') || progress.includes('Processing') ? '70%' : 
                           progress.includes('Starting') || progress.includes('generation') ? '40%' : 
                           progress.includes('Uploading') || progress.includes('Preparing') ? '20%' : '10%' 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Database loading indicator */}
      {dbLoading && (
        <div className="fixed top-4 right-4 bg-white border rounded-lg p-4 shadow-xl z-40 min-w-[300px]">
          <div className="flex items-center gap-3">
            <div className="animate-spin h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full"></div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">Loading from Database</p>
              <p className="text-sm text-gray-600">Fetching 3D models...</p>
            </div>
          </div>
        </div>
      )}

      {/* Error notification */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-xl z-40 max-w-[400px]">
          <div className="flex items-start gap-3">
            <span className="text-red-500 text-xl">❌</span>
            <div className="flex-1">
              <p className="font-medium text-red-800">
                {generateError ? '3D Generation Failed' : 'Database Error'}
              </p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
              <div className="flex gap-2 mt-2">
                <button 
                  onClick={generateError ? resetGeneration : () => window.location.reload()} 
                  className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                >
                  {generateError ? 'Try Again' : 'Reload Page'}
                </button>
              </div>
            </div>
            <button 
              onClick={() => {
                resetGeneration();
                // Clear database error by reloading component state
              }} 
              className="text-red-400 hover:text-red-600 text-lg"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Success notification */}
      {hasModel && !show3DViewer && !isLoading && !error && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-xl z-40 max-w-[400px]">
          <div className="flex items-start gap-3">
            <span className="text-green-500 text-xl">✅</span>
            <div className="flex-1">
              <p className="font-medium text-green-800">3D Model Ready!</p>
              <p className="text-sm text-green-600 mt-1">
                Source: {viewMode === 'database' ? 'Database' : 'Generated'}
              </p>
              <button 
                onClick={() => setShow3DViewer(true)} 
                className="mt-2 text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors"
              >
                View 3D Model
              </button>
            </div>
            <button 
              onClick={() => {
                resetGeneration();
                setCurrentProduct(null);
              }} 
              className="text-green-400 hover:text-green-600 text-lg"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Enhanced ModelViewer3D with both modes */}
      <ModelViewer3D 
        productId={viewMode === 'database' ? currentProductId : null}
        modelUrl={viewMode === 'generate' ? generatedModelUrl : null}
        isVisible={show3DViewer}
        onClose={close3DViewer}
      />
    </>
  );
}