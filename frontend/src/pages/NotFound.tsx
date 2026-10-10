import React from "react";
import { Link } from "react-router-dom";
import { Home, AlertCircle } from "lucide-react";

export const NotFound: React.FC = () => {
  return (
    <div className="max-w-md mx-auto py-24 text-center space-y-4">
      <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-100 text-slate-500 flex items-center justify-center">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-black text-slate-900">404 - Page Not Found</h1>
      <p className="text-xs text-slate-500">The requested interview page could not be located.</p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold shadow-sm hover:bg-brand-700"
      >
        <Home className="w-4 h-4" /> Back to Home
      </Link>
    </div>
  );
};
