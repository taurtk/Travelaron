// Vercel serverless function to proxy requests to your EC2 backend
// This handles dynamic routes like /api/proxy/settlements/compute
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
    
    // Get the path segments from the dynamic route
    const { path: pathSegments, ...queryParams } = req.query;
    
    // Join path segments to create the API path
    const apiPath = Array.isArray(pathSegments) ? pathSegments.join('/') : (pathSegments || '');
    
    // Build query string from remaining parameters
    const queryString = new URLSearchParams(queryParams).toString();
    
    // Construct the full backend URL
    const fullUrl = `${backendUrl}/${apiPath}${queryString ? `?${queryString}` : ''}`;
    
    console.log('Proxying request:', {
      method: req.method,
      originalUrl: req.url,
      pathSegments,
      apiPath,
      fullUrl,
      queryParams
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