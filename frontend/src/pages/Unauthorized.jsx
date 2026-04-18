/**
 * UNAUTHORIZED / 403 PAGE
 * 
 * File Purpose: Display when user lacks permission to access resource
 * Used for: Role-based access control violations
 * 
 * Scenarios When Shown:
 * - Teacher tries to access Principal dashboard
 * - Donor tries to access ZEO admin panel
 * - Student tries to access restricted resource
 * - User's permissions were revoked
 * - Account role was downgraded
 * 
 * Features:
 * - 403 error message (Forbidden)
 * - Explanation about insufficient permissions
 * - Link to home or appropriate dashboard
 * 
 * Access: Protected (shown to authenticated users without permission)
 * Routing: Shown by ProtectedRoute component when role doesn't match
 */

import { Link } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        {/* 
          ERROR ICON CONTAINER
          Purpose: Visual indication of permission/security error
          Icon: Shield with alert/exclamation mark
          Background: Light red circle
          Color: Red (critical/blocked tone)
          Size: 20x20 units (80px) outer, 10x10 units (40px) icon
          Used for: Quick visual identification of access denied
        */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
          <ShieldAlert className="w-10 h-10 text-red-600" />
        </div>

        {/* 
          ERROR CODE
          Purpose: Display HTTP error code
          Code: "403"
          Size: 4xl (large)
          Color: Dark gray
          Used for: Standard error identification
        */}
        <h1 className="text-4xl mb-4">403</h1>

        {/* 
          ERROR TITLE
          Purpose: Main error message
          Text: "Access Denied"
          Size: 2xl (large heading)
          Color: Dark gray
          Font: Bold and clear
          Used for: Primary explanation of issue
        */}
        <h2 className="text-2xl mb-4 text-gray-800">Access Denied</h2>

        {/* 
          ERROR DESCRIPTION
          Purpose: Detailed explanation and next steps
          Text: Explains they lack permission and suggests contacting admin
          Color: Medium gray (lighter than heading)
          Max width: 28 (medium width, centered)
          Used for: Secondary explanation with helpful suggestion
          Instruction: Advises user to contact administrator if error
        */}
        <p className="text-gray-600 mb-8 max-w-md">
          You do not have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>

        {/* 
          BACK TO HOME BUTTON
          Purpose: Primary CTA to navigate to home/dashboard
          Text: "Back to Home"
          Icon: Home icon on left
          Color: Blue (primary)
          Size: Medium padding (6 units horizontal, 3 vertical)
          Hover: Darker blue on hover
          Action: Click to navigate to /
          Style: Rounded corners (md)
          Used for: Main action to navigate away from restricted area
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

export default Unauthorized;
