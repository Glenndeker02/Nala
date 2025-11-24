"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminRegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        adminCode: "", // Secret code to verify admin registration
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        // Verify admin code (you should set this in environment variables)
        const ADMIN_REGISTRATION_CODE = process.env.NEXT_PUBLIC_ADMIN_CODE || "NALA_ADMIN_2024";
        if (formData.adminCode !== ADMIN_REGISTRATION_CODE) {
            setError("Invalid admin registration code");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    password: formData.password,
                    role: "ADMIN", // Force ADMIN role
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Registration failed");
            }

            // Store auth data
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            // Redirect to admin dashboard
            router.push("/admin/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div>
                    <div className="flex justify-center">
                        <div className="bg-red-600 p-3 rounded-full">
                            <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                        Create Admin Account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-300">
                        Requires admin registration code
                    </p>
                </div>

                {/* Registration Form */}
                <form className="mt-8 space-y-6 bg-white rounded-lg shadow-2xl p-8" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-md bg-red-50 p-4 border-l-4 border-red-400">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                Full Name
                            </label>
                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                required
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                placeholder="admin@nala.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                placeholder="••••••••"
                            />
                            <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <label htmlFor="adminCode" className="block text-sm font-medium text-gray-700">
                                Admin Registration Code
                            </label>
                            <input
                                id="adminCode"
                                name="adminCode"
                                type="password"
                                required
                                value={formData.adminCode}
                                onChange={(e) => setFormData({ ...formData, adminCode: e.target.value })}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-red-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm bg-red-50"
                                placeholder="Enter secret admin code"
                            />
                            <p className="mt-1 text-xs text-red-600">
                                ⚠️ This code is required to create admin accounts
                            </p>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Creating Account..." : "Create Admin Account"}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link
                            href="/admin/auth/login"
                            className="text-sm font-medium text-red-600 hover:text-red-500"
                        >
                            Already have an admin account? Sign in
                        </Link>
                    </div>
                </form>

                {/* Security Notice */}
                <div className="text-center">
                    <p className="text-xs text-gray-400">
                        🔒 Admin registration requires a secret code.
                        <br />
                        Contact your system administrator if you need access.
                    </p>
                </div>

                {/* Back to main site */}
                <div className="text-center">
                    <Link
                        href="/auth/register"
                        className="text-sm text-gray-300 hover:text-white"
                    >
                        ← Back to main registration
                    </Link>
                </div>
            </div>
        </div>
    );
}
