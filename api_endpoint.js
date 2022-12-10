// Cloudflare Worker 2
// Description: This is the API endpoint for the timetable. It is used to fetch the timetable from Cloudflare KV and return it as a JSON-formatted response.
addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request))
  });
  
  async function handleRequest(request) {
    try {
      // Get the timetable from the database
      let timetable = await BKDB.get("timetable");
  
      // Return a JSON-formatted response
      return new Response(timetable, {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      // If there is an error, return a response with a 500 status code
      return new Response(JSON.stringify({ error: error.message }), {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        status: 500,
      });
    }
  }
  