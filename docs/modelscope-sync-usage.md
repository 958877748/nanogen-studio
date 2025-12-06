# ModelScope API 同步生成模式

## 核心发现
ModelScope API 支持**真正的同步生成**，无需轮询。

## 使用方法

### 同步模式（推荐）
```http
POST /v1/images/generations
Authorization: Bearer {api_key}
Content-Type: application/json

{
  "model": "Tongyi-MAI/Z-Image-Turbo",
  "prompt": "图像描述文本",
  "size": "1024x1024"
}
```

**响应**：
```json
{
  "images": [{"url": "https://muse-ai.oss-cn-hangzhou.aliyuncs.com/img/xxx.png"}],
  "request_id": "xxx"
}
```

### 异步模式
添加请求头：`X-ModelScope-Async-Mode: true`

## 性能数据
- **256x256**: ~7秒
- **512x512**: ~7秒
- **1024x1024**: ~14秒

## 结论
不加 `X-ModelScope-Async-Mode` 头即可实现同步生成，代码更简单直接。