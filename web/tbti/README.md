# 旅格测试 TBTI（前端）

**Travel Behavior Type Indicator** — 独立静态站点，技术栈为 React + TypeScript + Vite。

产品定义与题库说明：

- [`../../docs/TBTI.md`](../../docs/TBTI.md) — 命名、四轴、十八型

运行时数据：`src/data/questions.json`、`src/data/types.json`；计分逻辑：`src/lib/scoring.ts`。

## 本地开发

```bash
cd web/tbti
npm install
npm run dev
```

生产构建与预览：

```bash
npm run build
npm run preview
```

## GitHub Pages 部署

1. 仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**（不要选 Deploy from a branch，除非你自己改成输出到分支）。
2. 默认分支需为 **`main`**（与 [`.github/workflows/deploy-pages.yml`](../../.github/workflows/deploy-pages.yml) 一致；若主分支名不同，请改 workflow 里的 `branches`）。
3. 推送至 `main` 后，在 **Actions** 中查看 **Deploy TBTI to GitHub Pages** 是否成功；成功后 **Settings → Pages** 会显示站点地址，形如 `https://<owner>.github.io/<repo>/`。
4. **Vite `base`**：构建时使用环境变量 `GITHUB_REPOSITORY`（Actions 已注入），自动设为 `/<仓库名>/`，与 GitHub **项目站**路径一致。仅在本地验证「子路径部署」效果时可执行：

   ```bash
   GITHUB_REPOSITORY=你的用户名/你的仓库名 npm run build && npm run preview
   ```

5. 若使用 **用户站**（仓库名为 `<username>.github.io` 且站点在域名根路径），请将 `vite.config.ts` 中的 `base` 改为 `'/'` 再构建，或在 CI 中覆盖该逻辑。

## 依赖安装缓慢（可选）

在国内网络下若 `npm install` 卡住，可尝试：

```bash
NPM_CONFIG_REGISTRY=https://registry.npmmirror.com npm install
```
