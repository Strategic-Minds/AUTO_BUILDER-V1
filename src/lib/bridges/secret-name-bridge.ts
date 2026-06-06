export type SecretNameRecord = {
  name: string;
  present: boolean;
  valueLength: number;
  sources: string[];
};

export type SecretNameInventory = {
  generatedAt: string;
  policy: string;
  count: number;
  secrets: SecretNameRecord[];
};

const DEFAULT_PATTERNS = [
  "SECRET",
  "TOKEN",
  "KEY",
  "PASSWORD",
  "CLIENT_ID",
  "CLIENT_SECRET",
  "REFRESH_TOKEN",
  "ACCESS_TOKEN",
  "SUPABASE",
  "GOOGLE",
  "VERCEL",
  "GITHUB",
  "SHOPIFY",
  "SLACK",
  "OPENAI",
  "HEYGEN",
  "METRICOOL"
];

export function getSecretNameInventory(patterns = DEFAULT_PATTERNS): SecretNameInventory {
  const upperPatterns = patterns.map((pattern) => pattern.toUpperCase());
  const secrets = Object.keys(process.env)
    .filter((name) => upperPatterns.some((pattern) => name.toUpperCase().includes(pattern)))
    .map((name) => {
      const value = process.env[name] ?? "";
      return {
        name,
        present: value.length > 0,
        valueLength: value.length,
        sources: ["process.env"]
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    generatedAt: new Date().toISOString(),
    policy: "Secret names, presence, value length, and source only. Secret values are never returned.",
    count: secrets.length,
    secrets
  };
}
