import { get } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { ToastService } from '../../shared/services';
import i18n from '../../shared/translations/i18n';

export const isMediaFragment = (fragmentInfo: { external_id: string | undefined }) => {
	return fragmentInfo.external_id && fragmentInfo.external_id !== '-1';
};

export const getFragmentProperty = (
	itemMetaData: Avo.Item.Item,
	fragment: Avo.Collection.Fragment,
	useCustomFields: Boolean,
	prop: 'title' | 'description'
) => {
	return useCustomFields || !itemMetaData
		? get(fragment, `custom_${prop}`, '')
		: get(itemMetaData, prop, '');
};

const getFragmentByPosition = (fragments: Avo.Collection.Fragment[], position: number) => {
	const fragmentAtPosition = fragments.find(
		(fragment: Avo.Collection.Fragment) => fragment.position === position
	);

	if (!fragmentAtPosition) {
		ToastService.danger(
			i18n.t(
				'collection/helpers/fragment___het-fragment-met-positie-position-is-niet-gevonden',
				{
					position,
				}
			)
		);
		return;
	}

	return fragmentAtPosition;
};

export const swapFragmentsPositions = (
	fragments: Avo.Collection.Fragment[],
	currentFragmentId: number,
	delta: number
) => {
	const currentFragment = getFragmentByPosition(fragments, currentFragmentId);
	const otherFragment = getFragmentByPosition(fragments, currentFragmentId - delta);

	if (currentFragment && otherFragment) {
		currentFragment.position -= delta;
		otherFragment.position += delta;
	}

	return fragments;
};
