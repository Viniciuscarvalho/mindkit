# Task {{TASK_NUMBER}}.0: {{TASK_TITLE}} ({{SIZE}})

**Status:** pending
**Complexity:** {{SIZE}} _(S = <1h, M = 1-3h, L = 3h+)_
**Depends on:** {{DEPENDENCY_TASKS}}
**Implements:** FR-{{FR_ID}}, STORY-{{STORY_ID}}

---

<critical>
Read the prd.md and techspec.md files in this folder BEFORE starting any work.
If you do not read these files, your task will be invalidated.
</critical>

<task_context>
<domain>{{DOMAIN}}</domain>
<type>{{TYPE}}</type>
<scope>{{SCOPE}}</scope>
<complexity>{{COMPLEXITY}}</complexity>
<dependencies>{{TECHNICAL_DEPENDENCIES}}</dependencies>
</task_context>

---

## Objective

{{CLEAR_OBJECTIVE_STATEMENT}}

**Expected Outcome:** {{WHAT_EXISTS_WHEN_DONE}}

---

## Pre-Execution: Files to Read

_Read and understand these files before writing any code. This provides the context needed for accurate implementation._

| File | Why | What to Look For |
|------|-----|------------------|
| `{{READ_FILE_1}}` | {{REASON_1}} | {{WHAT_TO_LOOK_FOR_1}} |
| `{{READ_FILE_2}}` | {{REASON_2}} | {{WHAT_TO_LOOK_FOR_2}} |
| `{{READ_FILE_3}}` | {{REASON_3}} | {{WHAT_TO_LOOK_FOR_3}} |

---

## Subtasks

### {{TASK_NUMBER}}.1: {{SUBTASK_1_TITLE}}

**Action:** {{SPECIFIC_ACTION}}
**File(s):** `{{FILE_PATH}}`
**Details:**
{{IMPLEMENTATION_DETAIL — Reference techspec.md section, do NOT paste full implementation}}

**Acceptance:**
- [ ] {{VERIFIABLE_CRITERION_1}}
- [ ] {{VERIFIABLE_CRITERION_2}}

---

### {{TASK_NUMBER}}.2: {{SUBTASK_2_TITLE}}

**Action:** {{SPECIFIC_ACTION}}
**File(s):** `{{FILE_PATH}}`
**Details:**
{{IMPLEMENTATION_DETAIL}}

**Acceptance:**
- [ ] {{VERIFIABLE_CRITERION_1}}
- [ ] {{VERIFIABLE_CRITERION_2}}

---

### {{TASK_NUMBER}}.3: {{SUBTASK_3_TITLE}}

**Action:** {{SPECIFIC_ACTION}}
**File(s):** `{{FILE_PATH}}`
**Details:**
{{IMPLEMENTATION_DETAIL}}

**Acceptance:**
- [ ] {{VERIFIABLE_CRITERION_1}}
- [ ] {{VERIFIABLE_CRITERION_2}}

---

## Implementation Constraints

_Rules from CLAUDE.md and project conventions that MUST be followed during this task._

- {{CONSTRAINT_1}} — e.g., "All new functions must have JSDoc comments"
- {{CONSTRAINT_2}} — e.g., "Use the existing `logger` instance, do not create new ones"
- {{CONSTRAINT_3}} — e.g., "Follow the error handling pattern in `src/utils/errors.ts`"

---

## Edge Cases to Handle

| Scenario | Expected Behavior | Subtask |
|----------|-------------------|---------|
| {{EDGE_CASE_1}} | {{BEHAVIOR_1}} | {{TASK_NUMBER}}.{{SUBTASK}} |
| {{EDGE_CASE_2}} | {{BEHAVIOR_2}} | {{TASK_NUMBER}}.{{SUBTASK}} |

---

## Files to Create / Modify

### New Files
| File Path | Purpose |
|-----------|---------|
| `{{NEW_FILE_1}}` | {{PURPOSE_1}} |
| `{{NEW_FILE_2}}` | {{PURPOSE_2}} |

### Modified Files
| File Path | What Changes | Lines/Section to Modify |
|-----------|-------------|-------------------------|
| `{{MOD_FILE_1}}` | {{CHANGE_DESC}} | {{LOCATION_HINT}} |
| `{{MOD_FILE_2}}` | {{CHANGE_DESC}} | {{LOCATION_HINT}} |

---

## Test Requirements

### Tests to Write
| Test File | Test Description | Covers Subtask |
|-----------|-----------------|----------------|
| `{{TEST_FILE_1}}` | {{TEST_DESC_1}} | {{TASK_NUMBER}}.{{SUBTASK}} |
| `{{TEST_FILE_2}}` | {{TEST_DESC_2}} | {{TASK_NUMBER}}.{{SUBTASK}} |

### Test Scenarios

**Happy Path:**
1. Given {{PRECONDITION}}, when {{ACTION}}, then {{EXPECTED}}

**Error Cases:**
1. Given {{ERROR_PRECONDITION}}, when {{ACTION}}, then {{EXPECTED_ERROR}}

**Edge Cases:**
1. Given {{EDGE_PRECONDITION}}, when {{ACTION}}, then {{EXPECTED_EDGE}}

---

## Success Criteria

_All criteria must pass for this task to be marked as completed._

- [ ] All subtask acceptance criteria are met
- [ ] All new/modified files follow project conventions (see Implementation Constraints)
- [ ] Tests written and passing
- [ ] No existing tests broken
- [ ] Linting passes
- [ ] Type checking passes (if applicable)

---

## Validation Commands

_Run these commands after implementation to verify the task is complete._

```bash
# Run task-specific tests
{{TEST_COMMAND}}

# Run full test suite (verify nothing is broken)
{{FULL_TEST_COMMAND}}

# Lint check
{{LINT_COMMAND}}

# Type check
{{TYPE_CHECK_COMMAND}}

# Build verification
{{BUILD_COMMAND}}
```

**Expected output:** All commands exit with code 0. No new warnings introduced.

---

## Rollback Plan

_If this task introduces breaking changes, how to undo:_
{{ROLLBACK_INSTRUCTIONS}}

---

## Notes

- {{NOTE_1}}
- {{NOTE_2}}
