import React, { Fragment, FunctionComponent } from 'react';

import {
	Button,
	Container,
	Navbar,
	Toolbar,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { RouteComponentProps } from 'react-router';

interface CollectionsProps extends RouteComponentProps {}

const resourceType = {
	collectie: {
		label: 'Maak nieuwe collectie',
		href: 'modal-new-collection',
	},
	map: {
		label: 'Maak nieuwe map',
		href: 'modal-new-folder',
	},
};

export const Collections: FunctionComponent<CollectionsProps> = ({  }: CollectionsProps) => {
	const currentResourceType = resourceType['collectie'];

	return (
		<Fragment>
			<Container mode="vertical" size="small" background="alt">
				<Toolbar autoHeight>
					<ToolbarLeft>
						<h2 className="c-h2 u-m-0">Mijn Werkruimte</h2>
					</ToolbarLeft>
					<ToolbarRight>
						<Button type="secondary" icon="plus" label={currentResourceType.label} />
					</ToolbarRight>
				</Toolbar>
			</Container>
			<Navbar autoHeight background="alt">
				<Container>
					<Toolbar autoHeight>
						<ToolbarLeft>
							<nav className="c-tabs">
								<a className="c-tabs-item">Collecties</a>
								<a className="c-tabs-item">Bladwijzers</a>
							</nav>
						</ToolbarLeft>
					</Toolbar>
				</Container>
			</Navbar>
		</Fragment>
	);
};
