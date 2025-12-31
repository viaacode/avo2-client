import { type DbContentPage } from '@meemoo/admin-core-ui/client';
import {
  AvoAssignmentAssignment,
  AvoCollectionCollection,
  AvoItemItem,
  AvoOrganizationOrganization,
} from '@viaa/avo2-types';

export type ResolvedItemOrCollectionOrAssignmentOrContentPage = Partial<
  | AvoItemItem
  | AvoCollectionCollection
  | AvoAssignmentAssignment
  | DbContentPage
> & {
  src?: string;
  type: { label: 'audio' | 'video' | 'collectie' | 'bundel' | 'opdracht' };
  view_count: number;
  item_count?: number;
  media_item_label: string | null;
  copyright_organisation: AvoOrganizationOrganization | null;
  copyright_image: string | null;
  start_cue_point?: number;
  end_cue_point?: number;
};
