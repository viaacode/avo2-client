export type VideoStillRequestDto =
  | {
      externalId?: string;
      startTime: number;
    }
  | {
      fileId?: string;
      startTime: number;
    }
  | {
      storedAt?: string;
      type?: 'video' | 'audio' | 'image';
      startTime: number;
    };

export interface VideoStillRequestBodyDto {
  requests: VideoStillRequestDto[];
}
