import React, { useState, useEffect } from 'react';
import { FormatLibrary } from './FormatLibrary';
import { FormatAdoptionModal } from './FormatAdoptionModal';
import { AssignCreatorsModal } from './AssignCreatorsModal';

interface FormatTemplatesManagementProps {
    campaignId: string;
}

export function FormatTemplatesManagement({ campaignId }: FormatTemplatesManagementProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [selectedTemplateName, setSelectedTemplateName] = useState<string>('');
    const [videos, setVideos] = useState<any[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        fetchVideos();
    }, [campaignId]);

    const fetchVideos = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/campaigns/${campaignId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch campaign videos');
            }

            const data = await response.json();
            setVideos(data.data?.campaign?.videos || []);
        } catch (err: any) {
            console.error('Error fetching videos:', err);
        }
    };

    const handleAssignCreators = (templateId: string, templateName: string) => {
        setSelectedTemplateId(templateId);
        setSelectedTemplateName(templateName);
        setIsAssignModalOpen(true);
    };

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <>
            <FormatLibrary
                key={refreshKey}
                campaignId={campaignId}
                onCreateTemplate={() => setIsCreateModalOpen(true)}
                onAssignCreators={(templateId) => {
                    // Fetch template name from the library
                    handleAssignCreators(templateId, 'Format Template');
                }}
            />

            <FormatAdoptionModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreated={handleRefresh}
                campaignId={campaignId}
                availableVideos={videos}
            />

            <AssignCreatorsModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                onAssigned={handleRefresh}
                campaignId={campaignId}
                templateId={selectedTemplateId}
                templateName={selectedTemplateName}
            />
        </>
    );
}
