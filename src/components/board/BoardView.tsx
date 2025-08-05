import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { ColumnView } from './ColumnView';
import { TaskCard } from './TaskCard';
import { Button } from '@/components/ui/button';
import { useKV } from '@github/spark/hooks';
import { mockBoard, mockTasks, mockColumns } from '@/lib/mock-data';
import { Column, Task } from '@/lib/types';
import { Plus, Filter, Calendar, Users } from '@phosphor-icons/react';

export function BoardView() {
  const [board, setBoard] = useKV('current-board', mockBoard);
  const [columns, setColumns] = useKV('board-columns', mockColumns);
  const [tasks, setTasks] = useKV('board-tasks', mockTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    // Find the active task
    const activeTask = tasks.find(t => t.id === activeTaskId);
    if (!activeTask) return;

    // Determine if we're dropping over a column or another task
    const overColumn = columns.find(c => c.id === overId);
    const overTask = tasks.find(t => t.id === overId);
    const targetColumnId = overColumn?.id || overTask?.columnId;

    if (!targetColumnId || activeTask.columnId === targetColumnId) return;

    // Move task to new column
    setTasks(currentTasks => 
      currentTasks.map(task => 
        task.id === activeTaskId 
          ? { ...task, columnId: targetColumnId }
          : task
      )
    );

    // Update columns state to reflect the change
    setColumns(currentColumns => 
      currentColumns.map(column => ({
        ...column,
        tasks: tasks.filter(task => 
          task.id === activeTaskId ? targetColumnId === column.id : task.columnId === column.id
        )
      }))
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    // If dropped on the same position, do nothing
    if (activeTaskId === overId) return;

    const activeTask = tasks.find(t => t.id === activeTaskId);
    if (!activeTask) return;

    // Handle reordering within the same column
    const overTask = tasks.find(t => t.id === overId);
    if (overTask && activeTask.columnId === overTask.columnId) {
      const columnTasks = tasks.filter(t => t.columnId === activeTask.columnId);
      const oldIndex = columnTasks.findIndex(t => t.id === activeTaskId);
      const newIndex = columnTasks.findIndex(t => t.id === overId);

      if (oldIndex !== newIndex) {
        const reorderedTasks = arrayMove(columnTasks, oldIndex, newIndex);
        
        // Update positions
        const updatedTasks = reorderedTasks.map((task, index) => ({
          ...task,
          position: index
        }));

        // Update the full tasks array
        setTasks(currentTasks => 
          currentTasks.map(task => {
            const updatedTask = updatedTasks.find(ut => ut.id === task.id);
            return updatedTask || task;
          })
        );
      }
    }
  };

  const handleAddTask = (columnId: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: 'New Task',
      description: '',
      priority: 'MEDIUM',
      status: columns.find(c => c.id === columnId)?.name || 'To Do',
      columnId,
      column: {} as Column,
      creatorId: 'user-1',
      creator: { id: 'user-1', name: 'Current User', email: 'user@example.com' },
      tags: [],
      comments: [],
      position: tasks.filter(t => t.columnId === columnId).length,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setTasks(currentTasks => [...currentTasks, newTask]);
  };

  const handleTaskClick = (taskId: string) => {
    // TODO: Open task detail modal
    console.log('Open task:', taskId);
  };

  // Group tasks by column
  const columnsWithTasks = columns.map(column => ({
    ...column,
    tasks: tasks.filter(task => task.columnId === column.id).sort((a, b) => a.position - b.position)
  }));

  return (
    <div className="flex flex-col h-full">
      {/* Board Header */}
      <div className="border-b bg-card/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{board.name}</h1>
            <p className="text-muted-foreground">{board.description}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter size={16} />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar size={16} />
              Calendar
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Users size={16} />
              Team
            </Button>
            <Button className="gap-2">
              <Plus size={16} />
              Add Column
            </Button>
          </div>
        </div>
      </div>

      {/* Board Content */}
      <div className="flex-1 overflow-x-auto p-6">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 min-w-fit">
            <SortableContext items={columns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
              {columnsWithTasks.map((column) => (
                <ColumnView
                  key={column.id}
                  column={column}
                  onTaskClick={handleTaskClick}
                  onAddTask={handleAddTask}
                />
              ))}
            </SortableContext>
          </div>

          <DragOverlay>
            {activeTask ? (
              <TaskCard task={activeTask} isDragging />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}