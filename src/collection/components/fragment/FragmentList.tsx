import { Alert, Spacer } from '@viaa/avo2-components'
import { type Avo } from '@viaa/avo2-types'
import { useAtomValue } from 'jotai'
import { sortBy } from 'es-toolkit'
import React, { type FC } from 'react'

import { commonUserAtom } from '../../../authentication/authentication.store';
import { tHtml } from '../../../shared/helpers/translate-html';
import { showReplacementWarning } from '../../helpers/fragment';

import { FragmentDetail } from './FragmentDetail';

interface FragmentListProps {
  collectionFragments: Avo.Collection.Fragment[]
  showDescription: boolean
  showMetadata: boolean
  linkToItems: boolean
  collection: Avo.Collection.Collection
  canPlay?: boolean
}

/**
 * Renders the collection body with all of its fragments for the detail page
 * The bottom metadata is not included in the component
 * @param collectionFragments
 * @param showDescriptionNextToVideo
 * @constructor
 */
export const FragmentList: FC<FragmentListProps> = ({
  collectionFragments,
  showDescription,
  showMetadata,
  linkToItems,
  collection,
}) => {
  const commonUser = useAtomValue(commonUserAtom)

  const renderCollectionFragments = () =>
    sortBy(collectionFragments, ['position']).map(
      (collectionFragment: Avo.Collection.Fragment) => {
        return (
          <li
            className="c-collection-list__item"
            key={`collection-fragment-${collectionFragment.id}`}
          >
            {showReplacementWarning(
              collection,
              collectionFragment,
              commonUser?.profileId,
            ) && (
              <Spacer margin="bottom-large">
                <Alert type="danger">
                  {tHtml(
                    'collection/components/fragment/fragment-list___dit-item-is-recent-vervangen-door-een-nieuwe-versie-je-controleert-best-of-je-knippunten-nog-correct-zijn',
                  )}
                </Alert>
              </Spacer>
            )}
            {/* Disable icons because it takes too much space: https://meemoo.atlassian.net/browse/AVO-3343?focusedCommentId=54020 */}
            {/*<BlockIconWrapper*/}
            {/*	key={collectionFragment.id}*/}
            {/*	type={collectionFragment.type}*/}
            {/*	type_id={collectionFragment.item_meta?.type_id}*/}
            {/*>*/}
            <FragmentDetail
              collectionFragment={collectionFragment}
              showDescription={showDescription}
              showMetadata={showMetadata}
              linkToItems={linkToItems}
            />
            {/*</BlockIconWrapper>*/}
          </li>
        )
      },
    )

  return <ul className="c-collection-list">{renderCollectionFragments()}</ul>
}
