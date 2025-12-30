import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://openrouter.ai/api/v1';

export async function POST(request: NextRequest) {
  // 使用 Vercel 环境变量读取 OpenRouter API Key
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  // 如果环境变量里没有 key，直接返回错误（部署时会提醒你）
  if (!OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: 'Missing OpenRouter API Key – please add it in Vercel Environment Variables' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { prompt, aspectRatio, resolution, features } = body;

    // 这里可以根据需要切换模型
    const model = 'google/gemini-2.5-flash-image-preview';
    // 如果想用 Pro 版（更高清、支持 4K），取消下面这行的注释：
    // const model = 'google/gemini-3-pro-image-preview';

    // 拼接预设风格（features 是项目里那些卡片传过来的数组）
    const finalPrompt = features ? `${features.join(', ')}, ${prompt}` : prompt;

    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: finalPrompt }],
        modalities: ['image', 'text'],
        image_config: {
          aspect_ratio: aspectRatio || '1:1',
          image_size: resolution || '1K',
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: `OpenRouter API error: ${error}` }, { status: 500 });
    }

    const data = await response.json();
    const images = data.choices[0]?.message?.images || [];

    if (images.length === 0) {
      return NextResponse.json({ error: 'No image generated' }, { status: 500 });
    }

    const base64Image = images[0]; // 返回第一张图的 base64

    return NextResponse.json({ image: base64Image });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
