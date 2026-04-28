import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Builder } from './pages/Admin/Builder';
import { Dashboard } from './pages/Admin/Dashboard';
import { SubmitForm } from './pages/Public/SubmitForm';
import { Login } from './pages/Auth/Login';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthService } from './services/auth.service';

const Layout = () => {
  const { pathname } = useLocation();
  const isBuilder = pathname.startsWith('/admin/builder');
  const isPublic = pathname.startsWith('/submit');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {!isPublic && <Navbar />}
      <main className={`flex-1 ${isBuilder || isPublic ? '' : 'p-6'}`}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/admin/builder/:id?" element={<Builder />} />
          <Route path="/submit/:id" element={<SubmitForm />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public: redirect to dashboard if already logged in */}
        <Route
          path="/login"
          element={
            AuthService.isAuthenticated()
              ? <Navigate to="/" replace />
              : <Login />
          }
        />

        {/* All admin routes are protected */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
