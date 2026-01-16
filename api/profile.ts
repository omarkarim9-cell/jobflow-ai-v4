import postgres from 'postgres';
import type { UserProfile, Job, JobStatus } from '../app-types';

type NextApiRequest = any;
type NextApiResponse = any;

const sql = postgres(process.env.DATABASE_URL as string, { ssl: 'require' });

interface ProfileRow {
  id: number;
  clerk_user_id: string;
  full_name: string;
  email: string;
  phone: string;
  resume_content: string;
  resume_file_name: string;
  preferences: any;
  connected_accounts: any;
  plan: string;
  daily_ai_credits: number;
  total_ai_used: number;
  updated_at: Date;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,X-Clerk-User-Id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('[PROFILE] HANDLER START, method:', req.method);

  try {
    const userId = req.headers['x-clerk-user-id'] as string || req.body?.data?.id || req.body?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: missing user id' });
    }

    // GET - COMPLETE UserProfile
    if (req.method === 'GET') {
      const rawResult = await sql`
        SELECT id, clerk_user_id, full_name, email, phone, resume_content, 
               resume_file_name, preferences, connected_accounts, plan, 
               daily_ai_credits, total_ai_used, updated_at
        FROM profiles 
        WHERE clerk_user_id = ${userId}
        LIMIT 1
      `;

      const rows = Array.isArray(rawResult) ? rawResult : (rawResult as any).rows || [];
      
      if (!rows.length) {
        const emptyProfile: UserProfile = {
          id: userId,
          email: '',
          phone: '',
          location: '',
          summary: ''
        };
        return res.status(200).json(emptyProfile);
      }

      const row = rows[0];
      const profile: UserProfile = {
        id: row.clerk_user_id,
        email: row.email || '',
        phone: row.phone || '',
        location: row.full_name || '',
        summary: row.resume_content || ''
      };

      return res.status(200).json(profile);
    }

    // POST - COMPLETE UserProfile
    if (req.method === 'POST') {
      let body: any;
      try {
        body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      } catch {
        return res.status(400).json({ error: 'Invalid JSON' });
      }

      const clerkUserId = req.headers['x-clerk-user-id'] as string || body.data?.id || body.id;

      console.log('🔍 WEBHOOK DATA:', { clerkUserId });

      const rawResult = await sql`
        INSERT INTO profiles (
          clerk_user_id, full_name, email, phone, resume_content, resume_file_name,
          preferences, connected_accounts, plan, daily_ai_credits, total_ai_used, updated_at
        )
        VALUES (
          ${clerkUserId}, ${body.location || ''}, ${body.email || ''}, ${body.phone || ''}, 
          ${body.summary || ''}, '', ${JSON.stringify({})}::jsonb, ${JSON.stringify([])}::jsonb, 
          'free', 0, 0, NOW()
        )
        ON CONFLICT (clerk_user_id) DO UPDATE SET
          full_name = EXCLUDED.full_name, email = EXCLUDED.email, phone = EXCLUDED.phone,
          resume_content = EXCLUDED.resume_content, resume_file_name = EXCLUDED.resume_file_name,
          preferences = EXCLUDED.preferences, connected_accounts = EXCLUDED.connected_accounts,
          plan = EXCLUDED.plan, daily_ai_credits = EXCLUDED.daily_ai_credits,
          total_ai_used = EXCLUDED.total_ai_used, updated_at = NOW()
        RETURNING *
      `;

      const rows = Array.isArray(rawResult) ? rawResult : (rawResult as any).rows || [];
      const row = rows[0] || { clerk_user_id: clerkUserId, email: '', phone: '', full_name: '', resume_content: '' };

      const saved: UserProfile = {
        id: row.clerk_user_id,
        email: row.email || body.email || '',
        phone: row.phone || body.phone || '',
        location: row.full_name || body.location || '',
        summary: row.resume_content || body.summary || ''
      };

      return res.status(200).json(saved);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('[PROFILE] Error:', err?.message || err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
