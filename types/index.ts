export type MeetingStatus = 'pre' | 'live' | 'post' | 'archived'

export interface Meeting {
  id: string
  user_id: string
  title: string
  meeting_date: string
  attendees: string[]
  duration_mins: number | null
  calendar_event_id: string | null
  status: MeetingStatus
  created_at: string
  updated_at: string
}

export interface Transcript {
  id: string
  meeting_id: string
  user_id: string
  source: 'mic' | 'import'
  raw_text: string
  storage_path: string | null
  created_at: string
}

export interface ActionItem {
  item: string
  owner: string
  due_date: string
}

export interface Minutes {
  id: string
  meeting_id: string
  user_id: string
  agenda: string | null
  discussion: string | null
  decisions: string | null
  actions: ActionItem[] | null
  next_steps: string | null
  full_draft: string | null
  sent_at: string | null
  sent_to: string[] | null
  drive_file_id: string | null
  created_at: string
  updated_at: string
}

export interface Brief {
  id: string
  meeting_id: string
  user_id: string
  context_summary: string | null
  agenda_draft: string | null
  past_actions: ActionItem[] | null
  created_at: string
}

export interface BriefJSON {
  context_summary: string
  agenda_draft: string[]
  questions_to_raise: string[]
  watch_points: string[]
}

export interface MinutesJSON {
  agenda: string
  discussion: string
  decisions: string[]
  actions: ActionItem[]
  next_steps: string[]
}
