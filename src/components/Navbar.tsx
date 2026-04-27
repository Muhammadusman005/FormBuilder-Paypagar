import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wand2, Zap } from 'lucide-react';

export const Navbar = () => {
  const { pathname } = useLocation();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-indigo-700 transition-colors">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-slate-800">
              Form<span className="text-indigo-600">Builder</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            <Link to="/" className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${pathname === '/' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}>
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link to="/admin/builder" className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${pathname.startsWith('/admin/builder') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}>
              <Wand2 className="w-4 h-4" />
              Builder
            </Link>
          </div>

          {/* CTA */}
          <Link
            to="/admin/builder"
            className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            + New Form
          </Link>
        </div>
      </div>
    </nav>
  );
};
