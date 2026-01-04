import {
  AvoAssignmentAssignment,
  AvoCollectionCollection,
  AvoItemItem,
} from '@viaa/avo2-types';

import { AssignmentLayout } from '../../../assignment/assignment.types';
import { type QuickLaneUrlObject } from '../../types';

import { type QuickLaneType } from './QuickLaneContent.types';

export const isShareable = (
  content: AvoAssignmentAssignment | AvoCollectionCollection | AvoItemItem,
): boolean => {
  return (
    (content as AvoItemItem).is_published ||
    (content as AvoCollectionCollection).is_public
  );
};

export const defaultQuickLaneState: QuickLaneUrlObject = {
  id: '',
  title: '',
  view_mode: AssignmentLayout.PlayerAndText,
};

export const getContentUuid = (
  content: AvoAssignmentAssignment | AvoCollectionCollection | AvoItemItem,
  contentLabel: QuickLaneType,
): string => {
  switch (contentLabel) {
    case 'ITEM':
      return (content as AvoItemItem).uid;
    default:
      return content.id.toString();
  }
};
