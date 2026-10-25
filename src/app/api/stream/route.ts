import { NextRequest, NextResponse } from 'next/server'
import { streamingManager } from '@/lib/streaming'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slotId } = body

    if (!slotId) {
      return NextResponse.json({ error: 'Slot ID is required' }, { status: 400 })
    }

    const userId = 'default-user' // In real app, get from auth

    const result = await streamingManager.startStream(slotId, userId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, sessionId: result.sessionId })
  } catch (error) {
    console.error('Error starting stream:', error)
    return NextResponse.json({ error: 'Failed to start stream' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slotId = searchParams.get('slotId')

    if (!slotId) {
      return NextResponse.json({ error: 'Slot ID is required' }, { status: 400 })
    }

    const result = await streamingManager.stopStream(slotId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error stopping stream:', error)
    return NextResponse.json({ error: 'Failed to stop stream' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slotId = searchParams.get('slotId')

    if (!slotId) {
      return NextResponse.json({ error: 'Slot ID is required' }, { status: 400 })
    }

    const isStreaming = streamingManager.isStreaming(slotId)

    return NextResponse.json({ isStreaming, slotId })
  } catch (error) {
    console.error('Error checking stream status:', error)
    return NextResponse.json({ error: 'Failed to check stream status' }, { status: 500 })
  }
}