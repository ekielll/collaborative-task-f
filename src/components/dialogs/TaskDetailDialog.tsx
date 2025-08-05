import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Task, Priority } from '@/lib/types';
import { Calendar, Tag, User, Trash2, Save } from '@phosphor-icons/react';
import { format } from 'date-fns';

interface TaskDetailDialogProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const priorityColors = {
  LOW: 'bg-blue-500',
  MEDIUM: 'bg-yellow-500', 
  HIGH: 'bg-orange-500',
  URGENT: 'bg-red-500'
};

export function TaskDetailDialog({ task, open, onClose, onSave, onDelete }: TaskDetailDialogProps) {
  const [editedTask, setEditedTask] = useState<Task | null>(task);

  useEffect(() => {
    setEditedTask(task);
  }, [task]);

  if (!task || !editedTask) return null;

  const handleSave = () => {
    onSave(editedTask);
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id);
      onClose();
    }
  };

  const updateTask = (updates: Partial<Task>) => {
    setEditedTask(prev => prev ? { ...prev, ...updates } : null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Task Details</span>
            <div className="flex items-center gap-2">
              <Button onClick={handleSave} size="sm" className="gap-2">
                <Save size={16} />
                Save
              </Button>
              <Button onClick={handleDelete} variant="destructive" size="sm" className="gap-2">
                <Trash2 size={16} />
                Delete
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              value={editedTask.title}
              onChange={(e) => updateTask({ title: e.target.value })}
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={editedTask.description || ''}
              onChange={(e) => updateTask({ description: e.target.value })}
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Priority</label>
              <Select 
                value={editedTask.priority} 
                onValueChange={(value: Priority) => updateTask({ priority: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${priorityColors.LOW}`} />
                      Low
                    </div>
                  </SelectItem>
                  <SelectItem value="MEDIUM">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${priorityColors.MEDIUM}`} />
                      Medium
                    </div>
                  </SelectItem>
                  <SelectItem value="HIGH">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${priorityColors.HIGH}`} />
                      High
                    </div>
                  </SelectItem>
                  <SelectItem value="URGENT">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${priorityColors.URGENT}`} />
                      Urgent
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Due Date</label>
              <Input
                type="date"
                value={editedTask.dueDate ? format(new Date(editedTask.dueDate), 'yyyy-MM-dd') : ''}
                onChange={(e) => updateTask({ dueDate: e.target.value ? new Date(e.target.value) : undefined })}
                className="mt-1"
              />
            </div>
          </div>

          {/* Tags */}
          {editedTask.tags.length > 0 && (
            <div>
              <label className="text-sm font-medium">Tags</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {editedTask.tags.map((tag) => (
                  <Badge 
                    key={tag.id}
                    variant="secondary"
                    style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Creator and Assignee */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Creator</label>
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {editedTask.creator.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{editedTask.creator.name}</span>
              </div>
            </div>

            {editedTask.assignee && (
              <div>
                <label className="text-sm font-medium">Assignee</label>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={editedTask.assignee.avatar} />
                    <AvatarFallback className="text-xs">
                      {editedTask.assignee.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{editedTask.assignee.name}</span>
                </div>
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Created: {format(new Date(editedTask.createdAt), 'MMM d, yyyy h:mm a')}</div>
            <div>Updated: {format(new Date(editedTask.updatedAt), 'MMM d, yyyy h:mm a')}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}