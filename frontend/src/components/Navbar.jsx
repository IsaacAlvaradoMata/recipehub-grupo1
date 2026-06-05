import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="bg-white border-b-2 border-amber-400 px-8 h-15 flex items-center justify-between shadow-sm">
      <Link to="/" className="text-amber-900 font-bold text-xl no-underline hover:text-amber-600 transition-colors">
        RecipeHub🥘
      </Link>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link to="/nueva" className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors no-underline">
              + Nueva receta
            </Link>
            <Link to="/perfil" className="text-amber-900 font-semibold text-sm no-underline hover:text-amber-600 transition-colors">
              {user.nombre}
            </Link>
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
