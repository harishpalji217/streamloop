import { prisma } from './prisma'
import path from 'path'

interface StreamProcess {
  process: any
  slotId: string
  sessionId: string
}

const globalForStreaming = globalThis as unknown as {
  streamProcesses: Map<string, StreamProcess> | undefined
}

class StreamingManager {
  constructor() {
    this.initScheduler()
  }

  private initScheduler() {
    if ((globalThis as any).streamSchedulerActive) return
    ;(globalThis as any).streamSchedulerActive = true

    console.log('[Auto-Scheduler] Initialized background stream scheduler (every 20s)')
    setInterval(async () => {
      try {
        await this.checkSchedules()
      } catch (err) {
        console.error('[Auto-Scheduler] Tick error:', err)
      }
    }, 20000)
  }

  async checkSchedules(): Promise<void> {
    try {
      const now = new Date()

      // 1. Find active slots scheduled to start:
      const slotsToStart = await prisma.liveSlot.findMany({
        where: {
          isActive: true,
          scheduledStart: { lte: now },
          OR: [
            { scheduledEnd: null },
            { scheduledEnd: { gt: now } },
          ],
        },
        include: { video: true },
      })

      for (const slot of slotsToStart) {
        if (!this.processes.has(slot.id) && slot.video && slot.streamKey) {
          console.log(`[Auto-Scheduler] 🚀 Auto-starting stream for slot "${slot.name}" (${slot.id})`)
          await this.startStream(slot.id, slot.userId)
        }
      }

      // 2. Find slots that reached scheduledEnd:
      const slotsToEnd = await prisma.liveSlot.findMany({
        where: {
          scheduledEnd: { lte: now },
        },
      })

      for (const slot of slotsToEnd) {
        if (this.processes.has(slot.id)) {
          console.log(`[Auto-Scheduler] ⏹️ Auto-stopping stream for slot "${slot.name}" (${slot.id})`)
          await this.stopStream(slot.id)
        }
      }
    } catch (err) {
      console.error('[Auto-Scheduler] Error checking schedules:', err)
    }
  }

  private get processes(): Map<string, StreamProcess> {
    if (!globalForStreaming.streamProcesses) {
      globalForStreaming.streamProcesses = new Map()
    }
    return globalForStreaming.streamProcesses
  }

  async startStream(slotId: string, userId: string): Promise<{ success: boolean; sessionId?: string; error?: string }> {
    try {
      const slot = await prisma.liveSlot.findUnique({
        where: { id: slotId },
        include: { video: true },
      })

      if (!slot) return { success: false, error: 'Slot not found' }
      if (!slot.video) return { success: false, error: 'No video assigned to this slot. Please select a video first.' }
      if (!slot.streamKey) return { success: false, error: 'Stream key not configured. Please add your YouTube stream key.' }
      if (this.processes.has(slotId)) return { success: false, error: 'Stream already running for this slot' }

      const session = await prisma.streamSession.create({
        data: { slotId, userId, status: 'STARTING' },
      })

      const videoPath = path.join(process.cwd(), 'public', slot.video.filePath)
      const streamKey = slot.streamKey.trim()
      const rtmpUrl = `rtmp://a.rtmp.youtube.com/live2/${streamKey}`

      try {
        const ffmpeg = require('fluent-ffmpeg')
        const command = ffmpeg(videoPath)
          .inputOptions([
            '-stream_loop', slot.loopEnabled ? '-1' : '0',
            '-re'
          ])
          .outputOptions([
            '-c:v', 'copy',
            '-c:a', 'copy',
            '-f', 'flv',
            '-flvflags', 'no_duration_filesize'
          ])
          .output(rtmpUrl)
          .on('start', (cmd: string) => {
            console.log(`FFmpeg started for slot ${slotId}:`, cmd)
            this.updateSessionStatus(session.id, 'RUNNING', undefined, process.pid)
          })
          .on('progress', (progress: any) => {
            console.log(`Streaming progress for slot ${slotId}:`, progress.timemark)
          })
          .on('error', async (err: Error) => {
            console.error(`FFmpeg error for slot ${slotId}:`, err.message)
            await this.updateSessionStatus(session.id, 'ERROR', err.message)
            this.processes.delete(slotId)
          })
          .on('end', async () => {
            console.log(`FFmpeg ended for slot ${slotId}`)
            await this.updateSessionStatus(session.id, 'STOPPED')
            this.processes.delete(slotId)
          })

        this.processes.set(slotId, { process: command, slotId, sessionId: session.id })
        command.run()

        return { success: true, sessionId: session.id }
      } catch (ffmpegErr) {
        await this.updateSessionStatus(session.id, 'ERROR', 'FFmpeg not installed or not found in PATH')
        return { success: false, error: 'FFmpeg is not installed. Please install FFmpeg to start streaming.' }
      }
    } catch (error) {
      console.error('Error starting stream:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async stopStream(slotId: string): Promise<{ success: boolean; error?: string }> {
    const streamProcess = this.processes.get(slotId)
    if (!streamProcess) {
      try {
        const child_process = require('child_process')
        child_process.execSync('taskkill /F /IM ffmpeg.exe /T 2>nul || exit 0')
      } catch (e) {}
      return { success: true }
    }

    try {
      await this.updateSessionStatus(streamProcess.sessionId, 'STOPPING')
      streamProcess.process.kill('SIGKILL')

      try {
        const child_process = require('child_process')
        child_process.execSync('taskkill /F /IM ffmpeg.exe /T 2>nul || exit 0')
      } catch (e) {}

      this.processes.delete(slotId)
      return { success: true }
    } catch (error) {
      console.error('Error stopping stream:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async stopAllStreams(): Promise<void> {
    for (const [slotId] of this.processes) {
      await this.stopStream(slotId)
    }
  }

  isStreaming(slotId: string): boolean {
    return this.processes.has(slotId)
  }

  getActiveStreams(): string[] {
    return Array.from(this.processes.keys())
  }

  private async updateSessionStatus(
    sessionId: string,
    status: string,
    errorMessage?: string,
    ffmpegPid?: number
  ): Promise<void> {
    try {
      await prisma.streamSession.update({
        where: { id: sessionId },
        data: {
          status,
          errorMessage,
          ffmpegPid,
          startedAt: status === 'RUNNING' ? new Date() : undefined,
          stoppedAt: ['STOPPED', 'ERROR'].includes(status) ? new Date() : undefined,
        },
      })
    } catch (error) {
      console.error('Error updating session status:', error)
    }
  }
}

export const streamingManager = new StreamingManager()
