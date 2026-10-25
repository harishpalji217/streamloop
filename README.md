# StreamLoop - Automated Live Streaming to YouTube

A web application for managing live streaming slots, uploading pre-recorded videos, and automatically broadcasting looped video feeds to YouTube Live via FFmpeg.

## Features

- **Dashboard** - Overview of active slots, videos, and recent streaming activity
- **Live Slots Management** - Create, configure, and manage streaming slots with expiration dates
- **Video Library** - Upload and manage pre-recorded videos with thumbnails and metadata
- **Stream Controls** - Start/stop streams with real-time status monitoring
- **Loop Playback** - Automatically loop videos until manually stopped
- **Secure Stream Keys** - Masked input for YouTube Live stream keys
- **Responsive UI** - Modern dashboard with sidebar navigation, dark/light mode support

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **UI Components**: Custom components with Lucide React icons
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Streaming Engine**: fluent-ffmpeg for RTMP streaming to YouTube
- **File Storage**: Local filesystem (`/public/uploads`)

## Prerequisites

- Node.js 18+
- FFmpeg installed on your system
  - macOS: `brew install ffmpeg`
  - Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html)
  - Linux: `apt-get install ffmpeg` or equivalent

## Getting Started

### 1. Clone and Install

```bash
cd streamloop
npm install
```

### 2. Set Up Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### 3. Configure Environment

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL="file:./dev.db"
NODE_ENV="development"
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creating a Streaming Slot

1. Navigate to **Live Slots** → Click **Add Slot**
2. Enter a slot name
3. Paste your YouTube Live stream key (from YouTube Studio → Go Live → Stream Settings)
4. Set expiration date
5. Enable **Loop Video** for continuous playback
6. Click **Create Slot**

### Uploading Videos

1. Go to **Videos** page or use the **Upload Video** button in a slot detail
2. Select an MP4, WebM, or MOV file (max 500MB)
3. Wait for upload and thumbnail generation
4. Select the video for your slot

### Starting a Stream

1. Open a slot detail page (`/live-slots/[id]`)
2. Ensure a video is selected and stream key is configured
3. Click **Start Stream**
4. Monitor the live status indicator

### Stopping a Stream

Click **Stop Stream** on the slot detail page or the stream will automatically stop when the slot expires.

## Project Structure

```
streamloop/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/
│   └── uploads/               # Uploaded video files
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── slots/         # Slot CRUD operations
│   │   │   ├── videos/        # Video management
│   │   │   ├── upload/        # Video upload handling
│   │   │   └── stream/        # Stream start/stop/status
│   │   ├── dashboard/         # Dashboard page
│   │   ├── live-slots/        # Live slots pages
│   │   ├── videos/            # Videos library page
│   │   ├── billing/           # Billing page
│   │   ├── profile/           # Profile page
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home redirect
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   ├── layout/            # Layout components (Sidebar, MainLayout)
│   │   ├── dashboard/         # Dashboard components
│   │   ├── slots/             # Slot-related components
│   │   └── videos/            # Video-related components
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── streaming.ts       # FFmpeg streaming manager
│   │   └── utils.ts           # Utility functions
│   └── hooks/                 # Custom React hooks (future)
├── .env                       # Environment variables
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## API Endpoints

### Slots
- `GET /api/slots` - List all slots
- `POST /api/slots` - Create new slot
- `GET /api/slots/[id]` - Get slot details
- `PUT /api/slots/[id]` - Update slot
- `DELETE /api/slots/[id]` - Delete slot

### Videos
- `GET /api/videos` - List all videos
- `POST /api/videos` - Create video record
- `DELETE /api/videos/[id]` - Delete video

### Upload
- `POST /api/upload` - Upload video file (multipart/form-data)

### Stream
- `POST /api/stream` - Start stream (`{ slotId }`)
- `DELETE /api/stream?slotId=` - Stop stream
- `GET /api/stream?slotId=` - Check stream status
- `GET /api/stream/sessions` - List stream sessions

## Deployment

### Local Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Database
For production, consider using PostgreSQL or MySQL by updating the `DATABASE_URL` in `.env` and the Prisma schema provider.

### Streaming Backend
For production streaming, deploy the FFmpeg workers to a persistent host (Render, Railway, Fly.io, or VPS) since Vercel serverless functions have execution time limits.

## FFmpeg Streaming Command

The application uses the following FFmpeg command for streaming:

```bash
ffmpeg -stream_loop -1 -re -i [video_path] \
  -c:v libx264 -preset veryfast -maxrate 3000k -bufsize 6000k \
  -pix_fmt yuv420p -g 60 \
  -c:a aac -b:a 128k \
  -f flv rtmp://a.rtmp.youtube.com/live2/[streamKey]
```

## License

MIT License - feel free to use for personal or commercial projects.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues and feature requests, please create an issue on GitHub.