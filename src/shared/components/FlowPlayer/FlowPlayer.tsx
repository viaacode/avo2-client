import React, { FunctionComponent, useEffect, useRef } from 'react';
declare const flowplayer: any;

interface FlowPlayerProps {
	src: string;
	poster: string;
}

export const FlowPlayer: FunctionComponent<FlowPlayerProps> = props => {
	const videoPlayerRef = useRef(null);
	let player: any = null;

	useEffect(() => {
		if (videoPlayerRef.current) {
			player = flowplayer(videoPlayerRef.current, props);
		}

		return () => {
			if (player) {
				player.destroy();
				player = null;
			}
		};
	}, [videoPlayerRef]);

	return <div className="c-video-player" ref={videoPlayerRef} />;
};
