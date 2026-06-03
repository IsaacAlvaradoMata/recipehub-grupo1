  import { Routes, Route } from 'react-router-dom'
  import { AuthProvider } from './context/AuthContext'
  import Home from './pages/Home'
  import RecipeDetail from './pages/RecipeDetail'
  import Login from './pages/Login'
  import Register from './pages/Register'
  import Navbar from './components/Navbar'

  function App() {
    return (
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recetas/:id" element={<RecipeDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/nueva" element={<div>Nueva receta - Harold</div>} />
          <Route path="/editar/:id" element={<div>Editar receta - Harold</div>} />
          <Route path="/perfil" element={<div>Perfil - Harold</div>} />
        </Routes>
      </AuthProvider>
    )
  }

  export default App
