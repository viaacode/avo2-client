import { LinkTarget } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';

import { type PickerItem } from '../../../types/content-picker';

export const parsePickerItem = (
	type: Avo.Core.ContentPickerType,
	value: string,
	target: LinkTarget = LinkTarget.Blank
): PickerItem => ({
	type,
	target,
	value,
});
