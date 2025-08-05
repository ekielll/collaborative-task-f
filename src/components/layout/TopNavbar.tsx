import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { useKV } from '@github/spark/hooks';
import { mockColumns } from '@/lib/mock-data';
import { CreateTaskDialog } from '@/components/dialogs/CreateTaskDialog';
import { Task } from '@/lib/types';
import { Bell, Plus, Search, Settings } from '@phosphor-icons/react';
import { List } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface TopNavbarProps {
  onMenuClick?: () => void;
}

export function TopNavbar({ onMenuClick }: TopNavbarProps) {
  const { user, logout } = useAuth();
  const [notifications] = useState(3);
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);
  const [columns] = useKV('board-columns', mockColumns);
  const [tasks, setTasks] = useKV('board-tasks', []);

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

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex h-16 items-center px-6 gap-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <List size={20} />
        </Button>
        
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-primary">TaskFlow</h1>
        </div>
        
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Search tasks, boards, or people..."
              className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => setCreateTaskDialogOpen(true)}
          >
            <Plus size={16} />
            New Task
          </Button>

          <Button variant="ghost" size="sm" className="relative">
            <Bell size={20} />
            {notifications > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                {notifications}
              </Badge>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback>
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CreateTaskDialog
        open={createTaskDialogOpen}
        onClose={() => setCreateTaskDialogOpen(false)}
        onCreateTask={handleCreateTask}
        columns={columns}
      />
    </header>
  );
}