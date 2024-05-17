import { BlockHeading } from '@meemoo/admin-core-ui';
import {
	Button,
	Container,
	Flex,
	IconName,
	Navbar,
	Spacer,
	Toolbar,
	ToolbarCenter,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import React, { type FunctionComponent, type ReactNode } from 'react';
import { type RouteComponentProps, withRouter } from 'react-router';

import useTranslation from '../../../../shared/hooks/useTranslation';

import './TopBar.scss';

interface TopbarProps {
	onClickBackButton?: () => void;
	title?: string;
	center?: ReactNode;
	right?: ReactNode;
	size?: 'small' | 'medium' | 'large' | 'full-width';
}

export const TopBarComponent: FunctionComponent<TopbarProps & RouteComponentProps> = ({
	onClickBackButton,
	title,
	center,
	right,
	size,
}) => {
	const { tText } = useTranslation();

	return (
		<Navbar className="c-top-bar">
			<Container mode="horizontal" size={size}>
				<Toolbar>
					<ToolbarLeft>
						<ToolbarItem>
							<Flex center>
								{!!onClickBackButton && (
									<Spacer margin="right">
										<Button
											className="c-top-bar__back"
											icon={IconName.chevronLeft}
											ariaLabel={tText(
												'admin/shared/components/top-bar/top-bar___ga-terug-naar-het-vorig-scherm'
											)}
											title={tText(
												'admin/shared/components/top-bar/top-bar___ga-terug-naar-het-vorig-scherm'
											)}
											onClick={onClickBackButton}
											type="borderless"
										/>
									</Spacer>
								)}
								<div title={title}>
									<BlockHeading type={'h1'}>{title}</BlockHeading>
								</div>
							</Flex>
						</ToolbarItem>
					</ToolbarLeft>
					{!!center && <ToolbarCenter>{center}</ToolbarCenter>}
					{!!right && <ToolbarRight>{right}</ToolbarRight>}
				</Toolbar>
			</Container>
		</Navbar>
	);
};

export const TopBar = withRouter(TopBarComponent) as unknown as FunctionComponent<TopbarProps>;
