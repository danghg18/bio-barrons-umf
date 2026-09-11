import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
const result = await build({entryPoints:[fileURLToPath(new URL('./supabase-entry.mjs', import.meta.url))], bundle:true,
  format:'iife', globalName:'BBSupabaseSDK', platform:'browser', target:['es2020'], minify:true,
  legalComments:'inline', write:false, banner:{js:'/* Generated local Supabase SDK. Licenses: supabase.LICENSE.txt. Run npm run build:supabase. */'}});
const packages = ['@supabase/supabase-js','@supabase/auth-js','@supabase/functions-js','@supabase/postgrest-js',
  '@supabase/realtime-js','@supabase/storage-js','@supabase/phoenix','iceberg-js','tslib'];
const licenses = [];
for (const name of packages) {
  const base = new URL('../node_modules/' + name + '/', import.meta.url);
  const metadata = JSON.parse(await readFile(new URL('package.json', base), 'utf8'));
  const filename = name === '@supabase/phoenix' ? 'LICENSE.md' : name === 'tslib' ? 'CopyrightNotice.txt' : 'LICENSE';
  licenses.push(name + '@' + metadata.version + '\n\n' + (await readFile(new URL(filename, base), 'utf8')).replace(/\r\n/g, '\n'));
}
const artifacts = {
  'supabase.js': result.outputFiles[0].text,
  'supabase.LICENSE.txt': licenses.join('\n\n---\n\n').trimEnd() + '\n'
};
await mkdir(new URL('../assets/js/vendor/', import.meta.url), {recursive:true});
for (const [name, bytes] of Object.entries(artifacts)) {
  const file = new URL('../assets/js/vendor/' + name, import.meta.url);
  if (process.argv.includes('--check')) {
    if (await readFile(file, 'utf8').catch(() => '') !== bytes) throw Error('Supabase bundle/licenses are stale; run npm run generate');
  } else await writeFile(file, bytes);
}
