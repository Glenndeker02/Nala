"use client";

import { motion } from "framer-motion";

interface RoleSelectorProps {
    role: "creator" | "founder";
    setRole: (role: "creator" | "founder") => void;
}

export default function RoleSelector({ role, setRole }: RoleSelectorProps) {
    return (
        <div className="flex justify-center mb-12">
            <div className="bg-surface-100 p-1 rounded-full inline-flex relative">
                {/* Sliding Background */}
                <motion.div
                    className="absolute top-1 bottom-1 bg-white rounded-full shadow-sm"
                    initial={false}
                    animate={{
                        left: role === "creator" ? "4px" : "50%",
                        width: "calc(50% - 4px)",
                        x: role === "founder" ? "0%" : "0%",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />

                <button
                    onClick={() => setRole("creator")}
                    className={`relative z-10 px-8 py-3 rounded-full text-sm font-semibold transition-colors duration-200 ${role === "creator" ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    I&apos;m a Creator
                </button>
                <button
                    onClick={() => setRole("founder")}
                    className={`relative z-10 px-8 py-3 rounded-full text-sm font-semibold transition-colors duration-200 ${role === "founder" ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    I&apos;m a Founder
                </button>
            </div>
        </div>
    );
}
