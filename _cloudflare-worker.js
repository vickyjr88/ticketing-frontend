addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Replace your domain with the target IP
  const targetUrl = url.toString().replace(
    'tickets.vitaldigitalmedia.net',
    '3.225.246.72'
  ).replace('https://', 'http://')
  
  // Forward the request to your backend
  const modifiedRequest = new Request(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body
  })
  
  const response = await fetch(modifiedRequest)
  
  // Return the response with CORS headers if needed
  const modifiedResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      ...response.headers,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
  
  return modifiedResponse
}