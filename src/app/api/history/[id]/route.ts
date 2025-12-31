import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { deleteImageHistoryItem } from '@/lib/db';

// DELETE - 删除单个历史记录
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: itemId } = await params;
    await deleteImageHistoryItem(userId, itemId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting history item:', error);
    return NextResponse.json({ error: 'Failed to delete history item' }, { status: 500 });
  }
}