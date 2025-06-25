import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Landing() {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Show logout success message if redirected from logout
  useEffect(() => {
    if (location.state?.fromLogout) {
      toast.success('You have been logged out successfully');
      // Clear the state to prevent showing the message again
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Auto-redirect to dashboard if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      setIsRedirecting(true);
      const timer = setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500); // Short delay for better UX

      return () => clearTimeout(timer);
    }
  }, [user, authLoading, navigate]);

  if (authLoading || isRedirecting) {
    return (
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <LoadingSpinner />
            {isRedirecting && (
              <p className="text-xl mt-4">Taking you to your dashboard...</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="hero min-h-[60vh] bg-primary text-primary-content">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Welcome to Hire-Me-Maybe</h1>
            <p className="py-6 text-xl">
              The ultimate tool to organize and track your job applications
            </p>
            {!user && (
              <div className="flex gap-4 justify-center">
                <Link 
                  to="/login" 
                  className="btn btn-secondary"
                  state={{ from: location.pathname }}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="btn btn-accent"
                  state={{ from: location.pathname }}
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-base-100">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold">Why Choose Hire-Me-Maybe?</h2>
          <p className="mt-4 text-lg">Powerful features to supercharge your job search</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body items-center text-center">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="card-title">Track Applications</h3>
              <p>Monitor every application from submission to final decision</p>
            </div>
          </div>
          
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body items-center text-center">
              <div className="text-5xl mb-4">🗂️</div>
              <h3 className="card-title">Stay Organized</h3>
              <p>Centralize all your job search materials in one place</p>
            </div>
          </div>
          
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body items-center text-center">
              <div className="text-5xl mb-4">📈</div>
              <h3 className="card-title">Get Insights</h3>
              <p>Analyze your response rates and interview performance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Demo CTA Section */}
      {!user && (
        <div className="py-16 px-4 sm:px-6 lg:px-8 bg-base-200">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Try our demo</h2>
            <p className="mb-8 text-lg">Experience the power of Hire-Me-Maybe with our interactive demo</p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="btn btn-neutral">Demo Feature 1</button>
              <button className="btn btn-primary">Demo Feature 2</button>
              <button className="btn btn-secondary">Demo Feature 3</button>
              <button className="btn btn-accent">Demo Feature 4</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer footer-center p-10 bg-base-300 text-base-content">
        <div>
          <p className="font-bold text-lg">
            Hire-Me-Maybe <br/>Your job search companion
          </p>
          <p>Copyright © 2023 - All right reserved</p>
        </div>
      </footer>
    </div>
  );
}