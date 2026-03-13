import { NextResponse } from 'next/server';
import { processQueue, isQueueAvailable } from '@/lib/queue';

// This endpoint processes the job queue
// It should be called by a cron job periodically (e.g., every minute)
export async function POST(request: Request) {
  try {
    // Check if queue is available
    if (!isQueueAvailable()) {
      return NextResponse.json(
        { error: 'Queue not available', message: 'Redis not configured' },
        { status: 503 }
      );
    }

    // Verify secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.QUEUE_SECRET;
    
    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Process the queue
    const result = await processQueue();
    
    return NextResponse.json({
      success: true,
      processed: result.processed,
      failed: result.failed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Queue] Processing error:', error);
    return NextResponse.json(
      { error: 'Queue processing failed' },
      { status: 500 }
    );
  }
}

// GET method for health check
export async function GET() {
  const available = isQueueAvailable();
  return NextResponse.json({
    status: available ? 'ready' : 'unavailable',
    queue: available ? 'connected' : 'disconnected',
  });
}
