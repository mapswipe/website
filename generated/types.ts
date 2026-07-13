export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  AreaSqKm: any;
  /** A generic type to return error messages */
  CustomErrorType: any;
  /** Date (isoformat) */
  Date: any;
  /** Date with time (isoformat) */
  DateTime: any;
  GenericJSON: any;
  /** Represents a point as `(x, y, z)` or `(x, y)`. */
  Point: any;
  /** A geographical object that gets 1 or 2 LinearRing objects as external and internal rings. */
  Polygon: any;
  Upload: any;
};

export type AoiGeometryAssetPropertyType = {
  __typename?: 'AoiGeometryAssetPropertyType';
  /** Positive float value */
  area: Scalars['Float'];
  bbox: Array<Scalars['Float']>;
  center: Array<Scalars['Float']>;
};

export type AoiGeometryAssetPropertyTypeObjectImageAssetPropertyType = AoiGeometryAssetPropertyType | ObjectImageAssetPropertyType;

export type AppEnumCollection = {
  __typename?: 'AppEnumCollection';
  AssetMimetypeEnum: Array<AppEnumCollectionAssetMimetypeEnum>;
  AssetTypeEnum: Array<AppEnumCollectionAssetTypeEnum>;
  ContributorUserGroupMembershipLogActionEnum: Array<AppEnumCollectionContributorUserGroupMembershipLogActionEnum>;
  FirebasePushStatusEnum: Array<AppEnumCollectionFirebasePushStatusEnum>;
  GlobalExportAssetTypeEnum: Array<AppEnumCollectionGlobalExportAssetTypeEnum>;
  IconEnum: Array<AppEnumCollectionIconEnum>;
  MappingSessionClientTypeEnum: Array<AppEnumCollectionMappingSessionClientTypeEnum>;
  OverlayLayerTypeEnum: Array<AppEnumCollectionOverlayLayerTypeEnum>;
  ProjectAssetExportTypeEnum: Array<AppEnumCollectionProjectAssetExportTypeEnum>;
  ProjectAssetInputTypeEnum: Array<AppEnumCollectionProjectAssetInputTypeEnum>;
  ProjectProcessingStatusEnum: Array<AppEnumCollectionProjectProcessingStatusEnum>;
  ProjectProgressStatusEnum: Array<AppEnumCollectionProjectProgressStatusEnum>;
  ProjectStatusEnum: Array<AppEnumCollectionProjectStatusEnum>;
  ProjectTypeEnum: Array<AppEnumCollectionProjectTypeEnum>;
  RasterTileServerNameEnum: Array<AppEnumCollectionRasterTileServerNameEnum>;
  SubGridSizeEnum: Array<AppEnumCollectionSubGridSizeEnum>;
  TutorialAssetInputTypeEnum: Array<AppEnumCollectionTutorialAssetInputTypeEnum>;
  TutorialInformationPageBlockTypeEnum: Array<AppEnumCollectionTutorialInformationPageBlockTypeEnum>;
  TutorialStatusEnum: Array<AppEnumCollectionTutorialStatusEnum>;
  ValidateImageSourceTypeEnum: Array<AppEnumCollectionValidateImageSourceTypeEnum>;
  ValidateObjectSourceTypeEnum: Array<AppEnumCollectionValidateObjectSourceTypeEnum>;
  VectorTileServerNameEnum: Array<AppEnumCollectionVectorTileServerNameEnum>;
};

export type AppEnumCollectionAssetMimetypeEnum = {
  __typename?: 'AppEnumCollectionAssetMimetypeEnum';
  key: AssetMimetypeEnum;
  label: Scalars['String'];
};

export type AppEnumCollectionAssetTypeEnum = {
  __typename?: 'AppEnumCollectionAssetTypeEnum';
  key: AssetTypeEnum;
  label: Scalars['String'];
};

export type AppEnumCollectionContributorUserGroupMembershipLogActionEnum = {
  __typename?: 'AppEnumCollectionContributorUserGroupMembershipLogActionEnum';
  key: ContributorUserGroupMembershipLogActionEnum;
  label: Scalars['String'];
};

export type AppEnumCollectionFirebasePushStatusEnum = {
  __typename?: 'AppEnumCollectionFirebasePushStatusEnum';
  key: FirebasePushStatusEnum;
  label: Scalars['String'];
};

export type AppEnumCollectionGlobalExportAssetTypeEnum = {
  __typename?: 'AppEnumCollectionGlobalExportAssetTypeEnum';
  key: GlobalExportAssetTypeEnum;
  label: Scalars['String'];
};

export type AppEnumCollectionIconEnum = {
  __typename?: 'AppEnumCollectionIconEnum';
  key: IconEnum;
  label: Scalars['String'];
};

export type AppEnumCollectionMappingSessionClientTypeEnum = {
  __typename?: 'AppEnumCollectionMappingSessionClientTypeEnum';
  key: MappingSessionClientTypeEnum;
  label: Scalars['String'];
};

export type AppEnumCollectionOverlayLayerTypeEnum = {
  __typename?: 'AppEnumCollectionOverlayLayerTypeEnum';
  key: OverlayLayerTypeEnum;
  label: Scalars['String'];
};

export type AppEnumCollectionProjectAssetExportTypeEnum = {
  __typename?: 'AppEnumCollectionProjectAssetExportTypeEnum';
  key: ProjectAssetExportTypeEnum;
  label: Scalars['String'];
};

export type AppEnumCollectionProjectAssetInputTypeEnum = {
  __typename?: 'AppEnumCollectionProjectAssetInputTypeEnum';
  key: ProjectAssetInputTypeEnum;
  label: Scalars['String'];
};

export type AppEnumCollectionProjectProcessingStatusEnum = {
  __typename?: 'AppEnumCollectionProjectProcessingStatusEnum';
  key: ProjectProcessingStatusEnum;
  label: Scalars['String'];
};

export type AppEnumCollectionProjectProgressStatusEnum = {
  __typename?: 'AppEnumCollectionProjectProgressStatusEnum';
  key: ProjectProgressStatusEnum;
  label: Scalars['String'];
};

export type AppEnumCollectionProjectStatusEnum = {
  __typename?: 'AppEnumCollectionProjectStatusEnum';
  key: ProjectStatusEnum;
  label: Scalars['String'];
};

export type AppEnumCollectionProjectTypeEnum = {
  __typename?: 'AppEnumCollectionProjectTypeEnum';
  key: ProjectTypeEnum;
  label: Scalars['String'];
};

export type AppEnumCollectionRasterTileServerNameEnum = {
  __typename?: 'AppEnumCollectionRasterTileServerNameEnum';
  key: RasterTileServerNameEnum;
  label: Scalars['String'];
};

export type AppEnumCollectionSubGridSizeEnum = {
  __typename?: 'AppEnumCollectionSubGridSizeEnum';
  key: SubGridSizeEnum;
  label: Scalars['String'];
};

export type AppEnumCollectionTutorialAssetInputTypeEnum = {
  __typename?: 'AppEnumCollectionTutorialAssetInputTypeEnum';
  key: TutorialAssetInputTypeEnum;
  label: Scalars['String'];
};

export type AppEnumCollectionTutorialInformationPageBlockTypeEnum = {
  __typename?: 'AppEnumCollectionTutorialInformationPageBlockTypeEnum';
  key: TutorialInformationPageBlockTypeEnum;
  label: Scalars['String'];
};

export type AppEnumCollectionTutorialStatusEnum = {
  __typename?: 'AppEnumCollectionTutorialStatusEnum';
  key: TutorialStatusEnum;
  label: Scalars['String'];
};

export type AppEnumCollectionValidateImageSourceTypeEnum = {
  __typename?: 'AppEnumCollectionValidateImageSourceTypeEnum';
  key: ValidateImageSourceTypeEnum;
  label: Scalars['String'];
};

export type AppEnumCollectionValidateObjectSourceTypeEnum = {
  __typename?: 'AppEnumCollectionValidateObjectSourceTypeEnum';
  key: ValidateObjectSourceTypeEnum;
  label: Scalars['String'];
};

export type AppEnumCollectionVectorTileServerNameEnum = {
  __typename?: 'AppEnumCollectionVectorTileServerNameEnum';
  key: VectorTileServerNameEnum;
  label: Scalars['String'];
};

export enum AssetMimetypeEnum {
  Csv = 'CSV',
  Geojson = 'GEOJSON',
  Gzip = 'GZIP',
  ImageGif = 'IMAGE_GIF',
  ImageJpeg = 'IMAGE_JPEG',
  ImagePng = 'IMAGE_PNG',
  Json = 'JSON',
  Plaintext = 'PLAINTEXT'
}

export type AssetMimetypeEnumFilterLookup = {
  /** Case-sensitive containment test. Filter will be skipped on `null` value */
  contains?: InputMaybe<AssetMimetypeEnum>;
  /** Case-sensitive ends-with. Filter will be skipped on `null` value */
  endsWith?: InputMaybe<AssetMimetypeEnum>;
  /** Exact match. Filter will be skipped on `null` value */
  exact?: InputMaybe<AssetMimetypeEnum>;
  /** Case-insensitive containment test. Filter will be skipped on `null` value */
  iContains?: InputMaybe<AssetMimetypeEnum>;
  /** Case-insensitive ends-with. Filter will be skipped on `null` value */
  iEndsWith?: InputMaybe<AssetMimetypeEnum>;
  /** Case-insensitive exact match. Filter will be skipped on `null` value */
  iExact?: InputMaybe<AssetMimetypeEnum>;
  /** Case-insensitive regular expression match. Filter will be skipped on `null` value */
  iRegex?: InputMaybe<AssetMimetypeEnum>;
  /** Case-insensitive starts-with. Filter will be skipped on `null` value */
  iStartsWith?: InputMaybe<AssetMimetypeEnum>;
  /** Exact match of items in a given list. Filter will be skipped on `null` value */
  inList?: InputMaybe<Array<AssetMimetypeEnum>>;
  /** Assignment test. Filter will be skipped on `null` value */
  isNull?: InputMaybe<Scalars['Boolean']>;
  /** Case-sensitive regular expression match. Filter will be skipped on `null` value */
  regex?: InputMaybe<AssetMimetypeEnum>;
  /** Case-sensitive starts-with. Filter will be skipped on `null` value */
  startsWith?: InputMaybe<AssetMimetypeEnum>;
};

export enum AssetTypeEnum {
  Debug = 'DEBUG',
  Export = 'EXPORT',
  Input = 'INPUT',
  Output = 'OUTPUT'
}

export type AssetTypeEnumFilterLookup = {
  /** Case-sensitive containment test. Filter will be skipped on `null` value */
  contains?: InputMaybe<AssetTypeEnum>;
  /** Case-sensitive ends-with. Filter will be skipped on `null` value */
  endsWith?: InputMaybe<AssetTypeEnum>;
  /** Exact match. Filter will be skipped on `null` value */
  exact?: InputMaybe<AssetTypeEnum>;
  /** Case-insensitive containment test. Filter will be skipped on `null` value */
  iContains?: InputMaybe<AssetTypeEnum>;
  /** Case-insensitive ends-with. Filter will be skipped on `null` value */
  iEndsWith?: InputMaybe<AssetTypeEnum>;
  /** Case-insensitive exact match. Filter will be skipped on `null` value */
  iExact?: InputMaybe<AssetTypeEnum>;
  /** Case-insensitive regular expression match. Filter will be skipped on `null` value */
  iRegex?: InputMaybe<AssetTypeEnum>;
  /** Case-insensitive starts-with. Filter will be skipped on `null` value */
  iStartsWith?: InputMaybe<AssetTypeEnum>;
  /** Exact match of items in a given list. Filter will be skipped on `null` value */
  inList?: InputMaybe<Array<AssetTypeEnum>>;
  /** Assignment test. Filter will be skipped on `null` value */
  isNull?: InputMaybe<Scalars['Boolean']>;
  /** Case-sensitive regular expression match. Filter will be skipped on `null` value */
  regex?: InputMaybe<AssetTypeEnum>;
  /** Case-sensitive starts-with. Filter will be skipped on `null` value */
  startsWith?: InputMaybe<AssetTypeEnum>;
};

export type AssetTypeSpecificInput =
  { objectImage: ObjectImageAssetPropertyInput; };

export type BoolBaseFilterLookup = {
  /** Exact match. Filter will be skipped on `null` value */
  exact?: InputMaybe<Scalars['Boolean']>;
  /** Exact match of items in a given list. Filter will be skipped on `null` value */
  inList?: InputMaybe<Array<Scalars['Boolean']>>;
  /** Assignment test. Filter will be skipped on `null` value */
  isNull?: InputMaybe<Scalars['Boolean']>;
};

export type CommunityFilteredStats = {
  __typename?: 'CommunityFilteredStats';
  areaSwipedByProjectType: Array<ProjectTypeAreaStatsType>;
  swipeByOrganizationName: Array<OrganizationSwipeStatsType>;
  swipeByProjectGeo: Array<MapContributionStatsType>;
  swipeByProjectType: Array<ProjectTypeSwipeStatsType>;
  swipeTimeByDate: Array<ContributorTimeStatType>;
};

export type CommunityStatsType = {
  __typename?: 'CommunityStatsType';
  id: Scalars['ID'];
  totalContributors: Scalars['Int'];
  totalSwipes: Scalars['Int'];
  totalUserGroups: Scalars['Int'];
};

export type CompareProjectPropertyInput = {
  /** Numeric value as string */
  aoiGeometry: Scalars['String'];
  tileServerBProperty: ProjectRasterTileServerConfigInput;
  tileServerProperty: ProjectRasterTileServerConfigInput;
  /** Zoom level from 14 to 22 */
  zoomLevel: Scalars['Int'];
};

export type CompareProjectPropertyType = {
  __typename?: 'CompareProjectPropertyType';
  /** Numeric value as string */
  aoiGeometry: Scalars['String'];
  tileServerBProperty: ProjectRasterTileServerConfig;
  tileServerProperty: ProjectRasterTileServerConfig;
  /** Zoom level from 14 to 22 */
  zoomLevel: Scalars['Int'];
};

export type CompareProjectPropertyTypeFindProjectPropertyTypeValidateProjectPropertyTypeValidateImageProjectPropertyTypeCompletenessProjectPropertyTypeStreetProjectPropertyTypeLocateProjectPropertyType = CompareProjectPropertyType | CompletenessProjectPropertyType | FindProjectPropertyType | LocateProjectPropertyType | StreetProjectPropertyType | ValidateImageProjectPropertyType | ValidateProjectPropertyType;

export type CompareTutorialTaskPropertyInput = {
  tileX: Scalars['Int'];
  tileY: Scalars['Int'];
  tileZ: Scalars['Int'];
};

export type CompareTutorialTaskPropertyType = {
  __typename?: 'CompareTutorialTaskPropertyType';
  tileX: Scalars['Int'];
  tileY: Scalars['Int'];
  tileZ: Scalars['Int'];
};

export type CompareTutorialTaskPropertyTypeFindTutorialTaskPropertyTypeValidateTutorialTaskPropertyTypeValidateImageTutorialTaskPropertyTypeCompletenessTutorialTaskPropertyTypeStreetTutorialTaskPropertyTypeLocateTutorialTaskPropertyType = CompareTutorialTaskPropertyType | CompletenessTutorialTaskPropertyType | FindTutorialTaskPropertyType | LocateTutorialTaskPropertyType | StreetTutorialTaskPropertyType | ValidateImageTutorialTaskPropertyType | ValidateTutorialTaskPropertyType;

export type CompletenessProjectPropertyInput = {
  /** Numeric value as string */
  aoiGeometry: Scalars['String'];
  overlayTileServerProperty: ProjectOverlayTileServerConfigInput;
  tileServerProperty: ProjectRasterTileServerConfigInput;
  /** Zoom level from 14 to 22 */
  zoomLevel: Scalars['Int'];
};

