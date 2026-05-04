import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
        </div>

        {/* Error Code */}
        <h1 className="text-6xl font-bold text-slate-900 mb-2">404</h1>

        {/* Error Title */}
        <h2 className="text-2xl font-semibold text-slate-800 mb-3">Page Not Found</h2>

        {/* Error Description */}
        <p className="text-slate-600 mb-8">
          Sorry, the page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 text-slate-800 font-medium rounded-lg hover:bg-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
        </div>

        {/* Additional Help */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-500 mb-4">Need help?</p>
          <div className="space-y-2 text-sm">
            <p className="text-slate-600">
              Check the URL and try again, or return to the dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
