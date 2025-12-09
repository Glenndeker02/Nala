import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { CheckCircle, Award } from "lucide-react";

interface CertificationCardProps {
    status: "NONE" | "PENDING" | "CERTIFIED" | "FAILED" | "THEORY_PASSED";
    score?: number;
}

export function CertificationCard({ status }: CertificationCardProps) {
    const isCertified = status === "CERTIFIED";
    const isInProgress = status === "THEORY_PASSED";

    return (
        <Card className={`border-l-4 ${isCertified ? 'border-l-green-500' : (isInProgress ? 'border-l-yellow-500' : 'border-l-blue-500')}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                    <Award className={`w-5 h-5 ${isCertified ? 'text-green-500' : 'text-blue-500'}`} />
                    <CardTitle className="text-lg">Nala Certification</CardTitle>
                </div>
                {isCertified && (
                    <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Certified
                    </Badge>
                )}
                {isInProgress && (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100">
                        In Progress
                    </Badge>
                )}
            </CardHeader>
            <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                    {isCertified
                        ? "You are a Nala Certified Creator! This badge gives you access to premium campaigns and higher earning potential."
                        : "Become a Nala Certified Creator to unlock exclusive campaigns, higher visibility, and premium rates."}
                </p>

                {!isCertified && (
                    <Link href="/creator/certification">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                            {status === "FAILED" ? "Retake Certification Exam" : (
                                isInProgress ? "Continue Assessment" : "Start Certification Exam"
                            )}
                        </Button>
                    </Link>
                )}

                {isCertified && (
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Verified and active</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
