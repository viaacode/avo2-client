import { MetaDataItem, MetaDataItemProps } from '@viaa/avo2-components';
import React, { ReactNode } from 'react';

export type renderBookmarkCountProps = Pick<MetaDataItemProps, 'label'>;

export const defaultRenderBookmarkCount = (props: renderBookmarkCountProps): ReactNode => (
	<MetaDataItem icon="bookmark" {...props} />
);
