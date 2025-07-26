import { google } from 'googleapis';

export async function getAvailabilities() {
  const credentials = JSON.parse(
    Buffer.from(process.env.GOOGLE_SHEETS_JSON_BASE64!, 'base64').toString('utf-8')
  );

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    range: 'Avails!A1:Z1000', // You can rename this to match your tab
  });

  return res.data.values;
}
