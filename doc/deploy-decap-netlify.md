# 使用 Decap CMS 与 Netlify 部署与编辑指南

本文档说明在**本地代码已按《本地需增加的代码》计划实现**的前提下，如何将站点部署到 Netlify，并让非技术人员通过 Decap CMS 在浏览器中编辑内容（照片、影片、文字），无需改代码或 Git 命令。

相关计划文档（实现前请先完成）：
- **Decap CMS 开发路线图**（decap_cms_roadmap）：阶段 0–5 与内容结构、Decap 配置、前端数据驱动、部署与维护。
- **本地需增加的代码**（local_code_for_decap_deployment）：具体需新增的 `content/`、`admin/` 及对列表页、详情页、JS 的修改。

---

## 用上 Decap 还需做什么（外网建站检查清单）

本地已有 `content/`、`admin/` 且前台已改为读 JSON 的前提下，要**在外网用 Decap 配置内容**，按顺序完成以下即可：

| 步骤 | 做什么 |
|------|--------|
| 1 | **代码进 Git 并推到 GitHub**：项目在 GitHub（或 GitLab）上有仓库，当前分支（如 `main`）已推送。 |
| 2 | **改 admin 后端配置**：在 `admin/config.yml` 里把 `backend` 改为使用 **Netlify 的 Git Gateway**（见下文「二、启用 Netlify Identity」中的 YAML 示例），即 `name: git-gateway`、`branch: main`（与部署分支一致）。若暂不打算用 Netlify，可保留 `name: github` 并填真实 `repo: 你的用户名/仓库名`，再自配 GitHub OAuth。 |
| 3 | **在 Netlify 部署站点**：用「一、在 Netlify 上部署站点」连接该仓库，构建命令可留空或 `echo "No build"`，发布目录填 `.`，部署成功并能打开首页。 |
| 4 | **开 Identity + Git Gateway**：在 Netlify 后台为该站点开启 **Identity**，再开启 **Git Gateway**，这样 Decap 才能代表你向 GitHub 提交修改。 |
| 5 | **能登录 /admin**：在 Identity 里自己注册或接受邀请，然后访问 `https://你的站点域名/admin`，用邮箱+密码登录。 |
| 6 | **在 Decap 里编辑并发布**：登录后左侧选 Installations / Videotapes / Texts，改内容后点 Publish；Netlify 会自动重新部署，前台不久即更新。 |

完成以上后，即可在外网用 Decap 配置内容；细节见下文各节。

---

## 前置条件

- 本地已完成《本地需增加的代码》中的全部改动，包括：
  - `content/` 目录及 `installations.json`、`videotapes.json`、`texts.json`
  - `admin/index.html` 与 `admin/config.yml`
  - 列表页、详情页、导航改为从 `content/*.json` 读取数据
- 项目已放入 **Git 仓库**，并推送到 **GitHub**（或 GitLab）。
- 拥有 Netlify 账号（免费注册即可）。

---

## 一、在 Netlify 上部署站点

