import { useMutation } from '@apollo/react-hooks';
import { get, orderBy } from 'lodash-es';
import React, { Fragment, FunctionComponent, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import {
	Avatar,
	BlockImage,
	BlockImageProps,
	BlockImageTitleTextButton,
	BlockImageTitleTextButtonProps,
	BlockIntro,
	BlockIntroProps,
	BlockLinks,
	BlockLinksProps,
	BlockQuote,
	BlockQuoteProps,
	BlockSubtitle,
	BlockSubtitleProps,
	BlockText,
	BlockTextProps,
	BlockTitle,
	BlockTitleImageText,
	BlockTitleImageTextProps,
	BlockTitleProps,
	BlockVideo,
	BlockVideoProps,
	BlockVideoTitleTextButton,
	BlockVideoTitleTextButtonProps,
	Button,
	Container,
	DropdownButton,
	DropdownContent,
	Icon,
	MenuContent,
	MetaData,
	MetaDataItem,
	Spacer,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { RouteParts } from '../../constants';
import ControlledDropdown from '../../shared/components/ControlledDropdown/ControlledDropdown';
import { DataQueryComponent } from '../../shared/components/DataComponent/DataQueryComponent';
import { FlowPlayer } from '../../shared/components/FlowPlayer/FlowPlayer';
import { generateContentLinkString } from '../../shared/helpers/generateLink';
import { fetchPlayerToken } from '../../shared/services/player-service';
import toastService, { TOAST_TYPE } from '../../shared/services/toast-service';
import { DeleteCollectionModal } from '../components';
import { DELETE_COLLECTION, GET_COLLECTION_BY_ID } from '../graphql';
import { isVideoFragment } from '../helpers';
import { ContentBlockInfo, ContentBlockType, ContentTypeString } from '../types';

interface CollectionProps extends RouteComponentProps {}

const Collection: FunctionComponent<CollectionProps> = ({ match, history }) => {
	const [collectionId] = useState((match.params as any)['id'] as string);
	const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
	const [idToDelete, setIdToDelete] = useState<number | null>(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [triggerCollectionDelete] = useMutation(DELETE_COLLECTION);
	const [playerToken, setPlayerToken] = useState();

	const openDeleteModal = (collectionId: number) => {
		setIdToDelete(collectionId);
		setIsDeleteModalOpen(true);
	};

	const deleteCollection = () => {
		triggerCollectionDelete({
			variables: {
				id: idToDelete,
			},
		});

		setIdToDelete(null);
	};

	const renderContentBlocks = (contentBlocks: ContentBlockInfo[]) => {
		return contentBlocks.map((contentBlock: ContentBlockInfo, index: number) => {
			return <div key={`content-block-${index}`}>{renderContentBlock(contentBlock)}</div>;
		});
	};

	const renderContentBlock = (contentBlock: ContentBlockInfo) => {
		switch (contentBlock.blockType) {
			case ContentBlockType.Image:
				return <BlockImage {...contentBlock.content as BlockImageProps} />;
			case ContentBlockType.ImageTitleTextButton:
				return (
					<BlockImageTitleTextButton {...contentBlock.content as BlockImageTitleTextButtonProps} />
				);
			case ContentBlockType.Intro:
				return <BlockIntro {...contentBlock.content as BlockIntroProps} />;
			case ContentBlockType.Links:
				return <BlockLinks {...contentBlock.content as BlockLinksProps} />;
			case ContentBlockType.Quote:
				return <BlockQuote {...contentBlock.content as BlockQuoteProps} />;
			case ContentBlockType.RichText:
				return <BlockText {...contentBlock.content as BlockTextProps} />;
			case ContentBlockType.Subtitle:
				return <BlockSubtitle {...contentBlock.content as BlockSubtitleProps} />;
			case ContentBlockType.Title:
				return <BlockTitle {...contentBlock.content as BlockTitleProps} />;
			case ContentBlockType.TitleImageText:
				return <BlockTitleImageText {...contentBlock.content as BlockTitleImageTextProps} />;
			case ContentBlockType.Video:
				return <BlockVideo {...contentBlock.content as BlockVideoProps} />;
			case ContentBlockType.VideoTitleTextButton:
				return (
					<BlockVideoTitleTextButton {...contentBlock.content as BlockVideoTitleTextButtonProps} />
				);
			default:
				toastService(
					`Failed to find contentBlock type: ${contentBlock.blockType}`,
					TOAST_TYPE.DANGER
				);
				return null;
		}
	};

	const getFragmentField = (fragment: Avo.Collection.Fragment, field: string) =>
		fragment.use_custom_fields
			? (fragment as any)[`custom_${field}`]
			: (fragment as any).item_meta[field];

	const renderCollection = (collection: Avo.Collection.Response) => {
		const contentBlockInfos: ContentBlockInfo[] = [];

		if (collection) {
			contentBlockInfos.push({
				blockType: ContentBlockType.Intro,
				content: {
					subtitle: 'Introductie',
					text: collection.description,
				} as BlockIntroProps,
			});

			const fragments = orderBy([...collection.collection_fragments], 'position', 'asc') || [];

			fragments.forEach((fragment: Avo.Collection.Fragment) => {
				const initFlowPlayer = () =>
					!playerToken &&
					fetchPlayerToken(fragment.external_id)
						.then(data => setPlayerToken(data))
						.catch(() => toastService('Play ticket kon niet opgehaald worden.', TOAST_TYPE.DANGER));

				if (isVideoFragment(fragment)) {
					initFlowPlayer();
				}

				contentBlockInfos.push({
					blockType: isVideoFragment(fragment)
						? ContentBlockType.VideoTitleTextButton
						: ContentBlockType.RichText,
					content: {
						title: getFragmentField(fragment, 'title'),
						text: getFragmentField(fragment, 'description'),
						titleLink: generateContentLinkString(ContentTypeString.video, fragment.external_id),
						videoSource: playerToken,
						buttonLabel: 'Meer lezen',
					} as BlockVideoTitleTextButtonProps,
				});
			});
		}

		const ownerNameAndRole = [
			get(collection, 'owner.first_name', ''),
			get(collection, 'owner.last_name', ''),
			get(collection, 'owner.role.name', ''),
		].join(' ');

		return (
			<Fragment>
				<Container mode="vertical" size="small" background="alt">
					<Container mode="horizontal">
						<Toolbar>
							<ToolbarLeft>
								<ToolbarItem>
									<Spacer margin="bottom">
										<MetaData spaced={true} category="collection">
											<MetaDataItem>
												<div className="c-content-type c-content-type--collection">
													<Icon name="collection" />
													<p>COLLECTION</p>
												</div>
											</MetaDataItem>
											<MetaDataItem
												icon="eye"
												label={String(188) /* TODO collection.view_count */}
											/>
											<MetaDataItem
												icon="bookmark"
												label={String(12) /* TODO collection.bookmark_count */}
											/>
										</MetaData>
									</Spacer>
									<h1 className="c-h2 u-m-b-0">{collection.title}</h1>
									{collection.owner && (
										<div className="o-flex o-flex--spaced">
											{!!get(collection, 'owner.id') && (
												<Avatar
													image={get(collection, 'owner.profiles[0].avatar')}
													name={ownerNameAndRole || ' '}
													initials={`${get(collection, 'owner.first_name[0]', '')}${get(
														collection,
														'owner.last_name[0]',
														''
													)}`}
												/>
											)}
										</div>
									)}
								</ToolbarItem>
							</ToolbarLeft>
							<ToolbarRight>
								<ToolbarItem>
									<div className="c-button-toolbar">
										<Button
											title="Bladwijzer"
											type="secondary"
											icon="bookmark"
											ariaLabel="Bladwijzer"
										/>
										<Button title="Deel" type="secondary" icon="share-2" ariaLabel="Deel" />
										<ControlledDropdown
											isOpen={isOptionsMenuOpen}
											onOpen={() => setIsOptionsMenuOpen(true)}
											onClose={() => setIsOptionsMenuOpen(false)}
											placement="bottom-end"
											autoSize
										>
											<DropdownButton>
												<Button
													type="secondary"
													icon="more-horizontal"
													ariaLabel="Meer opties"
													title="Meer opties"
												/>
											</DropdownButton>
											<DropdownContent>
												<MenuContent
													menuItems={[
														{ icon: 'edit', id: 'edit', label: 'Bewerk collectie' }, // TODO: Add PermissionGuard
														{ icon: 'play', id: 'play', label: 'Alle items afspelen' },
														{ icon: 'clipboard', id: 'createExercise', label: 'Maak opdracht' },
														{ icon: 'copy', id: 'duplicate', label: 'Dupliceer' },
														{ icon: 'delete', id: 'delete', label: 'Verwijder' }, // TODO: Add PermissionGuard
													]}
													onClick={itemId => {
														switch (itemId) {
															case 'edit':
																history.push(
																	`${generateContentLinkString(
																		ContentTypeString.collection,
																		collection.id.toString()
																	)}/${RouteParts.Edit}`
																);
																break;
															case 'delete':
																openDeleteModal(collection.id);
																break;
															default:
																return null;
														}
													}}
												/>
											</DropdownContent>
										</ControlledDropdown>
									</div>
								</ToolbarItem>
							</ToolbarRight>
						</Toolbar>
					</Container>
				</Container>
				<Container mode="vertical">
					<Container mode="horizontal">{renderContentBlocks(contentBlockInfos)}</Container>
				</Container>
				<DeleteCollectionModal
					isOpen={isDeleteModalOpen}
					setIsOpen={setIsDeleteModalOpen}
					deleteCollection={deleteCollection}
				/>
			</Fragment>
		);
	};

	return (
		<DataQueryComponent
			query={GET_COLLECTION_BY_ID}
			variables={{ id: collectionId }}
			resultPath="app_collections[0]"
			renderData={renderCollection}
			notFoundMessage="Deze collectie werd niet gevonden"
		/>
	);
};

export default withRouter(Collection);
