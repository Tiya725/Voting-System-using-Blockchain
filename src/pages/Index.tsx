import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Vote, Shield, Lock, CheckCircle } from 'lucide-react';

const Index = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(isAdmin ? '/admin' : '/voter');
    }
  }, [user, isAdmin, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-primary p-6 rounded-2xl shadow-lg">
              <Vote className="h-16 w-16 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Welcome to <span className="bg-gradient-primary bg-clip-text text-transparent">VOTEin</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            A secure, transparent, and decentralized voting system powered by blockchain technology
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/login')}
              className="bg-gradient-primary hover:opacity-90 transition-opacity text-lg px-8"
            >
              Sign In
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/register')}
              className="text-lg px-8"
            >
              Create Account
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="bg-card p-8 rounded-xl shadow-card border border-border text-center hover:shadow-lg transition-shadow">
            <div className="bg-gradient-primary p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Secure & Private</h3>
            <p className="text-muted-foreground">
              Your vote is encrypted and secured using blockchain technology, ensuring complete privacy and security
            </p>
          </div>

          <div className="bg-card p-8 rounded-xl shadow-card border border-border text-center hover:shadow-lg transition-shadow">
            <div className="bg-gradient-success p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-success-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Transparent</h3>
            <p className="text-muted-foreground">
              All votes are recorded on the blockchain, providing an immutable and transparent record of the election
            </p>
          </div>

          <div className="bg-card p-8 rounded-xl shadow-card border border-border text-center hover:shadow-lg transition-shadow">
            <div className="bg-gradient-primary p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Decentralized</h3>
            <p className="text-muted-foreground">
              No single authority controls the system, ensuring fair and unbiased elections at all levels
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center bg-gradient-primary p-12 rounded-2xl shadow-lg">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Ready to participate in secure voting?
          </h2>
          <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of voters using VOTEin for transparent and secure elections
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/register')}
            className="bg-card text-primary hover:bg-card/90 text-lg px-8"
          >
            Get Started Today
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
