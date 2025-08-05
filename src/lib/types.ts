export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  members: WorkspaceMember[];
  boards: Board[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  user: User;
  workspaceId: string;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: Date;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  workspaceId: string;
  workspace: Workspace;
  columns: Column[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Column {
  id: string;
  name: string;
  position: number;
  boardId: string;
  board: Board;
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: string;
  columnId: string;
  column: Column;
  assigneeId?: string;
  assignee?: User;
  creatorId: string;
  creator: User;
  dueDate?: Date;
  tags: Tag[];
  comments: Comment[];
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  workspaceId: string;
  workspace: Workspace;
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  task: Task;
  authorId: string;
  author: User;
  createdAt: Date;
  updatedAt: Date;
}

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface DraggedTask {
  task: Task;
  sourceColumnId: string;
  sourceIndex: number;
}

// Real-time events
export interface SocketEvents {
  'task:update': Task;
  'task:move': {
    taskId: string;
    sourceColumnId: string;
    targetColumnId: string;
    newPosition: number;
  };
  'task:create': Task;
  'task:delete': string;
  'column:update': Column;
  'user:typing': {
    userId: string;
    taskId: string;
    isTyping: boolean;
  };
}