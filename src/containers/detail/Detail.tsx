import React, { Component } from 'react';
import { RouteComponentProps, StaticContext } from 'react-router';
import { SearchResultItem } from '../../types';

type DetailProps = {};

interface DetailState extends StaticContext {
	item: Partial<SearchResultItem>;
}

export class Detail extends Component<RouteComponentProps<DetailProps>, DetailState> {
	constructor(props: RouteComponentProps) {
		super(props);
		this.state = {
			item: {},
		};
		// TODO: get item from store by id
		const itemId: string = (props.match.params as any)['id'];
	}

	async componentDidMount() {}

	render() {
		const item = this.state.item;

		return (
			<div className="detail-page">
				<h2>Detail page</h2>
				<div>{item.dc_title}</div>
			</div>
		);
	}
}
