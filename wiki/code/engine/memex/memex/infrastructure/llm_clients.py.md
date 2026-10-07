---
type: CodeModule
title: engine/memex/memex/infrastructure/llm_clients.py
description: Generated code map for engine/memex/memex/infrastructure/llm_clients.py.
resource: engine/memex/memex/infrastructure/llm_clients.py
tags:
- code
- python
source_path: engine/memex/memex/infrastructure/llm_clients.py
language: python
source_hash: c32a88ae383512821e775133ed45a935906992e17a53e0806e52b0bdff0fc7ff
managed_by: okf-code
generated_profile: compact
created: 2026-10-07T23:07:32Z
generated:
  by: process:okf-code
  at: '2026-10-07T23:07:34Z'
status: stable
package: engine/memex
---
<!-- okf-code:start -->
# Overview

Generated CodeModule concept for `engine/memex/memex/infrastructure/llm_clients.py`. Purpose: engine/memex/memex/infrastructure/llm_clients.py is a `python` model module in package `engine/memex`. Role: model module. high-signal symbols: `OpenAICompatClient`, `__init__`, `complete`, `HarnessLLMClient`, `__init__`. Dependency context: 0 local dependencies and 0 local dependents are linked when resolvable. Impact: changes here may affect linked dependents, imported dependencies, and callers identified by generated reverse edges. This page is syntax-derived for code finding, code-logic search, and impact-analysis groundwork.

# Symbols

| Kind | Name | Lines |
|---|---|---|
| class | `OpenAICompatClient` | 19-60 |
| function | `__init__` | 22-39 |
| function | `complete` | 41-60 |
| class | `HarnessLLMClient` | 72-105 |
| function | `__init__` | 80-88 |
| function | `complete` | 90-105 |
| function | `client_from_config` | 108-117 |

# Relationships

- `__future__.annotations`
- `memex.application.ports.LLMClient`
- `memex.application.ports.LLMResponse`
- `memex.domain.errors.LLMError`
- `memex.infrastructure.config.LLMConfig`
- `openai.OpenAI`
- `subprocess`

# Impact notes

Impact candidates on this page are syntax-derived. Treat them as a starting point for inspection, not as complete semantic proof of all callers, callees, or runtime effects.

# Citations

- Source: `engine/memex/memex/infrastructure/llm_clients.py`
- Source hash: `c32a88ae383512821e775133ed45a935906992e17a53e0806e52b0bdff0fc7ff`
<!-- okf-code:end -->
