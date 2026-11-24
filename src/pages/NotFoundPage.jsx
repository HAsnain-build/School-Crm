import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="font-display font-extrabold text-6xl text-blue-600 tabular-nums">404</div>
      <h1 className="font-display font-bold text-xl text-slate-900 mt-3">Page Not Found</h1>
      <p className="text-sm text-slate-500 mt-1 max-w-md">
        The page you are looking for does not exist. Please go back to the Dashboard.
      </p>
      <Link
        to="/"
        className="mt-5 h-10 px-5 rounded-xl bg-[#0066eb] hover:bg-[#0052bd] text-white text-sm font-semibold inline-flex items-center gap-2"
      >
        <Home className="w-4 h-4" /> Go to Dashboard
      </Link>
    </div>
  );
}
