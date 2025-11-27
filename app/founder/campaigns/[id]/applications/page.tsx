"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Application = {
    id: string;
    message: string;
    portfolioLinks: string[];
    status: string;
    createdAt: string;
    creator: {
        id: string;
        fullName: string;
        email: string;
        creatorProfile: {
            bio: string | null;
            baseFeeTiktok: number;
            baseFeeInstagram: number;
            baseFeeFacebook: number;
            categories: string[];
        } | null;
    };
};

export default function ApplicationsPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    const fetchApplications = useCallback(async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`/api/campaigns/${params.id}/applications`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                setApplications(data.data?.applications || []);
            }
        } catch (error) {
            console.error("Error fetching applications:", error);
        } finally {
            setLoading(false);
        }
    }, [params.id]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const handleAccept = async (applicationId: string, creatorId: string) => {
        setProcessing(applicationId);
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`/api/campaigns/${params.id}/applications/${applicationId}/accept`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ creatorId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to accept application");
            }

            alert("Application accepted! Creator has been assigned to the campaign.");
            fetchApplications(); // Refresh the list
        } catch (error) {
            console.error("Error accepting application:", error);
            alert(error instanceof Error ? error.message : "Failed to accept application");
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (applicationId: string) => {
        if (!confirm("Are you sure you want to reject this application?")) return;

        setProcessing(applicationId);
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`/api/campaigns/${params.id}/applications/${applicationId}/reject`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to reject application");
            }

            alert("Application rejected.");
            fetchApplications(); // Refresh the list
        } catch (error) {
            console.error("Error rejecting application:", error);
            alert(error instanceof Error ? error.message : "Failed to reject application");
        } finally {
            setProcessing(null);
        }
    };

    if (loading) return <div className="p-8">Loading applications...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <Link href="/founder/dashboard" className="text-indigo-600 hover:text-indigo-800">
                        &larr; Back to Dashboard
                    </Link>
                </div>

                <div className="bg-white shadow rounded-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Campaign Applications</h1>

                    {applications.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No applications yet.</p>
                            <p className="text-gray-400 text-sm mt-2">Creators will see your campaign and can apply.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {applications.map((application) => (
                                <div
                                    key={application.id}
                                    className={`border rounded-lg p-6 ${application.status === "ACCEPTED"
                                        ? "border-green-300 bg-green-50"
                                        : application.status === "REJECTED"
                                            ? "border-red-300 bg-red-50"
                                            : "border-gray-200"
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-semibold text-gray-900">
                                                    {application.creator.fullName}
                                                </h3>
                                                <span
                                                    className={`text-xs px-2 py-1 rounded-full font-medium ${application.status === "ACCEPTED"
                                                        ? "bg-green-100 text-green-800"
                                                        : application.status === "REJECTED"
                                                            ? "bg-red-100 text-red-800"
                                                            : "bg-yellow-100 text-yellow-800"
                                                        }`}
                                                >
                                                    {application.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mb-4">{application.creator.email}</p>

                                            {application.creator.creatorProfile && (
                                                <div className="mb-4">
                                                    <div className="flex gap-4 text-sm">
                                                        <div>
                                                            <span className="text-gray-500">TikTok Rate:</span>
                                                            <span className="ml-2 font-medium">
                                                                ${application.creator.creatorProfile.baseFeeTiktok}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Instagram Rate:</span>
                                                            <span className="ml-2 font-medium">
                                                                ${application.creator.creatorProfile.baseFeeInstagram}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {application.creator.creatorProfile.categories.length > 0 && (
                                                        <div className="mt-2">
                                                            <span className="text-sm text-gray-500">Categories: </span>
                                                            {application.creator.creatorProfile.categories.map((cat, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mr-2"
                                                                >
                                                                    {cat}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {application.message && (
                                                <div className="mb-4">
                                                    <h4 className="text-sm font-medium text-gray-700 mb-1">Message:</h4>
                                                    <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded">
                                                        {application.message}
                                                    </p>
                                                </div>
                                            )}

                                            {application.portfolioLinks.length > 0 && (
                                                <div className="mb-4">
                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Portfolio:</h4>
                                                    <div className="space-y-1">
                                                        {application.portfolioLinks.map((link, idx) => (
                                                            <a
                                                                key={idx}
                                                                href={link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="block text-sm text-indigo-600 hover:text-indigo-800 truncate"
                                                            >
                                                                {link}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <p className="text-xs text-gray-400">
                                                Applied {new Date(application.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>

                                        {application.status === "PENDING" && (
                                            <div className="flex gap-2 ml-4">
                                                <button
                                                    onClick={() => handleAccept(application.id, application.creator.id)}
                                                    disabled={processing === application.id}
                                                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                                                >
                                                    {processing === application.id ? "Processing..." : "Accept"}
                                                </button>
                                                <button
                                                    onClick={() => handleReject(application.id)}
                                                    disabled={processing === application.id}
                                                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
