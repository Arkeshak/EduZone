/**
 * CONSTANTS UTILITIES
 * 
 * File Purpose: Define all fixed lists used throughout the app
 * Shared references: Available in dropdowns, filters, and form selectors
 * 
 * Contains:
 * - SUBJECTS: All subjects taught in schools
 * - GRADES: All grade levels (6-13)
 * - SECTIONS: Class sections/divisions
 * 
 * Usage pattern:
 * import { SUBJECTS, GRADES, SECTIONS } from '@/utils/subjects';
 * 
 * Used in:
 * - Resource filters (PublicResources.jsx)
 * - Course selection forms
 * - Class section management
 * - Dropdown menus across the app
 */

/**
 * SUBJECTS LIST
 * 
 * Purpose: All subjects available in the school system
 * Total: 21 subjects covering:
 * - Religious studies (5 religions)
 * - Languages (Sinhala, Tamil, English)
 * - Academic core (Math, Science, History, Geography, Civics)
 * - Physical & Health (PE, Health)
 * - Arts (Art, Music, Dancing - 3 styles)
 * - Vocational (Design & Technology, ICT)
 * 
 * Usage:
 * - Building subject dropdowns in forms
 * - Filtering resources by subject
 * - Validating subject selection
 * 
 * Example usage:
 * SUBJECTS.map(subject => <option>{subject}</option>)
 * 
 * Maintains order: Subjects are ordered for UI display
 */
export const SUBJECTS = [
    "Buddhism",
    "Hinduism",
    "Islam",
    "Christianity",
    "Catholicism",
    "Sinhala",
    "Tamil",
    "English",
    "Mathematics",
    "Science",
    "History",
    "Geography",
    "Civics Education",
    "Health & Physical Education",
    "Art",
    "Music",
    "Dancing (Traditional)",
    "Dancing (Oriental)",
    "Dancing (Western)",
    "Design & Technology",
    "Information & Communication Technology"
];

/**
 * GRADES LIST
 * 
 * Purpose: All academic levels/years in the school system
 * Range: Grade 6 to Grade 13
 * Structure:
 * - Grades 6-10: Compulsory education (O-Levels)
 * - Grades 11-12: Advanced studies (A-Levels)
 * - Grade 13: Final year
 * 
 * Usage:
 * - Building grade dropdowns in forms
 * - Filtering resources by grade level
 * - Resource organization by academic year
 * 
 * Example usage:
 * GRADES.map(grade => <option>Grade {grade}</option>)
 * 
 * Format: Numbers for sorting and comparison
 */
export const GRADES = [6, 7, 8, 9, 10, 11, 12, 13];

/**
 * SECTIONS LIST
 * 
 * Purpose: Class sections/divisions within a grade
 * Letters: A through E (5 sections per grade)
 * 
 * Meaning:
 * - Grade 10 Section A = Class 10-A
 * - Grade 10 Section B = Class 10-B
 * - etc.
 * 
 * Usage:
 * - Building section dropdowns in forms
 * - Organizing students by class
 * - Assigning teachers to specific sections
 * - Creating timetables/schedules
 * 
 * Example usage:
 * SECTIONS.map(section => <option>Section {section}</option>)
 * 
 * Assumption: Most grades have exactly 5 sections (A-E)
 */
export const SECTIONS = ['A', 'B', 'C', 'D', 'E'];
