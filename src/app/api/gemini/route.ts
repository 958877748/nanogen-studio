import { NextRequest, NextResponse } from 'next/server'
import { generateImage, editImage } from '@/services/geminiService'

export async function POST(request: NextRequest) {
  try {
    const { prompt, image, type } = await request.json()

    if (type === 'edit' && image) {
      const result = await editImage(prompt, image)
      return NextResponse.json({ image: result })
    } else {
      const result = await generateImage(prompt)
      return NextResponse.json({ image: result })
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: '图像生成失败' },
      { status: 500 }
    )
  }
}