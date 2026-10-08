import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const source = await readFile(new URL('../assets/js/supabase-client.js',import.meta.url),'utf8');
for (const base of ['https://danghg18.github.io/bio-barrons-umf/','https://deployment.example/','https://deployment.example/platform/','http://localhost:8123/','http://127.0.0.1:8123/platform/','http://[::1]:8123/']) {
  for (const edition of ['', 'nou/']) {
    for (const page of ['index.html?next=https://evil.example/#lesson','cont.html?flow=recovery#access_token=test','']) {
      const context = {URL,window:{},location:new URL(base+edition+page)};
      vm.runInNewContext(source,context);
      assert.equal(context.window.BBSupabase.redirect(false),base+edition+'cont.html');
      assert.equal(context.window.BBSupabase.redirect(true),base+edition+'cont.html?flow=recovery');
    }
  }
}
for (const href of ['http://deployment.example/index.html','file:///tmp/index.html']) {
  const context = {URL,window:{},location:new URL(href)};
  vm.runInNewContext(source,context);
  assert.throws(()=>context.window.BBSupabase.redirect(false),/HTTPS/);
}
console.log('PASS auth callbacks preserve origin, subpath, edition and recovery; reject unsafe schemes');
const callbackPage = await readFile(new URL('../nou/cont.html',import.meta.url),'utf8');
assert.doesNotMatch(callbackPage,/src="auth-redirect\.js/, 'Softly handles its own callback, without leaving its edition');
