import React from "react";
import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppSidebar from "@/components/AppSidebar";
import LanguageSelector from "@/components/LanguageSelector";
import ThemeToggle from "@/components/ThemeToggle";
import Dashboard from "@/pages/Dashboard";
import Fields from "@/pages/Fields";
import Livestock from "@/pages/Livestock";
import Weather from "@/pages/Weather";
import Recommendations from "@/pages/Recommendations";
import Simulation from "@/pages/Simulation";
import About from "@/pages/About";
import AIChat from "@/pages/AIChat";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return <Component />;
}

function Router() {
  const { user, logout } = useAuth();

  return (
    <Switch>
      <Route path="/auth" component={Auth} />
      <Route path="/">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/fields">
        {() => <ProtectedRoute component={Fields} />}
      </Route>
      <Route path="/livestock">
        {() => <ProtectedRoute component={Livestock} />}
      </Route>
      <Route path="/weather">
        {() => <ProtectedRoute component={Weather} />}
      </Route>
      <Route path="/recommendations">
        {() => <ProtectedRoute component={Recommendations} />}
      </Route>
      <Route path="/ai-chat">
        {() => <ProtectedRoute component={AIChat} />}
      </Route>
      <Route path="/simulation">
        {() => <ProtectedRoute component={Simulation} />}
      </Route>
      <Route path="/about">
        {() => <ProtectedRoute component={About} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { user, logout, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  React.useEffect(() => {
    if (!isLoading && !user && location !== "/auth") {
      setLocation("/auth");
    }
  }, [user, isLoading, location, setLocation]);

  if (location === "/auth") {
    return <Router />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user.fullName || user.username} ({user.role})
              </span>
              <LanguageSelector />
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={logout}>
                Выход
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Router />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <AppContent />
              <Toaster />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
