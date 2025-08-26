import type { RequestHandler } from './$types';

// Streaming API endpoint for SvelteKit
export const GET: RequestHandler = async () => {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      // Send data chunks over time
      for (let i = 0; i < 5; i++) {
        const chunk = `data: {"message": "Chunk ${i + 1}", "time": "${new Date().toISOString()}"}\n\n`;
        controller.enqueue(encoder.encode(chunk));
        
        // Simulate async work
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Close the stream
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  });
};