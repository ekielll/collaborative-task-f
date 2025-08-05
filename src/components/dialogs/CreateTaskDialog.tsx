import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Task, Priority, Column } from '@/lib/types';
import { Plus } from '@phosphor-icons/react';

interface CreateTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'position'>) => void;
  columns: Column[];
  defaultColumnId?: string;
}

const priorityColors = {
  LOW: 'bg-blue-500',
  MEDIUM: 'bg-yellow-500', 
  HIGH: 'bg-orange-500',
  URGENT: 'bg-red-500'
};

export function CreateTaskDialog({ open, onClose, onCreateTask, columns, defaultColumnId }: CreateTaskDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as Priority,
    columnId: defaultColumnId || columns[0]?.id || '',
    dueDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;

    const selectedColumn = columns.find(c => c.id === formData.columnId);
    
    const newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'position'> = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      priority: formData.priority,
      status: selectedColumn?.name || 'To Do',
      columnId: formData.columnId,
      column: selectedColumn || {} as Column,
      creatorId: 'user-1',
      creator: { id: 'user-1', name: 'Current User', email: 'user@example.com' },
      tags: [],
      comments: []
    };

    if (formData.dueDate) {
      newTask.dueDate = new Date(formData.dueDate);
    }

    onCreateTask(newTask);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      priority: 'MEDIUM',
      columnId: defaultColumnId || columns[0]?.id || '',
      dueDate: ''
    });
    
    onClose();
  };

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-sm font-medium">Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => updateFormData({ title: e.target.value })}
              placeholder="Enter task title..."
              className="mt-1"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
              placeholder="Add task description..."
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Column and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Column</label>
              <Select 
                value={formData.columnId} 
                onValueChange={(value) => updateFormData({ columnId: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((column) => (
                    <SelectItem key={column.id} value={column.id}>
                      {column.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Priority</label>
              <Select 
                value={formData.priority} 
                onValueChange={(value: Priority) => updateFormData({ priority: value })}
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
          </div>

          {/* Due Date */}
          <div>
            <label className="text-sm font-medium">Due Date</label>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) => updateFormData({ dueDate: e.target.value })}
              className="mt-1"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="gap-2">
              <Plus size={16} />
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}