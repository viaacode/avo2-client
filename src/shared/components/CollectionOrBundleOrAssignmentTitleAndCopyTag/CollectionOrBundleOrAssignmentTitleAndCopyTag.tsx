import { TagList } from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';
import { truncate } from 'lodash-es';
import React, { FC } from 'react';
import { Link } from 'react-router-dom';

import { APP_PATH } from '../../../constants';
import { buildLink } from '../../helpers';

interface CollectionOrBundleOrAssignmentTitleAndCopyTagProps {
	collOrBundleOrAssignment:
		| Partial<Avo.Collection.Collection>
		| Partial<Avo.Assignment.Assignment>;
	editLink: string;
}

export const CollectionOrBundleOrAssignmentTitleAndCopyTag: FC<
	CollectionOrBundleOrAssignmentTitleAndCopyTagProps
> = ({ collOrBundleOrAssignment, editLink }) => {
	const title = truncate((collOrBundleOrAssignment as any).title || '-', { length: 50 });
	return (
		<>
			<Link to={editLink}>
				<span>{title}</span>
			</Link>{' '}
			{!!collOrBundleOrAssignment.relations?.[0].object && (
				<Link
					to={buildLink(APP_PATH.COLLECTION_DETAIL.route, {
						id: collOrBundleOrAssignment.relations?.[0].object,
					})}
				>
					<TagList
						tags={[
							{ id: collOrBundleOrAssignment.relations?.[0].object, label: 'Kopie' },
						]}
						swatches={false}
					/>
				</Link>
			)}
		</>
	);
};