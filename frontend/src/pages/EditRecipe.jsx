import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/axiosInstance';

const CATEGORIES = ['Desayuno', 'Almuerzo', 'Cena', 'Postre'];
const DIFFICULTIES = ['Fácil', 'Media', 'Difícil'];

function prepareIngredients(ingredientes) {
  const normalizedIngredients = ingredientes
    .map((ing) => ({
      nombre: ing.nombre.trim(),
      cantidad: String(ing.cantidad).trim(),
      unidad: ing.unidad.trim(),
    }))
    .filter((ing) => ing.nombre || ing.cantidad || ing.unidad);

  if (normalizedIngredients.length === 0) {
    return { error: 'Agregá al menos un ingrediente.' };
  }

  const hasMissingField = normalizedIngredients.some(
    (ing) => !ing.nombre || !ing.cantidad || !ing.unidad
  );

  if (hasMissingField) {
    return { error: 'Cada ingrediente debe tener nombre, cantidad y unidad.' };
  }

  const hasInvalidQuantity = normalizedIngredients.some(
    (ing) => Number.isNaN(Number(ing.cantidad)) || Number(ing.cantidad) <= 0
  );

  if (hasInvalidQuantity) {
    return { error: 'La cantidad de cada ingrediente debe ser mayor a 0.' };
  }

  return {
    value: normalizedIngredients.map((ing) => ({
      ...ing,
      cantidad: Number(ing.cantidad),
    })),
  };
}

function EditRecipe() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [ingredientes, setIngredientes] = useState([]);
  const [pasos, setPasos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchRecipe() {
      try {
        const { data } = await api.get(`/api/recetas/${id}`);
        if (data.autorId?._id !== user._id) {
          navigate('/');
          return;
        }
        setForm({
          titulo: data.titulo,
          descripcion: data.descripcion,
          categoria: data.categoria,
          tiempoMin: String(data.tiempoMin),
          porciones: String(data.porciones),
          dificultad: data.dificultad,
          imagenUrl: data.imagenUrl || '',
          tags: (data.tags || []).join(', '),
        });
        setIngredientes(data.ingredientes?.length ? data.ingredientes : [{ nombre: '', cantidad: '', unidad: '' }]);
        setPasos(data.pasos?.length ? data.pasos : ['']);
      } catch {
        navigate('/');
      } finally {
        setLoading(false);
      }
    }
    fetchRecipe();
  }, [id, user._id, navigate]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleIngredientChange(index, field, value) {
    setIngredientes(ingredientes.map((ing, i) => i === index ? { ...ing, [field]: value } : ing));
  }

  function addIngredient() {
    setIngredientes([...ingredientes, { nombre: '', cantidad: '', unidad: '' }]);
  }

  function removeIngredient(index) {
    if (ingredientes.length === 1) return;
    setIngredientes(ingredientes.filter((_, i) => i !== index));
  }

  function handleStepChange(index, value) {
    setPasos(pasos.map((p, i) => (i === index ? value : p)));
  }

  function addStep() {
    setPasos([...pasos, '']);
  }

  function removeStep(index) {
    if (pasos.length === 1) return;
    setPasos(pasos.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const preparedIngredients = prepareIngredients(ingredientes);
    if (preparedIngredients.error) {
      setError(preparedIngredients.error);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        tiempoMin: Number(form.tiempoMin),
        porciones: Number(form.porciones),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        ingredientes: preparedIngredients.value,
        pasos: pasos.filter(p => p.trim()),
      };
      await api.put(`/api/recetas/${id}`, payload);
      navigate(`/recetas/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  }

  const inputClass = 'w-full px-4 py-2.5 border border-amber-200 rounded-lg text-sm bg-white text-stone-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition';
  const labelClass = 'block text-sm font-semibold text-stone-700 mb-1';

  if (loading) return <p className="text-center py-16 text-stone-500">Cargando receta...</p>;
  if (!form) return null;

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <h1 className="text-3xl font-bold text-amber-900 mb-6">Editar receta</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className={labelClass}>Título</label>
          <input name="titulo" value={form.titulo} onChange={handleChange} required className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Descripción</label>
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} required className={`${inputClass} resize-y min-h-20`} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Categoría</label>
            <select name="categoria" value={form.categoria} onChange={handleChange} className={inputClass}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Dificultad</label>
            <select name="dificultad" value={form.dificultad} onChange={handleChange} className={inputClass}>
              {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Tiempo (minutos)</label>
            <input type="number" name="tiempoMin" value={form.tiempoMin} onChange={handleChange} required min="1" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Porciones</label>
            <input type="number" name="porciones" value={form.porciones} onChange={handleChange} required min="1" className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>URL de imagen (opcional)</label>
          <input name="imagenUrl" value={form.imagenUrl} onChange={handleChange} className={inputClass} placeholder="https://..." />
        </div>

        <div>
          <label className={labelClass}>Tags (separados por coma)</label>
          <input name="tags" value={form.tags} onChange={handleChange} className={inputClass} placeholder="vegano, rápido, saludable" />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className={labelClass}>Ingredientes</label>
            <button type="button" onClick={addIngredient} className="text-amber-600 hover:text-amber-800 text-sm font-semibold transition">+ Agregar</button>
          </div>
          <div
            className="grid items-center gap-2 px-1 mb-2 text-xs font-semibold text-stone-400"
            style={{ gridTemplateColumns: 'minmax(0, 1fr) 6rem 6rem 1.25rem' }}
          >
            <span>Ingrediente</span>
            <span>Cantidad</span>
            <span>Unidad</span>
            <span></span>
          </div>
          <div className="flex flex-col gap-2">
            {ingredientes.map((ing, i) => (
              <div
                key={i}
                className="grid items-center gap-2"
                style={{ gridTemplateColumns: 'minmax(0, 1fr) 6rem 6rem 1.25rem' }}
              >
                <input value={ing.nombre} onChange={e => handleIngredientChange(i, 'nombre', e.target.value)} placeholder="Ingrediente" className={`${inputClass} min-w-0`} />
                <input value={ing.cantidad} onChange={e => handleIngredientChange(i, 'cantidad', e.target.value)} placeholder="Cantidad" className={inputClass} />
                <input value={ing.unidad} onChange={e => handleIngredientChange(i, 'unidad', e.target.value)} placeholder="Unidad" className={inputClass} />
                <button type="button" onClick={() => removeIngredient(i)} className="text-stone-400 hover:text-red-500 transition text-lg leading-none">×</button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className={labelClass}>Pasos</label>
            <button type="button" onClick={addStep} className="text-amber-600 hover:text-amber-800 text-sm font-semibold transition">+ Agregar</button>
          </div>
          <div className="flex flex-col gap-2">
            {pasos.map((paso, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="text-stone-400 text-sm font-semibold mt-2.5 w-5 shrink-0">{i + 1}.</span>
                <textarea value={paso} onChange={e => handleStepChange(i, e.target.value)} placeholder={`Paso ${i + 1}`} className={`${inputClass} flex-1 resize-y min-h-16`} />
                <button type="button" onClick={() => removeStep(i)} className="text-stone-400 hover:text-red-500 transition text-lg leading-none mt-2">×</button>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(`/recetas/${id}`)}
            className="flex-1 bg-white border border-amber-200 text-amber-900 hover:border-amber-400 font-semibold py-2.5 rounded-lg transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition cursor-pointer border-none"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditRecipe;
