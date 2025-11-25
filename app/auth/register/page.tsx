"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const typeParam = searchParams.get("type");

    const [userType, setUserType] = useState<"founder" | "creator" | null>(null);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        companyName: "", // Founder only
        website: "", // Founder only
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (typeParam === "founder" || typeParam === "creator") {
            setUserType(typeParam);
        }
    }, [typeParam]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    fullName: `${formData.firstName} ${formData.lastName}`,
                    role: userType === 'founder' ? 'FOUNDER' : 'CREATOR',
                    ...(userType === 'founder' && {
                        companyName: formData.companyName,
                    }),
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Registration failed');
            }

            // Extract data from the wrapped response
            const { data } = result;

            // Store auth data
            localStorage.setItem('token', data.accessToken);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect based on role
            if (data.user.role === 'FOUNDER') {
                router.push('/founder/dashboard');
            } else {
                router.push('/creator/onboarding');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert(error instanceof Error ? error.message : 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    if (!userType) {
        return (
            <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">
                    Join Nala
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <button
                        onClick={() => setUserType("founder")}
                        className="relative rounded-2xl border border-gray-200 bg-white px-6 py-12 shadow-sm flex flex-col items-center hover:border-primary-DEFAULT hover:shadow-md transition-all duration-200 group"
                    >
                        <div className="h-12 w-12 bg-primary-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                            <svg className="w-6 h-6 text-primary-DEFAULT" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-gray-900">I'm a Founder</span>
                        <span className="mt-2 text-sm text-gray-500">
                            Hire creators for your campaigns
                        </span>
                    </button>

                    <button
                        onClick={() => setUserType("creator")}
                        className="relative rounded-2xl border border-gray-200 bg-white px-6 py-12 shadow-sm flex flex-col items-center hover:border-primary-DEFAULT hover:shadow-md transition-all duration-200 group"
                    >
                        <div className="h-12 w-12 bg-primary-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                            <svg className="w-6 h-6 text-primary-DEFAULT" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-gray-900">I'm a Creator</span>
                        <span className="mt-2 text-sm text-gray-500">
                            Find campaigns and get paid
                        </span>
                    </button>
                </div>
                <p className="mt-8 text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="font-medium text-primary-DEFAULT hover:text-primary-600">
                        Sign in
                    </Link>
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-md w-full mx-auto">
            <div>
                <h2 className="mt-2 text-center text-3xl font-bold text-gray-900 tracking-tight">
                    Sign up as a {userType === "founder" ? "Founder" : "Creator"}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Or{" "}
                    <button
                        onClick={() => setUserType(null)}
                        className="font-medium text-primary-DEFAULT hover:text-primary-600"
                    >
                        change account type
                    </button>
                </p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                First Name
                            </label>
                            <Input
                                id="firstName"
                                name="firstName"
                                type="text"
                                required
                                placeholder="First Name"
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name
                            </label>
                            <Input
                                id="lastName"
                                name="lastName"
                                type="text"
                                required
                                placeholder="Last Name"
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {userType === "founder" && (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Company Name
                                </label>
                                <Input
                                    id="companyName"
                                    name="companyName"
                                    type="text"
                                    required
                                    placeholder="Company Name"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                                    Website URL
                                </label>
                                <Input
                                    id="website"
                                    name="website"
                                    type="url"
                                    required
                                    placeholder="https://example.com"
                                    value={formData.website}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                            Email address
                        </label>
                        <Input
                            id="email-address"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password
                        </label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            required
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full"
                        size="lg"
                    >
                        {loading ? "Creating account..." : "Create Account"}
                    </Button>
                </div>

                <div className="text-center text-sm">
                    <span className="text-gray-600">Already have an account? </span>
                    <Link href="/auth/login" className="font-medium text-primary-DEFAULT hover:text-primary-600">
                        Sign in
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <Suspense fallback={<div>Loading...</div>}>
                    <RegisterForm />
                </Suspense>
            </div>
        </div>
    );
}
