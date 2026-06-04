import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Vote, LogOut, Shield, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={isAdmin ? '/admin' : '/voter'} className="flex items-center space-x-2">
            <div className="bg-gradient-primary p-2 rounded-lg">
              <Vote className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">VOTEin</span>
          </Link>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-secondary rounded-lg">
              {isAdmin ? (
                <Shield className="h-4 w-4 text-primary" />
              ) : (
                <User className="h-4 w-4 text-primary" />
              )}
              <span className="text-sm font-medium text-foreground">{user?.username}</span>
              <span className="text-xs text-muted-foreground">({isAdmin ? 'Admin' : 'Voter'})</span>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
