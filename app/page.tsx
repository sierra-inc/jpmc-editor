'use client'

import { useState, useEffect, useCallback } from 'react'
import { Agent, SubAgent } from '@/lib/types'
import { transactionDisputeAgent } from '@/lib/data/transaction-dispute-agent'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import SubAgentEditor from '@/components/SubAgentEditor'
import GlobalSettings from '@/components/GlobalSettings'
import { Loader2, Save, Check, AlertCircle } from 'lucide-react'

export default function Home() {
  const [agent, setAgent] = useState<Agent | null>(null)
  const [savedAgent, setSavedAgent] = useState<Agent | null>(null) // Track last saved state
  const [selectedSubAgentId, setSelectedSubAgentId] = useState<string | null>(null)
  const [showGlobalSettings, setShowGlobalSettings] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  // Check if there are unsaved changes
  const hasUnsavedChanges = agent && savedAgent && JSON.stringify(agent) !== JSON.stringify(savedAgent)

  // Load agent data
  useEffect(() => {
    async function loadAgent() {
      try {
        const res = await fetch('/api/agents', { cache: 'no-store' })
        if (res.ok) {
          const agents = await res.json()
          if (agents.length > 0) {
            setAgent(agents[0])
            setSavedAgent(agents[0])
            setSelectedSubAgentId(agents[0].rootSubAgentId)
          } else {
            // Use seed data
            setAgent(transactionDisputeAgent)
            setSavedAgent(transactionDisputeAgent)
            setSelectedSubAgentId(transactionDisputeAgent.rootSubAgentId)
            // Save seed data
            await fetch('/api/agents', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(transactionDisputeAgent),
            })
          }
        } else {
          // API not ready, use seed data
          setAgent(transactionDisputeAgent)
          setSavedAgent(transactionDisputeAgent)
          setSelectedSubAgentId(transactionDisputeAgent.rootSubAgentId)
        }
      } catch {
        // Fallback to seed data
        setAgent(transactionDisputeAgent)
        setSavedAgent(transactionDisputeAgent)
        setSelectedSubAgentId(transactionDisputeAgent.rootSubAgentId)
      } finally {
        setIsLoading(false)
      }
    }
    loadAgent()
  }, [])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  // Save agent data
  const saveAgent = useCallback(async () => {
    if (!agent) return

    setIsSaving(true)
    setSaveStatus('idle')
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agent),
      })
      if (res.ok) {
        setSavedAgent(agent)
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } else {
        setSaveStatus('error')
      }
    } catch (error) {
      console.error('Failed to save agent:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }, [agent])

  // Handle agent changes (local only, no auto-save)
  const handleAgentChange = useCallback((updatedAgent: Agent) => {
    setAgent(updatedAgent)
  }, [])

  // Handle sub-agent changes (local only, no auto-save)
  const handleSubAgentChange = useCallback((updatedSubAgent: SubAgent) => {
    if (!agent) return

    const updatedSubAgents = agent.subAgents.map(s =>
      s.id === updatedSubAgent.id ? updatedSubAgent : s
    )

    const updatedAgent = { ...agent, subAgents: updatedSubAgents }
    setAgent(updatedAgent)
  }, [agent])

  // Get selected sub-agent
  const selectedSubAgent = agent?.subAgents.find(s => s.id === selectedSubAgentId)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-jpmc-gray-50">
        <div className="flex items-center gap-3 text-jpmc-navy">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading agent configuration...</span>
        </div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-jpmc-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-jpmc-navy mb-2">No Agent Found</h2>
          <p className="text-jpmc-gray-600">Unable to load agent configuration.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 flex">
        {/* Sidebar */}
        <Sidebar
          agent={agent}
          selectedId={selectedSubAgentId}
          onSelectSubAgent={(id) => {
            setSelectedSubAgentId(id)
            setShowGlobalSettings(false)
          }}
          onSelectGlobal={() => {
            setSelectedSubAgentId(null)
            setShowGlobalSettings(true)
          }}
          isGlobalSelected={showGlobalSettings}
        />

        {/* Main content */}
        <main className="flex-1 bg-jpmc-gray-50">
          {showGlobalSettings ? (
            <GlobalSettings agent={agent} onChange={handleAgentChange} />
          ) : selectedSubAgent ? (
            <SubAgentEditor
              subAgent={selectedSubAgent}
              agent={agent}
              onChange={handleSubAgentChange}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-jpmc-gray-500">
              Select a sub-agent from the sidebar to edit
            </div>
          )}
        </main>
      </div>

      {/* Save Button - Fixed position */}
      <div className="fixed bottom-6 right-6 flex items-center gap-3">
        {/* Status indicator */}
        {saveStatus === 'saved' && (
          <div className="bg-green-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in duration-200">
            <Check className="h-4 w-4" />
            <span className="text-sm font-medium">Saved</span>
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="bg-red-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Save failed</span>
          </div>
        )}

        {/* Save button */}
        <button
          onClick={saveAgent}
          disabled={isSaving || !hasUnsavedChanges}
          className={`
            flex items-center gap-2 px-5 py-3 rounded-lg shadow-lg font-medium text-sm
            transition-all duration-200
            ${hasUnsavedChanges
              ? 'bg-jpmc-blue text-white hover:bg-jpmc-blue/90 cursor-pointer'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }
            ${isSaving ? 'opacity-75' : ''}
          `}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>{hasUnsavedChanges ? 'Save Changes' : 'Saved'}</span>
            </>
          )}
        </button>
      </div>

      {/* Unsaved changes indicator */}
      {hasUnsavedChanges && (
        <div className="fixed top-16 right-4 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-md text-xs font-medium shadow-sm">
          Unsaved changes
        </div>
      )}
    </div>
  )
}
