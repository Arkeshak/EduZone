/**
 * SUBMIT WELFARE REQUEST PAGE
 * 
 * File Purpose: Form for teachers to create new student welfare requests
 * Used for: Initiating financial assistance requests for students in need
 * 
 * Features:
 * - Student name, grade, section input
 * - Welfare type selection (Books, Uniforms, Fees, Other)
 * - Description/reason for request
 * - Estimated cost amount
 * - Optional supporting document upload
 * - Form validation before submission
 * 
 * Flow: Fill form → Validate → Submit → Create request with SUBMITTED status → Redirect to tracker
 * Security: Only teachers can submit, request scoped to their school
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GRADES, SECTIONS } from '@/utils/subjects';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Upload, AlertCircle, CheckCircle2, Plus, X } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import FileUploader from '@/components/FileUploader';
import client, { API_BASE_URL } from '@/services/apiClient';
import { toast } from 'sonner';

/**
 * SubmitWelfareRequest Component
 * @desc Form interface for Teachers to create new welfare requests on behalf of students.
 *       Captures student details, financial need, and optional supporting documents.
 *       Posts data to `/api/welfare` and redirects to the tracker view on success.
 */
const SubmitWelfareRequest = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    studentName: '',
    grade: '',
    section: 'A', // Default section
    welfareType: '',
    description: '',
    estimatedCost: '',
    supportingDocument: null,
  });
  const [loading, setLoading] = useState(false);
  const [creatingType, setCreatingType] = useState(false);
  const [showNewTypeForm, setShowNewTypeForm] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [welfareTypes, setWelfareTypes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const { data } = await client.get('/welfare-types');
      // data is already unwrapped by apiClient interceptor
      setWelfareTypes(Array.isArray(data) ? data.map(t => t.name) : []);
    } catch (err) {
      console.error('Failed to fetch types', err);
      setWelfareTypes(['Books', 'Uniforms', 'Fees', 'Other']);
    }
  };

  /**
   * CUSTOM CATEGORY HANDLER
   * Purpose: Allows teachers to add new welfare categories if one doesn't exist.
   * Action: 
   * 1. Submits new category name to the backend.
   * 2. On success, updates the local dropdown list and selects it.
   * Validation: Ensures name is not empty before submitting.
   */
  const handleCreateNewType = async () => {
    if (!newTypeName.trim()) return;
    setCreatingType(true);
    try {
      await client.post('/welfare-types', { name: newTypeName });
      toast.success(`Category "${newTypeName}" added!`);
      // Step: Dynamically expand the available options without page refresh
      setWelfareTypes(prev => [...prev, newTypeName]);
      setFormData(prev => ({ ...prev, welfareType: newTypeName }));
      setShowNewTypeForm(false);
      setNewTypeName('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add type');
    } finally {
      setCreatingType(false);
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, supportingDocument: e.target.files[0] });
  };

  /**
   * WELFARE REQUEST SUBMISSION HANDLER
   * Purpose: Packages student data and supporting documents for submission.
   * Action:
   * 1. Performs local validation on numeric inputs.
   * 2. Constructs a 'Multipart/Form-Data' payload to support binary file uploads.
   * 3. Sends POST request to /api/welfare.
   * 4. Redirects to the request tracker on success.
   * Validation: 
   * - Ensures cost is a valid positive number.
   * - Automatically calculates final grade-section string.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const fullGrade = `${formData.grade}-${formData.section}`;
      const amount = parseFloat(formData.estimatedCost);

      // Client-side Validation: Numeric sanity check
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid estimated cost.');
        setLoading(false);
        return;
      }

      // Preparation: Use FormData for multipart upload (including files)
      const formDataToSend = new FormData();
      formDataToSend.append('studentName', formData.studentName || 'Unknown Student');
      formDataToSend.append('grade', fullGrade);
      formDataToSend.append('category', formData.welfareType);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('amountRequired', amount);
      formDataToSend.append('priority', 'MEDIUM');
      
      // Inclusion: Add document if it was staged by the user
      if (formData.supportingDocument) {
        formDataToSend.append('supportingDocument', formData.supportingDocument);
      }

      // Pre-flight check: Ensure min requirements match backend
      if (formData.description.length < 10) {
        setError('Description must be at least 10 characters long.');
        setLoading(false);
        return;
      }
      if (amount < 10) {
        setError('Estimated cost must be at least 10 LKR.');
        setLoading(false);
        return;
      }

      // Metadata: Append redundant fields for legacy backend support
      formDataToSend.append('fullName', formData.studentName); 
      formDataToSend.append('section', formData.section);

      // Execution: Send data to API
      await client.post('/welfare', formDataToSend);

      setSuccess(true);
      // UX: Give the user 2 seconds to see the success message before navigating
      setTimeout(() => navigate('/teacher/track-requests'), 2000);
    } catch (err) {
      console.error('Welfare submission error:', err.response?.data || err);
      
      // ✅ Enhanced Error Extraction: Identify specific field failures from backend validation
      const backendErrors = err.response?.data?.errors;
      let msg = err.response?.data?.message || 'Failed to submit welfare request. Please try again.';
      
      if (Array.isArray(backendErrors) && backendErrors.length > 0) {
        // Map the first validation error to a readable string
        const firstError = backendErrors[0];
        msg = `${firstError.message || firstError.msg || 'Invalid input'}${firstError.field ? ` (${firstError.field})` : ''}`;
      }
      
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <h1 className="text-2xl mb-6">Submit Welfare Request</h1>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-green-800 font-medium">Request submitted successfully!</p>
              <p className="text-sm text-green-700">Redirecting to track requests...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">Student Name *</label>
                <input
                  type="text"
                  required
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter student name"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm mb-2">Grade *</label>
                  <select
                    required
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select</option>
                    {GRADES.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-2">Section *</label>
                  <select
                    required
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SECTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 
              WELFARE CATEGORY SECTION
              Purpose: Allows selecting from predefined types or adding a custom one.
            */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium">Welfare Type *</label>
                {/* 
                  ADD NEW TYPE TOGGLE
                  Action: Switches input mode between dropdown and text entry.
                */}
                <button 
                  type="button" 
                  onClick={() => setShowNewTypeForm(!showNewTypeForm)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  {showNewTypeForm ? <><X className="w-3 h-3" /> Cancel</> : <><Plus className="w-3 h-3" /> Add New Type</>}
                </button>
              </div>

              {showNewTypeForm ? (
                /* NEW CATEGORY INPUT (Text mode) */
                <div className="flex gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <input
                    type="text"
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                    placeholder="E.g. Special Medical Needs"
                    className="flex-1 px-4 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                  <button
                    type="button"
                    disabled={creatingType || !newTypeName.trim()}
                    onClick={handleCreateNewType}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md font-bold text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    {creatingType ? '...' : 'Create'}
                  </button>
                </div>
              ) : (
                /* EXISTING CATEGORY DROPDOWN (Select mode) */
                <select
                  required
                  value={formData.welfareType}
                  onChange={(e) => setFormData({ ...formData, welfareType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select type</option>
                  {welfareTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm mb-2">Description * (Min. 10 chars)</label>
              <textarea
                required
                minLength={10}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Provide detailed description of the welfare need (minimum 10 characters)"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Estimated Cost (LKR) * (Min. 10.00)</label>
              <input
                type="number"
                required
                min="10"
                onWheel={(e) => e.target.blur()}
                value={formData.estimatedCost}
                onChange={(e) => {
                  const val = e.target.value;
                  // ✅ Basic numeric validation while typing
                  if (val === '' || /^\d*\.?\d*$/.test(val)) {
                    setFormData({ ...formData, estimatedCost: val });
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div>
              <FileUploader
                id="welfare-document"
                label="Supporting Documents"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                file={formData.supportingDocument}
                helperText="PDF, DOC, JPG up to 10MB"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Submit Request'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/teacher/track-requests')}
                className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SubmitWelfareRequest;
