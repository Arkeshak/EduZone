import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, Building, DollarSign } from 'lucide-react';
import client from '@/services/apiClient';

const ReceivedFunds = () => {
    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransfers();
    }, []);

    /**
     * DATA FETCHING: Fund Transfers
     * Purpose: Retrieves records of all financial transfers from ZEO to this school.
     * Action: Calls GET /api/transfers and stores the results.
     */
    const fetchTransfers = async () => {
        try {
            const { data } = await client.get('/transfers');
            setTransfers(data);
        } catch (error) {
            console.error('Fetch Transfers Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Received Funds</h1>
                    <p className="text-gray-600">Track all funds transferred from the Zonal Education Office (ZEO).</p>
                </div>

                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-12 flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-4 text-gray-500">Loading transfers...</p>
                        </div>
                    ) : transfers.length === 0 ? (
                        <div className="p-12 flex flex-col items-center justify-center text-gray-500">
                            <DollarSign className="w-12 h-12 mb-4 opacity-10" />
                            <p className="text-lg font-medium">No funds received yet.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {transfers.map((transfer) => (
                                <div key={transfer.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 transition-colors gap-6">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-bold text-slate-900">
                                                {transfer.request?.category || "Welfare Fund"}
                                            </h3>
                                            <Badge className="bg-green-100 text-green-700">Received</Badge>
                                        </div>

                                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                                            <p className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(transfer.transferredAt).toLocaleDateString()}</p>
                                            <p className="flex items-center gap-1.5">
                                                <FileText className="w-4 h-4 text-blue-500" />
                                                <span className="font-semibold text-blue-600">Ref: {transfer.transferReference}</span>
                                            </p>
                                        </div>

                                        {transfer.request && (
                                            <p className="text-sm text-slate-600 bg-blue-50/50 p-2 rounded-md border border-blue-100 line-clamp-1">
                                                {transfer.request.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right min-w-[140px]">
                                            <p className="text-2xl font-black text-green-600 tracking-tight">LKR {Number(transfer.amount).toLocaleString()}</p>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ZEO Transfer</p>
                                        </div>

                                        {/* 
                                          TRANSFER PROOF (IF AVAILABLE)
                                          Purpose: Allows principals to verify the bank transfer via the uploaded receipt from ZEO.
                                          Action: Opens the proof image/PDF in a new window.
                                        */}
                                        {transfer.proofUrl && (
                                            <button
                                                onClick={() => window.open(`http://localhost:5000/${transfer.proofUrl}`, '_blank')}
                                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex flex-col items-center"
                                                title="View ZEO Transfer Proof"
                                            >
                                                <FileText className="w-6 h-6" />
                                                <span className="text-[10px] font-bold mt-1">PROOF</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ReceivedFunds;
