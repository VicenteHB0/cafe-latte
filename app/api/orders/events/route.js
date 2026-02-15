import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await dbConnect();

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        const sendEvent = (data) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        // Send initial connection message
        sendEvent({ type: 'connected' });

        // Setup Change Stream
        // Note: Change Streams require a replica set or a specialized standalone config.
        // In fully hosted MongoDB Atlas, this works out of the box.
        // For local dev without replica set, this might fail. 
        // We add a fallback polling mechanism if watch() fails or isn't supported? 
        // Actually, let's try watch() first as it's the requested feature.
        
        try {
            const changeStream = Order.watch([], { fullDocument: 'updateLookup' });
            
            changeStream.on('change', (change) => {
                // We only care about insert, update, replace
                if (['insert', 'update', 'replace'].includes(change.operationType)) {
                    sendEvent({
                        type: change.operationType,
                        document: change.fullDocument
                    });
                }
            });

            changeStream.on('error', (error) => {
                console.error("Change Stream Error:", error);
                sendEvent({ type: 'error', message: 'Stream connection lost' });
            });

            // Keep-alive to prevent timeout
            const interval = setInterval(() => {
                controller.enqueue(encoder.encode(': keep-alive\n\n'));
            }, 15000);

            request.signal.addEventListener('abort', () => {
                clearInterval(interval);
                changeStream.close();
            });

        } catch (err) {
            console.error("Failed to create change stream:", err);
            sendEvent({ type: 'error', message: 'Real-time updates not available' });
            controller.close();
        }
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('SSE Error:', error);
    return NextResponse.json(
      { error: 'Error initializing stream' },
      { status: 500 }
    );
  }
}
