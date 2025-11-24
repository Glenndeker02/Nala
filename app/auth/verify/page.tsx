"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function VerifyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState("Verifying your email...");

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage("No verification token found.");
            return;
        }

        const verifyEmail = async () => {
            try {
                const response = await fetch('/api/auth/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });

                const data = await response.json();

                if (response.ok) {
                    setStatus('success');
                    setMessage("Email verified successfully! You can now access all features.");
                    // Redirect to dashboard after 3 seconds
                    setTimeout(() => {
                        const userStr = localStorage.getItem('user');
                        if (userStr) {
                            const user = JSON.parse(userStr);
                            if (user.role === 'CREATOR') {
                                router.push('/creator/dashboard');
                            } else {
                                router.push('/founder/dashboard');
                            }
                        } else {
                            router.push('/auth/login');
                        }
                    }, 3000);
                } else {
                    setStatus('error');
                    setMessage(data.message || "Verification failed.");
                }
            } catch (error) {
                setStatus('error');
                setMessage("An error occurred during verification.");
            }
        };

        verifyEmail();
    }, [token, router]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Email Verification
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                    {status === 'verifying' && (
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                            <p className="text-gray-600">{message}</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex flex-col items-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Verified!</h3>
                            <p className="text-gray-600 mb-6">{message}</p>
                            <p className="text-sm text-gray-500">Redirecting you shortly...</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col items-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Verification Failed</h3>
                            <p className="text-red-600 mb-6">{message}</p>
                            <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
                                Back to Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyContent />
        </Suspense>
    );
}
