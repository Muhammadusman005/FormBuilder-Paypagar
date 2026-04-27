import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Builder } from './pages/Admin/Builder';
import { Dashboard } from './pages/Admin/Dashboard';
import { SubmitForm } from './pages/Public/SubmitForm';
import { Navbar } from './components/Navbar';

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
      <Layout />
    </Router>
  );
}

export default App;
