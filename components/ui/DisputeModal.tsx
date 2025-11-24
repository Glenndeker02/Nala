"use client";

import { useState } from "react";

interface DisputeModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaignId: string;
    videoId?: string;
    respondentId: string; // The user being disputed against
    respondentName: string;
}

export default function DisputeModal({
    isOpen,
    onClose,
    campaignId,
    videoId,
    respondentId,
    respondentName
}: DisputeModalProps) {
    const [category, setCategory] = useState("OTHER");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/disputes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    campaignId,
                    videoId,
                    respondentId,
                    category,
                    description,
                }),
            });

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                    setSuccess(false);
                    setDescription("");
                    setCategory("OTHER");
                }, 2000);
            } else {
                alert("Failed to submit dispute. Please try again.");
            }
        } catch (error) {
            console.error("Error submitting dispute:", error);
            alert("An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                    {success ? (
                        <div className="text-center py-8">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Dispute Submitted</h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Our support team will review your case and get back to you within 24 hours.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="sm:flex sm:items-start">
                                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        Report an Issue
                                    </h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500 mb-4">
                                            You are filing a dispute against <strong>{respondentName}</strong>.
                                        </p>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Reason</label>
                                                <select
                                                    value={category}
                                                    onChange={(e) => setCategory(e.target.value)}
                                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                                >
                                                    <option value="VIEW_COUNT_DISCREPANCY">View Count Discrepancy</option>
                                                    <option value="CONTENT_QUALITY">Content Quality Issue</option>
                                                    <option value="POSTING_VIOLATION">Posting Schedule Violation</option>
                                                    <option value="PAYMENT_ISSUE">Payment Issue</option>
                                                    <option value="OTHER">Other</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                                <textarea
                                                    rows={4}
                                                    required
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md mt-1"
                                                    placeholder="Please describe the issue in detail..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    {loading ? "Submitting..." : "Submit Dispute"}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
