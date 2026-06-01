/**
 * LOADING SPINNER COMPONENT
 * 
 * Purpose: A visual "Loading..." circle used while waiting for data from the server.
 */
const LoadingSpinner = ({ size = 'md' }) => {
  // Map size names to width/height classes
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex items-center justify-center">
      {/* 
        SPINNER CIRCLE
        - animate-spin: Key class that makes it rotate.
        - border-b-2: Only one side has a border, making it look like a spinning arc.
      */}
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
    </div>
  );
};

export default LoadingSpinner;
