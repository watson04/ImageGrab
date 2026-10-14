# 图提取 ImageGrab

按《电商图片下载插件》要求实现的 Chrome Manifest V3 扩展和静态宣传官网。无框架、无 CDN、无需 npm install。

## 安装

1. 解压项目，打开 Chrome 的 `chrome://extensions`。
2. 开启右上角开发者模式，点击「加载已解压的扩展程序」。
3. 选择 **manifest.json 所在的 imagegrab 文件夹**（不要选择 docs）。
4. 打开淘宝 / 天猫 / 京东 / 拼多多商家版的商品详情页并刷新。
5. 点击右下角「获取图片」，在新工作台勾选后点击「下载选中 · PNG」。

PNG 文件实际经过 Canvas 转码，保存至默认下载目录的 `ImageGrab` 子目录。下载失败会列出原因，不会把改后缀的原图当作 PNG。

## 官网与本地演示

双击 `docs/index.html` 可预览官网。完整提取演示需使用 HTTP 地址：双击 `Start-preview.cmd`（需安装 Node.js），或在项目目录执行 `node tools/serve.cjs`。打开 `http://127.0.0.1:8766/demo/product.html`，加载扩展后刷新。应得到 6 张大图，去除重复图及小图。可下载并验证 PNG 文件。

官网里的示意图明确标记为界面示意；实际扩展工作台只展示当前提取结果，没有预造下载成功数据。

## 文件结构

- manifest.json：扩展注册、权限及平台匹配
- extractor.js：URL 规范化和商品路由判断
- content.js / content.css：浮动按钮、懒加载扫描和提取
- background.js：会话、图片读取、下载
- gallery.html / gallery.js / gallery.css：图片预览、筛选、选择、PNG 转码、进度
- popup.*：扩展工具栏菜单
- docs/：官网，原生 HTML / CSS / JS
- demo/：本地商品测试及自绘 SVG 素材
- tests/：纯函数与入口检查

## 使用边界与权限

默认访问权限覆盖电商平台、常用图片 CDN 及本地测试回环地址。遇到其他图片源时，仅在用户点击下载时按本次选中来源申请额外权限。没有上传图片的服务，图片转换在扩展本地执行。权限申请不会授予网页读取任意站点的能力。

有限滚动扫描至 24,000 px，最多记录 600 张候选图。无限滚动页面可先手动加载目标区域再提取。智能过滤依据尺寸和常见占位图名称，不能语义识别所有大尺寸 logo。跨域 iframe、封闭 Shadow DOM、登录验证、服务器反盗链或平台页面变动可能导致缺图或下载失败；支持域名不等于所有页面均可用。拒绝图片源权限后不会下载。动画图片转换为静态 PNG。

## 自定义

修改 `docs/css/style.css` 的 `--primary` 调整官网主色；修改 `docs/index.html` 调整文案。GitHub 地址待你提供仓库后配置；当前未发布至 GitHub，不需要在代码里填写 token。

## 验证

运行 `node --test tests/*.test.cjs`。扩展真实页面操作和网站视觉验证的完成情况见 `验证记录.md`。提交截图步骤见 `截图清单.md`。
