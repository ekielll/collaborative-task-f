import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useKV } from '@github/spark/hooks';
import { 
  CalendarBlank,
  CaretLeft,
  CaretRight,
  Clock,
  Flag
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface CalendarTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string;
  description?: string;
}

export function CalendarView() {
  const [tasks] = useKV('board-tasks', []);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get tasks for the selected date
  const getTasksForDate = (date: Date) => {
    return tasks.filter((task: any) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  // Get all dates that have tasks in the current month
  const getDatesWithTasks = () => {
    const datesWithTasks = new Set<string>();
    tasks.forEach((task: any) => {
      if (task.dueDate) {
        const taskDate = new Date(task.dueDate);
        if (taskDate.getMonth() === currentMonth.getMonth() && 
            taskDate.getFullYear() === currentMonth.getFullYear()) {
          datesWithTasks.add(taskDate.toDateString());
        }
      }
    });
    return datesWithTasks;
  };

  const selectedDateTasks = getTasksForDate(selectedDate);
  const datesWithTasks = getDatesWithTasks();

  // Navigate months
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const TaskCard = ({ task }: { task: CalendarTask }) => {
    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Done';
    
    return (
      <Card className={cn(
        "transition-all duration-200 hover:shadow-md border-l-4",
        task.priority === 'High' ? "border-l-red-500" :
        task.priority === 'Medium' ? "border-l-orange-500" : "border-l-green-500",
        isOverdue && "bg-red-50 border border-red-200"
      )}>
        <CardContent className="p-3">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h4 className="font-medium text-sm">{task.title}</h4>
              <div className="flex items-center gap-1">
                <Badge variant={
                  task.status === 'Done' ? 'default' :
                  task.status === 'In Progress' ? 'secondary' : 'outline'
                } className="text-xs">
                  {task.status}
                </Badge>
              </div>
            </div>
            
            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "flex items-center gap-1 text-xs",
                  isOverdue ? "text-red-600" : "text-muted-foreground"
                )}>
                  <Clock size={12} />
                  <span>
                    {new Date(task.dueDate).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
              
              <Badge variant={
                task.priority === 'High' ? 'destructive' :
                task.priority === 'Medium' ? 'default' : 'secondary'
              } className="text-xs">
                <Flag size={10} className="mr-1" />
                {task.priority}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Get upcoming tasks (next 7 days)
  const getUpcomingTasks = () => {
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);
    
    return tasks
      .filter((task: any) => {
        if (!task.dueDate || task.status === 'Done') return false;
        const taskDate = new Date(task.dueDate);
        return taskDate >= now && taskDate <= sevenDaysFromNow;
      })
      .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  const upcomingTasks = getUpcomingTasks();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
        <p className="text-muted-foreground mt-1">
          View your tasks organized by due dates
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarBlank size={20} />
                  {currentMonth.toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                  >
                    <CaretLeft size={16} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const today = new Date();
                      setCurrentMonth(today);
                      setSelectedDate(today);
                    }}
                  >
                    Today
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigateMonth('next')}
                  >
                    <CaretRight size={16} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                className="rounded-md border"
                modifiers={{
                  hasTasks: (date) => datesWithTasks.has(date.toDateString())
                }}
                modifiersStyles={{
                  hasTasks: { 
                    backgroundColor: 'oklch(0.7 0.15 45)',
                    color: 'white',
                    fontWeight: 'bold'
                  }
                }}
              />
              <div className="mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent"></div>
                  <span>Dates with tasks</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Tasks */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateTasks.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <CalendarBlank size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No tasks for this date</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDateTasks.map((task: any) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming (Next 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingTasks.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Clock size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No upcoming tasks</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingTasks.slice(0, 5).map((task: any) => (
                    <div key={task.id} className="border-l-2 border-accent pl-3 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{task.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {task.priority}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {upcomingTasks.length > 5 && (
                    <div className="text-xs text-muted-foreground text-center pt-2">
                      +{upcomingTasks.length - 5} more tasks
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Month Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Month Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {tasks.filter((t: any) => {
                  if (!t.dueDate) return false;
                  const taskDate = new Date(t.dueDate);
                  return taskDate.getMonth() === currentMonth.getMonth() && 
                         taskDate.getFullYear() === currentMonth.getFullYear();
                }).length}
              </div>
              <div className="text-sm text-muted-foreground">Total Tasks</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {tasks.filter((t: any) => {
                  if (!t.dueDate) return false;
                  const taskDate = new Date(t.dueDate);
                  return taskDate.getMonth() === currentMonth.getMonth() && 
                         taskDate.getFullYear() === currentMonth.getFullYear() &&
                         t.status === 'Done';
                }).length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {tasks.filter((t: any) => {
                  if (!t.dueDate) return false;
                  const taskDate = new Date(t.dueDate);
                  return taskDate.getMonth() === currentMonth.getMonth() && 
                         taskDate.getFullYear() === currentMonth.getFullYear() &&
                         t.status === 'In Progress';
                }).length}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {tasks.filter((t: any) => {
                  if (!t.dueDate || t.status === 'Done') return false;
                  const taskDate = new Date(t.dueDate);
                  const now = new Date();
                  return taskDate < now && 
                         taskDate.getMonth() === currentMonth.getMonth() && 
                         taskDate.getFullYear() === currentMonth.getFullYear();
                }).length}
              </div>
              <div className="text-sm text-muted-foreground">Overdue</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}