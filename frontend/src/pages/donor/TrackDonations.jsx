import { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';

const MOCK_HISTORY = [
  { id: 1, date: '2024-03-15', beneficiary: 'Student S-2491 (Hatton High)', amount: 5000, status: 'Completed', receipt: 'REC-001' },
  { id: 2, date: '2024-02-28', beneficiary: 'Zonal Welfare Fund', amount: 25000, status: 'Processing', receipt: '-' },
  { id: 3, date: '2024-01-10', beneficiary: 'Library Project', amount: 15000, status: 'Completed', receipt: 'REC-089' },
];

const TrackDonations = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Donation History</h1>
          <p className="text-gray-600">Track the status of your contributions.</p>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Beneficiary / Project</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_HISTORY.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.date}</TableCell>
                  <TableCell className="font-medium">{item.beneficiary}</TableCell>
                  <TableCell>LKR {item.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={item.status === 'Completed' ? 'text-green-600 border-green-200 bg-green-50' : 'text-blue-600 border-blue-200 bg-blue-50'}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">{item.receipt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TrackDonations;
