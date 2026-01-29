'use client'

import { useState } from 'react'
import { Tool, ToolParameter } from '@/lib/types'
import { Plus, Trash2, ChevronDown, ChevronRight, Wrench, Search } from 'lucide-react'

interface ToolEditorProps {
  tools: Tool[]
  allTools: Tool[] // For prerequisites selection
  onChange: (tools: Tool[]) => void
}

interface ToolItemProps {
  tool: Tool
  allTools: Tool[]
  onUpdate: (tool: Tool) => void
  onDelete: () => void
}

function ToolItem({ tool, allTools, onUpdate, onDelete }: ToolItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const addParameter = () => {
    const newParam: ToolParameter = {
      name: '',
      type: 'string',
      description: '',
      required: false,
    }
    onUpdate({
      ...tool,
      parameters: [...(tool.parameters || []), newParam],
    })
  }

  const updateParameter = (index: number, param: ToolParameter) => {
    const params = [...(tool.parameters || [])]
    params[index] = param
    onUpdate({ ...tool, parameters: params })
  }

  const deleteParameter = (index: number) => {
    const params = [...(tool.parameters || [])]
    params.splice(index, 1)
    onUpdate({ ...tool, parameters: params })
  }

  const otherTools = allTools.filter(t => t.id !== tool.id)

  return (
    <div className="border border-jpmc-gray-200 rounded-lg overflow-hidden">
      <div
        className="flex items-center gap-3 p-3 bg-jpmc-gray-50 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <button className="p-0.5">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-jpmc-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-jpmc-gray-500" />
          )}
        </button>
        {tool.type === 'lookup' ? (
          <Search className="h-4 w-4 text-blue-600" />
        ) : (
          <Wrench className="h-4 w-4 text-orange-600" />
        )}
        <span className="font-medium text-sm flex-1">{tool.name || 'Unnamed tool'}</span>
        <span className={`badge ${tool.type === 'lookup' ? 'badge-lookup' : 'badge-action'}`}>
          {tool.type}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="p-1 hover:bg-jpmc-gray-200 rounded text-jpmc-gray-500 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Name</label>
              <input
                type="text"
                value={tool.name}
                onChange={(e) => onUpdate({ ...tool, name: e.target.value })}
                className="input-field font-mono text-sm"
                placeholder="tool_name"
              />
            </div>
            <div>
              <label className="input-label">Type</label>
              <select
                value={tool.type}
                onChange={(e) => onUpdate({ ...tool, type: e.target.value as 'lookup' | 'action' })}
                className="input-field"
              >
                <option value="lookup">Lookup (read-only)</option>
                <option value="action">Action (side effects)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="input-label">Description</label>
            <textarea
              value={tool.description}
              onChange={(e) => onUpdate({ ...tool, description: e.target.value })}
              className="input-field"
              rows={2}
              placeholder="What does this tool do?"
            />
          </div>

          {otherTools.length > 0 && (
            <div>
              <label className="input-label">Prerequisites</label>
              <div className="flex flex-wrap gap-2">
                {otherTools.map(other => (
                  <label
                    key={other.id}
                    className="flex items-center gap-2 text-sm bg-jpmc-gray-100 px-2 py-1 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={tool.prerequisites?.includes(other.id) || false}
                      onChange={(e) => {
                        const prereqs = tool.prerequisites || []
                        if (e.target.checked) {
                          onUpdate({ ...tool, prerequisites: [...prereqs, other.id] })
                        } else {
                          onUpdate({
                            ...tool,
                            prerequisites: prereqs.filter(p => p !== other.id),
                          })
                        }
                      }}
                    />
                    <span className="font-mono text-xs">{other.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="input-label mb-0">Parameters</label>
              <button
                onClick={addParameter}
                className="text-sm text-jpmc-blue hover:text-jpmc-navy flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
            </div>

            {(tool.parameters?.length || 0) === 0 ? (
              <p className="text-sm text-jpmc-gray-500 italic">No parameters defined</p>
            ) : (
              <div className="space-y-2">
                {tool.parameters?.map((param, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-2 bg-jpmc-gray-50 rounded"
                  >
                    <div className="flex-1 grid grid-cols-4 gap-2">
                      <input
                        type="text"
                        value={param.name}
                        onChange={(e) =>
                          updateParameter(idx, { ...param, name: e.target.value })
                        }
                        placeholder="name"
                        className="input-field text-sm font-mono"
                      />
                      <select
                        value={param.type}
                        onChange={(e) =>
                          updateParameter(idx, {
                            ...param,
                            type: e.target.value as ToolParameter['type'],
                          })
                        }
                        className="input-field text-sm"
                      >
                        <option value="string">string</option>
                        <option value="number">number</option>
                        <option value="boolean">boolean</option>
                        <option value="array">array</option>
                      </select>
                      <input
                        type="text"
                        value={param.description}
                        onChange={(e) =>
                          updateParameter(idx, { ...param, description: e.target.value })
                        }
                        placeholder="description"
                        className="input-field text-sm col-span-2"
                      />
                    </div>
                    <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={param.required}
                        onChange={(e) =>
                          updateParameter(idx, { ...param, required: e.target.checked })
                        }
                      />
                      Required
                    </label>
                    <button
                      onClick={() => deleteParameter(idx)}
                      className="p-1 text-jpmc-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ToolEditor({ tools, allTools, onChange }: ToolEditorProps) {
  const addTool = () => {
    const newTool: Tool = {
      id: `tool-${Date.now()}`,
      name: '',
      type: 'lookup',
      description: '',
      parameters: [],
    }
    onChange([...tools, newTool])
  }

  const updateTool = (index: number, tool: Tool) => {
    const updated = [...tools]
    updated[index] = tool
    onChange(updated)
  }

  const deleteTool = (index: number) => {
    const updated = [...tools]
    updated.splice(index, 1)
    onChange(updated)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-jpmc-gray-700">Tools</h3>
        <button
          onClick={addTool}
          className="text-sm text-jpmc-blue hover:text-jpmc-navy flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Tool
        </button>
      </div>

      {tools.length === 0 ? (
        <p className="text-sm text-jpmc-gray-500 italic py-4 text-center">
          No tools configured. Add a tool to define data lookups or actions.
        </p>
      ) : (
        <div className="space-y-3">
          {tools.map((tool, idx) => (
            <ToolItem
              key={tool.id}
              tool={tool}
              allTools={allTools}
              onUpdate={(t) => updateTool(idx, t)}
              onDelete={() => deleteTool(idx)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
