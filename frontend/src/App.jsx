import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import ProtectedRoute from "./components/ProtectedRoute"
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants"

function clearAuthTokens() {
  localStorage.removeItem(ACCESS_TOKEN)
  localStorage.removeItem(REFRESH_TOKEN)
}

function Logout() {
  clearAuthTokens()
  return <Navigate to="/login" />
}

function RegisterAndLogout() {
  clearAuthTokens()
  return <Register />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/notes" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/favorites" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
