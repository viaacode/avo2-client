import React, { Component } from 'react';

export default class Resizer extends Component<any> {
	getStyle() {
		if (this.props.direction === 'column') {
			return {
				width: '100%',
				height: this.props.size,
				backgroundColor: this.props.color,
				cursor: 'row-resize',
			};
		}

		return {
			width: this.props.size,
			height: '100%',
			backgroundColor: this.props.color,
			cursor: 'col-resize',
		};
	}

	render() {
		return <div onMouseDown={this.props.onMouseDown} style={this.getStyle()} />;
	}
}
