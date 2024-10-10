import { Alert, Spacer } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { sortBy } from 'lodash-es';
import React, { type FunctionComponent } from 'react';

import withUser, { type UserProps } from '../../../shared/hocs/withUser';
import useTranslation from '../../../shared/hooks/useTranslation';
import { showReplacementWarning } from '../../helpers/fragment';

import FragmentDetail from './FragmentDetail';

interface FragmentListProps {
	collectionFragments: Avo.Collection.Fragment[];
	showDescription: boolean;
	showMetadata: boolean;
	linkToItems: boolean;
	collection: Avo.Collection.Collection;
	canPlay?: boolean;
}

/**
 * Renders the collection body with all of its fragments for the detail page
 * The bottom metadata is not included in the component
 * @param collectionFragments
 * @param showDescriptionNextToVideo
 * @constructor
 */
const FragmentList: FunctionComponent<FragmentListProps & UserProps> = ({
	collectionFragments,
	showDescription,
	showMetadata,
	linkToItems,
	collection,
	commonUser,
	...rest
}) => {
	const { tHtml } = useTranslation();
	const renderCollectionFragments = () =>
		sortBy(collectionFragments, 'position').map(
			(collectionFragment: Avo.Collection.Fragment) => {
				return (
					<li
						className="c-collection-list__item"
						key={`collection-fragment-${collectionFragment.id}`}
					>
						{showReplacementWarning(
							collection,
							collectionFragment,
							commonUser?.profileId
						) && (
							<Spacer margin="bottom-large">
								<Alert type="danger">
									{tHtml(
										'collection/components/fragment/fragment-list___dit-item-is-recent-vervangen-door-een-nieuwe-versie-je-controleert-best-of-je-knippunten-nog-correct-zijn'
									)}
								</Alert>
							</Spacer>
						)}
						<FragmentDetail
							collectionFragment={collectionFragment}
							showDescription={showDescription}
							showMetadata={showMetadata}
							linkToItems={linkToItems}
							{...rest}
						/>
					</li>
				);
			}
		);

	return <ul className="c-collection-list">{renderCollectionFragments()}</ul>;
};

export default withUser(FragmentList) as FunctionComponent<FragmentListProps>;
