import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';

import { TCloudinaryConfig } from '@configs/cloudinary.config';

import { TConfigs } from '@src/configs';

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService<TConfigs>) {}

  public async uploadFile(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<UploadApiErrorResponse | UploadApiResponse> {
    return new Promise((resolve, reject) => {
      v2.uploader
        .upload_stream(
          {
            access_mode: 'public',
            folder:
              this.configService.get<TCloudinaryConfig>('cloudinary')
                .defaultFolder + (folder ? `/${folder}` : ''),
          },
          (error, result) => {
            if (error) {
              return reject(error);
            }

            return resolve(result);
          },
        )
        .end(file.buffer);
    });
  }

  public async replaceFile(
    publicId: string,
    file: Express.Multer.File,
    folder?: string,
  ): Promise<UploadApiErrorResponse | UploadApiResponse> {
    try {
      await this.deleteFile(publicId);
    } catch (error) {}

    return this.uploadFile(file, folder);
  }

  public async uploadFiles(
    files: Express.Multer.File[],
    folder?: string,
  ): Promise<UploadApiErrorResponse | UploadApiResponse> {
    return new Promise((resolve, reject) => {
      v2.uploader
        .upload_stream(
          {
            access_mode: 'public',
            folder:
              this.configService.get<TCloudinaryConfig>('cloudinary')
                .defaultFolder + (folder ? `/${folder}` : ''),
          },
          (error, result) => {
            if (error) {
              return reject(error);
            }

            return resolve(result);
          },
        )
        .end(files.map((file) => file.buffer));
    });
  }

  public async deleteFile(publicId: string): Promise<{ result: string }> {
    return new Promise((resolve, reject) => {
      v2.uploader.destroy(publicId, (error, result) => {
        if (error) {
          return reject(error);
        }

        return resolve(result);
      });
    });
  }

  public async deleteFiles(publicIds: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      v2.api.delete_resources(publicIds, (error, result) => {
        if (error) {
          return reject(error);
        }

        return resolve(result);
      });
    });
  }
}
