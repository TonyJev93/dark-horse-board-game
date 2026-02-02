# Project Guidelines

## Table of Contents

1. [AGENTS.md Writing Guidelines](#agentsmd-writing-guidelines)
2. [Core Principles](#core-principles)
3. [Communication Rules](#communication-rules)
4. [Implementation Rules](#implementation-rules)
5. [Critical Instructions Format](#critical-instructions-format)
6. [Safety and Security](#safety-and-security)
7. [Documentation Standards](#documentation-standards)
8. [Git and Version Control](#git-and-version-control)

---

## AGENTS.md Writing Guidelines

### Modification Protocol
```xml
<critical>
  <rule priority="high">MUST obtain user approval BEFORE modifying AGENTS.md</rule>
  <rule priority="high">Show proposed changes and wait for explicit confirmation</rule>
  <rule priority="high">NEVER auto-update AGENTS.md without user consent</rule>
</critical>
```
- **ALWAYS** ask user before modifying this file
- Show the exact changes being proposed
- Wait for explicit approval before applying edits

### Index Synchronization
```xml
<critical>
  <rule priority="high">When Table of Contents is modified, update section numbering</rule>
  <rule priority="high">When section titles change, update all internal references</rule>
  <rule priority="high">Ensure all TOC links match actual section headers</rule>
</critical>
```
- Keep Table of Contents in sync with actual sections
- Update section numbers when adding/removing/reordering sections
- Verify all anchor links work correctly

---

## Core Principles

**Concise and Essential**: All guidelines must be brief and focus on core content only.

---

## Communication Rules

### Output Language
- **Korean (한글)** for all user-facing messages, responses, and explanations
- **English** for code, technical documentation, comments, and AI-specific instructions

### Confirmation Protocol
When uncertain about:
- Implementation approach
- Scope of work
- User requirements
- Design decisions

**MUST ASK** before proceeding. Do not make assumptions.

### Self-Update Process
1. Identify potential global guideline from user interaction
2. Ask user: "Should this be added to project guidelines?"
3. If confirmed, update this AGENTS.md file
4. Inform user of the update

---

## Implementation Rules

1. **Clarity over Brevity**: While being concise, never sacrifice clarity
2. **Explicit over Implicit**: Make assumptions explicit and verify them
3. **Context Awareness**: Consider existing codebase patterns before making changes
4. **User Consent**: Obtain approval before significant structural changes

---

## Critical Instructions Format

Ensure AI strictly follows critical guidelines by using XML markup. All mandatory instructions must be wrapped in code blocks for readability.

### XML Format for Critical Content
- Use XML tags to denote mandatory instructions that AI must follow without exception
- Wrap XML content in markdown code blocks (```) to maintain readability in the document
- AI must parse and follow these instructions as if they were direct commands

### When to Use XML
- Safety-critical rules that must never be violated
- Non-negotiable behavior expectations
- Instructions that must override default behavior
- User-specific requirements that are essential to the project
- Destructive operation confirmations and restrictions

### Example Format

```xml
<critical>
  <rule priority="high">Never delete files without explicit user confirmation</rule>
  <rule priority="high">Always read file contents before making modifications</rule>
</critical>
```

---

## Safety and Security

### Sensitive Information
- **NEVER** commit or expose API keys, passwords, tokens, or credentials
- Warn user if sensitive data is detected in code or files
- Suggest using environment variables for secrets

### Destructive Operations
- **ALWAYS** confirm before:
  - Deleting files or directories
  - Overwriting existing data
  - Running commands that modify system state
  - Force-pushing to git repositories

### Error Handling
- Validate user input before processing
- Provide clear error messages in Korean
- Suggest recovery steps when errors occur

---

## Documentation Standards

### Documentation Language
- Technical docs: English
- User-facing docs: Korean (한글)
- README files: Bilingual if project is public

### Format
- Use clear headings and structure
- Include examples where helpful
- Keep documentation up-to-date with code changes

---

## Git and Version Control

### Commit Guidelines
- Write clear, descriptive commit messages
- Commit messages in English
- Group related changes in single commits
- After completing work, confirm with the user whether to commit

---

## OpenCode Reference

OpenCode 설정 관련 작업 시 참조:

| Resource | Location |
|----------|----------|
| **Local Knowledge** | `.agents/knowledge/opencode/INDEX.md` |
| **Context7 Query** | `/anomalyco/opencode` |

### Quick Access

```
# 로컬 캐시된 핵심 정보
Read(.agents/knowledge/opencode/INDEX.md)

# 세부 사항 동적 조회
query-docs(/anomalyco/opencode, "your query here")
```

---

*Last updated: 2026-01-31*
