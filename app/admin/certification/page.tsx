
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ExternalLink, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface Submission {
    id: string;
    creatorId: string;
    videoUrl: string;
    strategyText: string;
    submittedAt: string;
    creator: {
        fullName: string;
        email: string;
    };
}

export default function AdminReviewPage() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const res = await fetch('/api/admin/certification/review');
            if (res.ok) {
                const data = await res.json();
                setSubmissions(data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load submissions');
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (id: string, approved: boolean) => {
        setProcessing(id);
        try {
            const res = await fetch('/api/admin/certification/review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    submissionId: id,
                    approved,
                    feedback: feedback[id] || (approved ? 'Great job!' : 'Please improve...'),
                }),
            });

            if (!res.ok) throw new Error('Review failed');

            toast.success(approved ? 'Creator certified!' : 'Submission rejected.');
            setSubmissions(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            toast.error('Failed to submit review');
        } finally {
            setProcessing(null);
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Certification Reviews</h1>

            {submissions.length === 0 ? (
                <p className="text-gray-500">No pending submissions.</p>
            ) : (
                <div className="grid gap-6">
                    {submissions.map(sub => (
                        <Card key={sub.id}>
                            <CardHeader>
                                <div className="flex justify-between">
                                    <div>
                                        <CardTitle>{sub.creator.fullName}</CardTitle>
                                        <CardDescription>{sub.creator.email}</CardDescription>
                                    </div>
                                    <Badge variant="outline">{new Date(sub.submittedAt).toLocaleDateString()}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-semibold mb-1">Video Submission</h4>
                                    <a href={sub.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 flex items-center hover:underline">
                                        {sub.videoUrl} <ExternalLink className="ml-1 h-3 w-3" />
                                    </a>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Strategy</h4>
                                    <p className="text-sm bg-gray-50 p-3 rounded-md whitespace-pre-wrap">{sub.strategyText}</p>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-1">Feedback</h4>
                                    <Textarea
                                        placeholder="Enter feedback for the creator..."
                                        value={feedback[sub.id] || ''}
                                        onChange={(e) => setFeedback(prev => ({ ...prev, [sub.id]: e.target.value }))}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-3">
                                <Button
                                    variant="destructive"
                                    onClick={() => handleReview(sub.id, false)}
                                    disabled={!!processing}
                                >
                                    {processing === sub.id ? <Loader2 className="animate-spin mr-2" /> : <X className="mr-2 h-4 w-4" />}
                                    Reject
                                </Button>
                                <Button
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleReview(sub.id, true)}
                                    disabled={!!processing}
                                >
                                    {processing === sub.id ? <Loader2 className="animate-spin mr-2" /> : <Check className="mr-2 h-4 w-4" />}
                                    Approve & Certify
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

