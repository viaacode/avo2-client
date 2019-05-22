import React, { Component } from 'react'; // let's also import Component

type HomeState = {};

export class Home extends Component<{}, HomeState> {
	// componentWillMount() {
	// }
	//
	// componentDidMount() {
	// }

	render() {
		return <div>homepage works</div>;
	}
}
