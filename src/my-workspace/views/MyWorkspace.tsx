import React, { Fragment, FunctionComponent, ReactText, useState } from 'react';
import { RouteComponentProps } from 'react-router';

import { Tabs } from '@viaa/avo2-components';
import Collections from '../../collection/views/Collections';
import Bookmarks from './Bookmarks';

interface MyWorkspaceProps extends RouteComponentProps {}

const MyWorkspace: FunctionComponent<MyWorkspaceProps & RouteComponentProps> = ({
	history,
	location,
	match,
}) => {
	const [tabId, setTabId] = useState((match.params as any)['tabId'] as string);

	const goToTab = (id: ReactText) => {
		history.push(`/mijn-werkruimte/${id}`);
		setTabId(String(id));
	};

	return (
		<Fragment>
			<Tabs
				tabs={[
					{
						label: 'Collections',
						icon: 'collection',
						id: 'collecties',
						active: tabId === 'collecties',
					},
					{
						label: 'Bookmarks',
						icon: 'bookmark',
						id: 'bladwijzers',
						active: tabId === 'bladwijzers',
					},
				]}
				onClick={goToTab}
			/>
			<br />
			<span>TODO mijn werkruimte</span>
			<br />
			{(tabId === 'collecties' || !tabId) && (
				<Collections location={location} history={history} match={match} />
			)}
			{tabId === 'bladwijzers' && <Bookmarks location={location} history={history} match={match} />}
		</Fragment>
	);
};

export default MyWorkspace;
