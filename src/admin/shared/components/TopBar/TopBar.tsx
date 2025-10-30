import { BlockHeading } from '@meemoo/admin-core-ui/client';
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
import React, { type FC, type ReactNode } from 'react';

import { useTranslation } from '../../../../shared/hooks/useTranslation';

import './TopBar.scss';

interface TopbarProps {
	onClickBackButton?: () => void;
	title?: string;
	center?: ReactNode;
	right?: ReactNode;
	size?: 'small' | 'medium' | 'large' | 'full-width';
}

export const TopBarComponent: FC<TopbarProps> = ({
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

export const TopBar = TopBarComponent as unknown as FC<TopbarProps>;
