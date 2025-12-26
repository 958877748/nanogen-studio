interface ModelScopeResponse {
  images: Array<{ url: string }>;
  request_id: string;
}

// ModelScope API配置
const MODELSCOPE_API_KEY = process.env.MODELSCOPE_API_KEY;
const MODELSCOPE_API_URL = 'https://api-inference.modelscope.cn/v1/images/generations';
const MODEL_NAME = 'Tongyi-MAI/Z-Image-Turbo';
const EDIT_MODEL_NAME = 'Qwen/Qwen-Image-Edit-2511';

/**
 * 从文本提示生成图片
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
 * 编辑图片
 */
export const editImage = async (prompt: string, imageUrl: string): Promise<string | null> => {
  try {
    const response = await fetch(MODELSCOPE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MODELSCOPE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: EDIT_MODEL_NAME,
        prompt: prompt,
        image_url: imageUrl,
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
