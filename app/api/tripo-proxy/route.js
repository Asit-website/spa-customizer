export default async function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const { endpoint, method = 'GET', body, apiKey } = req.body;
        const key = apiKey || process.env.TRIPO_API_KEY;

        if (!key) {
            return res.status(400).json({ error: 'API key missing' });
        }

        console.log('🔄 Proxying request to Tripo3D:', endpoint);

        // Build the full URL
        let url = `https://api.tripo3d.ai/v2/openapi/${endpoint}`;
        
        // Handle different endpoints
        let requestBody = null;
        let headers = {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json'
        };

        if (endpoint === 'upload' && body) {
            // Handle file upload
            const formData = new FormData();
            
            // Convert base64 back to file
            if (body.file && body.file.startsWith('data:')) {
                const base64Data = body.file.split(',')[1];
                const buffer = Buffer.from(base64Data, 'base64');
                const blob = new Blob([buffer], { type: 'image/png' });
                formData.append('file', blob, body.filename || 'screenshot.png');
            }

            headers = {
                'Authorization': `Bearer ${key}`
                // Don't set Content-Type for FormData, let fetch set it
            };
            requestBody = formData;
            url = 'https://api.tripo3d.ai/v2/openapi/upload';

        } else if (body) {
            // Regular JSON body
            requestBody = JSON.stringify(body);
        }

        // Make the request to Tripo3D API
        const response = await fetch(url, {
            method: method,
            headers: headers,
            body: requestBody
        });

        const responseText = await response.text();
        
        // Try to parse as JSON, fallback to text
        let data;
        try {
            data = JSON.parse(responseText);
        } catch {
            data = { message: responseText };
        }

        if (!response.ok) {
            console.error('Tripo3D API Error:', response.status, data);
            res.status(response.status).json({
                error: data.message || `API Error: ${response.status}`,
                details: data
            });
            return;
        }

        console.log('✅ Tripo3D API Success:', endpoint);
        res.status(200).json(data);

    } catch (error) {
        console.error('❌ Proxy error:', error);
        res.status(500).json({ 
            error: error.message,
            details: 'Server proxy error'
        });
    }
}

export async function POST(request) {
    const { endpoint, method = 'GET', body, apiKey } = await request.json();
    const key = apiKey || process.env.TRIPO_API_KEY;

    if (!key) {
        return new Response(JSON.stringify({ error: 'API key missing' }), { status: 400 });
    }

    let url = `https://api.tripo3d.ai/v2/openapi/${endpoint}`;
    let headers = {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
    };
    let requestBody = undefined;

    if (endpoint === 'upload' && body) {
        // Handle file upload
        const formData = new FormData();
        if (body.file && body.file.startsWith('data:')) {
            const base64Data = body.file.split(',')[1];
            const buffer = Buffer.from(base64Data, 'base64');
            formData.append('file', new Blob([buffer], { type: 'image/png' }), body.filename || 'screenshot.png');
        }
        headers = {
            'Authorization': `Bearer ${key}`
            // Don't set Content-Type for FormData
        };
        requestBody = formData;
        url = 'https://api.tripo3d.ai/v2/openapi/upload';
    } else if (body) {
        requestBody = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: headers,
            body: requestBody
        });

        const responseText = await response.text();
        let data;
        try {
            data = JSON.parse(responseText);
        } catch {
            data = { message: responseText };
        }

        if (!response.ok) {
            return new Response(JSON.stringify({
                error: data.message || `API Error: ${response.status}`,
                details: data
            }), { status: response.status });
        }

        return new Response(JSON.stringify(data), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ 
            error: error.message,
            details: 'Server proxy error'
        }), { status: 500 });
    }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  if (!url) {
    return new Response('Missing url param', { status: 400 });
  }
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return new Response('Failed to fetch model', { status: 500 });
    }
    // Stream the response as-is
    return new Response(res.body, {
      status: 200,
      headers: {
        'Content-Type': res.headers.get('content-type') || 'model/gltf-binary',
        'Content-Disposition': 'inline'
      }
    });
  } catch (err) {
    return new Response('Proxy error: ' + err.message, { status: 500 });
  }
}

export async function OPTIONS(request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS, POST',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}