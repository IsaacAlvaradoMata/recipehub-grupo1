import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/axiosInstance';

function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', form);
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Credenciales incorrectas');
      } else {
        setError('Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center px-4 bg-[#FFFBF0]">
      <div className="bg-white border border-amber-200 rounded-2xl p-10 w-full max-w-md shadow-xl">
        <h1 className="text-2xl font-bold text-amber-900 text-center mb-6">Iniciar sesión</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 border border-amber-200 rounded-lg text-sm bg-white text-stone-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 border border-amber-200 rounded-lg text-sm bg-white text-stone-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
          />
          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors cursor-pointer border-none mt-1"
          >
            {loading ? 'Cargando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
