import {
	Alert,
	BlockHeading,
	Container,
	Flex,
	Icon,
	Spacer,
	Spinner,
	Tabs,
} from '@viaa/avo2-components';
import { isPast } from 'date-fns/esm';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { ErrorView } from '../../error/views';
import { InteractiveTour } from '../../shared/components';
import { buildLink, formatTimestamp } from '../../shared/helpers';
import { ASSIGNMENTS_ID } from '../../workspace/workspace.const';
import { ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS } from '../assignment.const';
import AssignmentHeading from '../components/AssignmentHeading';
import { useAssignmentPupilTabs } from '../hooks';
import { useGetAssignmentById } from '../hooks/get-assignment-by-id';

import './AssignmentPage.scss';

const AssignmentResponseEdit: FunctionComponent<DefaultSecureRouteProps<{ id: string }>> = ({
	match,
}) => {
	const [t] = useTranslation();

	// Data
	const {
		data: assignmentResponse,
		loading: isAssignmentLoading,
		error: assignmentError,
	} = useGetAssignmentById(match.params.id);
	const assignment = assignmentResponse?.app_assignments_v2?.[0];

	// UI
	const [tabs, tab, , onTabClick] = useAssignmentPupilTabs(assignment);

	const pastDeadline = useMemo(
		() => assignment?.deadline_at && isPast(new Date(assignment.deadline_at)),
		[assignment]
	);

	// HTTP

	// Effects

	// Events

	// Render

	const renderBackButton = useMemo(
		() => (
			<Link
				className="c-return"
				to={buildLink(APP_PATH.WORKSPACE_TAB.route, {
					tabId: ASSIGNMENTS_ID,
				})}
			>
				<Icon name="chevron-left" size="small" type="arrows" />

				{t('assignment/views/assignment-edit___mijn-opdrachten')}
			</Link>
		),
		[t]
	);

	const renderTitle = useMemo(
		() => (
			<Flex center className="u-spacer-top-l">
				<Icon name="clipboard" size="large" />

				<BlockHeading className="u-spacer-left" type="h2">
					{assignment?.title}
				</BlockHeading>
			</Flex>
		),
		[assignment]
	);

	const renderMeta = useCallback(() => {
		if (!assignment) {
			return null;
		}
		const teacherName = assignment?.owner?.full_name;
		const deadline = formatTimestamp(assignment?.deadline_at, false);
		const labels = (assignment?.labels || [])
			.filter((label) => label.assignment_label.type === 'LABEL')
			.map((label) => label.assignment_label.label)
			.join(', ');
		const classes = (assignment?.labels || [])
			.filter((label) => label.assignment_label.type === 'CLASS')
			.map((label) => label.assignment_label.label)
			.join(', ');

		return (
			<section className="u-spacer-bottom">
				<Flex>
					{teacherName && (
						<div>
							{t('assignment/views/assignment-response-edit___lesgever')}:{' '}
							<b>{teacherName}</b>
						</div>
					)}

					{deadline && (
						<Spacer margin="left">
							{t('assignment/views/assignment-response-edit___deadline')}:{' '}
							<b>{deadline}</b>
						</Spacer>
					)}

					{labels && (
						<Spacer margin="left">
							{t('assignment/views/assignment-response-edit___label')}:{' '}
							<b>{labels}</b>
						</Spacer>
					)}

					{classes && (
						<Spacer margin="left">
							{t('assignment/views/assignment-response-edit___klas')}:{' '}
							<b>{classes}</b>
						</Spacer>
					)}
				</Flex>
			</section>
		);
	}, [assignment, t]);

	const renderTabs = useMemo(() => <Tabs tabs={tabs} onClick={onTabClick} />, [tabs, onTabClick]);

	const renderTabContent = useMemo(() => {
		switch (tab) {
			case ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.ASSIGNMENT:
				return 'assignment details';

			case ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.SEARCH:
				// This form receives its parent's state because we don't care about rerender performance here
				return 'search page';

			case ASSIGNMENT_RESPONSE_CREATE_UPDATE_TABS.MY_COLLECTION:
				// This form receives its parent's state because we don't care about rerender performance here
				return 'collection view';

			default:
				return tab;
		}
	}, [tab]);

	const renderPageContent = () => {
		if (isAssignmentLoading) {
			return <Spinner size="large" />;
		}
		if (assignmentError) {
			return (
				<ErrorView
					message={t(
						'assignment/views/assignment-response-edit___het-ophalen-van-de-opdracht-is-mislukt'
					)}
					icon={'search'}
				/>
			);
		}
		if (!assignment) {
			return (
				<ErrorView
					message={t(
						'assignment/views/assignment-response-edit___de-opdracht-is-niet-gevonden'
					)}
					icon={'search'}
				/>
			);
		}
		return (
			<div className="c-assignment-page c-assignment-page--create">
				<AssignmentHeading
					back={renderBackButton}
					title={renderTitle}
					actions={null}
					tabs={renderTabs}
					info={renderMeta()}
					tour={<InteractiveTour showButton />}
				/>

				<Container mode="horizontal">
					{pastDeadline && (
						<Spacer margin={['top-large']}>
							<Alert type="info">
								{t(
									'assignment/views/assignment-response-edit___deze-opdracht-is-afgelopen-de-deadline-was-deadline',
									{
										deadline: formatTimestamp(assignment?.deadline_at, false),
									}
								)}
							</Alert>
						</Spacer>
					)}

					<Spacer margin={['top-large', 'bottom-large']}>{renderTabContent}</Spacer>
				</Container>
			</div>
		);
	};

	return (
		<>
			<MetaTags>
				<title>
					{GENERATE_SITE_TITLE(
						t(
							'assignment/views/assignment-response-edit___maak-opdracht-antwoord-pagina-titel'
						)
					)}
				</title>

				<meta
					name="description"
					content={t(
						'assignment/views/assignment-response-edit___maak-opdracht-antwoord-pagina-beschrijving'
					)}
				/>
			</MetaTags>

			{renderPageContent()}
		</>
	);
};

export default AssignmentResponseEdit;
