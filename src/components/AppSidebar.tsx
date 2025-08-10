import { 
  BarChart3, 
  Building, 
  CheckSquare, 
  DollarSign, 
  Users, 
  Package, 
  Truck, 
  Brain,
  Home
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Дашборд", url: "/", icon: Home },
  { title: "Объекты", url: "/objects", icon: Building },
  { title: "Задачи", url: "/tasks", icon: CheckSquare },
  { title: "Финансы", url: "/finances", icon: DollarSign },
  { title: "Сотрудники", url: "/people", icon: Users },
  { title: "Материалы", url: "/materials", icon: Package },
  { title: "Подрядчики", url: "/contractors", icon: Truck },
  { title: "Аналитика", url: "/analytics", icon: Brain },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-primary-foreground font-medium shadow-construction" 
      : "hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-smooth";

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-gradient-subtle border-r border-border/50">
        <SidebarGroup>
          <SidebarGroupLabel className="text-construction-gray font-medium">
            Управление
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span className="ml-3">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}