import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export interface ImageHistoryRecord {
  id: string;
  user_id: string;
  timestamp: number;
  prompt: string;
  result_image: string;
  original_image?: string;
  type: 'generation' | 'edit';
  created_at?: string;
}

export async function saveImageHistory(record: Omit<ImageHistoryRecord, 'created_at'>): Promise<void> {
  await sql`
    INSERT INTO image_history (id, user_id, timestamp, prompt, result_image, original_image, type)
    VALUES (${record.id}, ${record.user_id}, ${record.timestamp}, ${record.prompt}, ${record.result_image}, ${record.original_image || null}, ${record.type})
  `;
}

export async function getImageHistory(userId: string): Promise<ImageHistoryRecord[]> {
  const records = await sql`
    SELECT id, user_id, timestamp, prompt, result_image, original_image, type
    FROM image_history
    WHERE user_id = ${userId}
    ORDER BY timestamp DESC
  `;
  return records as ImageHistoryRecord[];
}

export async function deleteImageHistory(userId: string): Promise<void> {
  await sql`
    DELETE FROM image_history
    WHERE user_id = ${userId}
  `;
}

export async function deleteImageHistoryItem(userId: string, itemId: string): Promise<void> {
  await sql`
    DELETE FROM image_history
    WHERE user_id = ${userId} AND id = ${itemId}
  `;
}