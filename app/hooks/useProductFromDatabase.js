// 📁 hooks/useProductFromDatabase.js - FIXED VERSION
import { useState, useEffect, useCallback } from 'react';

const DATABASE_API_BASE = 'https://customizer-backend-ttv5.onrender.com/api';

export function useProductFromDatabase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);

  // ✅ FIXED: Get single product by MongoDB _id
  const getProductById = useCallback(async (productId) => {
    if (!productId) {
      setError('Product ID is required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching product from database by _id:', productId);
      
      // ✅ FIXED: Use correct endpoint format
      const response = await fetch(`${DATABASE_API_BASE}/products/${productId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Database API Error: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('✅ Database response:', responseData);

      // ✅ FIXED: Handle response properly - your data shows direct object response
      let productData = null;
      
      // If direct object with _id
      if (responseData._id) {
        productData = responseData;
      }
      // If wrapped in data property
      else if (responseData.data && responseData.data._id) {
        productData = responseData.data;
      }
      // If array response
      else if (Array.isArray(responseData) && responseData.length > 0) {
        productData = responseData.find(p => p._id === productId) || responseData[0];
      }
      else {
        throw new Error('Product not found in database response');
      }

      if (!productData) {
        throw new Error('Product not found in database');
      }

      console.log('✅ Product found:', productData);
      setProduct(productData);
      return productData;

    } catch (err) {
      console.error('❌ Database fetch error:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ FIXED: Get all products
  const getAllProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching all products from database...');
      
      const response = await fetch(`${DATABASE_API_BASE}/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Database API Error: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('✅ Database response:', responseData);

      // Handle different response formats
      let productsData = [];
      
      if (Array.isArray(responseData)) {
        productsData = responseData;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        productsData = responseData.data;
      } else if (responseData.products && Array.isArray(responseData.products)) {
        productsData = responseData.products;
      } else {
        console.warn('⚠️ Unexpected response format:', responseData);
        productsData = [];
      }

      console.log('✅ All products fetched:', productsData.length, 'products');
      
      // Log products with 3D models for debugging
      const productsWith3D = productsData.filter(p => 
        p.model3D?.url || 
        p.model_3d?.url || 
        p.threeDModel?.url
      );
      console.log('🎯 Products with 3D models:', productsWith3D.length);
      
      if (productsWith3D.length > 0) {
        console.log('📋 3D Model products:', productsWith3D.map(p => ({
          _id: p._id,
          id: p.id,
          hasModel3D: !!(p.model3D?.url || p.model_3d?.url),
          modelUrl: p.model3D?.url || p.model_3d?.url
        })));
      }

      return productsData;

    } catch (err) {
      console.error('❌ Database fetch error:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ FIXED: Extract 3D model data from product
  const extract3DModel = useCallback((productData) => {
    if (!productData) {
      console.log('❌ No product data provided');
      return null;
    }

    console.log('🔍 Extracting 3D model from product:', productData);

    // ✅ FIXED: Check different possible locations for 3D model data
    let model3D = null;

    // Priority 1: model3D field (your data shows this structure)
    if (productData.model3D && productData.model3D.url) {
      model3D = productData.model3D;
      console.log('✅ Found model3D:', model3D);
    }
    // Priority 2: model_3d field
    else if (productData.model_3d && productData.model_3d.url) {
      model3D = productData.model_3d;
      console.log('✅ Found model_3d:', model3D);
    }
    // Priority 3: threeDModel field
    else if (productData.threeDModel && productData.threeDModel.url) {
      model3D = productData.threeDModel;
      console.log('✅ Found threeDModel:', model3D);
    }
    // Priority 4: 3d_model field
    else if (productData['3d_model'] && productData['3d_model'].url) {
      model3D = productData['3d_model'];
      console.log('✅ Found 3d_model:', model3D);
    }

    if (!model3D) {
      console.log('❌ No 3D model found in product data');
      console.log('Available fields:', Object.keys(productData));
      return null;
    }

    // Return standardized format
    return {
      url: model3D.url || model3D.model || model3D.originalUrl,
      renderedImage: model3D.renderedImage || model3D.rendered_image,
      taskId: model3D.taskId || model3D.task_id,
      generatedAt: model3D.generatedAt || model3D.generated_at,
      provider: model3D.provider || 'tripo3d',
      format: model3D.format || 'glb',
      screenshotUrl: model3D.screenshotUrl || model3D.screenshot,
      isReal: model3D.isReal !== false, // Default to true
      ...model3D // Include any other properties
    };
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setProduct(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    // State
    loading,
    error,
    product,
    
    // Actions
    getProductById,
    getAllProducts,
    extract3DModel,
    reset,
    
    // Utils
    DATABASE_API_BASE
  };
}

// ✅ FIXED: Helper hook for specific product ID
export function useProduct(productId) {
  const [productData, setProductData] = useState(null);
  const [model3D, setModel3D] = useState(null);
  const { loading, error, getProductById, extract3DModel } = useProductFromDatabase();

  useEffect(() => {
    if (!productId) {
      console.log('❌ No productId provided to useProduct hook');
      return;
    }

    console.log('🔍 useProduct hook fetching product:', productId);

    const fetchProduct = async () => {
      try {
        const data = await getProductById(productId);
        if (data) {
          console.log('✅ Product data fetched:', data);
          setProductData(data);
          
          const model = extract3DModel(data);
          console.log('🎯 Extracted 3D model:', model);
          setModel3D(model);
        }
      } catch (err) {
        console.error('❌ useProduct fetch error:', err);
      }
    };

    fetchProduct();
  }, [productId, getProductById, extract3DModel]);

  return {
    productData,
    model3D,
    loading,
    error,
    hasModel: !!model3D?.url
  };
}