import { createSign } from "node:crypto";

import { createReceipt } from "./receipts";

export type GoogleFormQuestionType = "short_text" | "paragraph" | "multiple_choice" | "checkboxes" | "dropdown";

export type GoogleFormQuestion = {
  title: string;
  description?: string;
  type?: GoogleFormQuestionType;
  required?: boolean;
  options?: string[];
};

export type GoogleFormSection = {
  title: string;
  description?: string;
  questions?: GoogleFormQuestion[];
};

export type CreateGoogleFormInput = {
  job_id: string;
  mode?: "dry_run" | "execute";
  title: string;
  description?: string;
  documentTitle?: string;
  parent_folder_id?: string;
  sections?: GoogleFormSection[];
  questions?: GoogleFormQuestion[];
  blocked_actions?: string[];
};

const defaultBlockedActions = ["delete", "rename_existing", "move_existing", "publish", "payment", "billing_change"];
const googleFormsScope = "https://www.googleapis.com/auth/forms.body";
const googleDriveFileScope = "https://www.googleapis.com/auth/drive.file";
const googleFormMimeType = "application/vnd.google-apps.form";

function normalizePrivateKey(value: string) {
  return value.replace(/\\n/g, "\n");
}

function base64url(input: string) {
  return Buffer.from(input).toString("base64url");
}

function signJwt(payload: Record<string, unknown>, privateKey: string) {
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const body = base64url(JSON.stringify(payload));
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${body}`);
  signer.end();
  return `${header}.${body}.${signer.sign(normalizePrivateKey(privateKey)).toString("base64url")}`;
}

async function getGoogleAccessToken(scopes: string[]) {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  if (!clientEmail || !privateKey) {
    return { ok: false as const, error: "GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY must be configured.", details: undefined as unknown };
  }

  const now = Math.floor(Date.now() / 1000);
  const scope = Array.from(new Set(scopes)).join(" ");
  const subject = process.env.GOOGLE_WORKSPACE_IMPERSONATION_EMAIL || process.env.GOOGLE_IMPERSONATE_EMAIL;
  const assertion = signJwt(
    {
      iss: clientEmail,
      scope,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
      ...(subject ? { sub: subject } : {})
    },
    privateKey
  );

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || typeof data.access_token !== "string") {
    return { ok: false as const, error: "Google OAuth token exchange failed.", status: response.status, details: data };
  }

  return { ok: true as const, accessToken: data.access_token as string, scope, delegated_subject: subject ? "configured" : "not_configured" };
}

function normalizeQuestionType(type: GoogleFormQuestionType | undefined): GoogleFormQuestionType {
  return type ?? "paragraph";
}

function itemForQuestion(question: GoogleFormQuestion) {
  const type = normalizeQuestionType(question.type);
  const required = question.required ?? false;
  const options = (question.options ?? []).filter(Boolean).map((value) => ({ value }));
  const base = {
    title: question.title,
    description: question.description
  };

  if (type === "multiple_choice" || type === "checkboxes" || type === "dropdown") {
    return {
      ...base,
      questionItem: {
        question: {
          required,
          choiceQuestion: {
            type: type === "checkboxes" ? "CHECKBOX" : type === "dropdown" ? "DROP_DOWN" : "RADIO",
            options,
            shuffle: false
          }
        }
      }
    };
  }

  return {
    ...base,
    questionItem: {
      question: {
        required,
        textQuestion: {
          paragraph: type === "paragraph"
        }
      }
    }
  };
}

function buildBatchRequests(input: CreateGoogleFormInput) {
  const requests: Array<Record<string, unknown>> = [];
  let index = 0;

  if (input.description) {
    requests.push({
      updateFormInfo: {
        info: { description: input.description },
        updateMask: "description"
      }
    });
  }

  for (const section of input.sections ?? []) {
    requests.push({
      createItem: {
        item: {
          title: section.title,
          description: section.description,
          pageBreakItem: {}
        },
        location: { index }
      }
    });
    index += 1;

    for (const question of section.questions ?? []) {
      requests.push({ createItem: { item: itemForQuestion(question), location: { index } } });
      index += 1;
    }
  }

  for (const question of input.questions ?? []) {
    requests.push({ createItem: { item: itemForQuestion(question), location: { index } } });
    index += 1;
  }

  return requests;
}

async function createForm(accessToken: string, input: CreateGoogleFormInput) {
  const response = await fetch("https://forms.googleapis.com/v1/forms", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      info: {
        title: input.title,
        documentTitle: input.documentTitle ?? input.title
      }
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) return { ok: false as const, status: response.status, error: data };
  return { ok: true as const, source: "forms.create", form: data as { formId?: string; responderUri?: string } };
}

async function createFormWithDrive(accessToken: string, input: CreateGoogleFormInput) {
  const response = await fetch("https://www.googleapis.com/drive/v3/files?supportsAllDrives=true&fields=id,name,webViewLink", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: input.documentTitle ?? input.title,
      mimeType: googleFormMimeType,
      ...(input.parent_folder_id ? { parents: [input.parent_folder_id] } : {})
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) return { ok: false as const, status: response.status, error: data };
  const file = data as { id?: string; name?: string; webViewLink?: string };
  if (!file.id) return { ok: false as const, status: "missing_file_id", error: data };
  return {
    ok: true as const,
    source: "drive.files.create",
    form: { formId: file.id, responderUri: undefined as string | undefined },
    file
  };
}

async function batchUpdateForm(accessToken: string, formId: string, requests: Array<Record<string, unknown>>) {
  if (requests.length === 0) return { ok: true as const, skipped: true };

  const response = await fetch(`https://forms.googleapis.com/v1/forms/${encodeURIComponent(formId)}:batchUpdate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ requests })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) return { ok: false as const, status: response.status, error: data };
  return { ok: true as const, response: data };
}