export type CompletenessProjectPropertyType = {
  __typename?: 'CompletenessProjectPropertyType';
  /** Numeric value as string */
  aoiGeometry: Scalars['String'];
  overlayTileServerProperty: ProjectOverlayTileServerConfig;
  tileServerProperty: ProjectRasterTileServerConfig;
  /** Zoom level from 14 to 22 */
  zoomLevel: Scalars['Int'];
};

export type CompletenessTutorialTaskPropertyInput = {
  tileX: Scalars['Int'];
  tileY: Scalars['Int'];
  tileZ: Scalars['Int'];
};

export type CompletenessTutorialTaskPropertyType = {
  __typename?: 'CompletenessTutorialTaskPropertyType';
  tileX: Scalars['Int'];
  tileY: Scalars['Int'];
  tileZ: Scalars['Int'];
};

export type ContributorSwipeStatType = {
  __typename?: 'ContributorSwipeStatType';
  taskDate: Scalars['Date'];
  totalSwipes: Scalars['Int'];
};

/**
 * Model representing a private team that contributor users can be assigned to.
 *
 * Team membership is managed exclusively by system managers; contributor users
 * cannot join or leave teams on their own. Members of a team can only access
 * projects linked to that team.
 */
export type ContributorTeamFilter = {
  AND?: InputMaybe<ContributorTeamFilter>;
  DISTINCT?: InputMaybe<Scalars['Boolean']>;
  NOT?: InputMaybe<ContributorTeamFilter>;
  OR?: InputMaybe<ContributorTeamFilter>;
  id?: InputMaybe<IdBaseFilterLookup>;
  isArchived?: InputMaybe<BoolBaseFilterLookup>;
  name?: InputMaybe<Scalars['String']>;
};

export type ContributorTeamOrder = {
  id?: InputMaybe<Ordering>;
  name?: InputMaybe<Ordering>;
};

/**
 * Model representing a private team that contributor users can be assigned to.
 *
 * Team membership is managed exclusively by system managers; contributor users
 * cannot join or leave teams on their own. Members of a team can only access
 * projects linked to that team.
 */
export type ContributorTeamType = FirebasePushResourceTypeMixin & UserResourceTypeMixin & {
  __typename?: 'ContributorTeamType';
  archivedAt?: Maybe<Scalars['DateTime']>;
  archivedBy?: Maybe<UserType>;
  clientId: Scalars['String'];
  createdAt: Scalars['DateTime'];
  createdBy: UserType;
  firebaseId: Scalars['String'];
  /** The latest time when resource was pushed to firebase */
  firebaseLastPushed?: Maybe<Scalars['DateTime']>;
  firebasePushStatus?: Maybe<FirebasePushStatusEnum>;
  id: Scalars['ID'];
  isArchived: Scalars['Boolean'];
  members: ContributorUserTypeOffsetPaginated;
  membersCount: Scalars['Int'];
  modifiedAt: Scalars['DateTime'];
  modifiedBy: UserType;
  name: Scalars['String'];
};


/**
 * Model representing a private team that contributor users can be assigned to.
 *
 * Team membership is managed exclusively by system managers; contributor users
 * cannot join or leave teams on their own. Members of a team can only access
 * projects linked to that team.
 */
export type ContributorTeamTypeMembersArgs = {
  pagination?: InputMaybe<OffsetPaginationInput>;
};

export type ContributorTeamTypeOffsetPaginated = {
  __typename?: 'ContributorTeamTypeOffsetPaginated';
  pageInfo: OffsetPaginationInfo;
  /** List of paginated results. */
  results: Array<ContributorTeamType>;
  /** Total count of existing results. */
  totalCount: Scalars['Int'];
};

export type ContributorTimeStatType = {
  __typename?: 'ContributorTimeStatType';
  date: Scalars['Date'];
  /** total swipe time (seconds) */
  totalSwipeTime: Scalars['Int'];
};

/**
 * Model representing contributors synchronized from firebase.
 *
 * Contributor accounts are typically created in firebase and then synced into this system.
 * A contributor user may or may not be linked to a corresponding user in the system.
 */
export type ContributorUserFilter = {
  AND?: InputMaybe<ContributorUserFilter>;
  DISTINCT?: InputMaybe<Scalars['Boolean']>;
  NOT?: InputMaybe<ContributorUserFilter>;
  OR?: InputMaybe<ContributorUserFilter>;
  /** Firebase User ID (External) */
  firebaseId?: InputMaybe<StrFilterLookup>;
  id?: InputMaybe<IdBaseFilterLookup>;
  teamId?: InputMaybe<IdBaseFilterLookup>;
  username?: InputMaybe<StrFilterLookup>;
};

export type ContributorUserFilteredStats = ContributorUserUserGroupBaseFilterStatsQuery & {
  __typename?: 'ContributorUserFilteredStats';
  areaSwipedByProjectType: Array<ProjectTypeAreaStatsType>;
  id: Scalars['ID'];
  swipeByDate: Array<ContributorSwipeStatType>;
  swipeByOrganizationName: Array<OrganizationSwipeStatsType>;
  swipeByProjectGeo: Array<MapContributionStatsType>;
  swipeByProjectType: Array<ProjectTypeSwipeStatsType>;
  swipeTimeByDate: Array<ContributorTimeStatType>;
};

/**
 * Model representing a group that contributor users can join or leave.
 *
 * Groups are used to aggregate contributions made by users within the group,
 * facilitating management and organization of collective efforts.
 */
export type ContributorUserGroupCreateInput = {
  clientId: Scalars['String'];
  description: Scalars['String'];
  name: Scalars['String'];
};

/**
 * Model representing a group that contributor users can join or leave.
 *
 * Groups are used to aggregate contributions made by users within the group,
 * facilitating management and organization of collective efforts.
 */
export type ContributorUserGroupFilter = {
  AND?: InputMaybe<ContributorUserGroupFilter>;
  DISTINCT?: InputMaybe<Scalars['Boolean']>;
  NOT?: InputMaybe<ContributorUserGroupFilter>;
  OR?: InputMaybe<ContributorUserGroupFilter>;
  id?: InputMaybe<IdBaseFilterLookup>;
  isArchived?: InputMaybe<BoolBaseFilterLookup>;
  name?: InputMaybe<Scalars['String']>;
  userFirebaseId?: InputMaybe<Scalars['ID']>;
};

export type ContributorUserGroupFilteredStats = ContributorUserUserGroupBaseFilterStatsQuery & {
  __typename?: 'ContributorUserGroupFilteredStats';
  areaSwipedByProjectType: Array<ProjectTypeAreaStatsType>;
  swipeByDate: Array<ContributorSwipeStatType>;
  swipeByOrganizationName: Array<OrganizationSwipeStatsType>;
  swipeByProjectGeo: Array<MapContributionStatsType>;
  swipeByProjectType: Array<ProjectTypeSwipeStatsType>;
  swipeTimeByDate: Array<ContributorTimeStatType>;
};

export type ContributorUserGroupLatestStatsType = {
  __typename?: 'ContributorUserGroupLatestStatsType';
  totalContributors: Scalars['Int'];
  totalMappingProjects: Scalars['Int'];
  /** total swipe time (seconds) */
  totalSwipeTime: Scalars['Int'];
  totalSwipes: Scalars['Int'];
};

/** Model representing membership of contributor users in contributor user groups. */
export type ContributorUserGroupMembershipFilter = {
  AND?: InputMaybe<ContributorUserGroupMembershipFilter>;
  DISTINCT?: InputMaybe<Scalars['Boolean']>;
  NOT?: InputMaybe<ContributorUserGroupMembershipFilter>;
  OR?: InputMaybe<ContributorUserGroupMembershipFilter>;
  id?: InputMaybe<IdBaseFilterLookup>;
  userGroupId?: InputMaybe<IdBaseFilterLookup>;
};

export enum ContributorUserGroupMembershipLogActionEnum {
  Join = 'JOIN',
  Leave = 'LEAVE'
}

export type ContributorUserGroupMembershipOrder = {
  id?: InputMaybe<Ordering>;
};

/** Model representing membership of contributor users in contributor user groups. */
export type ContributorUserGroupMembershipType = {
  __typename?: 'ContributorUserGroupMembershipType';
  id: Scalars['ID'];
  isActive: Scalars['Boolean'];
  totalMappingProjects: Scalars['Int'];
  totalSwipeTime: Scalars['Int'];
  totalSwipes: Scalars['Int'];
  user: ContributorUserType;
  userId: Scalars['ID'];
};

export type ContributorUserGroupMembershipTypeOffsetPaginated = {
  __typename?: 'ContributorUserGroupMembershipTypeOffsetPaginated';
  pageInfo: OffsetPaginationInfo;
  /** List of paginated results. */
  results: Array<ContributorUserGroupMembershipType>;
  /** Total count of existing results. */
  totalCount: Scalars['Int'];
};

export type ContributorUserGroupOrder = {
  id?: InputMaybe<Ordering>;
  name?: InputMaybe<Ordering>;
};

export type ContributorUserGroupStats = {
  __typename?: 'ContributorUserGroupStats';
  filteredStats: ContributorUserGroupFilteredStats;
  id: Scalars['ID'];
  stats: ContributorUserGroupStatsType;
  /** Stats from last 30 days */
  statsLatest: ContributorUserGroupLatestStatsType;
};


export type ContributorUserGroupStatsFilteredStatsArgs = {
  dateRange?: InputMaybe<DateRangeInput>;
};

export type ContributorUserGroupStatsType = {
  __typename?: 'ContributorUserGroupStatsType';
  totalAreaSwiped: Scalars['AreaSqKm'];
  totalContributors: Scalars['Int'];
  totalMappingProjects: Scalars['Int'];
  totalOrganization: Scalars['Int'];
  /** total swipe time (seconds) */
  totalSwipeTime: Scalars['Int'];
  totalSwipes: Scalars['Int'];
};

/**
 * Model representing a group that contributor users can join or leave.
 *
 * Groups are used to aggregate contributions made by users within the group,
 * facilitating management and organization of collective efforts.
 */
export type ContributorUserGroupType = FirebasePushResourceTypeMixin & UserResourceTypeMixin & {
  __typename?: 'ContributorUserGroupType';
  archivedAt?: Maybe<Scalars['DateTime']>;
  archivedBy?: Maybe<UserType>;
  clientId: Scalars['String'];
  communityDashboardUrl: Scalars['String'];
  createdAt: Scalars['DateTime'];
  createdBy: UserType;
  description: Scalars['String'];
  firebaseId: Scalars['String'];
  /** The latest time when resource was pushed to firebase */
  firebaseLastPushed?: Maybe<Scalars['DateTime']>;
  firebasePushStatus?: Maybe<FirebasePushStatusEnum>;
  id: Scalars['ID'];
  isArchived: Scalars['Boolean'];
  membersCount: Scalars['Int'];
  modifiedAt: Scalars['DateTime'];
  modifiedBy: UserType;
  name: Scalars['String'];
  userMemberships: ContributorUserGroupMembershipTypeOffsetPaginated;
};


/**
 * Model representing a group that contributor users can join or leave.
 *
 * Groups are used to aggregate contributions made by users within the group,
 * facilitating management and organization of collective efforts.
 */
export type ContributorUserGroupTypeUserMembershipsArgs = {
  pagination?: InputMaybe<OffsetPaginationInput>;
};

export type ContributorUserGroupTypeMutationResponseType = {
  __typename?: 'ContributorUserGroupTypeMutationResponseType';
  errors?: Maybe<Scalars['CustomErrorType']>;
  ok: Scalars['Boolean'];
  result?: Maybe<ContributorUserGroupType>;
};

export type ContributorUserGroupTypeOffsetPaginated = {
  __typename?: 'ContributorUserGroupTypeOffsetPaginated';
  pageInfo: OffsetPaginationInfo;
  /** List of paginated results. */
  results: Array<ContributorUserGroupType>;
  /** Total count of existing results. */
  totalCount: Scalars['Int'];
};

/**
 * Model representing a group that contributor users can join or leave.
 *
 * Groups are used to aggregate contributions made by users within the group,
 * facilitating management and organization of collective efforts.
 */
export type ContributorUserGroupUpdateInput = {
  clientId: Scalars['String'];
  description?: InputMaybe<Scalars['String']>;
  isArchived?: InputMaybe<Scalars['Boolean']>;
  name?: InputMaybe<Scalars['String']>;
};

export type ContributorUserLatestStatsType = {
  __typename?: 'ContributorUserLatestStatsType';
  /** total swipe time (seconds) */
  totalSwipeTime: Scalars['Int'];
  totalSwipes: Scalars['Int'];
  totalUserGroups: Scalars['Int'];
};

export type ContributorUserOrder = {
  id?: InputMaybe<Ordering>;
  username?: InputMaybe<Ordering>;
};

export type ContributorUserStatType = {
  __typename?: 'ContributorUserStatType';
  totalAreaSwiped: Scalars['AreaSqKm'];
  totalMappingProjects: Scalars['Int'];
  totalOrganization: Scalars['Int'];
  /** total swipe time (seconds) */
  totalSwipeTime: Scalars['Int'];
  totalSwipes: Scalars['Int'];
};

export type ContributorUserStats = {
  __typename?: 'ContributorUserStats';
  filteredStats: ContributorUserFilteredStats;
  firebaseId: Scalars['ID'];
  id: Scalars['ID'];
  stats: ContributorUserStatType;
  /** Stats from last 30 days */
  statsLatest: ContributorUserLatestStatsType;
};


export type ContributorUserStatsFilteredStatsArgs = {
  dateRange?: InputMaybe<DateRangeInput>;
};

/**
 * Model representing contributors synchronized from firebase.
 *
 * Contributor accounts are typically created in firebase and then synced into this system.
 * A contributor user may or may not be linked to a corresponding user in the system.
 */
export type ContributorUserType = {
  __typename?: 'ContributorUserType';
  communityDashboardUrl: Scalars['String'];
  createdAt?: Maybe<Scalars['DateTime']>;
  /** Firebase User ID (External) */
  firebaseId: Scalars['ID'];
  id: Scalars['ID'];
  totalMappingProjects: Scalars['Int'];
  totalSwipeTime: Scalars['Int'];
  totalSwipes: Scalars['Int'];
  username: Scalars['String'];
};

export type ContributorUserTypeOffsetPaginated = {
  __typename?: 'ContributorUserTypeOffsetPaginated';
  pageInfo: OffsetPaginationInfo;
  /** List of paginated results. */
  results: Array<ContributorUserType>;
  /** Total count of existing results. */
  totalCount: Scalars['Int'];
};

export type ContributorUserUserGroupBaseFilterStatsQuery = {
  areaSwipedByProjectType: Array<ProjectTypeAreaStatsType>;
  swipeByDate: Array<ContributorSwipeStatType>;
  swipeByOrganizationName: Array<OrganizationSwipeStatsType>;
  swipeByProjectGeo: Array<MapContributionStatsType>;
  swipeByProjectType: Array<ProjectTypeSwipeStatsType>;
  swipeTimeByDate: Array<ContributorTimeStatType>;
};

export type CreateContributorUserGroupPayload = ContributorUserGroupTypeMutationResponseType | OperationInfo;

export type CreateOrganizationPayload = OperationInfo | OrganizationTypeMutationResponseType;

export type CreateProjectAssetPayload = OperationInfo | ProjectAssetTypeMutationResponseType;

export type CreateProjectPayload = OperationInfo | ProjectTypeMutationResponseType;

export type CreateTutorialAssetPayload = OperationInfo | TutorialAssetTypeMutationResponseType;

export type CreateTutorialPayload = OperationInfo | TutorialTypeMutationResponseType;

export type CustomOptionInput = {
  /** ULID value */
  clientId: Scalars['String'];
  description: Scalars['String'];
  icon: IconEnum;
  /** Hex color string like '#fff' or '#ffffff' or 'transparent' */
  iconColor: Scalars['String'];
  subOptions?: InputMaybe<Array<CustomSubOptionInput>>;
  title: Scalars['String'];
  /** Positive integer value */
  value: Scalars['Int'];
};

