// services/tripo3DService.js - Fixed version with better error handling

class Tripo3DService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = '/api/tripo-proxy'; // Use your server-side proxy
        
        console.log('🔧 Tripo3DService initialized with server proxy');
        console.log('📊 API Key present:', !!apiKey);
    }

    // Make request through your server-side proxy
    async makeRequest(endpoint, options = {}) {
        try {
            console.log('📡 Making request via server proxy to:', endpoint);

            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    endpoint: endpoint,
                    method: options.method || 'GET',
                    body: options.body,
                    apiKey: this.apiKey
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Proxy Error ${response.status}: ${errorText}`);
            }

            return response.json();
        } catch (error) {
            console.error('❌ Proxy request failed:', error);
            throw error;
        }
    }

    // Get balance using server proxy
    async getBalance() {
        try {
            console.log('🔍 Getting balance via server proxy...');
            
            if (!this.apiKey) {
                throw new Error('❌ API key is missing');
            }

            const data = await this.makeRequest('user/balance');
            console.log('✅ Balance retrieved:', data);
            return data;
            
        } catch (error) {
            console.error('❌ Balance check failed:', error);
            throw error;
        }
    }

    // Real upload function using server proxy
    async uploadImage(imageFile) {
        try {
            console.log('📤 Uploading image via server proxy...');
            
            // Convert file to base64 for transmission
            const base64 = await this.fileToBase64(imageFile);
            
            const data = await this.makeRequest('upload', {
                method: 'POST',
                body: {
                    file: base64,
                    filename: imageFile.name,
                    type: 'image'
                }
            });

            console.log('✅ Image uploaded:', data);
            return data;
            
        } catch (error) {
            console.error('❌ Upload failed:', error);
            // ❌ REMOVED: Don't return mock data on upload failure
            throw error; // Let the error bubble up
        }
    }

    // Helper function to convert file to base64
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // Real 3D generation using server proxy
    async createModelFromImage(imageToken, options = {}) {
        try {
            console.log('🚀 Creating 3D model task via server proxy...');
            
            const data = await this.makeRequest('task', {
                method: 'POST',
                body: {
                    type: 'image_to_model',
                    file: {
                        type: 'image',
                        file_token: imageToken
                    },
                    ...options
                }
            });

            console.log('✅ Task created:', data);
            return data;
        } catch (error) {
            console.error('❌ Task creation failed:', error);
            // ❌ REMOVED: Don't return mock data on task creation failure
            throw error; // Let the error bubble up
        }
    }

    // Real status check using server proxy
    async checkTaskStatus(taskId) {
        try {
            const data = await this.makeRequest(`task/${taskId}`);
            console.log('📊 Task status response:', data);
            console.log('📊 Task status:', data.data?.status);
            return data;
        } catch (error) {
            console.error('❌ Status check error:', error);
            // ❌ REMOVED: Don't return mock data on status check failure
            throw error; // Let the error bubble up
        }
    }

    // Wait for completion - FIXED VERSION
    async waitForCompletion(taskId, onProgress = null, maxWaitTime = 300000) { // 5 minutes
        const startTime = Date.now();
        const pollInterval = 5000; // Check every 5 seconds

        return new Promise((resolve, reject) => {
            const poll = async () => {
                try {
                    if (Date.now() - startTime > maxWaitTime) {
                        reject(new Error('3D generation timed out'));
                        return;
                    }

                    const statusResponse = await this.checkTaskStatus(taskId);
                    const taskData = statusResponse.data; // This contains the actual task data
                    
                    console.log('🔍 Full task data:', taskData); // Debug log
                    
                    if (onProgress) {
                        onProgress(`Processing... Status: ${taskData?.status || 'unknown'}`);
                    }

                    switch (taskData?.status) {
                        case 'success':
                            console.log('✅ 3D model generation completed!');
                            console.log('📦 Task result:', taskData.result); // Debug log for result
                            resolve(taskData); // Return the full task data
                            return;
                            
                        case 'failed':
                            console.error('❌ Task failed:', taskData);
                            reject(new Error(`3D generation failed: ${taskData.error || 'Unknown error'}`));
                            return;
                            
                        case 'running':
                        case 'queued':
                            console.log(`⏳ Task ${taskData.status}...`);
                            setTimeout(poll, pollInterval);
                            break;
                            
                        default:
                            console.log(`❓ Unknown status: ${taskData?.status}`);
                            setTimeout(poll, pollInterval);
                            break;
                    }
                } catch (error) {
                    console.error('❌ Polling error:', error);
                    reject(error);
                }
            };

            poll();
        });
    }

    // ✅ FIXED: Main generation function - NO MORE FALLBACKS TO MOCK DATA
    async generate3DFromScreenshot(screenshotDataURL, onProgress = null, options = {}) {
        try {
            console.log('🎯 Starting 3D generation via server proxy...');
            
            if (onProgress) onProgress('Converting screenshot...');
            
            // Convert data URL to file
            const response = await fetch(screenshotDataURL);
            const blob = await response.blob();
            const file = new File([blob], `screenshot-${Date.now()}.png`, { 
                type: 'image/png' 
            });

            console.log('📸 Screenshot converted:', {
                size: file.size,
                type: file.type
            });

            if (onProgress) onProgress('Uploading image...');
            
            // Upload image - No fallback on failure
            const uploadResult = await this.uploadImage(file);
            const imageToken = uploadResult.data.image_token;

            if (!imageToken) {
                throw new Error('Failed to get image token from upload');
            }

            if (onProgress) onProgress('Starting 3D generation...');
            
            // Create task - No fallback on failure
            const taskResult = await this.createModelFromImage(imageToken, options);
            const taskId = taskResult.data.task_id;

            if (!taskId) {
                throw new Error('Failed to get task ID from 3D generation request');
            }

            if (onProgress) onProgress('Processing 3D model...');
            
            // Wait for completion - No fallback on failure
            const completedTaskData = await this.waitForCompletion(taskId, onProgress);

            console.log('🔍 Completed task data:', completedTaskData); // Debug log

            // Extract the actual model URLs from the completed task
            // Based on the API response, data is available in both 'output' and 'result' fields
            const output = completedTaskData.output;
            const result = completedTaskData.result;
            
            if (!output && !result) {
                throw new Error('No output or result data received from completed task');
            }

            console.log('🔍 API Response Structure:', {
                hasOutput: !!output,
                hasResult: !!result,
                output: output,
                result: result
            });

            // Extract model URLs - try multiple approaches based on actual API structure
            let modelUrl = null;
            let renderedImage = null;

            // Priority 1: Use output field (direct URLs)
            if (output) {
                modelUrl = output.pbr_model || output.model || null;
                renderedImage = output.rendered_image || output.preview || null;
            }

            // Priority 2: Use result field (nested objects with URLs) as fallback
            if (!modelUrl && result) {
                modelUrl = result.pbr_model?.url || result.model?.url || null;
                renderedImage = result.rendered_image?.url || result.preview?.url || null;
            }

            console.log('🔍 Extracted URLs:', {
                modelUrl: modelUrl,
                renderedImage: renderedImage,
                source: output ? 'output' : 'result'
            });

            // ✅ FIXED: Validate that we have a REAL model URL
            if (!modelUrl) {
                console.error('❌ No model URL found');
                console.error('📋 Available in output:', Object.keys(output || {}));
                console.error('📋 Available in result:', Object.keys(result || {}));
                throw new Error('No 3D model URL found in the API response');
            }

            // ✅ FIXED: Validate that it's not a mock/dummy URL
            if (modelUrl.includes('example.com') || modelUrl.includes('mock-model') || modelUrl.includes('mock_')) {
                throw new Error('Received mock/dummy model URL instead of real model');
            }

            // ✅ FIXED: Validate that it's a proper URL
            if (!modelUrl.startsWith('http')) {
                throw new Error(`Invalid model URL format: ${modelUrl}`);
            }

            // Build result object with proper validation
            const finalResult = {
                model: modelUrl,
                rendered_image: renderedImage,
                task_id: taskId,
                generatedAt: new Date().toISOString(),
                isMock: false, // Always false for real API responses
                rawOutput: output, // Include raw output for debugging
                rawResult: result  // Include raw result for debugging
            };

            console.log('🎉 Final result with REAL model URL:', finalResult);
            return finalResult;

        } catch (error) {
            console.error('❌ 3D generation failed:', error);
            
            // ✅ FIXED: Don't provide fallback mock data
            // Instead, throw the actual error so user knows what went wrong
            throw new Error(`3D generation failed: ${error.message}`);
        }
    }

    // Test connection
    async testConnection() {
        try {
            console.log('🧪 Testing connection via server proxy...');
            const balance = await this.getBalance();
            return { 
                success: true, 
                balance: balance.data,
                message: 'Connected via server proxy'
            };
        } catch (error) {
            console.error('❌ Connection test failed:', error);
            throw error;
        }
    }
}

// Initialize with API key from env
const tripo3DService = new Tripo3DService(process.env.NEXT_PUBLIC_TRIPO_API_KEY);

export default tripo3DService;
export { Tripo3DService };