import {
  AvoAssignmentAssignment,
  AvoAssignmentContent,
  AvoCollectionCollection,
  AvoItemItem,
} from '@viaa/avo2-types';
import { type ReactNode } from 'react';

export enum QuickLaneTypeEnum {
  COLLECTION = 'COLLECTIE',
  ITEM = 'ITEM',
}

export type QuickLaneType =
  | QuickLaneTypeEnum.COLLECTION
  | QuickLaneTypeEnum.ITEM;

export interface QuickLaneContentProps {
  content_label?: QuickLaneType;
  content?: AvoAssignmentAssignment | AvoCollectionCollection | AvoItemItem;
  error?: ReactNode;
  isOpen: boolean;
  onUpdate?: (content: AvoAssignmentContent) => void; // TODO investigate typing, since this is also used in collection detail
}
