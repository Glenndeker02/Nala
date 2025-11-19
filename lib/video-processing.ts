import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import { S3 } from 'aws-sdk';

const execAsync = promisify(exec);

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'nala-platform-uploads';
const TEMP_DIR = '/tmp/nala-videos';

/**
 * Add watermark to video using FFmpeg
 */
export async function addWatermarkToVideo(
  inputVideoPath: string,
  outputVideoPath: string,
  watermarkText: string = 'NALA - PENDING APPROVAL'
): Promise<void> {
  try {
    // FFmpeg command to add text watermark
    // Watermark will be semi-transparent, positioned in center, and appear throughout video
    const command = `ffmpeg -i "${inputVideoPath}" -vf "drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='${watermarkText}':fontcolor=white@0.6:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2" -codec:a copy "${outputVideoPath}"`;

    await execAsync(command);
  } catch (error) {
    console.error('Watermarking error:', error);
    throw new Error('Failed to add watermark to video');
  }
}

/**
 * Generate thumbnail from video
 */
export async function generateThumbnail(
  videoPath: string,
  thumbnailPath: string,
  timePosition: string = '00:00:02'
): Promise<void> {
  try {
    const command = `ffmpeg -i "${videoPath}" -ss ${timePosition} -vframes 1 -vf "scale=640:-1" "${thumbnailPath}"`;
    await execAsync(command);
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    throw new Error('Failed to generate thumbnail');
  }
}

/**
 * Get video metadata (duration, resolution, etc.)
 */
export async function getVideoMetadata(videoPath: string): Promise<{
  duration: number;
  resolution: string;
  fileSize: number;
}> {
  try {
    const command = `ffprobe -v error -show_entries format=duration,size -show_entries stream=width,height -of json "${videoPath}"`;
    const { stdout } = await execAsync(command);
    const metadata = JSON.parse(stdout);

    const duration = Math.round(parseFloat(metadata.format.duration));
    const width = metadata.streams[0].width;
    const height = metadata.streams[0].height;
    const fileSize = parseInt(metadata.format.size);

    return {
      duration,
      resolution: `${width}x${height}`,
      fileSize,
    };
  } catch (error) {
    console.error('Metadata extraction error:', error);
    throw new Error('Failed to extract video metadata');
  }
}

/**
 * Upload video to S3
 */
export async function uploadVideoToS3(
  filePath: string,
  key: string,
  contentType: string = 'video/mp4'
): Promise<string> {
  try {
    const fileContent = await fs.readFile(filePath);

    await s3
      .putObject({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileContent,
        ContentType: contentType,
        ACL: 'private', // Important: Keep videos private
      })
      .promise();

    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload video to S3');
  }
}

/**
 * Generate pre-signed URL for secure video streaming
 * This prevents direct downloads
 */
export async function generatePresignedUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Expires: expiresIn,
    ResponseContentDisposition: 'inline', // Force inline display (no download)
    ResponseContentType: 'video/mp4',
  };

  return s3.getSignedUrl('getObject', params);
}

/**
 * Process video submission: watermark, generate thumbnail, upload
 */
export async function processVideoSubmission(params: {
  videoBuffer: Buffer;
  originalFilename: string;
  videoId: string;
  campaignId: string;
  creatorId: string;
}): Promise<{
  originalUrl: string;
  watermarkedUrl: string;
  thumbnailUrl: string;
  duration: number;
  resolution: string;
  fileSize: number;
}> {
  const { videoBuffer, originalFilename, videoId, campaignId, creatorId } = params;

  // Ensure temp directory exists
  await fs.mkdir(TEMP_DIR, { recursive: true });

  const tempOriginalPath = path.join(TEMP_DIR, `original_${videoId}.mp4`);
  const tempWatermarkedPath = path.join(TEMP_DIR, `watermarked_${videoId}.mp4`);
  const tempThumbnailPath = path.join(TEMP_DIR, `thumbnail_${videoId}.jpg`);

  try {
    // 1. Save original video to temp
    await fs.writeFile(tempOriginalPath, videoBuffer);

    // 2. Get metadata
    const metadata = await getVideoMetadata(tempOriginalPath);

    // 3. Add watermark
    await addWatermarkToVideo(tempOriginalPath, tempWatermarkedPath);

    // 4. Generate thumbnail
    await generateThumbnail(tempOriginalPath, tempThumbnailPath);

    // 5. Upload all to S3
    const originalKey = `videos/original/${campaignId}/${videoId}/${originalFilename}`;
    const watermarkedKey = `videos/watermarked/${campaignId}/${videoId}/watermarked.mp4`;
    const thumbnailKey = `videos/thumbnails/${campaignId}/${videoId}/thumb.jpg`;

    const [originalUrl, watermarkedUrl, thumbnailUrl] = await Promise.all([
      uploadVideoToS3(tempOriginalPath, originalKey),
      uploadVideoToS3(tempWatermarkedPath, watermarkedKey),
      uploadVideoToS3(tempThumbnailPath, thumbnailKey, 'image/jpeg'),
    ]);

    // 6. Clean up temp files
    await Promise.all([
      fs.unlink(tempOriginalPath),
      fs.unlink(tempWatermarkedPath),
      fs.unlink(tempThumbnailPath),
    ]);

    return {
      originalUrl,
      watermarkedUrl,
      thumbnailUrl,
      ...metadata,
    };
  } catch (error) {
    // Clean up on error
    await Promise.all([
      fs.unlink(tempOriginalPath).catch(() => {}),
      fs.unlink(tempWatermarkedPath).catch(() => {}),
      fs.unlink(tempThumbnailPath).catch(() => {}),
    ]);

    throw error;
  }
}

/**
 * Remove watermark (after approval and payment)
 */
export async function getOriginalVideoUrl(videoId: string): Promise<string> {
  // Return the original video URL from S3
  // This will be called after payment is confirmed
  const key = `videos/original/${videoId}`;
  return generatePresignedUrl(key, 86400); // 24 hours
}
