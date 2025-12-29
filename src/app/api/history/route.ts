import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { saveImageHistory, getImageHistory, deleteImageHistory } from '@/lib/db';
import { HistoryItem } from '@/types';

// GET - 获取用户的历史记录
export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const records = await getImageHistory(user.id);
    
    // 转换为 HistoryItem 格式
    const history: HistoryItem[] = records.map(record => ({
      id: record.id,
      timestamp: record.timestamp,
      prompt: record.prompt,
      resultImage: record.result_image,
      originalImage: record.original_image || undefined,
      type: record.type
    }));

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

// POST - 保存新的历史记录
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const item: HistoryItem = await request.json();

    await saveImageHistory({
      id: item.id,
      user_id: user.id,
      timestamp: item.timestamp,
      prompt: item.prompt,
      result_image: item.resultImage,
      original_image: item.originalImage,
      type: item.type
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving history:', error);
    return NextResponse.json({ error: 'Failed to save history' }, { status: 500 });
  }
}

// DELETE - 删除用户的所有历史记录
export async function DELETE() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteImageHistory(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting history:', error);
    return NextResponse.json({ error: 'Failed to delete history' }, { status: 500 });
  }
}