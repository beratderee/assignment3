import { describe, it, expect } from 'vitest'
import { taskReducer, initialState, type State } from './taskReducer'
import { filterTasks, countByFilter } from './filter'

describe('taskReducer', () => {
  it('adds a task with todo status and records history', () => {
    const state = taskReducer(initialState, { type: 'add', id: '1', title: 'Learn TS' })
    expect(state.tasks).toEqual([{ id: '1', title: 'Learn TS', status: 'todo' }])
    expect(state.past).toEqual([[]])
  })

  it('advances a task through todo -> in-progress -> done -> todo', () => {
    let state = taskReducer(initialState, { type: 'add', id: '1', title: 'Task 1' })
    state = taskReducer(state, { type: 'advance', id: '1' })
    expect(state.tasks[0].status).toBe('in-progress')

    state = taskReducer(state, { type: 'advance', id: '1' })
    expect(state.tasks[0].status).toBe('done')

    state = taskReducer(state, { type: 'advance', id: '1' })
    expect(state.tasks[0].status).toBe('todo')
  })

  it('removes a task by id and ignores unknown id', () => {
    let state = taskReducer(initialState, { type: 'add', id: '1', title: 'Task 1' })
    state = taskReducer(state, { type: 'remove', id: 'unknown-id' })
    expect(state.tasks).toHaveLength(1)

    state = taskReducer(state, { type: 'remove', id: '1' })
    expect(state.tasks).toHaveLength(0)
  })

  it('sets filter without changing tasks or past', () => {
    const s1 = taskReducer(initialState, { type: 'add', id: '1', title: 'Task 1' })
    const s2 = taskReducer(s1, { type: 'setFilter', filter: 'done' })
    expect(s2.filter).toBe('done')
    expect(s2.tasks).toEqual(s1.tasks)
    expect(s2.past).toEqual(s1.past)
  })

  it('clears done tasks and keeps filter', () => {
    let state = taskReducer(initialState, { type: 'add', id: '1', title: 'T1' })
    state = taskReducer(state, { type: 'add', id: '2', title: 'T2' })
    state = taskReducer(state, { type: 'advance', id: '1' })
    state = taskReducer(state, { type: 'advance', id: '1' }) // T1 is done
    state = taskReducer(state, { type: 'setFilter', filter: 'done' })

    state = taskReducer(state, { type: 'clearDone' })
    expect(state.tasks).toEqual([{ id: '2', title: 'T2', status: 'todo' }])
    expect(state.filter).toBe('done')
  })

  it('does nothing on clearDone when no tasks are done', () => {
    const s1 = taskReducer(initialState, { type: 'add', id: '1', title: 'T1' })
    const s2 = taskReducer(s1, { type: 'clearDone' })
    expect(s2.tasks).toEqual(s1.tasks)
  })

  it('undoes task changes including clearDone, and does nothing when past is empty', () => {
    const emptyUndo = taskReducer(initialState, { type: 'undo' })
    expect(emptyUndo).toEqual(initialState)

    let state = taskReducer(initialState, { type: 'add', id: '1', title: 'T1' })
    state = taskReducer(state, { type: 'advance', id: '1' })
    state = taskReducer(state, { type: 'advance', id: '1' }) // done
    state = taskReducer(state, { type: 'clearDone' })
    expect(state.tasks).toHaveLength(0)

    state = taskReducer(state, { type: 'undo' })
    expect(state.tasks).toHaveLength(1)
    expect(state.tasks[0].status).toBe('done')
  })

  it('does not mutate previous state (Object.freeze check)', () => {
    const frozenState: State = Object.freeze({
      tasks: Object.freeze([{ id: '1', title: 'Frozen', status: 'todo' as const }]) as State['tasks'],
      filter: 'all',
      past: Object.freeze([]) as State['past'],
    })

    const nextState = taskReducer(frozenState, { type: 'advance', id: '1' })
    expect(nextState.tasks[0].status).toBe('in-progress')
    expect(frozenState.tasks[0].status).toBe('todo')
  })
})

describe('filterTasks and countByFilter', () => {
  it('filters and counts tasks accurately across all statuses and after deletion', () => {
    let state = taskReducer(initialState, { type: 'add', id: '1', title: 'T1' })
    state = taskReducer(state, { type: 'add', id: '2', title: 'T2' })
    state = taskReducer(state, { type: 'add', id: '3', title: 'T3' })
    state = taskReducer(state, { type: 'advance', id: '2' }) // in-progress
    state = taskReducer(state, { type: 'advance', id: '3' })
    state = taskReducer(state, { type: 'advance', id: '3' }) // done

    expect(countByFilter(state.tasks)).toEqual({
      all: 3,
      todo: 1,
      'in-progress': 1,
      done: 1,
    })

    expect(filterTasks(state.tasks, 'all')).toHaveLength(3)
    expect(filterTasks(state.tasks, 'todo')).toHaveLength(1)
    expect(filterTasks(state.tasks, 'in-progress')).toHaveLength(1)
    expect(filterTasks(state.tasks, 'done')).toHaveLength(1)

    // After deletion
    state = taskReducer(state, { type: 'remove', id: '2' })
    expect(countByFilter(state.tasks)).toEqual({
      all: 2,
      todo: 1,
      'in-progress': 0,
      done: 1,
    })
  })

  it('handles an empty task list', () => {
    expect(filterTasks([], 'all')).toEqual([])
    expect(filterTasks([], 'todo')).toEqual([])
    expect(countByFilter([])).toEqual({
      all: 0,
      todo: 0,
      'in-progress': 0,
      done: 0,
    })
  })
})