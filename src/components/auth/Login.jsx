import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function Login() {
  const location = useLocation();
  const { login, authError, clearError } = useAuth();
  const navigate = useNavigate();
  
  // Pre-fill email if coming from signup
  const [email, setEmail] = useState(location.state?.prefillEmail || '');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, []);

  // Handle auth errors
  useEffect(() => {
    if (authError) {
      toast.error(
        authError === 'auth/invalid-credential' 
          ? 'Invalid email or password'
          : 'Login failed. Please try again'
      );
      clearError();
    }
  }, [authError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (error) {
      // Error handling is now done via authError from context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">Welcome back!</h1>
          <p className="py-6">
            Log in to access your job application dashboard and continue your job search journey.
          </p>
        </div>
        
        <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          <div className="card-body">
            {location.state?.fromSignup && (
              <div className="alert alert-success mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Account created successfully! Please log in to continue.</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="input input-bordered"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="input input-bordered"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <label className="label">
                  <Link to="/forgot-password" className="label-text-alt link link-hover">
                    Forgot password?
                  </Link>
                </label>
              </div>
              
              <div className="form-control mt-6">
                <button 
                  type="submit" 
                  className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
              </div>
            </form>
            
            <div className="text-center mt-4">
              <p className="text-sm">
                Don't have an account?{' '}
                <Link to="/signup" className="link link-primary">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}