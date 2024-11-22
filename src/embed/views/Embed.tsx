import { Container, ExpandableContainer, Flex, IconName, Spinner } from '@viaa/avo2-components';
import React, { type FC, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { type RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'redux';

import { GENERATE_SITE_TITLE } from '../../constants';
import ErrorView from '../../error/views/ErrorView';
import { useGetItemByExternalId } from '../../item/hooks/useGetItem';
import { FlowPlayerWrapper } from '../../shared/components';
import TextWithTimestamps from '../../shared/components/TextWithTimestamp/TextWithTimestamps';
import { reorderDate } from '../../shared/helpers';
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
			<>
				<FlowPlayerWrapper item={item} canPlay={true} trackPlayEvent={true} />
				{!!item.issued && (
					<div>
						<span className="c-item-video-description__metadata__title">
							{tText('item/views/item___publicatiedatum')}:{' '}
						</span>
						<span className="c-item-video-description__metadata__value">
							{reorderDate(item.issued, '/')}
						</span>
					</div>
				)}
				{!!item?.organisation?.name && (
					<div>
						<span className="c-item-video-description__metadata__title">
							{tText('item/views/item___aanbieder')}:{' '}
						</span>
						<span className="c-item-video-description__metadata__value">
							{item.organisation.name}
						</span>
					</div>
				)}
				{!!item.series && (
					<div>
						<span className="c-item-video-description__metadata__title">
							{tText('item/views/item___reeks')}:{' '}
						</span>
						<span className="c-item-video-description__metadata__value">
							{item.series}
						</span>
					</div>
				)}
				<ExpandableContainer collapsedHeight={300 - 36 - 18}>
					<h3>{item?.title || ''}</h3>
					<h4>{tText('item/components/item-video-description___beschrijving')}</h4>

					<TextWithTimestamps content={item?.description || ''} />
				</ExpandableContainer>
			</>
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
