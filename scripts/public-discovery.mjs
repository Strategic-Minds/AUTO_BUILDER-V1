import { receiptBase, writeJson } from '../lib/receipt.mjs';

const receipt = receiptBase('public-discovery');
const url = process.argv[2];
const maxLinks = 25;

async function main() {
  if (!url) {
    throw new Error('Usage: node scripts/public-discovery.mjs <https://public-page.example>');
  }

  const target = new URL(url);
  if (!['http:', 'https:'].includes(target.protocol)) {
    throw new Error('Only http and https targets are allowed.');
  }
  if (target.hostname === 'localhost' || target.hostname === '127.0.0.1' || target.hostname.endsWith('.local')) {
    throw new Error('Discovery script only accepts public targets.');
  }

  const res = await fetch(target, { headers: { 'user-agent': 'AutoBuilderDiscovery/1.0' } });
  const html = await res.text();
  const links = Array.from(html.matchAll(/href=["']([^"']+)["']/g)).slice(0, maxLinks).map((match) => match[1]);

  receipt.receipts.push({
    target: target.toString(),
    status: res.status,
    bytes: html.length,
    linkSample: links,
    maxLinks
  });

  await writeJson('validation-artifacts/public-discovery.receipt.json', {
    ...receipt,
    status: 'passed'
  });
}

main().catch(async (error) => {
  await writeJson('validation-artifacts/public-discovery.receipt.json', {
    ...receipt,
    status: 'failed',
    blocker: String(error instanceof Error ? error.message : error)
  });
  console.error(error);
  process.exit(1);
});
