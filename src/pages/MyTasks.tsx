import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useKV } from '@github/spark/hooks';
import { useAuth } from '@/lib/auth';
import { 
  CheckCircle,
  Clock,
  Plus,
  CalendarBlank,
  Flag,
  User
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export function MyTasks() {
  const { user } = useAuth();
  const [tasks] = useKV('board-tasks', []);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Filter tasks assigned to current user
  const myTasks = tasks.filter((task: any) => 
    task.assignedTo === user?.email || task.assignedTo === user?.name
  );

  // Group tasks by status
  const tasksByStatus = {
    'To Do': myTasks.filter((task: any) => task.status === 'To Do'),
    'In Progress': myTasks.filter((task: any) => task.status === 'In Progress'),
    'Done': myTasks.filter((task: any) => task.status === 'Done')
  };

  // Filter tasks based on selected filter
  const getFilteredTasks = () => {
    const now = new Date();
    switch (selectedFilter) {
      case 'due-today':
        return myTasks.filter((task: any) => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate.toDateString() === now.toDateString();
        });
      case 'overdue':
        return myTasks.filter((task: any) => {
          if (!task.dueDate || task.status === 'Done') return false;
          return new Date(task.dueDate) < now;
        });
      case 'high-priority':
        return myTasks.filter((task: any) => task.priority === 'High');
      default:
        return myTasks;
    }
  };

  const filteredTasks = getFilteredTasks();

  const TaskCard = ({ task }: { task: any }) => {
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';
    
    return (
      <Card className={cn(
        "transition-all duration-200 hover:shadow-md",
        isOverdue && "border-destructive"
      )}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <h3 className="font-medium text-sm">{task.title}</h3>
              <Badge variant={
                task.priority === 'High' ? 'destructive' :
                task.priority === 'Medium' ? 'default' : 'secondary'
              } className="text-xs">
                {task.priority}
              </Badge>
            </div>
            
            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}
            
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                {task.dueDate && (
                  <div className={cn(
                    "flex items-center gap-1",
                    isOverdue ? "text-destructive" : "text-muted-foreground"
                  )}>
                    <CalendarBlank size={12} />
                    <span>
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                {task.tags && task.tags.length > 0 && (
                  <div className="flex gap-1">
                    {task.tags.slice(0, 2).map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                        {tag}
                      </Badge>
                    ))}
                    {task.tags.length > 2 && (
                      <span className="text-muted-foreground">+{task.tags.length - 2}</span>
                    )}
                  </div>
                )}
              </div>
              
              <Badge variant="outline" className="text-xs">
                {task.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const StatusColumn = ({ status, tasks }: { status: string, tasks: any[] }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm flex items-center gap-2">
          {status === 'To Do' && <Clock size={16} />}
          {status === 'In Progress' && <Flag size={16} />}
          {status === 'Done' && <CheckCircle size={16} />}
          {status}
        </h3>
        <Badge variant="secondary" className="text-xs">
          {tasks.length}
        </Badge>
      </div>
      
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-xs">No tasks in {status.toLowerCase()}</div>
          </div>
        ) : (
          tasks.map((task: any) => (
            <TaskCard key={task.id} task={task} />
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage your assigned tasks and track progress
          </p>
        </div>
        <Button>
          <Plus size={16} className="mr-2" />
          New Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Filter:</span>
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'All Tasks', count: myTasks.length },
            { id: 'due-today', label: 'Due Today', count: myTasks.filter(t => {
              if (!t.dueDate) return false;
              return new Date(t.dueDate).toDateString() === new Date().toDateString();
            }).length },
            { id: 'overdue', label: 'Overdue', count: myTasks.filter(t => {
              if (!t.dueDate || t.status === 'Done') return false;
              return new Date(t.dueDate) < new Date();
            }).length },
            { id: 'high-priority', label: 'High Priority', count: myTasks.filter(t => t.priority === 'High').length }
          ].map((filter) => (
            <Button
              key={filter.id}
              variant={selectedFilter === filter.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(filter.id)}
              className="text-xs"
            >
              {filter.label}
              {filter.count > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs px-1">
                  {filter.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Task Views */}
      <Tabs defaultValue="kanban" className="w-full">
        <TabsList>
          <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="kanban" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatusColumn status="To Do" tasks={tasksByStatus['To Do']} />
            <StatusColumn status="In Progress" tasks={tasksByStatus['In Progress']} />
            <StatusColumn status="Done" tasks={tasksByStatus['Done']} />
          </div>
        </TabsContent>
        
        <TabsContent value="list" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} />
                {selectedFilter === 'all' ? 'All My Tasks' : filteredTasks.length + ' Filtered Tasks'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No tasks found</p>
                  <p className="text-sm">Try adjusting your filter or create a new task</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTasks.map((task: any) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{tasksByStatus['To Do'].length}</div>
            <div className="text-xs text-muted-foreground">To Do</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{tasksByStatus['In Progress'].length}</div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{tasksByStatus['Done'].length}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {myTasks.filter(t => {
                if (!t.dueDate || t.status === 'Done') return false;
                return new Date(t.dueDate) < new Date();
              }).length}
            </div>
            <div className="text-xs text-muted-foreground">Overdue</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}