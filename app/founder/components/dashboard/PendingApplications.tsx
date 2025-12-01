import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, ExternalLink, MessageSquare } from "lucide-react";
import Link from 'next/link';

type Application = {
    id: string;
    campaignId: string;
    campaignName: string;
    creatorId: string;
    creatorName: string;
    creatorEmail: string;
    creatorBio: string;
    creatorCategories: string[];
    portfolioLinks: string[];
    message: string;
    appliedAt: string;
    status: string;
};

export default function PendingApplications() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/founder/applications/pending', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setApplications(data.data);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (app: Application) => {
        setProcessingId(app.id);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/campaigns/${app.campaignId}/applications/${app.id}/accept`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ creatorId: app.creatorId })
            });

            if (response.ok) {
                // Remove from list
                setApplications(prev => prev.filter(a => a.id !== app.id));
            } else {
                alert('Failed to accept application');
            }
        } catch (error) {
            console.error('Error accepting application:', error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (app: Application) => {
        if (!confirm('Are you sure you want to reject this application?')) return;

        setProcessingId(app.id);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/campaigns/${app.campaignId}/applications/${app.id}/reject`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Remove from list
                setApplications(prev => prev.filter(a => a.id !== app.id));
            } else {
                alert('Failed to reject application');
            }
        } catch (error) {
            console.error('Error rejecting application:', error);
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <Card className="h-full border-none shadow-sm">
                <CardContent className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-DEFAULT" />
                </CardContent>
            </Card>
        );
    }

    if (applications.length === 0) {
        return null; // Don't show if no pending applications
    }

    return (
        <Card className="h-full border-none shadow-sm flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between flex-shrink-0 pb-2">
                <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-semibold text-gray-800">Pending Applications</CardTitle>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                        {applications.length} New
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto max-h-[400px]">
                <div className="divide-y divide-gray-100">
                    {applications.map((app) => (
                        <div key={app.id} className="p-5 hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{app.creatorName}</h4>
                                        <p className="text-sm text-gray-500">Applied for <span className="font-medium text-primary-600">{app.campaignName}</span></p>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {new Date(app.appliedAt).toLocaleDateString()}
                                    </span>
                                </div>

                                {app.message && (
                                    <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 flex gap-2">
                                        <MessageSquare className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" />
                                        <p>"{app.message}"</p>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-2">
                                    {app.creatorCategories.slice(0, 3).map((cat, i) => (
                                        <Badge key={i} variant="outline" className="text-xs text-gray-500">
                                            {cat}
                                        </Badge>
                                    ))}
                                </div>

                                {app.portfolioLinks.length > 0 && (
                                    <div className="flex gap-3 text-sm">
                                        {app.portfolioLinks.map((link, i) => (
                                            <a
                                                key={i}
                                                href={link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-blue-600 hover:underline"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                Portfolio {i + 1}
                                            </a>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-3 mt-2">
                                    <Button
                                        size="sm"
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                        onClick={() => handleAccept(app)}
                                        disabled={!!processingId}
                                    >
                                        {processingId === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                                        Accept
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 text-red-600 hover:bg-red-50 border-red-200"
                                        onClick={() => handleReject(app)}
                                        disabled={!!processingId}
                                    >
                                        {processingId === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                                        Reject
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
