import { ContentFormat } from './mockContentLibraryData';

export interface CreatorEarnings {
    totalEarnings: number;
    thisMonth: number;
    pendingPayouts: number;
    completedPayouts: number;
    stripeConnected: boolean;
}

export interface CreatorPerformance {
    views: number;
    engagementRate: number;
    videosCreated: number;
    rankingScore: number;
    scoreHistory: { date: string; score: number }[];
    viewsHistory: { date: string; views: number }[];
    engagementHistory: { date: string; rate: number }[];
}

export interface ActiveAssignment {
    id: string;
    campaignName: string;
    brandName: string;
    status: 'PENDING' | 'DRAFT' | 'REVIEW' | 'APPROVED' | 'POSTED';
    dueDate: string;
    deliverableType: string;
    paymentAmount: number;
}

export interface CreatorTask {
    id: string;
    title: string;
    campaignId: string;
    dueDate: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    type: 'SUBMISSION' | 'REVISION' | 'APPROVAL';
}

export interface CreatorNotification {
    id: string;
    title: string;
    message: string;
    date: string;
    type: 'PAYMENT' | 'ASSIGNMENT' | 'REVIEW' | 'SYSTEM';
    read: boolean;
}

export interface SuggestedOpportunity {
    id: string;
    campaignName: string;
    brandName: string;
    matchScore: number;
    budget: number;
    requirements: string[];
    niche: string;
}

export const mockCreatorEarnings: CreatorEarnings = {
    totalEarnings: 12450,
    thisMonth: 2800,
    pendingPayouts: 850,
    completedPayouts: 11600,
    stripeConnected: true,
};

export const mockCreatorPerformance: CreatorPerformance = {
    views: 154000,
    engagementRate: 4.8,
    videosCreated: 24,
    rankingScore: 82,
    scoreHistory: [
        { date: '2023-10-01', score: 75 },
        { date: '2023-10-15', score: 78 },
        { date: '2023-11-01', score: 80 },
        { date: '2023-11-15', score: 82 },
    ],
    viewsHistory: [
        { date: 'Nov 1', views: 1200 },
        { date: 'Nov 5', views: 3500 },
        { date: 'Nov 10', views: 2800 },
        { date: 'Nov 15', views: 5600 },
        { date: 'Nov 20', views: 4200 },
        { date: 'Nov 25', views: 6800 },
    ],
    engagementHistory: [
        { date: 'Nov 1', rate: 3.2 },
        { date: 'Nov 5', rate: 4.5 },
        { date: 'Nov 10', rate: 4.1 },
        { date: 'Nov 15', rate: 5.2 },
        { date: 'Nov 20', rate: 4.8 },
        { date: 'Nov 25', rate: 5.5 },
    ],
};

export const mockActiveAssignments: ActiveAssignment[] = [
    {
        id: '1',
        campaignName: 'Summer Glow Launch',
        brandName: 'GlowUp Cosmetics',
        status: 'DRAFT',
        dueDate: '2023-11-30',
        deliverableType: 'TikTok Video',
        paymentAmount: 350,
    },
    {
        id: '2',
        campaignName: 'Fitness App Review',
        brandName: 'FitTrack',
        status: 'REVIEW',
        dueDate: '2023-11-28',
        deliverableType: 'Instagram Reel',
        paymentAmount: 500,
    },
    {
        id: '3',
        campaignName: 'Eco-Friendly Bottle',
        brandName: 'PureLife',
        status: 'APPROVED',
        dueDate: '2023-12-05',
        deliverableType: 'UGC Testimonial',
        paymentAmount: 300,
    },
];

export const mockCreatorTasks: CreatorTask[] = [
    {
        id: '1',
        title: 'Submit Draft for GlowUp',
        campaignId: '1',
        dueDate: '2023-11-30',
        priority: 'HIGH',
        status: 'TODO',
        type: 'SUBMISSION',
    },
    {
        id: '2',
        title: 'Revise Hook for FitTrack',
        campaignId: '2',
        dueDate: '2023-11-28',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        type: 'REVISION',
    },
    {
        id: '3',
        title: 'Post Approved Video for PureLife',
        campaignId: '3',
        dueDate: '2023-12-05',
        priority: 'MEDIUM',
        status: 'TODO',
        type: 'APPROVAL',
    },
];

export const mockCreatorNotifications: CreatorNotification[] = [
    {
        id: '1',
        title: 'Payment Processed',
        message: 'Your payment of $500 for FitTrack has been processed.',
        date: '2 hours ago',
        type: 'PAYMENT',
        read: false,
    },
    {
        id: '2',
        title: 'Revision Requested',
        message: 'FitTrack requested changes to your draft.',
        date: '5 hours ago',
        type: 'REVIEW',
        read: false,
    },
    {
        id: '3',
        title: 'New Campaign Match',
        message: 'You have a new campaign match: TechGadget Launch.',
        date: '1 day ago',
        type: 'ASSIGNMENT',
        read: true,
    },
];

export const mockSuggestedOpportunities: SuggestedOpportunity[] = [
    {
        id: '1',
        campaignName: 'TechGadget Launch',
        brandName: 'TechGadget',
        matchScore: 95,
        budget: 600,
        requirements: ['Tech Savvy', 'English', 'Unboxing'],
        niche: 'Tech',
    },
    {
        id: '2',
        campaignName: 'Organic Skincare Routine',
        brandName: 'NatureSkin',
        matchScore: 88,
        budget: 450,
        requirements: ['Skincare', 'Morning Routine', 'Soft Aesthetic'],
        niche: 'Beauty',
    },
    {
        id: '3',
        campaignName: 'Healthy Meal Prep',
        brandName: 'FreshEats',
        matchScore: 82,
        budget: 400,
        requirements: ['Cooking', 'Health', 'Voiceover'],
        niche: 'Food',
    },
];
