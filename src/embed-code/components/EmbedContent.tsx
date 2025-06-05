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
import { debounce } from 'lodash-es';
import React, {
	type FC,
	type LegacyRef,
	type ReactNode,
	useCallback,
	useEffect,
	useState,
} from 'react';
import { compose } from 'redux';

import ItemVideoDescription from '../../item/components/ItemVideoDescription';
import TextWithTimestamps from '../../shared/components/TextWithTimestamp/TextWithTimestamps';
import TimeCropControls from '../../shared/components/TimeCropControls/TimeCropControls';
import { copyToClipboard } from '../../shared/helpers/clipboard';
import { getValidStartAndEnd } from '../../shared/helpers/cut-start-and-end';
import { toSeconds } from '../../shared/helpers/parsers/duration';
import { tHtml } from '../../shared/helpers/translate-html';
import { tText } from '../../shared/helpers/translate-text';
import './EmbedContent.scss';
import withEmbedFlow, { type EmbedFlowProps } from '../../shared/hocs/withEmbedFlow';
import withUser, { type UserProps } from '../../shared/hocs/withUser';
import useResizeObserver from '../../shared/hooks/useResizeObserver';
import { trackEvents } from '../../shared/services/event-logging-service';
import { ToastService } from '../../shared/services/toast-service';
import {
	type EmbedCode,
	EmbedCodeDescriptionType,
	EmbedCodeExternalWebsite,
} from '../embed-code.types';
import { toEmbedCodeIFrame } from '../helpers/links';
import { createResource } from '../helpers/resourceForTrackEvents';
import { useCreateEmbedCode } from '../hooks/useCreateEmbedCode';

import type { Avo } from '@viaa/avo2-types';

type EmbedProps = {
	item?: EmbedCode;
	contentDescription: ReactNode | string;
	onSave?: (item: EmbedCode) => void;
	onClose?: () => void;
	onResize?: () => void;
};

