'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import { Suspense, useEffect, useState } from 'react';
import { useProduct } from '../hooks/useProductFromDatabase';

function LoadingSpinner() {
  return (
    <mesh>
      <boxGeometry args={[0.2, 0.2, 0.2]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
}

// Simple Model Loader (database URLs should work directly)
function ModelFromDatabase({ url, onError }) {
  const gltf = useGLTF(url);

  useEffect(() => {
    if (!gltf?.scene && onError) {
      onError("Failed to load 3D model");
    }
  }, [gltf, onError]);

  if (!gltf?.scene) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
    );
  }

  return <primitive object={gltf.scene} scale={2} />;
}


// Manual fallback loader
function ModelManual({ url }) {
  const [modelData, setModelData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) return;

    import('three/examples/jsm/loaders/GLTFLoader.js').then(({ GLTFLoader }) => {
      const loader = new GLTFLoader();
      
      loader.load(
        url,
        (gltf) => {
          setModelData(gltf);
          setError(null);
        },
        undefined,
        (error) => {
          setError(error.message);
        }
      );
    });
  }, [url]);

  if (error) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
    );
  }

  if (!modelData) {
    return (
      <mesh>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    );
  }

  return <primitive object={modelData.scene} scale={2} />;
}

// ✅ FIXED: Main component with proper modal functionality
export default function ModalViewer3D({ 
  productId = null,           // Database product ID (MongoDB _id)
  modelUrl = null,           // Direct model URL (fallback)
  className = "",
  isVisible = false,          // ✅ ADDED: Modal visibility
  onClose = null              // ✅ ADDED: Close handler
}) {
  const [modelError, setModelError] = useState(null);
  const [useManualLoader, setUseManualLoader] = useState(false);

  // ✅ FIXED: Use database hook if productId is provided
  const { 
    productData, 
    model3D, 
    loading: dbLoading, 
    error: dbError, 
    hasModel 
  } = useProduct(productId);

  console.log('🎯 ModalViewer3D Props:', { productId, modelUrl, isVisible });
  console.log('🎯 Database Data:', { productData, model3D, hasModel });

  // ✅ FIXED: Don't render if not visible
  if (!isVisible) {
    return null;
  }

  // Determine final model URL to use
  let finalModelUrl = null;
  let dataSource = 'none';

  // ✅ FIXED: Check for both _id and id fields and different model3D locations
  if (productId && productData) {
    // Priority 1: Check productData.model3D
    if (productData.model3D?.url) {
      finalModelUrl = productData.model3D.url;
      dataSource = 'productData.model3D';
    }
    // Priority 2: Check productData.model_3d
    else if (productData.model_3d?.url) {
      finalModelUrl = productData.model_3d.url;
      dataSource = 'productData.model_3d';
    }
    // Priority 3: Check if hook extracted model3D
    else if (model3D?.url) {
      finalModelUrl = model3D.url;
      dataSource = 'hook.model3D';
    }
  } 
  // Priority 4: Direct modelUrl prop
  else if (modelUrl) {
    if (typeof modelUrl === 'string') {
      finalModelUrl = modelUrl;
    } else if (typeof modelUrl === 'object') {
      finalModelUrl = modelUrl.model || modelUrl.url || modelUrl.model3D?.url || null;
    }
    dataSource = 'prop';
  }

  console.log('🎯 Final Model URL:', finalModelUrl);
  console.log('🎯 Data Source:', dataSource);

  // ✅ ADDED: Fullscreen modal overlay
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="relative w-[95vw] h-[95vh] bg-white rounded-lg overflow-hidden">
        
        {/* ✅ ADDED: Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition-all"
        >
          ✕
        </button>

        {/* Loading state for database fetch */}
        {productId && dbLoading && (
          <div className="flex flex-col items-center justify-center h-full bg-blue-50">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mb-4"></div>
            <h3 className="text-lg font-semibold text-blue-700 mb-2">Loading from Database</h3>
            <p className="text-sm text-blue-600 text-center">Fetching 3D model...</p>
            <p className="text-xs text-blue-500 mt-2">Product ID: {productId}</p>
          </div>
        )}

        {/* Database error */}
        {productId && dbError && (
          <div className="flex flex-col items-center justify-center h-full bg-red-50 p-6">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-red-700 mb-2">Database Error</h3>
            <p className="text-red-600 text-center mb-4 text-sm">{dbError}</p>
            
            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
              >
                🔄 Retry
              </button>
              
              <p className="text-xs text-red-500">
                Product ID: {productId}
              </p>
            </div>
          </div>
        )}

        {/* No model found */}
        {!dbLoading && !dbError && !finalModelUrl && (
          <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-6">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No 3D Model Found</h3>
            <p className="text-gray-600 text-center mb-4">
              {productId ? 'This product doesn\'t have a 3D model yet' : 'Generate a 3D model first'}
            </p>
            
            {/* ✅ ENHANCED: Debug info */}
            <div className="mt-4 p-4 bg-gray-100 rounded text-xs max-w-md">
              <div className="font-bold mb-2">Debug Info:</div>
              <div>Product ID: {productId || 'None'}</div>
              <div>Product Data: {productData ? '✅ Present' : '❌ None'}</div>
              <div>Model URL Prop: {modelUrl ? '✅ Provided' : '❌ None'}</div>
              <div>Database Model: {model3D ? '✅ Found' : '❌ Not found'}</div>
              <div>Data Source: {dataSource}</div>
              
              {/* ✅ ADDED: Show actual product data structure */}
              {productData && (
                <div className="mt-2 border-t pt-2">
                  <div>Product _id: {productData._id || 'None'}</div>
                  <div>Product id: {productData.id || 'None'}</div>
                  <div>Has model3D: {productData.model3D ? '✅' : '❌'}</div>
                  <div>Has model_3d: {productData.model_3d ? '✅' : '❌'}</div>
                  
                  {/* Show model URLs if found */}
                  {productData.model3D?.url && (
                    <div>model3D.url: {productData.model3D.url.substring(0, 50)}...</div>
                  )}
                  {productData.model_3d?.url && (
                    <div>model_3d.url: {productData.model_3d.url.substring(0, 50)}...</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Model error */}
        {modelError && (
          <div className="flex flex-col items-center justify-center h-full bg-yellow-50 p-6">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-yellow-700 mb-2">3D Model Error</h3>
            <p className="text-yellow-600 text-center mb-4 text-sm">{modelError}</p>
            
            <div className="space-y-2">
              <button
                onClick={() => {
                  setModelError(null);
                  setUseManualLoader(!useManualLoader);
                }}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm"
              >
                🔄 Try {useManualLoader ? 'Hook' : 'Manual'} Loader
              </button>
              
              <a 
                href={finalModelUrl} 
                download="model.glb"
                className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
              >
                📥 Download GLB
              </a>
              
              <a 
                href={finalModelUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
              >
                🔗 Open URL
              </a>
            </div>
          </div>
        )}

        {/* ✅ FIXED: 3D Canvas - only show when we have a model URL */}
        {!dbLoading && !dbError && !modelError && finalModelUrl && (
          <>
            {/* Model Info Header */}
            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs p-2 rounded z-10">
              <div>Source: {dataSource}</div>
              <div>Loader: {useManualLoader ? 'Manual GLTFLoader' : 'useGLTF Hook'}</div>
              <div>Product ID: {productId || 'None'}</div>
              {model3D && (
                <div>Generated: {model3D.generatedAt ? new Date(model3D.generatedAt).toLocaleDateString() : 'Unknown'}</div>
              )}
            </div>

            {/* Controls */}
            <div className="absolute top-2 right-16 space-x-2 z-10">
              <button
                onClick={() => setUseManualLoader(!useManualLoader)}
                className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
              >
                {useManualLoader ? 'Hook' : 'Manual'}
              </button>
              
              <a
                href={finalModelUrl}
                download="model.glb"
                className="inline-block px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
              >
                📥
              </a>

              <a
                href={finalModelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600"
              >
                🔗
              </a>
            </div>

            {/* 3D Canvas */}
            <Canvas 
              className="w-full h-full"
              camera={{ position: [0, 0, 5], fov: 45 }}
              onError={(error) => {
                console.error('❌ Canvas error:', error);
                setModelError('3D Canvas failed: ' + error.message);
              }}
            >
              <ambientLight intensity={0.6} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={0.8} />
              <pointLight position={[-10, -10, -10]} intensity={0.3} />
              
              <Suspense fallback={<LoadingSpinner />}>
                <Environment preset="city" />
                
                {useManualLoader ? (
                  <ModelManual url={finalModelUrl} />
                ) : (
                  <ModelFromDatabase url={finalModelUrl} onError={setModelError} />
                )}
              </Suspense>
              
              <OrbitControls 
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={2}
                maxDistance={10}
              />
            </Canvas>

            {/* Info overlay */}
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs p-2 rounded z-10">
              <div>🎮 Mouse: rotate | Scroll: zoom</div>
              <div>💾 Source: {dataSource}</div>
              <div>🔗 URL: {finalModelUrl ? finalModelUrl.substring(0, 30) + '...' : 'None'}</div>
            </div>

          </>
        )}
      </div>
    </div>
  );
}