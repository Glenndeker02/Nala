"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Briefcase, DollarSign, Calendar } from "lucide-react";
import Link from "next/link";

interface Assignment {
    id: string;
    campaignName: string;
    brandName: string;
    status: 'PENDING' | 'DRAFT' | 'REVIEW' | 'APPROVED' | 'POSTED';
    dueDate: string;
    deliverableType: string;
    paymentAmount: number;
}

export default function ActiveAssignmentsCard() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await fetch("/api/creator/dashboard/assignments", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const result = await response.json();
                if (result.success) {
                    setAssignments(result.data.assignments);
                }
            } catch (err) {
                console.error("Error fetching assignments:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-700';
            case 'DRAFT': return 'bg-blue-100 text-blue-700';
            case 'REVIEW': return 'bg-purple-100 text-purple-700';
            case 'APPROVED': return 'bg-green-100 text-green-700';
            case 'POSTED': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <Card className="h-full border-none shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-gray-500" />
                    Active Assignments
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : assignments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No active assignments</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {assignments.map((assignment) => (
                            <div key={assignment.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-1">{assignment.campaignName}</h4>
                                        <p className="text-xs text-gray-500">{assignment.brandName}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(assignment.status)}`}>
                                        {assignment.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>{assignment.dueDate}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <DollarSign className="w-3 h-3" />
                                        <span>${assignment.paymentAmount}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Link href={`/creator/campaigns/${assignment.campaignId}`} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full text-xs h-8">
                                            View Details
                                        </Button>
                                    </Link>
                                    {assignment.status === 'PENDING' && (
                                        <Link href={`/creator/campaigns/${assignment.campaignId}/upload`} className="flex-1">
                                            <Button size="sm" className="w-full text-xs h-8">
                                                Upload Draft
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
