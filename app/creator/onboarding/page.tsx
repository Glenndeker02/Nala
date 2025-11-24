"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

// Steps
import RatesStep from "./steps/RatesStep";
import PortfolioStep from "./steps/PortfolioStep";
import BioStep from "./steps/BioStep";
import PaymentStep from "./steps/PaymentStep";

export default function CreatorOnboardingPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        baseFeeTiktok: 75,
        baseFeeInstagram: 75,
        baseFeeFacebook: 75,
        portfolioVideos: [],
        categories: [],
        bio: "",
    });

    const checkOnboardingStatus = useCallback(async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("/api/creator/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();

            if (data.profile?.isOnboardingComplete) {
                router.push("/creator/dashboard");
            } else {
                // Pre-fill data if partially completed
                if (data.profile) {
                    setFormData(prev => ({
                        ...prev,
                        baseFeeTiktok: Number(data.profile.baseFeeTiktok) || 75,
                        baseFeeInstagram: Number(data.profile.baseFeeInstagram) || 75,
                        baseFeeFacebook: Number(data.profile.baseFeeFacebook) || 75,
                        categories: data.profile.categories || [],
                        bio: data.profile.bio || "",
                        portfolioVideos: data.profile.portfolioVideos || [],
                    }));
                }
                setLoading(false);
            }
        } catch (error) {
            console.error("Error checking status:", error);
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        // Check if already completed
        checkOnboardingStatus();
    }, [checkOnboardingStatus]);

    const handleNext = () => {
        setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
    };

    const updateFormData = (data: any) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const handleComplete = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("/api/creator/onboarding/complete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                router.push("/creator/dashboard");
            } else {
                alert("Failed to save profile. Please try again.");
            }
        } catch (error) {
            console.error("Error completing onboarding:", error);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-500">Step {currentStep} of 4</span>
                        <span className="text-sm font-medium text-indigo-600">
                            {currentStep === 1 && "Set Rates"}
                            {currentStep === 2 && "Build Portfolio"}
                            {currentStep === 3 && "Bio & Categories"}
                            {currentStep === 4 && "Payment Setup"}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${(currentStep / 4) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Step Content */}
                <div className="bg-white shadow rounded-lg p-6 sm:p-8">
                    {currentStep === 1 && (
                        <RatesStep
                            data={formData}
                            updateData={updateFormData}
                            onNext={handleNext}
                        />
                    )}
                    {currentStep === 2 && (
                        <PortfolioStep
                            data={formData}
                            updateData={updateFormData}
                            onNext={handleNext}
                            onBack={handleBack}
                        />
                    )}
                    {currentStep === 3 && (
                        <BioStep
                            data={formData}
                            updateData={updateFormData}
                            onNext={handleNext}
                            onBack={handleBack}
                        />
                    )}
                    {currentStep === 4 && (
                        <PaymentStep
                            onComplete={handleComplete}
                            onBack={handleBack}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
