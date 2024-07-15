import { Context } from "@netlify/edge-functions";

const CORS_HEADERS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "*",
  "access-control-allow-headers": "*",
};

export default async (request: Request, context: Context) => {

  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: CORS_HEADERS,
    });
  }

 const { pathname, searchParams } = new URL(request.url);
  if(pathname === "/") {
    let blank_html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AI API proxy on Netlify Edge</title>
</head>
<body>
  <h1 id="AI-api-proxy-on-netlify-edge">AI API proxy on Netlify Edge</h1>
  <p>Tips: This project uses a reverse proxy to solve problems such as location restrictions in AI APIs. </p>
  <p>If you have any of the following requirements, you may need the support of this project.</p>
  <ol>
  <li>When you see the error message &quot;User location is not supported for the API use&quot; when calling the AI API</li>
  <li>You want to customize the AI API</li>
  </ol>
</body>
</html>
    `
    return new Response(blank_html, {
      headers: {
        ...CORS_HEADERS,
        "content-type": "text/html"
      },
    });
  }

  const url = new URL(request.url);
  const fetchAPI = request.url.replace(url.host, 'api.openai.com');

  const headers = request.headers; 
  headers.delete("x-real-ip");
  headers.delete("x-forwarded-for");
  
  const payload = {
    body: request.body,
    method: request.method,
    headers,
    duplex: 'half',
  }
  
  if (['HEAD', 'GET'].includes(request.method)) {
    delete payload.body;
    delete payload.duplex;
  }
  
  const response = await fetch(fetchAPI,payload);
  
  const responseHeaders = {
    ...CORS_HEADERS,
    ...Object.fromEntries(response.headers),
    "content-encoding": null
  };

  return new Response(response.body, {
    headers: responseHeaders,
    statusText: response.statusText,
    status: response.status
  });
};
