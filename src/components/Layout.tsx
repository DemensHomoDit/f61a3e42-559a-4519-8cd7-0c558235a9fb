import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";
import { Building2, Bell, Settings, User, Sparkles, Plus, Menu as MenuIcon, LogOut, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getObjects, getUsers, getTasks, setAuthToken } from "@/api/client";
import { useSidebar } from "@/contexts/SidebarContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { isExpanded, toggleSidebar } = useSidebar();
  const { user, logout: authLogout } = useAuth();
  const { getRoleName } = usePermissions();
  
  const { data: objects = [] } = useQuery({ queryKey: ["objects"], queryFn: getObjects });
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: getUsers });
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: getTasks });

  const [q, setQ] = useState("");
  const matches = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [] as { type: string; label: string; to: string }[];
    const res: { type: string; label: string; to: string }[] = [];
    (objects as any[]).forEach(o=>{ if((o.name||'').toLowerCase().includes(query)) res.push({type:'Объект', label:o.name, to:`/objects/${o.id}`}); });
    (users as any[]).forEach(u=>{ if((u.full_name||'').toLowerCase().includes(query)) res.push({type:'Сотрудник', label:u.full_name, to:`/people/${u.id}`}); });
    (tasks as any[]).forEach(t=>{ if((t.title||'').toLowerCase().includes(query)) res.push({type:'Задача', label:t.title, to:`/tasks/${t.id}`}); });
    return res.slice(0,8);
  }, [q, objects, users, tasks]);

  const handleLogout = () => {
    authLogout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex w-full">
      <AppSidebar />
      <div className="flex flex-col flex-1 transition-all duration-300" style={{ marginLeft: isExpanded ? '280px' : '80px' }}>
        <header className="h-16 glass-effect border-b border-border/20 px-6 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={toggleSidebar}>
              <MenuIcon className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 max-w-2xl mx-8 relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Поиск объектов, сотрудников, задач..." 
                value={q} 
                onChange={(e) => setQ(e.target.value)}
                className="pl-12 bg-white/80 backdrop-blur-sm border-nature-morning-mist"
              />
            </div>
            {q && matches.length > 0 && (
              <div className="absolute top-full mt-2 w-full glass-effect border border-border/20 rounded-2xl p-2 max-h-60 overflow-y-auto z-50">
                {matches.map((match, idx) => (
                  <Link key={idx} to={match.to} onClick={() => setQ("")} className="flex items-center gap-3 p-3 hover:bg-nature-morning-mist/50 rounded-xl">
                    <Badge variant="secondary">{match.type}</Badge>
                    <span>{match.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
            
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="btn-nature">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="glass-effect border-border/20 z-50">
                <DropdownMenuItem onClick={() => navigate('/objects')}>Новый объект</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/tasks')}>Новая задача</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{user?.full_name?.charAt(0) || 'П'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="glass-effect border-border/20 w-64 z-50">
                <div className="p-4 border-b">
                  <p className="font-medium">{user?.full_name || 'Пользователь'}</p>
                  <Badge variant="outline">{user?.role ? getRoleName(user.role) : 'Роль не назначена'}</Badge>
                </div>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-8">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}

export default Layout;