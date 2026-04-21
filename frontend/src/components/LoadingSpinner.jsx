/**
 * LoadingSpinner Component
 * Purpose: Provide visual feedback during asynchronous operations (API calls, route transitions).
 * Features: Supports three sizes (sm, md, lg) and uses a smooth CSS animation.
 */
const LoadingSpinner = ({ size = 'md' }) => {
  // Mapping of size props to Tailwind CSS width/height classes
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    /* 
      SPINNER CONTAINER
      Purpose: Center the spinner within its parent container.
    */
    <div className="flex items-center justify-center">
      {/* 
        SPINNER ELEMENT
        Action: Uses 'animate-spin' class to rotate a partial border circle.
      */}
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
    </div>
  );
};

export default LoadingSpinner;
