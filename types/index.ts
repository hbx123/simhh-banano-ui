export interface Feature {
  id: string;
  name: string;
  description: string;
  icon: string;
  thumbnail: string;
  category: 'generation' | 'editing' | 'special';
  requiresImage: boolean;
  requiresMultipleImages: boolean;
  maxImages?: number;
  modelType: 'flash' | 'pro';
}

export interface GenerationConfig {
  aspectRatio?: '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '4:5' | '5:4' | '9:16' | '16:9' | '21:9';
  imageSize?: '1K' | '2K' | '4K';
  useGoogleSearch?: boolean;
}

export interface GenerationRequest {
  prompt: string;
  images?: string[]; // base64 encoded images
  config?: GenerationConfig;
  featureId: string;
  apiKey: string;
}

export interface GenerationResponse {
  success: boolean;
  imageData?: string; // base64 encoded
  text?: string;
  error?: string;
}

export const FEATURES: Feature[] = [
  {
    id: 'text-to-image',
    name: 'Text to Image',
    description: 'Generate stunning images from text descriptions using Gemini 2.5 Flash',
    icon: '✨',
    thumbnail: '/thumbnails/text-to-image.jpg',
    category: 'generation',
    requiresImage: false,
    requiresMultipleImages: false,
    modelType: 'flash',
  },
  {
    id: 'image-editing',
    name: 'Image Editing',
    description: 'Edit existing images with text prompts - add, remove, or modify elements',
    icon: '🎨',
    thumbnail: '/thumbnails/image-editing.jpg',
    category: 'editing',
    requiresImage: true,
    requiresMultipleImages: false,
    modelType: 'flash',
  },
  {
    id: 'multi-image-compose',
    name: 'Multi-Image Composition',
    description: 'Combine up to 14 reference images to create new scenes',
    icon: '🖼️',
    thumbnail: '/thumbnails/multi-image.jpg',
    category: 'editing',
    requiresImage: true,
    requiresMultipleImages: true,
    maxImages: 14,
    modelType: 'pro',
  },
  {
    id: 'search-grounding',
    name: 'Search-Grounded Generation',
    description: 'Generate images based on real-time information from Google Search',
    icon: '🔍',
    thumbnail: '/thumbnails/search-grounding.jpg',
    category: 'generation',
    requiresImage: false,
    requiresMultipleImages: false,
    modelType: 'pro',
  },
  {
    id: 'high-res-generation',
    name: 'High-Resolution Generation',
    description: 'Create professional 4K images with Gemini 3 Pro',
    icon: '📸',
    thumbnail: '/thumbnails/high-res.jpg',
    category: 'generation',
    requiresImage: false,
    requiresMultipleImages: false,
    modelType: 'pro',
  },
  {
    id: 'social-media-thumbnail',
    name: 'Social Media Thumbnail Generator',
    description: 'Create viral-worthy thumbnails with dramatic scenes, bold text, and eye-catching elements',
    icon: '🚀',
    thumbnail: '/thumbnails/social-thumbnail.jpg',
    category: 'special',
    requiresImage: true,
    requiresMultipleImages: false,
    modelType: 'pro',
  },
];
