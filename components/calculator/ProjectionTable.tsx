import React from 'react';
import { MonthlyProjection } from '@/lib/services/roi-calculator';
import { Download, Users, DollarSign, UserMinus } from 'lucide-react';

interface ProjectionTableProps {
    projections: MonthlyProjection[];
}

export default function ProjectionTable({ projections }: ProjectionTableProps) {
    if (!projections || projections.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Monthly Projections</h3>
                <button className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-2">
                    <Download className="w-4 h-4" /> Export CSV
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Month</th>
                            <th className="px-6 py-4">New Customers</th>
                            <th className="px-6 py-4">Lost Customers</th>
                            <th className="px-6 py-4">Total Customers</th>
                            <th className="px-6 py-4">MRR</th>
                            <th className="px-6 py-4">Total Revenue</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {projections.map((row) => (
                            <tr key={row.month} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">Month {row.month}</td>
                                <td className="px-6 py-4 text-green-600">+{row.newCustomers.toLocaleString()}</td>
                                <td className="px-6 py-4 text-red-500">-{row.lostCustomers.toLocaleString()}</td>
                                <td className="px-6 py-4 font-semibold text-gray-900">{row.totalCustomers.toLocaleString()}</td>
                                <td className="px-6 py-4 font-medium text-primary-600">${row.mrr.toLocaleString()}</td>
                                <td className="px-6 py-4 text-gray-600">${row.totalRevenue.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
