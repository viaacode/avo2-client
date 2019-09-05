import React, { Fragment, FunctionComponent, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import { Avo } from '@viaa/avo2-types';
import { get, orderBy } from 'lodash-es';
import { GET_COLLECTION_BY_ID } from '../collection.gql';

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
	Icon,
	MetaData,
	MetaDataItem,
	Spacer,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import PermissionGuard from '../../authentication/components/PermissionGuard';
import {
	PermissionGuardFail,
	PermissionGuardPass,
} from '../../authentication/components/PermissionGuard.slots';
import { RouteParts } from '../../constants';
import { DataQueryComponent } from '../../shared/components/DataComponent/DataQueryComponent';
import toastService, { TOAST_TYPE } from '../../shared/services/toast-service';

interface CollectionProps extends RouteComponentProps {}

export type BlockType =
	| 'Image'
	| 'ImageTitleTextButton'
	| 'Intro'
	| 'Links'
	| 'Quote'
	| 'RichText'
	| 'Subtitle'
	| 'Title'
	| 'TitleImageText'
	| 'Video'
	| 'VideoTitleTextButton';

export type BlockInfo =
	| BlockImageProps
	| BlockImageTitleTextButtonProps
	| BlockIntroProps
	| BlockLinksProps
	| BlockQuoteProps
	| BlockTextProps
	| BlockSubtitleProps
	| BlockTitleProps
	| BlockTitleImageTextProps
	| BlockVideoProps
	| BlockVideoTitleTextButtonProps;

interface ContentBlockInfo {
	blockType: BlockType;
	content: BlockInfo;
}

// TODO get these from the api once the database is filled up
export const USER_GROUPS: string[] = ['Docent', 'Leering', 'VIAA medewerker', 'Uitgever'];

const Collection: FunctionComponent<CollectionProps> = ({ match, history }) => {
	const [collectionId] = useState((match.params as any)['id'] as string);

	const renderContentBlocks = (contentBlocks: ContentBlockInfo[]) => {
		return contentBlocks.map((contentBlock: ContentBlockInfo, index: number) => {
			return <div key={`content-block-${index}`}>{renderContentBlock(contentBlock)}</div>;
		});
	};

	const renderContentBlock = (contentBlock: ContentBlockInfo) => {
		switch (contentBlock.blockType) {
			case 'Image':
				return <BlockImage {...contentBlock.content as BlockImageProps} />;
			case 'ImageTitleTextButton':
				return (
					<BlockImageTitleTextButton {...contentBlock.content as BlockImageTitleTextButtonProps} />
				);
			case 'Intro':
				return <BlockIntro {...contentBlock.content as BlockIntroProps} />;
			case 'Links':
				return <BlockLinks {...contentBlock.content as BlockLinksProps} />;
			case 'Quote':
				return <BlockQuote {...contentBlock.content as BlockQuoteProps} />;
			case 'RichText':
				return <BlockText {...contentBlock.content as BlockTextProps} />;
			case 'Subtitle':
				return <BlockSubtitle {...contentBlock.content as BlockSubtitleProps} />;
			case 'Title':
				return <BlockTitle {...contentBlock.content as BlockTitleProps} />;
			case 'TitleImageText':
				return <BlockTitleImageText {...contentBlock.content as BlockTitleImageTextProps} />;
			case 'Video':
				return <BlockVideo {...contentBlock.content as BlockVideoProps} />;
			case 'VideoTitleTextButton':
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

	const renderCollection = (collection: Avo.Collection.Response) => {
		const contentBlockInfos: ContentBlockInfo[] = [];
		if (collection) {
			contentBlockInfos.push({
				blockType: 'Intro',
				content: {
					subtitle: 'Introductie',
					text: collection.description,
				} as BlockIntroProps,
			});

			const fragments = orderBy([...collection.collection_fragments], 'position', 'asc') || [];

			fragments.forEach((collectionFragment: Avo.Collection.Fragment) => {
				console.log(collectionFragment);
				contentBlockInfos.push({
					blockType: collectionFragment.external_id ? 'VideoTitleTextButton' : 'RichText',
					content: {
						title: collectionFragment.custom_title,
						text: collectionFragment.custom_description,
						titleLink: `/${RouteParts.Item}/${collectionFragment.external_id}`,
						videoSource: '',
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
													image={get(collection, 'owner.profile.avatar')}
													name={ownerNameAndRole || ' '}
													initials={
														get(collection, 'owner.first_name[0]', '') +
														get(collection, 'owner.last_name[0]', '')
													}
												/>
											)}
										</div>
									)}
								</ToolbarItem>
							</ToolbarLeft>
							<ToolbarRight>
								<ToolbarItem>
									<div className="c-button-toolbar">
										{/* TODO add aria label once merged in components repo */}
										<Button type="secondary" icon="bookmark" />
										<Button type="secondary" icon="share-2" />
										<Button type="secondary" icon="file-plus" />
										<Button type="secondary" label="Alle items afspelen" />
										<PermissionGuard
											permissions={[
												// { permissionName: 'canEditOwnCollections', obj: collection },
												{ permissionName: 'canEditAllCollections' },
											]}
										>
											<PermissionGuardPass>
												<Button
													type="secondary"
													icon="edit"
													onClick={() =>
														history.push(
															`/${RouteParts.Collection}/${collection.id}/${RouteParts.Edit}`
														)
													}
												/>
											</PermissionGuardPass>
										</PermissionGuard>
									</div>
								</ToolbarItem>
							</ToolbarRight>
						</Toolbar>
					</Container>
				</Container>
				<Container mode="vertical">
					<Container mode="horizontal">{renderContentBlocks(contentBlockInfos)}</Container>
				</Container>
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
