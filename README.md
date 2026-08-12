# BioVision Web

BioVision 桌面应用的浏览器演示版本。页面布局、功能结构和科研内容与桌面 `BioVision` 前端保持一致，包含：

- 科研总览与实验项目管理
- 轨迹工作台和视频轨迹叠加
- 运动能力、空间偏好与社交行为分析
- 组间统计与分离式数据导出

## 浏览器演示说明

网页使用内置演示数据，并将新建项目和分组配置保存在当前浏览器中。选择的视频不会上传到服务器；真实 YOLO 检测、MHT v3 跟踪、SQLite 数据库和 Python 指标计算仍属于桌面 BioVision 应用。

## 本地运行

需要 Node.js 20.19 或更高版本：

- macOS：双击 `启动本地预览.command`
- Windows：双击 `启动原型.bat`
- 或在终端中运行：

```bash
npm install
npm start
```

浏览器打开 `http://127.0.0.1:1420`。

## 构建

```bash
npm run build
```

生成的静态网站位于 `dist` 文件夹。

## GitHub Pages

仓库已经包含自动发布流程。推送到 `main` 分支后，在 GitHub 仓库的 `Settings → Pages → Build and deployment` 中将 Source 设为 `GitHub Actions`，后续每次推送都会自动构建并更新网站。