export type CustomOptionType = {
  __typename?: 'CustomOptionType';
  description: Scalars['String'];
  icon: IconEnum;
  iconColor: Scalars['String'];
  title: Scalars['String'];
  value: Scalars['Int'];
};

export type CustomSubOptionInput = {
  /** ULID value */
  clientId: Scalars['String'];
  description: Scalars['String'];
  /** Positive integer value */
  value: Scalars['Int'];
};

export type DateRangeInput = {
  fromDate: Scalars['Date'];
  toDate: Scalars['Date'];
};

export type DeleteInput = {
  id: Scalars['ID'];
};

export type DeleteProjectAssetsPayload = OperationInfo | ProjectAssetsDeleteTypeMutationResponseType;

export type DeleteProjectPayload = OperationInfo | ProjectType;

export type DeleteTutorialPayload = OperationInfo | TutorialType;

export type FindProjectPropertyInput = {
  /** Numeric value as string */
  aoiGeometry: Scalars['String'];
  tileServerProperty: ProjectRasterTileServerConfigInput;
  /** Zoom level from 14 to 22 */
  zoomLevel: Scalars['Int'];
};

export type FindProjectPropertyType = {
  __typename?: 'FindProjectPropertyType';
  /** Numeric value as string */
  aoiGeometry: Scalars['String'];
  tileServerProperty: ProjectRasterTileServerConfig;
  /** Zoom level from 14 to 22 */
  zoomLevel: Scalars['Int'];
};

export type FindTutorialTaskPropertyInput = {
  tileX: Scalars['Int'];
  tileY: Scalars['Int'];
  tileZ: Scalars['Int'];
};

export type FindTutorialTaskPropertyType = {
  __typename?: 'FindTutorialTaskPropertyType';
  tileX: Scalars['Int'];
  tileY: Scalars['Int'];
  tileZ: Scalars['Int'];
};

export type FirebaseOrInternalIdInputType =
  { firebaseId: Scalars['ID']; id?: never; }
  |  { firebaseId?: never; id: Scalars['ID']; };

export type FirebasePushResourceTypeMixin = {
  firebaseId: Scalars['String'];
  firebaseLastPushed?: Maybe<Scalars['DateTime']>;
  firebasePushStatus?: Maybe<FirebasePushStatusEnum>;
};

export enum FirebasePushStatusEnum {
  Failed = 'FAILED',
  Pending = 'PENDING',
  Processing = 'PROCESSING',
  Success = 'SUCCESS'
}

/** Model representing an area. */
export type GeometryType = {
  __typename?: 'GeometryType';
  bbox?: Maybe<Scalars['Polygon']>;
  centroid?: Maybe<Scalars['Point']>;
  id: Scalars['ID'];
  totalArea?: Maybe<Scalars['Float']>;
};

/** Model representing a global export asset with associated metadata. */
export type GlobalExportAssetType = {
  __typename?: 'GlobalExportAssetType';
  /** The file associated with the asset */
  file?: Maybe<MapswipeDjangoFileType>;
  /** The size of the file in bytes */
  fileSize: Scalars['Int'];
  lastUpdatedAt: Scalars['DateTime'];
  type: GlobalExportAssetTypeEnum;
};

export enum GlobalExportAssetTypeEnum {
  ProjectsCentroidGeojson = 'PROJECTS_CENTROID_GEOJSON',
  ProjectsCsv = 'PROJECTS_CSV',
  ProjectsGeomGeojson = 'PROJECTS_GEOM_GEOJSON',
  ProjectStatsByTypes = 'PROJECT_STATS_BY_TYPES'
}

export type IdBaseFilterLookup = {
  /** Exact match. Filter will be skipped on `null` value */
  exact?: InputMaybe<Scalars['ID']>;
  /** Exact match of items in a given list. Filter will be skipped on `null` value */
  inList?: InputMaybe<Array<Scalars['ID']>>;
  /** Assignment test. Filter will be skipped on `null` value */
  isNull?: InputMaybe<Scalars['Boolean']>;
};

export enum IconEnum {
  AddOutline = 'ADD_OUTLINE',
  AlertOutline = 'ALERT_OUTLINE',
  BanOutline = 'BAN_OUTLINE',
  Check = 'CHECK',
  CheckmarkOutline = 'CHECKMARK_OUTLINE',
  CloseOutline = 'CLOSE_OUTLINE',
  EggOutline = 'EGG_OUTLINE',
  EllipseOutline = 'ELLIPSE_OUTLINE',
  FlagOutline = 'FLAG_OUTLINE',
  GeneralTap = 'GENERAL_TAP',
  HandLeftOutline = 'HAND_LEFT_OUTLINE',
  HandRightOutline = 'HAND_RIGHT_OUTLINE',
  HappyOutline = 'HAPPY_OUTLINE',
  HeartOutline = 'HEART_OUTLINE',
  HelpOutline = 'HELP_OUTLINE',
  InformationOutline = 'INFORMATION_OUTLINE',
  PrismOutline = 'PRISM_OUTLINE',
  RefreshOutline = 'REFRESH_OUTLINE',
  RemoveOutline = 'REMOVE_OUTLINE',
  SadOutline = 'SAD_OUTLINE',
  SearchOutline = 'SEARCH_OUTLINE',
  ShapesOutline = 'SHAPES_OUTLINE',
  SquareOutline = 'SQUARE_OUTLINE',
  StarOutline = 'STAR_OUTLINE',
  SwipeLeft = 'SWIPE_LEFT',
  Tap = 'TAP',
  Tap_1 = 'TAP_1',
  Tap_2 = 'TAP_2',
  Tap_3 = 'TAP_3',
  ThumbsDownOutline = 'THUMBS_DOWN_OUTLINE',
  ThumbsUpOutline = 'THUMBS_UP_OUTLINE',
  TriangleOutline = 'TRIANGLE_OUTLINE',
  WarningOutline = 'WARNING_OUTLINE'
}

export type IntComparisonFilterLookup = {
  /** Exact match. Filter will be skipped on `null` value */
  exact?: InputMaybe<Scalars['Int']>;
  /** Greater than. Filter will be skipped on `null` value */
  gt?: InputMaybe<Scalars['Int']>;
  /** Greater than or equal to. Filter will be skipped on `null` value */
  gte?: InputMaybe<Scalars['Int']>;
  /** Exact match of items in a given list. Filter will be skipped on `null` value */
  inList?: InputMaybe<Array<Scalars['Int']>>;
  /** Assignment test. Filter will be skipped on `null` value */
  isNull?: InputMaybe<Scalars['Boolean']>;
  /** Less than. Filter will be skipped on `null` value */
  lt?: InputMaybe<Scalars['Int']>;
  /** Less than or equal to. Filter will be skipped on `null` value */
  lte?: InputMaybe<Scalars['Int']>;
  /** Inclusive range test (between) */
  range?: InputMaybe<IntRangeLookup>;
};

export type IntRangeLookup = {
  end?: InputMaybe<Scalars['Int']>;
  start?: InputMaybe<Scalars['Int']>;
};

export type LocateProjectPropertyInput = {
  /** Numeric value as string */
  aoiGeometry: Scalars['String'];
  customOptions?: InputMaybe<Array<CustomOptionInput>>;
  exportMetaKey: Scalars['String'];
  exportMetaValue: Scalars['String'];
  subGridSize: SubGridSizeEnum;
  tileServerProperty: ProjectRasterTileServerConfigInput;
  /** Zoom level from 14 to 22 */
  zoomLevel: Scalars['Int'];
};

export type LocateProjectPropertyType = {
  __typename?: 'LocateProjectPropertyType';
  /** Numeric value as string */
  aoiGeometry: Scalars['String'];
  customOptions?: Maybe<Array<ProjectCustomOption>>;
  exportMetaKey: Scalars['String'];
  exportMetaValue: Scalars['String'];
  subGridSize: SubGridSizeEnum;
  tileServerProperty: ProjectRasterTileServerConfig;
  /** Zoom level from 14 to 22 */
  zoomLevel: Scalars['Int'];
};

export type LocateTutorialTaskPropertyInput = {
  tileX: Scalars['Int'];
  tileY: Scalars['Int'];
  tileZ: Scalars['Int'];
};

export type LocateTutorialTaskPropertyType = {
  __typename?: 'LocateTutorialTaskPropertyType';
  tileX: Scalars['Int'];
  tileY: Scalars['Int'];
  tileZ: Scalars['Int'];
};

export type MapContributionStatsType = {
  __typename?: 'MapContributionStatsType';
  geojson: Scalars['GenericJSON'];
  totalContribution: Scalars['Int'];
};

export enum MappingSessionClientTypeEnum {
  MobileAndroid = 'MOBILE_ANDROID',
  MobileIos = 'MOBILE_IOS',
  Unknown = 'UNKNOWN',
  Web = 'WEB'
}

export type MapswipeDjangoFileType = {
  __typename?: 'MapswipeDjangoFileType';
  name: Scalars['String'];
  url: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createContributorUserGroup: CreateContributorUserGroupPayload;
  createOrganization: CreateOrganizationPayload;
  createProject: CreateProjectPayload;
  createProjectAsset: CreateProjectAssetPayload;
  createTutorial: CreateTutorialPayload;
  createTutorialAsset: CreateTutorialAssetPayload;
  deleteProject: DeleteProjectPayload;
  deleteProjectAssets: DeleteProjectAssetsPayload;
  deleteTutorial: DeleteTutorialPayload;
  login: UserMeType;
  logout: Scalars['Boolean'];
  updateContributorUserGroup: UpdateContributorUserGroupPayload;
  updateOrganization: UpdateOrganizationPayload;
  updateProcessedProject: UpdateProcessedProjectPayload;
  updateProject: UpdateProjectPayload;
  updateProjectStatus: UpdateProjectStatusPayload;
  updateTutorial: UpdateTutorialPayload;
  updateTutorialStatus: UpdateTutorialStatusPayload;
};


export type MutationCreateContributorUserGroupArgs = {
  data: ContributorUserGroupCreateInput;
};


export type MutationCreateOrganizationArgs = {
  data: OrganizationCreateInput;
};


export type MutationCreateProjectArgs = {
  data: ProjectCreateInput;
};


export type MutationCreateProjectAssetArgs = {
  data: ProjectAssetCreateInput;
};


export type MutationCreateTutorialArgs = {
  data: TutorialCreateInput;
};


export type MutationCreateTutorialAssetArgs = {
  data: TutorialAssetCreateInput;
};


export type MutationDeleteProjectAssetsArgs = {
  assetInputType: Array<ProjectAssetInputTypeEnum>;
  projectId: Scalars['ID'];
};


export type MutationLoginArgs = {
  password: Scalars['String'];
  username: Scalars['String'];
};


export type MutationUpdateContributorUserGroupArgs = {
  data: ContributorUserGroupUpdateInput;
  pk: Scalars['ID'];
};


export type MutationUpdateOrganizationArgs = {
  data: OrganizationUpdateInput;
  pk: Scalars['ID'];
};


export type MutationUpdateProcessedProjectArgs = {
  data: ProcessedProjectUpdateInput;
  pk: Scalars['ID'];
};


export type MutationUpdateProjectArgs = {
  data: ProjectUpdateInput;
  pk: Scalars['ID'];
};


export type MutationUpdateProjectStatusArgs = {
  data: ProjectStatusUpdateInput;
  pk: Scalars['ID'];
};


export type MutationUpdateTutorialArgs = {
  data: TutorialUpdateInput;
  pk: Scalars['ID'];
};


export type MutationUpdateTutorialStatusArgs = {
  data: TutorialStatusUpdateInput;
  pk: Scalars['ID'];
};

export type ObjectImageAnnotationInput = {
  area?: InputMaybe<Scalars['Float']>;
  bbox: Array<Scalars['Float']>;
  categoryId?: InputMaybe<Scalars['String']>;
  /** Numeric value as string */
  id: Scalars['String'];
  imageId?: InputMaybe<Scalars['String']>;
  iscrowd?: InputMaybe<Scalars['Int']>;
  segmentation?: InputMaybe<Array<Array<Scalars['Float']>>>;
};

export type ObjectImageAnnotationType = {
  __typename?: 'ObjectImageAnnotationType';
  area?: Maybe<Scalars['Float']>;
  bbox: Array<Scalars['Float']>;
  categoryId?: Maybe<Scalars['String']>;
  /** Numeric value as string */
  id: Scalars['String'];
  imageId?: Maybe<Scalars['String']>;
  iscrowd?: Maybe<Scalars['Int']>;
  segmentation?: Maybe<Array<Array<Scalars['Float']>>>;
};

export type ObjectImageAssetPropertyInput = {
  annotations?: InputMaybe<Array<ObjectImageAnnotationInput>>;
  image: ObjectImageInput;
};

export type ObjectImageAssetPropertyType = {
  __typename?: 'ObjectImageAssetPropertyType';
  annotations?: Maybe<Array<ObjectImageAnnotationType>>;
  image: ObjectImageType;
};

export type ObjectImageInput = {
  cocoUrl?: InputMaybe<Scalars['String']>;
  dateCaptured?: InputMaybe<Scalars['DateTime']>;
  fileName: Scalars['String'];
  flickrUrl?: InputMaybe<Scalars['String']>;
  height?: InputMaybe<Scalars['Int']>;
  /** Numeric value as string */
  id: Scalars['String'];
  license?: InputMaybe<Scalars['Int']>;
  width?: InputMaybe<Scalars['Int']>;
};

export type ObjectImageType = {
  __typename?: 'ObjectImageType';
  cocoUrl?: Maybe<Scalars['String']>;
  dateCaptured?: Maybe<Scalars['DateTime']>;
  fileName: Scalars['String'];
  flickrUrl?: Maybe<Scalars['String']>;
  height?: Maybe<Scalars['Int']>;
  /** Numeric value as string */
  id: Scalars['String'];
  license?: Maybe<Scalars['Int']>;
  width?: Maybe<Scalars['Int']>;
};

export type OffsetPaginationInfo = {
  __typename?: 'OffsetPaginationInfo';
  limit?: Maybe<Scalars['Int']>;
  offset: Scalars['Int'];
};

export type OffsetPaginationInput = {
  limit?: InputMaybe<Scalars['Int']>;
  offset?: Scalars['Int'];
};

export type OperationInfo = {
  __typename?: 'OperationInfo';
  /** List of messages returned by the operation. */
  messages: Array<OperationMessage>;
};

export type OperationMessage = {
  __typename?: 'OperationMessage';
  /** The error code, or `null` if no error code was set. */
  code?: Maybe<Scalars['String']>;
  /** The field that caused the error, or `null` if it isn't associated with any particular field. */
  field?: Maybe<Scalars['String']>;
  /** The kind of this message. */
  kind: OperationMessageKind;
  /** The error message. */
  message: Scalars['String'];
};

export enum OperationMessageKind {
  Error = 'ERROR',
  Info = 'INFO',
  Permission = 'PERMISSION',
  Validation = 'VALIDATION',
  Warning = 'WARNING'
}

export enum Ordering {
  Asc = 'ASC',
  AscNullsFirst = 'ASC_NULLS_FIRST',
  AscNullsLast = 'ASC_NULLS_LAST',
  Desc = 'DESC',
  DescNullsFirst = 'DESC_NULLS_FIRST',
  DescNullsLast = 'DESC_NULLS_LAST'
}

/** Model representing the organization requesting the project. */
export type OrganizationCreateInput = {
  abbreviation?: InputMaybe<Scalars['String']>;
  clientId: Scalars['String'];
  description?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
};

