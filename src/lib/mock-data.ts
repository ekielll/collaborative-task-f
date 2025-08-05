import { User, Workspace, Board, Column, Task, Tag, Priority } from '@/lib/types';

// Mock users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice'
  },
  {
    id: 'user-2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob'
  },
  {
    id: 'user-3',
    name: 'Carol Davis',
    email: 'carol@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol'
  }
];

// Mock tags
export const mockTags: Tag[] = [
  { id: 'tag-1', name: 'Frontend', color: '#3B82F6', workspaceId: 'workspace-1', workspace: {} as Workspace },
  { id: 'tag-2', name: 'Backend', color: '#10B981', workspaceId: 'workspace-1', workspace: {} as Workspace },
  { id: 'tag-3', name: 'Bug', color: '#EF4444', workspaceId: 'workspace-1', workspace: {} as Workspace },
  { id: 'tag-4', name: 'Feature', color: '#8B5CF6', workspaceId: 'workspace-1', workspace: {} as Workspace },
  { id: 'tag-5', name: 'Design', color: '#F59E0B', workspaceId: 'workspace-1', workspace: {} as Workspace }
];

// Mock tasks
export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Design new dashboard layout',
    description: 'Create wireframes and mockups for the updated dashboard interface with improved navigation',
    priority: 'HIGH' as Priority,
    status: 'In Progress',
    columnId: 'column-2',
    column: {} as Column,
    assigneeId: 'user-1',
    assignee: mockUsers[0],
    creatorId: 'user-2',
    creator: mockUsers[1],
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    tags: [mockTags[4], mockTags[3]],
    comments: [],
    position: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'task-2',
    title: 'Fix authentication bug',
    description: 'Users are unable to log in with special characters in password',
    priority: 'URGENT' as Priority,
    status: 'To Do',
    columnId: 'column-1',
    column: {} as Column,
    assigneeId: 'user-2',
    assignee: mockUsers[1],
    creatorId: 'user-1',
    creator: mockUsers[0],
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    tags: [mockTags[2], mockTags[1]],
    comments: [],
    position: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'task-3',
    title: 'Implement real-time notifications',
    description: 'Add WebSocket support for live notifications across the application',
    priority: 'MEDIUM' as Priority,
    status: 'To Do',
    columnId: 'column-1',
    column: {} as Column,
    assigneeId: 'user-3',
    assignee: mockUsers[2],
    creatorId: 'user-1',
    creator: mockUsers[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    tags: [mockTags[1], mockTags[3]],
    comments: [],
    position: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'task-4',
    title: 'Update user documentation',
    description: 'Revise help documents to reflect recent feature changes',
    priority: 'LOW' as Priority,
    status: 'Done',
    columnId: 'column-4',
    column: {} as Column,
    assigneeId: 'user-1',
    assignee: mockUsers[0],
    creatorId: 'user-3',
    creator: mockUsers[2],
    tags: [],
    comments: [],
    position: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'task-5',
    title: 'Optimize database queries',
    description: 'Review and improve slow queries in the reporting module',
    priority: 'MEDIUM' as Priority,
    status: 'Review',
    columnId: 'column-3',
    column: {} as Column,
    assigneeId: 'user-2',
    assignee: mockUsers[1],
    creatorId: 'user-2',
    creator: mockUsers[1],
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    tags: [mockTags[1]],
    comments: [],
    position: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Mock columns
export const mockColumns: Column[] = [
  {
    id: 'column-1',
    name: 'To Do',
    position: 0,
    boardId: 'board-1',
    board: {} as Board,
    tasks: mockTasks.filter(task => task.columnId === 'column-1'),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'column-2',
    name: 'In Progress',
    position: 1,
    boardId: 'board-1',
    board: {} as Board,
    tasks: mockTasks.filter(task => task.columnId === 'column-2'),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'column-3',
    name: 'Review',
    position: 2,
    boardId: 'board-1',
    board: {} as Board,
    tasks: mockTasks.filter(task => task.columnId === 'column-3'),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'column-4',
    name: 'Done',
    position: 3,
    boardId: 'board-1',
    board: {} as Board,
    tasks: mockTasks.filter(task => task.columnId === 'column-4'),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Mock board
export const mockBoard: Board = {
  id: 'board-1',
  name: 'Product Development',
  description: 'Main product development board for tracking features and bugs',
  workspaceId: 'workspace-1',
  workspace: {} as Workspace,
  columns: mockColumns,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Mock workspace
export const mockWorkspace: Workspace = {
  id: 'workspace-1',
  name: 'Acme Corporation',
  description: 'Main workspace for Acme Corporation team collaboration',
  members: [
    {
      id: 'member-1',
      userId: 'user-1',
      user: mockUsers[0],
      workspaceId: 'workspace-1',
      role: 'ADMIN',
      joinedAt: new Date()
    },
    {
      id: 'member-2',
      userId: 'user-2',
      user: mockUsers[1],
      workspaceId: 'workspace-1',
      role: 'MEMBER',
      joinedAt: new Date()
    },
    {
      id: 'member-3',
      userId: 'user-3',
      user: mockUsers[2],
      workspaceId: 'workspace-1',
      role: 'MEMBER',
      joinedAt: new Date()
    }
  ],
  boards: [mockBoard],
  createdAt: new Date(),
  updatedAt: new Date()
};