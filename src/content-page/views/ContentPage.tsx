import React, { FunctionComponent } from 'react';

import { Avo } from '@viaa/avo2-types';

import { ContentBlockPreview } from '../../admin/content-block/components';
import { parseContentBlocks } from '../../admin/content-block/helpers';
import { ContentBlockConfig } from '../../admin/shared/types';
import InteractiveTour from '../../shared/components/InteractiveTour/InteractiveTour';

import './ContentPage.scss';

interface ContentPageDetailProps {
	contentPage: Avo.Content.Content;
}

const ContentPage: FunctionComponent<ContentPageDetailProps> = ({ contentPage }) => {
	const contentBlockConfig: ContentBlockConfig[] = parseContentBlocks(
		contentPage.contentBlockssBycontentId
	);
	return (
		<>
			<InteractiveTour showButton={false} />
			{contentBlockConfig.map((contentBlockConfig: ContentBlockConfig, index) => (
				<ContentBlockPreview
					key={contentPage.contentBlockssBycontentId[index].id}
					componentState={contentBlockConfig.components.state}
					contentWidth={contentPage.content_width}
					blockState={contentBlockConfig.block.state}
				/>
			))}
		</>
	);
};

export default ContentPage;
