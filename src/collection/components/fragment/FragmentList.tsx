import { get, sortBy } from 'lodash-es';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { Alert, Spacer } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { RelationEntry } from '../../../shared/services/relation-service/relation.types';

import FragmentDetail from './FragmentDetail';
import { getProfileId } from '../../../authentication/helpers/get-profile-id';
import moment from 'moment';

interface FragmentListDetailProps extends DefaultSecureRouteProps {
	collectionFragments: Avo.Collection.Fragment[];
	showDescription: boolean;
	linkToItems: boolean;
	collection: Avo.Collection.Collection;
	user: Avo.User.User;
	canPlay?: boolean;
}

/**
 * Renders the collection body with all of its fragments for the detail page
 * The bottom meta data is not included in the component
 * @param collectionFragments
 * @param showDescriptionNextToVideo
 * @constructor
 */
const FragmentList: FunctionComponent<FragmentListDetailProps> = ({
	collectionFragments,
	showDescription,
	linkToItems,
	collection,
	user,
	...rest
}) => {
	const [t] = useTranslation();

	const showReplacementWarning = (collectionFragment: Avo.Collection.Fragment): boolean => {
		const item = collectionFragment.item_meta as Avo.Item.Item;
		const replacedRelation: RelationEntry<Avo.Item.Item> | undefined = get(
			item,
			'relations[0]'
		);
		const ownsCollection: boolean = collection.owner_profile_id === getProfileId(user);

		// Show the warning of replaced items only
		// * to owners and
		// * only if the collection has not been updated since the replacement happend
		return (
			ownsCollection &&
			!!replacedRelation &&
			moment(replacedRelation.created_at) > moment(collection.updated_at)
		);
	};

	const renderCollectionFragments = () =>
		sortBy(collectionFragments, 'position').map(
			(collectionFragment: Avo.Collection.Fragment) => {
				return (
					<li
						className="c-collection-list__item"
						key={`collection-fragment-${collectionFragment.id}`}
					>
						{showReplacementWarning(collectionFragment) && (
							<Spacer margin="bottom-large">
								<Alert type="danger">
									{t(
										'Dit item is recent vervangen door een nieuwe versie. Je controleert best of je knippunten nog correct zijn.'
									)}
								</Alert>
							</Spacer>
						)}
						<FragmentDetail
							collectionFragment={collectionFragment}
							showDescription={showDescription}
							linkToItems={linkToItems}
							user={user}
							{...rest}
						/>
					</li>
				);
			}
		);

	return <ul className="c-collection-list">{renderCollectionFragments()}</ul>;
};

export default FragmentList;