async function getForm(accessToken: string, formId: string) {
  const response = await fetch(`https://forms.googleapis.com/v1/forms/${encodeURIComponent(formId)}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) return { ok: false as const, status: response.status, error: data };
  return { ok: true as const, form: data as { responderUri?: string } };
}

async function moveFormToFolder(accessToken: string, formId: string, parentFolderId: string) {
  const url = new URL(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(formId)}`);
  url.searchParams.set("addParents", parentFolderId);
  url.searchParams.set("fields", "id,name,parents,webViewLink");
  url.searchParams.set("supportsAllDrives", "true");

  const response = await fetch(url.toString(), {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) return { ok: false as const, status: response.status, error: data };
  return { ok: true as const, file: data };
}

export async function createGoogleForm(input: CreateGoogleFormInput) {
  const mode = input.mode ?? "dry_run";
  const blockedActions = Array.from(new Set([...(input.blocked_actions ?? []), ...defaultBlockedActions]));
  const sections = input.sections ?? [];
  const questions = input.questions ?? [];
  const itemCount = sections.reduce((count, section) => count + 1 + (section.questions?.length ?? 0), questions.length);
  const requests = buildBatchRequests(input);

  const base = {
    job_id: input.job_id,
    provider: "google_forms",
    objective: "create_google_form",
    mode,
    dry_run: mode !== "execute",
    blocked_actions: blockedActions,
    rollback_plan: "Delete the created Google Form file from Drive if rollback is explicitly approved.",
    planned_operations: [
      { provider: "google_forms", action: "forms.create", title: input.title, dry_run: mode !== "execute" },
      { provider: "google_drive", action: "files.create", mimeType: googleFormMimeType, fallback_for: "forms.create", dry_run: mode !== "execute" },
      { provider: "google_forms", action: "forms.batchUpdate", item_count: itemCount, dry_run: mode !== "execute" },
      ...(input.parent_folder_id ? [{ provider: "google_drive", action: "files.update.addParents", parent_folder_id: input.parent_folder_id, dry_run: mode !== "execute" }] : [])
    ]
  };

  if (!input.title?.trim()) {
    return {
      ...base,
      ok: false,
      validation_status: "blocked",
      blocked_operations: [{ action: "forms.create", status: "blocked_invalid_payload", reason: "title is required" }],
      receipts: []
    };
  }

  if (mode !== "execute") {
    return {
      ...base,
      ok: true,
      validation_status: "planned",
      requests_preview: requests.slice(0, 10),
      receipts: [
        createReceipt({
          ok: true,
          provider: "google_forms",
          action: "create_google_form",
          category: "create",
          operation: "google_forms_create_plan",
          requestedCapability: "Create a Google Form through AUTO BUILDER MCP.",
          authStatus: "unknown",
          executionMode: "manual_receipt",
          status: "planned",
          projectId: input.parent_folder_id,
          logs: [`Google Form creation planned with ${itemCount} items.`],
          artifacts: ["google-form-plan", input.title],
          fallbackMode: "If forms.create is unavailable, the runner will try Drive files.create for a native Google Form before batchUpdate.",
          nextActions: ["Run with mode=execute after reviewing the planned items.", "Verify service account access and Forms API enablement."]
        })
      ]
    };
  }

  const token = await getGoogleAccessToken([googleFormsScope, googleDriveFileScope]);
  if (!token.ok) {
    return {
      ...base,
      ok: false,
      validation_status: "blocked",
      blocked_operations: [{ action: "google_oauth", status: "blocked_missing_or_invalid_secret", reason: token.error, details: token.details }],
      receipts: []
    };
  }

  const directCreate = await createForm(token.accessToken, input);
  const created = directCreate.ok ? directCreate : await createFormWithDrive(token.accessToken, input);
  if (!created.ok) {
    return {
      ...base,
      ok: false,
      validation_status: "failed",
      failed_operations: [
        { action: "forms.create", status: directCreate.status, reason: directCreate.error },
        { action: "drive.files.create", status: created.status, reason: created.error }
      ],
      receipts: []
    };
  }

  if (!created.form.formId) {
    return {
      ...base,
      ok: false,
      validation_status: "failed",
      failed_operations: [{ action: created.source, status: "missing_form_id", reason: created }],
      receipts: []
    };
  }

  const formId = created.form.formId;
  const batchUpdated = await batchUpdateForm(token.accessToken, formId, requests);
  const fetched = await getForm(token.accessToken, formId);
  const moved = input.parent_folder_id && created.source !== "drive.files.create" ? await moveFormToFolder(token.accessToken, formId, input.parent_folder_id) : { ok: true as const, skipped: true };
  const editUrl = `https://docs.google.com/forms/d/${formId}/edit`;

  const ok = batchUpdated.ok && moved.ok;
  return {
    ...base,
    ok,
    validation_status: ok ? "created" : "failed",
    form: {
      formId,
      editUrl,
      responderUri: fetched.ok ? fetched.form.responderUri : created.form.responderUri,
      parent_folder_id: input.parent_folder_id
    },
    provider_result: {
      create: directCreate,
      create_fallback: directCreate.ok ? { skipped: true } : created,
      batch_update: batchUpdated,
      get: fetched,
      move: moved,
      delegated_subject: token.delegated_subject
    },
    receipts: [
      createReceipt({
        ok,
        provider: "google_forms",
        action: "create_google_form",
        category: "create",
        operation: "google_forms_create",
        requestedCapability: "Create a Google Form through AUTO BUILDER MCP.",
        authStatus: "verified",
        executionMode: "api",
        status: ok ? "completed" : "failed",
        projectId: input.parent_folder_id,
        resourceId: formId,
        resourceUrl: editUrl,
        logs: [ok ? `Google Form created through ${created.source}.` : "Google Form created but one or more follow-up operations failed.", "No secret values returned."],
        artifacts: ["google-form", formId],
        fallbackMode: ok ? "No fallback needed after successful API creation." : "Inspect provider_result and repair the failed operation manually or through a follow-up batchUpdate.",
        nextActions: ["Open editUrl to verify form structure.", "Share or move the form only after approval.", "Use responderUri for form recipients after review."]
      })
    ],
    next_actions: ["Open form.editUrl to verify form structure.", "Use form.responderUri only after final review."]
  };
}
