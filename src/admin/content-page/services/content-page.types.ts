export interface Address {
	street: string;
	postalCode: string;
	locality: string;
	postOfficeBoxNumber: string;
}

export interface ContactInfo {
	email?: string | null;
	telephone?: string | null;
	address: Address;
}

export interface MediaFile {
	name: string;
	alternateName: string;
	description: string;
	schemaIdentifier: string;
	ebucoreMediaType: string;
	ebucoreIsMediaFragmentOf: string;
	embedUrl: string;
}

export interface Representation {
	name: string;
	alternateName: string;
	description: string;
	schemaIdentifier: string;
	dctermsFormat: string;
	transcript: string;
	dateCreated: string;
	files: MediaFile[];
}

export interface Media {
	schemaIdentifier: string; // Unique id per object
	meemooIdentifier: string; // PID (not unique per object)
	premisIdentifier: any;
	premisIsPartOf?: string;
	series?: string[];
	program?: string[];
	alternativeName?: string[];
	maintainerId: string;
	maintainerName: string;
	contactInfo?: ContactInfo;
	copyrightHolder?: string;
	copyrightNotice?: string;
	durationInSeconds?: number;
	numberOfPages?: number;
	datePublished: string;
	dctermsAvailable: string;
	name: string;
	description: string;
	abstract: string;
	creator: any;
	actor?: any;
	publisher: any;
	spatial: string;
	temporal: string;
	keywords: string[];
	genre: string[];
	dctermsFormat: string;
	dctermsMedium: string;
	inLanguage: string[];
	thumbnailUrl: string;
	// embedUrl: string;
	duration: string;
	license: any;
	meemooMediaObjectId?: string;
	dateCreated: string;
	dateCreatedLowerBound?: string;
	ebucoreObjectType: string;
	meemoofilmColor: boolean;
	meemoofilmBase: string;
	meemoofilmImageOrSound: string;
	meemooLocalId: string;
	meemooOriginalCp: string;
	meemooDescriptionProgramme: string;
	meemooDescriptionCast: string;
	representations?: Representation[];
}

export interface MediaPlayerPathInfo {
	getItemExternalIdPath: string;
	setItemExternalIdPath: string;
	setVideoSrcPath: string;
	setPosterSrcPath: string;
	setTitlePath: string;
	setDescriptionPath: string;
	setIssuedPath: string;
	setOrganisationPath: string;
	setDurationPath: string;
}

export type MediaItemResponse = Partial<Media> & {
	count: number;
};
