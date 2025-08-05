import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { ColumnView } from './ColumnView';
import { TaskCard } from './TaskCard';
import { Button } from '@/components/ui/button';
import { useKV } from '@github/spark/hooks';
import { mockBoard, mockTasks, mockColumns } from '@/lib/mock-data';
import { Column, Task } from '@/lib/types';
import { Plus, Filter, Calendar, Users, SortAscending } from '@phosphor-icons/react';
import { CreateTaskDialog } from '@/components/dialogs/CreateTaskDialog';
import { CreateColumnDialog } from '@/components/dialogs/CreateColumnDialog';
import { TaskDetailDialog } from '@/components/dialogs/TaskDetailDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export function BoardView() {
  const [board, setBoard] = useKV('current-board', mockBoard);
  const [columns, setColumns] = useKV('board-columns', mockColumns);
  const [tasks, setTasks] = useKV('board-tasks', mockTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  // Dialog states
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);
  const [createColumnDialogOpen, setCreateColumnDialogOpen] = useState(false);
  const [taskDetailDialogOpen, setTaskDetailDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [defaultColumnId, setDefaultColumnId] = useState<string>('');
  
  // Filter and sort states
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created');

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
    setDefaultColumnId(columnId);
    setCreateTaskDialogOpen(true);
  };

  const handleCreateTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'position'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      position: tasks.filter(t => t.columnId === taskData.columnId).length,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setTasks(currentTasks => [...currentTasks, newTask]);
    toast.success('Task created successfully');
  };

  const handleCreateColumn = (name: string) => {
    const newColumn: Column = {
      id: `column-${Date.now()}`,
      name,
      position: columns.length,
      boardId: board.id,
      board,
      tasks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setColumns(currentColumns => [...currentColumns, newColumn]);
    toast.success('Column created successfully');
  };

  const handleTaskClick = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setTaskDetailDialogOpen(true);
    }
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(currentTasks => 
      currentTasks.map(task => 
        task.id === updatedTask.id 
          ? { ...updatedTask, updatedAt: new Date() }
          : task
      )
    );
    toast.success('Task updated successfully');
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(currentTasks => currentTasks.filter(task => task.id !== taskId));
    toast.success('Task deleted successfully');
  };

  const handleFilterChange = (priority: string) => {
    setFilterPriority(priority);
  };

  const handleSortChange = (sortType: string) => {
    setSortBy(sortType);
  };

  // Group tasks by column and apply filters/sorting
  const getFilteredTasks = (columnTasks: Task[]) => {
    let filtered = columnTasks;
    
    // Apply priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { 'URGENT': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        filtered = filtered.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
        break;
      case 'dueDate':
        filtered = filtered.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
        break;
      case 'created':
      default:
        filtered = filtered.sort((a, b) => a.position - b.position);
        break;
    }
    
    return filtered;
  };

  const columnsWithTasks = columns.map(column => {
    const columnTasks = tasks.filter(task => task.columnId === column.id);
    const filteredTasks = getFilteredTasks(columnTasks);
    
    return {
      ...column,
      tasks: filteredTasks
    };
  });

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter size={16} />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleFilterChange('all')}>
                  All Priorities
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange('URGENT')}>
                  Urgent Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange('HIGH')}>
                  High Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange('MEDIUM')}>
                  Medium Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange('LOW')}>
                  Low Only
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <SortAscending size={16} />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleSortChange('created')}>
                  Sort by Position
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange('priority')}>
                  Sort by Priority
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange('dueDate')}>
                  Sort by Due Date
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="sm" className="gap-2">
              <Calendar size={16} />
              Calendar
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Users size={16} />
              Team
            </Button>
            <Button onClick={() => setCreateColumnDialogOpen(true)} className="gap-2">
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

      {/* Dialogs */}
      <CreateTaskDialog
        open={createTaskDialogOpen}
        onClose={() => setCreateTaskDialogOpen(false)}
        onCreateTask={handleCreateTask}
        columns={columns}
        defaultColumnId={defaultColumnId}
      />

      <CreateColumnDialog
        open={createColumnDialogOpen}
        onClose={() => setCreateColumnDialogOpen(false)}
        onCreateColumn={handleCreateColumn}
      />

      <TaskDetailDialog
        task={selectedTask}
        open={taskDetailDialogOpen}
        onClose={() => setTaskDetailDialogOpen(false)}
        onSave={handleUpdateTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}