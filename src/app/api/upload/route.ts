import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR)
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
  }
}

function getVideoMetadata(filePath: string): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve) => {
    try {
      const ffmpeg = require('fluent-ffmpeg')
      ffmpeg.ffprobe(filePath, (err: any, metadata: any) => {
        if (err) {
          console.warn('ffprobe failed (FFmpeg may not be installed):', err.message)
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
    } catch (e) {
      console.warn('FFmpeg not available, skipping metadata extraction')
      resolve({ duration: 0, width: 0, height: 0 })
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    await ensureUploadDir()

    const formData = await request.formData()
    const file = formData.get('video') as File

    if (!file) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 })
    }

    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only MP4, WebM, MKV, and MOV are allowed.' }, { status: 400 })
    }

    const maxSize = 500 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 500MB.' }, { status: 400 })
    }

    const fileExt = path.extname(file.name) || '.mp4'
    const filename = `${uuidv4()}${fileExt}`
    const filePath = path.join(UPLOAD_DIR, filename)
    const relativePath = `/uploads/${filename}`

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await fs.writeFile(filePath, buffer)

    // Try to get metadata - works even without FFmpeg installed
    const metadata = await getVideoMetadata(filePath)

    // Ensure default user exists
    const userId = 'default-user'
    let user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          email: 'admin@streamloop.local',
          name: 'Admin User',
        },
      })
    }

    const video = await prisma.video.create({
      data: {
        filename,
        originalName: file.name,
        filePath: relativePath,
        fileSize: file.size,
        duration: metadata.duration,
        width: metadata.width,
        height: metadata.height,
        mimeType: file.type,
        thumbnailPath: null,
        userId,
      },
    })

    return NextResponse.json(video, { status: 201 })
  } catch (error) {
    console.error('Error uploading video:', error)
    return NextResponse.json(
      { error: 'Failed to upload video: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}
