import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source = fs.readFileSync(new URL('../app/admin/product-manager.tsx', import.meta.url), 'utf8');
const functions = source.slice(source.indexOf('  async function save()'), source.indexOf('  function add()'));
const js = ts.transpile(functions, {target: ts.ScriptTarget.ES2022});
function harness(fetch) {
 const state = { products: [{id:'one',name:'old'}], uploading:'', recovery:null, savingRef:{current:false}, fetch, AbortSignal, FormData, Date, Error };
 for (const key of ['Saving','SaveError','Message','Baseline','Uploading']) state['set'+key] = value => {state[key.toLowerCase()]=value;};
 state.setProducts = fn => { state.products = fn(state.products); };
 vm.createContext(state); vm.runInContext(js,state); return state;
}
test('HTML login response cannot report successful save', async()=>{
 const h=harness(async()=>new Response('<html>Login</html>',{headers:{'content-type':'text/html'}}));
 await h.save(); assert.equal(h.baseline,undefined); assert.match(h.saveerror,/保存未确认成功/); assert.equal(h.saving,false);
});
test('failed response keeps edits and reports failure',async()=>{
 const h=harness(async()=>Response.json({error:'Invalid products'},{status:400})); await h.save(); assert.equal(h.products[0].name,'old'); assert.equal(h.baseline,undefined); assert.match(h.saveerror,/产品资料校验失败/);
});
test('concurrent save prevented; edits during save remain dirty',async()=>{
 let done; let requests=0;
 const h=harness(()=>{requests++;return new Promise(r=>done=r);});
 const pending=h.save(); h.products=[{id:'one',name:'new'}]; await h.save();
 done(Response.json({ok:true})); await pending;
 assert.equal(requests,1); assert.equal(JSON.parse(h.baseline)[0].name,'old'); assert.equal(h.products[0].name,'new');
});
test('image completion preserves new edits and targets ID after reorder; no automatic bulk save',async()=>{
 let done; let requests=0;
 const h=harness(()=>{requests++;return new Promise(r=>done=r);});
 const pending=h.upload(0,new Blob(['image']));
 h.products=[{id:'two',name:'other'},{id:'one',name:'edited during upload'}];
 done(Response.json({url:'/api/uploads/test.png'})); await pending;
 assert.equal(h.products[1].name,'edited during upload'); assert.equal(h.products[1].image,'/api/uploads/test.png'); assert.equal(h.products[0].image,undefined); assert.equal(requests,1);
});
test('network upload failure releases busy state',async()=>{
 const h=harness(async()=>{throw new Error('offline');}); await h.upload(0,new Blob(['image'])); assert.equal(h.uploading,''); assert.match(h.saveerror,/offline/);
});
