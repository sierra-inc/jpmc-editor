'use server'

import { promises as fs } from 'fs'
import path from 'path'
import { Agent } from './types'
import { transactionDisputeAgent } from './data/transaction-dispute-agent'

const DATA_DIR = path.join(process.cwd(), 'data')
const AGENTS_FILE = path.join(DATA_DIR, 'agents.json')

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

export async function getAgents(): Promise<Agent[]> {
  await ensureAgentsFile()
  const data = await fs.readFile(AGENTS_FILE, 'utf-8')
  return JSON.parse(data)
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

  await fs.writeFile(AGENTS_FILE, JSON.stringify(agents, null, 2))
}

export async function deleteAgent(id: string): Promise<void> {
  const agents = await getAgents()
  const filtered = agents.filter(a => a.id !== id)
  await fs.writeFile(AGENTS_FILE, JSON.stringify(filtered, null, 2))
}