/** Model representing the organization requesting the project. */
export type OrganizationFilter = {
  AND?: InputMaybe<OrganizationFilter>;
  DISTINCT?: InputMaybe<Scalars['Boolean']>;
  NOT?: InputMaybe<OrganizationFilter>;
  OR?: InputMaybe<OrganizationFilter>;
  id?: InputMaybe<IdBaseFilterLookup>;
  isArchived?: InputMaybe<BoolBaseFilterLookup>;
  name?: InputMaybe<Scalars['String']>;
};

export type OrganizationOrder = {
  id?: InputMaybe<Ordering>;
  name?: InputMaybe<Ordering>;
};

export type OrganizationSwipeStatsType = {
  __typename?: 'OrganizationSwipeStatsType';
  organizationName: Scalars['String'];
  totalSwipes: Scalars['Int'];
};

/** Model representing the organization requesting the project. */
export type OrganizationType = FirebasePushResourceTypeMixin & UserResourceTypeMixin & {
  __typename?: 'OrganizationType';
  abbreviation?: Maybe<Scalars['String']>;
  archivedAt?: Maybe<Scalars['DateTime']>;
  archivedBy?: Maybe<UserType>;
  clientId: Scalars['String'];
  createdAt: Scalars['DateTime'];
  createdBy: UserType;
  description?: Maybe<Scalars['String']>;
  firebaseId: Scalars['String'];
  /** The latest time when resource was pushed to firebase */
  firebaseLastPushed?: Maybe<Scalars['DateTime']>;
  firebasePushStatus?: Maybe<FirebasePushStatusEnum>;
  id: Scalars['ID'];
  isArchived: Scalars['Boolean'];
  modifiedAt: Scalars['DateTime'];
  modifiedBy: UserType;
  name: Scalars['String'];
};

export type OrganizationTypeMutationResponseType = {
  __typename?: 'OrganizationTypeMutationResponseType';
  errors?: Maybe<Scalars['CustomErrorType']>;
  ok: Scalars['Boolean'];
  result?: Maybe<OrganizationType>;
};

export type OrganizationTypeOffsetPaginated = {
  __typename?: 'OrganizationTypeOffsetPaginated';
  pageInfo: OffsetPaginationInfo;
  /** List of paginated results. */
  results: Array<OrganizationType>;
  /** Total count of existing results. */
  totalCount: Scalars['Int'];
};

/** Model representing the organization requesting the project. */
export type OrganizationUpdateInput = {
  abbreviation?: InputMaybe<Scalars['String']>;
  clientId: Scalars['String'];
  description?: InputMaybe<Scalars['String']>;
  isArchived?: InputMaybe<Scalars['Boolean']>;
  name?: InputMaybe<Scalars['String']>;
};

export enum OverlayLayerTypeEnum {
  RasterTile = 'RASTER_TILE',
  VectorTile = 'VECTOR_TILE'
}

/** Model representing the project. */
export type ProcessedProjectUpdateInput = {
  /** Provide an optional link to a resource with additional information on the project */
  additionalInfoUrl?: InputMaybe<Scalars['String']>;
  clientId: Scalars['String'];
  description?: InputMaybe<Scalars['String']>;
  image?: InputMaybe<Scalars['ID']>;
  isFeatured?: InputMaybe<Scalars['Boolean']>;
  /** What should the users look for (e.g. buildings, cars, trees) */
  lookFor?: InputMaybe<Scalars['String']>;
  /** How many tasks each user is allowed to work on for this project */
  maxTasksPerUser?: InputMaybe<Scalars['Int']>;
  /** Provide project instruction */
  projectInstruction?: InputMaybe<Scalars['String']>;
  projectNumber?: InputMaybe<Scalars['Int']>;
  region?: InputMaybe<Scalars['String']>;
  /** Which group, institution or community is requesting this project? */
  requestingOrganization?: InputMaybe<Scalars['ID']>;
  team?: InputMaybe<Scalars['ID']>;
  topic?: InputMaybe<Scalars['String']>;
  /** Tutorial used for this project. */
  tutorial?: InputMaybe<Scalars['ID']>;
};

/** Model representing assets for a project. */
export type ProjectAssetCreateInput = {
  assetTypeSpecifics?: InputMaybe<AssetTypeSpecificInput>;
  clientId: Scalars['String'];
  /** Provide link to the file associated with the asset */
  externalUrl?: InputMaybe<Scalars['String']>;
  /** The file associated with the asset */
  file?: InputMaybe<Scalars['Upload']>;
  inputType: ProjectAssetInputTypeEnum;
  project: Scalars['ID'];
};

export enum ProjectAssetExportTypeEnum {
  AggregatedResults = 'AGGREGATED_RESULTS',
  AggregatedResultsWithGeometry = 'AGGREGATED_RESULTS_WITH_GEOMETRY',
  AreaOfInterest = 'AREA_OF_INTEREST',
  Groups = 'GROUPS',
  History = 'HISTORY',
  HotTaskingManagerGeometries = 'HOT_TASKING_MANAGER_GEOMETRIES',
  ModerateToHighAgreementYesMaybeGeometries = 'MODERATE_TO_HIGH_AGREEMENT_YES_MAYBE_GEOMETRIES',
  Results = 'RESULTS',
  Tasks = 'TASKS',
  Users = 'USERS'
}

export type ProjectAssetExportTypeEnumFilterLookup = {
  /** Case-sensitive containment test. Filter will be skipped on `null` value */
  contains?: InputMaybe<ProjectAssetExportTypeEnum>;
  /** Case-sensitive ends-with. Filter will be skipped on `null` value */
  endsWith?: InputMaybe<ProjectAssetExportTypeEnum>;
  /** Exact match. Filter will be skipped on `null` value */
  exact?: InputMaybe<ProjectAssetExportTypeEnum>;
  /** Case-insensitive containment test. Filter will be skipped on `null` value */
  iContains?: InputMaybe<ProjectAssetExportTypeEnum>;
  /** Case-insensitive ends-with. Filter will be skipped on `null` value */
  iEndsWith?: InputMaybe<ProjectAssetExportTypeEnum>;
  /** Case-insensitive exact match. Filter will be skipped on `null` value */
  iExact?: InputMaybe<ProjectAssetExportTypeEnum>;
  /** Case-insensitive regular expression match. Filter will be skipped on `null` value */
  iRegex?: InputMaybe<ProjectAssetExportTypeEnum>;
  /** Case-insensitive starts-with. Filter will be skipped on `null` value */
  iStartsWith?: InputMaybe<ProjectAssetExportTypeEnum>;
  /** Exact match of items in a given list. Filter will be skipped on `null` value */
  inList?: InputMaybe<Array<ProjectAssetExportTypeEnum>>;
  /** Assignment test. Filter will be skipped on `null` value */
  isNull?: InputMaybe<Scalars['Boolean']>;
  /** Case-sensitive regular expression match. Filter will be skipped on `null` value */
  regex?: InputMaybe<ProjectAssetExportTypeEnum>;
  /** Case-sensitive starts-with. Filter will be skipped on `null` value */
  startsWith?: InputMaybe<ProjectAssetExportTypeEnum>;
};

/** Model representing assets for a project. */
export type ProjectAssetFilter = {
  AND?: InputMaybe<ProjectAssetFilter>;
  DISTINCT?: InputMaybe<Scalars['Boolean']>;
  NOT?: InputMaybe<ProjectAssetFilter>;
  OR?: InputMaybe<ProjectAssetFilter>;
  exportType?: InputMaybe<ProjectAssetExportTypeEnumFilterLookup>;
  id?: InputMaybe<IdBaseFilterLookup>;
  inputType?: InputMaybe<ProjectAssetInputTypeEnumFilterLookup>;
  mimetype?: InputMaybe<AssetMimetypeEnumFilterLookup>;
  projectId?: InputMaybe<IdBaseFilterLookup>;
  type?: InputMaybe<AssetTypeEnumFilterLookup>;
};

export enum ProjectAssetInputTypeEnum {
  AoiGeometry = 'AOI_GEOMETRY',
  CoverImage = 'COVER_IMAGE',
  ObjectImage = 'OBJECT_IMAGE'
}

export type ProjectAssetInputTypeEnumFilterLookup = {
  /** Case-sensitive containment test. Filter will be skipped on `null` value */
  contains?: InputMaybe<ProjectAssetInputTypeEnum>;
  /** Case-sensitive ends-with. Filter will be skipped on `null` value */
  endsWith?: InputMaybe<ProjectAssetInputTypeEnum>;
  /** Exact match. Filter will be skipped on `null` value */
  exact?: InputMaybe<ProjectAssetInputTypeEnum>;
  /** Case-insensitive containment test. Filter will be skipped on `null` value */
  iContains?: InputMaybe<ProjectAssetInputTypeEnum>;
  /** Case-insensitive ends-with. Filter will be skipped on `null` value */
  iEndsWith?: InputMaybe<ProjectAssetInputTypeEnum>;
  /** Case-insensitive exact match. Filter will be skipped on `null` value */
  iExact?: InputMaybe<ProjectAssetInputTypeEnum>;
  /** Case-insensitive regular expression match. Filter will be skipped on `null` value */
  iRegex?: InputMaybe<ProjectAssetInputTypeEnum>;
  /** Case-insensitive starts-with. Filter will be skipped on `null` value */
  iStartsWith?: InputMaybe<ProjectAssetInputTypeEnum>;
  /** Exact match of items in a given list. Filter will be skipped on `null` value */
  inList?: InputMaybe<Array<ProjectAssetInputTypeEnum>>;
  /** Assignment test. Filter will be skipped on `null` value */
  isNull?: InputMaybe<Scalars['Boolean']>;
  /** Case-sensitive regular expression match. Filter will be skipped on `null` value */
  regex?: InputMaybe<ProjectAssetInputTypeEnum>;
  /** Case-sensitive starts-with. Filter will be skipped on `null` value */
  startsWith?: InputMaybe<ProjectAssetInputTypeEnum>;
};

export type ProjectAssetOrder = {
  id?: InputMaybe<Ordering>;
};

/** Model representing assets for a project. */
export type ProjectAssetType = UserResourceTypeMixin & {
  __typename?: 'ProjectAssetType';
  assetTypeSpecifics?: Maybe<AoiGeometryAssetPropertyTypeObjectImageAssetPropertyType>;
  clientId: Scalars['String'];
  createdAt: Scalars['DateTime'];
  createdBy: UserType;
  exportType?: Maybe<ProjectAssetExportTypeEnum>;
  /** Provide link to the file associated with the asset */
  externalUrl?: Maybe<Scalars['String']>;
  /** The file associated with the asset */
  file?: Maybe<MapswipeDjangoFileType>;
  /** The size of the file in bytes */
  fileSize: Scalars['Int'];
  id: Scalars['ID'];
  inputType?: Maybe<ProjectAssetInputTypeEnum>;
  /** If this flag is enabled, this asset will be deleted in the future */
  markedAsDeleted: Scalars['Boolean'];
  mimetype?: Maybe<AssetMimetypeEnum>;
  modifiedAt: Scalars['DateTime'];
  modifiedBy: UserType;
  projectId: Scalars['ID'];
  type: AssetTypeEnum;
};

export type ProjectAssetTypeMutationResponseType = {
  __typename?: 'ProjectAssetTypeMutationResponseType';
  errors?: Maybe<Scalars['CustomErrorType']>;
  ok: Scalars['Boolean'];
  result?: Maybe<ProjectAssetType>;
};

export type ProjectAssetTypeOffsetPaginated = {
  __typename?: 'ProjectAssetTypeOffsetPaginated';
  pageInfo: OffsetPaginationInfo;
  /** List of paginated results. */
  results: Array<ProjectAssetType>;
  /** Total count of existing results. */
  totalCount: Scalars['Int'];
};

export type ProjectAssetsDeleteType = {
  __typename?: 'ProjectAssetsDeleteType';
  count: Scalars['Int'];
};

export type ProjectAssetsDeleteTypeMutationResponseType = {
  __typename?: 'ProjectAssetsDeleteTypeMutationResponseType';
  errors?: Maybe<Scalars['CustomErrorType']>;
  ok: Scalars['Boolean'];
  result?: Maybe<ProjectAssetsDeleteType>;
};

/** Model representing the project. */
export type ProjectCreateInput = {
  /** Provide an optional link to a resource with additional information on the project */
  additionalInfoUrl?: InputMaybe<Scalars['String']>;
  clientId: Scalars['String'];
  description?: InputMaybe<Scalars['String']>;
  /** What should the users look for (e.g. buildings, cars, trees) */
  lookFor?: InputMaybe<Scalars['String']>;
  /** Provide project instruction */
  projectInstruction: Scalars['String'];
  projectNumber: Scalars['Int'];
  projectType: ProjectTypeEnum;
  region: Scalars['String'];
  /** Which group, institution or community is requesting this project? */
  requestingOrganization: Scalars['ID'];
  team?: InputMaybe<Scalars['ID']>;
  topic: Scalars['String'];
};

export type ProjectCustomOption = {
  __typename?: 'ProjectCustomOption';
  /** ULID value */
  clientId: Scalars['String'];
  description: Scalars['String'];
  icon: IconEnum;
  /** Hex color string like '#fff' or '#ffffff' or 'transparent' */
  iconColor: Scalars['String'];
  subOptions?: Maybe<Array<ProjectCustomSubOption>>;
  title: Scalars['String'];
  /** Positive integer value */
  value: Scalars['Int'];
};

export type ProjectCustomSubOption = {
  __typename?: 'ProjectCustomSubOption';
  /** ULID value */
  clientId: Scalars['String'];
  description: Scalars['String'];
  /** Positive integer value */
  value: Scalars['Int'];
};

export type ProjectExportAssetTypeMixin = {
  exportAggregatedResults?: Maybe<ProjectAssetType>;
  exportAggregatedResultsWithGeometry?: Maybe<ProjectAssetType>;
  exportAreaOfInterest?: Maybe<ProjectAssetType>;
  exportGroups?: Maybe<ProjectAssetType>;
  exportHistory?: Maybe<ProjectAssetType>;
  exportHotTaskingManagerGeometries?: Maybe<ProjectAssetType>;
  exportModerateToHighAgreementYesMaybeGeometries?: Maybe<ProjectAssetType>;
  exportResults?: Maybe<ProjectAssetType>;
  exportTasks?: Maybe<ProjectAssetType>;
  exportUsers?: Maybe<ProjectAssetType>;
};

/** Model representing the project. */
export type ProjectFilter = {
  AND?: InputMaybe<ProjectFilter>;
  DISTINCT?: InputMaybe<Scalars['Boolean']>;
  NOT?: InputMaybe<ProjectFilter>;
  OR?: InputMaybe<ProjectFilter>;
  createdById?: InputMaybe<IdBaseFilterLookup>;
  id?: InputMaybe<IdBaseFilterLookup>;
  isFeatured?: InputMaybe<BoolBaseFilterLookup>;
  /** If the project is private, then it is only visible to the team members. */
  isPrivate?: InputMaybe<BoolBaseFilterLookup>;
  name?: InputMaybe<Scalars['String']>;
  oldId?: InputMaybe<StrFilterLookup>;
  progressStatus?: InputMaybe<ProjectProgressStatusEnumFilterLookup>;
  projectNumber?: InputMaybe<IntComparisonFilterLookup>;
  projectType?: InputMaybe<ProjectTypeEnumFilterLookup>;
  region?: InputMaybe<Scalars['String']>;
  /** Which group, institution or community is requesting this project? */
  requestingOrganizationId?: InputMaybe<IdBaseFilterLookup>;
  status?: InputMaybe<ProjectStatusEnumFilterLookup>;
  teamId?: InputMaybe<IdBaseFilterLookup>;
  topic?: InputMaybe<Scalars['String']>;
};

export type ProjectNameInput = {
  projectNumber: Scalars['Int'];
  projectType: ProjectTypeEnum;
  region: Scalars['String'];
  requestingOrganizationId: Scalars['ID'];
  topic: Scalars['String'];
};

