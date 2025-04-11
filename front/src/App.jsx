import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AmbientesProvider } from './context/AmbientesContext'
import { MaquinasProvider } from './context/MaquinasContext'
import { MantenimientosMaquinasProvider } from './context/MantenimientosMaquinasContext'
import { MantenimientosAmbientesProvider } from './context/MantenimientosAmbientesContext'
import { UserProvider } from './context/UserContext'
import { MyRoutes } from './routers/routes'

function App() {
  return (
    <>
    <AuthProvider>
       <AmbientesProvider>
        <MaquinasProvider>
          <MantenimientosMaquinasProvider>
            <MantenimientosAmbientesProvider>
              <UserProvider>
                <BrowserRouter>
                  <MyRoutes />
                </BrowserRouter>
              </UserProvider>
            </MantenimientosAmbientesProvider>
          </MantenimientosMaquinasProvider>
        </MaquinasProvider>
      </AmbientesProvider>
    </AuthProvider>
    </>
      
  )
}

export default App
