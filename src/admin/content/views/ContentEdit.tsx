import React, { FunctionComponent, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';

import { navigate } from '../../../shared/helpers';
import { AdminLayout } from '../../shared/layouts';

import { CONTENT_PATH } from '../content.const';

interface ContentEditProps extends RouteComponentProps<{ id?: string }> {}

const ContentEdit: FunctionComponent<ContentEditProps> = ({ history, match }) => {
	const [pageType, setPageType] = useState<'edit' | 'create' | undefined>();

	useEffect(() => {
		setPageType(match.params.id ? 'edit' : 'create');
	}, [match.params.id]);

	// Methods
	const navigateBack = () => {
		const { id } = match.params;

		if (pageType === 'create') {
			history.push(CONTENT_PATH.CONTENT);
		} else {
			navigate(history, CONTENT_PATH.CONTENT, { id });
		}
	};

	// Render
	return <AdminLayout pageTitle="Content edit" navigateBack={navigateBack} />;
};

export default ContentEdit;
