'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface CreatorCode {
    id: string;
    code: string;
    platform: string;
    active: boolean;
    notes: string | null;
    expirationDate: string | null;
    createdAt: string;
    creator: {
        id: string;
        name: string;
        email: string;
    };
    redemptionCount: number;
}

interface Creator {
    id: string;
    name: string;
}

interface CreatorCodesCardProps {
    campaignId: string;
    enableCreatorCodes: boolean;
    assignedCreators: Creator[];
}

export default function CreatorCodesCard({ campaignId, enableCreatorCodes, assignedCreators }: CreatorCodesCardProps) {
    const [codes, setCodes] = useState<CreatorCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newCode, setNewCode] = useState({
        creatorId: '',
        platform: 'TIKTOK',
        customCode: '',
        notes: ''
    });

    useEffect(() => {
        if (enableCreatorCodes) {
            fetchCodes();
        }
    }, [campaignId, enableCreatorCodes]);

    const fetchCodes = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/campaigns/${campaignId}/creator-codes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setCodes(data.data);
            }
        } catch (error) {
            console.error('Error fetching codes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCode = async () => {
        if (!newCode.creatorId) return;
        setCreating(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/campaigns/${campaignId}/creator-codes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    creatorId: newCode.creatorId,
                    platform: newCode.platform,
                    code: newCode.customCode || undefined,
                    notes: newCode.notes || undefined
                })
            });

            const data = await res.json();
            if (data.success) {
                fetchCodes();
                setShowCreateModal(false);
                setNewCode({ creatorId: '', platform: 'TIKTOK', customCode: '', notes: '' });
            } else {
                alert(data.error || 'Failed to create code');
            }
        } catch (error) {
            console.error('Error creating code:', error);
        } finally {
            setCreating(false);
        }
    };

    const handleToggleActive = async (codeId: string, active: boolean) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/campaigns/${campaignId}/creator-codes/${codeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ active: !active })
            });
            fetchCodes();
        } catch (error) {
            console.error('Error toggling code:', error);
        }
    };

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        alert(`Code "${code}" copied to clipboard!`);
    };

    if (!enableCreatorCodes) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Creator Attribution Codes</h3>
                <p className="text-gray-600 text-sm">
                    Enable creator codes in campaign settings to track conversions and attribute sales to creators.
                </p>
            </div>
        );
    }

    const totalRedemptions = codes.reduce((sum, c) => sum + c.redemptionCount, 0);

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Creator Attribution Codes</h3>
                <Button size="sm" onClick={() => setShowCreateModal(true)}>
                    + Generate Code
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-gray-900">{codes.length}</p>
                    <p className="text-xs text-gray-600">Total Codes</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">{codes.filter(c => c.active).length}</p>
                    <p className="text-xs text-gray-600">Active</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600">{totalRedemptions}</p>
                    <p className="text-xs text-gray-600">Redemptions</p>
                </div>
            </div>

            {/* Codes Table */}
            {loading ? (
                <div className="text-center py-8 text-gray-500">Loading codes...</div>
            ) : codes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No codes yet. Generate codes for your creators to track conversions.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left font-medium text-gray-700">Creator</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700">Code</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700">Platform</th>
                                <th className="px-3 py-2 text-center font-medium text-gray-700">Redemptions</th>
                                <th className="px-3 py-2 text-center font-medium text-gray-700">Status</th>
                                <th className="px-3 py-2 text-center font-medium text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {codes.map(code => (
                                <tr key={code.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-3">
                                        <p className="font-medium text-gray-900">{code.creator.name}</p>
                                    </td>
                                    <td className="px-3 py-3">
                                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{code.code}</code>
                                    </td>
                                    <td className="px-3 py-3">
                                        <Badge variant="outline">{code.platform}</Badge>
                                    </td>
                                    <td className="px-3 py-3 text-center">
                                        <span className="font-medium">{code.redemptionCount}</span>
                                    </td>
                                    <td className="px-3 py-3 text-center">
                                        <Badge variant={code.active ? 'success' : 'secondary'}>
                                            {code.active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => copyToClipboard(code.code)}
                                                className="text-blue-600 hover:text-blue-800 text-xs"
                                            >
                                                Copy
                                            </button>
                                            <button
                                                onClick={() => handleToggleActive(code.id, code.active)}
                                                className="text-gray-600 hover:text-gray-800 text-xs"
                                            >
                                                {code.active ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Code Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Generate Creator Code</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Creator</label>
                                <select
                                    value={newCode.creatorId}
                                    onChange={(e) => setNewCode({ ...newCode, creatorId: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                >
                                    <option value="">Select a creator...</option>
                                    {assignedCreators.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                                <select
                                    value={newCode.platform}
                                    onChange={(e) => setNewCode({ ...newCode, platform: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                >
                                    <option value="TIKTOK">TikTok</option>
                                    <option value="INSTAGRAM">Instagram</option>
                                    <option value="FACEBOOK">Facebook</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Custom Code (optional)
                                </label>
                                <input
                                    type="text"
                                    value={newCode.customCode}
                                    onChange={(e) => setNewCode({ ...newCode, customCode: e.target.value.toUpperCase() })}
                                    placeholder="Leave empty to auto-generate"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Usage Notes (optional)
                                </label>
                                <textarea
                                    value={newCode.notes}
                                    onChange={(e) => setNewCode({ ...newCode, notes: e.target.value })}
                                    placeholder="Instructions for the creator..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    rows={2}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateCode} disabled={creating || !newCode.creatorId}>
                                {creating ? 'Creating...' : 'Generate Code'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
