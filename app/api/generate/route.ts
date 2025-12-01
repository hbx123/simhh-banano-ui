import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, images, config, featureId, apiKey } = body;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key is required' },
        { status: 400 }
      );
    }

    if (!prompt && featureId !== 'image-editing') {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Initialize the Google Generative AI client
    const genAI = new GoogleGenerativeAI(apiKey);

    // Determine which model to use based on feature
    const modelName =
      featureId === 'text-to-image' || featureId === 'image-editing'
        ? 'gemini-2.5-flash-image'
        : 'gemini-3-pro-image-preview';

    const model = genAI.getGenerativeModel({ model: modelName });

    // Prepare the generation config
    const generationConfig: any = {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: 'text/plain',
    };

    // Add image config for Pro model
    if (modelName === 'gemini-3-pro-image-preview') {
      generationConfig.responseModalities = ['TEXT', 'IMAGE'];

      if (config?.aspectRatio || config?.imageSize) {
        generationConfig.imageConfig = {};
        if (config.aspectRatio) {
          generationConfig.imageConfig.aspectRatio = config.aspectRatio;
        }
        if (config.imageSize) {
          generationConfig.imageConfig.imageSize = config.imageSize;
        }
      }
    }

    // Prepare the content parts
    const parts: any[] = [{ text: prompt }];

    // Add images if provided
    if (images && images.length > 0) {
      for (const imageBase64 of images) {
        parts.push({
          inlineData: {
            mimeType: 'image/png',
            data: imageBase64,
          },
        });
      }
    }

    // Add Google Search tool if requested
    const tools: any[] = [];
    if (config?.useGoogleSearch) {
      tools.push({ googleSearch: {} });
    }

    // Create the chat session with config
    const chatSession = model.startChat({
      generationConfig,
      tools: tools.length > 0 ? tools : undefined,
    });

    // Send the message
    const result = await chatSession.sendMessage(parts);
    const response = result.response;

    // Extract image data from response
    let imageData = null;
    let textResponse = null;

    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
            imageData = part.inlineData.data;
          }
          if (part.text) {
            textResponse = part.text;
          }
        }
      }
    }

    if (!imageData) {
      return NextResponse.json(
        {
          success: false,
          error: 'No image data returned from the API. Please try again.',
          text: textResponse,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageData,
      text: textResponse,
    });
  } catch (error: any) {
    console.error('Generation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate image',
      },
      { status: 500 }
    );
  }
}
