"use client";

import { useState } from "react";
import { X, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";

type AcceptApplicationModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onAccept: (instructions: string, deadline: string) => void;
    creatorName: string;
    campaignName: string;
    processing: boolean;
};

export default function AcceptApplicationModal({
    isOpen,
    onClose,
    onAccept,
    creatorName,
    campaignName,
    processing
}: AcceptApplicationModalProps) {
    const [instructions, setInstructions] = useState("");
    const [deadline, setDeadline] = useState("");
    const [template, setTemplate] = useState("custom");

    // Calculate default deadline (7 days from now)
    const getDefaultDeadline = () => {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        return date.toISOString().split('T')[0];
    };

    // Template options
    const templates = {
        custom: "",
        firstVideo: `Please create a 60-second video following these guidelines:

1. Hook (0-3 seconds): Start with an attention-grabbing question or statement
2. Introduction (3-10 seconds): Briefly introduce yourself and the product
3. Main Content (10-50 seconds): Showcase key features and benefits
4. Call-to-Action (50-60 seconds): Clear CTA with next steps

Format Requirements:
- Vertical video (9:16 aspect ratio)
- High quality (1080p minimum)
- Good lighting and clear audio
- Include product name in caption

Please submit your draft for review before posting.`,
        revision: `Thank you for your initial submission. Please make the following revisions:

1. Adjust the hook to be more engaging
2. Emphasize the key product benefits more clearly
3. Ensure the CTA is prominent and clear

Please resubmit within the deadline for final approval.`,
        urgent: `URGENT: Quick turnaround needed for this campaign.

Please prioritize this video and submit your draft as soon as possible. Follow the campaign brief closely and ensure all key messages are included.

Contact me immediately if you have any questions or concerns.`
    };

    const handleTemplateChange = (value: string) => {
        setTemplate(value);
        if (value !== "custom") {
            setInstructions(templates[value as keyof typeof templates]);
        }
    };

    const handleSubmit = () => {
        const finalDeadline = deadline || getDefaultDeadline();
        onAccept(instructions, finalDeadline);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Accept Application</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Provide instructions for {creatorName}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={processing}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Campaign Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-900">
                            <span className="font-semibold">Campaign:</span> {campaignName}
                        </p>
                        <p className="text-sm text-blue-900 mt-1">
                            <span className="font-semibold">Creator:</span> {creatorName}
                        </p>
                    </div>

                    {/* Template Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Instruction Template (Optional)
                        </label>
                        <select
                            value={template}
                            onChange={(e) => handleTemplateChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            disabled={processing}
                        >
                            <option value="custom">Custom Instructions</option>
                            <option value="firstVideo">First Video Guidelines</option>
                            <option value="revision">Revision Requirements</option>
                            <option value="urgent">Urgent Request</option>
                        </select>
                    </div>

                    {/* Instructions Textarea */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FileText className="w-4 h-4 inline mr-1" />
                            Instructions for Creator
                        </label>
                        <textarea
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            placeholder="Provide specific instructions, guidelines, and requirements for the creator..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[200px] resize-y"
                            maxLength={2000}
                            disabled={processing}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {instructions.length}/2000 characters
                        </p>
                    </div>

                    {/* Deadline Picker */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Submission Deadline
                        </label>
                        <input
                            type="date"
                            value={deadline || getDefaultDeadline()}
                            onChange={(e) => setDeadline(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            disabled={processing}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Default: 7 days from today
                        </p>
                    </div>

                    {/* Preview */}
                    {instructions && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Preview:</h4>
                            <div className="text-sm text-gray-600 whitespace-pre-wrap">
                                {instructions}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={processing}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={processing}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        {processing ? "Accepting..." : "Accept & Send Instructions"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
