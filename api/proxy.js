// Vercel serverless function to proxy requests to your EC2 backend
// This handles query parameter format: /api/proxy?path=bills/split
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const backendUrl = 'http://ec2-13-223-49-221.compute-1.amazonaws.com:8080/api';
    
    // Get the path from query parameters
    const { path, ...otherParams } = req.query;
    
    if (!path) {
      return res.status(400).json({ error: 'Missing path parameter' });
    }
    
    // Build query string from remaining parameters
    const queryString = new URLSearchParams(otherParams).toString();
    
    // Construct the full backend URL
    const fullUrl = `${backendUrl}/${path}${queryString ? `?${queryString}` : ''}`;
    
    console.log('Proxying request:', {
      method: req.method,
      originalUrl: req.url,
      path,
      fullUrl,
      queryParams: otherParams
    });

    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Add body for POST/PUT requests
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(fullUrl, fetchOptions);
    
    if (!response.ok) {
      console.error('Backend response error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
    }
    
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    res.status(response.status).json(data);
    
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Proxy request failed', 
      message: error.message,
      url: req.url,
      method: req.method
    });
  }
}