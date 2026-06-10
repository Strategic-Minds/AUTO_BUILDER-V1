export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { runMediaDriveTool } from '@/lib/media-drive/pipeline';
import type { MediaDriveToolName } from '@/lib/media-drive/types';

const SMOKE_PROJECT = 'smoke-test-media-drive-pipeline';
const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID ?? '13uLhv0NRhmdCdJCCLrroLzyRRttoXtpr';

const smokeSteps: Array<{ tool: MediaDriveToolName; args: Record<string, unknown> }> = [
  {
    tool: 'drive_create_folder_tree',
    args: {
      project_slug: SMOKE_PROJECT,
      root_folder_id: ROOT_FOLDER_ID,
      tree: [
        '04 Social Systems/Generated Assets/smoke-test-media-drive-pipeline/Images',
        '04 Social Systems/Generated Assets/smoke-test-media-drive-pipeline/Approved',
        '04 Social Systems/Generated Assets/smoke-test-media-drive-pipeline/Working',
        '04 Social Systems/Generated Assets/smoke-test-media-drive-pipeline/Receipts'
      ]
    }
  },
  {
    tool: 'image_generate_asset',
    args: {
      project_slug: SMOKE_PROJECT,
      asset_name: 'smoke-test-generated-image',
      prompt: 'A clean abstract factory control panel icon, dark background, organized glowing folder paths, no text',
      size: '1024x1024',
      format: 'png',
      spend_cents: 0,
      budget_cents: 0
    }
  },
  {
    tool: 'drive_upload_image',
    args: {
      project_slug: SMOKE_PROJECT,
      source_file_ref: '/tmp/smoke-test-generated-image.png',
      filename: 'smoke-test-generated-image.png',
      mime_type: 'image/png',
      folder_id: 'planned-images-folder'
    }
  },
  {
    tool: 'drive_copy_file',
    args: {
      project_slug: SMOKE_PROJECT,
      file_id: 'planned-upload-file',
      to_folder_id: 'planned-approved-folder',
      new_name: 'smoke-test-generated-image-approved-copy.png'
    }
  },
  {
    tool: 'drive_move_file',
    args: {
      project_slug: SMOKE_PROJECT,
      file_id: 'planned-copy-file',
      to_folder_id: 'planned-working-folder',
      reason: 'Validate file move operation inside generated smoke-test folders.'
    }
  },
  {
    tool: 'drive_download_file',
    args: {
      project_slug: SMOKE_PROJECT,
      file_id: 'planned-upload-file',
      destination_name: 'downloaded-smoke-test-generated-image.png'
    }
  },
  {
    tool: 'drive_write_receipt',
    args: {
      project_slug: SMOKE_PROJECT,
      action: 'media_drive_pipeline_smoke_test',
      target_type: 'smoke_test',
      target_id: 'smoke-test-media-drive-pipeline',
      summary: 'Media Drive Pipeline smoke test completed.',
      payload: {
        folder_tree: 'planned',
        image: 'planned',
        upload: 'planned',
        copy: 'planned',
        move: 'planned',
        download: 'planned'
      },
      format: 'json'
    }
  }
];

export async function GET() {
  const results = [];

  for (const step of smokeSteps) {
    results.push(await runMediaDriveTool(step.tool, step.args));
  }

  const hardGated = results.filter((result) => result.status === 'hard_gated');

  return Response.json({
    status: hardGated.length === 0 ? 'pass' : 'hard_gated',
    route: '/api/mcp-media-drive-smoke',
    mode: 'autonomous_logged_smoke',
    liveMutation: false,
    project_slug: SMOKE_PROJECT,
    steps: results.length,
    hard_gated: hardGated.length,
    results
  });
}
