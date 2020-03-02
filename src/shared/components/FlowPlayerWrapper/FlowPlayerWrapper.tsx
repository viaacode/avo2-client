import React, { FunctionComponent, useState } from 'react';

import { FlowPlayer } from '@viaa/avo2-components';
import { FlowPlayerProps } from '@viaa/avo2-components/dist/components/FlowPlayer/FlowPlayer';

import { CustomError } from '../../helpers';
import { BookmarksViewsPlaysService } from '../../services/bookmarks-views-plays-service';

interface FlowPlayerWrapperProps extends FlowPlayerProps {
	itemUuid?: string;
}

/**
 * Handle flowplayer play events for the whole app, so we track play count
 * @param props
 * @constructor
 */
const FlowPlayerWrapper: FunctionComponent<FlowPlayerWrapperProps> = props => {
	const { itemUuid, onPlay, ...rest } = props;
	const [triggeredForUrl, setTriggeredForUrl] = useState<string | null>(null);

	const handlePlay = () => {
		// Only trigger once per video
		if (itemUuid && triggeredForUrl !== props.src) {
			BookmarksViewsPlaysService.action('play', 'item', itemUuid, undefined).catch(err => {
				console.error(
					new CustomError('Failed to track item play event', err, { itemUuid })
				);
			});
			setTriggeredForUrl(props.src);
		}
		// Trigger original play handler
		(onPlay || (() => {}))();
	};

	return <FlowPlayer {...rest} onPlay={handlePlay} />;
};

export default FlowPlayerWrapper;
