import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useKV } from '@github/spark/hooks';
import { 
  CalendarCheck, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Users
} from '@phosphor-icons/react';

interface TaskStats {
  total: number;
  inProgress: number;
  completed: number;
  overdue: number;
  completionRate: number;
}

export function Dashboard() {
  const [tasks] = useKV('board-tasks', []);
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    completionRate: 0
  });

  useEffect(() => {
    const now = new Date();
    const total = tasks.length;
    const completed = tasks.filter((task: any) => task.status === 'Done').length;
    const inProgress = tasks.filter((task: any) => task.status === 'In Progress').length;
    const overdue = tasks.filter((task: any) => {
      if (!task.dueDate) return false;
      return new Date(task.dueDate) < now && task.status !== 'Done';
    }).length;
    
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    setStats({
      total,
      inProgress,
      completed,
      overdue,
      completionRate
    });
  }, [tasks]);

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      icon: CalendarCheck,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      title: 'Overdue',
      value: stats.overdue,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50'
    }
  ];

  const recentTasks = tasks
    .filter((task: any) => task.status !== 'Done')
    .sort((a: any, b: any) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your tasks and team productivity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon size={24} className={stat.color} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={20} />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span className="font-medium">{Math.round(stats.completionRate)}%</span>
              </div>
              <Progress value={stats.completionRate} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {stats.completed} of {stats.total} tasks completed
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Team Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={20} />
              Team Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Recent activity from your team members
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tasks created today</span>
                  <Badge variant="secondary">3</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tasks completed today</span>
                  <Badge variant="secondary">{stats.completed}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active team members</span>
                  <Badge variant="secondary">4</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarCheck size={48} className="mx-auto mb-4 opacity-50" />
              <p>No upcoming tasks</p>
              <p className="text-sm">All caught up! 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((task: any) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{task.title}</h4>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={
                      task.priority === 'High' ? 'destructive' :
                      task.priority === 'Medium' ? 'default' : 'secondary'
                    }>
                      {task.priority}
                    </Badge>
                    <Badge variant="outline">
                      {task.status}
                    </Badge>
                    {task.dueDate && (
                      <span className="text-xs text-muted-foreground">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}