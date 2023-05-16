import { Blankslate, Button, Container, IconName } from '@viaa/avo2-components';
import React, { FunctionComponent, ReactNode } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'redux';

import {
	redirectToLoggedInHome,
	redirectToLoggedOutHome,
} from '../../authentication/helpers/redirects';
import { OrderedList } from '../../shared/components/OrderedList/OrderedList';
import withUser, { UserProps } from '../../shared/hocs/withUser';
import useTranslation from '../../shared/hooks/useTranslation';

import './ErrorNoAccess.scss';

interface ErrorNoAccessProps {
	title: string | ReactNode;
	message: string | ReactNode;
}

const ErrorNoAccess: FunctionComponent<ErrorNoAccessProps & RouteComponentProps & UserProps> = ({
	title,
	message,
	location,
	user,
}) => {
	const { tText } = useTranslation();

	const goToHome = () => {
		if (user) {
			redirectToLoggedInHome(location);
		} else {
			redirectToLoggedOutHome(location);
		}
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
					onClick={goToHome}
					label={tText('error/components/error-no-access___terug-naar-werkruimte')}
					className="c-ordered-list-container__button"
				/>
			</div>
		</div>
	);
};

export default compose(
	withRouter,
	withUser
)(ErrorNoAccess) as FunctionComponent<ErrorNoAccessProps>;
