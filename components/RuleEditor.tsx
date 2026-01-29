'use client'

import { useState } from 'react'
import { Rule, Policy } from '@/lib/types'
import { Plus, Trash2, ChevronDown, ChevronRight, Shield, BookOpen } from 'lucide-react'

interface RuleEditorProps {
  rules: Rule[]
  onChange: (rules: Rule[]) => void
}

interface PolicyEditorProps {
  policies: Policy[]
  onChange: (policies: Policy[]) => void
}

function RuleItem({
  rule,
  onUpdate,
  onDelete,
}: {
  rule: Rule
  onUpdate: (rule: Rule) => void
  onDelete: () => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)

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
        <BookOpen className="h-4 w-4 text-jpmc-blue" />
        <span className="font-medium text-sm flex-1">{rule.name || 'Unnamed rule'}</span>
        <span
          className={`badge ${
            rule.scope === 'always' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
          }`}
        >
          {rule.scope}
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
              value={rule.name}
              onChange={(e) => onUpdate({ ...rule, name: e.target.value })}
              className="input-field"
              placeholder="Rule name"
            />
          </div>

          <div>
            <label className="input-label">Description</label>
            <textarea
              value={rule.description}
              onChange={(e) => onUpdate({ ...rule, description: e.target.value })}
              className="input-field"
              rows={2}
              placeholder="What should the agent do?"
            />
          </div>

          <div>
            <label className="input-label">Scope</label>
            <select
              value={rule.scope}
              onChange={(e) =>
                onUpdate({ ...rule, scope: e.target.value as 'always' | 'conditional' })
              }
              className="input-field"
            >
              <option value="always">Always apply</option>
              <option value="conditional">Conditional</option>
            </select>
          </div>

          {rule.scope === 'conditional' && (
            <div>
              <label className="input-label">Condition</label>
              <input
                type="text"
                value={rule.condition || ''}
                onChange={(e) => onUpdate({ ...rule, condition: e.target.value })}
                className="input-field font-mono text-sm"
                placeholder="e.g., customer_is_frustrated"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function RuleEditor({ rules, onChange }: RuleEditorProps) {
  const addRule = () => {
    const newRule: Rule = {
      id: `rule-${Date.now()}`,
      name: '',
      description: '',
      scope: 'always',
    }
    onChange([...rules, newRule])
  }

  const updateRule = (index: number, rule: Rule) => {
    const updated = [...rules]
    updated[index] = rule
    onChange(updated)
  }

  const deleteRule = (index: number) => {
    const updated = [...rules]
    updated.splice(index, 1)
    onChange(updated)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-jpmc-gray-700">Rules</h3>
        <button
          onClick={addRule}
          className="text-sm text-jpmc-blue hover:text-jpmc-navy flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Rule
        </button>
      </div>

      {rules.length === 0 ? (
        <p className="text-sm text-jpmc-gray-500 italic py-4 text-center">
          No rules configured. Add rules to define behavioral directives.
        </p>
      ) : (
        <div className="space-y-3">
          {rules.map((rule, idx) => (
            <RuleItem
              key={rule.id}
              rule={rule}
              onUpdate={(r) => updateRule(idx, r)}
              onDelete={() => deleteRule(idx)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function PolicyItem({
  policy,
  onUpdate,
  onDelete,
}: {
  policy: Policy
  onUpdate: (policy: Policy) => void
  onDelete: () => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)

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
        <Shield className="h-4 w-4 text-jpmc-navy" />
        <span className="font-medium text-sm flex-1">{policy.name || 'Unnamed policy'}</span>
        <span className={`badge ${policy.enforcement === 'strict' ? 'badge-strict' : 'badge-advisory'}`}>
          {policy.enforcement}
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
              value={policy.name}
              onChange={(e) => onUpdate({ ...policy, name: e.target.value })}
              className="input-field"
              placeholder="Policy name"
            />
          </div>

          <div>
            <label className="input-label">Description</label>
            <textarea
              value={policy.description}
              onChange={(e) => onUpdate({ ...policy, description: e.target.value })}
              className="input-field"
              rows={2}
              placeholder="What business constraint does this enforce?"
            />
          </div>

          <div>
            <label className="input-label">Enforcement</label>
            <select
              value={policy.enforcement}
              onChange={(e) =>
                onUpdate({ ...policy, enforcement: e.target.value as 'strict' | 'advisory' })
              }
              className="input-field"
            >
              <option value="strict">Strict (must follow)</option>
              <option value="advisory">Advisory (should follow)</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}

export function PolicyEditor({ policies, onChange }: PolicyEditorProps) {
  const addPolicy = () => {
    const newPolicy: Policy = {
      id: `policy-${Date.now()}`,
      name: '',
      description: '',
      enforcement: 'advisory',
    }
    onChange([...policies, newPolicy])
  }

  const updatePolicy = (index: number, policy: Policy) => {
    const updated = [...policies]
    updated[index] = policy
    onChange(updated)
  }

  const deletePolicy = (index: number) => {
    const updated = [...policies]
    updated.splice(index, 1)
    onChange(updated)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-jpmc-gray-700">Policies</h3>
        <button
          onClick={addPolicy}
          className="text-sm text-jpmc-blue hover:text-jpmc-navy flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Policy
        </button>
      </div>

      {policies.length === 0 ? (
        <p className="text-sm text-jpmc-gray-500 italic py-4 text-center">
          No policies configured. Add policies to define business constraints.
        </p>
      ) : (
        <div className="space-y-3">
          {policies.map((policy, idx) => (
            <PolicyItem
              key={policy.id}
              policy={policy}
              onUpdate={(p) => updatePolicy(idx, p)}
              onDelete={() => deletePolicy(idx)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
