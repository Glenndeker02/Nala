"use client";

import { X, Calendar, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

type CreatorInstructionsModalProps = {
    isOpen: boolean;
    onClose: () => void;
    instructions: string | null;
    deadline: Date | null;
    acceptedAt: Date | null;
    campaignName: string;
    campaignId: string;
};

export default function CreatorInstructionsModal({
    isOpen,
    onClose,
    instructions,
    deadline,
    acceptedAt,
    campaignName,
    campaignId
}: CreatorInstructionsModalProps) {
    if (!isOpen) return null;

    // Calculate days remaining
    const getDaysRemaining = () => {
        if (!deadline) return null;
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysRemaining = getDaysRemaining();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-full">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Instructions from Founder</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Campaign: {campaignName}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Acceptance Info */}
                    {acceptedAt && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm text-green-900">
                                <span className="font-semibold">Accepted:</span>{" "}
                                {new Date(acceptedAt).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    )}

                    {/* Deadline */}
                    {deadline && (
                        <div className={`border rounded-lg p-4 ${daysRemaining !== null && daysRemaining < 3
                                ? 'bg-red-50 border-red-200'
                                : daysRemaining !== null && daysRemaining < 7
                                    ? 'bg-yellow-50 border-yellow-200'
                                    : 'bg-blue-50 border-blue-200'
                            }`}>
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className={`w-5 h-5 ${daysRemaining !== null && daysRemaining < 3
                                        ? 'text-red-600'
                                        : daysRemaining !== null && daysRemaining < 7
                                            ? 'text-yellow-600'
                                            : 'text-blue-600'
                                    }`} />
                                <h3 className={`font-semibold ${daysRemaining !== null && daysRemaining < 3
                                        ? 'text-red-900'
                                        : daysRemaining !== null && daysRemaining < 7
                                            ? 'text-yellow-900'
                                            : 'text-blue-900'
                                    }`}>
                                    Submission Deadline
                                </h3>
                            </div>
                            <p className={`text-sm ${daysRemaining !== null && daysRemaining < 3
                                    ? 'text-red-900'
                                    : daysRemaining !== null && daysRemaining < 7
                                        ? 'text-yellow-900'
                                        : 'text-blue-900'
                                }`}>
                                {new Date(deadline).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                            {daysRemaining !== null && (
                                <p className={`text-xs mt-1 font-medium ${daysRemaining < 3
                                        ? 'text-red-700'
                                        : daysRemaining < 7
                                            ? 'text-yellow-700'
                                            : 'text-blue-700'
                                    }`}>
                                    {daysRemaining > 0
                                        ? `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`
                                        : daysRemaining === 0
                                            ? 'Due today!'
                                            : `${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) !== 1 ? 's' : ''} overdue`
                                    }
                                </p>
                            )}
                        </div>
                    )}

                    {/* Instructions */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <FileText className="w-5 h-5 text-gray-600" />
                            <h3 className="font-semibold text-gray-900">Instructions</h3>
                        </div>
                        {instructions ? (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <p className="text-gray-700 whitespace-pre-wrap">{instructions}</p>
                            </div>
                        ) : (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <p className="text-gray-500 italic">
                                    No specific instructions provided. Please follow the campaign brief.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Next Steps Checklist */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Next Steps</h3>
                        <div className="space-y-2">
                            <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                                <div className="w-5 h-5 rounded border-2 border-gray-300 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-gray-700">Review the campaign brief and requirements</p>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                                <div className="w-5 h-5 rounded border-2 border-gray-300 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-gray-700">Create your video content following the guidelines</p>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                                <div className="w-5 h-5 rounded border-2 border-gray-300 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-gray-700">Submit your draft video for review before the deadline</p>
                            </div>
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-900">
                            ⚠️ <span className="font-semibold">Important:</span> Failure to submit by the deadline or comply with requirements may result in removal from the campaign.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                    <Button
                        variant="outline"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                    <Button
                        onClick={() => window.location.href = `/creator/campaigns/${campaignId}`}
                        className="bg-primary-600 hover:bg-primary-700 text-white"
                    >
                        View Campaign Brief
                    </Button>
                </div>
            </div>
        </div>
    );
}
