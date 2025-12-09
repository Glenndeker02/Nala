import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/Dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCampaignRealtime } from "@/lib/hooks/useWebSocket";
import { Plus, Info, CheckCircle2, AlertCircle } from "lucide-react";

interface Instruction {
    id: string;
    text: string;
    attachedLibraryItemId: string | null;
    authorId: string;
    author: {
        fullName: string;
        profilePictureUrl: string | null;
    };
    createdAt: string;
    appliesTo: string;
    videoNumber: number | null;
    requiresAcknowledgment: boolean;
    acknowledgedBy: string[];
    status: string;
}

interface Creator {
    id: string;
    fullName: string;
    profilePictureUrl: string | null;
}

interface InstructionsCardProps {
    campaignId: string;
    briefData: any;
    videosRequested: number;
}

export default function InstructionsCard({ campaignId, briefData, videosRequested }: InstructionsCardProps) {
    const [instructions, setInstructions] = useState<Instruction[]>([]);
    const [creators, setCreators] = useState<Creator[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [newInstruction, setNewInstruction] = useState("");
    const [appliesTo, setAppliesTo] = useState("ALL");
    const [scope, setScope] = useState("CAMPAIGN"); // CAMPAIGN or VIDEO
    const [videoNumber, setVideoNumber] = useState<string>("1");
    const [requiresAcknowledgment, setRequiresAcknowledgment] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { lastEvent } = useCampaignRealtime(campaignId);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");

            // Fetch Instructions
            const instructionsRes = await fetch(`/api/campaigns/${campaignId}/instructions`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const instructionsData = await instructionsRes.json();

            // Fetch Accepted Creators (via Applications)
            const applicationsRes = await fetch(`/api/campaigns/${campaignId}/applications`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const applicationsData = await applicationsRes.json();

            if (instructionsData.success) {
                setInstructions(instructionsData.data);
            }

            if (applicationsData.success) {
                const accepted = applicationsData.applications
                    .filter((app: any) => app.status === 'ACCEPTED')
                    .map((app: any) => ({
                        id: app.creator.id,
                        fullName: app.creator.fullName,
                        profilePictureUrl: app.creator.profilePictureUrl
                    }));
                setCreators(accepted);
            }

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddInstruction = async () => {
        if (!newInstruction.trim()) return;
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/campaigns/${campaignId}/instructions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    text: newInstruction,
                    appliesTo: appliesTo,
                    videoNumber: scope === 'VIDEO' ? parseInt(videoNumber) : null,
                    requiresAcknowledgment,
                    instructionType: scope === 'VIDEO' ? 'VIDEO_SPECIFIC' : 'OVERALL_CAMPAIGN'
                }),
            });

            if (response.ok) {
                setNewInstruction("");
                setAppliesTo("ALL");
                setScope("CAMPAIGN");
                setIsDialogOpen(false);
                fetchData();
            }
        } catch (error) {
            console.error("Error adding instruction:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [campaignId]);

    // Refresh on realtime updates
    useEffect(() => {
        if (lastEvent && (lastEvent.type === 'INSTRUCTION_ADDED' || lastEvent.type === 'INSTRUCTION_ACKNOWLEDGED')) {
            fetchData();
        }
    }, [lastEvent]);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Content Brief & Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Content Brief & Instructions</CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Instruction
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Instruction</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Instruction</Label>
                                <Textarea
                                    placeholder="Enter detailed instruction..."
                                    value={newInstruction}
                                    onChange={(e) => setNewInstruction(e.target.value)}
                                    rows={4}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Applies To</Label>
                                    <Select value={appliesTo} onValueChange={setAppliesTo}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">All Creators</SelectItem>
                                            {creators.map(creator => (
                                                <SelectItem key={creator.id} value={creator.id}>
                                                    {creator.fullName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Scope</Label>
                                    <Select value={scope} onValueChange={setScope}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CAMPAIGN">Whole Campaign</SelectItem>
                                            <SelectItem value="VIDEO">Specific Video</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {scope === 'VIDEO' && (
                                <div className="space-y-2">
                                    <Label>Video Number</Label>
                                    <Select value={videoNumber} onValueChange={setVideoNumber}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: videosRequested }, (_, i) => i + 1).map(num => (
                                                <SelectItem key={num} value={num.toString()}>
                                                    Video {num}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="ack"
                                    checked={requiresAcknowledgment}
                                    onCheckedChange={(checked) => setRequiresAcknowledgment(checked as boolean)}
                                />
                                <Label htmlFor="ack">Require Acknowledgment</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleAddInstruction} disabled={!newInstruction.trim() || isSubmitting}>
                                {isSubmitting ? "Saving..." : "Save Instruction"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Static Brief Data */}
                    {briefData && (
                        <div className="space-y-4 pb-6 border-b border-gray-100">
                            {briefData.targetAudience && (
                                <div>
                                    <p className="text-sm font-medium text-gray-900 mb-1">Target Audience</p>
                                    <p className="text-gray-600">{briefData.targetAudience}</p>
                                </div>
                            )}
                            {briefData.mustHaves && briefData.mustHaves.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-gray-900 mb-1">Must Haves</p>
                                    <ul className="list-disc list-inside text-gray-600">
                                        {briefData.mustHaves.map((item: string, i: number) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Dynamic Instructions */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            Additional Instructions
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                                {instructions.length}
                            </span>
                        </h3>

                        {instructions.length === 0 ? (
                            <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                <Info className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">No additional instructions added yet.</p>
                                <Button variant="link" size="sm" onClick={() => setIsDialogOpen(true)}>
                                    + Add your first instruction
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {instructions.map((inst) => {
                                    const targetCreator = inst.appliesTo === 'ALL'
                                        ? 'All Creators'
                                        : creators.find(c => c.id === inst.appliesTo)?.fullName || 'Unknown Creator';

                                    const scopeLabel = inst.videoNumber
                                        ? `Video ${inst.videoNumber}`
                                        : 'Whole Campaign';

                                    const ackCount = inst.acknowledgedBy.length;
                                    const totalTarget = inst.appliesTo === 'ALL' ? creators.length : 1;
                                    const isFullyAck = totalTarget > 0 && ackCount >= totalTarget;

                                    return (
                                        <div key={inst.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <span className="font-medium text-gray-900">{inst.author.fullName}</span>
                                                    <span>•</span>
                                                    <span>{new Date(inst.createdAt).toLocaleDateString()}</span>
                                                    <span>•</span>
                                                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                                                        To: {targetCreator}
                                                    </span>
                                                    <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                                                        {scopeLabel}
                                                    </span>
                                                </div>
                                                {inst.requiresAcknowledgment && (
                                                    <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${isFullyAck ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                                                        }`}>
                                                        {isFullyAck ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                                        {ackCount}/{totalTarget} Acknowledged
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-gray-800 text-sm whitespace-pre-wrap">{inst.text}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
