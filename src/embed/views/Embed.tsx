import { Container, Flex, IconName, Spinner } from '@viaa/avo2-components';
import React, { type FC, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { type RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'redux';

import { GENERATE_SITE_TITLE } from '../../constants';
import ErrorView from '../../error/views/ErrorView';
import ItemVideoDescription from '../../item/components/ItemVideoDescription';
import { useGetItemByExternalId } from '../../item/hooks/useGetItem';
import { isMobileWidth } from '../../shared/helpers';
import withUser, { type UserProps } from '../../shared/hocs/withUser';
import useTranslation from '../../shared/hooks/useTranslation';

import './Embed.scss';

const Embed: FC<UserProps & RouteComponentProps<{ pid: string }>> = ({ match }) => {
	const { tText } = useTranslation();
	const itemPid = match.params.pid;

	const {
		data: item,
		isLoading: isLoadingItem,
		isError: isErrorItem,
	} = useGetItemByExternalId(itemPid, {
		enabled: !!itemPid,
	});

	useEffect(() => {
		document.querySelector('html')?.classList.add('embed-page');
		window.postMessage({ type: 'EMBED__LOGIN_SUCCESSFUL' }, '*');
	}, []);

	const renderSpinner = () => (
		<Container mode="vertical">
			<Flex orientation="horizontal" center>
				<Spinner size="large" />
			</Flex>
		</Container>
	);

	const renderItemPlayerAndDescription = () => {
		if (isLoadingItem) {
			return renderSpinner();
		}
		if (isErrorItem) {
			return (
				<ErrorView
					message={tText('Het laden van dit media item is mislukt')}
					icon={IconName.alertTriangle}
				/>
			);
		}
		return (
			<ItemVideoDescription
				itemMetaData={item}
				showMetadata={false}
				canPlay={true}
				verticalLayout={isMobileWidth()}
				trackPlayEvent={true}
				defaultVideoHeight={window.innerHeight - 20}
			/>
		);
	};

	return (
		<>
			<Helmet>
				<title>{GENERATE_SITE_TITLE(tText('Embed pagina titel'))}</title>
				<meta name="description" content={tText('Embed pagina beschrijving')} />
			</Helmet>
			{renderItemPlayerAndDescription()}
		</>
	);
};

export default compose(withRouter, withUser)(Embed) as FC;
