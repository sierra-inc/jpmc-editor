'use client'

import { Settings, GitBranch, ChevronRight, ChevronDown } from 'lucide-react'
import { Agent, SubAgent } from '@/lib/types'
import { useState } from 'react'

interface SidebarProps {
  agent: Agent
  selectedId: string | null
  onSelectSubAgent: (id: string) => void
  onSelectGlobal: () => void
  isGlobalSelected: boolean
}

interface TreeItemProps {
  subAgent: SubAgent
  allSubAgents: SubAgent[]
  selectedId: string | null
  onSelect: (id: string) => void
  level: number
}

function TreeItem({ subAgent, allSubAgents, selectedId, onSelect, level }: TreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  // Find sub-agents that this one leads to via outcomes
  const childSubAgentIds = subAgent.outcomes
    .filter(o => o.nextSubAgentId)
    .map(o => o.nextSubAgentId!)

  const childSubAgents = childSubAgentIds
    .map(id => allSubAgents.find(s => s.id === id))
    .filter((s): s is SubAgent => s !== undefined)

  const hasChildren = childSubAgents.length > 0
  const isSelected = selectedId === subAgent.id

  return (
    <div>
      <div
        className={`tree-item flex items-center gap-2 px-3 py-2 cursor-pointer ${
          isSelected ? 'active' : ''
        }`}
        style={{ paddingLeft: `${12 + level * 16}px` }}
        onClick={() => onSelect(subAgent.id)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="p-0.5 hover:bg-jpmc-gray-200 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-jpmc-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-jpmc-gray-500" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}
        <GitBranch className="h-4 w-4 text-jpmc-blue flex-shrink-0" />
        <span className="text-sm truncate">{subAgent.name}</span>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {childSubAgents.map(child => (
            <TreeItem
              key={child.id}
              subAgent={child}
              allSubAgents={allSubAgents}
              selectedId={selectedId}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Sidebar({
  agent,
  selectedId,
  onSelectSubAgent,
  onSelectGlobal,
  isGlobalSelected,
}: SidebarProps) {
  const rootSubAgent = agent.subAgents.find(s => s.id === agent.rootSubAgentId)

  // Get sub-agents that are not referenced by any outcome (entry points)
  const referencedIds = new Set(
    agent.subAgents.flatMap(s => s.outcomes.map(o => o.nextSubAgentId).filter(Boolean))
  )
  const entryPoints = agent.subAgents.filter(
    s => s.id === agent.rootSubAgentId || !referencedIds.has(s.id)
  )

  return (
    <aside className="w-64 bg-white border-r border-jpmc-gray-200 flex flex-col h-full">
      {/* Agent name header */}
      <div className="p-4 border-b border-jpmc-gray-200">
        <h2 className="font-semibold text-jpmc-navy truncate">{agent.name}</h2>
        <p className="text-xs text-jpmc-gray-500 mt-1 line-clamp-2">
          {agent.description}
        </p>
      </div>

      {/* Global settings */}
      <div
        className={`tree-item flex items-center gap-2 px-4 py-3 cursor-pointer border-b border-jpmc-gray-200 ${
          isGlobalSelected ? 'active' : ''
        }`}
        onClick={onSelectGlobal}
      >
        <Settings className="h-4 w-4 text-jpmc-gray-600" />
        <span className="text-sm font-medium">Global Settings</span>
      </div>

      {/* Sub-agents tree */}
      <div className="flex-1 overflow-y-auto sidebar-scroll py-2">
        <div className="px-4 py-2">
          <h3 className="text-xs font-semibold text-jpmc-gray-500 uppercase tracking-wider">
            Sub-Agents
          </h3>
        </div>

        {rootSubAgent ? (
          <TreeItem
            subAgent={rootSubAgent}
            allSubAgents={agent.subAgents}
            selectedId={selectedId}
            onSelect={onSelectSubAgent}
            level={0}
          />
        ) : (
          entryPoints.map(subAgent => (
            <TreeItem
              key={subAgent.id}
              subAgent={subAgent}
              allSubAgents={agent.subAgents}
              selectedId={selectedId}
              onSelect={onSelectSubAgent}
              level={0}
            />
          ))
        )}
      </div>

      {/* Stats footer */}
      <div className="p-4 border-t border-jpmc-gray-200 text-xs text-jpmc-gray-500">
        <div className="flex justify-between">
          <span>Sub-agents:</span>
          <span className="font-medium">{agent.subAgents.length}</span>
        </div>
        <div className="flex justify-between mt-1">
          <span>Total tools:</span>
          <span className="font-medium">
            {agent.subAgents.reduce((acc, s) => acc + s.tools.length, 0)}
          </span>
        </div>
      </div>
    </aside>
  )
}
