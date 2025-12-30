import { NextRequest, NextResponse } from 'next/server';

// 所有常量必须放在最上面，函数前面
const BASE_URL = 'https://openrouter.ai/api/v1';

export async function POST(request: NextRequest) {
  // 在函数内部读取环境变量
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  // 检查 key 是否存在
  if (!OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: 'Missing OpenRouter API Key – please add it in Vercel Environment Variables' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { prompt, aspectRatio, resolution, features } = body;

    // 模型选择（推荐默认用这个快而便宜，想 Pro 版改下面那行）
    const model = 'google/gemini-2.5-flash-image-preview';
    // const model = 'google/gemini-3-pro-image-preview'; // Pro 版更高清，支持 4K

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

    const base64Image = images[0];

    return NextResponse.json({ image: base64Image });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
