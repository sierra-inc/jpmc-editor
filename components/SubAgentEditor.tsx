'use client'

import { useState } from 'react'
import { SubAgent, Agent, WorkflowStep } from '@/lib/types'
import ToolEditor from './ToolEditor'
import { RuleEditor, PolicyEditor } from './RuleEditor'
import OutcomeEditor from './OutcomeEditor'
import { Plus, Trash2, GripVertical, Target } from 'lucide-react'

interface SubAgentEditorProps {
  subAgent: SubAgent
  agent: Agent
  onChange: (subAgent: SubAgent) => void
}

export default function SubAgentEditor({ subAgent, agent, onChange }: SubAgentEditorProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'tools' | 'rules' | 'outcomes'>('overview')

  const addWorkflowStep = () => {
    const steps = subAgent.workflow || []
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      description: '',
      order: steps.length + 1,
    }
    onChange({ ...subAgent, workflow: [...steps, newStep] })
  }

  const updateWorkflowStep = (index: number, step: WorkflowStep) => {
    const steps = [...(subAgent.workflow || [])]
    steps[index] = step
    onChange({ ...subAgent, workflow: steps })
  }

  const deleteWorkflowStep = (index: number) => {
    const steps = [...(subAgent.workflow || [])]
    steps.splice(index, 1)
    // Reorder remaining steps
    steps.forEach((step, idx) => {
      step.order = idx + 1
    })
    onChange({ ...subAgent, workflow: steps })
  }

  const moveWorkflowStep = (fromIndex: number, direction: 'up' | 'down') => {
    const steps = [...(subAgent.workflow || [])]
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
    if (toIndex < 0 || toIndex >= steps.length) return

    const [removed] = steps.splice(fromIndex, 1)
    steps.splice(toIndex, 0, removed)

    // Reorder
    steps.forEach((step, idx) => {
      step.order = idx + 1
    })
    onChange({ ...subAgent, workflow: steps })
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'tools', label: `Tools (${subAgent.tools.length})` },
    { id: 'rules', label: `Rules & Policies (${subAgent.rules.length + subAgent.policies.length})` },
    { id: 'outcomes', label: `Outcomes (${subAgent.outcomes.length})` },
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-jpmc-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <Target className="h-6 w-6 text-jpmc-blue" />
          <div>
            <h2 className="text-xl font-semibold text-jpmc-navy">{subAgent.name}</h2>
            <p className="text-sm text-jpmc-gray-500">Sub-Agent Configuration</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 text-sm rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-jpmc-navy text-white'
                  : 'bg-jpmc-gray-100 text-jpmc-gray-600 hover:bg-jpmc-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6 max-w-3xl">
            {/* Objective */}
            <div className="card">
              <label className="input-label">Objective</label>
              <textarea
                value={subAgent.objective}
                onChange={(e) => onChange({ ...subAgent, objective: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="What is this sub-agent trying to accomplish?"
              />
              <p className="text-xs text-jpmc-gray-500 mt-2">
                Maps to Goal.description in Sierra. Describe the main objective clearly.
              </p>
            </div>

            {/* Workflow Steps */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-jpmc-gray-700">Workflow Steps</h3>
                  <p className="text-xs text-jpmc-gray-500">
                    Ordered steps the agent should follow
                  </p>
                </div>
                <button
                  onClick={addWorkflowStep}
                  className="text-sm text-jpmc-blue hover:text-jpmc-navy flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Step
                </button>
              </div>

              {(!subAgent.workflow || subAgent.workflow.length === 0) ? (
                <p className="text-sm text-jpmc-gray-500 italic py-4 text-center">
                  No workflow steps defined. Add steps to guide the agent.
                </p>
              ) : (
                <div className="space-y-2">
                  {subAgent.workflow
                    .sort((a, b) => a.order - b.order)
                    .map((step, idx) => (
                      <div
                        key={step.id}
                        className="flex items-center gap-2 p-2 bg-jpmc-gray-50 rounded group"
                      >
                        <div className="flex flex-col">
                          <button
                            onClick={() => moveWorkflowStep(idx, 'up')}
                            disabled={idx === 0}
                            className="p-0.5 text-jpmc-gray-400 hover:text-jpmc-gray-600 disabled:opacity-30"
                          >
                            <GripVertical className="h-3 w-3 rotate-90" />
                          </button>
                          <button
                            onClick={() => moveWorkflowStep(idx, 'down')}
                            disabled={idx === (subAgent.workflow?.length || 0) - 1}
                            className="p-0.5 text-jpmc-gray-400 hover:text-jpmc-gray-600 disabled:opacity-30"
                          >
                            <GripVertical className="h-3 w-3 -rotate-90" />
                          </button>
                        </div>
                        <span className="text-sm font-medium text-jpmc-gray-500 w-6">
                          {step.order}.
                        </span>
                        <input
                          type="text"
                          value={step.description}
                          onChange={(e) =>
                            updateWorkflowStep(idx, { ...step, description: e.target.value })
                          }
                          className="input-field flex-1"
                          placeholder="Describe this step..."
                        />
                        <button
                          onClick={() => deleteWorkflowStep(idx)}
                          className="p-1 text-jpmc-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="max-w-3xl">
            <ToolEditor
              tools={subAgent.tools}
              allTools={subAgent.tools}
              onChange={(tools) => onChange({ ...subAgent, tools })}
            />
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="max-w-3xl space-y-8">
            <RuleEditor
              rules={subAgent.rules}
              onChange={(rules) => onChange({ ...subAgent, rules })}
            />
            <PolicyEditor
              policies={subAgent.policies}
              onChange={(policies) => onChange({ ...subAgent, policies })}
            />
          </div>
        )}

        {activeTab === 'outcomes' && (
          <div className="max-w-3xl">
            <OutcomeEditor
              outcomes={subAgent.outcomes}
              allSubAgents={agent.subAgents}
              currentSubAgentId={subAgent.id}
              onChange={(outcomes) => onChange({ ...subAgent, outcomes })}
            />
          </div>
        )}
      </div>
    </div>
  )
}
