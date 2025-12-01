import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

type Campaign = {
    id: string;
    name: string;
    founderName: string;
    baseFeePerVideo: number;
    videosRequested: number;
    briefData?: any;
};

interface QuickApplyModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaign: Campaign | null;
    onSuccess: () => void;
}

export function QuickApplyModal({ isOpen, onClose, campaign, onSuccess }: QuickApplyModalProps) {
    const [step, setStep] = useState<"review" | "form" | "success">("review");
    const [message, setMessage] = useState("");
    const [portfolioLinks, setPortfolioLinks] = useState<string[]>([""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!campaign) return null;

    const handleAddLink = () => {
        if (portfolioLinks.length < 3) {
            setPortfolioLinks([...portfolioLinks, ""]);
        }
    };

    const handleLinkChange = (index: number, value: string) => {
        const newLinks = [...portfolioLinks];
        newLinks[index] = value;
        setPortfolioLinks(newLinks);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            const validLinks = portfolioLinks.filter(link => link.trim() !== "");

            const response = await fetch(`/api/campaigns/${campaign.id}/apply`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message,
                    portfolioLinks: validLinks
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to submit application");
            }

            setStep("success");
            setTimeout(() => {
                onSuccess();
                handleClose();
            }, 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep("review");
        setMessage("");
        setPortfolioLinks([""]);
        setError("");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[600px]">
                {step === "review" && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Apply to {campaign.name}</DialogTitle>
                            <DialogDescription>
                                Review the campaign details before applying.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4 space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="text-sm text-gray-500">Brand</p>
                                        <p className="font-medium">{campaign.founderName}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Base Fee</p>
                                        <p className="font-bold text-primary-DEFAULT">${campaign.baseFeePerVideo}</p>
                                    </div>
                                </div>

                                {campaign.briefData?.mustHaves && (
                                    <div className="mt-4">
                                        <p className="text-sm font-medium mb-2">Requirements:</p>
                                        <ul className="text-sm text-gray-600 list-disc pl-4 space-y-1">
                                            {campaign.briefData.mustHaves.slice(0, 3).map((req: string, i: number) => (
                                                <li key={i}>{req}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <p>
                                    By applying, you agree to create {campaign.videosRequested} video(s)
                                    following the brand's guidelines if accepted.
                                </p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={handleClose}>Cancel</Button>
                            <Button onClick={() => setStep("form")}>Continue to Application</Button>
                        </DialogFooter>
                    </>
                )}

                {step === "form" && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Complete Application</DialogTitle>
                            <DialogDescription>
                                Add a personal note and relevant portfolio links.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="message">Message to Brand (Optional)</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Why are you a good fit for this campaign?"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="h-24"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Relevant Portfolio Links (Optional)</Label>
                                {portfolioLinks.map((link, index) => (
                                    <Input
                                        key={index}
                                        placeholder="https://tiktok.com/@username/video/..."
                                        value={link}
                                        onChange={(e) => handleLinkChange(index, e.target.value)}
                                        className="mb-2"
                                    />
                                ))}
                                {portfolioLinks.length < 3 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleAddLink}
                                        className="text-xs"
                                    >
                                        + Add another link
                                    </Button>
                                )}
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setStep("review")} disabled={loading}>
                                Back
                            </Button>
                            <Button onClick={handleSubmit} disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    "Submit Application"
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {step === "success" && (
                    <div className="py-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Application Sent!</h3>
                        <p className="text-gray-600">
                            The brand has been notified. You can track your application status in your dashboard.
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
