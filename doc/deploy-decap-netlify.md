# 使用 Decap CMS 与 GitHub Pages + Cloudflare Worker 部署与编辑指南

本文档说明如何将站点部署到 **GitHub Pages**，并通过 **Cloudflare Worker** 做 GitHub OAuth 代理，让非技术人员在浏览器中通过 Decap CMS 编辑内容（照片、影片、文字），无需改代码或 Git 命令。管理后台仍为 `/admin`，UI 不变；登录方式为 GitHub 账号（替代原 Netlify Identity）。

---

## 用上 Decap 还需做什么（外网建站检查清单）

本地已有 `content/`、`admin/` 且前台已改为读 JSON 的前提下，要**在外网用 Decap 配置内容**，按顺序完成以下即可：

| 步骤 | 做什么 |
|------|--------|
| 1 | **代码进 Git 并推到 GitHub**：项目在 GitHub 上有仓库，当前分支（如 `main`）已推送。 |
| 2 | **启用 GitHub Pages**：在仓库 Settings → Pages 中，选择从分支 `main`、根目录发布。 |
| 3 | **创建 GitHub OAuth 应用**：用于 Decap 登录；Homepage URL 与 Callback URL 指向你将部署的 OAuth 代理（Cloudflare Worker）地址。 |
| 4 | **部署 OAuth 代理（Cloudflare Worker）**：使用 [decap-proxy](https://github.com/sterlingwes/decap-proxy) 等方案，配置 OAuth Client ID/Secret，得到 PROXY URL。 |
| 5 | **配置 admin**：在 `admin/config.yml` 中设置 `backend.name: github`、`base_url` 为 PROXY URL、`auth_endpoint: /auth`；`admin/index.html` 不加载 Netlify Identity。 |
| 6 | **能登录 /admin**：访问 `https://你的站点域名/admin`，点击「Login with GitHub」，完成 OAuth 后即可编辑。 |
| 7 | **在 Decap 里编辑并发布**：登录后左侧选 Installations / Videotapes / Texts，改内容后点 Publish；GitHub 收到提交后 Pages 自动更新，前台不久即更新。 |

完成以上后，即可在外网用 Decap 配置内容；细节见下文各节。

---

## 前置条件

- 本地已完成内容与 admin 相关改动，包括：
  - `content/` 目录及 `installations.json`、`videotapes.json`、`texts.json`
  - `admin/index.html` 与 `admin/config.yml`
  - 列表页、详情页、导航改为从 `content/*.json` 读取数据
- 项目已放入 **Git 仓库**，并推送到 **GitHub**。
- 拥有 **Cloudflare** 账号（用于部署 Worker），以及 **GitHub** 账号（对仓库有推送权限，用于登录 Decap）。

---

## 一、启用 GitHub Pages

1. 打开仓库 **Settings** → **Pages**。
2. 在 **Build and deployment** 中：
   - **Source**：Deploy from a branch
   - **Branch**：选择 `main`（与 `admin/config.yml` 中 `branch` 一致）
   - **Folder**：`/ (root)`
3. 保存后，GitHub 会从该分支的根目录发布站点。若项目为纯静态（无构建），根目录即站点根；若有构建脚本，可先在本地或 CI 构建后再推送到该分支。
4. 部署完成后，站点地址为 `https://<用户名>.github.io/<仓库名>/` 或你绑定的自定义域名。确认首页、列表与详情页正常，且数据来自 `content/*.json`。

---

## 二、创建 GitHub OAuth 应用

Decap 通过 OAuth 代理登录 GitHub，代理需要先注册为一个 OAuth 应用。

1. 打开 [GitHub → Developer settings → OAuth Apps → New](https://github.com/settings/applications/new)。
2. 填写：
   - **Application name**：自定（如 "Decap CMS OAuth"）。
   - **Homepage URL**：你的 **OAuth 代理（Worker）的最终访问地址**，例如 `https://decap.yourdomain.com` 或 `https://xxx.workers.dev`（下一步部署 Worker 后会得到）。
   - **Authorization callback URL**：`{上一步的地址}/callback`，例如 `https://decap.yourdomain.com/callback`。
3. 创建后保存 **Client ID** 和 **Client Secret**，供下一步 Worker 使用。

若先部署 Worker 再创建 OAuth App，可先填临时 URL，部署得到真实 URL 后再回 GitHub 修改 Homepage 与 Callback URL。

---

## 三、部署 OAuth 代理（Cloudflare Worker）

采用社区方案 **[sterlingwes/decap-proxy](https://github.com/sterlingwes/decap-proxy)**（Decap 官方文档推荐的 Cloudflare Worker 实现）。

### 3.1 克隆并配置

- 克隆仓库：`git clone https://github.com/sterlingwes/decap-proxy`
- 进入目录：`cp wrangler.toml.sample wrangler.toml`
- 编辑 `wrangler.toml`：
  - 设置 `name`（Worker 名称，会出现在 Cloudflare 与默认 `*.workers.dev` 域名中）。
  - 若使用**自定义域名**（如 `decap.yourdomain.com`）：取消注释并填写 `route`、`zone_name`。
  - 若内容仓库为 **private**：设置 `GITHUB_REPO_PRIVATE = 1`（或在 Dashboard/Secrets 中配置）。

### 3.2 配置 Secrets

在 Cloudflare Dashboard：**Workers & Pages** → 该 Worker → **Settings** → **Variables and Secrets**，添加：

- `GITHUB_OAUTH_ID`：GitHub OAuth 应用的 Client ID
- `GITHUB_OAUTH_SECRET`：GitHub OAuth 应用的 Client Secret

或使用 Wrangler：

```bash
npx wrangler secret put GITHUB_OAUTH_ID
npx wrangler secret put GITHUB_OAUTH_SECRET
```

### 3.3 部署

```bash
npx wrangler login   # 若未登录
npx wrangler deploy
```

部署成功后得到 **PROXY URL**（如 `https://decap-proxy-xxx.workers.dev` 或你的自定义域名）。用浏览器打开该 URL，若看到「Hello 👋」即表示 Worker 已运行（OAuth 是否正常需在 Decap 中测试）。

### 3.4 自定义域名（可选）

若使用单独子域名（如 `cms-auth.yourdomain.com`）：在 Cloudflare 为该域名添加 DNS（CNAME 指向 Workers），并在 `wrangler.toml` 中配置 `route`；将 GitHub OAuth 应用中的 Homepage URL 与 Callback URL 改为该子域名。

---

## 四、配置 Decap（admin/config.yml 与 admin/index.html）

### 4.1 admin/config.yml

`backend` 需使用 `github`，并指向 OAuth 代理：

```yaml
backend:
  name: github
  repo: 你的用户名/仓库名    # 与 GitHub 仓库一致
  branch: main
  base_url: https://你的Worker地址   # 上一步得到的 PROXY URL
  auth_endpoint: /auth
```

将 `base_url` 替换为实际 PROXY URL；不要加载 Netlify Identity，也不要使用 `git-gateway`。`media_folder`、`public_folder` 与 `collections` 保持与现有一致即可。

### 4.2 admin/index.html

**不要**引入 Netlify Identity 脚本。例如删除：

```html
<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
```

仅保留 Decap 的挂载点与脚本（如 `#nc-root` 与 `decap-cms.js`），UI 不变。

---

## 五、使用 Decap CMS 编辑内容

1. **打开后台**  
   访问：**你的站点地址 + `/admin`**（GitHub Pages 的站点地址）。

2. **登录**  
   点击「Login with GitHub」等入口，跳转到 OAuth 代理 → GitHub 授权 → 回调后回到 Decap，完成登录。编辑人员须使用**对仓库有推送权限的 GitHub 账号**。

3. **编辑内容**  
   登录后左侧 **Collections**：Installations、Videotapes、Texts。编辑方式与之前一致；上传图片会进入 `content/uploads/`（或 config 中的 `media_folder`）。

4. **发布与生效**  
   点击 **Publish** 后，Decap 直接向 GitHub 仓库提交；GitHub Pages 随仓库更新而更新，一两分钟后刷新前台即可看到新内容。

---

## 六、编辑流程小结（给内容编辑者）

| 步骤 | 操作 |
|------|------|
| 1 | 打开 **https://你的站点域名/admin** |
| 2 | 点击 **Login with GitHub**，用 GitHub 账号登录（需有该仓库推送权限） |
| 3 | 左侧选择要改的栏目（Installations / Videotapes / Texts） |
| 4 | 修改标题、图片、视频链接、文字等，上传新图时选择文件即可 |
| 5 | 点击 **Publish** 发布 |
| 6 | 等待 1–2 分钟，刷新前台网站即可看到更新 |

无需使用 Git、命令行或代码编辑器。

---

## 七、常见问题

**Q：打开 /admin 显示 404**  
- 确认仓库中存在 `admin/index.html` 且已推送到 GitHub；GitHub Pages 从根目录发布时，`/admin` 对应 `admin/index.html`。

**Q：登录后提示 backend 错误或 repository not found**  
- 确认 `admin/config.yml` 中 `repo` 与 GitHub 仓库的 owner/name 完全一致；OAuth 应用所属的 GitHub 账号对该仓库有推送权限。若仓库为 **private**，确认 Worker 已设置 `GITHUB_REPO_PRIVATE=1`。

**Q：保存后前台没有更新**  
- GitHub Pages 会在收到新提交后自动重新发布；确认修改已提交到 Pages 使用的分支（如 `main`）。若前台从 `content/*.json` 拉取，确认 JSON 路径与前端 `loadContent()` 一致。

**Q：图片很多，不想放仓库**  
- 可在 Decap 中配置 Cloudinary（或其它图床）插件，上传时写入图床 URL；内容中只存 URL，前端无需改代码。

**Q：从 Netlify 迁移过来的编辑人员**  
- 不再使用 Netlify 邀请的邮箱/密码；改为使用**对仓库有推送权限的 GitHub 账号**登录 Decap。

---

## 八、部署与内容流（示意）

```
编辑者在浏览器打开 /admin（GitHub Pages）
    → 点击 Login with GitHub，经 OAuth 代理（Cloudflare Worker）完成 GitHub 登录
    → 在 Decap 中编辑 Installations / Videotapes / Texts
    → 点击 Publish，Decap 直接向 GitHub 提交
    → GitHub Pages 检测到新提交，自动发布
    → 前台站点拉取最新 content/*.json，展示新内容
```

内容与代码均在 Git 中保留历史，可随时回滚或协作。

---

## 替代方案：Tina CMS 自托管（Vercel）

若希望后台部署在 **Vercel** 并使用 **Tina CMS** 自托管，可改用本仓库中的 **admin-tina** 应用：前台仍由 GitHub Pages 提供且不改动，内容仍存于同一 GitHub 仓库的 `content/`；编辑在 Vercel 上的 Tina 后台完成，保存后推送到 GitHub，Pages 自动更新。详见 **[admin-tina/README.md](../admin-tina/README.md)**。采用 Tina 后建议仅使用一套后台，不再同时用 Decap 编辑同一批 `content/*.json`，以免冲突。

---

## 延伸阅读

- **[墙内建站与托管说明](hosting-access-china.md)** — 若站点需在中国大陆被稳定访问，可参考国内托管及与 GitHub Pages / Decap 的配合方式。
