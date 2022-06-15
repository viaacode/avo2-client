import React, { FC, ReactNode } from 'react';

import {
	Container,
	Navbar,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';

import { InteractiveTour } from '../../shared/components';

import './AssignmentHeading.scss';

interface AssignmentHeadingProps {
	actions?: ReactNode;
	back?: ReactNode;
	info?: ReactNode;
	tabs?: ReactNode;
	title: ReactNode;
	tour?: ReactNode;
}

const AssignmentHeading: FC<AssignmentHeadingProps> = ({
	actions,
	back,
	info,
	tabs,
	title,
	tour = <InteractiveTour showButton />,
}) => (
	<>
		<Navbar background="alt" placement="top" autoHeight className="c-assignment-heading">
			<Container
				mode="vertical"
				size="small"
				className={[...(info ? ['u-p-b-0'] : [])].join(' ')}
			>
				<Container mode="horizontal">
					<Toolbar
						autoHeight
						className="c-toolbar--drop-columns-low-mq c-assignment-heading__top"
					>
						<ToolbarLeft>
							<ToolbarItem className="c-assignment-heading__title" grow>
								{back}
								{title}
							</ToolbarItem>
						</ToolbarLeft>

						{actions && (
							<ToolbarRight>
								<ToolbarItem className="c-assignment-heading__actions">
									{actions}
								</ToolbarItem>
							</ToolbarRight>
						)}
					</Toolbar>
				</Container>
			</Container>

			{info && (
				<Container
					background="alt"
					mode="vertical"
					size="small"
					className="u-padding-bottom-s"
				>
					<Container mode="horizontal">{info}</Container>
				</Container>
			)}

			{(tabs || tour) && (
				<Container mode="horizontal">
					<Toolbar className="c-toolbar--no-height">
						{tabs && <ToolbarLeft>{tabs}</ToolbarLeft>}

						{tour && <ToolbarRight>{tour}</ToolbarRight>}
					</Toolbar>
				</Container>
			)}
		</Navbar>
	</>
);

export default AssignmentHeading;
