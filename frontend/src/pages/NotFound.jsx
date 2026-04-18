/**
 * NOT FOUND / 404 PAGE
 * 
 * File Purpose: Display when user navigates to non-existent routes
 * Used for: Handling invalid URLs, providing navigation options
 * 
 * Scenarios:
 * - User types incorrect URL manually
 * - Link is broken or outdated
 * - Feature has been removed
 * - Route is misspelled
 * 
 * Features:
 * - 404 error message
 * - Explanation
 * - Link back to home
 * 
 * Access: Public (no login required)
 * Routing: Defined in AppRouter as catch-all route
 */

import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        {/* 
          ERROR ICON CONTAINER
          Purpose: Visual indication of error
          Icon: Question mark in file
          Background: Light blue circle
          Color: Blue (warning/info tone)
          Size: 20x20 units (80px) outer, 10x10 units (40px) icon
          Used for: Quick visual identification of 404 error
        */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
          <FileQuestion className="w-10 h-10 text-blue-600" />
        </div>

        {/* 
          ERROR CODE
          Purpose: Display HTTP error code
          Code: "404"
          Size: 4xl (large)
          Color: Dark gray
          Used for: Standard error identification
        */}
        <h1 className="text-4xl mb-4">404</h1>

        {/* 
          ERROR TITLE
          Purpose: Main error message
          Text: "Page Not Found"
          Size: 2xl (large heading)
          Color: Dark gray
          Font: Bold and clear
          Used for: Primary explanation
        */}
        <h2 className="text-2xl mb-4 text-gray-800">Page Not Found</h2>

        {/* 
          ERROR DESCRIPTION
          Purpose: Detailed explanation
          Text: "The page you are looking for doesn't exist or has been moved."
          Color: Medium gray (lighter than heading)
          Max width: 28 (medium width, centered)
          Used for: Secondary explanation and reassurance
        */}
        <p className="text-gray-600 mb-8 max-w-md">
          The page you are looking for doesn't exist or has been moved.
        </p>

        {/* 
          BACK TO HOME BUTTON
          Purpose: Primary CTA to navigate to home page
          Text: "Back to Home"
          Icon: Home icon on left
          Color: Blue (primary)
          Size: Medium padding (6 units horizontal, 3 vertical)
          Hover: Darker blue on hover
          Action: Click to navigate to /
          Style: Rounded corners (md)
          Used for: Main action to recover from 404
        */}
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

export default NotFound;
