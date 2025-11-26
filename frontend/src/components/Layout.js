import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Wallet, 
  UtensilsCrossed, 
  LogOut, 
  AlertCircle,
  BarChart3
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  const NavItem = ({ to, icon: Icon, label }) => (
    <Link to={to}>
      <Button 
        variant={isActive(to) ? "secondary" : "ghost"} 
        className="flex items-center gap-2"
      >
        <Icon size={18} />
        <span className="hidden md:inline">{label}</span>
      </Button>
    </Link>
  );

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 font-bold text-xl text-primary cursor-pointer" onClick={() => navigate('/')}>
          <UtensilsCrossed className="h-6 w-6" />
          <span>CredEat</span>
        </div>

        <div className="flex items-center gap-2">
          {user.role === 'student' && (
            <>
              <NavItem to="/student/dashboard" icon={LayoutDashboard} label="Meals" />
              <NavItem to="/student/wallet" icon={Wallet} label="Wallet" />
              <NavItem to="/student/complaints" icon={AlertCircle} label="Complaints" />
            </>
          )}
          
          {user.role === 'vendor' && (
            <>
              <NavItem to="/vendor/dashboard" icon={LayoutDashboard} label="Dashboard" />
            </>
          )}

          {user.role === 'admin' && (
            <>
              <NavItem to="/admin/dashboard" icon={BarChart3} label="Analytics" />
              <NavItem to="/admin/complaints" icon={AlertCircle} label="Complaints" />
            </>
          )}

          <div className="ml-4 flex items-center gap-4">
            <div className="text-sm text-muted-foreground hidden md:block">
              {user.full_name} ({user.role})
            </div>
            <Button variant="destructive" size="sm" onClick={logout}>
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Layout = () => {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Navbar />
      <main className="container py-6 px-4">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
