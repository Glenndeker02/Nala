"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

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
            <div className="text-center">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-8">
                    Join Nala
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <button
                        onClick={() => setUserType("founder")}
                        className="relative rounded-lg border border-gray-300 bg-white px-6 py-12 shadow-sm flex flex-col items-center hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        <span className="text-xl font-medium text-gray-900">I&apos;m a Founder</span>
                        <span className="mt-2 text-sm text-gray-500">
                            Hire creators for your campaigns
                        </span>
                    </button>

                    <button
                        onClick={() => setUserType("creator")}
                        className="relative rounded-lg border border-gray-300 bg-white px-6 py-12 shadow-sm flex flex-col items-center hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        <span className="text-xl font-medium text-gray-900">I&apos;m a Creator</span>
                        <span className="mt-2 text-sm text-gray-500">
                            Find campaigns and get paid
                        </span>
                    </button>
                </div>
                <p className="mt-8 text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Sign in
                    </Link>
                </p>
            </div>
        );
    }

    return (
        <div>
            <div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Sign up as a {userType === "founder" ? "Founder" : "Creator"}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Or{" "}
                    <button
                        onClick={() => setUserType(null)}
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        change account type
                    </button>
                </p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="rounded-md shadow-sm -space-y-px">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="firstName" className="sr-only">
                                First Name
                            </label>
                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="First Name"
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="sr-only">
                                Last Name
                            </label>
                            <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Last Name"
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {userType === "founder" && (
                        <div className="mb-4 space-y-4">
                            <div>
                                <label htmlFor="companyName" className="sr-only">
                                    Company Name
                                </label>
                                <input
                                    id="companyName"
                                    name="companyName"
                                    type="text"
                                    required
                                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Company Name"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="website" className="sr-only">
                                    Website URL
                                </label>
                                <input
                                    id="website"
                                    name="website"
                                    type="url"
                                    required
                                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Website URL (e.g. https://example.com)"
                                    value={formData.website}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email-address" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {loading ? "Creating account..." : "Create Account"}
                    </button>
                </div>

                <div className="text-center text-sm">
                    <span className="text-gray-600">Already have an account? </span>
                    <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
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
