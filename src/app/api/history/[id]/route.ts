import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { deleteImageHistoryItem } from '@/lib/db';

// DELETE - 删除单个历史记录
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const itemId = params.id;
    await deleteImageHistoryItem(user.id, itemId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting history item:', error);
    return NextResponse.json({ error: 'Failed to delete history item' }, { status: 500 });
  }
}