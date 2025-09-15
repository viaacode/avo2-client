import { PermissionName } from '@viaa/avo2-types';
import React, { type ReactNode } from 'react';

import { SecuredRoute } from '../../authentication/components';
import { expandArray } from '../../shared/helpers/conditional-expand-array';

import { COLLECTIONS_OR_BUNDLES_PATH } from './collections-or-bundles.const';
import { CollectionsOrBundlesOverview } from './views';
import CollectionOrBundleActualisationOverview from './views/CollectionOrBundleActualisationOverview';
import CollectionOrBundleMarcomOverview from './views/CollectionOrBundleMarcomOverview';
import CollectionOrBundleQualityCheckOverview from './views/CollectionOrBundleQualityCheckOverview';

export const renderCollectionOrBundleRoutes = (userPermissions: string[]): ReactNode[] =>
	expandArray(
		userPermissions.includes(PermissionName.VIEW_COLLECTIONS_OVERVIEW) &&
			(userPermissions.includes(PermissionName.VIEW_ANY_PUBLISHED_COLLECTIONS) ||
				userPermissions.includes(PermissionName.VIEW_ANY_UNPUBLISHED_COLLECTIONS)),
		<SecuredRoute
			key={COLLECTIONS_OR_BUNDLES_PATH.COLLECTIONS_OVERVIEW}
			Component={CollectionsOrBundlesOverview}
			exact
			path={COLLECTIONS_OR_BUNDLES_PATH.COLLECTIONS_OVERVIEW}
		/>,

		userPermissions.includes(PermissionName.VIEW_COLLECTION_EDITORIAL_OVERVIEWS),
		<SecuredRoute
			key={COLLECTIONS_OR_BUNDLES_PATH.COLLECTION_ACTUALISATION_OVERVIEW}
			Component={CollectionOrBundleActualisationOverview}
			exact
			path={COLLECTIONS_OR_BUNDLES_PATH.COLLECTION_ACTUALISATION_OVERVIEW}
		/>,

		userPermissions.includes(PermissionName.VIEW_COLLECTION_EDITORIAL_OVERVIEWS),
		<SecuredRoute
			key={COLLECTIONS_OR_BUNDLES_PATH.COLLECTION_QUALITYCHECK_OVERVIEW}
			Component={CollectionOrBundleQualityCheckOverview}
			exact
			path={COLLECTIONS_OR_BUNDLES_PATH.COLLECTION_QUALITYCHECK_OVERVIEW}
		/>,

		userPermissions.includes(PermissionName.VIEW_COLLECTION_EDITORIAL_OVERVIEWS),
		<SecuredRoute
			key={COLLECTIONS_OR_BUNDLES_PATH.COLLECTION_MARCOM_OVERVIEW}
			Component={CollectionOrBundleMarcomOverview}
			exact
			path={COLLECTIONS_OR_BUNDLES_PATH.COLLECTION_MARCOM_OVERVIEW}
		/>,

		userPermissions.includes(PermissionName.VIEW_BUNDLES_OVERVIEW) &&
			(userPermissions.includes(PermissionName.VIEW_ANY_PUBLISHED_BUNDLES) ||
				userPermissions.includes(PermissionName.VIEW_ANY_UNPUBLISHED_BUNDLES)),
		<SecuredRoute
			key={COLLECTIONS_OR_BUNDLES_PATH.BUNDLES_OVERVIEW}
			Component={CollectionsOrBundlesOverview}
			exact
			path={COLLECTIONS_OR_BUNDLES_PATH.BUNDLES_OVERVIEW}
		/>,

		userPermissions.includes(PermissionName.VIEW_BUNDLE_EDITORIAL_OVERVIEWS),
		<SecuredRoute
			key={COLLECTIONS_OR_BUNDLES_PATH.BUNDLE_ACTUALISATION_OVERVIEW}
			Component={CollectionOrBundleActualisationOverview}
			exact
			path={COLLECTIONS_OR_BUNDLES_PATH.BUNDLE_ACTUALISATION_OVERVIEW}
		/>,

		userPermissions.includes(PermissionName.VIEW_BUNDLE_EDITORIAL_OVERVIEWS),
		<SecuredRoute
			key={COLLECTIONS_OR_BUNDLES_PATH.BUNDLE_QUALITYCHECK_OVERVIEW}
			Component={CollectionOrBundleQualityCheckOverview}
			exact
			path={COLLECTIONS_OR_BUNDLES_PATH.BUNDLE_QUALITYCHECK_OVERVIEW}
		/>,

		userPermissions.includes(PermissionName.VIEW_BUNDLE_EDITORIAL_OVERVIEWS),
		<SecuredRoute
			key={COLLECTIONS_OR_BUNDLES_PATH.BUNDLE_MARCOM_OVERVIEW}
			Component={CollectionOrBundleMarcomOverview}
			exact
			path={COLLECTIONS_OR_BUNDLES_PATH.BUNDLE_MARCOM_OVERVIEW}
		/>
	);
