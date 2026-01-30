'use server'

import { promises as fs } from 'fs'
import path from 'path'
import { Agent } from './types'
import { transactionDisputeAgent } from './data/transaction-dispute-agent'

const DATA_DIR = path.join(process.cwd(), 'data')
const AGENTS_FILE = path.join(DATA_DIR, 'agents.json')
const BLOB_AGENTS_KEY = 'agents.json'

// Check if we're running on Vercel with Blob configured
function isVercelBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN
}

// ============== Vercel Blob Storage ==============

async function getBlobAgents(): Promise<Agent[]> {
  const { list } = await import('@vercel/blob')
  
  try {
    // Check if the blob exists
    const { blobs } = await list({ prefix: BLOB_AGENTS_KEY })
    const agentBlob = blobs.find(b => b.pathname === BLOB_AGENTS_KEY)
    
    console.log('[Blob] List result:', blobs.map(b => b.pathname))
    
    if (!agentBlob) {
      console.log('[Blob] No existing blob found, initializing with seed data')
      // Initialize with seed data
      await saveBlobAgents([transactionDisputeAgent])
      return [transactionDisputeAgent]
    }
    
    console.log('[Blob] Fetching from:', agentBlob.url)
    
    // Fetch the blob content with cache busting
    const response = await fetch(`${agentBlob.url}?t=${Date.now()}`, { 
      cache: 'no-store',
    })
    
    if (!response.ok) {
      console.error('[Blob] Failed to fetch:', response.status, response.statusText)
      return [transactionDisputeAgent]
    }
    
    const data = await response.json()
    console.log('[Blob] Loaded agents count:', Array.isArray(data) ? data.length : 'not array')
    return Array.isArray(data) && data.length > 0 ? data : [transactionDisputeAgent]
  } catch (error) {
    console.error('[Blob] Error reading:', error)
    return [transactionDisputeAgent]
  }
}

async function saveBlobAgents(agents: Agent[]): Promise<void> {
  const { put } = await import('@vercel/blob')
  
  try {
    console.log('[Blob] Saving agents, count:', agents.length)
    
    // Upload new content (overwrites existing)
    const result = await put(BLOB_AGENTS_KEY, JSON.stringify(agents, null, 2), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    })
    
    console.log('[Blob] Saved successfully to:', result.url)
  } catch (error) {
    console.error('[Blob] Error saving:', error)
    throw error
  }
}

// ============== Local File System Storage ==============

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

async function ensureAgentsFile() {
  await ensureDataDir()
  try {
    await fs.access(AGENTS_FILE)
    // Check if file is empty or has empty array
    const content = await fs.readFile(AGENTS_FILE, 'utf-8')
    const parsed = JSON.parse(content)
    if (Array.isArray(parsed) && parsed.length === 0) {
      // Initialize with seed data if empty
      await fs.writeFile(AGENTS_FILE, JSON.stringify([transactionDisputeAgent], null, 2))
    }
  } catch {
    // Initialize with seed data
    await fs.writeFile(AGENTS_FILE, JSON.stringify([transactionDisputeAgent], null, 2))
  }
}

async function getFileAgents(): Promise<Agent[]> {
  await ensureAgentsFile()
  const data = await fs.readFile(AGENTS_FILE, 'utf-8')
  return JSON.parse(data)
}

async function saveFileAgents(agents: Agent[]): Promise<void> {
  await ensureDataDir()
  await fs.writeFile(AGENTS_FILE, JSON.stringify(agents, null, 2))
}

// ============== Public API ==============

export async function getAgents(): Promise<Agent[]> {
  if (isVercelBlobConfigured()) {
    return getBlobAgents()
  }
  return getFileAgents()
}

export async function getAgent(id: string): Promise<Agent | null> {
  const agents = await getAgents()
  return agents.find(a => a.id === id) || null
}

export async function saveAgent(agent: Agent): Promise<void> {
  const agents = await getAgents()
  const index = agents.findIndex(a => a.id === agent.id)

  if (index >= 0) {
    agents[index] = agent
  } else {
    agents.push(agent)
  }

  if (isVercelBlobConfigured()) {
    await saveBlobAgents(agents)
  } else {
    await saveFileAgents(agents)
  }
}

export async function deleteAgent(id: string): Promise<void> {
  const agents = await getAgents()
  const filtered = agents.filter(a => a.id !== id)
  
  if (isVercelBlobConfigured()) {
    await saveBlobAgents(filtered)
  } else {
    await saveFileAgents(filtered)
  }
}
