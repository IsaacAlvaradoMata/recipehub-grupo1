import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="bg-white border-b-2 border-amber-400 px-8 h-15 flex items-center justify-between shadow-sm">
      <Link to="/" className="text-amber-900 font-bold text-xl no-underline hover:text-amber-600 transition-colors">
        RecipeHub
      </Link>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-stone-500 text-sm">{user.nombre}</span>
            <button
              onClick={handleLogout}
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors cursor-pointer border-none"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-amber-900 font-semibold text-sm no-underline hover:text-amber-600 transition-colors">
              Login
            </Link>
            <Link to="/register" className="text-amber-900 font-semibold text-sm no-underline hover:text-amber-600 transition-colors">
              Registrarse
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
