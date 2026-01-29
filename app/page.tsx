'use client'

import { useState, useEffect, useCallback } from 'react'
import { Agent, SubAgent } from '@/lib/types'
import { transactionDisputeAgent } from '@/lib/data/transaction-dispute-agent'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import SubAgentEditor from '@/components/SubAgentEditor'
import GlobalSettings from '@/components/GlobalSettings'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const [agent, setAgent] = useState<Agent | null>(null)
  const [selectedSubAgentId, setSelectedSubAgentId] = useState<string | null>(null)
  const [showGlobalSettings, setShowGlobalSettings] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Load agent data
  useEffect(() => {
    async function loadAgent() {
      try {
        const res = await fetch('/api/agents')
        if (res.ok) {
          const agents = await res.json()
          if (agents.length > 0) {
            setAgent(agents[0])
            setSelectedSubAgentId(agents[0].rootSubAgentId)
          } else {
            // Use seed data
            setAgent(transactionDisputeAgent)
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
          setSelectedSubAgentId(transactionDisputeAgent.rootSubAgentId)
        }
      } catch {
        // Fallback to seed data
        setAgent(transactionDisputeAgent)
        setSelectedSubAgentId(transactionDisputeAgent.rootSubAgentId)
      } finally {
        setIsLoading(false)
      }
    }
    loadAgent()
  }, [])

  // Save agent data (debounced)
  const saveAgent = useCallback(async (updatedAgent: Agent) => {
    setIsSaving(true)
    try {
      await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedAgent),
      })
    } catch (error) {
      console.error('Failed to save agent:', error)
    } finally {
      setIsSaving(false)
    }
  }, [])

  // Handle agent changes
  const handleAgentChange = useCallback((updatedAgent: Agent) => {
    setAgent(updatedAgent)
    saveAgent(updatedAgent)
  }, [saveAgent])

  // Handle sub-agent changes
  const handleSubAgentChange = useCallback((updatedSubAgent: SubAgent) => {
    if (!agent) return

    const updatedSubAgents = agent.subAgents.map(s =>
      s.id === updatedSubAgent.id ? updatedSubAgent : s
    )

    const updatedAgent = { ...agent, subAgents: updatedSubAgents }
    handleAgentChange(updatedAgent)
  }, [agent, handleAgentChange])

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

      {/* Save indicator */}
      {isSaving && (
        <div className="fixed bottom-4 right-4 bg-jpmc-navy text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Saving...</span>
        </div>
      )}
    </div>
  )
}
