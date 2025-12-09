'use client';

import { useState, useEffect } from 'react';

interface Template {
    id: string;
    name: string;
    content: string;
    type: 'GLOBAL' | 'VIDEO_SPECIFIC';
    attachedLinks: any[];
    attachedLibraryItems: any[];
}

interface SendInstructionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSend: (data: any) => Promise<void>;
    creatorName: string;
    videoCount: number;
}

export default function SendInstructionsModal({
    isOpen,
    onClose,
    onSend,
    creatorName,
    videoCount
}: SendInstructionsModalProps) {
    const [step, setStep] = useState(1);
    const [overallInstructions, setOverallInstructions] = useState('');
    const [videoInstructions, setVideoInstructions] = useState<any[]>([]);
    const [links, setLinks] = useState<{ title: string; url: string }[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchTemplates();
            // Initialize video instructions
            setVideoInstructions(Array(videoCount).fill(null).map((_, i) => ({
                videoNumber: i + 1,
                instructions: '',
                deadline: ''
            })));
        }
    }, [isOpen, videoCount]);

    const fetchTemplates = async () => {
        try {
            const res = await fetch('/api/templates');
            const data = await res.json();
            setTemplates(data.templates || []);
        } catch (err) {
            console.error('Failed to fetch templates', err);
        }
    };

    const handleApplyTemplate = (templateId: string) => {
        const template = templates.find(t => t.id === templateId);
        if (!template) return;

        setOverallInstructions(template.content);
        if (template.attachedLinks) {
            setLinks([...links, ...template.attachedLinks]);
        }
        // Logic for library items would go here
    };

    const handleSaveTemplate = async (name: string) => {
        try {
            const res = await fetch('/api/templates/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    content: overallInstructions,
                    type: 'GLOBAL',
                    attachedLinks: links
                })
            });
            if (res.ok) {
                alert('Template saved!');
                fetchTemplates();
            }
        } catch (err) {
            alert('Failed to save template');
        }
    };

    const handleSubmit = async () => {
        setSending(true);
        try {
            await onSend({
                overallInstructions,
                videoInstructions,
                instructionLinks: links,
                // instructionLibraryItems
            });
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Send Instructions to {creatorName}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Template Selector */}
                    <div className="flex items-center space-x-4 mb-6">
                        <select
                            value={selectedTemplate}
                            onChange={(e) => {
                                setSelectedTemplate(e.target.value);
                                handleApplyTemplate(e.target.value);
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="">Select a template...</option>
                            {templates.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => {
                                const name = prompt('Template Name:');
                                if (name) handleSaveTemplate(name);
                            }}
                            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                            Save Current as Template
                        </button>
                    </div>

                    {/* Overall Instructions */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Overall Campaign Instructions</label>
                        <textarea
                            value={overallInstructions}
                            onChange={(e) => setOverallInstructions(e.target.value)}
                            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe the general vibe, do's and don'ts..."
                        />
                    </div>

                    {/* Links */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Attached Links</label>
                        {links.map((link, i) => (
                            <div key={i} className="flex items-center space-x-2 mb-2">
                                <input
                                    value={link.title}
                                    readOnly
                                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                                />
                                <a href={link.url} target="_blank" className="text-blue-600 hover:underline">View</a>
                                <button onClick={() => setLinks(links.filter((_, idx) => idx !== i))} className="text-red-500">×</button>
                            </div>
                        ))}
                        <div className="flex space-x-2">
                            <input id="linkTitle" placeholder="Link Title" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" />
                            <input id="linkUrl" placeholder="URL" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" />
                            <button
                                onClick={() => {
                                    const title = (document.getElementById('linkTitle') as HTMLInputElement).value;
                                    const url = (document.getElementById('linkUrl') as HTMLInputElement).value;
                                    if (title && url) {
                                        setLinks([...links, { title, url }]);
                                        (document.getElementById('linkTitle') as HTMLInputElement).value = '';
                                        (document.getElementById('linkUrl') as HTMLInputElement).value = '';
                                    }
                                }}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                                Add Link
                            </button>
                        </div>
                    </div>

                    {/* Video Specific Instructions */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Per-Video Instructions</h3>
                        {videoInstructions.map((v, i) => (
                            <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <h4 className="font-medium text-gray-900 mb-2">Video #{v.videoNumber}</h4>
                                <textarea
                                    value={v.instructions}
                                    onChange={(e) => {
                                        const newVI = [...videoInstructions];
                                        newVI[i].instructions = e.target.value;
                                        setVideoInstructions(newVI);
                                    }}
                                    className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg mb-2"
                                    placeholder="Specific instructions for this video..."
                                />
                                <input
                                    type="date"
                                    value={v.deadline}
                                    onChange={(e) => {
                                        const newVI = [...videoInstructions];
                                        newVI[i].deadline = e.target.value;
                                        setVideoInstructions(newVI);
                                    }}
                                    className="px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-6 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={sending}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {sending ? 'Sending...' : 'Send Instructions & Accept'}
                    </button>
                </div>
            </div>
        </div>
    );
}
