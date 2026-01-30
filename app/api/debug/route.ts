import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const hasToken = !!process.env.BLOB_READ_WRITE_TOKEN
  const tokenPrefix = process.env.BLOB_READ_WRITE_TOKEN?.slice(0, 10) + '...'
  
  let blobStatus = 'not configured'
  let blobList: string[] = []
  let error: string | null = null
  
  if (hasToken) {
    try {
      const { list } = await import('@vercel/blob')
      const { blobs } = await list()
      blobList = blobs.map(b => `${b.pathname} (${b.size} bytes)`)
      blobStatus = 'connected'
    } catch (e) {
      blobStatus = 'error'
      error = e instanceof Error ? e.message : String(e)
    }
  }
  
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL,
    blobTokenConfigured: hasToken,
    blobTokenPrefix: hasToken ? tokenPrefix : null,
    blobStatus,
    blobList,
    error,
  }, {
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}