export type ProjectOrder = {
  id?: InputMaybe<Ordering>;
  name?: InputMaybe<Ordering>;
  topic?: InputMaybe<Ordering>;
};

export type ProjectOverlayRasterTileServerConfig = {
  __typename?: 'ProjectOverlayRasterTileServerConfig';
  /** Float value from 0.0 to 1.0 */
  opacity: Scalars['Float'];
  tileServer: ProjectRasterTileServerConfig;
};

export type ProjectOverlayRasterTileServerConfigInput = {
  /** Float value from 0.0 to 1.0 */
  opacity: Scalars['Float'];
  tileServer: ProjectRasterTileServerConfigInput;
};

export type ProjectOverlayTileServerConfig = {
  __typename?: 'ProjectOverlayTileServerConfig';
  raster?: Maybe<ProjectOverlayRasterTileServerConfig>;
  type: OverlayLayerTypeEnum;
  vector?: Maybe<ProjectOverlayVectorTileServerConfig>;
};

export type ProjectOverlayTileServerConfigInput = {
  raster?: InputMaybe<ProjectOverlayRasterTileServerConfigInput>;
  type: OverlayLayerTypeEnum;
  vector?: InputMaybe<ProjectOverlayVectorTileServerConfigInput>;
};

export type ProjectOverlayVectorTileServerConfig = {
  __typename?: 'ProjectOverlayVectorTileServerConfig';
  /** Hex color string like '#fff' or '#ffffff' or 'transparent' */
  circleColor: Scalars['String'];
  /** Float value from 0.0 to 1.0 */
  circleOpacity: Scalars['Float'];
  /** Positive float value */
  circleRadius: Scalars['Float'];
  /** Hex color string like '#fff' or '#ffffff' or 'transparent' */
  fillColor: Scalars['String'];
  /** Float value from 0.0 to 1.0 */
  fillOpacity: Scalars['Float'];
  /** Hex color string like '#fff' or '#ffffff' or 'transparent' */
  lineColor: Scalars['String'];
  lineDasharray: Array<Scalars['Int']>;
  /** Float value from 0.0 to 1.0 */
  lineOpacity: Scalars['Float'];
  /** Positive float value */
  lineWidth: Scalars['Float'];
  tileServer: ProjectVectorTileServerConfig;
};

export type ProjectOverlayVectorTileServerConfigInput = {
  /** Hex color string like '#fff' or '#ffffff' or 'transparent' */
  circleColor: Scalars['String'];
  /** Float value from 0.0 to 1.0 */
  circleOpacity: Scalars['Float'];
  /** Positive float value */
  circleRadius: Scalars['Float'];
  /** Hex color string like '#fff' or '#ffffff' or 'transparent' */
  fillColor: Scalars['String'];
  /** Float value from 0.0 to 1.0 */
  fillOpacity: Scalars['Float'];
  /** Hex color string like '#fff' or '#ffffff' or 'transparent' */
  lineColor: Scalars['String'];
  lineDasharray: Array<Scalars['Int']>;
  /** Float value from 0.0 to 1.0 */
  lineOpacity: Scalars['Float'];
  /** Positive float value */
  lineWidth: Scalars['Float'];
  tileServer: ProjectVectorTileServerConfigInput;
};

export enum ProjectProcessingStatusEnum {
  AnalyzingGroupsAndTask = 'ANALYZING_GROUPS_AND_TASK',
  Completed = 'COMPLETED',
  GeneratingGroupsAndTasks = 'GENERATING_GROUPS_AND_TASKS',
  GeneratingTasksGeojson = 'GENERATING_TASKS_GEOJSON',
  Preparing = 'PREPARING',
  ValidatingGeometry = 'VALIDATING_GEOMETRY'
}

export enum ProjectProgressStatusEnum {
  Completed = 'COMPLETED',
  OnGoing = 'ON_GOING'
}

export type ProjectProgressStatusEnumFilterLookup = {
  /** Case-sensitive containment test. Filter will be skipped on `null` value */
  contains?: InputMaybe<ProjectProgressStatusEnum>;
  /** Case-sensitive ends-with. Filter will be skipped on `null` value */
  endsWith?: InputMaybe<ProjectProgressStatusEnum>;
  /** Exact match. Filter will be skipped on `null` value */
  exact?: InputMaybe<ProjectProgressStatusEnum>;
  /** Case-insensitive containment test. Filter will be skipped on `null` value */
  iContains?: InputMaybe<ProjectProgressStatusEnum>;
  /** Case-insensitive ends-with. Filter will be skipped on `null` value */
  iEndsWith?: InputMaybe<ProjectProgressStatusEnum>;
  /** Case-insensitive exact match. Filter will be skipped on `null` value */
  iExact?: InputMaybe<ProjectProgressStatusEnum>;
  /** Case-insensitive regular expression match. Filter will be skipped on `null` value */
  iRegex?: InputMaybe<ProjectProgressStatusEnum>;
  /** Case-insensitive starts-with. Filter will be skipped on `null` value */
  iStartsWith?: InputMaybe<ProjectProgressStatusEnum>;
  /** Exact match of items in a given list. Filter will be skipped on `null` value */
  inList?: InputMaybe<Array<ProjectProgressStatusEnum>>;
  /** Assignment test. Filter will be skipped on `null` value */
  isNull?: InputMaybe<Scalars['Boolean']>;
  /** Case-sensitive regular expression match. Filter will be skipped on `null` value */
  regex?: InputMaybe<ProjectProgressStatusEnum>;
  /** Case-sensitive starts-with. Filter will be skipped on `null` value */
  startsWith?: InputMaybe<ProjectProgressStatusEnum>;
};

export type ProjectRasterTileServerCommonConfig = {
  __typename?: 'ProjectRasterTileServerCommonConfig';
  credits: Scalars['String'];
};

export type ProjectRasterTileServerConfig = {
  __typename?: 'ProjectRasterTileServerConfig';
  bing?: Maybe<ProjectRasterTileServerCommonConfig>;
  custom?: Maybe<ProjectRasterTileServerCustomConfig>;
  esri?: Maybe<ProjectRasterTileServerCommonConfig>;
  esriBeta?: Maybe<ProjectRasterTileServerCommonConfig>;
  mapbox?: Maybe<ProjectRasterTileServerCommonConfig>;
  maxarPremium?: Maybe<ProjectRasterTileServerCommonConfig>;
  maxarStandard?: Maybe<ProjectRasterTileServerCommonConfig>;
  name: RasterTileServerNameEnum;
};

export type ProjectRasterTileServerConfigInput = {
  bing?: InputMaybe<RasterTileServerCommonConfigInput>;
  custom?: InputMaybe<RasterTileServerCustomConfigInput>;
  esri?: InputMaybe<RasterTileServerCommonConfigInput>;
  esriBeta?: InputMaybe<RasterTileServerCommonConfigInput>;
  mapbox?: InputMaybe<RasterTileServerCommonConfigInput>;
  maxarPremium?: InputMaybe<RasterTileServerCommonConfigInput>;
  maxarStandard?: InputMaybe<RasterTileServerCommonConfigInput>;
  name: RasterTileServerNameEnum;
};

export type ProjectRasterTileServerCustomConfig = {
  __typename?: 'ProjectRasterTileServerCustomConfig';
  credits: Scalars['String'];
  maxZoom?: Maybe<Scalars['Int']>;
  minZoom?: Maybe<Scalars['Int']>;
  url: Scalars['String'];
};

export enum ProjectStatusEnum {
  Discarded = 'DISCARDED',
  Draft = 'DRAFT',
  Finished = 'FINISHED',
  Paused = 'PAUSED',
  Processed = 'PROCESSED',
  ProcessingFailed = 'PROCESSING_FAILED',
  Published = 'PUBLISHED',
  PublishingFailed = 'PUBLISHING_FAILED',
  ReadyToProcess = 'READY_TO_PROCESS',
  ReadyToPublish = 'READY_TO_PUBLISH',
  Withdrawn = 'WITHDRAWN'
}

export type ProjectStatusEnumFilterLookup = {
  /** Case-sensitive containment test. Filter will be skipped on `null` value */
  contains?: InputMaybe<ProjectStatusEnum>;
  /** Case-sensitive ends-with. Filter will be skipped on `null` value */
  endsWith?: InputMaybe<ProjectStatusEnum>;
  /** Exact match. Filter will be skipped on `null` value */
  exact?: InputMaybe<ProjectStatusEnum>;
  /** Case-insensitive containment test. Filter will be skipped on `null` value */
  iContains?: InputMaybe<ProjectStatusEnum>;
  /** Case-insensitive ends-with. Filter will be skipped on `null` value */
  iEndsWith?: InputMaybe<ProjectStatusEnum>;
  /** Case-insensitive exact match. Filter will be skipped on `null` value */
  iExact?: InputMaybe<ProjectStatusEnum>;
  /** Case-insensitive regular expression match. Filter will be skipped on `null` value */
  iRegex?: InputMaybe<ProjectStatusEnum>;
  /** Case-insensitive starts-with. Filter will be skipped on `null` value */
  iStartsWith?: InputMaybe<ProjectStatusEnum>;
  /** Exact match of items in a given list. Filter will be skipped on `null` value */
  inList?: InputMaybe<Array<ProjectStatusEnum>>;
  /** Assignment test. Filter will be skipped on `null` value */
  isNull?: InputMaybe<Scalars['Boolean']>;
  /** Case-sensitive regular expression match. Filter will be skipped on `null` value */
  regex?: InputMaybe<ProjectStatusEnum>;
  /** Case-sensitive starts-with. Filter will be skipped on `null` value */
  startsWith?: InputMaybe<ProjectStatusEnum>;
};

/** Model representing the project. */
export type ProjectStatusUpdateInput = {
  clientId: Scalars['String'];
  status?: InputMaybe<ProjectStatusEnum>;
};

/** Model representing the project. */
export type ProjectType = FirebasePushResourceTypeMixin & ProjectExportAssetTypeMixin & UserResourceTypeMixin & {
  __typename?: 'ProjectType';
  /** Provide an optional link to a resource with additional information on the project */
  additionalInfoUrl?: Maybe<Scalars['String']>;
  aoiGeometry?: Maybe<GeometryType>;
  aoiGeometryInputAsset?: Maybe<ProjectAssetType>;
  clientId: Scalars['String'];
  createdAt: Scalars['DateTime'];
  createdBy: UserType;
  description?: Maybe<Scalars['String']>;
  exportAggregatedResults?: Maybe<ProjectAssetType>;
  exportAggregatedResultsWithGeometry?: Maybe<ProjectAssetType>;
  exportAreaOfInterest?: Maybe<ProjectAssetType>;
  exportGroups?: Maybe<ProjectAssetType>;
  exportHistory?: Maybe<ProjectAssetType>;
  exportHotTaskingManagerGeometries?: Maybe<ProjectAssetType>;
  exportModerateToHighAgreementYesMaybeGeometries?: Maybe<ProjectAssetType>;
  exportResults?: Maybe<ProjectAssetType>;
  exportTasks?: Maybe<ProjectAssetType>;
  exportUsers?: Maybe<ProjectAssetType>;
  firebaseId: Scalars['String'];
  /** The latest time when resource was pushed to firebase */
  firebaseLastPushed?: Maybe<Scalars['DateTime']>;
  firebasePushStatus?: Maybe<FirebasePushStatusEnum>;
  /** How big should a mapping session be? Group size refers to the number of tasks per mapping session. */
  groupSize: Scalars['Int'];
  id: Scalars['ID'];
  image?: Maybe<ProjectAssetType>;
  isFeatured: Scalars['Boolean'];
  /** If the project is private, then it is only visible to the team members. */
  isPrivate: Scalars['Boolean'];
  /** Last recent contribution date */
  lastContributionDate?: Maybe<Scalars['Date']>;
  /** What should the users look for (e.g. buildings, cars, trees) */
  lookFor?: Maybe<Scalars['String']>;
  /** How many tasks each user is allowed to work on for this project */
  maxTasksPerUser?: Maybe<Scalars['Int']>;
  modifiedAt: Scalars['DateTime'];
  modifiedBy: UserType;
  /** Project name generated from topic, region, project number, and requesting organization name. */
  name: Scalars['String'];
  /** Number of users who made contributions to this project */
  numberOfContributorUsers: Scalars['Int'];
  /** Number of results contributed to this project */
  numberOfResults: Scalars['Int'];
  /** Number of results contributed to this project that can be used to calculate the progress of this project. Max no. of results per task that can be used to calculate progress is equal to the `verification number` */
  numberOfResultsForProgress: Scalars['Int'];
  oldId?: Maybe<Scalars['String']>;
  processingStatus?: Maybe<ProjectProcessingStatusEnum>;
  /** Percentage of the required contribution that has been completed */
  progress: Scalars['Float'];
  progressStatus: ProjectProgressStatusEnum;
  /** Provide project instruction */
  projectInstruction?: Maybe<Scalars['String']>;
  projectNumber: Scalars['Int'];
  projectType: ProjectTypeEnum;
  projectTypeSpecificOutputAsset?: Maybe<ProjectAssetType>;
  projectTypeSpecifics?: Maybe<CompareProjectPropertyTypeFindProjectPropertyTypeValidateProjectPropertyTypeValidateImageProjectPropertyTypeCompletenessProjectPropertyTypeStreetProjectPropertyTypeLocateProjectPropertyType>;
  region: Scalars['String'];
  /** Which group, institution or community is requesting this project? */
  requestingOrganization: OrganizationType;
  /** Which group, institution or community is requesting this project? */
  requestingOrganizationId: Scalars['ID'];
  requiredResults: Scalars['Int'];
  status: ProjectStatusEnum;
  statusMessage?: Maybe<Scalars['String']>;
  team?: Maybe<ContributorTeamType>;
  topic: Scalars['String'];
  /** @deprecated Use AOI Geometry instead */
  totalArea?: Maybe<Scalars['Float']>;
  /** Tutorial used for this project. */
  tutorial?: Maybe<TutorialType>;
  /** Tutorial used for this project. */
  tutorialId?: Maybe<Scalars['ID']>;
  /** How many people do you want to see every tile before you consider it finished? */
  verificationNumber: Scalars['Int'];
  websiteUrl: Scalars['String'];
};

export type ProjectTypeAreaStatsType = {
  __typename?: 'ProjectTypeAreaStatsType';
  projectType: ProjectTypeEnum;
  projectTypeDisplay: Scalars['String'];
  totalArea: Scalars['AreaSqKm'];
};

export enum ProjectTypeEnum {
  Compare = 'COMPARE',
  Completeness = 'COMPLETENESS',
  Find = 'FIND',
  Locate = 'LOCATE',
  Street = 'STREET',
  Validate = 'VALIDATE',
  ValidateImage = 'VALIDATE_IMAGE'
}

export type ProjectTypeEnumFilterLookup = {
  /** Case-sensitive containment test. Filter will be skipped on `null` value */
  contains?: InputMaybe<ProjectTypeEnum>;
  /** Case-sensitive ends-with. Filter will be skipped on `null` value */
  endsWith?: InputMaybe<ProjectTypeEnum>;
  /** Exact match. Filter will be skipped on `null` value */
  exact?: InputMaybe<ProjectTypeEnum>;
  /** Case-insensitive containment test. Filter will be skipped on `null` value */
  iContains?: InputMaybe<ProjectTypeEnum>;
  /** Case-insensitive ends-with. Filter will be skipped on `null` value */
  iEndsWith?: InputMaybe<ProjectTypeEnum>;
  /** Case-insensitive exact match. Filter will be skipped on `null` value */
  iExact?: InputMaybe<ProjectTypeEnum>;
  /** Case-insensitive regular expression match. Filter will be skipped on `null` value */
  iRegex?: InputMaybe<ProjectTypeEnum>;
  /** Case-insensitive starts-with. Filter will be skipped on `null` value */
  iStartsWith?: InputMaybe<ProjectTypeEnum>;
  /** Exact match of items in a given list. Filter will be skipped on `null` value */
  inList?: InputMaybe<Array<ProjectTypeEnum>>;
  /** Assignment test. Filter will be skipped on `null` value */
  isNull?: InputMaybe<Scalars['Boolean']>;
  /** Case-sensitive regular expression match. Filter will be skipped on `null` value */
  regex?: InputMaybe<ProjectTypeEnum>;
  /** Case-sensitive starts-with. Filter will be skipped on `null` value */
  startsWith?: InputMaybe<ProjectTypeEnum>;
};

