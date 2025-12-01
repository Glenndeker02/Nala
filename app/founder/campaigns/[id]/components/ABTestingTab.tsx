"use client";

import React from 'react';
import { ABTestingManagement } from '@/components/founder/ab-testing/ABTestingManagement';

export default function ABTestingTab({ campaignId }: { campaignId: string }) {
    return <ABTestingManagement campaignId={campaignId} />;
}
