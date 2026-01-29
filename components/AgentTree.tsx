'use client'

import { Agent, SubAgent } from '@/lib/types'
import { GitBranch, Plus, Trash2 } from 'lucide-react'

interface AgentTreeProps {
  agent: Agent
  selectedId: string | null
  onSelect: (id: string) => void
  onAddSubAgent: () => void
  onDeleteSubAgent: (id: string) => void
}

export default function AgentTree({
  agent,
  selectedId,
  onSelect,
  onAddSubAgent,
  onDeleteSubAgent,
}: AgentTreeProps) {
  // Build a map of which sub-agents lead to which others
  const buildTree = () => {
    const childMap = new Map<string, string[]>()

    agent.subAgents.forEach(subAgent => {
      subAgent.outcomes.forEach(outcome => {
        if (outcome.nextSubAgentId) {
          const children = childMap.get(subAgent.id) || []
          if (!children.includes(outcome.nextSubAgentId)) {
            children.push(outcome.nextSubAgentId)
            childMap.set(subAgent.id, children)
          }
        }
      })
    })

    return childMap
  }

  const childMap = buildTree()

  // Find root nodes (not referenced by any outcome)
  const referencedIds = new Set<string>()
  agent.subAgents.forEach(s => {
    s.outcomes.forEach(o => {
      if (o.nextSubAgentId) referencedIds.add(o.nextSubAgentId)
    })
  })

  const rootNodes = agent.subAgents.filter(
    s => s.id === agent.rootSubAgentId || !referencedIds.has(s.id)
  )

  const renderSubAgent = (subAgent: SubAgent, depth: number = 0) => {
    const children = childMap.get(subAgent.id) || []
    const childSubAgents = children
      .map(id => agent.subAgents.find(s => s.id === id))
      .filter((s): s is SubAgent => s !== undefined)

    const isSelected = selectedId === subAgent.id
    const isRoot = subAgent.id === agent.rootSubAgentId

    return (
      <div key={subAgent.id}>
        <div
          className={`flex items-center gap-2 px-3 py-2 cursor-pointer rounded group transition-colors ${
            isSelected
              ? 'bg-jpmc-blue/20 border-l-2 border-jpmc-blue'
              : 'hover:bg-jpmc-gray-100'
          }`}
          style={{ marginLeft: `${depth * 20}px` }}
          onClick={() => onSelect(subAgent.id)}
        >
          <GitBranch className={`h-4 w-4 ${isSelected ? 'text-jpmc-blue' : 'text-jpmc-gray-400'}`} />
          <span className={`text-sm flex-1 ${isSelected ? 'font-medium' : ''}`}>
            {subAgent.name}
          </span>
          {isRoot && (
            <span className="text-xs bg-jpmc-navy text-white px-1.5 py-0.5 rounded">
              Entry
            </span>
          )}
          {!isRoot && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDeleteSubAgent(subAgent.id)
              }}
              className="p-1 opacity-0 group-hover:opacity-100 text-jpmc-gray-400 hover:text-red-600 transition-opacity"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>

        {childSubAgents.length > 0 && (
          <div className="border-l border-jpmc-gray-200 ml-5">
            {childSubAgents.map(child => renderSubAgent(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-xs font-semibold text-jpmc-gray-500 uppercase tracking-wider">
          Sub-Agents
        </span>
        <button
          onClick={onAddSubAgent}
          className="p-1 text-jpmc-blue hover:text-jpmc-navy"
          title="Add sub-agent"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {rootNodes.map(node => renderSubAgent(node))}
    </div>
  )
}
