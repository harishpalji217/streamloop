import { NextResponse } from 'next/server'
import { streamingManager } from '@/lib/streaming'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Trigger scheduled stream checks on health ping
  streamingManager.checkSchedules().catch((err) => console.error('Schedule check ping error:', err))

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    activeStreams: streamingManager.getActiveStreams(),
  })
}
