import {
	Container,
	Navbar,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import classnames from 'classnames';
import React, { FC, ReactNode } from 'react';

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
				className={classnames({
					'u-p-b-0': info,
				})}
			>
				<Container mode="horizontal">
					<Toolbar autoHeight className="c-assignment-heading__top">
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
					className="u-padding-bottom-s u-p-t-0"
				>
					<Container mode="horizontal">{info}</Container>
				</Container>
			)}

			{(tabs || tour) && (
				<Container mode="horizontal" className="c-assignment-heading__bottom">
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
