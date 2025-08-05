import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { mockWorkspace } from '@/lib/mock-data';
import { useAuth } from '@/lib/auth';
import { useKV } from '@github/spark/hooks';
import { 
  House, 
  Kanban, 
  Users, 
  Tag, 
  Calendar, 
  BarChart,
  Plus,
  ChevronDown,
  CheckSquare
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [lastActiveTab, setLastActiveTab] = useKV('sidebar-last-active', '/dashboard');
  
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

  const handleNavigation = (path: string) => {
    navigate(path);
    setLastActiveTab(path);
    onClose?.(); // Close mobile sidebar after navigation
  };

  const navigation = [
    { name: 'Dashboard', icon: House, path: '/dashboard' },
    { name: 'My Tasks', icon: CheckSquare, path: '/tasks' },
    { name: 'Calendar', icon: Calendar, path: '/calendar' },
    { name: 'Reports', icon: BarChart, path: '/reports' },
  ];

  // Check if current path matches navigation item
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "w-64 bg-card border-r flex flex-col h-full transition-transform duration-300 ease-in-out",
        "lg:translate-x-0", // Always visible on desktop
        isOpen ? "translate-x-0" : "-translate-x-full", // Toggle on mobile
        "fixed lg:relative z-50 lg:z-auto"
      )}>
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
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 transition-all duration-200",
                isActive(item.path) 
                  ? "bg-[#F4B8A3] text-white hover:bg-[#F4B8A3]/90" 
                  : "hover:bg-muted"
              )}
              onClick={() => handleNavigation(item.path)}
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
                  variant="ghost"
                  className={cn(
                    "w-full justify-start pl-8 text-sm transition-all duration-200",
                    location.pathname === '/board' 
                      ? "bg-[#F4B8A3] text-white hover:bg-[#F4B8A3]/90" 
                      : "hover:bg-muted"
                  )}
                  onClick={() => navigate('/board')}
                >
                  {board.name}
                </Button>
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start pl-8 text-sm text-muted-foreground gap-2 hover:bg-muted"
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
            <Button variant="ghost" className="w-full justify-start text-sm hover:bg-muted">
              My Tasks
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sm hover:bg-muted">
              Due Today
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sm hover:bg-muted">
              High Priority
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sm hover:bg-muted">
              Unassigned
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}