import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Column } from '@/lib/types';
import { Plus } from '@phosphor-icons/react';

interface CreateColumnDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateColumn: (name: string) => void;
}

export function CreateColumnDialog({ open, onClose, onCreateColumn }: CreateColumnDialogProps) {
  const [columnName, setColumnName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!columnName.trim()) return;

    onCreateColumn(columnName.trim());
    setColumnName('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Column</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Column Name *</label>
            <Input
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              placeholder="Enter column name..."
              className="mt-1"
              required
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="gap-2">
              <Plus size={16} />
              Create Column
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}