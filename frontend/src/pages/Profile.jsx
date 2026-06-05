import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UtensilsCrossed, ArrowLeft } from 'lucide-react';
import api from '../services/axiosInstance';

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileRes, recipesRes] = await Promise.all([
          api.get('/api/auth/me'),
          api.get('/api/recetas'),
        ]);
        setProfile(profileRes.data);
        const myRecipes = recipesRes.data.filter(r => r.autorId?._id === user._id);
        setRecipes(myRecipes);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user._id]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  if (loading) return <p className="text-center py-16 text-stone-500">Cargando perfil...</p>;
  if (!profile) return <p className="text-center py-16 text-stone-500">No se pudo cargar el perfil.</p>;

  const joined = new Date(profile.createdAt).toLocaleDateString('es-CR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-sm font-semibold text-amber-700 hover:text-amber-900 transition mb-5"
      >
        <ArrowLeft size={16} /> Volver
      </button>
      <div className="bg-white border border-amber-100 rounded-2xl p-8 shadow-sm flex flex-col items-center gap-5 mb-8">
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt={profile.nombre} className="w-24 h-24 rounded-full object-cover border-2 border-amber-200" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
            <UtensilsCrossed size={36} color="#F59E0B" />
          </div>
        )}

        <div className="text-center">
          <h1 className="text-2xl font-bold text-amber-900">{profile.nombre}</h1>
          <p className="text-stone-500 text-sm mt-1">{profile.email}</p>
        </div>

        {profile.bio && (
          <p className="text-stone-600 text-sm text-center max-w-sm">{profile.bio}</p>
        )}

        <div className="w-full border-t border-amber-100 pt-4 flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span className="text-stone-400 font-medium">Miembro desde</span>
            <span className="text-stone-700">{joined}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-lg transition cursor-pointer border-none mt-2"
        >
          Cerrar sesión
        </button>
      </div>

      <h2 className="text-xl font-bold text-amber-900 mb-4">Mis recetas</h2>

      {recipes.length === 0 ? (
        <p className="text-stone-400 text-sm">No has publicado recetas aún.</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
          {recipes.map(recipe => (
            <div
              key={recipe._id}
              className="bg-white border border-amber-100 rounded-2xl overflow-hidden shadow-sm"
            >
              {recipe.imagenUrl ? (
                <img src={recipe.imagenUrl} alt={recipe.titulo} className="w-full h-36 object-cover" />
              ) : (
                <div className="w-full h-36 bg-amber-50 flex items-center justify-center">
                  <UtensilsCrossed size={36} color="#F59E0B" />
                </div>
              )}
              <div className="p-4">
                <h3 className="text-base font-semibold text-amber-900 mb-3">{recipe.titulo}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/recetas/${recipe._id}`)}
                    className="flex-1 text-sm font-semibold text-amber-900 border border-amber-200 hover:border-amber-400 py-1.5 rounded-lg transition cursor-pointer bg-white"
                  >
                    Ver
                  </button>
                  <button
                    onClick={() => navigate(`/editar/${recipe._id}`)}
                    className="flex-1 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 py-1.5 rounded-lg transition cursor-pointer border-none"
                  >
                    Editar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Profile;
