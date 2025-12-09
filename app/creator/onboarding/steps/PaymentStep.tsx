"use client";

import { useState } from "react";

interface PaymentStepProps {
    onComplete: () => void;
    onBack: () => void;
}

export default function PaymentStep({ onComplete, onBack }: PaymentStepProps) {
    const [connecting, setConnecting] = useState(false);

    const handleConnectStripe = async () => {
        setConnecting(true);
        // TODO: Implement actual Stripe Connect flow
        // For now, simulate connection delay and complete
        setTimeout(() => {
            setConnecting(false);
            onComplete();
        }, 2000);
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Payment Setup</h2>
                <p className="text-gray-600 mt-2">Set up payouts to receive your earnings</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mb-4">
                    <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Stripe Connect</h3>
                <p className="mt-2 text-sm text-gray-500">
                    Tupstory uses Stripe to send you payments securely. You&apos;ll need to connect a bank account or debit card.
                </p>

                <div className="mt-6">
                    <button
                        onClick={handleConnectStripe}
                        disabled={connecting}
                        className="w-full inline-flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#635bff] hover:bg-[#544ee0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#635bff]"
                    >
                        {connecting ? "Connecting..." : "Connect Stripe Account"}
                    </button>
                </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                            You can skip this step for now, but you won&apos;t be able to receive payments until you complete setup.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-between pt-6">
                <button
                    onClick={onBack}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Back
                </button>
                <button
                    onClick={onComplete}
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Skip for now
                </button>
            </div>
        </div>
    );
}
