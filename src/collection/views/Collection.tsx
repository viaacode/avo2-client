import React, { Fragment, FunctionComponent, useEffect, useState } from 'react';

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
import { Avo } from '@viaa/avo2-types';
import { RouteComponentProps } from 'react-router';
import { getCollection } from '../../shared/store/collection/collectionActions';

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

export const Collection: FunctionComponent<CollectionProps> = ({
	history,
	location,
	match,
}: CollectionProps) => {
	const [collection, setCollection] = useState({
		title: 'Collection title',
	} as Avo.Collection.Response);
	const [id] = useState((match.params as any)['id'] as string);

	/**
	 * Get collection from api when id changes
	 */
	useEffect(() => {
		// TODO: get collection from store by id
		getCollection(id)
			.then((collectionResponse: Avo.Collection.Response) => {
				if (collectionResponse) {
					setCollection(collectionResponse);
				} else {
					// TODO show toast with error message: collection with id was not found
				}
			})
			.catch((err: any) => {
				console.error('Failed to get collection from the server', err, { id });
			});
	}, [id]);

	const contentBlockInfos: ContentBlockInfo[] = [];
	contentBlockInfos.push({
		blockType: 'Intro',
		content: {
			subtitle: 'Introductie',
			text: collection.description,
		} as BlockIntroProps,
	});
	(collection.fragments || []).forEach((collectionFragment: Avo.Collection.Fragment) => {
		contentBlockInfos.push({
			blockType: 'VideoTitleTextButton',
			content: {
				title: collectionFragment.custom_title,
				text: collectionFragment.custom_description,
				videoSource: '',
				buttonLabel: 'Meer lezen',
			} as BlockVideoTitleTextButtonProps,
		});
	});

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
				console.error('Failed to find contentBlock type: contentBlock.blockType');
				return null;
		}
	};

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
										<MetaDataItem icon="eye" label={String(188) /* TODO collection.view_count */} />
										<MetaDataItem
											icon="bookmark"
											label={String(12) /* TODO collection.bookmark_count */}
										/>
									</MetaData>
								</Spacer>
								<h1 className="c-h2 u-m-b-0">{collection.title}</h1>
								{collection.owner && (
									<div className="o-flex o-flex--spaced">
										<Avatar
											image={collection.owner.avatar || undefined}
											name={`${collection.owner.fn} ${collection.owner.sn} (${
												USER_GROUPS[collection.owner.group_id]
											})`}
											initials={collection.owner.fn[0] + collection.owner.sn[0]}
										/>
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
