import { NextResponse } from 'next/server'
import { getAgents, saveAgent } from '@/lib/storage'
import { Agent } from '@/lib/types'

// Disable caching for this route - always fetch fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const agents = await getAgents()
    return NextResponse.json(agents, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error('Error fetching agents:', error)
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const agent: Agent = await request.json()
    await saveAgent(agent)
    return NextResponse.json({ 
      success: true,
      blobConfigured: !!process.env.BLOB_READ_WRITE_TOKEN,
    })
  } catch (error) {
    console.error('Error saving agent:', error)
    return NextResponse.json({ 
      error: 'Failed to save agent',
      details: error instanceof Error ? error.message : String(error),
      blobConfigured: !!process.env.BLOB_READ_WRITE_TOKEN,
    }, { status: 500 })
  }
}
