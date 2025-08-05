import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Flag,
  Plus
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
  const navigate = useNavigate();
  const [tasks, setTasks] = useKV('board-tasks', []);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Initialize with sample data if tasks are empty
  useEffect(() => {
    if (tasks.length === 0) {
      // Create sample tasks to demonstrate calendar functionality
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      const dayAfterTomorrow = new Date(today);
      dayAfterTomorrow.setDate(today.getDate() + 2);
      
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      
      const nextMonth = new Date(today);
      nextMonth.setMonth(today.getMonth() + 1);

      const sampleTasks = [
        {
          id: `sample-${Date.now()}-1`,
          title: "Team standup meeting",
          description: "Daily team sync to discuss progress and blockers",
          status: "To Do",
          priority: "Medium",
          dueDate: today.toISOString(),
          assignedTo: "current-user",
          tags: ["meeting", "team"],
          columnId: "todo"
        },
        {
          id: `sample-${Date.now()}-2`,
          title: "Complete project proposal",
          description: "Finalize the Q4 project proposal and send to stakeholders",
          status: "In Progress", 
          priority: "High",
          dueDate: tomorrow.toISOString(),
          assignedTo: "current-user",
          tags: ["proposal", "urgent"],
          columnId: "in-progress"
        },
        {
          id: `sample-${Date.now()}-3`,
          title: "Code review for authentication module",
          description: "Review pull request #123 for the new authentication system",
          status: "To Do",
          priority: "High",
          dueDate: dayAfterTomorrow.toISOString(),
          assignedTo: "current-user",
          tags: ["code-review", "security"],
          columnId: "todo"
        },
        {
          id: `sample-${Date.now()}-4`,
          title: "Update user documentation",
          description: "Revise user guide to reflect recent feature updates",
          status: "To Do",
          priority: "Low",
          dueDate: nextWeek.toISOString(),
          assignedTo: "current-user",
          tags: ["documentation"],
          columnId: "todo"
        },
        {
          id: `sample-${Date.now()}-5`,
          title: "Quarterly team retrospective",
          description: "Conduct Q3 retrospective meeting with the entire team",
          status: "To Do",
          priority: "Medium",
          dueDate: nextMonth.toISOString(),
          assignedTo: "current-user",
          tags: ["meeting", "retrospective"],
          columnId: "todo"
        },
        {
          id: `sample-${Date.now()}-6`,
          title: "Deploy to production",
          description: "Deploy version 2.1.0 to production environment",
          status: "Done",
          priority: "High",
          dueDate: new Date(today.getTime() - 86400000).toISOString(), // Yesterday
          assignedTo: "current-user",
          tags: ["deployment", "production"],
          columnId: "done"
        }
      ];

      setTasks(sampleTasks);
    }
  }, [tasks.length, setTasks]);

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
    const dueDate = new Date(task.dueDate);
    
    return (
      <Card className={cn(
        "transition-all duration-200 hover:shadow-md border-l-4 cursor-pointer",
        task.priority === 'High' || task.priority === 'URGENT' ? "border-l-red-500" :
        task.priority === 'Medium' || task.priority === 'MEDIUM' ? "border-l-orange-500" : "border-l-green-500",
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
                    {dueDate.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                {isOverdue && (
                  <Badge variant="destructive" className="text-xs">
                    OVERDUE
                  </Badge>
                )}
              </div>
              
              <Badge variant={
                task.priority === 'High' || task.priority === 'URGENT' ? 'destructive' :
                task.priority === 'Medium' || task.priority === 'MEDIUM' ? 'default' : 'secondary'
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

  // Generate calendar days for the current month view
  const getCalendarDays = () => {
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    
    const days: Date[] = [];
    
    // Add previous month's trailing days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(firstDayOfMonth);
      date.setDate(date.getDate() - (i + 1));
      days.push(date);
    }
    
    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    }
    
    // Add next month's leading days to complete the grid
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, day);
      days.push(date);
    }
    
    return days;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
          <p className="text-muted-foreground mt-1">
            View and organize your tasks by due dates
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">
            {tasks.filter((t: any) => t.dueDate).length} scheduled tasks
          </Badge>
          <Button onClick={() => navigate('/board')}>
            <Plus size={16} className="mr-2" />
            New Task
          </Button>
        </div>
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
            <CardContent className="p-0">
              {/* Custom Calendar Grid */}
              <div className="p-6">
                {/* Calendar Header */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="p-3 text-center text-sm font-semibold text-muted-foreground border-b">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {getCalendarDays().map((date, index) => {
                    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isSelected = date.toDateString() === selectedDate.toDateString();
                    const hasTasks = datesWithTasks.has(date.toDateString());
                    const dayTasks = getTasksForDate(date);
                    
                    return (
                      <div
                        key={index}
                        onClick={() => setSelectedDate(date)}
                        className={cn(
                          "relative p-2 h-20 border border-border/50 cursor-pointer transition-all duration-200 hover:bg-accent/50",
                          !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                          isSelected && "bg-primary text-primary-foreground",
                          isToday && !isSelected && "bg-accent ring-2 ring-primary/20"
                        )}
                      >
                        <div className="flex flex-col h-full">
                          <span className={cn(
                            "text-sm font-medium",
                            isToday && !isSelected && "text-primary font-bold"
                          )}>
                            {date.getDate()}
                          </span>
                          
                          {hasTasks && (
                            <div className="flex-1 mt-1 space-y-1 overflow-hidden">
                              {dayTasks.slice(0, 2).map((task: any, taskIndex) => (
                                <div
                                  key={taskIndex}
                                  className={cn(
                                    "text-xs px-1 py-0.5 rounded truncate",
                                    task.priority === 'High' ? "bg-red-100 text-red-800" :
                                    task.priority === 'Medium' ? "bg-orange-100 text-orange-800" :
                                    "bg-green-100 text-green-800",
                                    isSelected && "bg-white/20 text-white"
                                  )}
                                >
                                  {task.title}
                                </div>
                              ))}
                              {dayTasks.length > 2 && (
                                <div className={cn(
                                  "text-xs text-muted-foreground",
                                  isSelected && "text-white/70"
                                )}>
                                  +{dayTasks.length - 2} more
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-primary"></div>
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-accent ring-2 ring-primary/20"></div>
                    <span>Today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-green-100"></div>
                    <span>Has tasks</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Tasks */}
        <div className="space-y-6">
          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {selectedDateTasks.length} {selectedDateTasks.length === 1 ? 'task' : 'tasks'}
                </Badge>
              </div>
              {selectedDate.toDateString() === new Date().toDateString() && (
                <p className="text-sm text-primary font-medium">Today</p>
              )}
            </CardHeader>
            <CardContent>
              {selectedDateTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarBlank size={48} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm mb-3">No tasks scheduled for this date</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/board')}
                    className="text-xs"
                  >
                    <Plus size={14} className="mr-2" />
                    Add Task
                  </Button>
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
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Upcoming</CardTitle>
                <Badge variant="outline" className="text-xs">Next 7 days</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingTasks.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Clock size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No upcoming deadlines</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingTasks.slice(0, 5).map((task: any) => {
                    const daysUntilDue = Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    const isUrgent = daysUntilDue <= 1;
                    
                    return (
                      <div key={task.id} className={cn(
                        "border-l-4 pl-3 py-2 rounded-r-md transition-all hover:bg-accent/50",
                        isUrgent ? "border-l-red-500 bg-red-50/50" : "border-l-blue-500 bg-blue-50/50"
                      )}>
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">{task.title}</h4>
                          <Badge variant={
                            task.priority === 'High' ? 'destructive' :
                            task.priority === 'Medium' ? 'default' : 'outline'
                          } className="text-xs">
                            {task.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">
                            Due {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                          <div className={cn(
                            "text-xs font-medium",
                            isUrgent ? "text-red-600" : "text-blue-600"
                          )}>
                            {daysUntilDue === 0 ? 'Today' : 
                             daysUntilDue === 1 ? 'Tomorrow' : 
                             `${daysUntilDue} days`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {upcomingTasks.length > 5 && (
                    <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                      +{upcomingTasks.length - 5} more upcoming tasks
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
          <CardTitle className="flex items-center gap-2">
            <CalendarBlank size={20} />
            Month Overview - {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-6 border-2 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {tasks.filter((t: any) => {
                  if (!t.dueDate) return false;
                  const taskDate = new Date(t.dueDate);
                  return taskDate.getMonth() === currentMonth.getMonth() && 
                         taskDate.getFullYear() === currentMonth.getFullYear();
                }).length}
              </div>
              <div className="text-sm font-medium text-blue-700">Total Tasks</div>
            </div>
            
            <div className="text-center p-6 border-2 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {tasks.filter((t: any) => {
                  if (!t.dueDate) return false;
                  const taskDate = new Date(t.dueDate);
                  return taskDate.getMonth() === currentMonth.getMonth() && 
                         taskDate.getFullYear() === currentMonth.getFullYear() &&
                         t.status === 'Done';
                }).length}
              </div>
              <div className="text-sm font-medium text-green-700">Completed</div>
            </div>
            
            <div className="text-center p-6 border-2 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {tasks.filter((t: any) => {
                  if (!t.dueDate) return false;
                  const taskDate = new Date(t.dueDate);
                  return taskDate.getMonth() === currentMonth.getMonth() && 
                         taskDate.getFullYear() === currentMonth.getFullYear() &&
                         t.status === 'In Progress';
                }).length}
              </div>
              <div className="text-sm font-medium text-orange-700">In Progress</div>
            </div>
            
            <div className="text-center p-6 border-2 rounded-lg bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <div className="text-3xl font-bold text-red-600 mb-1">
                {tasks.filter((t: any) => {
                  if (!t.dueDate || t.status === 'Done') return false;
                  const taskDate = new Date(t.dueDate);
                  const now = new Date();
                  return taskDate < now && 
                         taskDate.getMonth() === currentMonth.getMonth() && 
                         taskDate.getFullYear() === currentMonth.getFullYear();
                }).length}
              </div>
              <div className="text-sm font-medium text-red-700">Overdue</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}