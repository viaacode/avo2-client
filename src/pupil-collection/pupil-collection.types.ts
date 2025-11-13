import { type ACTIONS_TABLE_COLUMN_ID } from '../shared/helpers/table-column-list-to-csv-column-list';

export type PupilCollectionOverviewTableColumns =
  | 'title'
  | 'pupil'
  | 'assignmentTitle'
  | 'teacher'
  | 'created_at'
  | 'updated_at'
  | 'deadline_at'
  | 'status'
  | typeof ACTIONS_TABLE_COLUMN_ID
