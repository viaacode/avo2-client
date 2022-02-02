import { noop } from 'lodash-es';
import React, { ReactText } from 'react';

import { TagList, TagOption } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

/* eslint-disable @typescript-eslint/no-unused-vars */
export const IDP_COLORS: { [idp in Avo.Auth.IdpType]: string } = {
	HETARCHIEF: '#25a4cf',
	KLASCEMENT: '#f7931b',
	SMARTSCHOOL: '#f05a1a',
	VLAAMSEOVERHEID: '#ffe612',
};

/* eslint-enable @typescript-eslint/no-unused-vars */

export function idpMapsToTagList(
	idpMaps: Avo.Auth.IdpType[],
	key: string,
	onTagClicked: (tagId: ReactText) => void = noop
) {
	if (!idpMaps || !idpMaps.length) {
		return null;
	}
	return (
		<TagList
			tags={idpMaps.map(
				(idpMap: Avo.Auth.IdpType): TagOption => {
					return {
						color: IDP_COLORS[idpMap],
						label: idpMap,
						id: `${key}_${idpMap}`,
					};
				}
			)}
			onTagClicked={onTagClicked}
		/>
	);
}
