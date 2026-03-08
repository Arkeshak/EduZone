import { Link } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
          <ShieldAlert className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-4xl mb-4">403</h1>
        <h2 className="text-2xl mb-4 text-gray-800">Access Denied</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          You do not have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Home className="w-5 h-5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
