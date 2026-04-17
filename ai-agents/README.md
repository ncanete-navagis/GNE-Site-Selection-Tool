# AI Agents Template

This repository contains a standardized set of configuration files for AI agents, designed to be used with tools like **Google Antigravity**.

## Purpose

The goal of this template is to ensure consistency across different AI agents by providing a shared structure for:
- **Agent Definitions**: Core roles and responsibilities.
- **Skills**: Specific capabilities and tool integrations.
- **Rules**: Guiding principles and constraints.
- **Knowledge**: Reference materials and best practices.

## Structure

- `.agent/agents/`: Contains the definition files for each specialized agent.
- `.agent/skills/`: Contains reusable skill definitions.
- `.agent/rules/`: Contains global and specialized rules.
- `.agent/knowledge/`: Contains reference documents and blueprints.

## Agents

The following agents are defined in this template:

| Agent | Description |
|-------|-------------|
| [ACCESSIBILITY_LEAD](.agent/agents/ACCESSIBILITY_LEAD.md) | Focuses on Web Content Accessibility Guidelines (WCAG) and ARIA standards. |
| [API_SPECIALIST](.agent/agents/API_SPECIALIST.md) | Specializes in designing and implementing APIs. |
| [DEVOPS_ENGINEER](.agent/agents/DEVOPS_ENGINEER.md) | Handles CI/CD pipelines, Docker, and cloud deployment. |
| [GIS_DATABASE_ENGINEER](.agent/agents/GIS_DATABASE_ENGINEER.md) | Manages geospatial data and database schemas. |
| [LAYOUT_ENGINEER](.agent/agents/LAYOUT_ENGINEER.md) | Specializes in responsive app shells and layout design. |
| [LOGGING_SPECIALIST](.agent/agents/LOGGING_SPECIALIST.md) | Manages application logging and activity tracking. |
| [MAPPING_ENGINEER](.agent/agents/MAPPING_ENGINEER.md) | Focuses on Google Antigravity map implementations. |
| [OPTIMIZATION_ENGINEER](.agent/agents/OPTIMIZATION_ENGINEER.md) | Optimizes performance and Core Web Vitals. |
| [QA_AUDITOR](.agent/agents/QA_AUDITOR.md) | Conducts quality assurance and testing. |
| [REACT_ATOMIC_DESIGN_SPECIALIST](.agent/agents/REACT_ATOMIC_DESIGN_SPECIALIST.md) | Specializes in React component architecture. |
| [SECURITY_SPECIALIST](.agent/agents/SECURITY_SPECIALIST.md) | Focuses on security, authentication, and privacy. |
| [UIUX_DESIGN_SPECIALIST](.agent/agents/UIUX_DESIGN_SPECIALIST.md) | Handles UI/UX design and branding. |

## Usage

To use these templates with an AI agent:

1.  **Select the appropriate agent** for your task.
2.  **Reference the agent's definition** in your AI prompt.
3.  **Include relevant rules, skills and knowledge** files as needed.

**Example Initial Prompts: Provide Context**

### Example 1: With Rules and Knowledge
Good for first time communication with an agent and explicitly providing the rules and knowledge files to make sure AI stays within the lines.

```
Initialize the [AGENT_NAME] using the definitions in .agent/agents/[AGENT_NAME].md.
Strictly follow the linked .agent/rules/[RULE_FILE].md and .agent/skills/[SKILL]/SKILL.md.
Use the knowledge from .agent/knowledge/[KNOWLEDGE_FILE].json.

Task: [Your specific task]
```

### Example 2: Without Rules and Knowledge. 
AI can still read the linked rules and knowledge inside the agent definition file. However, AI can sometimes "forget" the strict requirements of a linked file if the chat gets too long. If you notice the agent starting to give generic advice, simply send a "Reminder" prompt.

```
Initialize the [AGENT_NAME] using the definitions in .agent/agents/[AGENT_NAME].md.

Task: [Your specific task]
```

**Example Subsequent Prompts: Context Already In Memory**

```
Act as the [AGENT_NAME].

Task: [Your specific task]
```