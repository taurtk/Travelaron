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
    const { path, ...queryParams } = req.query;
    const backendUrl = 'http://ec2-13-223-49-221.compute-1.amazonaws.com:8080/api';
    
    // Construct the full URL
    const apiPath = Array.isArray(path) ? path.join('/') : path || '';
    const queryString = new URLSearchParams(queryParams).toString();
    const fullUrl = `${backendUrl}/${apiPath}${queryString ? `?${queryString}` : ''}`;

    console.log('Proxying request to:', fullUrl);

    const response = await fetch(fullUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers,
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy request failed', message: error.message });
  }
}