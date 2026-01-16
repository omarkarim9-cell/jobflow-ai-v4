import type { Job } from '../app-types';
import { JobStatus } from '../app-types';
import { neon } from '@neondatabase/serverless';
import { verifyToken } from '@clerk/backend';

type NextApiRequest = any;
type NextApiResponse = any;

const CLERK_JWT_KEY = process.env.CLERK_JWT_KEY!;
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY!;

let sqlSingleton: ReturnType<typeof neon> | null = null;
function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }
  if (!sqlSingleton) {
    sqlSingleton = neon(process.env.DATABASE_URL);
  }
  return sqlSingleton;
}

async function getUserIdFromRequest(req: NextApiRequest): Promise<string | null> {
  const authHeader = req.headers.authorization as string | string[] | undefined;
  const header = Array.isArray(authHeader) ? authHeader[0] : authHeader;

  if (!header || !header.startsWith('Bearer ')) {
    console.error('[JOBS] Missing or invalid Authorization header');
    return null;
  }

  const token = header.substring(7);

  try {
    const verified = await verifyToken(token, {
      jwtKey: CLERK_JWT_KEY,
      secretKey: CLERK_SECRET_KEY,
    });

    const userId = (verified as any).sub || (verified as any).userId || (verified as any).userid || null;
    if (!userId) {
      console.error('[JOBS] No userId in verified token payload');
      return null;
    }

    return userId;
  } catch (err) {
    console.error('[JOBS] Clerk verifyToken failed', err);
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization,Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('[JOBS] HANDLER START, method:', req.method);

  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const sql = getSql();

    // ✅ GET - Fix FullQueryResults<boolean> error
    if (req.method === 'GET') {
      const rawResult = await sql`
        SELECT id, userid, title, company, description, status, source,
               applicationurl, customresume, coverletter, matchscore, data,
               createdat, updatedat
        FROM jobs WHERE userid = ${userId} ORDER BY createdat DESC
      `;

      // ✅ Fix: Handle FullQueryResults + convert to array
      const result = Array.isArray(rawResult) ? rawResult : (rawResult as any).rows || [];

      const jobs: Job[] = result.map((job: any) => {
        const data = typeof job.data === 'string' ? JSON.parse(job.data) : (job.data || {});
        return {
          id: job.id || '',
          title: job.title || '',
          company: job.company || '',
          location: (data as any).location || '',
          salaryRange: (data as any).salaryRange || null,
          description: job.description || '',
          source: job.source || 'Manual',
          detectedAt: job.createdat || '',
          status: (job.status as JobStatus) || 'detected',
          matchScore: job.matchscore ?? 0,
          requirements: (data as any).requirements || null,
          notes: (data as any).notes || null,
          logoUrl: (data as any).logoUrl || null,
          applicationUrl: job.applicationurl || null,
          customizedResume: job.customresume || null,
          coverLetter: job.coverletter || null,
          dateApplied: job.createdat || '',
        };
      });

      return res.status(200).json({ jobs });
    }

    // ✅ POST - Fix FullQueryResults<boolean> error
    if (req.method === 'POST') {
      let body: any;
      try {
        body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      } catch {
        return res.status(400).json({ error: 'Invalid JSON' });
      }

      if (!body || !body.id) {
        return res.status(400).json({ error: 'Invalid Job payload' });
      }

      const jobData = JSON.stringify({
        location: body.location,
        salaryRange: body.salaryRange,
        requirements: body.requirements,
        notes: body.notes,
        logoUrl: body.logoUrl,
      });

      const rawResult = await sql`
        INSERT INTO jobs (id, userid, title, company, description, status, source,
                         applicationurl, customresume, coverletter, matchscore, data,
                         createdat, updatedat)
        VALUES (${body.id}, ${userId}, ${body.title}, ${body.company},
                ${body.description}, ${body.status || 'detected'},
                ${body.source || 'Manual'}, ${body.applicationUrl || null},
                ${body.customizedResume || null}, ${body.coverLetter || null},
                ${body.matchScore ?? 0}, ${jobData}, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title, company = EXCLUDED.company,
          description = EXCLUDED.description, status = EXCLUDED.status,
          customresume = EXCLUDED.customresume, coverletter = EXCLUDED.coverletter,
          data = EXCLUDED.data, updatedat = NOW()
        RETURNING id, userid, title, company, description, status, source,
                  applicationurl, customresume, coverletter, matchscore, data,
                  createdat, updatedat
      `;

      // ✅ Fix: Handle FullQueryResults + convert to array
      const result = Array.isArray(rawResult) ? rawResult : (rawResult as any).rows || [];
      const job = result[0];
      if (!job) {
        return res.status(500).json({ error: 'Insert failed' });
      }

      const data = typeof job.data === 'string' ? JSON.parse(job.data) : (job.data || {});
      const savedJob: Job = {
        id: job.id || '',
        title: job.title || '',
        company: job.company || '',
        location: (data as any).location || '',
        salaryRange: (data as any).salaryRange || null,
        description: job.description || '',
        source: job.source || 'Manual',
        detectedAt: job.createdat || '',
        status: (job.status as JobStatus) || 'detected',
        matchScore: job.matchscore ?? 0,
        requirements: (data as any).requirements || null,
        notes: (data as any).notes || null,
        logoUrl: (data as any).logoUrl || null,
        applicationUrl: job.applicationurl || null,
        customizedResume: job.customresume || null,
        coverLetter: job.coverletter || null,
        dateApplied: job.createdat || '',
      };

      return res.status(200).json({ success: true, job: savedJob });
    }

    // DELETE
    if (req.method === 'DELETE') {
      const jobId = req.query.id as string;
      if (!jobId) {
        return res.status(400).json({ error: 'Missing Job ID' });
      }

      await sql`DELETE FROM jobs WHERE id = ${jobId} AND userid = ${userId}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('[JOBS] Error:', err?.message || err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
