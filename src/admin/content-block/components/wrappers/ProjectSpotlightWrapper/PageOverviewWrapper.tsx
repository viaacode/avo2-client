import { get } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { withRouter } from 'react-router';
import { compose } from 'redux';

import {
	BlockPageOverview,
	BlockProjectsSpotlight,
	ButtonAction,
	ContentItemStyle,
	ContentPageInfo,
	ContentTabStyle,
	LabelObj,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { getUserGroupIds } from '../../../../../authentication/authentication.service';
import { DefaultSecureRouteProps } from '../../../../../authentication/components/SecuredRoute';
import { ContentPage } from '../../../../../content-page/views';
import { CustomError, navigateToContentType } from '../../../../../shared/helpers';
import withUser from '../../../../../shared/hocs/withUser';
import { useDebounce } from '../../../../../shared/hooks';
import { dataService, ToastService } from '../../../../../shared/services';
import i18n from '../../../../../shared/translations/i18n';
import { GET_CONTENT_PAGES, GET_CONTENT_PAGES_WITH_BLOCKS } from '../../../../content/content.gql';
import { DbContent } from '../../../../content/content.types';
import { ContentTypeAndLabelsValue } from '../../../../shared/components/ContentTypeAndLabelsPicker/ContentTypeAndLabelsPicker';
import { ContentPageService } from '../../../../../shared/services/content-page-service';

interface ProjectSpotlightProps {
	project: ButtonAction;
	customImage: string;
	customTitle: string;
}

interface ProjectSpotlightWrapperProps {
	elements: ProjectSpotlightProps[];
}

const ProjectSpotlightWrapper: FunctionComponent<ProjectSpotlightWrapperProps &
	DefaultSecureRouteProps> = ({ elements }) => {
	const [t] = useTranslation();

	const fetchContentPages = async () => {
		ContentPageService.getContentPageByPath();
	};

	useEffect(() => {
		fetchContentPages();
	}, [elements]);

	return (
		<BlockProjectsSpotlight
			elements={[
				{
					buttonAction: elements[0].project,
					title: elements[0].project,
				},
			]}
			navigate={(buttonAction: ButtonAction) => navigateToContentType(buttonAction, history)}
		/>
	);
};

export default compose(withRouter, withUser)(ProjectSpotlightWrapper) as FunctionComponent<
	ProjectSpotlightWrapperProps
>;
