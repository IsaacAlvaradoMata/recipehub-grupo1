import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, ArrowLeft } from 'lucide-react';
import api from '../services/axiosInstance';

const CATEGORIES = ['Desayuno', 'Almuerzo', 'Cena', 'Postre'];
const DIFFICULTIES = ['Fácil', 'Media', 'Difícil'];

const emptyIngredient = () => ({ nombre: '', cantidad: '', unidad: '' });

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

function NewRecipe() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    categoria: CATEGORIES[0],
    tiempoMin: '',
    porciones: '',
    dificultad: DIFFICULTIES[0],
    imagenUrl: '',
    tags: '',
  });
  const [ingredientes, setIngredientes] = useState([emptyIngredient()]);
  const [pasos, setPasos] = useState(['']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleIngredientChange(index, field, value) {
    setIngredientes(ingredientes.map((ing, i) => i === index ? { ...ing, [field]: value } : ing));
  }

  function addIngredient() {
    setIngredientes([...ingredientes, emptyIngredient()]);
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

    setLoading(true);
    try {
      const payload = {
        ...form,
        tiempoMin: Number(form.tiempoMin),
        porciones: Number(form.porciones),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        ingredientes: preparedIngredients.value,
        pasos: pasos.filter(p => p.trim()),
      };
      const { data } = await api.post('/api/recetas', payload);
      navigate(`/recetas/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear la receta');
    } finally {
      setLoading(false);
    }
  }

  const inputClass = 'w-full px-4 py-2.5 border border-amber-200 rounded-lg text-sm bg-white text-stone-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition';
  const labelClass = 'block text-sm font-semibold text-stone-600 mb-1';
  const sectionTitle = 'text-base font-bold text-amber-900 flex items-center gap-2';

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: '#FEF3C7' }}>
      <div className="max-w-2xl mx-auto">

        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm font-semibold text-amber-700 hover:text-amber-900 transition mb-5"
        >
          <ArrowLeft size={16} /> Volver
        </button>

        <div className="mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center shadow-sm shrink-0">
            <UtensilsCrossed size={28} color="white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-amber-900">Nueva receta</h1>
            <p className="text-stone-400 text-sm mt-0.5">Completá los datos para publicar tu receta</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Información básica */}
          <div className="bg-white border border-amber-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <p className={sectionTitle}>
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">1</span>
              Información básica
            </p>

            <div>
              <label className={labelClass}>Título</label>
              <input name="titulo" value={form.titulo} onChange={handleChange} required className={inputClass} placeholder="Nombre de la receta" />
            </div>

            <div>
              <label className={labelClass}>Descripción</label>
              <textarea name="descripcion" value={form.descripcion} onChange={handleChange} required className={`${inputClass} resize-y min-h-20`} placeholder="Descripción breve de la receta" />
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
                <input type="number" name="tiempoMin" value={form.tiempoMin} onChange={handleChange} required min="1" className={inputClass} placeholder="30" />
              </div>
              <div>
                <label className={labelClass}>Porciones</label>
                <input type="number" name="porciones" value={form.porciones} onChange={handleChange} required min="1" className={inputClass} placeholder="4" />
              </div>
            </div>

            <div>
              <label className={labelClass}>URL de imagen <span className="text-stone-400 font-normal">(opcional)</span></label>
              <input name="imagenUrl" value={form.imagenUrl} onChange={handleChange} className={inputClass} placeholder="https://..." />
            </div>

            <div>
              <label className={labelClass}>Tags <span className="text-stone-400 font-normal">(separados por coma)</span></label>
              <input name="tags" value={form.tags} onChange={handleChange} className={inputClass} placeholder="vegano, rápido, saludable" />
            </div>
          </div>

          {/* Ingredientes */}
          <div className="bg-white border border-amber-100 rounded-2xl p-6 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <p className={sectionTitle}>
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">2</span>
                Ingredientes
              </p>
              <button type="button" onClick={addIngredient} className="text-sm font-semibold text-amber-600 hover:text-amber-800 transition">+ Agregar</button>
            </div>

            <div
              className="grid items-center gap-2 px-1 text-xs font-semibold text-stone-400"
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
                  <input value={ing.nombre} onChange={e => handleIngredientChange(i, 'nombre', e.target.value)} placeholder="ej: Harina" className={`${inputClass} min-w-0`} />
                  <input value={ing.cantidad} onChange={e => handleIngredientChange(i, 'cantidad', e.target.value)} placeholder="2" className={inputClass} />
                  <input value={ing.unidad} onChange={e => handleIngredientChange(i, 'unidad', e.target.value)} placeholder="tazas" className={inputClass} />
                  <button type="button" onClick={() => removeIngredient(i)} className="text-stone-300 hover:text-red-400 transition text-xl leading-none">×</button>
                </div>
              ))}
            </div>
          </div>

          {/* Pasos */}
          <div className="bg-white border border-amber-100 rounded-2xl p-6 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <p className={sectionTitle}>
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">3</span>
                Pasos
              </p>
              <button type="button" onClick={addStep} className="text-sm font-semibold text-amber-600 hover:text-amber-800 transition">+ Agregar</button>
            </div>

            <div className="flex flex-col gap-3">
              {pasos.map((paso, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="w-7 h-7 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold flex items-center justify-center shrink-0 mt-2">{i + 1}</span>
                  <textarea
                    value={paso}
                    onChange={e => handleStepChange(i, e.target.value)}
                    placeholder={`Describí el paso ${i + 1}...`}
                    className={`${inputClass} flex-1 resize-y min-h-16`}
                  />
                  <button type="button" onClick={() => removeStep(i)} className="text-stone-300 hover:text-red-400 transition text-xl leading-none mt-2.5">×</button>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{error}</p>
          )}

          <div className="flex gap-3 pb-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 bg-white border border-amber-200 text-amber-900 hover:border-amber-400 font-semibold py-3 rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition cursor-pointer border-none shadow-sm"
            >
              {loading ? 'Publicando...' : 'Publicar receta'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default NewRecipe;
