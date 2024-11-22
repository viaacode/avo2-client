import { Button } from '@meemoo/react-components';
import { type Avo } from '@viaa/avo2-types';
import React, { type FC, type MouseEvent, useCallback, useEffect, useState } from 'react';

import LoginOptions from '../../authentication/components/LoginOptions';
import { getLoginResponse } from '../../authentication/store/actions';
import { useGetItemByExternalId } from '../../item/hooks/useGetItem';
import FlowPlayerWrapper from '../../shared/components/FlowPlayerWrapper/FlowPlayerWrapper';
import TextWithTimestamps from '../../shared/components/TextWithTimestamp/TextWithTimestamps';
import { reorderDate } from '../../shared/helpers';
import useTranslation from '../../shared/hooks/useTranslation';

import '@iframe-resizer/child';

import './EmbedChildPage.scss';

const EmbedChildPage: FC = () => {
	const { tText } = useTranslation();
	const [commonUser, setCommonUser] = useState<Avo.User.CommonUser | null>(null);
	const embedCodeId = window.location.pathname.split('/').pop();
	const [isLoginChecked, setIsLoginChecked] = useState(false);
	const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

	const getLogin = useCallback(async () => {
		setIsLoginChecked(false);
		const loginResponse = await getLoginResponse(true);
		if (loginResponse.message === 'LOGGED_IN') {
			setCommonUser((loginResponse as Avo.Auth.LoginResponseLoggedIn).commonUserInfo);
		}
		setIsLoginChecked(true);
	}, []);

	const handlePostMessage = useCallback(
		async (event: MessageEvent) => {
			if (event?.data === 'MEEMOO_EMBED__LOGIN_SUCCESSFUL') {
				await getLogin();
			}
		},
		[getLogin]
	);

	useEffect(() => {
		getLogin();

		// Listen for messages from the parent
		window.addEventListener('message', handlePostMessage);

		// Cleanup event listener
		return () => {
			window.removeEventListener('message', handlePostMessage);
		};
	}, [getLogin, handlePostMessage]);

	const {
		data: item,
		isLoading: isLoadingItem,
		isError: isErrorItem,
	} = useGetItemByExternalId(embedCodeId as string, {
		enabled: !!embedCodeId,
	});

	useEffect(() => {
		document.querySelector('html')?.classList.add('embed-page');
	}, []);

	const renderMessageCentered = (message: string) => (
		<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
			{message}
		</div>
	);

	function handleExpandDescriptionButtonClick(evt: MouseEvent<HTMLButtonElement>) {
		(evt.currentTarget as HTMLButtonElement).blur();
		const newIsDescriptionExpanded = !isDescriptionExpanded;
		setIsDescriptionExpanded(newIsDescriptionExpanded);
		if (!newIsDescriptionExpanded) {
			console.log('scrolling to iframe');
			window.parentIFrame.sendMessage('MEEMOO_EMBED__SCROLL_TO_IFRAME');
		}
	}

	const renderItemPlayerAndDescription = () => {
		if (!embedCodeId) {
			return renderMessageCentered('De embedcode bevat geen id');
		}
		if (!isLoginChecked) {
			return renderMessageCentered('Checking login...');
		}
		if (!commonUser) {
			return <LoginOptions />;
		}
		if (isLoadingItem) {
			return renderMessageCentered('Loading media...');
		}
		if (isErrorItem) {
			return renderMessageCentered('Het laden van dit media item is mislukt');
		}
		return (
			<>
				<FlowPlayerWrapper item={item} canPlay={true} trackPlayEvent={true} />
				<div style={{ padding: '20px' }}>
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
					<div>
						<h3 style={{ marginTop: '2rem', fontWeight: 'bold' }}>
							{item?.title || ''}
						</h3>
						<h4 style={{ marginTop: '2rem' }}>
							{tText('item/components/item-video-description___beschrijving')}
						</h4>

						<div
							style={{
								maxHeight: isDescriptionExpanded ? 'none' : '20rem',
								overflow: 'hidden',
								transition: 'max-height 300ms ease-in-out',
							}}
						>
							<TextWithTimestamps content={item?.description || ''} />
						</div>
						<div
							style={{
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<Button
								variants={['secondary']}
								label={isDescriptionExpanded ? 'Minder lezen' : 'Meer lezen'}
								onClick={handleExpandDescriptionButtonClick}
							/>
						</div>
					</div>
				</div>
			</>
		);
	};

	return renderItemPlayerAndDescription();
};

export default EmbedChildPage;
