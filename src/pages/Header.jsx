import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const THEMES = ['dracula', 'light'];

export default function Header({ currentTheme, setCurrentTheme }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleThemeChange = (theme) => {
    setCurrentTheme(theme);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-base-content/80">Welcome back, {user?.email}</p>
      </div>
      <div className="flex items-center gap-2">
        <select 
          className="select select-bordered select-sm"
          value={currentTheme}
          onChange={(e) => handleThemeChange(e.target.value)}
        >
          {THEMES.map(theme => (
            <option key={theme} value={theme}>
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </option>
          ))}
        </select>
        <button 
          onClick={handleLogout} 
          className="btn btn-error"
        >
          Logout
        </button>
      </div>
    </div>
  );
}