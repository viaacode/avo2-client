import { get } from 'lodash-es';

import { ButtonAction } from '@viaa/avo2-components';

import { GET_COLLECTION_TILE_BY_ID } from '../../../collection/collection.gql';
import { GET_ITEM_TILE_BY_ID } from '../../../item/item.gql';
import { dataService, toastService } from '../../../shared/services';
import i18n from '../../../shared/translations/i18n';

import { MediaItemResponse } from '../../shared/types';

export const fetchCollectionOrItem = async ({
	type,
	value: id,
}: ButtonAction): Promise<MediaItemResponse | null> => {
	try {
		const response = await dataService.query({
			query: type === 'ITEM' ? GET_ITEM_TILE_BY_ID : GET_COLLECTION_TILE_BY_ID,
			variables: { id },
		});

		const tileData = get(response, 'data.tileData[0]', null);
		const count = get(response, 'data.count[0]', 0);

		return tileData ? { tileData, count } : null;
	} catch (err) {
		console.error(err);
		toastService.danger(
			i18n.t('Er ging iets mis tijdens het ophalen van de tegel data'),
			false
		);
		return null;
	}
};
