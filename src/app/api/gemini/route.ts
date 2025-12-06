import { NextRequest, NextResponse } from 'next/server'
import { generateImage, editImage } from '@/services/modelscopeService'

export async function POST(request: NextRequest) {
  try {
    const { prompt, image, type, size } = await request.json()

    if (type === 'edit' && image) {
      const result = await editImage(prompt, image)
      return NextResponse.json({ image: result })
    } else {
      // 支持指定尺寸，默认为1024x1024
      const imageSize = size || '1024x1024'
      const result = await generateImage(prompt, imageSize)
      return NextResponse.json({ image: result })
    }
  } catch (error) {
    console.error('ModelScope API Error:', error)
    return NextResponse.json(
      { error: '图像生成失败' },
      { status: 500 }
    )
  }
}