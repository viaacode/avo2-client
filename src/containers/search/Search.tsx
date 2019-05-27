import React, { Component } from 'react'; // let's also import Component

type SearchState = {
	searchTerm: string;
};

export class Search extends Component<{}, SearchState> {
	// componentWillMount() {
	// }
	//
	// componentDidMount() {
	// }

	render() {
		return <div>search page works</div>;
	}
}
