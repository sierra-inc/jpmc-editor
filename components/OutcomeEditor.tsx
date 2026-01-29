'use client'

import { useState } from 'react'
import { Outcome, SubAgent } from '@/lib/types'
import { Plus, Trash2, ChevronDown, ChevronRight, ArrowRight, Eye, Calculator } from 'lucide-react'

interface OutcomeEditorProps {
  outcomes: Outcome[]
  allSubAgents: SubAgent[]
  currentSubAgentId: string
  onChange: (outcomes: Outcome[]) => void
}

function OutcomeItem({
  outcome,
  allSubAgents,
  currentSubAgentId,
  onUpdate,
  onDelete,
}: {
  outcome: Outcome
  allSubAgents: SubAgent[]
  currentSubAgentId: string
  onUpdate: (outcome: Outcome) => void
  onDelete: () => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Filter out current sub-agent from possible next targets
  const availableTargets = allSubAgents.filter(s => s.id !== currentSubAgentId)

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
        {outcome.condition.type === 'observation' ? (
          <Eye className="h-4 w-4 text-purple-600" />
        ) : (
          <Calculator className="h-4 w-4 text-green-600" />
        )}
        <span className="font-medium text-sm flex-1">{outcome.name || 'Unnamed outcome'}</span>
        {outcome.nextSubAgentId && (
          <span className="flex items-center gap-1 text-xs text-jpmc-blue">
            <ArrowRight className="h-3 w-3" />
            {allSubAgents.find(s => s.id === outcome.nextSubAgentId)?.name || 'Unknown'}
          </span>
        )}
        <span
          className={`badge ${
            outcome.condition.type === 'observation'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {outcome.condition.type}
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
          <div>
            <label className="input-label">Name</label>
            <input
              type="text"
              value={outcome.name}
              onChange={(e) => onUpdate({ ...outcome, name: e.target.value })}
              className="input-field"
              placeholder="Outcome name"
            />
          </div>

          <div>
            <label className="input-label">Description</label>
            <textarea
              value={outcome.description}
              onChange={(e) => onUpdate({ ...outcome, description: e.target.value })}
              className="input-field"
              rows={2}
              placeholder="When does this outcome occur?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Condition Type</label>
              <select
                value={outcome.condition.type}
                onChange={(e) =>
                  onUpdate({
                    ...outcome,
                    condition: {
                      ...outcome.condition,
                      type: e.target.value as 'observation' | 'fact',
                    },
                  })
                }
                className="input-field"
              >
                <option value="observation">Observation (LLM-evaluated)</option>
                <option value="fact">Fact (deterministic)</option>
              </select>
            </div>
            <div>
              <label className="input-label">Next Sub-Agent</label>
              <select
                value={outcome.nextSubAgentId || ''}
                onChange={(e) =>
                  onUpdate({
                    ...outcome,
                    nextSubAgentId: e.target.value || undefined,
                  })
                }
                className="input-field"
              >
                <option value="">None (end flow)</option>
                {availableTargets.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="input-label">Condition Expression</label>
            <input
              type="text"
              value={outcome.condition.expression}
              onChange={(e) =>
                onUpdate({
                  ...outcome,
                  condition: { ...outcome.condition, expression: e.target.value },
                })
              }
              className="input-field font-mono text-sm"
              placeholder={
                outcome.condition.type === 'observation'
                  ? 'customer confirms they recognize the transaction'
                  : 'dispute_type != "fraud"'
              }
            />
            <p className="text-xs text-jpmc-gray-500 mt-1">
              {outcome.condition.type === 'observation'
                ? 'Natural language expression evaluated by LLM'
                : 'Boolean expression evaluated against facts'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function OutcomeEditor({
  outcomes,
  allSubAgents,
  currentSubAgentId,
  onChange,
}: OutcomeEditorProps) {
  const addOutcome = () => {
    const newOutcome: Outcome = {
      id: `outcome-${Date.now()}`,
      name: '',
      description: '',
      condition: {
        type: 'observation',
        expression: '',
      },
    }
    onChange([...outcomes, newOutcome])
  }

  const updateOutcome = (index: number, outcome: Outcome) => {
    const updated = [...outcomes]
    updated[index] = outcome
    onChange(updated)
  }

  const deleteOutcome = (index: number) => {
    const updated = [...outcomes]
    updated.splice(index, 1)
    onChange(updated)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-jpmc-gray-700">Outcomes</h3>
        <button
          onClick={addOutcome}
          className="text-sm text-jpmc-blue hover:text-jpmc-navy flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Outcome
        </button>
      </div>

      {outcomes.length === 0 ? (
        <p className="text-sm text-jpmc-gray-500 italic py-4 text-center">
          No outcomes configured. Add outcomes to define branching paths.
        </p>
      ) : (
        <div className="space-y-3">
          {outcomes.map((outcome, idx) => (
            <OutcomeItem
              key={outcome.id}
              outcome={outcome}
              allSubAgents={allSubAgents}
              currentSubAgentId={currentSubAgentId}
              onUpdate={(o) => updateOutcome(idx, o)}
              onDelete={() => deleteOutcome(idx)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
