import { NextApiRequest, NextApiResponse } from 'next';
import { getBodyPositions, generateFallbackPositions } from '../astronomy';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const positions = await getBodyPositions();
    return res.status(200).json(positions);
  } catch (error) {
    console.error('Error fetching positions:', error);
    // Return fallback positions if API fails
    const fallbackPositions = generateFallbackPositions();
    return res.status(200).json(fallbackPositions);
  }
} 