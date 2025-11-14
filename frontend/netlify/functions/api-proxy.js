// This function will proxy API requests to your backend
// Netlify Functions have a 10-second timeout, so this is just for simple requests

exports.handler = async (event, context) => {
  // For now, we'll just return a simple response
  // In a real implementation, you would proxy to your backend API
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body: JSON.stringify({
      message: 'API proxy function working',
      path: event.path,
      method: event.httpMethod,
    }),
  };
};