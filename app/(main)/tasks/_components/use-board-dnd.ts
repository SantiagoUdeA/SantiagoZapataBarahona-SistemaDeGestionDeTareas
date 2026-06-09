'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import {
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
  type CollisionDetection,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { toast } from 'sonner'
import { moveTask, reorderTask, reorderColumn } from '../actions'
import type { TaskRowData } from '../queries'

type BoardColumnData = {
  id: string
  name: string
  isDone: boolean
  position: number
  _count: { tasks: number }
}

export type ActiveDrag = { id: string; type: 'column' | 'task' } | null

interface UseBoardDndParams {
  columns: BoardColumnData[]
  initialTasks: Record<string, TaskRowData[]>
}

export function useBoardDnd({ columns, initialTasks }: UseBoardDndParams) {
  const [columnsState, setColumnsState] = useState<Record<string, TaskRowData[]>>(initialTasks)
  const [columnsOrder, setColumnsOrder] = useState<string[]>(columns.map((c) => c.id))
  const [activeDrag, setActiveDrag] = useState<ActiveDrag>(null)

  const snapshot = useRef<Record<string, TaskRowData[]> | null>(null)
  const colSnapshot = useRef<string[] | null>(null)
  const isDraggingRef = useRef(false)
  const isFirstRender = useRef(true)
  const columnsOrderRef = useRef(columns.map((c) => c.id))
  const [, startTransition] = useTransition()

  // Keep ref in sync so onDragEnd always reads the latest order
  columnsOrderRef.current = columnsOrder

  // Reconcile with server data when not dragging.
  // Skips the initial mount (state already initialized from props via useState).
  // Skips while a drag is in progress to avoid clobbering optimistic updates.
  // Uses initialTasks directly so task objects (column metadata, completedAt, etc.) stay fresh.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (isDraggingRef.current) return

    const incoming = columns.map((c) => c.id)
    setColumnsOrder(incoming)
    setColumnsState(() => {
      const next: Record<string, TaskRowData[]> = {}
      for (const id of incoming) {
        next[id] = initialTasks[id] ?? []
      }
      return next
    })
  }, [columns, initialTasks])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  )

  const collisionDetection: CollisionDetection = (args) => {
    if (args.active.data.current?.type === 'column') {
      const columnContainers = args.droppableContainers.filter(
        (c) => c.data.current?.type === 'column' && c.id !== args.active.id,
      )
      return closestCorners({ ...args, droppableContainers: columnContainers })
    }
    return closestCorners(args)
  }

  function deepCopy(state: Record<string, TaskRowData[]>): Record<string, TaskRowData[]> {
    const copy: Record<string, TaskRowData[]> = {}
    for (const [k, v] of Object.entries(state)) {
      copy[k] = [...v]
    }
    return copy
  }

  function findContainerOfTask(taskId: UniqueIdentifier): string | null {
    for (const [colId, tasks] of Object.entries(columnsState)) {
      if (tasks.some((t) => t.id === taskId)) return colId
    }
    return null
  }

  function onDragStart(event: DragStartEvent) {
    isDraggingRef.current = true
    const type = event.active.data.current?.type as 'column' | 'task'
    setActiveDrag({ id: event.active.id as string, type })
    console.log('[DnD] onDragStart — id:', event.active.id, 'type:', type, 'data:', event.active.data.current)

    if (type === 'column') {
      colSnapshot.current = [...columnsOrder]
    } else {
      snapshot.current = deepCopy(columnsState)
    }
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event

    // Column reorder — visual only, committed on drop
    if (active.data.current?.type === 'column') {
      if (!over) return
      const activeId = active.id as string
      const overId = over.id as string
      setColumnsOrder((prev) => {
        const activeIdx = prev.indexOf(activeId)
        const overIdx = prev.indexOf(overId)
        if (activeIdx !== -1 && overIdx !== -1 && activeIdx !== overIdx) {
          return arrayMove(prev, activeIdx, overIdx)
        }
        return prev
      })
      return
    }

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeContainer = findContainerOfTask(activeId)
    if (!activeContainer) return

    // `over` may be a column id or a task id
    const overContainer =
      columnsState[overId] !== undefined ? overId : findContainerOfTask(overId)

    if (!overContainer || activeContainer === overContainer) return

    // Optimistically move task to destination column
    setColumnsState((prev) => {
      const sourceTasks = [...prev[activeContainer]]
      const destTasks = [...(prev[overContainer] ?? [])]

      const fromIndex = sourceTasks.findIndex((t) => t.id === activeId)
      if (fromIndex === -1) return prev

      const [movedTask] = sourceTasks.splice(fromIndex, 1)

      const overTaskIndex = destTasks.findIndex((t) => t.id === overId)
      const insertAt = overTaskIndex >= 0 ? overTaskIndex : destTasks.length

      const destCol = columns.find((c) => c.id === overContainer)
      const updatedTask = {
        ...movedTask,
        columnId: overContainer,
        column: destCol
          ? { id: destCol.id, name: destCol.name, isDone: destCol.isDone, position: destCol.position }
          : movedTask.column,
      }
      destTasks.splice(insertAt, 0, updatedTask)

      return {
        ...prev,
        [activeContainer]: sourceTasks,
        [overContainer]: destTasks,
      }
    })
  }

  function onDragEnd(event: DragEndEvent) {
    // Mark drag finished before any async work so the reconciliation
    // useEffect is allowed to run when revalidatePath fires.
    isDraggingRef.current = false
    setActiveDrag(null)

    const { active, over } = event

    // Commit column reorder
    if (active.data.current?.type === 'column') {
      const savedSnapshot = colSnapshot.current
      colSnapshot.current = null

      if (!over || active.id === over.id) {
        if (savedSnapshot) setColumnsOrder(savedSnapshot)
        return
      }

      // onDragOver may not have processed the final frame before drop.
      // Apply the same arrayMove here to guarantee the visual state and
      // newIndex both reflect where the user actually released the column.
      const currentOrder = columnsOrderRef.current
      const activeIdx = currentOrder.indexOf(active.id as string)
      const overIdx = currentOrder.indexOf(over.id as string)

      let finalOrder = currentOrder
      if (activeIdx !== -1 && overIdx !== -1 && activeIdx !== overIdx) {
        finalOrder = arrayMove(currentOrder, activeIdx, overIdx)
        setColumnsOrder(finalOrder)
      }

      const newIndex = finalOrder.indexOf(active.id as string)
      console.log('[DnD] onDragEnd column — newIndex:', newIndex, 'finalOrder:', finalOrder)
      startTransition(async () => {
        const result = await reorderColumn(active.id as string, newIndex)
        if ('error' in result && result.error) {
          toast.error(result.error)
          if (savedSnapshot) setColumnsOrder(savedSnapshot)
        }
      })
      return
    }

    // Revert task drag if dropped outside any droppable
    if (!over) {
      if (snapshot.current) setColumnsState(snapshot.current)
      snapshot.current = null
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    // Use snapshot (pre-drag state) to find the original container.
    // findContainerOfTask reads current optimistic state — if onDragOver already moved
    // the task to overContainer, activeContainer would equal overContainer and we'd
    // incorrectly call reorderTask instead of moveTask.
    const snapshotState = snapshot.current ?? columnsState
    const activeContainer =
      Object.entries(snapshotState).find(([, tasks]) => tasks.some((t) => t.id === activeId))?.[0] ?? null
    if (!activeContainer) {
      snapshot.current = null
      return
    }

    const overContainer =
      columnsState[overId] !== undefined ? overId : findContainerOfTask(overId)

    if (!overContainer) {
      if (snapshot.current) setColumnsState(snapshot.current)
      snapshot.current = null
      return
    }

    if (activeContainer === overContainer) {
      // Reorder within the same column
      setColumnsState((prev) => {
        const tasks = [...prev[activeContainer]]
        const oldIndex = tasks.findIndex((t) => t.id === activeId)
        const newIndex = tasks.findIndex((t) => t.id === overId)
        if (oldIndex === newIndex) return prev
        return { ...prev, [activeContainer]: arrayMove(tasks, oldIndex, newIndex) }
      })

      const tasks = columnsState[activeContainer]
      const newIndex = tasks.findIndex((t) => t.id === overId)
      const toPosition = newIndex >= 0 ? newIndex : tasks.length - 1

      startTransition(async () => {
        const result = await reorderTask(activeId, toPosition)
        if ('error' in result && result.error) {
          toast.error(result.error)
          if (snapshot.current) setColumnsState(snapshot.current)
        }
        snapshot.current = null
      })
    } else {
      // Cross-column move — state already updated optimistically in onDragOver
      const destTasks = columnsState[overContainer]
      const toPosition = destTasks.findIndex((t) => t.id === activeId)
      const finalPosition = toPosition >= 0 ? toPosition : destTasks.length

      startTransition(async () => {
        const result = await moveTask(activeId, overContainer, finalPosition)
        if ('error' in result && result.error) {
          toast.error(result.error)
          if (snapshot.current) setColumnsState(snapshot.current)
        }
        snapshot.current = null
      })
    }
  }

  return {
    columnsState,
    columnsOrder,
    activeDrag,
    sensors,
    collisionDetection,
    onDragStart,
    onDragOver,
    onDragEnd,
  }
}
