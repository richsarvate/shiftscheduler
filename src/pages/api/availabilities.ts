import { NextApiRequest, NextApiResponse } from 'next';
import { getAvailabilities } from '@/lib/googleSheets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await getAvailabilities();
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
