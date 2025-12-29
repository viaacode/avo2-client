import { LinkTarget } from '@viaa/avo2-components';
import { AvoCoreContentPickerType } from '@viaa/avo2-types';
import { type PickerItem } from '../../../types/content-picker';

export const parsePickerItem = (
  type: AvoCoreContentPickerType,
  value: string,
  target: LinkTarget = LinkTarget.Blank,
): PickerItem => ({
  type,
  target,
  value,
});
