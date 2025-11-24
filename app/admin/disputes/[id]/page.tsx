"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface DisputeDetail {
    id: string;
    category: string;
    status: string;
    priority: string;
    description: string;
    resolution: string | null;
    createdAt: string;

    initiator: {
        id: string;
        name: string;
        email: string;
        role: string;
    };

    respondent: {
        id: string;
        name: string;
        email: string;
        role: string;
    };

    context: {
        campaign: {
            id: string;
            name: string;
            budget: number;
        } | null;
        video: {
            id: string;
            title: string;
            url: string;
        } | null;
    };

    timeline: Array<{
        id: string;
        senderId: string;
        senderName: string;
        senderRole: string;
        content: string;
        isInternal: boolean;
        createdAt: string;
    }>;

    evidence: Array<{
        id: string;
        uploaderName: string;
        fileUrl: string;
        fileType: string;
        description: string | null;
        createdAt: string;
    }>;
}

export default function DisputeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const disputeId = params.id as string;
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [dispute, setDispute] = useState<DisputeDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [showResolveModal, setShowResolveModal] = useState(false);

    // Resolution state
    const [resolutionOutcome, setResolutionOutcome] = useState("FAVOR_INITIATOR");
    const [resolutionReason, setResolutionReason] = useState("");
    const [resolving, setResolving] = useState(false);

    const fetchDisputeDetail = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/admin/disputes/${disputeId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setDispute(data);
            } else {
                alert('Failed to load dispute details');
                router.push('/admin/disputes');
            }
        } catch (error) {
            console.error("Failed to fetch dispute:", error);
        } finally {
            setLoading(false);
        }
    }, [disputeId, router]);

    useEffect(() => {
        fetchDisputeDetail();
    }, [fetchDisputeDetail]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/admin/disputes/${disputeId}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    content: newMessage,
                    isInternal: false, // Admins can choose, but default to public for now
                }),
            });

            if (response.ok) {
                setNewMessage("");
                fetchDisputeDetail(); // Refresh to show new message
            } else {
                alert('Failed to send message');
            }
        } catch (error) {
            console.error('Send message error:', error);
        } finally {
            setSending(false);
        }
    };

    const handleResolve = async () => {
        if (!resolutionReason || resolutionReason.length < 10) {
            alert('Please provide a detailed reason (min 10 chars)');
            return;
        }

        setResolving(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/admin/disputes/${disputeId}/resolve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    outcome: resolutionOutcome,
                    resolution: resolutionReason,
                }),
            });

            if (response.ok) {
                setShowResolveModal(false);
                fetchDisputeDetail();
                alert('Dispute resolved successfully');
            } else {
                const error = await response.json();
                alert(`Failed: ${error.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Resolve error:', error);
            alert('Error resolving dispute');
        } finally {
            setResolving(false);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (!dispute) return <div>Dispute not found</div>;

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 h-[calc(100vh-4rem)] flex flex-col">
            {/* Header */}
            <div className="bg-white shadow rounded-t-lg p-4 flex justify-between items-center flex-shrink-0 z-10">
                <div>
                    <div className="flex items-center gap-2">
                        <Link href="/admin/disputes" className="text-gray-500 hover:text-gray-700">
                            ← Back
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900">
                            {dispute.category}
                        </h1>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${dispute.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                            dispute.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                            }`}>
                            {dispute.priority} Priority
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${dispute.status === 'OPEN' ? 'bg-blue-100 text-blue-800' :
                            dispute.status === 'RESOLVED' ? 'bg-gray-100 text-gray-800' :
                                'bg-purple-100 text-purple-800'
                            }`}>
                            {dispute.status}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        Ref: {dispute.id} • Created {formatDate(dispute.createdAt)}
                    </p>
                </div>

                {dispute.status !== 'RESOLVED' && (
                    <button
                        onClick={() => setShowResolveModal(true)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                    >
                        Resolve Dispute
                    </button>
                )}
            </div>

            <div className="flex-1 flex overflow-hidden bg-gray-100">
                {/* Left Sidebar: Context & Evidence */}
                <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto p-4">
                    {/* Participants */}
                    <div className="mb-6">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Participants</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div>
                                    <p className="text-xs text-gray-500">Initiator ({dispute.initiator.role})</p>
                                    <p className="text-sm font-medium">{dispute.initiator.name}</p>
                                    <p className="text-xs text-gray-400">{dispute.initiator.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div>
                                    <p className="text-xs text-gray-500">Respondent ({dispute.respondent.role})</p>
                                    <p className="text-sm font-medium">{dispute.respondent.name}</p>
                                    <p className="text-xs text-gray-400">{dispute.respondent.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Context */}
                    <div className="mb-6">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Context</h3>
                        <div className="space-y-3">
                            {dispute.context.campaign && (
                                <div className="p-3 border border-gray-200 rounded-lg">
                                    <p className="text-xs text-gray-500">Campaign</p>
                                    <Link href={`/admin/campaigns/${dispute.context.campaign.id}`} className="text-sm font-medium text-red-600 hover:underline">
                                        {dispute.context.campaign.name}
                                    </Link>
                                    <p className="text-xs text-gray-500">Budget: ${dispute.context.campaign.budget}</p>
                                </div>
                            )}
                            {dispute.context.video && (
                                <div className="p-3 border border-gray-200 rounded-lg">
                                    <p className="text-xs text-gray-500">Video</p>
                                    <a href={dispute.context.video.url} target="_blank" className="text-sm font-medium text-blue-600 hover:underline">
                                        {dispute.context.video.title}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Evidence */}
                    <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Evidence</h3>
                        {dispute.evidence.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">No evidence uploaded.</p>
                        ) : (
                            <div className="space-y-3">
                                {dispute.evidence.map((item) => (
                                    <div key={item.id} className="p-3 border border-gray-200 rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded">{item.fileType}</span>
                                            <span className="text-xs text-gray-400">{formatDate(item.createdAt)}</span>
                                        </div>
                                        <p className="text-sm mt-1 mb-2">{item.description || 'No description'}</p>
                                        <a
                                            href={item.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                        >
                                            View File ↗
                                        </a>
                                        <p className="text-xs text-gray-400 mt-1">By {item.uploaderName}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Chat Thread */}
                <div className="flex-1 flex flex-col bg-gray-50">
                    {/* Initial Description */}
                    <div className="p-4 border-b border-gray-200 bg-white">
                        <h3 className="text-sm font-medium text-gray-900 mb-1">Dispute Description</h3>
                        <p className="text-sm text-gray-600">{dispute.description}</p>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {dispute.timeline.map((msg) => {
                            const isAdmin = msg.senderRole === 'ADMIN';
                            const isSystem = msg.senderId === 'system'; // Assuming system messages have this ID or similar logic

                            if (isSystem) {
                                return (
                                    <div key={msg.id} className="flex justify-center my-4">
                                        <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                                            {msg.content}
                                        </span>
                                    </div>
                                );
                            }

                            return (
                                <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-lg p-3 ${isAdmin
                                        ? 'bg-red-50 border border-red-100'
                                        : 'bg-white border border-gray-200'
                                        }`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs font-bold ${isAdmin ? 'text-red-700' : 'text-gray-700'}`}>
                                                {msg.senderName}
                                            </span>
                                            <span className="text-xs text-gray-400">{formatDate(msg.createdAt)}</span>
                                            {isAdmin && <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded">ADMIN</span>}
                                        </div>
                                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    {dispute.status !== 'RESOLVED' && (
                        <div className="p-4 bg-white border-t border-gray-200">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    disabled={sending}
                                />
                                <button
                                    type="submit"
                                    disabled={sending || !newMessage.trim()}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                                >
                                    Send
                                </button>
                            </form>
                        </div>
                    )}

                    {dispute.status === 'RESOLVED' && (
                        <div className="p-4 bg-gray-100 border-t border-gray-200 text-center text-gray-500 text-sm">
                            This dispute has been resolved and is closed for new messages.
                        </div>
                    )}
                </div>
            </div>

            {/* Resolve Modal */}
            {showResolveModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Resolve Dispute</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Outcome</label>
                                <select
                                    value={resolutionOutcome}
                                    onChange={(e) => setResolutionOutcome(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500"
                                >
                                    <option value="FAVOR_INITIATOR">Favor Initiator ({dispute.initiator.name})</option>
                                    <option value="FAVOR_RESPONDENT">Favor Respondent ({dispute.respondent.name})</option>
                                    <option value="SPLIT">Split / Compromise</option>
                                    <option value="DISMISSED">Dismissed (No Action)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Resolution Details (sent to users)
                                </label>
                                <textarea
                                    value={resolutionReason}
                                    onChange={(e) => setResolutionReason(e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500"
                                    placeholder="Explain the decision and any actions taken..."
                                />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={handleResolve}
                                    disabled={resolving}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                >
                                    {resolving ? 'Resolving...' : 'Confirm Resolution'}
                                </button>
                                <button
                                    onClick={() => setShowResolveModal(false)}
                                    disabled={resolving}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