export type ProjectTypeMutationResponseType = {
  __typename?: 'ProjectTypeMutationResponseType';
  errors?: Maybe<Scalars['CustomErrorType']>;
  ok: Scalars['Boolean'];
  result?: Maybe<ProjectType>;
};

export type ProjectTypeOffsetPaginated = {
  __typename?: 'ProjectTypeOffsetPaginated';
  pageInfo: OffsetPaginationInfo;
  /** List of paginated results. */
  results: Array<ProjectType>;
  /** Total count of existing results. */
  totalCount: Scalars['Int'];
};

export type ProjectTypeSpecificInput =
  { compare: CompareProjectPropertyInput; completeness?: never; find?: never; locate?: never; street?: never; validate?: never; validateImage?: never; }
  |  { compare?: never; completeness: CompletenessProjectPropertyInput; find?: never; locate?: never; street?: never; validate?: never; validateImage?: never; }
  |  { compare?: never; completeness?: never; find: FindProjectPropertyInput; locate?: never; street?: never; validate?: never; validateImage?: never; }
  |  { compare?: never; completeness?: never; find?: never; locate: LocateProjectPropertyInput; street?: never; validate?: never; validateImage?: never; }
  |  { compare?: never; completeness?: never; find?: never; locate?: never; street: StreetProjectPropertyInput; validate?: never; validateImage?: never; }
  |  { compare?: never; completeness?: never; find?: never; locate?: never; street?: never; validate: ValidateProjectPropertyInput; validateImage?: never; }
  |  { compare?: never; completeness?: never; find?: never; locate?: never; street?: never; validate?: never; validateImage: ValidateImageProjectPropertyInput; };

export type ProjectTypeSwipeStatsType = {
  __typename?: 'ProjectTypeSwipeStatsType';
  projectType: ProjectTypeEnum;
  projectTypeDisplay: Scalars['String'];
  totalSwipes: Scalars['Int'];
};

/** Model representing the project. */
export type ProjectUpdateInput = {
  /** Provide an optional link to a resource with additional information on the project */
  additionalInfoUrl?: InputMaybe<Scalars['String']>;
  clientId: Scalars['String'];
  description?: InputMaybe<Scalars['String']>;
  /** How big should a mapping session be? Group size refers to the number of tasks per mapping session. */
  groupSize?: InputMaybe<Scalars['Int']>;
  image?: InputMaybe<Scalars['ID']>;
  /** What should the users look for (e.g. buildings, cars, trees) */
  lookFor?: InputMaybe<Scalars['String']>;
  /** How many tasks each user is allowed to work on for this project */
  maxTasksPerUser?: InputMaybe<Scalars['Int']>;
  /** Provide project instruction */
  projectInstruction?: InputMaybe<Scalars['String']>;
  projectNumber?: InputMaybe<Scalars['Int']>;
  projectTypeSpecifics?: InputMaybe<ProjectTypeSpecificInput>;
  region?: InputMaybe<Scalars['String']>;
  /** Which group, institution or community is requesting this project? */
  requestingOrganization?: InputMaybe<Scalars['ID']>;
  team?: InputMaybe<Scalars['ID']>;
  topic?: InputMaybe<Scalars['String']>;
  /** Tutorial used for this project. */
  tutorial?: InputMaybe<Scalars['ID']>;
  /** How many people do you want to see every tile before you consider it finished? */
  verificationNumber?: InputMaybe<Scalars['Int']>;
};

export type ProjectVectorTileServerCommonConfig = {
  __typename?: 'ProjectVectorTileServerCommonConfig';
  credits: Scalars['String'];
  sourceLayer: Scalars['String'];
};

export type ProjectVectorTileServerConfig = {
  __typename?: 'ProjectVectorTileServerConfig';
  custom?: Maybe<ProjectVectorTileServerCustomConfig>;
  name: VectorTileServerNameEnum;
  openFreeMap?: Maybe<ProjectVectorTileServerCommonConfig>;
  openStreetMap?: Maybe<ProjectVectorTileServerCommonConfig>;
  versatiles?: Maybe<ProjectVectorTileServerCommonConfig>;
};

export type ProjectVectorTileServerConfigInput = {
  custom?: InputMaybe<VectorTileServerCustomConfigInput>;
  name: VectorTileServerNameEnum;
  openFreeMap?: InputMaybe<VectorTileServerCommonConfigInput>;
  openStreetMap?: InputMaybe<VectorTileServerCommonConfigInput>;
  versatiles?: InputMaybe<VectorTileServerCommonConfigInput>;
};

export type ProjectVectorTileServerCustomConfig = {
  __typename?: 'ProjectVectorTileServerCustomConfig';
  credits: Scalars['String'];
  /** Zoom level from 0 to 22 */
  maxZoom: Scalars['Int'];
  /** Zoom level from 0 to 22 */
  minZoom: Scalars['Int'];
  sourceLayer: Scalars['String'];
  url: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  communityFilteredStats: CommunityFilteredStats;
  communityStats: CommunityStatsType;
  /** Stats from last 30 days. */
  communityStatsLatest: CommunityStatsType;
  communityUserGroupStats: ContributorUserGroupStats;
  communityUserStats: ContributorUserStats;
  contributorTeam: ContributorTeamType;
  contributorTeams: ContributorTeamTypeOffsetPaginated;
  contributorUser: ContributorUserType;
  contributorUserGroup: ContributorUserGroupType;
  contributorUserGroupMembers: ContributorUserGroupMembershipTypeOffsetPaginated;
  contributorUserGroups: ContributorUserGroupTypeOffsetPaginated;
  contributorUsers: ContributorUserTypeOffsetPaginated;
  defaultCustomOptions: Array<CustomOptionType>;
  enums: AppEnumCollection;
  globalExportAsset: GlobalExportAssetType;
  globalExportAssets: Array<GlobalExportAssetType>;
  me?: Maybe<UserMeType>;
  organization: OrganizationType;
  organizations: OrganizationTypeOffsetPaginated;
  project: ProjectType;
  projectAsset: ProjectAssetType;
  projectAssets: ProjectAssetTypeOffsetPaginated;
  projectName: Scalars['String'];
  projects: ProjectTypeOffsetPaginated;
  publicOrganization: OrganizationType;
  publicOrganizations: OrganizationTypeOffsetPaginated;
  publicProject: ProjectType;
  publicProjects: ProjectTypeOffsetPaginated;
  testAoiObjects: TestValidateAoiObjectsResponse;
  testTaskingManagerProject: TestValidateTaskingManagerProjectResponse;
  tileServers: RasterTileServersType;
  tutorial: TutorialType;
  tutorialAsset: TutorialAssetType;
  tutorialAssets: TutorialAssetTypeOffsetPaginated;
  tutorials: TutorialTypeOffsetPaginated;
  users: UserTypeOffsetPaginated;
};


export type QueryCommunityFilteredStatsArgs = {
  dateRange?: InputMaybe<DateRangeInput>;
};


export type QueryCommunityUserGroupStatsArgs = {
  userGroupId: FirebaseOrInternalIdInputType;
};


export type QueryCommunityUserStatsArgs = {
  userId: FirebaseOrInternalIdInputType;
};


export type QueryContributorTeamArgs = {
  id: Scalars['ID'];
};


export type QueryContributorTeamsArgs = {
  filters?: InputMaybe<ContributorTeamFilter>;
  includeAll?: Scalars['Boolean'];
  order?: InputMaybe<ContributorTeamOrder>;
  pagination?: InputMaybe<OffsetPaginationInput>;
};


export type QueryContributorUserArgs = {
  userId: FirebaseOrInternalIdInputType;
};


export type QueryContributorUserGroupArgs = {
  userGroupId: FirebaseOrInternalIdInputType;
};


export type QueryContributorUserGroupMembersArgs = {
  filters?: InputMaybe<ContributorUserGroupMembershipFilter>;
  includeAll?: Scalars['Boolean'];
  order?: InputMaybe<ContributorUserGroupMembershipOrder>;
  pagination?: InputMaybe<OffsetPaginationInput>;
};


export type QueryContributorUserGroupsArgs = {
  filters?: InputMaybe<ContributorUserGroupFilter>;
  includeAll?: Scalars['Boolean'];
  order?: InputMaybe<ContributorUserGroupOrder>;
  pagination?: InputMaybe<OffsetPaginationInput>;
};


export type QueryContributorUsersArgs = {
  filters?: InputMaybe<ContributorUserFilter>;
  order?: InputMaybe<ContributorUserOrder>;
  pagination?: InputMaybe<OffsetPaginationInput>;
};


export type QueryDefaultCustomOptionsArgs = {
  projectType: ProjectTypeEnum;
};


export type QueryGlobalExportAssetArgs = {
  assetType: GlobalExportAssetTypeEnum;
};


export type QueryOrganizationArgs = {
  id: Scalars['ID'];
};


export type QueryOrganizationsArgs = {
  filters?: InputMaybe<OrganizationFilter>;
  includeAll?: Scalars['Boolean'];
  order?: InputMaybe<OrganizationOrder>;
  pagination?: InputMaybe<OffsetPaginationInput>;
};


export type QueryProjectArgs = {
  id: Scalars['ID'];
};


export type QueryProjectAssetArgs = {
  id: Scalars['ID'];
};


export type QueryProjectAssetsArgs = {
  filters?: InputMaybe<ProjectAssetFilter>;
  includeAll?: Scalars['Boolean'];
  order?: InputMaybe<ProjectAssetOrder>;
  pagination?: InputMaybe<OffsetPaginationInput>;
};


export type QueryProjectNameArgs = {
  params?: InputMaybe<ProjectNameInput>;
};


export type QueryProjectsArgs = {
  filters?: InputMaybe<ProjectFilter>;
  includeAll?: Scalars['Boolean'];
  order?: InputMaybe<ProjectOrder>;
  pagination?: InputMaybe<OffsetPaginationInput>;
};


export type QueryPublicOrganizationArgs = {
  id: Scalars['ID'];
};


export type QueryPublicOrganizationsArgs = {
  filters?: InputMaybe<OrganizationFilter>;
  order?: InputMaybe<OrganizationOrder>;
  pagination?: InputMaybe<OffsetPaginationInput>;
};


export type QueryPublicProjectArgs = {
  id: Scalars['ID'];
};


export type QueryPublicProjectsArgs = {
  filters?: InputMaybe<ProjectFilter>;
  order?: InputMaybe<ProjectOrder>;
  pagination?: InputMaybe<OffsetPaginationInput>;
};


export type QueryTestAoiObjectsArgs = {
  assetId: Scalars['ID'];
  ohsomeFilter: Scalars['String'];
  projectId: Scalars['ID'];
};


export type QueryTestTaskingManagerProjectArgs = {
  hotTmId: Scalars['String'];
  ohsomeFilter: Scalars['String'];
};


export type QueryTutorialArgs = {
  id: Scalars['ID'];
};


export type QueryTutorialAssetArgs = {
  id: Scalars['ID'];
};


export type QueryTutorialAssetsArgs = {
  filters?: InputMaybe<TutorialAssetFilter>;
  includeAll?: Scalars['Boolean'];
  order?: InputMaybe<TutorialAssetOrder>;
  pagination?: InputMaybe<OffsetPaginationInput>;
};


export type QueryTutorialsArgs = {
  filters?: InputMaybe<TutorialFilter>;
  includeAll?: Scalars['Boolean'];
  order?: InputMaybe<TutorialOrder>;
  pagination?: InputMaybe<OffsetPaginationInput>;
};


export type QueryUsersArgs = {
  filters?: InputMaybe<UserFilter>;
  order?: InputMaybe<UserOrder>;
  pagination?: InputMaybe<OffsetPaginationInput>;
};

export type RasterTileServerCommonConfigInput = {
  credits: Scalars['String'];
};

export type RasterTileServerCustomConfigInput = {
  credits: Scalars['String'];
  maxZoom?: InputMaybe<Scalars['Int']>;
  minZoom?: InputMaybe<Scalars['Int']>;
  url: Scalars['String'];
};

export enum RasterTileServerNameEnum {
  Bing = 'BING',
  Custom = 'CUSTOM',
  Esri = 'ESRI',
  EsriBeta = 'ESRI_BETA',
  Mapbox = 'MAPBOX',
  MaxarPremium = 'MAXAR_PREMIUM',
  MaxarStandard = 'MAXAR_STANDARD'
}

export type RasterTileServerType = {
  __typename?: 'RasterTileServerType';
  credits: Scalars['String'];
  disabled: Scalars['Boolean'];
  label: Scalars['String'];
  maxZoom?: Maybe<Scalars['Int']>;
  minZoom?: Maybe<Scalars['Int']>;
  type: RasterTileServerNameEnum;
  url: Scalars['String'];
};

export type RasterTileServersType = {
  __typename?: 'RasterTileServersType';
  raster: Array<RasterTileServerType>;
  vector: Array<VectorTileServerType>;
};

export type StrFilterLookup = {
  /** Case-sensitive containment test. Filter will be skipped on `null` value */
  contains?: InputMaybe<Scalars['String']>;
  /** Case-sensitive ends-with. Filter will be skipped on `null` value */
  endsWith?: InputMaybe<Scalars['String']>;
  /** Exact match. Filter will be skipped on `null` value */
  exact?: InputMaybe<Scalars['String']>;
  /** Case-insensitive containment test. Filter will be skipped on `null` value */
  iContains?: InputMaybe<Scalars['String']>;
  /** Case-insensitive ends-with. Filter will be skipped on `null` value */
  iEndsWith?: InputMaybe<Scalars['String']>;
  /** Case-insensitive exact match. Filter will be skipped on `null` value */
  iExact?: InputMaybe<Scalars['String']>;
  /** Case-insensitive regular expression match. Filter will be skipped on `null` value */
  iRegex?: InputMaybe<Scalars['String']>;
  /** Case-insensitive starts-with. Filter will be skipped on `null` value */
  iStartsWith?: InputMaybe<Scalars['String']>;
  /** Exact match of items in a given list. Filter will be skipped on `null` value */
  inList?: InputMaybe<Array<Scalars['String']>>;
  /** Assignment test. Filter will be skipped on `null` value */
  isNull?: InputMaybe<Scalars['Boolean']>;
  /** Case-sensitive regular expression match. Filter will be skipped on `null` value */
  regex?: InputMaybe<Scalars['String']>;
  /** Case-sensitive starts-with. Filter will be skipped on `null` value */
  startsWith?: InputMaybe<Scalars['String']>;
};

export type StreetMapillaryImageFilters = {
  __typename?: 'StreetMapillaryImageFilters';
  creatorId?: Maybe<Scalars['String']>;
  endTime?: Maybe<Scalars['String']>;
  isPano?: Maybe<Scalars['Boolean']>;
  organizationId?: Maybe<Scalars['String']>;
  randomizeOrder: Scalars['Boolean'];
  samplingThreshold?: Maybe<Scalars['Float']>;
  startTime?: Maybe<Scalars['String']>;
};

export type StreetMapillaryImageFiltersInput = {
  creatorId?: InputMaybe<Scalars['String']>;
  endTime?: InputMaybe<Scalars['String']>;
  isPano?: InputMaybe<Scalars['Boolean']>;
  organizationId?: InputMaybe<Scalars['String']>;
  randomizeOrder?: Scalars['Boolean'];
  samplingThreshold?: InputMaybe<Scalars['Float']>;
  startTime?: InputMaybe<Scalars['String']>;
};

