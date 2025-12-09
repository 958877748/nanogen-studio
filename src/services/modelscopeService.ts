interface ModelScopeResponse {
  images: Array<{ url: string }>;
  request_id: string;
}

// ModelScope API配置
const MODELSCOPE_API_KEY = process.env.MODELSCOPE_API_KEY;
const MODELSCOPE_API_URL = 'https://api-inference.modelscope.cn/v1/images/generations';
const MODEL_NAME = 'Tongyi-MAI/Z-Image-Turbo';

/**
 * 从文本提示生成图片（同步模式）
 */
export const generateImage = async (prompt: string, size: string = '1024x1024'): Promise<string | null> => {
  try {
    const response = await fetch(MODELSCOPE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MODELSCOPE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: prompt,
        size: size,
        // 不加 X-ModelScope-Async-Mode 头即为同步模式
      }),
    });

    if (!response.ok) {
      throw new Error(`ModelScope API error: ${response.status} ${response.statusText}`);
    }

    const data: ModelScopeResponse = await response.json();

    if (data.images && data.images.length > 0) {
      // 返回图片URL
      return data.images[0].url;
    }

    return null;
  } catch (error) {
    console.error("ModelScope API Error:", error);
    throw error;
  }
};

/**
 * 编辑图片（ModelScope API不直接支持图片编辑，这里提供一个模拟实现）
 * 实际使用时，可以将图片URL和编辑提示结合，生成新的图片
 */
export const editImage = async (prompt: string, imageUrl: string): Promise<string | null> => {
  try {
    // 由于ModelScope API主要是文本到图像生成，不支持直接的图片编辑
    // 我们可以将原图片的描述或特征融入新的提示词中
    const enhancedPrompt = `基于原图片风格或内容: ${prompt}`;

    // 调用生成函数创建新图片
    return await generateImage(enhancedPrompt);
  } catch (error) {
    console.error("ModelScope Edit Error:", error);
    throw error;
  }
};

/**
 * 统一的图片生成/编辑函数
 */
export const generateOrEditImage = async (
  prompt: string,
  imageUrl?: string,
  size: string = '1024x1024'
): Promise<{ image: string | null; text: string | null }> => {
  try {
    let outputImage: string | null = null;
    let outputText: string | null = null;

    if (imageUrl) {
      // 如果有输入图片，尝试编辑（实际上是生成带有参考的新图片）
      outputImage = await editImage(prompt, imageUrl);
      outputText = `基于参考图片生成: ${prompt}`;
    } else {
      // 纯文本生成
      outputImage = await generateImage(prompt, size);
      outputText = prompt;
    }

    return { image: outputImage, text: outputText };

  } catch (error) {
    console.error("ModelScope API Error:", error);
    throw error;
  }
};

/**
 * 获取不同尺寸的图片生成时间预估
 */
export const getEstimatedGenerationTime = (size: string): number => {
  switch (size) {
    case '256x256':
      return 7;
    case '512x512':
      return 7;
    case '720x1280':
      return 10;
    case '1024x1024':
      return 14;
    default:
      return 14;
  }
};