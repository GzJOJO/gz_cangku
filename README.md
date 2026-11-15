# 生日快乐，佳佳 ♡ — 像素风生日互动网页

根据上传视频的网页画面复刻的独立前端项目（原创代码 / 手工绘制 SVG + 从用户视频提取的小兔子像素图）。

## 打开方法

直接双击根目录的 `index.html` 即可；也可以使用 VS Code Live Server、本地静态服务器或 GitHub Pages 运行。

项目完全采用原生 HTML + CSS + JavaScript，无需 npm、Node、构建、API Key 或后端。推荐在 Chrome / Edge 最新版本打开。

## 功能与场景

1. 粉蓝格纹 My Melody 背景：开启像素礼物（已替换原深紫星空背景）
2. 粉色生日祝福：像素小兔、飘落彩纸
3. 可爱的问答互动：两个选项和答复
4. 星空蛋糕许愿：按住鼠标或空格 2 秒（也支持点击备用按钮）
5. 6 段告白 + 可滚动并关闭的信件弹窗
6. 两只兔子拥抱：反复点击释放爱心和粉色彩纸

其他：顶部全屏按钮、本地录音播放开关（assets/music/birthday-recording.m4a）、底部六幕导航、手机适配、减少动态效果的系统偏好支持。

## 目录结构

```text
birthday_pixel_web/
├── index.html
├── css/style.css
├── js/config.js
├── js/main.js
├── assets/my-melody-background.jpg（用户提供的第一幕背景）
├── assets/pixel-bunny.png
├── assets/gift.svg
├── assets/cake.svg
├── assets/melody-strawberry-cutout.png（第 06 段告白页的草莓兔兔插画）
├── assets/heart.svg
└── README.md
```

## 修改接收人的昵称

编辑 `js/config.js` 中的 `recipientName: '小张'`。JS 会替换页面主要内容和抬头中的“小张”。

如需改动告白内容，可以编辑 `js/main.js` 中的 `confessions` 数组。书信正文在 `index.html` 中 `<div class="letter-scroll">` 内。

## 上传 GitHub 并免费访问

1. 在 GitHub 创建 **Public** 仓库（如 `birthday-web`），不要预先创建 README。
2. 在本目录打开终端，执行：

```bash
git init
git branch -M main
git add .
git commit -m "Create birthday website"
git remote add origin https://github.com/你的用户名/birthday-web.git
git push -u origin main
```

3. 进入仓库 **Settings → Pages**，选择 **Deploy from a branch**；Branch 设为 `main`，Folder 设为 `/(root)`，保存。
4. 待发布成功，打开：`https://你的用户名.github.io/birthday-web/`

由于本项目使用 `./css/..`、`./js/..`、`./assets/..` 相对路径，可直接适配 GitHub Pages 项目子路径，无需修改 base。

## 说明

- 参照视频还原了界面与操作流程；不同设备、浏览器字体渲染、分辨率和原视频压缩会造成少量差异，并非对原网页源代码的复制。
- 示例中没有视频平台水印和浏览器 UI，那些属于录屏内容而不是网页的一部分。
- 顶部“音乐”按钮播放用户上传的本地录音 `assets/music/birthday-recording.m4a`；点击按钮开始播放，再次点击暂停，播放结束后不会自动循环。浏览器会要求用户手动点击开启播放。
- 全部图片都放在 `assets/`，离线可用。
- 此项目无需持久保存录音/视频。如果希望用户上传内容并永久保存，则需要增加对象存储或后端。

## 第一幕背景更换说明

已经把原来的深紫色星空首页替换为你提供的粉蓝格纹 My Melody 图片。
图片路径：`assets/my-melody-background.jpg`；对应样式位于 `css/style.css` 末尾，选择器是 `.app[data-stage="0"]`。
星空、月亮、地面、扫描线在第一幕隐藏；其他五幕保持原先背景。想替换为自己的图片，覆盖同名 JPG 即可。

