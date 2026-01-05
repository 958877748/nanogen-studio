type MessageRole = 'system' | 'user' | 'assistant';

interface ModelScopeTaskResponse {
  task_status: string;
  task_id: string;
  request_id: string;
}

interface ModelScopeTaskResult {
  task_status: string;
  output_images: string[];
  request_id: string;
  time_taken?: number;
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
const MODELSCOPE_TASK_API_URL = `${MODELSCOPE_BASE_URL}/tasks`;
const MODELSCOPE_CHAT_API_URL = `${MODELSCOPE_BASE_URL}/chat/completions`;
const IMAGE_GENERATE_MODEL_NAME = 'Qwen/Qwen-Image-2512';
const IMAGE_EDIT_MODEL_NAME = 'Qwen/Qwen-Image-Edit-2511';
const TEXT_MODEL_NAME = 'Qwen/Qwen3-235B-A22B-Instruct-2507';

/**
 * 轮询查询任务状态
 */
const pollTaskStatus = async (taskId: string): Promise<string | null> => {
  const maxAttempts = 30; // 最多轮询30次
  const pollInterval = 2000; // 每2秒查询一次

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(`${MODELSCOPE_TASK_API_URL}/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${MODELSCOPE_API_KEY}`,
          'X-ModelScope-Task-Type': 'image_generation',
        },
      });

      if (!response.ok) {
        console.error(`Failed to check task status: ${response.status}`);
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        continue;
      }

      const data: ModelScopeTaskResult = await response.json();

      if (data.task_status === 'SUCCEED') {
        if (data.output_images && data.output_images.length > 0) {
          return data.output_images[0];
        }
        return null;
      } else if (data.task_status === 'FAILED') {
        throw new Error('Image generation task failed');
      }

      // 任务仍在进行中，等待后继续轮询
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    } catch (error) {
      console.error('Error polling task status:', error);
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }

  throw new Error('Task timeout after maximum attempts');
};

/**
 * 从文本提示生成图片
 */
export const generateImage = async (prompt: string, size: string = '1024x1024'): Promise<string | null> => {
  try {
    console.log('Submitting image generation task...', { prompt, size });

    const response = await fetch(MODELSCOPE_IMAGE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MODELSCOPE_API_KEY}`,
        'Content-Type': 'application/json',
        'X-ModelScope-Async-Mode': 'true',
      },
      body: JSON.stringify({
        model: IMAGE_GENERATE_MODEL_NAME,
        prompt: prompt,
        size: size,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ModelScope API Error Details:', errorText);
      throw new Error(`ModelScope API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data: ModelScopeTaskResponse = await response.json();
    console.log('Task submitted:', data);

    if (data.task_id) {
      // 轮询查询任务状态
      const imageUrl = await pollTaskStatus(data.task_id);
      console.log('Image generated:', imageUrl);
      return imageUrl;
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
    console.log('Submitting image edit task...', { prompt, imageUrl });

    const response = await fetch(MODELSCOPE_IMAGE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MODELSCOPE_API_KEY}`,
        'Content-Type': 'application/json',
        'X-ModelScope-Async-Mode': 'true',
      },
      body: JSON.stringify({
        model: IMAGE_EDIT_MODEL_NAME,
        prompt: prompt,
        image_url: imageUrl,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ModelScope API Error Details:', errorText);
      throw new Error(`ModelScope API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data: ModelScopeTaskResponse = await response.json();
    console.log('Task submitted:', data);

    if (data.task_id) {
      // 轮询查询任务状态
      const resultImageUrl = await pollTaskStatus(data.task_id);
      console.log('Image edited:', resultImageUrl);
      return resultImageUrl;
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