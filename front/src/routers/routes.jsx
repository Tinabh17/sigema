import { Routes, Route } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import RecoverPassword from '../pages/RecoverPassword'
import ProtectedRoute from '../ProtectedRoute'
import RegisterPage from '../pages/RegisterPage'
import DashboardPage from '../pages/DashboardPage'
import AmbientesPage from "../pages/AmbientesPage"
import MaquinasPage from "../pages/MaquinasPage"
import Layout from '../components/Layout'
import GestionUsuariosPage from '../pages/GestionUsuariosPage'
import MantenimientosMaquinasPage from '../pages/MantenimientosMaquinasPage'
import MantenimientosAmbientesPage from '../pages/MantenimientosAmbientesPage'
import ProfilePage from '../pages/ProfilePage'
import ResetPassword from '../pages/ResetPassword'
import MapaPage from '../pages/MapaPage'

export const MyRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<LoginPage />} />
      <Route path='/recover' element={<RecoverPassword />} />
      <Route path='/reset/:token' element={<ResetPassword />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/dashboard' element={<DashboardPage />} />
          <Route path='/ambientes' element={<AmbientesPage />} />
          <Route path='/maquinaria' element={<MaquinasPage />} />
          <Route path='/mantenimiento/maquina' element={<MantenimientosMaquinasPage /> }/>
          <Route path='/mantenimiento/ambiente' element={<MantenimientosAmbientesPage /> }/>
          <Route path='/usuarios' element={<GestionUsuariosPage/> }/>
          <Route path='/perfil' element={<ProfilePage />} />
          <Route path="/editUser/:id" element={<RegisterPage />} />
          <Route path='/mapa' element={<MapaPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
