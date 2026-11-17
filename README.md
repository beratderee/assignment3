# Berat Dere - 2023502168
## Bonus 1: Undo
To add the undo feature, I changed the state shape to `{ tasks: Task[]; filter: Filter; past: Task[][] }`. When an action changes the tasks (`add`, `advance`, `remove`, or `clearDone`), the reducer saves the old `tasks` list into `past` first, while `setFilter` does not change `past`. When the user clicks Undo, `{ type: 'undo' }` takes the last task list from `past` and brings it back, and the button is disabled if `past` is empty.

## Bonus 2: Tests
beratdere@Berat-MacBook-Pro-256 assignment3 % npm test

> task-manager-assignment3@0.0.0 test
> vitest run


 RUN  v5.1.0 /Users/beratdere/Desktop/assignment3

 ✓ src/taskReducer.test.ts (10 tests) 3ms
   ✓ taskReducer (8)
     ✓ adds a task with todo status and records history 1ms
     ✓ advances a task through todo -> in-progress -> done -> todo 0ms
     ✓ removes a task by id and ignores unknown id 0ms
     ✓ sets filter without changing tasks or past 0ms
     ✓ clears done tasks and keeps filter 0ms
     ✓ does nothing on clearDone when no tasks are done 0ms
     ✓ undoes task changes including clearDone, and does nothing when past is empty 0ms
     ✓ does not mutate previous state (Object.freeze check) 0ms
   ✓ filterTasks and countByFilter (2)
     ✓ filters and counts tasks accurately across all statuses and after deletion 0ms
     ✓ handles an empty task list 0ms

 Test Files  1 passed (1)
      Tests  10 passed (10)
   Start at  20:02:08
   Duration  78ms (import 38%, transform 26%, tests 23%, worker 12%)
## Bonus 3: Explain your reducer
A reducer must be a pure function so that given the exact same state and action, it always returns the exact same next state without side effects. React relies on reference equality (Object.is) to detect state updates; if a reducer mutates the existing state object or array in place, the reference remains identical, causing React to skip re-rendering the component tree and leaving the user interface out of sync with the underlying data.
The caller generates the task id using crypto.randomUUID() rather than the reducer because generating random identifiers is an impure operation. If the reducer created the ID internally, calling it twice with the same inputs would produce different outputs, breaking predictability, replayability (such as time-travel debugging or undo), and deterministic unit testing.
Filtered tasks and status counts are derived during rendering rather than stored in state to maintain a single source of truth. If we stored filteredTasks or counts separately in state, every action (add, advance, remove, clearDone, undo) would have to manually recalculate and synchronize them. Forgetting to update counts in just one action branch—such as clearDone or undo—would cause a bug where the button badges display stale, inaccurate numbers that do not match the visible list.
Moving filter into the reducer state instead of keeping a separate useState made state management more unified and predictable, because all state transitions now live in one central place with strict TypeScript action types. However, it required extra care when implementing undo to ensure that filter changes are excluded from the past history stack.
## Bonus 4:Git repository
https://github.com/beratderee/assignment3

