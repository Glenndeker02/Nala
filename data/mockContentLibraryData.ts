
export type ContentFormat = {
    id: string;
    thumbnailUrl: string;
    videoUrl: string;
    platform: 'TikTok' | 'Instagram' | 'YouTube' | 'Facebook';
    duration: number; // in seconds
    formatType: 'Review' | 'Demo' | 'Unboxing' | 'Storytime' | 'Skit' | 'Tutorial' | 'Testimonial';
    hookStyle: 'Question' | 'Shocking Fact' | 'Visual' | 'Story' | 'Negative Hook';
    creator: {
        name: string;
        handle: string;
        avatarUrl: string;
        followers: number;
        niche: string;
        language: string;
        location: string;
    };
    metrics: {
        views: number;
        engagementRate: number; // percentage
        saves: number;
        shares: number;
        completionRate: number; // percentage
    };
    rankingScore?: number; // Calculated dynamically
    industry: 'Beauty' | 'Wellness' | 'Tech' | 'Fashion' | 'Fitness' | 'Food' | 'Other';
    datePosted: string;
};

export const mockContentLibraryData: ContentFormat[] = [
    {
        id: 'fmt_001',
        thumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop',
        videoUrl: 'https://example.com/video1.mp4',
        platform: 'TikTok',
        duration: 45,
        formatType: 'Review',
        hookStyle: 'Negative Hook',
        creator: {
            name: 'Sarah Jenkins',
            handle: '@sarahj_beauty',
            avatarUrl: 'https://i.pravatar.cc/150?u=sarah',
            followers: 125000,
            niche: 'Beauty',
            language: 'English',
            location: 'US',
        },
        metrics: {
            views: 1500000,
            engagementRate: 8.5,
            saves: 45000,
            shares: 12000,
            completionRate: 65,
        },
        industry: 'Beauty',
        datePosted: '2023-10-15T10:00:00Z',
    },
    {
        id: 'fmt_002',
        thumbnailUrl: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=1000&auto=format&fit=crop',
        videoUrl: 'https://example.com/video2.mp4',
        platform: 'Instagram',
        duration: 25,
        formatType: 'Demo',
        hookStyle: 'Visual',
        creator: {
            name: 'Mike Ross',
            handle: '@mike_fitness',
            avatarUrl: 'https://i.pravatar.cc/150?u=mike',
            followers: 45000,
            niche: 'Fitness',
            language: 'English',
            location: 'UK',
        },
        metrics: {
            views: 85000,
            engagementRate: 12.0,
            saves: 5000,
            shares: 2000,
            completionRate: 80,
        },
        industry: 'Fitness',
        datePosted: '2023-11-01T14:30:00Z',
    },
    {
        id: 'fmt_003',
        thumbnailUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop',
        videoUrl: 'https://example.com/video3.mp4',
        platform: 'YouTube',
        duration: 58,
        formatType: 'Tutorial',
        hookStyle: 'Question',
        creator: {
            name: 'Tech With Tim',
            handle: '@timtech',
            avatarUrl: 'https://i.pravatar.cc/150?u=tim',
            followers: 300000,
            niche: 'Tech',
            language: 'English',
            location: 'US',
        },
        metrics: {
            views: 500000,
            engagementRate: 5.5,
            saves: 25000,
            shares: 8000,
            completionRate: 50,
        },
        industry: 'Tech',
        datePosted: '2023-09-20T09:00:00Z',
    },
    {
        id: 'fmt_004',
        thumbnailUrl: 'https://images.unsplash.com/photo-1529139574466-a302d20525a4?q=80&w=1000&auto=format&fit=crop',
        videoUrl: 'https://example.com/video4.mp4',
        platform: 'TikTok',
        duration: 15,
        formatType: 'Skit',
        hookStyle: 'Shocking Fact',
        creator: {
            name: 'Funny Girl',
            handle: '@funnygirl123',
            avatarUrl: 'https://i.pravatar.cc/150?u=funny',
            followers: 2000000,
            niche: 'Entertainment',
            language: 'English',
            location: 'US',
        },
        metrics: {
            views: 5000000,
            engagementRate: 15.0,
            saves: 100000,
            shares: 50000,
            completionRate: 90,
        },
        industry: 'Other',
        datePosted: '2023-11-20T16:00:00Z',
    },
    {
        id: 'fmt_005',
        thumbnailUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop',
        videoUrl: 'https://example.com/video5.mp4',
        platform: 'Instagram',
        duration: 30,
        formatType: 'Unboxing',
        hookStyle: 'Visual',
        creator: {
            name: 'Fashionista',
            handle: '@fashion_daily',
            avatarUrl: 'https://i.pravatar.cc/150?u=fashion',
            followers: 80000,
            niche: 'Fashion',
            language: 'French',
            location: 'France',
        },
        metrics: {
            views: 120000,
            engagementRate: 9.0,
            saves: 8000,
            shares: 3000,
            completionRate: 70,
        },
        industry: 'Fashion',
        datePosted: '2023-10-05T11:00:00Z',
    },
    {
        id: 'fmt_006',
        thumbnailUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000&auto=format&fit=crop',
        videoUrl: 'https://example.com/video6.mp4',
        platform: 'TikTok',
        duration: 50,
        formatType: 'Storytime',
        hookStyle: 'Story',
        creator: {
            name: 'Healthy Eats',
            handle: '@healthyeats',
            avatarUrl: 'https://i.pravatar.cc/150?u=food',
            followers: 60000,
            niche: 'Food',
            language: 'English',
            location: 'US',
        },
        metrics: {
            views: 200000,
            engagementRate: 7.0,
            saves: 15000,
            shares: 4000,
            completionRate: 60,
        },
        industry: 'Food',
        datePosted: '2023-11-10T13:00:00Z',
    },
    {
        id: 'fmt_007',
        thumbnailUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1000&auto=format&fit=crop',
        videoUrl: 'https://example.com/video7.mp4',
        platform: 'YouTube',
        duration: 65,
        formatType: 'Testimonial',
        hookStyle: 'Question',
        creator: {
            name: 'John Doe',
            handle: '@johndoe_reviews',
            avatarUrl: 'https://i.pravatar.cc/150?u=john',
            followers: 10000,
            niche: 'Tech',
            language: 'English',
            location: 'US',
        },
        metrics: {
            views: 5000,
            engagementRate: 4.0,
            saves: 100,
            shares: 50,
            completionRate: 40,
        },
        industry: 'Tech',
        datePosted: '2023-08-15T10:00:00Z',
    },
    {
        id: 'fmt_008',
        thumbnailUrl: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?q=80&w=1000&auto=format&fit=crop',
        videoUrl: 'https://example.com/video8.mp4',
        platform: 'Instagram',
        duration: 20,
        formatType: 'Demo',
        hookStyle: 'Visual',
        creator: {
            name: 'Yoga With Sarah',
            handle: '@sarah_yoga',
            avatarUrl: 'https://i.pravatar.cc/150?u=yoga',
            followers: 150000,
            niche: 'Wellness',
            language: 'English',
            location: 'US',
        },
        metrics: {
            views: 300000,
            engagementRate: 10.0,
            saves: 20000,
            shares: 8000,
            completionRate: 85,
        },
        industry: 'Wellness',
        datePosted: '2023-11-15T09:00:00Z',
    },
    {
        id: 'fmt_009',
        thumbnailUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdd403348?q=80&w=1000&auto=format&fit=crop',
        videoUrl: 'https://example.com/video9.mp4',
        platform: 'TikTok',
        duration: 40,
        formatType: 'Review',
        hookStyle: 'Negative Hook',
        creator: {
            name: 'Beauty Guru',
            handle: '@beauty_guru',
            avatarUrl: 'https://i.pravatar.cc/150?u=guru',
            followers: 500000,
            niche: 'Beauty',
            language: 'Spanish',
            location: 'Spain',
        },
        metrics: {
            views: 1000000,
            engagementRate: 9.5,
            saves: 30000,
            shares: 10000,
            completionRate: 75,
        },
        industry: 'Beauty',
        datePosted: '2023-10-25T15:00:00Z',
    },
    {
        id: 'fmt_010',
        thumbnailUrl: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=1000&auto=format&fit=crop',
        videoUrl: 'https://example.com/video10.mp4',
        platform: 'YouTube',
        duration: 90,
        formatType: 'Tutorial',
        hookStyle: 'Question',
        creator: {
            name: 'Code Master',
            handle: '@codemaster',
            avatarUrl: 'https://i.pravatar.cc/150?u=code',
            followers: 25000,
            niche: 'Tech',
            language: 'English',
            location: 'India',
        },
        metrics: {
            views: 20000,
            engagementRate: 6.0,
            saves: 5000,
            shares: 1000,
            completionRate: 55,
        },
        industry: 'Tech',
        datePosted: '2023-09-10T12:00:00Z',
    },
];
