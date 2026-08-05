import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-16 px-4">
      <div className="text-center animate-fade-in">
        <p className="text-8xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">404</p>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">Page Not Found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-primary">Go Home</Link>
          <Link to="/shop" className="btn-outline">Browse Products</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;