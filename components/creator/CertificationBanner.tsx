import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Award, ArrowRight } from "lucide-react";

export default function CertificationBanner() {
    const router = useRouter();
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCertificationStatus();
    }, []);

    const fetchCertificationStatus = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/creator/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setStatus(data.certificationStatus || "NONE");
            }
        } catch (error) {
            console.error("Failed to fetch certification status:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || status === "CERTIFIED") return null;

    if (status === "THEORY_PASSED") {
        return (
            <Card className="border-blue-200 bg-blue-50 mb-6">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Award className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-blue-900 mb-1">
                                Complete Your Certification
                            </h3>
                            <p className="text-sm text-blue-700 mb-3">
                                You've passed the theory exam! Submit your practical assessment to unlock campaign access.
                            </p>
                            <Button
                                size="sm"
                                onClick={() => router.push("/creator/certification")}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Complete Practical Exam
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // NONE status
    return (
        <Card className="border-yellow-200 bg-yellow-50 mb-6">
            <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-yellow-900">
                                Certification Required
                            </h3>
                            <Badge variant="outline" className="border-yellow-600 text-yellow-700">
                                Action Required
                            </Badge>
                        </div>
                        <p className="text-sm text-yellow-700 mb-3">
                            You must pass the Nala Creator Certification to apply for campaigns and unlock earning opportunities.
                        </p>
                        <Button
                            size="sm"
                            onClick={() => router.push("/creator/certification")}
                            className="bg-yellow-600 hover:bg-yellow-700"
                        >
                            Start Certification Exam
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
