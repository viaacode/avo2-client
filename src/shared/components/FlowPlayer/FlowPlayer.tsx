import React from 'react';
declare const flowplayer: any;

interface FlowPlayerProps {
	src: string;
	poster: string;
}

export class FlowPlayer extends React.Component<FlowPlayerProps> {
	player: any;

	constructor(props: any) {
		super(props);
	}

	componentDidMount() {
		this.player = flowplayer(this.refs.container, this.props);
	}

	render() {
		return <div className="c-video-player" ref="container" />;
	}

	componentWillUnmount() {
		if (this.player) {
			this.player.destroy();
			this.player = 0;
		}
	}
}
