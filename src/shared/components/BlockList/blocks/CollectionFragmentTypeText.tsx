import { AvoCoreBlockItemBase } from '@viaa/avo2-types';
import { type FC } from 'react';
import { CollectionFragmentRichText } from '../../../../collection/components/CollectionFragmentRichText';
import {
  CollectionFragmentTitle,
  type CollectionFragmentTitleProps,
} from '../../../../collection/components/CollectionFragmentTitle';

export interface CollectionFragmentTypeTextProps {
  title?: CollectionFragmentTitleProps;
  block?: AvoCoreBlockItemBase;
}

export const CollectionFragmentTypeText: FC<
  CollectionFragmentTypeTextProps
> = ({ title, block }) => {
  return (
    <>
      {title && <CollectionFragmentTitle {...title} />}
      {block && <CollectionFragmentRichText block={block} />}
    </>
  );
};
