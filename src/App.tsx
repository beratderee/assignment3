import { useReducer, type Dispatch } from 'react'
import {
  taskReducer,
  initialState,
  type Task,
  type Action,
} from './taskReducer'
import {
  FILTERS,
  filterTasks,
  countByFilter,
  type Filter,
} from './filter'
import TaskRow from './TaskRow'

const FILTER_LABELS: Record<Filter, string> = {
  all: 'All',
  todo: 'To do',
  'in-progress': 'In progress',
  done: 'Done',
}

function AddForm({ dispatch }: { dispatch: Dispatch<Action> }) {
  function addTask(formData: FormData) {
    const title = String(formData.get('title') ?? '').trim()
    if (title) dispatch({ type: 'add', id: crypto.randomUUID(), title })
  }
  return (
    <form action={addTask} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
      <input name="title" placeholder="New task" style={{ flex: 1, padding: 6 }} />
      <button type="submit">Add</button>
    </form>
  )
}

function FilterBar({
  activeFilter,
  counts,
  canUndo,
  dispatch,
}: {
  activeFilter: Filter
  counts: Record<Filter, number>
  canUndo: boolean
  dispatch: Dispatch<Action>
}) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
      {FILTERS.map((f) => {
        const isActive = f === activeFilter
        return (
          <button
            key={f}
            type="button"
            onClick={() => dispatch({ type: 'setFilter', filter: f })}
            style={{
              fontWeight: isActive ? 'bold' : 'normal',
              backgroundColor: isActive ? '#222' : '#f0f0f0',
              color: isActive ? '#fff' : '#000',
              border: '1px solid #ccc',
              padding: '6px 12px',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            {FILTER_LABELS[f]} ({counts[f]})
          </button>
        )
      })}
      <button
        type="button"
        disabled={!canUndo}
        onClick={() => dispatch({ type: 'undo' })}
        style={{
          marginLeft: 'auto',
          padding: '6px 12px',
          borderRadius: 4,
          border: '1px solid #ccc',
          cursor: canUndo ? 'pointer' : 'not-allowed',
          opacity: canUndo ? 1 : 0.5,
        }}
      >
        Undo
      </button>
      <button
        type="button"
        onClick={() => dispatch({ type: 'clearDone' })}
        style={{
          padding: '6px 12px',
          borderRadius: 4,
          border: '1px solid #ccc',
          cursor: 'pointer',
        }}
      >
        Clear done
      </button>
    </div>
  )
}

function TaskList({ tasks, dispatch }: { tasks: Task[]; dispatch: Dispatch<Action> }) {
  if (tasks.length === 0) {
    return <p style={{ color: '#666' }}>No tasks here.</p>
  }

  return (
    <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {tasks.map((t) => (
        <TaskRow
          key={t.id}
          task={t}
          onNext={() => dispatch({ type: 'advance', id: t.id })}
          onDelete={() => dispatch({ type: 'remove', id: t.id })}
        />
      ))}
    </ul>
  )
}

export default function App() {
  const [state, dispatch] = useReducer(taskReducer, initialState)

  const counts = countByFilter(state.tasks)
  const visibleTasks = filterTasks(state.tasks, state.filter)

  return (
    <main style={{ maxWidth: 600, margin: '32px auto', fontFamily: 'sans-serif', padding: '0 16px' }}>
      <h1>Task Manager</h1>
      <AddForm dispatch={dispatch} />
      <FilterBar
        activeFilter={state.filter}
        counts={counts}
        canUndo={state.past.length > 0}
        dispatch={dispatch}
      />
      <TaskList tasks={visibleTasks} dispatch={dispatch} />
    </main>
  )
}