const EmbedContent: FC<EmbedProps & UserProps & EmbedFlowProps> = ({
	item,
	contentDescription,
	onSave,
	onClose,
	onResize,
	commonUser,
	isSmartSchoolEmbedFlow,
}) => {
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
	const [savedEmbedCode, setSavedEmbedCode] = useState<EmbedCode | null>(null);

	const { mutateAsync: createEmbedCode, isLoading: isPublishing } = useCreateEmbedCode();

	const debouncedEmbedContentResize = debounce(() => onResize && onResize(), 50);
	const embedContentRef = useResizeObserver(() => debouncedEmbedContentResize());

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
			setIsDescriptionExpanded(false);
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
			setSavedEmbedCode(null);
		}
	}, [item, handleDescriptionToggle]);

	useEffect(() => {
		debouncedEmbedContentResize();
	}, [debouncedEmbedContentResize, description, descriptionType]);

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
			const embedToSave = mapValuesToEmbedCode();
			const createdEmbedCode = await createEmbedCode(embedToSave);

			trackEvents(
				{
					object: createdEmbedCode.id,
					object_type: 'embed_code',
					action: 'create',
					resource: {
						...createResource(createdEmbedCode, commonUser as Avo.User.CommonUser),
						startedFlow: isSmartSchoolEmbedFlow ? 'SMART_SCHOOL' : 'AVO',
					},
				},
				commonUser
			);

			if (isSmartSchoolEmbedFlow) {
				window.opener.postMessage(
					[
						{
							title: embedToSave.title,
							url: toEmbedCodeIFrame(createdEmbedCode.id),
						},
					],
					'*'
				);
				window.close();
				return;
			}

			setSavedEmbedCode(createdEmbedCode);
			ToastService.success(
				tText(
					'embed-code/components/embed-content___je-code-werd-succesvol-aangemaakt-en-opgeslagen-in-je-werkruimte'
				)
			);
		} catch (err) {
			ToastService.danger(
				tText('embed-code/components/embed-content___code-aanmaken-mislukt')
			);
		}
	};

	const handleCopyButtonClicked = () => {
		if (!savedEmbedCode) {
			console.error('No embed code to copy');
			return;
		}

		trackEvents(
			{
				object: savedEmbedCode.id,
				object_type: 'embed_code',
				action: 'copy',
				resource: {
					...createResource(savedEmbedCode, commonUser as Avo.User.CommonUser),
					pageUrl: window.location.href,
				},
			},
			commonUser
		);

		copyToClipboard(toEmbedCodeIFrame(savedEmbedCode.id));
		ToastService.success(
			tHtml('embed-code/components/embed-content___de-code-is-naar-je-klembord-gekopieerd')
		);
	};

	const renderDescription = () => {
		if (descriptionType === EmbedCodeDescriptionType.ORIGINAL && !!item?.content?.description) {
			return (
				<div
					className={isDescriptionExpanded ? '' : 'expandable-container-closed'}
					ref={embedContentRef as LegacyRef<HTMLDivElement>}
				>
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
					disabled={!!savedEmbedCode}
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
							'embed-code/components/embed-content___bij-het-insluiten-op-bookwidgets-wordt-er-geen-beschrijving-bij-het-fragment-weergegeven'
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
						disabled={!!savedEmbedCode}
						label={tText(
							'embed-code/components/embed-content___originele-beschrijving'
						)}
						active={descriptionType === EmbedCodeDescriptionType.ORIGINAL}
						onClick={() => handleDescriptionToggle(EmbedCodeDescriptionType.ORIGINAL)}
					/>
					<Button
						type="secondary"
						className="u-flex-auto"
						disabled={!!savedEmbedCode}
						label={tText('embed-code/components/embed-content___eigen-beschrijving')}
						active={descriptionType === EmbedCodeDescriptionType.CUSTOM}
						onClick={() => handleDescriptionToggle(EmbedCodeDescriptionType.CUSTOM)}
					/>
					<Button
						type="secondary"
						className="u-flex-auto"
						disabled={!!savedEmbedCode}
						label={tText('embed-code/components/embed-content___geen-beschrijving')}
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
								label={tText('embed-code/components/embed-content___opslaan')}
								title={tText('embed-code/components/embed-content___opslaan')}
								ariaLabel={tText('embed-code/components/embed-content___opslaan')}
								onClick={handleSave}
							/>
						</ButtonToolbar>
					</ToolbarItem>
				</ToolbarRight>
			);
		}

		if (savedEmbedCode) {
			return (
				<ToolbarRight>
					<ToolbarItem className="u-truncate">
						{toEmbedCodeIFrame(savedEmbedCode.id)}
					</ToolbarItem>
					<ToolbarItem>
						<ButtonToolbar>
							<Button
								type="primary"
								icon={IconName.copy}
								title={tText('embed-code/components/embed-content___code-kopieren')}
								ariaLabel={tText(
									'embed-code/components/embed-content___code-kopieren'
								)}
								onClick={handleCopyButtonClicked}
							/>
						</ButtonToolbar>
					</ToolbarItem>
				</ToolbarRight>
			);
		}

		if (isSmartSchoolEmbedFlow) {
			return (
				<ToolbarRight>
					<ToolbarItem>
						<ButtonToolbar>
							<Button
								className="c-button-smartschool"
								icon={IconName.smartschool}
								label={tText(
									'embed-code/components/embed-content___gebruiken-in-smartschool'
								)}
								ariaLabel={tText(
									'embed-code/components/embed-content___gebruiken-in-smartschool'
								)}
								title={tText(
									'embed-code/components/embed-content___gebruiken-in-smartschool'
								)}
								disabled={isPublishing}
								onClick={handleCreate}
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
							label={tText('embed-code/components/embed-content___code-aanmaken')}
							title={tText('embed-code/components/embed-content___code-aanmaken')}
							ariaLabel={tText('embed-code/components/embed-content___code-aanmaken')}
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
			{!isSmartSchoolEmbedFlow && <Spacer margin="bottom-large">{contentDescription}</Spacer>}

			<FormGroup label={tText('embed-code/components/embed-content___titel')}>
				<TextInput value={title} onChange={setTitle} disabled={!!savedEmbedCode} />
			</FormGroup>

			<Container mode="vertical" bordered={true}>
				<FormGroup label={tText('embed-code/components/embed-content___inhoud')}>
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
						disabled={!!savedEmbedCode}
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
			<Toolbar justify className="c-embed-code-content-toolbar">
				<ToolbarLeft>
					<ToolbarItem>
						<ButtonToolbar>
							<Button
								type="secondary"
								label={
									savedEmbedCode
										? tText('embed-code/components/embed-content___annuleer')
										: tText('embed-code/components/embed-content___sluit')
								}
								title={
									savedEmbedCode
										? tText('embed-code/components/embed-content___annuleer')
										: tText('embed-code/components/embed-content___sluit')
								}
								ariaLabel={
									savedEmbedCode
										? tText('embed-code/components/embed-content___annuleer')
										: tText('embed-code/components/embed-content___sluit')
								}
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

export default compose(withUser, withEmbedFlow)(EmbedContent) as FC<EmbedProps>;
