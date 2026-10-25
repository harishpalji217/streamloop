import { prisma } from './prisma'
import path from 'path'
import fs from 'fs/promises'
import { spawn } from 'child_process'

function getTargetBitrate(width: number, height: number): { videoBitrate: string; maxRate: string; bufSize: string } {
  const minDim = Math.min(width || 720, height || 720)
  if (minDim <= 480) {
    // 360p / 480p (Mobile SD / Reels): YouTube strictly recommends 750 Kbps
    return { videoBitrate: '750k', maxRate: '800k', bufSize: '1500k' }
  } else if (minDim <= 720) {
    // 720p HD: YouTube recommends 1500 - 2000 Kbps
    return { videoBitrate: '1800k', maxRate: '2000k', bufSize: '3600k' }
  } else {
    // 1080p Full HD: YouTube recommends 2500 - 3000 Kbps
    return { videoBitrate: '2500k', maxRate: '2800k', bufSize: '5000k' }
  }
}

function runFFmpegOptimize(
  inputPath: string,
  outputPath: string,
  bitrates: { videoBitrate: string; maxRate: string; bufSize: string }
): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = [
      '-y',
      '-i', inputPath,
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-b:v', bitrates.videoBitrate,
      '-maxrate', bitrates.maxRate,
      '-bufsize', bitrates.bufSize,
      '-r', '30',
      '-g', '60',
      '-keyint_min', '60',
      '-sc_threshold', '0',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-ar', '44100',
      '-movflags', '+faststart',
      outputPath,
    ]

    const proc = spawn('ffmpeg', args)

    let stderr = ''
    proc.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    proc.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`FFmpeg optimization failed (code ${code}): ${stderr.slice(-300)}`))
      }
    })

    proc.on('error', (err) => {
      reject(err)
    })
  })
}

function getVideoMetadata(filePath: string): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve) => {
    try {
      const ffmpeg = require('fluent-ffmpeg')
      ffmpeg.ffprobe(filePath, (err: any, metadata: any) => {
        if (err) {
          resolve({ duration: 0, width: 0, height: 0 })
          return
        }
        const videoStream = metadata.streams?.find((s: any) => s.codec_type === 'video')
        resolve({
          duration: metadata.format?.duration || 0,
          width: videoStream?.width || 0,
          height: videoStream?.height || 0,
        })
      })
    } catch {
      resolve({ duration: 0, width: 0, height: 0 })
    }
  })
}

export async function optimizeVideo(videoId: string): Promise<void> {
  try {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    })

    if (!video) return

    await prisma.video.update({
      where: { id: videoId },
      data: { status: 'PROCESSING' },
    })

    const inputPath = path.join(process.cwd(), 'public', video.filePath)
    const outputPath = path.join(process.cwd(), 'public', 'uploads', `opt-${video.filename}`)

    // Check if original file exists
    await fs.access(inputPath)

    // Inspect resolution to choose YouTube recommended bitrate dynamically
    const initialMeta = await getVideoMetadata(inputPath)
    const bitrates = getTargetBitrate(initialMeta.width || video.width || 720, initialMeta.height || video.height || 720)

    // Run the optimization
    await runFFmpegOptimize(inputPath, outputPath, bitrates)

    // Overwrite the original with the optimized file
    await fs.unlink(inputPath)
    await fs.rename(outputPath, inputPath)

    // Update metadata and status to READY
    const stat = await fs.stat(inputPath)
    const metadata = await getVideoMetadata(inputPath)

    await prisma.video.update({
      where: { id: videoId },
      data: {
        fileSize: stat.size,
        duration: metadata.duration || video.duration,
        width: metadata.width || video.width,
        height: metadata.height || video.height,
        status: 'READY',
      },
    })
    console.log(`Video ${videoId} successfully optimized for YouTube Live (${bitrates.videoBitrate})`)
  } catch (err) {
    console.error(`Failed to optimize video ${videoId}:`, err)
    try {
      await prisma.video.update({
        where: { id: videoId },
        data: { status: 'READY' },
      })
    } catch {}
  }
}
