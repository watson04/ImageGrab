# GitHub 推送与 Pages 发布

作业要求有 GitHub 项目截图、网址、GitHub Pages 官网截图。本地项目已经准备好，官网使用 docs 目录，不需要购买域名。

1. 在 GitHub 新建一个公开的空仓库，例如 imagegrab。不要勾选自动生成 README，以免与本地项目产生冲突。
2. 在当前项目目录终端执行。下载 ZIP 解压的副本不含 Git 历史，需要先初始化；本机原始工作目录已有首次提交，可直接添加远程地址并推送。把地址替换成你的实际仓库：

```powershell
git init -b main
git add .
git commit -m "feat: implement ImageGrab"
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

3. 打开仓库 Settings → Pages，在 Build and deployment 中选择 Deploy from a branch，分支 main，目录 /docs，点击 Save。
4. 等待 Pages 显示发布成功，打开页面提供的网址（以 GitHub 实际返回地址为准），即可截图并填写表单。
5. 把官网页脚「GitHub 项目地址：待配置」改成你的仓库链接后，再提交和推送更新。

本地 HTTP 测试页不是 GitHub Pages 域名，扩展只允许本地测试页及支持的平台商品页出现按钮；托管官网里的测试页用于浏览素材，不会注入扩展按钮。

无需提供或把访问令牌写入项目。终端推送若提示登录，通过 Git 的正常 GitHub 登录流程完成。
