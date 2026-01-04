import { AvoLomLom } from '@viaa/avo2-types';

export enum ContributorInfoRight {
  CONTRIBUTOR = 'CONTRIBUTOR',
  VIEWER = 'VIEWER',
  OWNER = 'OWNER',
}

export interface ContributorInfo {
  email?: string;
  inviteEmail?: string;
  rights: ContributorInfoRight;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  profileId?: string;
  contributorId?: string;
  loms?: AvoLomLom[];
}