export type StreetProjectPropertyInput = {
  /** Numeric value as string */
  aoiGeometry: Scalars['String'];
  customOptions?: InputMaybe<Array<CustomOptionInput>>;
  mapillaryImageFilters: StreetMapillaryImageFiltersInput;
};

export type StreetProjectPropertyType = {
  __typename?: 'StreetProjectPropertyType';
  /** Numeric value as string */
  aoiGeometry: Scalars['String'];
  customOptions?: Maybe<Array<ProjectCustomOption>>;
  mapillaryImageFilters: StreetMapillaryImageFilters;
};

export type StreetTutorialTaskPropertyInput = {
  geometry: Scalars['String'];
  mapillaryImageId: Scalars['String'];
};

export type StreetTutorialTaskPropertyType = {
  __typename?: 'StreetTutorialTaskPropertyType';
  geometry: Scalars['String'];
  mapillaryImageId: Scalars['String'];
};

export enum SubGridSizeEnum {
  Size_2X2 = 'SIZE_2X2',
  Size_4X4 = 'SIZE_4X4',
  Size_8X8 = 'SIZE_8X8'
}

export type TestValidateAoiObjectsResponse = {
  __typename?: 'TestValidateAoiObjectsResponse';
  assetId?: Maybe<Scalars['ID']>;
  error?: Maybe<Scalars['String']>;
  objectCount?: Maybe<Scalars['Int']>;
  ohsomeFilter?: Maybe<Scalars['String']>;
  ok: Scalars['Boolean'];
  projectId?: Maybe<Scalars['ID']>;
};

export type TestValidateTaskingManagerProjectResponse = {
  __typename?: 'TestValidateTaskingManagerProjectResponse';
  error?: Maybe<Scalars['String']>;
  hotTmId?: Maybe<Scalars['String']>;
  objectCount?: Maybe<Scalars['Int']>;
  ohsomeFilter?: Maybe<Scalars['String']>;
  ok: Scalars['Boolean'];
};

/** Model representing assets for a tutorial. */
export type TutorialAssetCreateInput = {
  clientId: Scalars['String'];
  /** The file associated with the asset */
  file: Scalars['Upload'];
  inputType: TutorialAssetInputTypeEnum;
  tutorial: Scalars['ID'];
};

/** Model representing assets for a tutorial. */
export type TutorialAssetFilter = {
  AND?: InputMaybe<TutorialAssetFilter>;
  DISTINCT?: InputMaybe<Scalars['Boolean']>;
  NOT?: InputMaybe<TutorialAssetFilter>;
  OR?: InputMaybe<TutorialAssetFilter>;
  id?: InputMaybe<IdBaseFilterLookup>;
  mimetype?: InputMaybe<AssetMimetypeEnumFilterLookup>;
  tutorialId?: InputMaybe<IdBaseFilterLookup>;
  type?: InputMaybe<AssetTypeEnumFilterLookup>;
};

export enum TutorialAssetInputTypeEnum {
  InformationBlockImage = 'INFORMATION_BLOCK_IMAGE'
}

export type TutorialAssetOrder = {
  id?: InputMaybe<Ordering>;
};

/** Model representing assets for a tutorial. */
export type TutorialAssetType = UserResourceTypeMixin & {
  __typename?: 'TutorialAssetType';
  clientId: Scalars['String'];
  createdAt: Scalars['DateTime'];
  createdBy: UserType;
  /** The file associated with the asset */
  file: MapswipeDjangoFileType;
  /** The size of the file in bytes */
  fileSize: Scalars['Int'];
  id: Scalars['ID'];
  inputType?: Maybe<TutorialAssetInputTypeEnum>;
  /** If this flag is enabled, this asset will be deleted in the future */
  markedAsDeleted: Scalars['Boolean'];
  mimetype?: Maybe<AssetMimetypeEnum>;
  modifiedAt: Scalars['DateTime'];
  modifiedBy: UserType;
  tutorialId: Scalars['ID'];
  type: AssetTypeEnum;
};

export type TutorialAssetTypeMutationResponseType = {
  __typename?: 'TutorialAssetTypeMutationResponseType';
  errors?: Maybe<Scalars['CustomErrorType']>;
  ok: Scalars['Boolean'];
  result?: Maybe<TutorialAssetType>;
};

export type TutorialAssetTypeOffsetPaginated = {
  __typename?: 'TutorialAssetTypeOffsetPaginated';
  pageInfo: OffsetPaginationInfo;
  /** List of paginated results. */
  results: Array<TutorialAssetType>;
  /** Total count of existing results. */
  totalCount: Scalars['Int'];
};

/**
 * Model representing a tutorial associated with a specific project.
 *
 * Tutorial guides users through the process of contributing to a project.
 * It includes instructions, and examples to help users understand how to complete tasks.
 */
export type TutorialCreateInput = {
  clientId: Scalars['String'];
  name: Scalars['String'];
  /** Project this tutorial is referring to. */
  project: Scalars['ID'];
};

/**
 * Model representing a tutorial associated with a specific project.
 *
 * Tutorial guides users through the process of contributing to a project.
 * It includes instructions, and examples to help users understand how to complete tasks.
 */
export type TutorialFilter = {
  AND?: InputMaybe<TutorialFilter>;
  DISTINCT?: InputMaybe<Scalars['Boolean']>;
  NOT?: InputMaybe<TutorialFilter>;
  OR?: InputMaybe<TutorialFilter>;
  createdById?: InputMaybe<IdBaseFilterLookup>;
  id?: InputMaybe<IdBaseFilterLookup>;
  name?: InputMaybe<Scalars['String']>;
  /** Project this tutorial is referring to. */
  project?: InputMaybe<ProjectFilter>;
  status?: InputMaybe<TutorialStatusEnumFilterLookup>;
};

/** Model representing a text or image block in the information page. */
export type TutorialInformationPageBlockCreateInput = {
  blockNumber: Scalars['Int'];
  blockType: TutorialInformationPageBlockTypeEnum;
  clientId: Scalars['String'];
  image?: InputMaybe<Scalars['ID']>;
  text?: InputMaybe<Scalars['String']>;
};

export type TutorialInformationPageBlockInput = {
  create?: InputMaybe<TutorialInformationPageBlockCreateInput>;
  delete?: InputMaybe<DeleteInput>;
  update?: InputMaybe<TutorialInformationPageBlockUpdateInput>;
};

/** Model representing a text or image block in the information page. */
export type TutorialInformationPageBlockType = UserResourceTypeMixin & {
  __typename?: 'TutorialInformationPageBlockType';
  blockNumber: Scalars['Int'];
  blockType: TutorialInformationPageBlockTypeEnum;
  clientId: Scalars['String'];
  createdAt: Scalars['DateTime'];
  createdBy: UserType;
  id: Scalars['ID'];
  image?: Maybe<TutorialAssetType>;
  imageId?: Maybe<Scalars['ID']>;
  modifiedAt: Scalars['DateTime'];
  modifiedBy: UserType;
  pageId: Scalars['ID'];
  text?: Maybe<Scalars['String']>;
};

export enum TutorialInformationPageBlockTypeEnum {
  Image = 'IMAGE',
  Text = 'TEXT'
}

/** Model representing a text or image block in the information page. */
export type TutorialInformationPageBlockUpdateInput = {
  blockNumber?: InputMaybe<Scalars['Int']>;
  blockType?: InputMaybe<TutorialInformationPageBlockTypeEnum>;
  clientId: Scalars['String'];
  id: Scalars['ID'];
  image?: InputMaybe<Scalars['ID']>;
  text?: InputMaybe<Scalars['String']>;
};

/** Model representing a information page in the tutorial. */
export type TutorialInformationPageCreateInput = {
  blocks: Array<TutorialInformationPageBlockCreateInput>;
  clientId: Scalars['String'];
  pageNumber: Scalars['Int'];
  title: Scalars['String'];
};

export type TutorialInformationPageInput = {
  create?: InputMaybe<TutorialInformationPageCreateInput>;
  delete?: InputMaybe<DeleteInput>;
  update?: InputMaybe<TutorialInformationPageUpdateInput>;
};

/** Model representing a information page in the tutorial. */
export type TutorialInformationPageType = UserResourceTypeMixin & {
  __typename?: 'TutorialInformationPageType';
  blocks: Array<TutorialInformationPageBlockType>;
  clientId: Scalars['String'];
  createdAt: Scalars['DateTime'];
  createdBy: UserType;
  id: Scalars['ID'];
  modifiedAt: Scalars['DateTime'];
  modifiedBy: UserType;
  pageNumber: Scalars['Int'];
  title: Scalars['String'];
  tutorialId: Scalars['ID'];
};

/** Model representing a information page in the tutorial. */
export type TutorialInformationPageUpdateInput = {
  blocks?: InputMaybe<Array<TutorialInformationPageBlockInput>>;
  clientId: Scalars['String'];
  id: Scalars['ID'];
  pageNumber?: InputMaybe<Scalars['Int']>;
  title?: InputMaybe<Scalars['String']>;
};

export type TutorialOrder = {
  id?: InputMaybe<Ordering>;
  name?: InputMaybe<Ordering>;
};

/** Model representing a scenario in the tutorial. */
export type TutorialScenarioPageCreateInput = {
  clientId: Scalars['String'];
  hintDescription: Scalars['String'];
  hintIcon: IconEnum;
  hintTitle: Scalars['String'];
  instructionsDescription: Scalars['String'];
  instructionsIcon: IconEnum;
  instructionsTitle: Scalars['String'];
  scenarioPageNumber: Scalars['Int'];
  successDescription: Scalars['String'];
  successIcon: IconEnum;
  successTitle: Scalars['String'];
  tasks: Array<TutorialTaskCreateInput>;
};

/** Model representing a individual task in the scenario. */
export type TutorialScenarioPageInput = {
  create?: InputMaybe<TutorialScenarioPageCreateInput>;
  delete?: InputMaybe<DeleteInput>;
  update?: InputMaybe<TutorialScenarioPageUpdateInput>;
};

/** Model representing a scenario in the tutorial. */
export type TutorialScenarioPageType = UserResourceTypeMixin & {
  __typename?: 'TutorialScenarioPageType';
  clientId: Scalars['String'];
  createdAt: Scalars['DateTime'];
  createdBy: UserType;
  hintDescription: Scalars['String'];
  hintIcon: IconEnum;
  hintTitle: Scalars['String'];
  id: Scalars['ID'];
  instructionsDescription: Scalars['String'];
  instructionsIcon: IconEnum;
  instructionsTitle: Scalars['String'];
  modifiedAt: Scalars['DateTime'];
  modifiedBy: UserType;
  scenarioPageNumber: Scalars['Int'];
  successDescription: Scalars['String'];
  successIcon: IconEnum;
  successTitle: Scalars['String'];
  tasks: Array<TutorialTaskType>;
  tutorialId: Scalars['ID'];
};

/** Model representing a scenario in the tutorial. */
export type TutorialScenarioPageUpdateInput = {
  clientId: Scalars['String'];
  hintDescription?: InputMaybe<Scalars['String']>;
  hintIcon?: InputMaybe<IconEnum>;
  hintTitle?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  instructionsDescription?: InputMaybe<Scalars['String']>;
  instructionsIcon?: InputMaybe<IconEnum>;
  instructionsTitle?: InputMaybe<Scalars['String']>;
  scenarioPageNumber?: InputMaybe<Scalars['Int']>;
  successDescription?: InputMaybe<Scalars['String']>;
  successIcon?: InputMaybe<IconEnum>;
  successTitle?: InputMaybe<Scalars['String']>;
  tasks?: InputMaybe<Array<TutorialTaskInput>>;
};

export enum TutorialStatusEnum {
  Archived = 'ARCHIVED',
  Discarded = 'DISCARDED',
  Draft = 'DRAFT',
  Published = 'PUBLISHED',
  PublishingFailed = 'PUBLISHING_FAILED',
  ReadyToPublish = 'READY_TO_PUBLISH'
}

export type TutorialStatusEnumFilterLookup = {
  /** Case-sensitive containment test. Filter will be skipped on `null` value */
  contains?: InputMaybe<TutorialStatusEnum>;
  /** Case-sensitive ends-with. Filter will be skipped on `null` value */
  endsWith?: InputMaybe<TutorialStatusEnum>;
  /** Exact match. Filter will be skipped on `null` value */
  exact?: InputMaybe<TutorialStatusEnum>;
  /** Case-insensitive containment test. Filter will be skipped on `null` value */
  iContains?: InputMaybe<TutorialStatusEnum>;
  /** Case-insensitive ends-with. Filter will be skipped on `null` value */
  iEndsWith?: InputMaybe<TutorialStatusEnum>;
  /** Case-insensitive exact match. Filter will be skipped on `null` value */
  iExact?: InputMaybe<TutorialStatusEnum>;
  /** Case-insensitive regular expression match. Filter will be skipped on `null` value */
  iRegex?: InputMaybe<TutorialStatusEnum>;
  /** Case-insensitive starts-with. Filter will be skipped on `null` value */
  iStartsWith?: InputMaybe<TutorialStatusEnum>;
  /** Exact match of items in a given list. Filter will be skipped on `null` value */
  inList?: InputMaybe<Array<TutorialStatusEnum>>;
  /** Assignment test. Filter will be skipped on `null` value */
  isNull?: InputMaybe<Scalars['Boolean']>;
  /** Case-sensitive regular expression match. Filter will be skipped on `null` value */
  regex?: InputMaybe<TutorialStatusEnum>;
  /** Case-sensitive starts-with. Filter will be skipped on `null` value */
  startsWith?: InputMaybe<TutorialStatusEnum>;
};

/**
 * Model representing a tutorial associated with a specific project.
 *
 * Tutorial guides users through the process of contributing to a project.
 * It includes instructions, and examples to help users understand how to complete tasks.
 */
export type TutorialStatusUpdateInput = {
  clientId: Scalars['String'];
  status?: InputMaybe<TutorialStatusEnum>;
};

/** Model representing a individual task in the scenario. */
export type TutorialTaskCreateInput = {
  clientId: Scalars['String'];
  projectTypeSpecifics: TutorialTaskProjectTypeSpecificInput;
  reference: Scalars['Int'];
  taskPartitionIndex?: InputMaybe<Scalars['Int']>;
};

export type TutorialTaskInput = {
  create?: InputMaybe<TutorialTaskCreateInput>;
  delete?: InputMaybe<DeleteInput>;
  update?: InputMaybe<TutorialTaskUpdateInput>;
};

export type TutorialTaskProjectTypeSpecificInput =
  { compare: CompareTutorialTaskPropertyInput; completeness?: never; find?: never; locate?: never; street?: never; validate?: never; validateImage?: never; }
  |  { compare?: never; completeness: CompletenessTutorialTaskPropertyInput; find?: never; locate?: never; street?: never; validate?: never; validateImage?: never; }
  |  { compare?: never; completeness?: never; find: FindTutorialTaskPropertyInput; locate?: never; street?: never; validate?: never; validateImage?: never; }
  |  { compare?: never; completeness?: never; find?: never; locate: LocateTutorialTaskPropertyInput; street?: never; validate?: never; validateImage?: never; }
  |  { compare?: never; completeness?: never; find?: never; locate?: never; street: StreetTutorialTaskPropertyInput; validate?: never; validateImage?: never; }
  |  { compare?: never; completeness?: never; find?: never; locate?: never; street?: never; validate: ValidateTutorialTaskPropertyInput; validateImage?: never; }
  |  { compare?: never; completeness?: never; find?: never; locate?: never; street?: never; validate?: never; validateImage: ValidateImageTutorialTaskPropertyInput; };