1. **登录 Netlify**  
   打开 [https://app.netlify.com](https://app.netlify.com)，用 GitHub 登录。

2. **添加新站点（Import from Git）**  
   - 点击 **Add new site** → **Import an existing project**  
   - 选择 **GitHub**，授权 Netlify 访问你的仓库。  
   - 在列表中选择本项目的仓库。

3. **配置构建设置**  
   - **Branch to deploy**：选择你用于发布的分支（如 `main`）。  
   - **Build command**：若项目为纯静态、无构建脚本，可留空或填 `echo "No build"`。  
   - **Publish directory**：填 `.`（根目录），即整个仓库根目录作为站点根。  
   - 点击 **Deploy site**。

4. **确认站点可访问**  
   部署完成后，Netlify 会分配一个地址（如 `https://random-name-123.netlify.app`）。打开该地址，确认首页、Installations / Videotapes / Texts 列表与详情页均正常，且图片/数据来自 `content/`（若仍为占位图也属正常）。

5. **（可选）绑定自定义域名**  
   在 Netlify 站点 **Domain settings** 中可添加自己的域名并按提示配置 DNS。

---

## 二、启用 Netlify Identity 与 Git Gateway（让 Decap 能写仓库）

Decap 需要「写 Git 仓库」的权限。使用 Netlify 时，推荐用 **Netlify Identity + Git Gateway**，这样编辑人员用邮箱/密码登录 Decap，无需 GitHub 账号或 OAuth 配置。

1. **开启 Identity**  
   - 在 Netlify 站点后台进入 **Site configuration** → **Identity**。  
   - 点击 **Enable Identity**。  
   - 在 **Registration preferences** 中建议选择 **Invite only**（仅邀请用户可注册），避免陌生人注册。

2. **开启 Git Gateway**  
   - 仍在 **Identity** 页面，找到 **Services** 区域。  
   - 在 **Git Gateway** 旁点击 **Enable Git Gateway**。  
   - 这样 Decap 通过 Netlify 的代理写入 GitHub，无需在 Decap 里配置 GitHub OAuth。

3. **邀请编辑人员（可选）**  
   - 在 **Identity** → **Invite users** 中填写对方邮箱，发送邀请。  
   - 对方通过邮件中的链接设置密码后，即可用该邮箱和密码登录 Decap 后台。

4. **确认 admin/config.yml 使用 Git Gateway**  
   本地 `admin/config.yml` 中应类似：

   ```yaml
   backend:
     name: git-gateway
     branch: main
   ```

   若当前为 `name: github`，需改为 `name: git-gateway`，并确保 `branch` 与 Netlify 部署分支一致。改完后提交并推送到仓库，Netlify 会自动重新部署。

---

## 三、使用 Decap CMS 编辑内容

1. **打开后台**  
   在浏览器中访问：**你的站点地址 + `/admin`**  
   例如：`https://your-site.netlify.app/admin`

2. **登录**  
   - 若已启用 Netlify Identity + Git Gateway，页面会显示 Netlify Identity 的登录框。  
   - 使用你在 Identity 中注册或受邀的邮箱和密码登录。

3. **编辑内容**  
   - 登录后会看到左侧 **Collections**：Installations、Videotapes、Texts 等。  
   - **Installations**：点击进入可编辑 `content/installations.json` 中的项目列表；每个项目可改标题、年份、图片列表（上传新图或填 URL）；保存后 Decap 会提交到 Git。  
   - **Videotapes**：编辑 `content/videotapes.json`，可改每个影片的标题、视频链接、缩略图、描述。  
   - **Texts**：编辑 `content/texts.json`（或各篇 Markdown），可改标题、头图、正文、附件链接。  
   - 上传的图片若配置为「存仓库」，会出现在 `content/uploads/`（或你在 config 中设置的 `media_folder`）；若配置了 Cloudinary，则存图床 URL。

4. **发布与生效**  
   - 在 Decap 中点击 **Publish**（或 **Save**，视 widget 配置）后，Decap 会通过 Git Gateway 向 GitHub 提交并推送。  
   - Netlify 检测到仓库有新提交，会**自动重新部署**。  
   - 一两分钟后刷新前台站点，即可看到新内容。

---

## 四、编辑流程小结（给内容编辑者）

| 步骤 | 操作 |
|------|------|
| 1 | 打开 **https://你的站点域名/admin** |
| 2 | 用 Netlify 邀请的邮箱和密码登录 |
| 3 | 左侧选择要改的栏目（Installations / Videotapes / Texts） |
| 4 | 修改标题、图片、视频链接、文字等，上传新图时选择文件即可 |
| 5 | 点击 **Publish** 发布 |
| 6 | 等待 1–2 分钟，刷新前台网站即可看到更新 |

无需使用 Git、命令行或代码编辑器。

---

## 五、常见问题

**Q：打开 /admin 显示 404**  
- 确认仓库根目录下存在 `admin/index.html` 且已推送到 GitHub；Netlify 发布目录为根目录时，`/admin` 会对应 `admin/index.html`。

**Q：登录后提示 backend 错误**  
- 确认 Netlify Identity 与 Git Gateway 已启用；`admin/config.yml` 中 `backend.name` 为 `git-gateway`，`branch` 与 Netlify 部署分支一致。

**Q：保存后前台没有更新**  
- 到 Netlify 的 **Deploys** 页查看是否有新部署触发；若有失败，查看构建日志。  
- 若站点从 `content/*.json` 动态拉取，确认 JSON 已正确提交到仓库且路径与前端 `loadContent()` 一致。

**Q：图片很多，不想放仓库**  
- 可在 Decap 中配置 Cloudinary（或其它图床）插件，上传时写入图床 URL 到 JSON；内容中只存 URL，前端无需改代码。详见 Decap 与 Cloudinary 的官方文档。

**Q：想用 GitHub 账号登录而不是 Netlify Identity**  
- 可改用 GitHub OAuth：在 GitHub 建 OAuth App，在 `admin/config.yml` 中设 `backend.name: github` 并填写 `client_id` 等；此时不再需要启用 Git Gateway，但需妥善保管 client secret（可放 Netlify 环境变量或通过 Netlify 的 Decap 代理避免暴露）。

---

## 六、部署与内容流（示意）

```
编辑者在浏览器打开 /admin
    → 用 Netlify Identity 登录
    → 在 Decap 中编辑 Installations / Videotapes / Texts
    → 点击 Publish
    → Decap 通过 Git Gateway 提交到 GitHub
    → Netlify 检测到新提交，自动构建并发布
    → 前台站点拉取最新 content/*.json，展示新内容
```

内容与代码均在 Git 中保留历史，可随时回滚或协作。

---

## 延伸阅读

- **[墙内建站与托管说明](hosting-access-china.md)** — 若站点需在中国大陆被稳定访问，可参考国内托管（如阿里云 OSS + CDN、腾讯云 COS、Gitee Pages）及与 Netlify/Decap 的配合方式。
