import { IconName } from '@viaa/avo2-components';

import { tText } from '../../../shared/helpers/translate';
import { ReactSelectOption } from '../../../shared/types';

export const GET_ADMIN_ICON_OPTIONS: () => ReactSelectOption<IconName>[] = () => [
	{ label: tText('admin/shared/constants/index___afbeelding'), value: 'image' },
	{ label: tText('admin/shared/constants/index___aktetas'), value: 'briefcase' },
	{ label: tText('admin/shared/constants/index___audio'), value: 'headphone' },
	{ label: tText('admin/shared/constants/index___collectie'), value: 'collection' },
	{ label: tText('admin/shared/constants/index___download'), value: 'download' },
	{ label: tText('admin/shared/constants/index___externe-link'), value: 'external-link' },
	{ label: tText('admin/shared/constants/index___help'), value: 'help-circle' },
	{ label: tText('admin/shared/constants/index___info'), value: 'info' },
	{ label: tText('admin/shared/constants/index___kalender'), value: 'calendar' },
	{ label: tText('admin/shared/constants/index___klascement'), value: 'klascement' },
	{ label: tText('admin/shared/constants/index___link'), value: 'link-2' },
	{ label: tText('admin/shared/constants/index___link-delen'), value: 'share-2' },
	{ label: tText('admin/shared/constants/index___login'), value: 'log-in' },
	{ label: tText('admin/shared/constants/index___opdracht'), value: 'clipboard' },
	{ label: tText('admin/shared/constants/index___profiel'), value: 'user' },
	{ label: tText('admin/shared/constants/index___smartschool'), value: 'smartschool' },
	{ label: tText('admin/shared/constants/index___tekstbestand'), value: 'file-text' },
	{ label: tText('admin/shared/constants/index___uploaden'), value: 'upload' },
	{ label: tText('admin/shared/constants/index___video'), value: 'video' },
	{ label: tText('admin/shared/constants/index___view'), value: 'eye' },
	{ label: tText('admin/shared/constants/index___zoek'), value: 'search' },
];
