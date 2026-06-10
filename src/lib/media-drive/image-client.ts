export type GeneratedImageAsset = {
  asset_id: string;
  local_file_ref: string;
  filename: string;
  mime_type: string;
  width: number;
  height: number;
  prompt_hash: string;
  live: boolean;
  provider?: 'openai_images';
  b64_json?: string;
};

type OpenAIImageResponse = {
  data?: Array<{ b64_json?: string; url?: string }>;
  error?: { message?: string };
};

function simpleHash(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

function imageMime(format: 'png' | 'jpg' | 'webp') {
  return format === 'jpg' ? 'image/jpeg' : `image/${format}`;
}

export function isImageGenerationLiveConfigured() {
  return Boolean(process.env.OPENAI_API_KEY && process.env.MEDIA_DRIVE_IMAGE_LIVE_ENABLED === '1');
}

export class MediaImageClient {
  readonly live: boolean;

  constructor(options: { live?: boolean } = {}) {
    this.live = options.live === true;
  }

  async generateAsset(input: {
    projectSlug: string;
    assetName: string;
    prompt: string;
    size?: '1024x1024' | '1024x1536' | '1536x1024';
    format?: 'png' | 'jpg' | 'webp';
  }): Promise<GeneratedImageAsset> {
    const format = input.format ?? 'png';
    const size = input.size ?? '1024x1024';
    const [width, height] = size.split('x').map((part) => Number(part));
    const promptHash = simpleHash(input.prompt);
    const assetId = `${input.projectSlug}-${input.assetName}-${promptHash}`.replace(/[^a-zA-Z0-9-_]/g, '-');

    if (!this.live) {
      return {
        asset_id: assetId,
        local_file_ref: `/tmp/${assetId}.${format}`,
        filename: `${input.assetName}.${format}`,
        mime_type: imageMime(format),
        width,
        height,
        prompt_hash: promptHash,
        live: false
      };
    }

    if (!process.env.OPENAI_API_KEY) throw new Error('missing_openai_api_key');

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.MEDIA_DRIVE_IMAGE_MODEL ?? 'gpt-image-1',
        prompt: input.prompt,
        size,
        n: 1
      })
    });
    const json = await response.json() as OpenAIImageResponse;
    if (!response.ok) throw new Error(json.error?.message ?? `openai_image_http_${response.status}`);

    return {
      asset_id: assetId,
      local_file_ref: `/tmp/${assetId}.${format}`,
      filename: `${input.assetName}.${format}`,
      mime_type: imageMime(format),
      width,
      height,
      prompt_hash: promptHash,
      live: true,
      provider: 'openai_images',
      b64_json: json.data?.[0]?.b64_json
    };
  }
}
