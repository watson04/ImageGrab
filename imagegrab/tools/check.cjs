const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
for(const entry of ['docs/index.html','docs/demo/product.html','gallery.html','popup.html']){
  const s=fs.readFileSync(path.join(root,entry),'utf8');
  for(const m of s.matchAll(/(?:src|href)="([^"]+)"/g)){
    const v=m[1]; if(v.startsWith('#')||/^(https?:|chrome:|mailto:)/.test(v))continue;
    const target=path.resolve(root,path.dirname(entry),v);
    if(!fs.existsSync(target))throw new Error(entry+' missing '+v);
  }
}
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(e.name==='.git')continue;const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(/\.(js|cjs)$/.test(e.name))cp.execFileSync(process.execPath,['--check',p]);}}
walk(root);console.log('PASS: JavaScript syntax and local asset/download links');
fetch('http://127.0.0.1:8766/docs/index.html').then(async r=>{if(!r.ok)throw new Error('HTTP '+r.status);console.log('PASS: preview HTTP '+r.status)}).catch(e=>{console.error(e);process.exitCode=1});
