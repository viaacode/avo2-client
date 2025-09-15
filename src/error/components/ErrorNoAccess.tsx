import { Blankslate, Button, Container, IconName } from '@viaa/avo2-components';
import React, { type FC, type ReactNode } from 'react';
import { compose } from 'redux';

import { APP_PATH } from '../../constants';
import { OrderedList } from '../../shared/components/OrderedList/OrderedList';
import withUser from '../../shared/hocs/withUser';
import useTranslation from '../../shared/hooks/useTranslation';

import './ErrorNoAccess.scss';

interface ErrorNoAccessProps {
	title: string | ReactNode;
	message: string | ReactNode;
}

const ErrorNoAccess: FC<ErrorNoAccessProps> = ({ title, message }) => {
	const { tText } = useTranslation();

	const goToWorkspace = () => {
		navigate(APP_PATH.WORKSPACE.route);
	};

	return (
		<div className="c-error-no-access">
			<Container mode="vertical" background="alt">
				<Container size="medium" mode="horizontal">
					<Blankslate icon={IconName.lock} title={title}>
						<p>{message}</p>
					</Blankslate>
				</Container>
			</Container>
			<div className="c-ordered-list-container">
				<OrderedList
					listItems={[
						tText('error/components/error-no-access___stap-1'),
						tText('error/components/error-no-access___stap-2'),
						tText('error/components/error-no-access___stap-3'),
						tText('error/components/error-no-access___stap-4'),
					]}
				/>
				<Button
					onClick={goToWorkspace}
					label={tText('error/components/error-no-access___terug-naar-werkruimte')}
					className="c-ordered-list-container__button"
				/>
			</div>
		</div>
	);
};

export default withUser(ErrorNoAccess) as FC<ErrorNoAccessProps>;
