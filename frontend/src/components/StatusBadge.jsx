const StatusBadge = ({ status }) => {
  const statusConfig = {
    // Uppercase new schema statuses
    'SUBMITTED': 'bg-blue-100 text-blue-800',
    'PRINCIPAL_APPROVED': 'bg-indigo-100 text-indigo-800',
    'ZEO_APPROVED': 'bg-green-100 text-green-800',
    'PUBLISHED': 'bg-blue-100 text-blue-800',
    'PARTIALLY_FUNDED': 'bg-yellow-100 text-yellow-800',
    'FULLY_FUNDED': 'bg-green-100 text-green-800',
    'TRANSFERRED': 'bg-green-100 text-green-800',
    'REJECTED': 'bg-red-100 text-red-800',
    'VERIFIED': 'bg-green-100 text-green-800',
    'PENDING': 'bg-yellow-100 text-yellow-800',

    // Legacy mapping support
    'Pending Principal': 'bg-yellow-100 text-yellow-800',
    'Pending ZEO': 'bg-blue-100 text-blue-800',
    'Approved': 'bg-green-100 text-green-800',
    'Funded': 'bg-purple-100 text-purple-800',
    'Rejected by Principal': 'bg-red-100 text-red-800',
    'Rejected by ZEO': 'bg-red-100 text-red-800',
    'Approved by ZEO': 'bg-green-100 text-green-800',
    'Submitted': 'bg-blue-100 text-blue-800',
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Principal_Approved': 'bg-indigo-100 text-indigo-800',
    'Published': 'bg-blue-100 text-blue-800',
    'Partially_Funded': 'bg-yellow-100 text-yellow-800',
    'Fully_Funded': 'bg-green-100 text-green-800',
    'Transfer_Initiated': 'bg-orange-100 text-orange-800',
    'Transferred_To_School': 'bg-green-100 text-green-800',
  };

  const displayStatus = status || 'N/A';
  const className = statusConfig[displayStatus] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${className}`}>
      {displayStatus.replace('_', ' ')}
    </span>
  );
};

export default StatusBadge;
