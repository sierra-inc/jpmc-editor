import { NextResponse } from 'next/server'
import yaml from 'js-yaml'
import { getAgents } from '@/lib/storage'
import { Agent, SubAgent, Tool, Rule, Policy, Outcome } from '@/lib/types'

function toolToYaml(tool: Tool) {
  const yamlTool: Record<string, unknown> = {
    name: tool.name,
    type: tool.type,
    description: tool.description,
  }

  if (tool.parameters && tool.parameters.length > 0) {
    yamlTool.parameters = tool.parameters.map(p => ({
      name: p.name,
      type: p.type,
      description: p.description,
      required: p.required,
    }))
  }

  if (tool.prerequisites && tool.prerequisites.length > 0) {
    yamlTool.prerequisites = tool.prerequisites
  }

  return yamlTool
}

function ruleToYaml(rule: Rule) {
  const yamlRule: Record<string, unknown> = {
    name: rule.name,
    description: rule.description,
    scope: rule.scope,
  }

  if (rule.condition) {
    yamlRule.condition = rule.condition
  }

  return yamlRule
}

function policyToYaml(policy: Policy) {
  return {
    name: policy.name,
    description: policy.description,
    enforcement: policy.enforcement,
  }
}

function outcomeToYaml(outcome: Outcome, subAgents: SubAgent[]) {
  const yamlOutcome: Record<string, unknown> = {
    name: outcome.name,
    description: outcome.description,
    condition: {
      type: outcome.condition.type,
      expression: outcome.condition.expression,
    },
  }

  if (outcome.nextSubAgentId) {
    const nextSubAgent = subAgents.find(s => s.id === outcome.nextSubAgentId)
    if (nextSubAgent) {
      yamlOutcome.next_sub_agent = nextSubAgent.name
    }
  }

  return yamlOutcome
}

function subAgentToYaml(subAgent: SubAgent, allSubAgents: SubAgent[]) {
  const yamlSubAgent: Record<string, unknown> = {
    name: subAgent.name,
    objective: subAgent.objective,
  }

  if (subAgent.workflow && subAgent.workflow.length > 0) {
    yamlSubAgent.workflow = subAgent.workflow
      .sort((a, b) => a.order - b.order)
      .map(step => step.description)
  }

  if (subAgent.tools.length > 0) {
    yamlSubAgent.tools = subAgent.tools.map(toolToYaml)
  }

  if (subAgent.rules.length > 0) {
    yamlSubAgent.rules = subAgent.rules.map(ruleToYaml)
  }

  if (subAgent.policies.length > 0) {
    yamlSubAgent.policies = subAgent.policies.map(policyToYaml)
  }

  if (subAgent.outcomes.length > 0) {
    yamlSubAgent.outcomes = subAgent.outcomes.map(o => outcomeToYaml(o, allSubAgents))
  }

  return yamlSubAgent
}

function agentToYaml(agent: Agent): string {
  const yamlAgent: Record<string, unknown> = {
    agent: {
      name: agent.name,
      description: agent.description,
      response_style: {
        tone: agent.responseStyle.tone,
        verbosity: agent.responseStyle.verbosity,
      },
    },
  }

  const agentObj = yamlAgent.agent as Record<string, unknown>

  if (agent.globalRules.length > 0) {
    agentObj.global_rules = agent.globalRules.map(ruleToYaml)
  }

  if (agent.globalPolicies.length > 0) {
    agentObj.global_policies = agent.globalPolicies.map(policyToYaml)
  }

  if (agent.glossary.length > 0) {
    agentObj.glossary = agent.glossary.reduce((acc, term) => {
      acc[term.term] = term.definition
      return acc
    }, {} as Record<string, string>)
  }

  if (agent.subAgents.length > 0) {
    agentObj.sub_agents = agent.subAgents.map(s => subAgentToYaml(s, agent.subAgents))

    // Mark root sub-agent
    const rootSubAgent = agent.subAgents.find(s => s.id === agent.rootSubAgentId)
    if (rootSubAgent) {
      agentObj.entry_point = rootSubAgent.name
    }
  }

  return yaml.dump(yamlAgent, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
    sortKeys: false,
  })
}

export async function GET() {
  try {
    const agents = await getAgents()

    if (agents.length === 0) {
      return new NextResponse('# No agents configured\n', {
        status: 200,
        headers: { 'Content-Type': 'text/yaml' },
      })
    }

    // Return first agent as YAML (primary agent)
    const yamlOutput = agentToYaml(agents[0])

    return new NextResponse(yamlOutput, {
      status: 200,
      headers: { 'Content-Type': 'text/yaml' },
    })
  } catch (error) {
    console.error('Error generating YAML:', error)
    return NextResponse.json(
      { error: 'Failed to generate YAML' },
      { status: 500 }
    )
  }
}
