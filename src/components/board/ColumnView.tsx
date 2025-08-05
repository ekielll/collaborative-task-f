import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Column } from '@/lib/types';
import { TaskCard } from './TaskCard';
import { Plus } from '@phosphor-icons/react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableTaskCard } from './SortableTaskCard';
import { cn } from '@/lib/utils';

interface ColumnViewProps {
  column: Column;
  onTaskClick?: (taskId: string) => void;
  onAddTask?: (columnId: string) => void;
}

export function ColumnView({ column, onTaskClick, onAddTask }: ColumnViewProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const taskIds = column.tasks.map(task => task.id);

  return (
    <Card className="w-80 flex flex-col h-fit max-h-[calc(100vh-200px)]">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{column.name}</h3>
            <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {column.tasks.length}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddTask?.(column.id)}
            className="h-8 w-8 p-0"
          >
            <Plus size={16} />
          </Button>
        </div>
      </CardHeader>

      <CardContent 
        ref={setNodeRef}
        className={cn(
          "flex-1 p-3 space-y-3 overflow-y-auto",
          isOver && "bg-muted/50"
        )}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick?.(task.id)}
            />
          ))}
        </SortableContext>
        
        {column.tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No tasks yet</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddTask?.(column.id)}
              className="mt-2 gap-2"
            >
              <Plus size={14} />
              Add first task
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}