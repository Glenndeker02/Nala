"use client";

import { useState } from "react";

interface RatesStepProps {
    data: any;
    updateData: (data: any) => void;
    onNext: () => void;
}

export default function RatesStep({ data, updateData, onNext }: RatesStepProps) {
    const [tiktokFee, setTiktokFee] = useState(data.baseFeeTiktok);
    const [instagramFee, setInstagramFee] = useState(data.baseFeeInstagram);
    const [facebookFee, setFacebookFee] = useState(data.baseFeeFacebook);

    const handleNext = () => {
        updateData({
            baseFeeTiktok: tiktokFee,
            baseFeeInstagram: instagramFee,
            baseFeeFacebook: facebookFee,
        });
        onNext();
    };

    const calculatePotentialEarnings = (fee: number) => {
        // Base fee + Performance bonus (max $400 for 100K views example)
        return fee + 400;
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Set Your Rates</h2>
                <p className="text-gray-600 mt-2">How much do you charge per video?</p>
            </div>

            {/* TikTok Rate */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                        <span className="text-xl mr-2">🎵</span>
                        <h3 className="font-medium text-gray-900">TikTok Base Fee</h3>
                    </div>
                    <span className="text-2xl font-bold text-indigo-600">${tiktokFee}</span>
                </div>

                <input
                    type="range"
                    min="50"
                    max="500"
                    step="5"
                    value={tiktokFee}
                    onChange={(e) => setTiktokFee(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>$50</span>
                    <span>$500</span>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-800">
                    <p>📊 Potential earnings for 100K views:</p>
                    <p className="font-medium">Base Fee ${tiktokFee} + Performance $400 = ${calculatePotentialEarnings(tiktokFee)} total</p>
                </div>
            </div>

            {/* Instagram Rate */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                        <span className="text-xl mr-2">📸</span>
                        <h3 className="font-medium text-gray-900">Instagram Base Fee</h3>
                    </div>
                    <span className="text-2xl font-bold text-pink-600">${instagramFee}</span>
                </div>

                <input
                    type="range"
                    min="50"
                    max="500"
                    step="5"
                    value={instagramFee}
                    onChange={(e) => setInstagramFee(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>$50</span>
                    <span>$500</span>
                </div>
            </div>

            {/* Facebook Rate */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                        <span className="text-xl mr-2">👍</span>
                        <h3 className="font-medium text-gray-900">Facebook Base Fee</h3>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">${facebookFee}</span>
                </div>

                <input
                    type="range"
                    min="50"
                    max="500"
                    step="5"
                    value={facebookFee}
                    onChange={(e) => setFacebookFee(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>$50</span>
                    <span>$500</span>
                </div>
            </div>

            <div className="pt-6">
                <button
                    onClick={handleNext}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Continue
                </button>
            </div>
        </div>
    );
}
