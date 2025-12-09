user,
    { params }: { params: { id: string; applicationId: string } }
    ) => {
    try {
        const campaignId = params.id;
        const applicationId = params.applicationId;
        const body = await request.json();
        const { creatorId, instructions, deadline } = body;

        // Verify campaign ownership
        const campaign = await db.campaign.findUnique({
            where: { id: campaignId },
            include: {
                videos: true,
            },
        });

        if (!campaign) {
            return ApiResponse.error('Campaign not found', 404);
        }

        if (campaign.founderId !== user.userId) {
            return ApiResponse.error('Unauthorized', 403);
        }

        // Verify application exists and is pending
        const application = await db.application.findUnique({
            where: { id: applicationId },
        });

        if (!application) {
            return ApiResponse.error('Application not found', 404);
        }

        if (application.status !== 'PENDING') {
            return ApiResponse.error('Application has already been processed', 400);
        }

        // Check if we still need creators (haven't assigned all videos yet)
        const assignedVideosCount = campaign.videos.filter(v => v.creatorId).length;
        if (assignedVideosCount >= campaign.videosRequested) {
            return ApiResponse.error('All video slots have been filled', 400);
        }

        // Update application status and assign creator to campaign in transaction
        // Increased timeout to 15s because code generation + notification can take time
        const result = await db.$transaction(async (tx) => {
            // Update application status with instructions
            await tx.application.update({
                where: { id: applicationId },
                data: {
                    status: 'ACCEPTED',
                    acceptanceInstructions: instructions || null,
                    acceptanceDeadline: deadline ? new Date(deadline) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    acceptedAt: new Date()
                },
            });

            // Assign creator to campaign
            await tx.campaign.update({
                where: { id: campaignId },
                data: {
                    creatorId,
                    status: 'ACTIVE' // Update status to ACTIVE when creator is assigned
                },
            });

            // Create a video assignment for this creator
            let video = campaign.videos.find(v => !v.creatorId);

            // Calculate deadline
            const acceptanceDeadline = deadline ? new Date(deadline) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            if (!video) {
                // Create a new video entry with deadline
                video = await tx.video.create({
                    data: {
                        campaignId,
                        creatorId,
                        status: 'PENDING',
                        platform: campaign.platform,
                        deadline: acceptanceDeadline,
                    },
                });
            } else {
                // Assign existing video to creator and set deadline
                await tx.video.update({
                    where: { id: video.id },
                    data: {
                        creatorId,
                        deadline: acceptanceDeadline,
                    },
                });
            }

            // Get creator details for notification
            const creator = await tx.user.findUnique({
                where: { id: creatorId },
                select: { fullName: true, email: true }
            });

            // AUTO-GENERATE CREATOR CODES if enabled
            let generatedCodes: string[] = [];
            console.log('[ACCEPT] Campaign enableCreatorCodes:', campaign.enableCreatorCodes);
            console.log('[ACCEPT] Campaign autoGenerateCodes:', campaign.autoGenerateCodes);

            if (campaign.enableCreatorCodes && campaign.autoGenerateCodes) {
                console.log('[ACCEPT] Starting code generation for creator:', creatorId);
                const platforms = ['TIKTOK', 'INSTAGRAM']; // Default platforms

                for (const platform of platforms) {
                    // Check if code already exists for this creator+campaign+platform
                    const existingCode = await tx.creatorCode.findFirst({
                        where: {
                            campaignId,
                            creatorId,
                            platform,
                            active: true
                        }
                    });

                    if (!existingCode) {
                        // Generate unique code
                        const initials = (creator?.fullName || 'USER')
                            .split(' ')
                            .map(n => n.charAt(0).toUpperCase())
                            .join('')
                            .substring(0, 4);
                        const platformCode = platform.substring(0, 2).toUpperCase();
                        const year = new Date().getFullYear().toString().substring(2);

                        // Count existing codes for this creator
                        const codeCount = await tx.creatorCode.count({
                            where: { creatorId }
                        });

                        const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
                        let code = `${initials}${(codeCount + 1).toString().padStart(2, '0')}-${platformCode}-${year}${random}`;

                        // Ensure uniqueness
                        let attempts = 0;
                        while (attempts < 5) {
                            const exists = await tx.creatorCode.findUnique({ where: { code } });
                            if (!exists) break;
                            code = `${initials}${(codeCount + 1).toString().padStart(2, '0')}-${platformCode}-${year}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
                            attempts++;
                        }

                        await tx.creatorCode.create({
                            data: {
                                campaignId,
                                creatorId,
                                platform,
                                code,
                                createdBy: user.userId,
                                active: true
                            }
                        });

                        generatedCodes.push(code);
                        console.log('[ACCEPT] Generated code:', code, 'for platform:', platform);
                    } else {
                        console.log('[ACCEPT] Code already exists for platform:', platform, '- Code:', existingCode.code);
                        generatedCodes.push(existingCode.code);
                    }
                }
                console.log('[ACCEPT] Total codes generated/found:', generatedCodes.length);
            } else {
                console.log('[ACCEPT] Code generation skipped - enableCreatorCodes:', campaign.enableCreatorCodes, 'autoGenerateCodes:', campaign.autoGenerateCodes);
            }

            // Format deadline for notification
            const deadlineStr = acceptanceDeadline.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Build notification message
            let notificationMessage = `Congratulations! You have been accepted for the campaign "${campaign.name}".\n\n`;

            if (instructions) {
                notificationMessage += `📋 INSTRUCTIONS FROM FOUNDER:\n${instructions}\n\n`;
            }

            // Include codes if generated - with clear listing format
            if (generatedCodes.length > 0) {
                // Get all codes for this creator to show with platform labels
                const allCodes = await prisma.creatorCode.findMany({
                    where: { campaignId, creatorId, active: true },
                    select: { code: true, platform: true }
                });

                notificationMessage += `🏷️ YOUR ATTRIBUTION CODES:\n`;
                allCodes.forEach(c => {
                    const platformLabel = c.platform === 'TIKTOK' ? 'TikTok' :
                        c.platform === 'INSTAGRAM' ? 'Instagram' : c.platform;
                    notificationMessage += `• ${platformLabel}: ${c.code}\n`;
                });
                notificationMessage += `\n📢 HOW TO USE:\n• Include your code in video captions\n• Pin a comment with the code\n• Tell viewers to use code for discount\n• Earn $${campaign.conversionCommission || 15} per verified sale!\n\n`;
            }

            notificationMessage += `📋 NEXT STEPS:\n1. Review the campaign brief and requirements\n2. Create your video content following the guidelines\n3. Submit your draft video for review\n\n⏰ DEADLINE: ${deadlineStr}\n\n⚠️ Important: Failure to submit by the deadline or comply with requirements may result in removal from the campaign.\n\nClick here to get started!`;

            // Create notification for creator with detailed instructions
            await tx.notification.create({
                data: {
                    userId: creatorId,
                    type: 'APPLICATION_UPDATE',
                    title: 'Application Accepted! 🎉',
                    message: notificationMessage,
                    link: `/creator/campaigns/${campaignId}`,
                    isRead: false
                }
            });

            return { video, creator, generatedCodes };
        }, {
            timeout: 15000 // 15 seconds - increased from default 5s for code generation
        });

        return ApiResponse.success({
            message: 'Application accepted successfully',
            video: {
                id: result.video.id,
                creatorId: result.video.creatorId,
            },
            creator: result.creator
        });
    } catch (error) {
        console.error('========================================');
        console.error('[ACCEPT] TRANSACTION FAILED');
        console.error('========================================');
        console.error('[ACCEPT] Error:', error);
        console.error('[ACCEPT] Error name:', error instanceof Error ? error.name : 'Unknown');
        console.error('[ACCEPT] Error message:', error instanceof Error ? error.message : String(error));
        console.error('[ACCEPT] Error stack:', error instanceof Error ? error.stack : 'No stack');
        console.error('========================================');
        return ApiResponse.error('Failed to accept application', 500);
    }
}
);
