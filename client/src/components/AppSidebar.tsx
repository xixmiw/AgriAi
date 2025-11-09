import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'wouter';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Leaf,
  Wheat,
  Cloud,
  Info,
  Sprout,
  MessageSquare,
  UserCircle,
} from 'lucide-react';

const menuItems = [
  { path: '/', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { path: '/fields', icon: Wheat, labelKey: 'nav.fields' },
  { path: '/livestock', icon: Sprout, labelKey: 'nav.livestock' },
  { path: '/weather', icon: Cloud, labelKey: 'nav.weather' },
  { path: '/ai-chat', icon: MessageSquare, labelKey: 'AI Чат' },
  { path: '/profile', icon: UserCircle, labelKey: 'Профиль' },
  { path: '/about', icon: Info, labelKey: 'nav.about' },
];

export default function AppSidebar() {
  const { t } = useLanguage();
  const [location, setLocation] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
            <Leaf className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">AgriAI</h2>
            <p className="text-xs text-muted-foreground">Kazakhstan</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.dashboard')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => setLocation(item.path)}
                    isActive={location === item.path}
                    data-testid={`nav-${item.labelKey}`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{t(item.labelKey)}</span>
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
