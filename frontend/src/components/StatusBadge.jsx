const StatusBadge = ({ status }) => {
  const statusConfig = {
    'Pending Principal': 'bg-yellow-100 text-yellow-800',
    'Pending ZEO': 'bg-blue-100 text-blue-800',
    'Approved': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
    'Funded': 'bg-purple-100 text-purple-800',
    'Rejected by Principal': 'bg-red-100 text-red-800',
    'Rejected by ZEO': 'bg-red-100 text-red-800',
    'Approved by ZEO': 'bg-green-100 text-green-800',
    'Submitted': 'bg-blue-100 text-blue-800',
    'Pending': 'bg-yellow-100 text-yellow-800',
  };

  const className = statusConfig[status] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${className}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
