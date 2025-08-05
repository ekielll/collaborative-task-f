import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Task } from '@/lib/types';
import { Calendar, MessageCircle } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onClick?: () => void;
}

const priorityConfig = {
  LOW: { color: 'bg-blue-500', label: 'Low' },
  MEDIUM: { color: 'bg-yellow-500', label: 'Medium' },
  HIGH: { color: 'bg-orange-500', label: 'High' },
  URGENT: { color: 'bg-red-500', label: 'Urgent' }
};

export function TaskCard({ task, isDragging, onClick }: TaskCardProps) {
  const priorityInfo = priorityConfig[task.priority];
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isDragging && "opacity-50 rotate-1 shadow-lg"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        {/* Priority indicator */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", priorityInfo.color)} />
            <Badge variant="outline" className="text-xs">
              {priorityInfo.label}
            </Badge>
          </div>
          {task.comments.length > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageCircle size={14} />
              <span className="text-xs">{task.comments.length}</span>
            </div>
          )}
        </div>

        {/* Task title */}
        <h3 className="font-medium leading-tight">{task.title}</h3>

        {/* Task description */}
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag) => (
              <Badge 
                key={tag.id} 
                variant="secondary" 
                className="text-xs"
                style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Bottom section: Due date and assignee */}
        <div className="flex items-center justify-between">
          {task.dueDate && (
            <div className={cn(
              "flex items-center gap-1 text-xs",
              isOverdue ? "text-destructive" : "text-muted-foreground"
            )}>
              <Calendar size={12} />
              <span>{format(new Date(task.dueDate), 'MMM d')}</span>
            </div>
          )}
          
          {task.assignee && (
            <Avatar className="h-6 w-6">
              <AvatarImage src={task.assignee.avatar} />
              <AvatarFallback className="text-xs">
                {task.assignee.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardContent>
    </Card>
  );
}