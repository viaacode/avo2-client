import {
	type RichTextEditorControl,
	RichTextEditorWithInternalState,
} from '@meemoo/react-components';
import {
	Alert,
	Button,
	ButtonGroup,
	ButtonToolbar,
	Container,
	ExpandableContainer,
	FormGroup,
	IconName,
	Spacer,
	TextInput,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { type ItemSchema } from '@viaa/avo2-types/types/item';
import React, { type FC, type ReactNode, useCallback, useEffect, useState } from 'react';

import ItemVideoDescription from '../../item/components/ItemVideoDescription';
import TextWithTimestamps from '../../shared/components/TextWithTimestamp/TextWithTimestamps';
import TimeCropControls from '../../shared/components/TimeCropControls/TimeCropControls';
import { copyToClipboard } from '../../shared/helpers/clipboard';
import { getValidStartAndEnd } from '../../shared/helpers/cut-start-and-end';
import { toSeconds } from '../../shared/helpers/parsers/duration';
import { tHtml } from '../../shared/helpers/translate-html';
import { tText } from '../../shared/helpers/translate-text';
import './EmbedContent.scss';
import { ToastService } from '../../shared/services/toast-service';
import {
	type EmbedCode,
	EmbedCodeDescriptionType,
	EmbedCodeExternalWebsite,
} from '../embed-code.types';
import { toEmbedCodeIFrame } from '../helpers/links';
import { useCreateEmbedCode } from '../hooks/useCreateEmbedCode';

type EmbedProps = {
	item?: EmbedCode;
	contentDescription: ReactNode | string;
	onSave?: (item: EmbedCode) => void;
	onClose?: () => void;
};

const EmbedContent: FC<EmbedProps> = ({ item, contentDescription, onSave, onClose }) => {
	const fragmentDuration = item?.content
		? toSeconds((item.content as ItemSchema)?.duration) || 0
		: 0;

	const [title, setTitle] = useState<string | undefined>();

	const [fragmentStartTime, setFragmentStartTime] = useState<number>(0);
	const [fragmentEndTime, setFragmentEndTime] = useState<number>(0);

	const [start, end] = getValidStartAndEnd(fragmentStartTime, fragmentEndTime, fragmentDuration);

	const [descriptionType, setDescriptionType] = useState<EmbedCodeDescriptionType>(
		EmbedCodeDescriptionType.ORIGINAL
	);
	const [description, setDescription] = useState<string>('');
	const [isDescriptionExpanded, setIsDescriptionExpanded] = useState<boolean>(false);
	const [generatedCode, setGeneratedCode] = useState<string>('');

	const { mutateAsync: createEmbedCode, isLoading: isPublishing } = useCreateEmbedCode();

	const handleDescriptionToggle = useCallback(
		(value: EmbedCodeDescriptionType) => {
			if (!item) {
				return;
			}
			switch (value) {
				case EmbedCodeDescriptionType.ORIGINAL:
					setDescription(item.content.description || '');
					break;
				case EmbedCodeDescriptionType.CUSTOM:
					setDescription(item.content.description || '');
					break;
				case EmbedCodeDescriptionType.NONE:
					setDescription('');
					break;
			}
			setDescriptionType(value);
		},
		[item]
	);

	useEffect(() => {
		if (item) {
			setTitle(item.title || '');
			setFragmentStartTime(item.start || 0);
			setFragmentEndTime(item.end || 0);

			handleDescriptionToggle(item.descriptionType);
			setDescription(item.description || '');
			setGeneratedCode('');
		}
	}, [item, handleDescriptionToggle]);

	const mapValuesToEmbedCode = (): EmbedCode => {
		if (!item) {
			return {} as EmbedCode;
		}
		let newDescription = '';

		if (descriptionType === EmbedCodeDescriptionType.ORIGINAL) {
			newDescription = item.content.description || '';
		} else if (descriptionType === EmbedCodeDescriptionType.CUSTOM) {
			newDescription = description || '';
		}

		return {
			...item,
			title: title || '',
			start: fragmentStartTime,
			end: fragmentEndTime,
			descriptionType,
			description: newDescription,
		};
	};

	const handleSave = () => {
		onSave && onSave(mapValuesToEmbedCode());
	};

	const handleCreate = async () => {
		try {
			const embedCodeId = await createEmbedCode(mapValuesToEmbedCode());
			setGeneratedCode(toEmbedCodeIFrame(embedCodeId));
			ToastService.success(
				tText('Je code werd succesvol aangemaakt en opgeslagen in je werkruimte.')
			);
		} catch (err) {
			ToastService.danger(tText('Code aanmaken mislukt'));
		}
	};

	const handleCopyButtonClicked = () => {
		copyToClipboard(generatedCode);
		ToastService.success(tHtml('De code is naar je klembord gekopieerd'));
	};

	const renderDescription = () => {
		if (descriptionType === EmbedCodeDescriptionType.ORIGINAL && !!item?.content?.description) {
			return (
				<div className={isDescriptionExpanded ? '' : 'expandable-container-closed'}>
					<ExpandableContainer
						collapsedHeight={300}
						defaultExpanded={isDescriptionExpanded}
						onChange={setIsDescriptionExpanded}
					>
						<TextWithTimestamps content={item.content.description || ''} />
					</ExpandableContainer>
				</div>
			);
		}

		if (descriptionType === EmbedCodeDescriptionType.CUSTOM) {
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
					value={description || ''}
					disabled={!!generatedCode}
					onChange={setDescription}
				/>
			);
		}

		return <></>;
	};

	const renderDescriptionWrapper = () => {
		if (item?.externalWebsite === EmbedCodeExternalWebsite.BOOKWIDGETS) {
			return (
				<Alert type="info">
					<span className="c-content">
						{tHtml(
							'Bij het insluiten op Bookwidgets wordt er geen beschrijving bij het fragment weergegeven.'
						)}
					</span>
				</Alert>
			);
		}

		return (
			<>
				<ButtonGroup className="u-d-flex">
					<Button
						id="share-fragment-use-original-description"
						type="secondary"
						className="u-flex-auto"
						disabled={!!generatedCode}
						label={tText('Originele beschrijving')}
						active={descriptionType === EmbedCodeDescriptionType.ORIGINAL}
						onClick={() => handleDescriptionToggle(EmbedCodeDescriptionType.ORIGINAL)}
					/>
					<Button
						type="secondary"
						className="u-flex-auto"
						disabled={!!generatedCode}
						label={tText('Eigen beschrijving')}
						active={descriptionType === EmbedCodeDescriptionType.CUSTOM}
						onClick={() => handleDescriptionToggle(EmbedCodeDescriptionType.CUSTOM)}
					/>
					<Button
						type="secondary"
						className="u-flex-auto"
						disabled={!!generatedCode}
						label={tText('Geen beschrijving')}
						active={descriptionType === EmbedCodeDescriptionType.NONE}
						onClick={() => handleDescriptionToggle(EmbedCodeDescriptionType.NONE)}
					/>
				</ButtonGroup>
				<Spacer margin="top">{renderDescription()}</Spacer>
			</>
		);
	};

	const renderRightSideFooter = () => {
		if (onSave) {
			return (
				<ToolbarRight>
					<ToolbarItem>
						<ButtonToolbar>
							<Button
								type="primary"
								label={tText('Opslaan')}
								title={tText('Opslaan')}
								ariaLabel={tText('Opslaan')}
								onClick={handleSave}
							/>
						</ButtonToolbar>
					</ToolbarItem>
				</ToolbarRight>
			);
		}

		if (generatedCode) {
			return (
				<ToolbarRight>
					<ToolbarItem className="u-truncate">{generatedCode}</ToolbarItem>
					<ToolbarItem>
						<ButtonToolbar>
							<Button
								type="primary"
								icon={IconName.copy}
								title={tText('Code kopiëren')}
								ariaLabel={tText('Code kopiëren')}
								onClick={handleCopyButtonClicked}
							/>
						</ButtonToolbar>
					</ToolbarItem>
				</ToolbarRight>
			);
		}

		return (
			<ToolbarRight>
				<ToolbarItem>
					<ButtonToolbar>
						<Button
							type="primary"
							label={tText('Code aanmaken')}
							title={tText('Code aanmaken')}
							ariaLabel={tText('Code aanmaken')}
							disabled={isPublishing}
							onClick={handleCreate}
						/>
					</ButtonToolbar>
				</ToolbarItem>
			</ToolbarRight>
		);
	};

	if (!item) {
		return <></>;
	}

	return (
		<>
			<Spacer margin="bottom-large">{contentDescription}</Spacer>

			<FormGroup label={tText('Titel')}>
				<TextInput value={title} onChange={setTitle} disabled={!!generatedCode} />
			</FormGroup>

			<Container mode="vertical" bordered={true}>
				<FormGroup label={tText('Inhoud')}>
					<div className="u-spacer-bottom">
						<ItemVideoDescription
							itemMetaData={item.content as ItemSchema}
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
						disabled={!!generatedCode}
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
								label={generatedCode ? tText('Annuleer') : tText('Sluit')}
								title={generatedCode ? tText('Annuleer') : tText('Sluit')}
								ariaLabel={generatedCode ? tText('Annuleer') : tText('Sluit')}
								onClick={onClose}
							/>
						</ButtonToolbar>
					</ToolbarItem>
				</ToolbarLeft>
				{renderRightSideFooter()}
			</Toolbar>
		</>
	);
};

export default EmbedContent;
