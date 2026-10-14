from pathlib import Path
import shutil, zipfile
root=Path(__file__).resolve().parents[1]
assets=root/'docs/assets'
assets.mkdir(exist_ok=True)
for p in (root/'demo/assets').glob('product-*.svg'):
    shutil.copy2(p,assets/p.name)
# docs 是 GitHub Pages 独立发布根目录，所有资源均位于目录内部。
index=root/'docs/index.html'
s=index.read_text(encoding='utf-8').replace('../demo/assets/','assets/').replace('../demo/product.html','demo/product.html')
index.write_text(s,encoding='utf-8')
shutil.copytree(root/'demo',root/'docs/demo',dirs_exist_ok=True)
demo=root/'docs/demo/product.html'
demo.write_text(demo.read_text(encoding='utf-8').replace('../docs/index.html','../index.html'),encoding='utf-8')
(root/'docs/.nojekyll').touch()
extension=assets/'ImageGrab-extension.zip'
with zipfile.ZipFile(extension,'w',zipfile.ZIP_DEFLATED) as z:
    for p in root.rglob('*'):
        if not p.is_file() or '.git' in p.parts or p==extension or 'tests' in p.parts or 'tools' in p.parts:
            continue
        z.write(p,'ImageGrab/'+p.relative_to(root).as_posix())
deliver=root.parent/'ImageGrab-project.zip'
with zipfile.ZipFile(deliver,'w',zipfile.ZIP_DEFLATED) as z:
    for p in root.rglob('*'):
        if p.is_file() and '.git' not in p.parts:
            z.write(p,'imagegrab/'+p.relative_to(root).as_posix())
print(deliver)
