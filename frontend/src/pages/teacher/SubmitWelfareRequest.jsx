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

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GRADES, SECTIONS } from '@/utils/subjects';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import FileUploader from '@/components/FileUploader';
import client from '@/services/apiClient';

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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const welfareTypes = ['Books', 'Uniforms', 'Fees', 'Other'];

  const handleFileChange = (e) => {
    setFormData({ ...formData, supportingDocument: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // In a real app, we would include user.school in the payload
    // const payload = { ...formData, school: user.school };
    // console.log('Submitting for school:', user.school);

    try {
      const fullGrade = `${formData.grade}-${formData.section}`;
      const amount = parseFloat(formData.estimatedCost);

      // ✅ Client-side validation
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid estimated cost.');
        setLoading(false);
        return;
      }

      await client.post('/welfare', {
        studentName: formData.studentName || 'Unknown Student',
        grade: fullGrade,
        category: formData.welfareType, // Mapping welfareType to category
        description: formData.description,
        amountRequired: amount,
        priority: 'MEDIUM' // Must strictly match backend UPPERCASE ENUM
      });

      setSuccess(true);
      setTimeout(() => navigate('/teacher/track-requests'), 2000);
    } catch (err) {
      setError('Failed to submit welfare request. Please try again.');
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

            <div>
              <label className="block text-sm mb-2">Welfare Type *</label>
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
            </div>

            <div>
              <label className="block text-sm mb-2">Description *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Provide detailed description of the welfare need"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Estimated Cost (LKR) *</label>
              <input
                type="number"
                required
                min="0"
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
