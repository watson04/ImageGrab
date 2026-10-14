from pathlib import Path
from PIL import Image, ImageDraw
root=Path(__file__).resolve().parents[1]
(root/'assets').mkdir(exist_ok=True)
(root/'demo/assets').mkdir(parents=True,exist_ok=True)
for n in [16,48,128]:
    image=Image.new('RGBA',(n,n),(0,0,0,0));d=ImageDraw.Draw(image)
    d.rounded_rectangle((0,0,n-1,n-1),radius=n//4,fill='#5b50e6')
    d.rounded_rectangle((n*.22,n*.22,n*.78,n*.78),radius=n*.06,outline='white',width=max(1,n//16))
    d.ellipse((n*.34,n*.34,n*.46,n*.46),fill='white')
    d.polygon([(n*.27,n*.70),(n*.48,n*.51),(n*.60,n*.62),(n*.73,n*.43),(n*.73,n*.73)],fill='white')
    image.save(root/f'assets/icon{n}.png')
shapes=[
 '<path d="M175 166Q180 122 240 122Q300 122 305 166" fill="none" stroke="#475f79" stroke-width="19"/><rect x="137" y="156" width="206" height="260" rx="58" fill="#728fa9"/><path d="M165 202Q240 183 315 202" fill="none" stroke="#abc0d1" stroke-width="9"/><rect x="167" y="290" width="147" height="91" rx="22" fill="#57758f"/><path d="M180 311H300" stroke="#bdcfdd" stroke-width="4"/><rect x="216" y="231" width="48" height="18" rx="5" fill="#d8e3e9"/>',
 '<path d="M139 290V229A101 101 0 0 1 341 229V290" fill="none" stroke="#64717d" stroke-width="30"/><path d="M151 246V224A89 89 0 0 1 329 224V246" fill="none" stroke="#c4cfd8" stroke-width="13"/><rect x="116" y="242" width="61" height="116" rx="25" fill="#4d5869"/><rect x="303" y="242" width="61" height="116" rx="25" fill="#4d5869"/>',
 '<ellipse cx="240" cy="395" rx="104" ry="18" fill="#bbb4a8"/><rect x="233" y="248" width="14" height="140" rx="7" fill="#c9a974"/><path d="M183 151H297L338 254H142Z" fill="#e1c99d"/><ellipse cx="240" cy="254" rx="98" ry="13" fill="#c1a572"/>',
 '<path d="M99 301L128 239Q159 251 184 225L228 202L252 252L333 293Q369 309 373 342H101Z" fill="#eef1e5" stroke="#a3ad9e" stroke-width="3"/><path d="M99 338H373V368H107Q91 365 99 338" fill="#d4dccd"/><path d="M196 248L245 276M184 262L231 290M173 276L217 301" stroke="#92a48f" stroke-width="8"/><path d="M281 313L335 326" stroke="#799374" stroke-width="12"/>',
 '<path d="M317 241H337Q377 241 377 282Q377 329 321 329" fill="none" stroke="#b59582" stroke-width="20"/><path d="M139 189H326V339Q326 386 233 386Q139 386 139 339Z" fill="#c6a38e"/><ellipse cx="233" cy="189" rx="94" ry="22" fill="#d8bba7"/><ellipse cx="233" cy="189" rx="77" ry="12" fill="#947866"/>',
 '<rect x="165" y="127" width="151" height="292" rx="24" fill="#7c8f7a"/><rect x="187" y="143" width="107" height="240" rx="13" fill="#d7e0ca"/><circle cx="241" cy="400" r="8" fill="#c7d0c0"/><path d="M194 287Q240 228 288 251V371H194Z" fill="#adc0a0"/><circle cx="268" cy="180" r="21" fill="#f3ecd2"/>'
]
colors=['#e5edf3','#e6e8ee','#f2ece1','#edf1e8','#f0e6e0','#e7eee3']
labels=['DAILY BACKPACK','WIRELESS AUDIO','WARM LIGHT','EVERYDAY SNEAKER','SLOW MORNING','KEEP CONNECTED']
for i,shape in enumerate(shapes):
    svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="480" height="540" viewBox="0 0 480 540"><rect width="480" height="540" fill="{colors[i]}"/><ellipse cx="240" cy="431" rx="128" ry="17" fill="#263040" opacity=".07"/>{shape}<text x="240" y="494" text-anchor="middle" fill="#677383" font-family="Arial,sans-serif" font-size="12" letter-spacing="3">{labels[i]}</text></svg>'
    (root/f'demo/assets/product-{i+1}.svg').write_text(svg,encoding='utf-8')
(root/'demo/assets/tiny.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="#5b50e6"/></svg>')
