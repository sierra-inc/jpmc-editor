# JPMC Editor Demo

This project is a Vercel NextJS app that is a notional agent behavior editor for JP Morgan Chase.

It's designed to demonstrate the way that JP Morgan can edit agents to handle things like dispute processing in a UI.

## UI Elements

The UI should allow users to define a hierarchical set of agent behaviors, ideally structured around "Sub-Agents".

You should be able to add global settings like rules and prompt guidance globally.

Clicking into a sub-agent should open up an editor view with different tool names.

It should have service-level persistence - nothing fancy. But the app should include a basic sub-agent transaction issues (details included below).

## API

Only one API request is required. It should get the context of the agent, including all sub-agents 

## Demo Disclaimer

The top of the page should have a disclaimer that the application is for demo purposes only.

## Branding

The site should have branding of JP Morgan Chase, in keeping with the color scheme of the brand.

# Transaction Issues Background

1. Use Case Description: I want to report a problem with a transaction.
a. Overview - Transform the customer dispute intake and resolution journey by
leveraging digital and voice channels, to deliver a seamless, transparent, and
concierge experience. The solution design should address common pain points in
the dispute process and align with following experience principles: Secure, Human,
Simple, Consistent, Connected, Personal, Proactive, Purposeful, and
Compassionate.
b. Sub journeys/tasks to be completed
i. Find:
1. Customer Scenario: A customer notices an unfamiliar transaction
and seeks to verify its legitimacy and secure their account.
2. Current Gaps: Difficulty accessing digital support, long phone wait
times, and confusion over valid charges.
3. Solution Needs:
a. Always-on, instant support channels (e.g., chat, self-
service).
b. Flexibility for customers to choose and switch support
channels.
c. Transparent use of AI and data to guide customers.
ii. Understand
1. Customer Scenario: The customer realizes the transaction may be
valid but wants to confirm and explore options for a refund or
dispute.
2. Current Gaps: Error-prone dispute tagging, limited transaction
context, and confusion about the dispute process.
3. Solution Needs:
a. Empathetic validation of customer concerns.
b. AI to help identify dispute types and enrich transaction
details.
c. Proactive education about dispute elements and process.
iii. Create a Dispute
1. Customer Scenario: The customer provides additional information,
reviews the case summary, and submits a dispute.
2. Current Gaps: Customers struggle to articulate issues, fragmented
document handling, and non-seamless channel transfers.
3. Solution Needs:
a. Guided, conversational intake using customers own way of
describing the issue.
b. Tailored interactions based on customer preferences.
c. Seamless handoff between AI and human agents.
d. Document upload and evidence gathering for case support.
iv. Track and Resolve the dispute
1. Customer Scenario: The customer checks the status of their
dispute, uploads supporting documents, and learns the outcome.
2. Current Gaps: Lack of transparency, limited self-service status
updates, and unclear rationale for outcomes.
3. Solution Needs:
a. Self-service status checks and FAQs.
b. Clear communication of next steps, options, and rationale
for outcomes.

# Background Context

Feature: Loadable SOPs (JPMC)
Context

JPMC do not want banking procedures or domain-specific business logic to be stored inside of Sierra. In their vision of a JPMC-wide agent platform, individual JPMC teams own SOPs that live within JPMC codebases, and a vendor like Sierra owns the orchestration, safety, monitoring, and deployment of agents. Their motivations seem to be compliance/security (maintaining more control over agent procedures), IP (owning their agent behavior secret sauce), and longevity (not being overly locked in to an agent vendor long term).

Requirements

* Parity: Full Sierra agent functionality, including voice
* BYOC: JPMC will deploy Sierra within their own cloud
* Scalability: Supporting "hundreds" of different types of agents within JPMC
* Guardrails: Guardrails specific to agents (they mentioned OPA)
* Flexibility: Some generic SOP logic can live in Sierra's as normal, but some proprietary logic will need to sit outside Sierra; these procedures should be able to work in parallel
* CI/CD: Deploying new SOPs via JPMC's CI/CD process so that any changes in SOP have to go through JPMC's permissions and testing
* Timing: JPMC's POC is targeted to kick off mid-Feb 2026. It's unclear if this architecture will be needed for the POC phase.



Proposed approach

On 1/14/26 Pol proposed a setup to JPMC where some SOPs sit in .yaml files which are maintained by JPMC teams and plugged into JPMC CI/CD. A given Sierra agent could call a function that loads these external SOPs on runtime and transpiles them into additional SDK primitives.
JPMC team liked this vision at a high level and wanted to see more detail.

# Indi’s Vision:

Indi’s vision is to build an open, vendor-agnostic agent platform where Chase owns the core orchestration, security, and scalability, while best-in-class vendors like Sierra plug in precisely where they are strongest. Success is not proving a single use case, but by being seen as an enabler for a wide variety of teams across Chase to safely and repeatedly build, deploy, and scale domain-specific agents through a standardized toolkit.



What he's ultimately trying to build:

* Indi is not buying a monolithic AI product or UI. He’s building a long-lived, Chase-owned agent platform that can survive model churn, vendor changes, and massive internal scale (60k+ engineers).
* Chase must own:
    * Customer context
    * Security & governance
    * Routing and orchestration
* Vendors contribute capabilities, not control.


How he thinks about the architecture:
He’s envisioning a clear, layered system:

1. Customer / CX Orchestration Layer (Chase-owned): Tracks customer state and enables model portability.
2. “Chase Agent” (Supervisory Agent): Routes requests, enforces policy, coordinates agents; treated as Chase IP, likely built on open-source frameworks.
3. Domain Agents (primary :sierra-green:Sierra:sierra-green: entry point):  Task-specific agents (disputes, payments, card lock/unlock, etc.) built by many independent Chase teams.
4. Tool & Interaction Layer: Governed tool access, protections against poisoning, unsafe actions, and agent misuse.


The real problem he trying to solve:

* The question is not “can Sierra make a use case work?” (he believes many vendors can solve many use cases)
* The question for him is: "Can this scale when thousands of average (not "elite") engineers build agents without creating security, governance, or operational chaos?"
* That’s why he emphasizes:
    * Declarative configs (e.g., YAML)
    * Registration and approval flows
    * Guardrails (OPA, policy checks)
    * Reducing bespoke code and setup burden
* Scale is critical


How he views Sierra:

* Indi sees Sierra as:
    * A major building block, not the whole system
    * A potential silver bullet for domain agents
    * Something he does not want to force into areas/roles it isn’t designed for
* If Sierra excels, our role will expand... but initial success is about fitting cleanly into the ecosystem.


What “winning” looks like:

* Winning is:
    * A reusable toolkit, not heroic implementations
    * Distributed ownership across lines of business
    * Faster, cleaner iteration than current vendors
    * Proving Sierra helps Chase scale agent development, not just ship demos
* That’s why he insists on understanding long-term fit before narrowing to use cases.


AE Takeaway:

* Indi is evaluating whether Sierra can be a scalable, foundational component of a Chase-owned agent operating system, not just a vendor that solves a few workflows.

