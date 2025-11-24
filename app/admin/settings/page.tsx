"use client";

import { useEffect, useState } from "react";

interface AuditLog {
    id: string;
    adminName: string;
    action: string;
    resource: string;
    details: any;
    createdAt: string;
}

interface AdminUser {
    id: string;
    name: string;
    email: string;
    level: string;
    active: boolean;
    lastLogin: string;
}

export default function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState('team');

    // Team State
    const [admins, setAdmins] = useState<AdminUser[]>([]);

    // Audit Log State
    const [logs, setLogs] = useState<AuditLog[]>([]);

    // Broadcast State
    const [broadcastSubject, setBroadcastSubject] = useState('');
    const [broadcastBody, setBroadcastBody] = useState('');
    const [recipientType, setRecipientType] = useState('ALL_CREATORS');
    const [sendingBroadcast, setSendingBroadcast] = useState(false);

    useEffect(() => {
        if (activeTab === 'team') fetchAdmins();
        if (activeTab === 'audit') fetchLogs();
    }, [activeTab]);

    const fetchAdmins = async () => {
        const token = localStorage.getItem("token");
        const res = await fetch('/api/admin/users', {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setAdmins(await res.json());
    };

    const fetchLogs = async () => {
        const token = localStorage.getItem("token");
        const res = await fetch('/api/admin/audit-logs', {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
            const data = await res.json();
            setLogs(data.logs);
        }
    };

    const handleSendBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        setSendingBroadcast(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch('/api/admin/broadcasts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    recipientType,
                    subject: broadcastSubject,
                    bodyHtml: broadcastBody,
                }),
            });

            if (res.ok) {
                alert('Broadcast sent successfully!');
                setBroadcastSubject('');
                setBroadcastBody('');
            } else {
                alert('Failed to send broadcast');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSendingBroadcast(false);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Manage team access, view audit logs, and send broadcasts
                </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    {['team', 'audit', 'broadcast'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab
                                    ? 'border-red-500 text-red-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab === 'team' ? 'Team Management' : tab === 'audit' ? 'Audit Logs' : 'Email Broadcast'}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="bg-white shadow rounded-lg p-6">
                {activeTab === 'team' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-medium text-gray-900">Admin Users</h2>
                            <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">
                                Invite Admin
                            </button>
                        </div>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {admins.map((admin) => (
                                    <tr key={admin.id}>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                                            <div className="text-xs text-gray-500">{admin.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{admin.level}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${admin.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {admin.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{admin.lastLogin ? formatDate(admin.lastLogin) : 'Never'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'audit' && (
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 mb-4">System Audit Logs</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {logs.map((log) => (
                                        <tr key={log.id}>
                                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{log.adminName}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 text-xs bg-gray-100 rounded-full text-gray-800 font-mono">
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                                                {JSON.stringify(log.details)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'broadcast' && (
                    <div className="max-w-2xl">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Send Email Broadcast</h2>
                        <form onSubmit={handleSendBroadcast} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Recipients</label>
                                <select
                                    value={recipientType}
                                    onChange={(e) => setRecipientType(e.target.value)}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                                >
                                    <option value="ALL_CREATORS">All Creators</option>
                                    <option value="ALL_FOUNDERS">All Founders</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Subject</label>
                                <input
                                    type="text"
                                    value={broadcastSubject}
                                    onChange={(e) => setBroadcastSubject(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                    placeholder="Important Announcement"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Message (HTML)</label>
                                <textarea
                                    value={broadcastBody}
                                    onChange={(e) => setBroadcastBody(e.target.value)}
                                    rows={6}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm font-mono"
                                    placeholder="<p>Hello everyone...</p>"
                                    required
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={sendingBroadcast}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                >
                                    {sendingBroadcast ? 'Sending...' : 'Send Broadcast'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
