export function planBrowserValidationWork(validationCandidates: string[] = []) {
  return {
    productionActionAllowed: false,
    mode: "planned_browser_validation",
    runnerOptions: ["Playwright", "Browserbase", "Browserless", "Vercel preview runner", "GitHub Actions runner"],
    defaultChecks: [
      "public_or_preview_page_visit",
      "screenshot_capture",
      "console_error_capture",
      "network_error_capture",
      "cta_path_check",
      "mobile_responsive_check",
      "accessibility_smoke"
    ],
    blockedWithoutApproval: ["credentialed_login", "live_form_submission", "purchase", "publish", "account_mutation"],
    workItems: validationCandidates.map((candidate) => ({
      id: `browser-validate-${candidate}`,
      target: candidate,
      status: "queued_internal_plan",
      nextSafeStep: "Run preview/public browser smoke and record screenshot receipt."
    })),
    nextAction: "Wire a browser runner and artifact receipt bucket after workflow validation."
  };
}
