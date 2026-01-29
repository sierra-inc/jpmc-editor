import { NextResponse } from 'next/server'
import { getAgents, saveAgent } from '@/lib/storage'
import { Agent } from '@/lib/types'

export async function GET() {
  try {
    const agents = await getAgents()
    return NextResponse.json(agents)
  } catch (error) {
    console.error('Error fetching agents:', error)
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const agent: Agent = await request.json()
    await saveAgent(agent)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving agent:', error)
    return NextResponse.json({ error: 'Failed to save agent' }, { status: 500 })
  }
}
