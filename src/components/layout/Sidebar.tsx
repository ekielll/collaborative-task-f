import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { mockWorkspace } from '@/lib/mock-data';
import { useAuth } from '@/lib/auth';
import { 
  House, 
  Kanban, 
  Users, 
  Tag, 
  Calendar, 
  BarChart,
  Plus,
  ChevronDown
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  selectedBoard?: string;
  onBoardSelect?: (boardId: string) => void;
}

export function Sidebar({ selectedBoard, onBoardSelect }: SidebarProps) {
  const { user } = useAuth();
  const [expandedSections, setExpandedSections] = useState({
    workspace: true,
    boards: true,
    team: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const navigation = [
    { name: 'Dashboard', icon: House, href: '#', current: false },
    { name: 'My Tasks', icon: Kanban, href: '#', current: false },
    { name: 'Calendar', icon: Calendar, href: '#', current: false },
    { name: 'Reports', icon: BarChart, href: '#', current: false },
  ];

  return (
    <div className="w-64 bg-card border-r flex flex-col h-full">
      {/* Workspace Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-semibold text-sm">
              {mockWorkspace.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{mockWorkspace.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {mockWorkspace.members.length} members
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-1">
          {navigation.map((item) => (
            <Button
              key={item.name}
              variant={item.current ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3",
                item.current && "bg-secondary"
              )}
            >
              <item.icon size={18} />
              {item.name}
            </Button>
          ))}
        </div>

        <Separator />

        {/* Boards Section */}
        <div className="p-4">
          <Button
            variant="ghost"
            className="w-full justify-between p-2 h-auto"
            onClick={() => toggleSection('boards')}
          >
            <div className="flex items-center gap-2">
              <Kanban size={16} />
              <span className="font-medium">Boards</span>
            </div>
            <ChevronDown 
              size={16} 
              className={cn(
                "transition-transform",
                expandedSections.boards ? "rotate-180" : ""
              )}
            />
          </Button>
          
          {expandedSections.boards && (
            <div className="mt-2 space-y-1">
              {mockWorkspace.boards.map((board) => (
                <Button
                  key={board.id}
                  variant={selectedBoard === board.id ? "secondary" : "ghost"}
                  className="w-full justify-start pl-8 text-sm"
                  onClick={() => onBoardSelect?.(board.id)}
                >
                  {board.name}
                </Button>
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start pl-8 text-sm text-muted-foreground gap-2"
              >
                <Plus size={14} />
                Add board
              </Button>
            </div>
          )}
        </div>

        <Separator />

        {/* Team Section */}
        <div className="p-4">
          <Button
            variant="ghost"
            className="w-full justify-between p-2 h-auto"
            onClick={() => toggleSection('team')}
          >
            <div className="flex items-center gap-2">
              <Users size={16} />
              <span className="font-medium">Team</span>
            </div>
            <ChevronDown 
              size={16} 
              className={cn(
                "transition-transform",
                expandedSections.team ? "rotate-180" : ""
              )}
            />
          </Button>
          
          {expandedSections.team && (
            <div className="mt-2 space-y-2">
              {mockWorkspace.members.map((member) => (
                <div key={member.id} className="flex items-center gap-3 px-2 py-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={member.user.avatar} />
                    <AvatarFallback className="text-xs">
                      {member.user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{member.user.name}</p>
                  </div>
                  {member.role === 'ADMIN' && (
                    <Badge variant="secondary" className="text-xs">
                      Admin
                    </Badge>
                  )}
                </div>
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start pl-2 text-sm text-muted-foreground gap-2"
              >
                <Plus size={14} />
                Invite member
              </Button>
            </div>
          )}
        </div>

        <Separator />

        {/* Quick Filters */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Tag size={16} />
            <span className="font-medium text-sm">Quick Filters</span>
          </div>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start text-sm">
              My Tasks
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sm">
              Due Today
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sm">
              High Priority
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sm">
              Unassigned
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}