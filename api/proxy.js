// Vercel serverless function to proxy requests to your EC2 backend
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
    
    // Vercel's rewrite rule forwards the path, so we can use req.url directly
    const apiPath = req.url.replace('/api/proxy', '');
    const fullUrl = `${backendUrl}${apiPath}`;
    
    console.log('Proxying request:', {
      method: req.method,
      originalUrl: req.url,
      pathname: url.pathname,
      apiPath,
      fullUrl
    });

    // Prepare fetch options
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Add body for POST/PUT requests
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.body && Object.keys(req.body).length > 0) {
        fetchOptions.body = JSON.stringify(req.body);
      }
    }

    // Make the request to backend
    const response = await fetch(fullUrl, fetchOptions);
    
    console.log('Backend response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    // Handle response
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    // Return response with same status
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