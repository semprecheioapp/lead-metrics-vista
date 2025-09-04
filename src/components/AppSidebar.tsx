import { BarChart3, Users, AlertTriangle, Settings, Home, Shield, LogOut, Send, Calendar, MessageSquare, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "./UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const menuItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: Users, label: "Leads", path: "/leads" },
  { icon: Target, label: "Oportunidades", path: "/oportunidades" },
  { icon: Send, label: "Follow-up", path: "/follow-up" },
  { icon: Calendar, label: "Agendamentos", path: "/agendamentos" },
  { icon: MessageSquare, label: "WhatsApp", path: "/whatsapp" },
  { icon: Settings, label: "Configurações", path: "/configuracoes" },
];

export const AppSidebar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const { state } = useSidebar();
  const isSuperAdmin = user?.email === 'agenciambkautomacoes@gmail.com';
  const collapsed = state === "collapsed";
  const [loadingItem, setLoadingItem] = useState<string | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleNavClick = (path: string) => {
    setLoadingItem(path);
    setTimeout(() => setLoadingItem(null), 500);
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutDialog(false);
    signOut();
  };

  return (
    <Sidebar variant="inset" className="border-r border-border bg-sidebar-background">
      <SidebarHeader>
        <div className="flex items-center gap-2 p-3 sm:p-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer-slide"></div>
            <img 
              src="/lovable-uploads/885ae572-dec3-4868-92e1-8b1fcd6023e6.png" 
              alt="MBK" 
              className="w-5 h-5 object-contain relative z-10"
            />
          </div>
          {!collapsed && (
            <h1 className="text-base sm:text-lg font-bold text-sidebar-foreground">DashBoard_Mbk</h1>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                   <SidebarMenuButton
                     asChild
                     isActive={location.pathname === item.path}
                     tooltip={collapsed ? item.label : undefined}
                     className={cn(
                       "min-h-[44px] touch-target transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
                       loadingItem === item.path && "animate-pulse-glow"
                     )}
                   >
                       <Link 
                         to={item.path} 
                         onClick={() => handleNavClick(item.path)}
                         className={cn(
                           "flex items-center gap-3 w-full text-sidebar-foreground hover:text-sidebar-primary transition-all duration-300",
                           "hover:translate-x-1 relative overflow-hidden",
                           loadingItem === item.path && "nav-loading loading"
                         )}
                       >
                         <item.icon className={cn(
                           "w-4 h-4 flex-shrink-0 text-sidebar-foreground transition-all duration-300",
                           loadingItem === item.path && "animate-spin"
                         )} />
                         <span className="text-sm sm:text-base text-sidebar-foreground">{item.label}</span>
                       </Link>
                   </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isSuperAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                   <SidebarMenuButton
                     asChild
                     isActive={location.pathname === '/super-admin'}
                     tooltip={collapsed ? "Super Admin" : undefined}
                     className={cn(
                       "transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
                       loadingItem === '/super-admin' && "animate-pulse-glow"
                     )}
                   >
                      <Link 
                        to="/super-admin" 
                        onClick={() => handleNavClick('/super-admin')}
                        className={cn(
                          "flex items-center gap-3 text-sidebar-foreground hover:text-sidebar-primary transition-all duration-300",
                          "hover:translate-x-1 relative overflow-hidden",
                          loadingItem === '/super-admin' && "nav-loading loading"
                        )}
                      >
                        <Shield className={cn(
                          "w-4 h-4 text-sidebar-foreground transition-all duration-300",
                          loadingItem === '/super-admin' && "animate-spin"
                        )} />
                        <span className="text-sidebar-foreground">Super Admin</span>
                      </Link>
                   </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                   <SidebarMenuButton
                     asChild
                     isActive={location.pathname === '/logs'}
                     tooltip={collapsed ? "Logs" : undefined}
                     className={cn(
                       "transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
                       loadingItem === '/logs' && "animate-pulse-glow"
                     )}
                   >
                      <Link 
                        to="/logs" 
                        onClick={() => handleNavClick('/logs')}
                        className={cn(
                          "flex items-center gap-3 text-sidebar-foreground hover:text-sidebar-primary transition-all duration-300",
                          "hover:translate-x-1 relative overflow-hidden",
                          loadingItem === '/logs' && "nav-loading loading"
                        )}
                      >
                        <AlertTriangle className={cn(
                          "w-4 h-4 text-sidebar-foreground transition-all duration-300",
                          loadingItem === '/logs' && "animate-spin"
                        )} />
                        <span className="text-sidebar-foreground">Logs</span>
                      </Link>
                   </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <div className="p-2 border-t border-border">
          {!collapsed && (
            <div className="mb-3 px-2">
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          )}
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogoutClick}
                tooltip={collapsed ? "Sair" : undefined}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full justify-start"
              >
                <LogOut className="w-4 h-4" />
                {!collapsed && <span className="ml-2">Sair</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarFooter>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Confirmar Saída
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja sair? Você precisará fazer login novamente para acessar o sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowLogoutDialog(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sim, Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  );
};