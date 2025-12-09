
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TheoryExam from '@/components/certification/TheoryExam';
import PracticalAssessment from '@/components/certification/PracticalAssessment';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, Lock, AlertCircle } from 'lucide-react';

export default function CertificationPage() {
    const [status, setStatus] = useState<'LOADING' | 'NONE' | 'THEORY_PASSED' | 'CERTIFIED'>('LOADING');
    const [activeTab, setActiveTab] = useState<'THEORY' | 'PRACTICAL'>('THEORY');
    const router = useRouter();

    useEffect(() => {
        // Fetch user profile to get certification status
        // For now, we'll assume we can get it from an API or session
        // This is a placeholder fetch
        fetch('/api/auth/session') // Or a dedicated profile endpoint
            .then(res => res.json())
            .then(data => {
                // In a real app, we'd fetch the full profile here
                // For MVP, let's assume we fetch profile status
                // setStatus(data.user.certificationStatus);
                // Since we don't have a direct profile endpoint ready in this context, 
                // we might need to rely on the exam components to update state or fetch on mount
                // Let's mock it for now or implement a profile fetch helper
            });

        // Temporary mock for development flow
        // setStatus('NONE'); 
    }, []);

    // We need a way to get the current status. 
    // Let's assume we pass it in or fetch it.
    // For this implementation, I'll create a simple fetch in useEffect
    useEffect(() => {
        async function fetchStatus() {
            try {
                const res = await fetch('/api/creator/profile'); // We might need to ensure this exists or use server component
                if (res.ok) {
                    const data = await res.json();
                    setStatus(data.certificationStatus || 'NONE');
                    if (data.certificationStatus === 'THEORY_PASSED') {
                        setActiveTab('PRACTICAL');
                    }
                } else {
                    setStatus('NONE');
                }
            } catch (e) {
                console.error(e);
                setStatus('NONE');
            }
        }
        fetchStatus();
    }, []);


    if (status === 'LOADING') {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="container mx-auto py-10 max-w-4xl">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold mb-2">Creator Certification</h1>
                <p className="text-gray-500">Verify your skills to unlock paid campaigns.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className={`${activeTab === 'THEORY' ? 'border-primary ring-2 ring-primary/20' : ''} ${status !== 'NONE' ? 'bg-green-50/50' : ''}`}>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Phase 1: Knowledge</CardTitle>
                            {status !== 'NONE' && <CheckCircle className="text-green-500" />}
                        </div>
                        <CardDescription>UGC fundamentals & metrics</CardDescription>
                    </CardHeader>
                </Card>

                <Card className={`${activeTab === 'PRACTICAL' ? 'border-primary ring-2 ring-primary/20' : ''} ${status === 'CERTIFIED' ? 'bg-green-50/50' : ''}`}>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Phase 2: Practical</CardTitle>
                            {status === 'CERTIFIED' ? <CheckCircle className="text-green-500" /> : (status === 'NONE' ? <Lock className="text-gray-400" /> : null)}
                        </div>
                        <CardDescription>Video creation & strategy</CardDescription>
                    </CardHeader>
                </Card>
            </div>

            {status === 'CERTIFIED' ? (
                <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-6 text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-green-800 mb-2">You are Nala Certified!</h2>
                        <p className="text-green-700 mb-6">You have full access to apply for campaigns.</p>
                        <Button onClick={() => router.push('/creator/campaigns')}>Browse Campaigns</Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {activeTab === 'THEORY' && (
                        <TheoryExam
                            onPass={() => {
                                setStatus('THEORY_PASSED');
                                setActiveTab('PRACTICAL');
                            }}
                        />
                    )}

                    {activeTab === 'PRACTICAL' && (
                        <PracticalAssessment
                            canStart={status === 'THEORY_PASSED'}
                            onSubmit={() => {
                                // Refresh status or show pending state
                            }}
                        />
                    )}
                </>
            )}
        </div>
    );
}

