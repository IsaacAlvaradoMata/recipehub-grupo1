import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';
import api from '../services/axiosInstance';

const CATEGORIES = ['Desayuno', 'Almuerzo', 'Cena', 'Postre'];
const DIFFICULTIES = ['Fácil', 'Media', 'Difícil'];

function Home() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchRecipes() {
      setLoading(true);
      try {
        const params = {};
        if (category) params.categoria = category;
        if (difficulty) params.dificultad = difficulty;
        const { data } = await api.get('/api/recetas', { params });
        setRecipes(data);
      } catch {
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    }
    fetchRecipes();
  }, [category, difficulty]);

  const filtered = recipes.filter(r =>
    r.titulo.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <p className="text-center py-16 text-stone-500">Cargando recetas...</p>
  );

  return (
    <div className="max-w-6xl mx-auto px-5 py-8 w-full">
      <h1 className="text-3xl font-bold text-amber-900 mb-5">Recetas</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Buscar por título..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-44 px-4 py-2.5 border border-amber-200 rounded-lg text-sm bg-white text-stone-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="px-4 py-2.5 border border-amber-200 rounded-lg text-sm bg-white text-stone-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition min-w-40"
        >
          <option value="">Todas las categorías</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={difficulty}
          onChange={e => setDifficulty(e.target.value)}
          className="px-4 py-2.5 border border-amber-200 rounded-lg text-sm bg-white text-stone-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition min-w-40"
        >
          <option value="">Todas las dificultades</option>
          {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center py-16 text-stone-500">No hay recetas para mostrar.</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
          {filtered.map(recipe => (
            <div
              key={recipe._id}
              onClick={() => navigate(`/recetas/${recipe._id}`)}
              className="bg-white border border-amber-100 rounded-2xl overflow-hidden shadow-sm cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all"
            >
              {recipe.imagenUrl ? (
                <img src={recipe.imagenUrl} alt={recipe.titulo} className="w-full h-44 object-cover" />
              ) : (
                <div className="w-full h-44 bg-amber-50 flex items-center justify-center">
                  <UtensilsCrossed size={48} color="#F59E0B" />
                </div>
              )}
              <div className="p-4">
                <h2 className="text-base font-semibold text-amber-900 mb-2">{recipe.titulo}</h2>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800">{recipe.categoria}</span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800">{recipe.tiempoMin} min</span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800">{recipe.dificultad}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
