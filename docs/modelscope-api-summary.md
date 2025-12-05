# ModelScope API 使用总结

## 基本信息
- **API提供商**: ModelScope (魔搭社区)
- **基础URL**: `https://api-inference.modelscope.cn`
- **认证方式**: Bearer Token
- **模型**: `Tongyi-MAI/Z-Image-Turbo`

## API调用流程

### 1. 提交图像生成任务
```
POST /v1/images/generations
```

**请求头:**
```
Authorization: Bearer {api_key}
Content-Type: application/json
X-ModelScope-Async-Mode: true
```

**请求体:**
```json
{
  "model": "Tongyi-MAI/Z-Image-Turbo",
  "prompt": "图像描述文本",
  "size": "1024x1024"  // 可选，默认为1024x1024
}
```

**尺寸参数说明:**
- **格式**: `"widthxheight"` (例如: `"512x512"`, `"800x600"`)
- **最小尺寸**: 64x64
- **最大尺寸**: 1440x1440
- **默认值**: 1024x1024
- **约束**: 超出范围的尺寸会被自动限制到有效范围内

**响应示例:**
```json
{
  "task_status": "SUCCEED",
  "task_id": "4003503",
  "request_id": "008fbe10-7ba2-48e4-a031-932ce8d9cc23"
}
```

### 2. 查询任务状态
```
GET /v1/tasks/{task_id}
```

**请求头:**
```
Authorization: Bearer {api_key}
X-ModelScope-Task-Type: image_generation
```

**响应示例:**
```json
{
  "input": {
    "guidanceScale": 7.5,
    "height": 1280,
    "negativePrompt": "",
    "numInferenceSteps": 30,
    "prompt": "A golden cat sitting on a windowsill",
    "sampler": "Euler a",
    "seed": 212259417,
    "timeTaken": 5412.925481796265,
    "weight": 0
  },
  "output_images": [
    "https://muse-ai.oss-cn-hangzhou.aliyuncs.com/img/a8a4a129f825419ba01c97eccd9d4fef.jpeg"
  ],
  "request_id": "824ddc0a-b4c5-4671-87c8-88ad2ec2d07e",
  "task_status": "SUCCEED",
  "time_taken": 5412.925481796265
}
```

## 重要发现

### 1. 任务状态变化
- **初始响应**: 任务创建时立即返回 `task_status: "SUCCEED"`
- **实际状态**: 需要通过轮询获取真实状态
- **状态值**: `PENDING` → `SUCCEED` 或 `FAILED`

### 2. 生成参数
- **guidanceScale**: 7.5 (控制生成质量)
- **height**: 根据size参数变化 (64-1440)
- **numInferenceSteps**: 30 (推理步数)
- **sampler**: "Euler a" (采样器类型)
- **timeTaken**: 随尺寸增加而增加 (1-12秒)

### 3. 尺寸参数验证
- **有效范围**: 64x64 到 1440x1440
- **边界约束**: 超出范围自动限制到边界值
- **自定义比例**: 支持非正方形尺寸 (如800x600)
- **生成时间**: 随尺寸增加而显著增加
  - 64x64: ~1秒
  - 256x256: ~1.2秒
  - 512x512: ~1.7秒
  - 1024x1024: ~5.8秒
  - 1440x1440: ~12秒

### 3. 图像输出
- **格式**: JPEG
- **存储**: Aliyun OSS
- **URL**: 临时有效，需要及时下载
- **文件大小**: 约90KB (测试图像)

### 4. 响应时间
- **任务提交**: 立即响应
- **生成时间**: 约5-6秒
- **状态查询间隔**: 建议5秒
- **总耗时**: 约10-15秒

## 使用建议

### 1. 错误处理
- 检查HTTP状态码
- 验证响应数据结构
- 处理网络超时
- 实现重试机制

### 2. 性能优化
- 使用异步模式
- 合理设置轮询间隔
- 实现并发控制
- 缓存生成的图像

### 3. 成本控制
- 监控API调用次数
- 实现请求限流
- 复用成功的生成结果
- 优化提示词质量

## 代码实现要点

### 1. 异步处理
```javascript
// 使用Promise处理异步请求
const response = await makeRequest(url, options, data);
```

### 2. 状态轮询
```javascript
while (taskStatus === 'PENDING') {
    await new Promise(resolve => setTimeout(resolve, 5000));
    // 查询状态...
}
```

### 3. 图像下载
```javascript
const client = url.startsWith('https') ? https : http;
client.get(url, (response) => {
    // 处理下载...
});
```

## 测试验证

✅ **测试成功**:
- API认证正常
- 任务提交流程正确
- 状态轮询有效
- 图像生成成功
- 文件下载完整

📊 **测试数据**:
- 任务ID: 4003503
- 生成时间: 5.4秒
- 图像URL: https://muse-ai.oss-cn-hangzhou.aliyuncs.com/img/a8a4a129f825419ba01c97eccd9d4fef.jpeg
- 文件大小: 90.5KB

## 尺寸参数测试结果

✅ **尺寸范围验证**:
- 64x64 (最小尺寸): ✅ 成功，文件大小 5.3KB
- 256x256: ✅ 成功，文件大小 77KB
- 512x512: ✅ 成功，文件大小 457KB
- 800x600 (自定义比例): ✅ 成功，文件大小 405KB
- 1024x1024: ✅ 成功，文件大小 1.25MB
- 1440x1440 (最大尺寸): ✅ 成功，文件大小 2.5MB
- 2000x2000 (超出最大值): ✅ 被限制为1440x1440，文件大小 2.2MB
- 30x30 (低于最小值): ✅ 被限制为64x64，文件大小 5.3KB

### 尺寸对性能的影响
- **小尺寸** (64x64): ~1秒生成时间
- **中等尺寸** (512x512): ~1.7秒生成时间
- **大尺寸** (1024x1024): ~5.8秒生成时间
- **最大尺寸** (1440x1440): ~12秒生成时间

## 注意事项

1. **API密钥安全**: 不要在代码中硬编码API密钥
2. **错误重试**: 实现适当的重试机制
3. **并发限制**: 避免过多的并发请求
4. **图像存储**: 及时下载和保存生成的图像
5. **URL有效期**: 生成的图像URL可能有过期时间