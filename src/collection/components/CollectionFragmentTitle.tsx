import { BlockHeading } from '@meemoo/admin-core-ui/client';

import { type FC } from 'react';
import { Link } from 'react-router-dom';

import { APP_PATH } from '../../constants';
import { buildLink } from '../../shared/helpers/build-link';
import { type BlockItemComponent, ContentTypeNumber, } from '../collection.types';

import './CollectionFragmentTitle.scss';
import { AvoAssignmentBlock, AvoCoreBlockItemType, AvoItemItem, } from '@viaa/avo2-types';

export interface CollectionFragmentTitleProps extends BlockItemComponent {
  canClickHeading?: boolean;
}

export const CollectionFragmentTitle: FC<CollectionFragmentTitleProps> = ({
  block,
  canClickHeading,
}) => {
  const heading = (
    <BlockHeading type="h2" className="c-collection-fragment-title">
      {block?.use_custom_fields || block?.type === AvoCoreBlockItemType.TEXT
        ? block.custom_title || block?.item_meta?.title
        : (block as AvoAssignmentBlock).original_title ||
          block?.item_meta?.title}
    </BlockHeading>
  );

  if (
    canClickHeading &&
    block &&
    block.type === AvoCoreBlockItemType.ITEM &&
    block.item_meta?.type_id &&
    [ContentTypeNumber.video, ContentTypeNumber.audio].includes(
      block.item_meta?.type_id,
    )
  ) {
    const link = buildLink(APP_PATH.ITEM_DETAIL.route, {
      id: (block.item_meta as AvoItemItem).external_id || '',
    });

    return <Link to={link}>{heading}</Link>;
  }

  return heading;
};
