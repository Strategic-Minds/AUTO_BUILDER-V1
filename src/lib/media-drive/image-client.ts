export type GeneratedImageAsset = {
  asset_id: string;
  local_file_ref: string;
  filename: string;
  mime_type: string;
  width: number;
  height: number;
  prompt_hash: string;
};

function simpleHash(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

export class MediaImageClient {
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

    return {
      asset_id: assetId,
      local_file_ref: `/tmp/${assetId}.${format}`,
      filename: `${input.assetName}.${format}`,
      mime_type: format === 'jpg' ? 'image/jpeg' : `image/${format}`,
      width,
      height,
      prompt_hash: promptHash
    };
  }
}
