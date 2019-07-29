import React, { Fragment, FunctionComponent } from 'react';

import { RouteComponentProps } from 'react-router';

interface BookmarksProps extends RouteComponentProps {}

const Bookmarks: FunctionComponent<BookmarksProps> = () => {
	return (
		<Fragment>
			<span>TODO bookmarks</span>
		</Fragment>
	);
};

export default Bookmarks;
