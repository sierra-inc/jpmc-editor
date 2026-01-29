// YAML Schema → Sierra Primitive Mapping
// agent → GoalAgent (root container)
// sub_agent → Goal (hierarchical objectives)
// outcome → Condition + children (branching states)
// rule → Rule (behavioral directives)
// policy → Policy (business constraints)
// tool → LookupTool/ActionTool

export interface Tool {
  id: string
  name: string
  type: 'lookup' | 'action'
  description: string
  parameters?: ToolParameter[]
  prerequisites?: string[] // Tool IDs that must run first
}

export interface ToolParameter {
  name: string
  type: 'string' | 'number' | 'boolean' | 'array'
  description: string
  required: boolean
}

export interface Rule {
  id: string
  name: string
  description: string
  scope: 'always' | 'conditional'
  condition?: string // For conditional rules
}

export interface Policy {
  id: string
  name: string
  description: string
  enforcement: 'strict' | 'advisory'
}

export interface Condition {
  type: 'observation' | 'fact'
  expression: string
}

export interface Outcome {
  id: string
  name: string
  description: string
  condition: Condition
  nextSubAgentId?: string // Links to another sub-agent
}

export interface WorkflowStep {
  id: string
  description: string
  order: number
}

export interface SubAgent {
  id: string
  name: string
  objective: string // Maps to Goal.description
  workflow?: WorkflowStep[]
  tools: Tool[]
  rules: Rule[]
  policies: Policy[]
  outcomes: Outcome[]
  parentId?: string
}

export interface GlossaryTerm {
  term: string
  definition: string
}

export interface ResponseStyle {
  tone: 'professional' | 'friendly' | 'formal'
  verbosity: 'concise' | 'detailed' | 'balanced'
}

export interface Agent {
  id: string
  name: string
  description: string
  globalRules: Rule[]
  globalPolicies: Policy[]
  glossary: GlossaryTerm[]
  responseStyle: ResponseStyle
  subAgents: SubAgent[]
  rootSubAgentId: string // Entry point sub-agent
}

// Helper type for tree navigation
export interface SubAgentTreeNode {
  subAgent: SubAgent
  children: SubAgentTreeNode[]
}
