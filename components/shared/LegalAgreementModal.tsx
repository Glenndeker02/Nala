'use client';

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, ChevronDown, Lock, CheckCircle, X } from 'lucide-react';
import Markdown from 'react-markdown';
import { LEGAL_TEXTS } from './LegalText';

interface LegalAgreementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAgree: () => void;
    role: 'CREATOR' | 'FOUNDER';
    agreementType: 'CREATOR_CAMPAIGN_APPLY' | 'FOUNDER_CAMPAIGN_CREATE';
    title?: string;
}

export function LegalAgreementModal({ isOpen, onClose, onAgree, role, agreementType, title }: LegalAgreementModalProps) {
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const legalContent = LEGAL_TEXTS[agreementType] || "Legal agreement content not found.";

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setHasScrolledToBottom(false);
            setIsChecked(false);
        }
    }, [isOpen]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        // Check if scrolled to bottom (allow 20px buffer)
        if (scrollHeight - scrollTop - clientHeight < 20) {
            setHasScrolledToBottom(true);
        }
    };


    const handleAgree = () => {
        // Simply close the modal and proceed - no API call
        onAgree();
    };


    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-4xl relative max-h-[90vh] overflow-hidden">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4 opacity-70 hover:opacity-100 ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100 data-[state=open]:text-slate-500 z-10"
                    onClick={onClose}
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </Button>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary-DEFAULT" />
                        {title || "Terms of Service Agreement"}
                    </DialogTitle>
                    <DialogDescription>
                        Please read the following agreement carefully. You must scroll to the bottom to proceed.
                    </DialogDescription>
                </DialogHeader>

                <div
                    className="border rounded-md p-4 h-[300px] overflow-y-auto bg-gray-50 text-sm leading-relaxed"
                    onScroll={handleScroll}
                    ref={scrollRef}
                >
                    <div className="prose prose-sm max-w-none text-gray-700">
                        <Markdown>{legalContent}</Markdown>
                    </div>

                    {!hasScrolledToBottom && (
                        <div className="text-center mt-4 pb-2 text-gray-400 text-xs flex items-center justify-center animate-pulse">
                            <ChevronDown className="h-4 w-4 mr-1" />
                            Scroll to read more
                        </div>
                    )}
                </div>

                <div className={`flex items-start space-x-2 p-3 rounded-md transition-colors mt-4 ${hasScrolledToBottom ? 'bg-white' : 'bg-gray-100 opacity-50'}`}>
                    <Checkbox
                        id="terms"
                        checked={isChecked}
                        onCheckedChange={(checked) => setIsChecked(checked as boolean)}
                        disabled={!hasScrolledToBottom}
                        className="mt-1"
                    />
                    <div className="grid gap-1.5 leading-none">
                        <label
                            htmlFor="terms"
                            className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none ${!hasScrolledToBottom ? 'pointer-events-none' : ''}`}
                        >
                            I confirm that I have read, understood, and agree to the {role === 'CREATOR' ? 'Creator Terms' : 'Campaign Agreement'}.
                        </label>
                        <p className="text-xs text-muted-foreground">
                            Checking this box constitutes a legal signature.
                        </p>
                    </div>
                </div>

                <DialogFooter className="sm:justify-between flex-row-reverse sm:flex-row items-center gap-2 mt-4">
                    <Button
                        onClick={handleAgree}
                        disabled={!isChecked}
                        className={`w-full sm:w-auto transition-all ${isChecked ? 'bg-primary-DEFAULT hover:bg-primary-700' : 'bg-gray-300'}`}
                    >
                        {isChecked ? 'Continue' : 'Please Read & Agree'}
                        {isChecked ? <CheckCircle className="ml-2 h-4 w-4" /> : <Lock className="ml-2 h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
