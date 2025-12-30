import { NextRequest, NextResponse } from 'next/server';

// 把这里换成你的 OpenRouter API Key（从 https://openrouter.ai/keys 获取）
//const OPENROUTER_API_KEY = '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';



const BASE_URL = 'https://openrouter.ai/api/v1';

export async function POST(request: NextRequest) {

  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  return NextResponse.json(
    { error: 'Missing OpenRouter API Key in environment variables' },
    { status: 500 }
  );
}
  
  try {
    const body = await request.json();
    const { prompt, aspectRatio, resolution, features } = body;  // 项目前端传的参数（prompt、aspectRatio 等）

    // 选择模型（推荐这些）
    const model = 'google/gemini-2.5-flash-image-preview';  // 普通 Nano Banana（快、便宜）
    // const model = 'google/gemini-2.5-flash-image';         // 稳定版
    // const model = 'google/gemini-3-pro-image-preview';    // Nano Banana Pro（质量更高，支持 2K/4K）

    // 组合最终提示词（项目有 features 预设风格，这里简单拼接）
    const finalPrompt = features ? `${features.join(', ')}, ${prompt}` : prompt;

    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        // 可选：加这些让 OpenRouter 统计更好
        // 'HTTP-Referer': 'https://your-vercel-app.vercel.app',
        // 'X-Title': 'My Nano Banana Panel',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: finalPrompt }],
        modalities: ['image', 'text'],  // 关键：请求图像输出
        // 分辨率和比例控制（Gemini 支持）
        image_config: {
          // aspect_ratio 示例: "1:1", "16:9", "9:16", "4:3", "3:4"
          aspect_ratio: aspectRatio || '1:1',
          // image_size 支持 "1K", "2K", "4K"（Pro 版更好）
          image_size: resolution || '1K',  // 如 "1024x1024" 或 "2K"
        },
        // 可选：生成多张（max_images: 4）
        // max_images: 1,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: `OpenRouter API error: ${error}` }, { status: 500 });
    }

    const data = await response.json();

    // OpenRouter 返回图像在 message.images 数组里（base64 data URL）
    const images = data.choices[0]?.message?.images || [];
    if (images.length === 0) {
      return NextResponse.json({ error: 'No image generated' }, { status: 500 });
    }

    // 返回第一张（或多张，根据项目前端支持）
    const base64Image = images[0];  // 如 "data:image/png;base64,xxxx"

    return NextResponse.json({ image: base64Image });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
