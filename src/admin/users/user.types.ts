export type UserOverviewTableCol =
	| 'id'
	| 'first_name'
	| 'last_name'
	| 'mail'
	| 'user_group'
	| 'business_category'
	| 'is_exception'
	| 'is_blocked'
	| 'blocked_at'
	| 'unblocked_at'
	| 'stamboek'
	| 'organisation'
	| 'created_at'
	| 'education_levels'
	| 'subjects'
	| 'idps'
	| 'educational_organisations'
	| 'last_access_at'
	| 'temp_access'
	| 'temp_access_from'
	| 'temp_access_until';

export type UserBulkAction = 'block' | 'unblock' | 'delete' | 'change_subjects' | 'export';
