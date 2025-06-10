# 一个个人网站 A personal website

This is a personal website framework, powered by [node.js](https://nodejs.org/en).

## 使用 Usage

Prerequisite: install node.js

1. 将本仓库克隆到本地 Clone this repository to your local folder
2. 运行`npm install`来安装所需的模块 Run `npm install` to install required modules
3. 运行`node main.js` Run `node main.js`

## 特色 Features
- 使用简洁，只需将文章的md文件所在文件夹复制到`public/md`下即可
  - 相对路径引用本地图片
- 支持音乐盒与图片背景切换：将音乐文件放在`public/audios`下，将图片放在`public/pics`下，可于前端切换
- 支持字号调节
- 文章标签：在md文件头加入`tags`键，值为list或string，程序启动时自动扫描并将相同tag的文件归类显示
- 卡片支持：可以在文章中渲染块状卡片，格式如下
```
$\fcolorbox{...}{}{Theorem 1}$
content...
$\fcolorbox{...}{}{End Theorem}$
```
- 发布时间：利用系统调用，显示文件创建、最后修改时间
- 文章顺序：同一文件夹内用`weight`键指定先后顺序，前后翻页支持
- 访问文件夹时如无index.md，index.html等，显示TOC
- (TODO)reveal.js支持：文章与slide互转，自动调节字号，屏幕适配等，点击显示，分栏显示等
- (TODO)katex引用支持
- (TODO)评论系统