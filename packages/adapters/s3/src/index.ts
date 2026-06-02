import { StorageAdapter } from '@realtimejs/core';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { RealtimeError, ERROR_CODES } from '@realtimejs/shared/src/utils/errors';

export function createS3Adapter(bucketName: string, region: string): StorageAdapter {
  const client = new S3Client({ region });

  return {
    upload: async (path: string, file: Uint8Array, mimeType: string) => {
      try {
        await client.send(new PutObjectCommand({
          Bucket: bucketName,
          Key: path,
          Body: file,
          ContentType: mimeType
        }));
        return `https://${bucketName}.s3.${region}.amazonaws.com/${path}`;
      } catch (err: unknown) {
        throw new RealtimeError(ERROR_CODES.UPLOAD_FAILED, (err as Error).message);
      }
    },
    download: async (path: string) => {
      // Typically pre-signed URLs are generated or clients download directly
      throw new RealtimeError(ERROR_CODES.FEATURE_DISABLED, 'Download method should use getUrl instead');
    },
    delete: async (path: string) => {
      try {
        await client.send(new DeleteObjectCommand({
          Bucket: bucketName,
          Key: path
        }));
      } catch (err: unknown) {
        throw new RealtimeError(ERROR_CODES.UPLOAD_FAILED, (err as Error).message); // Reuse UPLOAD_FAILED or add DELETE_FAILED
      }
    },
    getUrl: async (path: string) => {
      return `https://${bucketName}.s3.${region}.amazonaws.com/${path}`;
    }
  };
}
