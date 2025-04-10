import {
	type RichTextEditorControl,
	RichTextEditorWithInternalState,
} from '@meemoo/react-components';
import {
	Button,
	ButtonGroup,
	ButtonToolbar,
	Container,
	ExpandableContainer,
	FormGroup,
	Spacer,
	TextInput,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import React, { type FC, useEffect, useMemo, useState } from 'react';

import { ItemVideoDescription } from '../../../item/components';
import { toSeconds } from '../../helpers';
import { getValidStartAndEnd } from '../../helpers/cut-start-and-end';
import { tText } from '../../helpers/translate-text';
import './EmbedContent.scss';
import TextWithTimestamps from '../TextWithTimestamp/TextWithTimestamps';
import TimeCropControls from '../TimeCropControls/TimeCropControls';

type EmbedProps = {
	item: Avo.Item.Item;
	customDescription?: React.ReactNode;
	onClose?: () => void;
};

enum DescriptionSelection {
	original = 'original',
	custom = 'custom',
	none = 'none',
}

const EmbedContent: FC<EmbedProps> = ({ item, customDescription, onClose }) => {
	const [title, setTitle] = useState<string | undefined>();

	const [fragmentStartTime, setFragmentStartTime] = useState<number>(0);
	const [fragmentEndTime, setFragmentEndTime] = useState<number>(0);

	const fragmentDuration = useMemo(() => toSeconds(item.duration) || 0, [item]);
	const [start, end] = getValidStartAndEnd(fragmentStartTime, fragmentEndTime, fragmentDuration);

	const [descriptionSelection, setDescriptionSelection] = useState<DescriptionSelection>(
		DescriptionSelection.original
	);
	const [isDescriptionExpanded, setIsDescriptionExpanded] = useState<boolean>(false);

	useEffect(() => {
		setTitle(item?.title || '');
		setFragmentEndTime(toSeconds(item.duration) || 0);
	}, [item]);

	const renderDescription = () => {
		if (descriptionSelection === DescriptionSelection.original) {
			return (
				<div className={isDescriptionExpanded ? '' : 'expandable-container-closed'}>
					<ExpandableContainer
						collapsedHeight={300}
						defaultExpanded={isDescriptionExpanded}
						onChange={setIsDescriptionExpanded}
					>
						<TextWithTimestamps content={item?.description || ''} />
					</ExpandableContainer>
				</div>
			);
		}

		if (descriptionSelection === DescriptionSelection.custom) {
			const controls: RichTextEditorControl[] = [
				'undo',
				'redo',
				'separator',
				'bold',
				'italic',
				'strike-through',
				'underline',
				'separator',
				'remove-styles',
				'separator',
				'text-align',
				'separator',
				'headings',
				'list-ol',
				'list-ul',
				'separator',
				'link',
				'separator',
				'fullscreen',
			];
			return (
				<RichTextEditorWithInternalState
					controls={controls}
					enabledHeadings={['h3', 'h4', 'normal']}
					value={item?.description || ''}
				/>
			);
		}

		return <></>;
	};

	const renderDescriptionWrapper = () => {
		if (customDescription) {
			return customDescription;
		}

		return (
			<>
				<ButtonGroup className="u-d-flex">
					<Button
						id="share-fragment-use-original-description"
						type="secondary"
						className="u-flex-auto"
						label={tText('Originele beschrijving')}
						active={descriptionSelection === DescriptionSelection.original}
						onClick={() => setDescriptionSelection(DescriptionSelection.original)}
					/>
					<Button
						type="secondary"
						className="u-flex-auto"
						label={tText('Eigen beschrijving')}
						active={descriptionSelection === DescriptionSelection.custom}
						onClick={() => setDescriptionSelection(DescriptionSelection.custom)}
					/>
					<Button
						type="secondary"
						className="u-flex-auto"
						label={tText('Geen beschrijving')}
						active={descriptionSelection === DescriptionSelection.none}
						onClick={() => setDescriptionSelection(DescriptionSelection.none)}
					/>
				</ButtonGroup>
				<Spacer margin="top">{renderDescription()}</Spacer>
			</>
		);
	};

	return (
		<>
			<Spacer margin="top-large">
				<FormGroup label={tText('Titel')}>
					<TextInput value={title} onChange={setTitle} />
				</FormGroup>
			</Spacer>

			<Container mode="vertical" bordered={true}>
				<FormGroup label={tText('Inhoud')}>
					<div className="u-spacer-bottom">
						<ItemVideoDescription
							itemMetaData={item}
							showMetadata={false}
							enableMetadataLink={false}
							showTitle={false}
							showDescription={false}
							canPlay={true}
							cuePointsLabel={{ start, end }}
							cuePointsVideo={{ start, end }}
							trackPlayEvent={false}
						/>
					</div>
					<TimeCropControls
						startTime={fragmentStartTime}
						endTime={fragmentEndTime}
						minTime={0}
						maxTime={fragmentDuration}
						onChange={(newStartTime: number, newEndTime: number) => {
							const [validStart, validEnd] = getValidStartAndEnd(
								newStartTime,
								newEndTime,
								fragmentDuration
							);

							const [start_oc, end_oc] = [
								validStart || 0,
								validEnd || fragmentDuration,
							];

							setFragmentStartTime(start_oc);
							setFragmentEndTime(end_oc);
						}}
					/>
				</FormGroup>
				<Spacer margin="top-large">{renderDescriptionWrapper()}</Spacer>
			</Container>
			<Toolbar justify>
				<ToolbarLeft>
					<ToolbarItem>
						<ButtonToolbar>
							<Button
								type="secondary"
								label={tText('Annuleer')}
								title={tText('Annuleer')}
								ariaLabel={tText('Annuleer')}
								onClick={onClose}
							/>
						</ButtonToolbar>
					</ToolbarItem>
				</ToolbarLeft>
				<ToolbarRight>
					<ToolbarItem>
						<ButtonToolbar>
							<Button
								type="primary"
								label={tText('Code aanmaken')}
								title={tText('Code aanmaken')}
								ariaLabel={tText('Code aanmaken')}
							/>
						</ButtonToolbar>
					</ToolbarItem>
				</ToolbarRight>
			</Toolbar>
		</>
	);
};

export default EmbedContent;