/** Model representing a individual task in the scenario. */
export type TutorialTaskType = UserResourceTypeMixin & {
  __typename?: 'TutorialTaskType';
  clientId: Scalars['String'];
  createdAt: Scalars['DateTime'];
  createdBy: UserType;
  id: Scalars['ID'];
  modifiedAt: Scalars['DateTime'];
  modifiedBy: UserType;
  projectTypeSpecifics?: Maybe<CompareTutorialTaskPropertyTypeFindTutorialTaskPropertyTypeValidateTutorialTaskPropertyTypeValidateImageTutorialTaskPropertyTypeCompletenessTutorialTaskPropertyTypeStreetTutorialTaskPropertyTypeLocateTutorialTaskPropertyType>;
  reference: Scalars['Int'];
  scenarioId: Scalars['ID'];
  taskPartitionIndex?: Maybe<Scalars['Int']>;
};

/** Model representing a individual task in the scenario. */
export type TutorialTaskUpdateInput = {
  clientId: Scalars['String'];
  id: Scalars['ID'];
  projectTypeSpecifics: TutorialTaskProjectTypeSpecificInput;
  reference?: InputMaybe<Scalars['Int']>;
  taskPartitionIndex?: InputMaybe<Scalars['Int']>;
};

/**
 * Model representing a tutorial associated with a specific project.
 *
 * Tutorial guides users through the process of contributing to a project.
 * It includes instructions, and examples to help users understand how to complete tasks.
 */
export type TutorialType = FirebasePushResourceTypeMixin & UserResourceTypeMixin & {
  __typename?: 'TutorialType';
  clientId: Scalars['String'];
  createdAt: Scalars['DateTime'];
  createdBy: UserType;
  firebaseId: Scalars['String'];
  /** The latest time when resource was pushed to firebase */
  firebaseLastPushed?: Maybe<Scalars['DateTime']>;
  firebasePushStatus?: Maybe<FirebasePushStatusEnum>;
  id: Scalars['ID'];
  informationPages: Array<TutorialInformationPageType>;
  modifiedAt: Scalars['DateTime'];
  modifiedBy: UserType;
  name: Scalars['String'];
  /** Project this tutorial is referring to. */
  project: ProjectType;
  /** Project this tutorial is referring to. */
  projectId: Scalars['ID'];
  scenarios: Array<TutorialScenarioPageType>;
  status: TutorialStatusEnum;
  statusMessage?: Maybe<Scalars['String']>;
};

export type TutorialTypeMutationResponseType = {
  __typename?: 'TutorialTypeMutationResponseType';
  errors?: Maybe<Scalars['CustomErrorType']>;
  ok: Scalars['Boolean'];
  result?: Maybe<TutorialType>;
};

export type TutorialTypeOffsetPaginated = {
  __typename?: 'TutorialTypeOffsetPaginated';
  pageInfo: OffsetPaginationInfo;
  /** List of paginated results. */
  results: Array<TutorialType>;
  /** Total count of existing results. */
  totalCount: Scalars['Int'];
};

/**
 * Model representing a tutorial associated with a specific project.
 *
 * Tutorial guides users through the process of contributing to a project.
 * It includes instructions, and examples to help users understand how to complete tasks.
 */
export type TutorialUpdateInput = {
  clientId: Scalars['String'];
  informationPages?: InputMaybe<Array<TutorialInformationPageInput>>;
  name?: InputMaybe<Scalars['String']>;
  scenarios?: InputMaybe<Array<TutorialScenarioPageInput>>;
};

export type UpdateContributorUserGroupPayload = ContributorUserGroupTypeMutationResponseType | OperationInfo;

export type UpdateOrganizationPayload = OperationInfo | OrganizationTypeMutationResponseType;

export type UpdateProcessedProjectPayload = OperationInfo | ProjectTypeMutationResponseType;

export type UpdateProjectPayload = OperationInfo | ProjectTypeMutationResponseType;

export type UpdateProjectStatusPayload = OperationInfo | ProjectTypeMutationResponseType;

export type UpdateTutorialPayload = OperationInfo | TutorialTypeMutationResponseType;

export type UpdateTutorialStatusPayload = OperationInfo | TutorialTypeMutationResponseType;

/**
 * Custom user model with email as unique identifier.
 *
 * The user is linked to a contributor user, which holds user information synced from firebase.
 * This mapping is essential to integrate Firebase authentication this system.
 * Additionally, the mapping ensures that data created or updated in this system
 * can be accurately synchronized back to Firebase with the correct user association.
 */
export type UserFilter = {
  AND?: InputMaybe<UserFilter>;
  DISTINCT?: InputMaybe<Scalars['Boolean']>;
  NOT?: InputMaybe<UserFilter>;
  OR?: InputMaybe<UserFilter>;
  /** The Contributor user associated with this User. This will also be used for authentication using firebase. */
  contributorUser?: InputMaybe<ContributorUserFilter>;
  displayName?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<IdBaseFilterLookup>;
  search?: InputMaybe<Scalars['String']>;
};

/**
 * Custom user model with email as unique identifier.
 *
 * The user is linked to a contributor user, which holds user information synced from firebase.
 * This mapping is essential to integrate Firebase authentication this system.
 * Additionally, the mapping ensures that data created or updated in this system
 * can be accurately synchronized back to Firebase with the correct user association.
 */
export type UserMeType = {
  __typename?: 'UserMeType';
  anonymizedEmail: Scalars['String'];
  /** The Contributor user associated with this User. This will also be used for authentication using firebase. */
  contributorUser?: Maybe<ContributorUserType>;
  displayName: Scalars['String'];
  email: Scalars['String'];
  firstName: Scalars['String'];
  id: Scalars['ID'];
  lastName: Scalars['String'];
};

export type UserOrder = {
  displayName?: InputMaybe<Ordering>;
  id?: InputMaybe<Ordering>;
};

export type UserResourceTypeMixin = {
  clientId: Scalars['String'];
  createdAt: Scalars['DateTime'];
  createdBy: UserType;
  modifiedAt: Scalars['DateTime'];
  modifiedBy: UserType;
};

/**
 * Custom user model with email as unique identifier.
 *
 * The user is linked to a contributor user, which holds user information synced from firebase.
 * This mapping is essential to integrate Firebase authentication this system.
 * Additionally, the mapping ensures that data created or updated in this system
 * can be accurately synchronized back to Firebase with the correct user association.
 */
export type UserType = {
  __typename?: 'UserType';
  anonymizedEmail: Scalars['String'];
  /** The Contributor user associated with this User. This will also be used for authentication using firebase. */
  contributorUser?: Maybe<ContributorUserType>;
  displayName: Scalars['String'];
  firstName: Scalars['String'];
  id: Scalars['ID'];
  lastName: Scalars['String'];
};

export type UserTypeOffsetPaginated = {
  __typename?: 'UserTypeOffsetPaginated';
  pageInfo: OffsetPaginationInfo;
  /** List of paginated results. */
  results: Array<UserType>;
  /** Total count of existing results. */
  totalCount: Scalars['Int'];
};

export type ValidateImageProjectPropertyInput = {
  customOptions?: InputMaybe<Array<CustomOptionInput>>;
  sourceType: ValidateImageSourceTypeEnum;
};

export type ValidateImageProjectPropertyType = {
  __typename?: 'ValidateImageProjectPropertyType';
  customOptions?: Maybe<Array<ProjectCustomOption>>;
  sourceType: ValidateImageSourceTypeEnum;
};

export enum ValidateImageSourceTypeEnum {
  DatasetFile = 'DATASET_FILE',
  DirectImages = 'DIRECT_IMAGES'
}

export type ValidateImageTutorialTaskPropertyInput = {
  annotation?: InputMaybe<ObjectImageAnnotationInput>;
  fileName: Scalars['String'];
  height?: InputMaybe<Scalars['Int']>;
  imageId?: InputMaybe<Scalars['String']>;
  url: Scalars['String'];
  width?: InputMaybe<Scalars['Int']>;
};

export type ValidateImageTutorialTaskPropertyType = {
  __typename?: 'ValidateImageTutorialTaskPropertyType';
  annotation?: Maybe<ObjectImageAnnotationType>;
  fileName: Scalars['String'];
  height?: Maybe<Scalars['Int']>;
  imageId?: Maybe<Scalars['String']>;
  url: Scalars['String'];
  width?: Maybe<Scalars['Int']>;
};

export type ValidateObjectSourceConfig = {
  __typename?: 'ValidateObjectSourceConfig';
  aoiGeometry?: Maybe<Scalars['String']>;
  objectGeojsonUrl?: Maybe<Scalars['String']>;
  ohsomeFilter?: Maybe<Scalars['String']>;
  sourceType: ValidateObjectSourceTypeEnum;
  taskingManagerProjectId?: Maybe<Scalars['String']>;
};

export type ValidateObjectSourceConfigInput = {
  aoiGeometry?: InputMaybe<Scalars['String']>;
  objectGeojsonUrl?: InputMaybe<Scalars['String']>;
  ohsomeFilter?: InputMaybe<Scalars['String']>;
  sourceType: ValidateObjectSourceTypeEnum;
  taskingManagerProjectId?: InputMaybe<Scalars['String']>;
};

export enum ValidateObjectSourceTypeEnum {
  AoiGeojsonFile = 'AOI_GEOJSON_FILE',
  ObjectGeojsonUrl = 'OBJECT_GEOJSON_URL',
  TaskingManager = 'TASKING_MANAGER'
}

export type ValidateProjectPropertyInput = {
  customOptions?: InputMaybe<Array<CustomOptionInput>>;
  objectSource: ValidateObjectSourceConfigInput;
  tileServerProperty: ProjectRasterTileServerConfigInput;
};

export type ValidateProjectPropertyType = {
  __typename?: 'ValidateProjectPropertyType';
  customOptions?: Maybe<Array<ProjectCustomOption>>;
  objectSource: ValidateObjectSourceConfig;
  tileServerProperty: ProjectRasterTileServerConfig;
};

export type ValidateTutorialTaskPropertyInput = {
  identifier: Scalars['Int'];
  objectGeometry: Scalars['String'];
};

export type ValidateTutorialTaskPropertyType = {
  __typename?: 'ValidateTutorialTaskPropertyType';
  identifier: Scalars['Int'];
  objectGeometry: Scalars['String'];
};

export type VectorTileServerCommonConfigInput = {
  credits: Scalars['String'];
  sourceLayer: Scalars['String'];
};

export type VectorTileServerCustomConfigInput = {
  credits: Scalars['String'];
  /** Zoom level from 0 to 22 */
  maxZoom: Scalars['Int'];
  /** Zoom level from 0 to 22 */
  minZoom: Scalars['Int'];
  sourceLayer: Scalars['String'];
  url: Scalars['String'];
};

export enum VectorTileServerNameEnum {
  Custom = 'CUSTOM',
  OpenFreeMap = 'OPEN_FREE_MAP',
  OpenStreetMap = 'OPEN_STREET_MAP',
  Versatiles = 'VERSATILES'
}

export type VectorTileServerType = {
  __typename?: 'VectorTileServerType';
  credits: Scalars['String'];
  label: Scalars['String'];
  layers: Array<Scalars['String']>;
  maxZoom?: Maybe<Scalars['Int']>;
  minZoom?: Maybe<Scalars['Int']>;
  type: VectorTileServerNameEnum;
  url: Scalars['String'];
};

export type AllDataQueryVariables = Exact<{ [key: string]: never; }>;


export type AllDataQuery = { __typename?: 'Query', publicProjects: { __typename?: 'ProjectTypeOffsetPaginated', totalCount: number, results: Array<{ __typename?: 'ProjectType', id: string, name: string, firebaseId: string, description?: string | null, progress: number, status: ProjectStatusEnum, projectType: ProjectTypeEnum, createdAt: any, modifiedAt: any, region: string, requestingOrganizationId: string, numberOfContributorUsers: number, totalArea?: number | null, exportAggregatedResultsWithGeometry?: { __typename?: 'ProjectAssetType', id: string, fileSize: number, mimetype?: AssetMimetypeEnum | null, file?: { __typename?: 'MapswipeDjangoFileType', name: string, url: string } | null } | null, exportAggregatedResults?: { __typename?: 'ProjectAssetType', id: string, fileSize: number, mimetype?: AssetMimetypeEnum | null, file?: { __typename?: 'MapswipeDjangoFileType', name: string, url: string } | null } | null, exportAreaOfInterest?: { __typename?: 'ProjectAssetType', id: string, fileSize: number, mimetype?: AssetMimetypeEnum | null, file?: { __typename?: 'MapswipeDjangoFileType', name: string, url: string } | null } | null, exportGroups?: { __typename?: 'ProjectAssetType', id: string, fileSize: number, mimetype?: AssetMimetypeEnum | null, file?: { __typename?: 'MapswipeDjangoFileType', name: string, url: string } | null } | null, exportHistory?: { __typename?: 'ProjectAssetType', id: string, fileSize: number, mimetype?: AssetMimetypeEnum | null, modifiedAt: any, file?: { __typename?: 'MapswipeDjangoFileType', name: string, url: string } | null } | null, exportResults?: { __typename?: 'ProjectAssetType', id: string, fileSize: number, mimetype?: AssetMimetypeEnum | null, file?: { __typename?: 'MapswipeDjangoFileType', name: string, url: string } | null } | null, exportTasks?: { __typename?: 'ProjectAssetType', id: string, fileSize: number, mimetype?: AssetMimetypeEnum | null, file?: { __typename?: 'MapswipeDjangoFileType', name: string, url: string } | null } | null, exportUsers?: { __typename?: 'ProjectAssetType', id: string, mimetype?: AssetMimetypeEnum | null, fileSize: number, file?: { __typename?: 'MapswipeDjangoFileType', url: string, name: string } | null } | null, exportHotTaskingManagerGeometries?: { __typename?: 'ProjectAssetType', id: string, mimetype?: AssetMimetypeEnum | null, fileSize: number, file?: { __typename?: 'MapswipeDjangoFileType', url: string, name: string } | null } | null, exportModerateToHighAgreementYesMaybeGeometries?: { __typename?: 'ProjectAssetType', id: string, mimetype?: AssetMimetypeEnum | null, fileSize: number, file?: { __typename?: 'MapswipeDjangoFileType', url: string, name: string } | null } | null, image?: { __typename?: 'ProjectAssetType', id: string, createdAt: any, file?: { __typename?: 'MapswipeDjangoFileType', name: string, url: string } | null } | null, requestingOrganization: { __typename?: 'OrganizationType', id: string, name: string, modifiedAt: any }, aoiGeometry?: { __typename?: 'GeometryType', centroid?: any | null, id: string, totalArea?: number | null, bbox?: any | null } | null, aoiGeometryInputAsset?: { __typename?: 'ProjectAssetType', id: string, fileSize: number, mimetype?: AssetMimetypeEnum | null, file?: { __typename?: 'MapswipeDjangoFileType', name: string, url: string } | null } | null }> }, communityStats: { __typename?: 'CommunityStatsType', id: string, totalContributors: number, totalUserGroups: number, totalSwipes: number }, publicOrganizations: { __typename?: 'OrganizationTypeOffsetPaginated', results: Array<{ __typename?: 'OrganizationType', id: string, name: string }> }, globalExportAssets: Array<{ __typename?: 'GlobalExportAssetType', type: GlobalExportAssetTypeEnum, lastUpdatedAt: any, fileSize: number, file?: { __typename?: 'MapswipeDjangoFileType', url: string, name: string } | null }> };

export type EnumsQueryVariables = Exact<{ [key: string]: never; }>;


export type EnumsQuery = { __typename?: 'Query', enums: { __typename?: 'AppEnumCollection', ProjectTypeEnum: Array<{ __typename?: 'AppEnumCollectionProjectTypeEnum', key: ProjectTypeEnum, label: string }>, ProjectStatusEnum: Array<{ __typename?: 'AppEnumCollectionProjectStatusEnum', key: ProjectStatusEnum, label: string }> } };
