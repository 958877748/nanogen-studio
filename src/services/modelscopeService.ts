type MessageRole = 'system' | 'user' | 'assistant';

interface ModelScopeResponse {
  images: Array<{ url: string }>;
  request_id: string;
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: MessageRole;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ModelScope API配置
const MODELSCOPE_API_KEY = process.env.MODELSCOPE_API_KEY;
const MODELSCOPE_BASE_URL = 'https://api-inference.modelscope.cn/v1';
const MODELSCOPE_IMAGE_API_URL = `${MODELSCOPE_BASE_URL}/images/generations`;
const MODELSCOPE_CHAT_API_URL = `${MODELSCOPE_BASE_URL}/chat/completions`;
const IMAGE_GENERATE_MODEL_NAME = 'Qwen/Qwen-Image';
const IMAGE_EDIT_MODEL_NAME = 'Qwen/Qwen-Image-Edit-2511';
const TEXT_MODEL_NAME = 'Qwen/Qwen3-235B-A22B-Instruct-2507';

/**
 * 从文本提示生成图片
 */
export const generateImage = async (prompt: string, size: string = '1024x1024'): Promise<string | null> => {
  try {
    const response = await fetch(MODELSCOPE_IMAGE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MODELSCOPE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: IMAGE_GENERATE_MODEL_NAME,
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
    const response = await fetch(MODELSCOPE_IMAGE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MODELSCOPE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: IMAGE_EDIT_MODEL_NAME,
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

/**
 * 生成文本回复
 */
export const generateText = async (messages: Array<{ role: MessageRole; content: string }>): Promise<string> => {
  try {
    const response = await fetch(MODELSCOPE_CHAT_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MODELSCOPE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: TEXT_MODEL_NAME,
        messages: messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`ModelScope API error: ${response.status} ${response.statusText}`);
    }

    const data: ChatCompletionResponse = await response.json();

    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      return data.choices[0].message.content;
    }

    throw new Error('No text generated from ModelScope API');
  } catch (error) {
    console.error("ModelScope API Error:", error);
    throw error;
  }
};