'use client'

import { useState } from 'react'
import { Agent, GlossaryTerm } from '@/lib/types'
import { RuleEditor, PolicyEditor } from './RuleEditor'
import { Plus, Trash2, Settings, Book, MessageSquare } from 'lucide-react'

interface GlobalSettingsProps {
  agent: Agent
  onChange: (agent: Agent) => void
}

export default function GlobalSettings({ agent, onChange }: GlobalSettingsProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'rules' | 'glossary'>('general')

  const addGlossaryTerm = () => {
    const newTerm: GlossaryTerm = {
      term: '',
      definition: '',
    }
    onChange({ ...agent, glossary: [...agent.glossary, newTerm] })
  }

  const updateGlossaryTerm = (index: number, term: GlossaryTerm) => {
    const glossary = [...agent.glossary]
    glossary[index] = term
    onChange({ ...agent, glossary })
  }

  const deleteGlossaryTerm = (index: number) => {
    const glossary = [...agent.glossary]
    glossary.splice(index, 1)
    onChange({ ...agent, glossary })
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'rules', label: 'Global Rules & Policies', icon: Book },
    { id: 'glossary', label: `Glossary (${agent.glossary.length})`, icon: MessageSquare },
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-jpmc-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-jpmc-navy" />
          <div>
            <h2 className="text-xl font-semibold text-jpmc-navy">Global Settings</h2>
            <p className="text-sm text-jpmc-gray-500">Agent-wide configuration</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2 text-sm rounded-t-lg transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-jpmc-navy text-white'
                    : 'bg-jpmc-gray-100 text-jpmc-gray-600 hover:bg-jpmc-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'general' && (
          <div className="space-y-6 max-w-3xl">
            {/* Agent Info */}
            <div className="card">
              <h3 className="font-semibold text-jpmc-gray-700 mb-4">Agent Information</h3>

              <div className="space-y-4">
                <div>
                  <label className="input-label">Name</label>
                  <input
                    type="text"
                    value={agent.name}
                    onChange={(e) => onChange({ ...agent, name: e.target.value })}
                    className="input-field"
                    placeholder="Agent name"
                  />
                </div>

                <div>
                  <label className="input-label">Description</label>
                  <textarea
                    value={agent.description}
                    onChange={(e) => onChange({ ...agent, description: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="What does this agent do?"
                  />
                </div>
              </div>
            </div>

            {/* Response Style */}
            <div className="card">
              <h3 className="font-semibold text-jpmc-gray-700 mb-4">Response Style</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Tone</label>
                  <select
                    value={agent.responseStyle.tone}
                    onChange={(e) =>
                      onChange({
                        ...agent,
                        responseStyle: {
                          ...agent.responseStyle,
                          tone: e.target.value as Agent['responseStyle']['tone'],
                        },
                      })
                    }
                    className="input-field"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="formal">Formal</option>
                  </select>
                </div>

                <div>
                  <label className="input-label">Verbosity</label>
                  <select
                    value={agent.responseStyle.verbosity}
                    onChange={(e) =>
                      onChange({
                        ...agent,
                        responseStyle: {
                          ...agent.responseStyle,
                          verbosity: e.target.value as Agent['responseStyle']['verbosity'],
                        },
                      })
                    }
                    className="input-field"
                  >
                    <option value="concise">Concise</option>
                    <option value="balanced">Balanced</option>
                    <option value="detailed">Detailed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Entry Point */}
            <div className="card">
              <h3 className="font-semibold text-jpmc-gray-700 mb-4">Entry Point</h3>

              <div>
                <label className="input-label">Root Sub-Agent</label>
                <select
                  value={agent.rootSubAgentId}
                  onChange={(e) => onChange({ ...agent, rootSubAgentId: e.target.value })}
                  className="input-field"
                >
                  {agent.subAgents.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-jpmc-gray-500 mt-2">
                  The sub-agent where conversations begin
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="max-w-3xl space-y-8">
            <div className="bg-jpmc-blue/10 border border-jpmc-blue/20 rounded-lg p-4">
              <p className="text-sm text-jpmc-navy">
                Global rules and policies apply to all sub-agents. Use these for organization-wide
                requirements like identity verification or data privacy.
              </p>
            </div>

            <RuleEditor
              rules={agent.globalRules}
              onChange={(globalRules) => onChange({ ...agent, globalRules })}
            />

            <PolicyEditor
              policies={agent.globalPolicies}
              onChange={(globalPolicies) => onChange({ ...agent, globalPolicies })}
            />
          </div>
        )}

        {activeTab === 'glossary' && (
          <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-jpmc-gray-700">Glossary Terms</h3>
                <p className="text-xs text-jpmc-gray-500">
                  Define domain-specific terms for the agent to use consistently
                </p>
              </div>
              <button
                onClick={addGlossaryTerm}
                className="text-sm text-jpmc-blue hover:text-jpmc-navy flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Term
              </button>
            </div>

            {agent.glossary.length === 0 ? (
              <p className="text-sm text-jpmc-gray-500 italic py-8 text-center card">
                No glossary terms defined. Add terms to ensure consistent language.
              </p>
            ) : (
              <div className="space-y-3">
                {agent.glossary.map((term, idx) => (
                  <div key={idx} className="card">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="input-label">Term</label>
                          <input
                            type="text"
                            value={term.term}
                            onChange={(e) =>
                              updateGlossaryTerm(idx, { ...term, term: e.target.value })
                            }
                            className="input-field"
                            placeholder="e.g., Provisional Credit"
                          />
                        </div>
                        <div>
                          <label className="input-label">Definition</label>
                          <textarea
                            value={term.definition}
                            onChange={(e) =>
                              updateGlossaryTerm(idx, { ...term, definition: e.target.value })
                            }
                            className="input-field"
                            rows={2}
                            placeholder="Clear definition of the term..."
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => deleteGlossaryTerm(idx)}
                        className="p-2 text-jpmc-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
