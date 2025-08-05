import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useKV } from '@github/spark/hooks';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp,
  ChartBar,
  Clock,
  Users,
  Target,
  Calendar as CalendarIcon
} from '@phosphor-icons/react';

export function Reports() {
  const [tasks] = useKV('board-tasks', []);
  const [timeRange, setTimeRange] = useState('30d');

  // Calculate various metrics
  const getMetrics = () => {
    const now = new Date();
    const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(now.getDate() - daysAgo);

    const filteredTasks = tasks.filter((task: any) => {
      const createdDate = task.createdAt ? new Date(task.createdAt) : new Date();
      return createdDate >= startDate;
    });

    const completedTasks = filteredTasks.filter((task: any) => task.status === 'Done');
    const totalTasks = filteredTasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

    return {
      totalTasks,
      completedTasks: completedTasks.length,
      completionRate,
      inProgress: filteredTasks.filter((task: any) => task.status === 'In Progress').length,
      overdue: filteredTasks.filter((task: any) => {
        if (!task.dueDate || task.status === 'Done') return false;
        return new Date(task.dueDate) < now;
      }).length
    };
  };

  // Tasks completed over time
  const getTasksOverTime = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      const completed = tasks.filter((task: any) => {
        if (task.status !== 'Done') return false;
        const completedDate = task.completedAt ? new Date(task.completedAt) : new Date();
        return completedDate >= dayStart && completedDate <= dayEnd;
      }).length;
      
      const created = tasks.filter((task: any) => {
        const createdDate = task.createdAt ? new Date(task.createdAt) : new Date();
        return createdDate >= dayStart && createdDate <= dayEnd;
      }).length;

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completed,
        created
      });
    }
    
    return data;
  };

  // Task distribution by status
  const getStatusDistribution = () => {
    const statusCounts = {
      'To Do': 0,
      'In Progress': 0,
      'Done': 0
    };

    tasks.forEach((task: any) => {
      if (statusCounts[task.status as keyof typeof statusCounts] !== undefined) {
        statusCounts[task.status as keyof typeof statusCounts]++;
      }
    });

    return [
      { name: 'To Do', value: statusCounts['To Do'], color: '#ef4444' },
      { name: 'In Progress', value: statusCounts['In Progress'], color: '#f97316' },
      { name: 'Done', value: statusCounts['Done'], color: '#22c55e' }
    ];
  };

  // Task distribution by priority
  const getPriorityDistribution = () => {
    const priorityCounts = { High: 0, Medium: 0, Low: 0 };
    
    tasks.forEach((task: any) => {
      if (priorityCounts[task.priority as keyof typeof priorityCounts] !== undefined) {
        priorityCounts[task.priority as keyof typeof priorityCounts]++;
      }
    });

    return [
      { name: 'High', value: priorityCounts.High, color: '#dc2626' },
      { name: 'Medium', value: priorityCounts.Medium, color: '#ea580c' },
      { name: 'Low', value: priorityCounts.Low, color: '#16a34a' }
    ];
  };

  // Productivity metrics
  const getProductivityMetrics = () => {
    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);
    
    const thisWeekCompleted = tasks.filter((task: any) => {
      if (task.status !== 'Done') return false;
      const completedDate = task.completedAt ? new Date(task.completedAt) : new Date();
      return completedDate >= weekAgo;
    }).length;

    const prevWeekStart = new Date();
    prevWeekStart.setDate(now.getDate() - 14);
    const prevWeekEnd = new Date();
    prevWeekEnd.setDate(now.getDate() - 7);
    
    const lastWeekCompleted = tasks.filter((task: any) => {
      if (task.status !== 'Done') return false;
      const completedDate = task.completedAt ? new Date(task.completedAt) : new Date();
      return completedDate >= prevWeekStart && completedDate < prevWeekEnd;
    }).length;

    const weeklyChange = lastWeekCompleted > 0 
      ? ((thisWeekCompleted - lastWeekCompleted) / lastWeekCompleted) * 100 
      : thisWeekCompleted > 0 ? 100 : 0;

    return {
      thisWeek: thisWeekCompleted,
      lastWeek: lastWeekCompleted,
      change: weeklyChange
    };
  };

  const metrics = getMetrics();
  const tasksOverTime = getTasksOverTime();
  const statusDistribution = getStatusDistribution();
  const priorityDistribution = getPriorityDistribution();
  const productivity = getProductivityMetrics();

  const COLORS = ['#ef4444', '#f97316', '#22c55e'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1">
            Analyze your team's productivity and task completion trends
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <Target size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Tasks
                </p>
                <p className="text-2xl font-bold">{metrics.totalTasks}</p>
                <p className="text-xs text-muted-foreground">
                  {timeRange === '7d' ? 'Last 7 days' : timeRange === '30d' ? 'Last 30 days' : 'Last 90 days'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-green-50">
                <TrendingUp size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completion Rate
                </p>
                <p className="text-2xl font-bold">{Math.round(metrics.completionRate)}%</p>
                <p className="text-xs text-muted-foreground">
                  {metrics.completedTasks} completed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-orange-50">
                <Clock size={24} className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  In Progress
                </p>
                <p className="text-2xl font-bold">{metrics.inProgress}</p>
                <p className="text-xs text-muted-foreground">
                  Active tasks
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-red-50">
                <CalendarIcon size={24} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Overdue
                </p>
                <p className="text-2xl font-bold">{metrics.overdue}</p>
                <p className="text-xs text-muted-foreground">
                  Need attention
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBar size={20} />
              Tasks Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={tasksOverTime}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stackId="1"
                  stroke="#22c55e"
                  fillOpacity={1}
                  fill="url(#colorCompleted)"
                />
                <Area
                  type="monotone"
                  dataKey="created"
                  stackId="1"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorCreated)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={priorityDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Productivity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={20} />
              Weekly Productivity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">This Week</span>
                <Badge variant="default" className="text-lg px-3 py-1">
                  {productivity.thisWeek}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Week</span>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {productivity.lastWeek}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Change</span>
                <Badge 
                  variant={productivity.change >= 0 ? "default" : "destructive"}
                  className="text-lg px-3 py-1"
                >
                  {productivity.change >= 0 ? '+' : ''}{Math.round(productivity.change)}%
                </Badge>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  {productivity.change >= 0 
                    ? '📈 Great improvement from last week!' 
                    : '📉 Focus on completing more tasks this week'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-sm mb-2">🎯 Completion Rate</h4>
              <p className="text-xs text-muted-foreground">
                {metrics.completionRate >= 80 
                  ? 'Excellent! Your team is highly productive.'
                  : metrics.completionRate >= 60
                  ? 'Good completion rate. Room for improvement.'
                  : 'Consider reviewing task allocation and priorities.'}
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-sm mb-2">⏰ Time Management</h4>
              <p className="text-xs text-muted-foreground">
                {metrics.overdue === 0 
                  ? 'Perfect! No overdue tasks.'
                  : `${metrics.overdue} overdue tasks need immediate attention.`}
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-sm mb-2">📊 Productivity Trend</h4>
              <p className="text-xs text-muted-foreground">
                {productivity.change >= 0 
                  ? `Productivity improved by ${Math.round(productivity.change)}% this week.`
                  : `Productivity decreased by ${Math.round(Math.abs(productivity.change))}% this week.`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}