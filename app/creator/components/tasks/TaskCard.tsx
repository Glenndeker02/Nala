import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Clock, CheckCircle, AlertCircle, DollarSign, PlayCircle } from "lucide-react";
import Link from "next/link";

interface TaskCardProps {
    campaign: {
        id: string;
        name: string;
        founderName: string;
        status: string;
        progress: {
            completed: number;
            total: number;
            percentage: number;
        };
        deadline: string | null;
        earnings: {
            earned: number;
            potential: number;
            baseFee: number;
        };
        isUrgent: boolean;
    };
}

export function TaskCard({ campaign }: TaskCardProps) {
    const getStatusBadge = () => {
        if (campaign.status === 'Completed') {
            return <Badge className="bg-green-100 text-green-700 border-green-300"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>;
        }
        if (campaign.status === 'Action Required') {
            return <Badge className="bg-red-100 text-red-700 border-red-300"><AlertCircle className="w-3 h-3 mr-1" /> Action Required</Badge>;
        }
        if (campaign.status === 'In Review') {
            return <Badge className="bg-blue-100 text-blue-700 border-blue-300"><Clock className="w-3 h-3 mr-1" /> In Review</Badge>;
        }
        return <Badge className="bg-gray-100 text-gray-700 border-gray-300">Active</Badge>;
    };

    const getBorderClass = () => {
        if (campaign.isUrgent) return "border-l-4 border-l-red-500 bg-red-50/30";
        if (campaign.status === 'Completed') return "border-l-4 border-l-green-500 bg-green-50/30";
        return "";
    };

    return (
        <Card className={`hover:shadow-xl transition-shadow ${getBorderClass()}`}>
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{campaign.name}</h3>
                            {getStatusBadge()}
                        </div>
                        <p className="text-gray-600 mb-4 flex items-center gap-2">
                            <span className="font-medium">{campaign.founderName}</span>
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Progress</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[100px]">
                                        <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${campaign.progress.percentage}%` }}></div>
                                    </div>
                                    <span className="text-xs font-medium">{campaign.progress.completed}/{campaign.progress.total}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Deadline</p>
                                <p className={`text-sm font-medium ${campaign.isUrgent ? 'text-red-600' : 'text-gray-900'}`}>
                                    {campaign.deadline ? new Date(campaign.deadline).toLocaleDateString() : 'No Deadline'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Earned / Potential</p>
                                <p className="text-sm font-bold text-primary-DEFAULT">
                                    ${campaign.earnings.earned} <span className="text-gray-400 font-normal">/ ${campaign.earnings.potential}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="ml-6 flex flex-col gap-3">
                        <Link href={`/creator/tasks/${campaign.id}`}>
                            <Button size="sm" className="px-6">
                                View Details
                            </Button>
                        </Link>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

