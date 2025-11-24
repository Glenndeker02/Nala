"use client";

import { useState } from "react";

interface BioStepProps {
    data: any;
    updateData: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
}

const CATEGORIES = [
    "SaaS & Software",
    "E-commerce",
    "Health & Fitness",
    "B2B Tech",
    "Beauty",
    "Food & Beverage",
    "Finance",
    "Fashion",
    "Gaming",
    "Education",
    "Travel",
    "Lifestyle"
];

export default function BioStep({ data, updateData, onNext, onBack }: BioStepProps) {
    const [selectedCategories, setSelectedCategories] = useState<string[]>(data.categories || []);
    const [bio, setBio] = useState(data.bio || "");

    const toggleCategory = (category: string) => {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(selectedCategories.filter(c => c !== category));
        } else {
            setSelectedCategories([...selectedCategories, category]);
        }
    };

    const handleNext = () => {
        updateData({
            categories: selectedCategories,
            bio,
        });
        onNext();
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Category & Bio</h2>
                <p className="text-gray-600 mt-2">Tell brands about yourself and your niche</p>
            </div>

            {/* Categories */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    What niches do you specialize in? (Select all that apply)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {CATEGORIES.map((category) => (
                        <div
                            key={category}
                            onClick={() => toggleCategory(category)}
                            className={`
                cursor-pointer rounded-md px-3 py-2 text-sm font-medium border text-center transition-colors
                ${selectedCategories.includes(category)
                                    ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}
              `}
                        >
                            {category}
                        </div>
                    ))}
                </div>
            </div>

            {/* Bio */}
            <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Tell brands about yourself
                </label>
                <div className="mt-1">
                    <textarea
                        id="bio"
                        name="bio"
                        rows={5}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Hi! I'm a tech enthusiast who creates engaging video reviews for SaaS products..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        maxLength={500}
                    />
                </div>
                <p className="mt-2 text-sm text-gray-500 text-right">
                    {bio.length}/500 characters
                </p>
            </div>

            <div className="flex justify-between pt-6">
                <button
                    onClick={onBack}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Back
                </button>
                <button
                    onClick={handleNext}
                    disabled={selectedCategories.length === 0 || bio.length < 10}
                    className={`
            ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white 
            ${selectedCategories.length === 0 || bio.length < 10
                            ? "bg-indigo-400 cursor-not-allowed"
                            : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"}
          `}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}
