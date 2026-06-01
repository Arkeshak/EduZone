import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GRADES, SECTIONS } from '@/utils/subjects'; // Config for grades/sections
import { useAuth } from '@/context/AuthContext'; // Access login user
import DashboardLayout from '@/layouts/DashboardLayout'; // Main layout
import { Upload, AlertCircle, CheckCircle2, Plus, X } from 'lucide-react'; // Icons
import LoadingSpinner from '@/components/LoadingSpinner'; // Loader
import FileUploader from '@/components/FileUploader'; // Custom file input
import client from '@/services/apiClient'; // API client
import { toast } from 'sonner'; // Notifications

/**
 * SUBMIT WELFARE REQUEST PAGE
 * 
 * Purpose: A form for teachers to ask for help for a student (e.g., uniforms, books).
 */
const SubmitWelfareRequest = () => {
  const { user } = useAuth();

  // STATE: Stores all the text and file data from the form
  const [formData, setFormData] = useState({
    studentName: '',
    grade: '',
    section: 'A',
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

  // STATE: List of categories shown in the dropdown (e.g., "Books", "Fees")
  const [welfareTypes, setWelfareTypes] = useState([]);
  const navigate = useNavigate();

  // Load categories from the server when page opens
  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const { data } = await client.get('/welfare-types');
      setWelfareTypes(Array.isArray(data) ? data.map(t => t.name) : []);
    } catch (err) {
      console.error('Failed to fetch types', err);
      setWelfareTypes(['Books', 'Uniforms', 'Fees', 'Other']);
    }
  };

  // ACTION: Adds a brand new category (e.g. "Shoes") to the dropdown
  const handleCreateNewType = async () => {
    if (!newTypeName.trim()) return;
    setCreatingType(true);
    try {
      await client.post('/welfare-types', { name: newTypeName });
      toast.success(`Category "${newTypeName}" added!`);
      // Update the list and select the new type immediately
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

  // ACTION: Packages all form data and sends it to the server
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const fullGrade = `${formData.grade}-${formData.section}`;
      const amount = parseFloat(formData.estimatedCost);

      // VALIDATION: Quick checks before sending
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid estimated cost.');
        setLoading(false);
        return;
      }

      // DATA PACKAGING: Use 'FormData' because we are uploading a file (supportingDocument)
      const formDataToSend = new FormData();
      formDataToSend.append('studentName', formData.studentName || 'Unknown Student');
      formDataToSend.append('grade', fullGrade);
      formDataToSend.append('category', formData.welfareType);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('amountRequired', amount);
      formDataToSend.append('priority', 'MEDIUM');

      if (formData.supportingDocument) {
        formDataToSend.append('supportingDocument', formData.supportingDocument);
      }

      // Final checks on length and cost
      if (formData.description.length < 10) {
        setError('Description must be at least 10 characters long.');
        setLoading(false);
        return;
      }

      // SEND TO BACKEND
      await client.post('/welfare', formDataToSend);

      setSuccess(true);
      // Wait 2 seconds so the user can see the "Success" message, then redirect
      setTimeout(() => navigate('/teacher/track-requests'), 2000);
    } catch (err) {
      console.error('Welfare submission error:', err.response?.data || err);
      const backendErrors = err.response?.data?.errors;
      let msg = err.response?.data?.message || 'Failed to submit welfare request.';

      if (Array.isArray(backendErrors) && backendErrors.length > 0) {
        const firstError = backendErrors[0];
        msg = `${firstError.message || firstError.msg || 'Invalid input'}`;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <h1 className="text-2xl mb-6 font-bold text-slate-900">Submit Welfare Request</h1>

        {/* FEEDBACK MESSAGES (Success / Error) */}
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

        {/* FORM SECTION */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2 text-slate-700 font-medium">Student Name *</label>
                <input
                  type="text"

                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-slate-900"
                  placeholder="Enter student name"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm mb-2 text-slate-700 font-medium">Grade *</label>
                  <select
                    required
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-slate-900"
                  >
                    <option value="">Select</option>
                    {GRADES.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-2 text-slate-700 font-medium">Section *</label>
                  <select
                    required
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-slate-900"
                  >
                    {SECTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* CATEGORY SECTION: Select an existing type or create a new one */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">Welfare Type *</label>
                <button
                  type="button"
                  onClick={() => setShowNewTypeForm(!showNewTypeForm)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  {showNewTypeForm ? <><X className="w-3 h-3" /> Cancel</> : <><Plus className="w-3 h-3" /> Add New Type</>}
                </button>
              </div>

              {showNewTypeForm ? (
                /* Mode: Adding a custom type */
                <div className="flex gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <input
                    type="text"
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                    placeholder="E.g. Special Medical Needs"
                    className="flex-1 px-4 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
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
                /* Mode: Selecting from existing types */
                <select
                  required
                  value={formData.welfareType}
                  onChange={(e) => setFormData({ ...formData, welfareType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-slate-900"
                >
                  <option value="">Select type</option>
                  {welfareTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm mb-2 text-slate-700 font-medium">Description * (Min. 10 chars)</label>
              <textarea
                required
                minLength={10}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-slate-900"
                rows="4"
                placeholder="Explain why the student needs this help..."
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-slate-700 font-medium">Estimated Cost (LKR) *</label>
              <input
                type="number"
                required
                min="10"
                value={formData.estimatedCost}
                onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-slate-900"
                placeholder="0.00"
                step="0.01"
              />
            </div>

            {/* FILE UPLOAD: For proof of need (e.g. photos, letters) */}
            <div>
              <FileUploader
                id="welfare-document"
                label="Supporting Documents (Proof)"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                file={formData.supportingDocument}
                helperText="Upload any letters or evidence (PDF/JPG)"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 font-bold"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Submit Request'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/teacher/track-requests')}
                className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-slate-700"
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
