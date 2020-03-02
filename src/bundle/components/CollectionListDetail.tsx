import React, { FunctionComponent } from 'react';
import { Trans } from 'react-i18next';
import { Scrollbar } from 'react-scrollbars-custom';

import {
	BlockHeading,
	Column,
	convertToHtml,
	ExpandableContainer,
	Thumbnail,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { redirectToClientPage } from '../../authentication/helpers/redirects';
import { APP_PATH } from '../../constants';
import { buildLink } from '../../shared/helpers';

interface CollectionDetailProps extends DefaultSecureRouteProps {
	collectionFragment: Avo.Collection.Fragment;
}

/**
 * Renders the bundle body with all of its collections for the detail page
 */
const CollectionListDetail: FunctionComponent<CollectionDetailProps> = ({
	collectionFragment,
	history,
}) => {
	const getTitleClickedHandler = () => {
		redirectToClientPage(
			buildLink(APP_PATH.COLLECTION_DETAIL, { id: collectionFragment.external_id }),
			history
		);
	};

	function renderMedia() {
		return (
			<Thumbnail
				src={
					((collectionFragment.item_meta as unknown) as Avo.Collection.Collection)
						.thumbnail_path || ''
				}
				category={'collection'}
			/>
		);
	}

	const renderDescription = () => (
		<Scrollbar
			style={{
				width: '100%',
				height: `300px`, // Height of button
				overflowY: 'auto',
			}}
		>
			<BlockHeading type="h3" className={'u-clickable'} onClick={getTitleClickedHandler}>
				{collectionFragment.use_custom_fields
					? collectionFragment.custom_title
					: (collectionFragment.item_meta as Avo.Collection.Collection).id}{' '}
			</BlockHeading>
			<BlockHeading type="h4">
				<Trans i18nKey="item/components/item-video-description___beschrijving">
					Beschrijving
				</Trans>
			</BlockHeading>
			)}
			{/* TODO: Fix label height - "Beschrijving" label height (22) + padding (15 * 2) + read more button (36) - additional margin (8) */}
			<ExpandableContainer collapsedHeight={300 - 22 - 15 * 2 - 36 - 8}>
				<p>
					{convertToHtml(
						collectionFragment.use_custom_fields
							? collectionFragment.custom_description
							: ((collectionFragment.item_meta as unknown) as Avo.Collection.Collection)
									.description
					)}
				</p>
			</ExpandableContainer>
		</Scrollbar>
	);

	return (
		<>
			<Column size="2-7">{renderMedia()}</Column>
			<Column size="2-5">{renderDescription()}</Column>
		</>
	);
};

export default CollectionListDetail;
