import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useKV } from '@github/spark/hooks';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { useKV } from '@github/spark/hooks';
import { mockColumns } from '@/lib/mock-data';
import { CreateTaskDialog } from '@/components/dialogs/CreateTaskDialog';
import { Task } from '@/lib/types';
import { Bell, Plus, Search, Settings } from '@phosphor-icons/react';
import { toast } from 'sonner';

export function TopNavbar() {
      id: `task-${Date.now()}`,
  const [notifications] = useState(3);
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);
  const [columns] = useKV('board-columns', mockColumns);
  const [tasks, setTasks] = useKV('board-tasks', []);

  const handleCreateTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'position'>) => {
    const newTask: Task = {
          size="sm
      id: `task-${Date.now()}`,
      position: tasks.filter(t => t.columnId === taskData.columnId).length,
      createdAt: new Date(),
          <h1 className="te
    };

    setTasks(currentTasks => [...currentTasks, newTask]);
    toast.success('Task created successfully');
  };

        <d
            variant="outline" 
            className="gap-2"
          >
            New Task

        
              <Badge variant="destructive
              </Badge>
          </Button>
          <Dropdow
              <Button var
                  <AvatarImage src={user?.avatar} alt={user?.n
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
              
            </Dr
              

                    {user?.email}
                </
              <DropdownMenuSep
                <Setti
              </DropdownMenuI
              <DropdownMenuItem onClick={logout}>
           
          </DropdownMenu>
      </div>
      <CreateTaskDi

        columns={columns}
    </header>
}

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