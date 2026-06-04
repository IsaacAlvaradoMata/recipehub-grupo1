import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import RecipeDetail from './pages/RecipeDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import NewRecipe from './pages/NewRecipe'
import EditRecipe from './pages/EditRecipe'
import Profile from './pages/Profile'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recetas/:id" element={<RecipeDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/nueva" element={<ProtectedRoute><NewRecipe /></ProtectedRoute>} />
        <Route path="/editar/:id" element={<ProtectedRoute><EditRecipe /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  )
}

export default App
