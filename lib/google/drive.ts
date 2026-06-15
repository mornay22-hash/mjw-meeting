import { google } from 'googleapis'

export async function saveMinutesToDrive(
  accessToken: string,
  meetingTitle: string,
  meetingDate: string,
  content: string
): Promise<string> {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: accessToken })

  const drive = google.drive({ version: 'v3', auth })

  const year = new Date(meetingDate).getFullYear().toString()
  const dateSlug = new Date(meetingDate).toISOString().split('T')[0]
  const folderName = `${dateSlug} — ${meetingTitle}`

  // Find or create root folder
  const rootId = await findOrCreateFolder(drive, 'MJW Meeting OS', null)
  const yearId = await findOrCreateFolder(drive, year, rootId)
  const meetingFolderId = await findOrCreateFolder(drive, folderName, yearId)

  // Save minutes as plain text (PDF export can be added later)
  const file = await drive.files.create({
    requestBody: {
      name: 'minutes.txt',
      parents: [meetingFolderId],
      mimeType: 'text/plain',
    },
    media: {
      mimeType: 'text/plain',
      body: content,
    },
    fields: 'id',
  })

  return file.data.id || ''
}

async function findOrCreateFolder(
  drive: ReturnType<typeof google.drive>,
  name: string,
  parentId: string | null
): Promise<string> {
  const query = parentId
    ? `name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`
    : `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`

  const existing = await drive.files.list({ q: query, fields: 'files(id)' })
  if (existing.data.files && existing.data.files.length > 0) {
    return existing.data.files[0].id!
  }

  const created = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      ...(parentId ? { parents: [parentId] } : {}),
    },
    fields: 'id',
  })
  return created.data.id!
}
