export type RuntimeMode = 'dry_run' | 'queue_only' | 'approved_write' | 'execute';
export type RuntimeState = 'queued' | 'running' | 'waiting_approval' | 'completed' | 'failed' | 'rolled_back';
export type RuntimeRisk = 'low' | 'medium' | 'high' | 'blocked';
export type RuntimeProvider = 'browser' | 'vercel' | 'github' | 'workflow' | 'social' | 'workspace' | 'gmail' | 'drive';

export interface RuntimeApproval {
  required: boolean;
  phrase?: string;
  granted?: boolean;
  grantedBy?: string;
  grantedAt?: string;
}

export interface RuntimeReceipt {
  id: string;
  action: string;
  provider: RuntimeProvider;
  mode: RuntimeMode;
  status: RuntimeState;
  timestamp: string;
  evidence: RuntimeEvidence[];
  blockers: string[];
  nextActions: string[];
  rollbackAvailable: boolean;
}

export interface RuntimeEvidence {
  type: 'text' | 'url' | 'screenshot' | 'json' | 'log';
  label: string;
  value: string | Record<string, unknown>;
  collectedAt: string;
}

export interface RuntimeJob<TPayload = Record<string, unknown>> {
  id: string;
  type: string;
  provider: RuntimeProvider;
  priority: number;
  state: RuntimeState;
  mode: RuntimeMode;
  risk: RuntimeRisk;
  payload: TPayload;
  approval: RuntimeApproval;
  receiptId?: string;
  createdAt: string;
  updatedAt: string;
  attempts: number;
  maxAttempts: number;
}

export interface RuntimeResult<TOutput = Record<string, unknown>, TPayload = Record<string, unknown>> {
  ok: boolean;
  output?: TOutput;
  receipt: RuntimeReceipt;
  job?: RuntimeJob<TPayload>;
}

export interface BrowserTaskInput {
  url: string;
  action: 'health' | 'screenshot' | 'extract_text' | 'extract_links' | 'extract_metadata' | 'capture_evidence';
  waitForSelector?: string;
  timeoutMs?: number;
}

export interface BrowserTaskOutput {
  url: string;
  title?: string;
  text?: string;
  links?: string[];
  metadata?: Record<string, string>;
  screenshotBase64?: string;
}

export interface VercelRedeployInput {
  projectId: string;
  teamId?: string;
  target: 'preview' | 'production';
  approvalPhrase?: string;
}

export interface VercelRedeployOutput {
  deploymentId?: string;
  deploymentUrl?: string;
  status: 'queued' | 'ready' | 'failed' | 'blocked' | 'dry_run';
}