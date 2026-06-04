import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/axiosInstance';

function RecipeDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentForm, setCommentForm] = useState({ texto: '', calificacion: 5 });
  const [commentError, setCommentError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [recipeRes, commentsRes] = await Promise.all([
          api.get(`/api/recetas/${id}`),
          api.get(`/api/recetas/${id}/comentarios`),
        ]);
        setRecipe(recipeRes.data);
        setComments(commentsRes.data);
      } catch {
        setRecipe(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  async function handleDelete() {
    if (!window.confirm('¿Eliminar esta receta?')) return;
    try {
      await api.delete(`/api/recetas/${id}`);
      navigate('/');
    } catch {
      alert('Error al eliminar la receta. Intentá de nuevo.');
    }
  }

  async function handleCommentSubmit(e) {
    e.preventDefault();
    setCommentError('');
    try {
      const { data } = await api.post(`/api/recetas/${id}/comentarios`, commentForm);
      setComments([...comments, data]);
      setCommentForm({ texto: '', calificacion: 5 });
    } catch (err) {
      setCommentError(err.response?.data?.message || 'Error al enviar comentario');
    }
  }

  if (loading) return <p className="text-center py-16 text-stone-500">Cargando receta...</p>;
  if (!recipe) return <p className="text-center py-16 text-stone-500">Receta no encontrada.</p>;

  const isAuthor = user && recipe.autorId?._id === user._id;

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <h1 className="text-3xl font-bold text-amber-900 mb-2">{recipe.titulo}</h1>
      <p className="text-stone-500 mb-4">{recipe.descripcion}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800">{recipe.categoria}</span>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800">{recipe.tiempoMin} min</span>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800">{recipe.porciones} porciones</span>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800">{recipe.dificultad}</span>
      </div>

      {recipe.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {recipe.tags.map(tag => (
            <span key={tag} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-600">#{tag}</span>
          ))}
        </div>
      )}

      <p className="text-stone-500 mb-6">Autor: <strong className="text-stone-700">{recipe.autorId?.nombre}</strong></p>

      <div className="mt-6">
        <h2 className="text-xl font-semibold text-amber-900 mb-3">Ingredientes</h2>
        <ul className="list-disc pl-5 flex flex-col gap-1">
          {recipe.ingredientes?.map((ing, i) => (
            <li key={i} className="text-stone-700">{ing.cantidad} {ing.unidad} de {ing.nombre}</li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold text-amber-900 mb-3">Pasos</h2>
        <ol className="list-decimal pl-5 flex flex-col gap-2">
          {recipe.pasos?.map((paso, i) => (
            <li key={i} className="text-stone-700">{paso}</li>
          ))}
        </ol>
      </div>

      {isAuthor && (
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => navigate(`/editar/${id}`)}
            className="bg-white border border-amber-200 text-amber-900 hover:border-amber-400 font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
          >
            Editar
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition cursor-pointer border-none"
          >
            Eliminar
          </button>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-amber-900 mb-4">Comentarios</h2>

        {comments.length === 0 ? (
          <p className="text-stone-400 text-sm">No hay comentarios aún.</p>
        ) : (
          <div className="flex flex-col gap-3 mb-6">
            {comments.map(c => (
              <div key={c._id} className="bg-white border border-amber-100 rounded-xl px-4 py-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-amber-900 text-sm">{c.usuarioId?.nombre}</span>
                  <span className="text-amber-500 text-sm font-semibold">★ {c.calificacion}/5</span>
                </div>
                <p className="text-stone-600 text-sm">{c.texto}</p>
              </div>
            ))}
          </div>
        )}

        {user && (
          <div className="bg-white border border-amber-100 rounded-xl p-5 mt-4">
            <h3 className="font-semibold text-stone-800 mb-3">Agregar comentario</h3>
            <form onSubmit={handleCommentSubmit} className="flex flex-col gap-3">
              <textarea
                placeholder="Escribe tu comentario..."
                value={commentForm.texto}
                onChange={e => setCommentForm({ ...commentForm, texto: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-amber-200 rounded-lg text-sm bg-white text-stone-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition resize-y min-h-20"
              />
              <select
                value={commentForm.calificacion}
                onChange={e => setCommentForm({ ...commentForm, calificacion: Number(e.target.value) })}
                className="px-4 py-2.5 border border-amber-200 rounded-lg text-sm bg-white text-stone-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
              >
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{'★'.repeat(n)} {n}/5</option>)}
              </select>
              {commentError && (
                <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{commentError}</p>
              )}
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-lg transition cursor-pointer border-none"
              >
                Enviar comentario
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecipeDetail;
