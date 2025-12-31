import {
  IconName,
  MetaDataItem,
  type MetaDataItemProps,
} from '@viaa/avo2-components';
import { type ReactNode } from 'react';

export type renderBookmarkCountProps = Pick<MetaDataItemProps, 'label'>;

export const defaultRenderBookmarkCount = (
  props: renderBookmarkCountProps,
): ReactNode => <MetaDataItem icon={IconName.bookmark} {...props} />;
