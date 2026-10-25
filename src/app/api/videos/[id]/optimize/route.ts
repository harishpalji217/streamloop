import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import path from 'path'
import fs from 'fs/promises'
import { spawn } from 'child_process'

export const dynamic = 'force-dynamic'

function runFFmpegOptimize(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = [
      '-y',
      '-i', inputPath,
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-b:v', '2500k',
      '-minrate', '2000k',
      '-maxrate', '2500k',
      '-bufsize', '5000k',
      '-r', '30',
      '-g', '60',
      '-keyint_min', '60',
      '-sc_threshold', '0',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-ar', '44100',
      '-movflags', '+faststart',
      outputPath
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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const video = await prisma.video.findUnique({
      where: { id: params.id },
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    const inputPath = path.join(process.cwd(), 'public', video.filePath)
    const outputPath = path.join(process.cwd(), 'public', 'uploads', `opt-${video.filename}`)

    // Check if original file exists
    try {
      await fs.access(inputPath)
    } catch {
      return NextResponse.json({ error: 'Original video file not found on disk' }, { status: 404 })
    }

    // Run the optimization
    await runFFmpegOptimize(inputPath, outputPath)

    // Overwrite the original with the optimized file
    await fs.unlink(inputPath)
    await fs.rename(outputPath, inputPath)

    // Update metadata and file size
    const stat = await fs.stat(inputPath)
    const metadata = await getVideoMetadata(inputPath)

    const updatedVideo = await prisma.video.update({
      where: { id: params.id },
      data: {
        fileSize: stat.size,
        duration: metadata.duration || video.duration,
        width: metadata.width || video.width,
        height: metadata.height || video.height,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Video successfully optimized for YouTube Live with 2.0s keyframes!',
      video: updatedVideo,
    })
  } catch (error) {
    console.error('Error optimizing video:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Optimization failed' },
      { status: 500 }
    )
  }
}
