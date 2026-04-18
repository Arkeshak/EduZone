/**
 * SCHOOL SERVICE API WRAPPER
 * 
 * File Purpose: Centralized API calls for school-related operations
 * Used for: School data fetching, profile management, school administration
 * 
 * Features:
 * - Fetch all schools with metadata
 * - Error handling with detailed messages
 * - Integration with automatic token injection (via axiosConfig)
 * 
 * Dependencies:
 * - axios (via axiosConfig which adds auth token automatically)
 * 
 * Architecture:
 * - All requests use baseURL configured in axiosConfig
 * - Automatic token included in Authorization header
 * - Errors thrown for component-level handling
 * 
 * Used by:
 * - Dashboard pages (for school info display)
 * - User profiles (for school affiliation)
 * - Admin pages (for school management)
 */

import axios from './axiosConfig';

/**
 * GET ALL SCHOOLS
 * 
 * Purpose: Retrieve list of all schools in the system
 * Endpoint: GET /schools
 * 
 * Flow:
 * 1. Make GET request to /schools endpoint
 * 2. axiosConfig automatically adds Bearer token
 * 3. Backend returns school data
 * 4. Return data to caller
 * 5. If error: throw error response for component handling
 * 
 * Returns:
 * - Success: Array of school objects
 *   Structure: [
 *     {
 *       id: Number,
 *       name: String,
 *       principal: Object,
 *       location: String,
 *       district: String,
 *       zone: String,
 *       studentCount: Number,
 *       teacherCount: Number,
 *       createdAt: Date,
 *       ...
 *     },
 *     ...
 *   ]
 * 
 * - Error: Throws error response with:
 *   - message: Description of error
 *   - statusCode: HTTP status
 *   - details: Additional error info
 * 
 * Error Scenarios:
 * - Network error (no internet)
 * - Server error (500)
 * - Unauthorized (401 - handled by apiClient refresh)
 * - Bad request (400)
 * 
 * Used in:
 * - Profile pages (show school affiliation)
 * - Admin dashboards (school list)
 * - School selection dropdowns
 * 
 * Example usage:
 * try {
 *   const schools = await schoolService.getSchools();
 *   console.log(schools);  // Array of school objects
 * } catch (error) {
 *   console.error('Failed to fetch schools:', error);
 * }
 */
const getSchools = async () => {
    try {
        // Make API request (token automatically included by axiosConfig)
        const response = await axios.get('/schools');

        // Return successful response data
        return response.data;
    } catch (error) {
        // Throw error details for component-level error handling
        throw error.response.data;
    }
};

export default {
    getSchools
};
