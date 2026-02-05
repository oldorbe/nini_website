# 墙内建站与托管说明

本文档说明：在使用 **Decap CMS + GitHub Pages + OAuth 代理**（如 Cloudflare Worker）方案时，**中国大陆（墙内）** 访问的现状、可行策略与国内托管推荐。

---

## 1. 墙内访问现状

本站在用的 **Decap CMS + GitHub Pages + OAuth 代理** 方案中，以下环节在墙内**不稳定或可能被阻断**：

| 环节 | 说明 |
|------|------|
| **GitHub / GitLab** | 作为 Decap 的 backend，国内访问 github.com 经常被限速或间歇性无法打开；GitHub Pages（如 `*.github.io`）同样不稳定。 |
| **OAuth 代理（如 Cloudflare Worker）** | 登录时请求会连到代理与 GitHub，在国内容易超时或失败。 |
| **Decap 前端资源** | 当前从 `unpkg.com` 加载 Decap 的 `decap-cms.js`，unpkg 在国内常被限速或屏蔽，`/admin` 后台可能加载失败或极慢。 |
| **登录（GitHub OAuth）** | Decap 登录经 OAuth 代理跳转 GitHub，请求会连到境外服务，在国内容易超时或失败。 |

**结论**：若编辑与访客都在墙内，**无法保证稳定访问**；编辑后台和站点访问都可能需要代理。

---

## 2. 可行策略：编辑用代理，站点国内可访问

若接受 **「编辑 Decap 时使用代理」**，只要求 **个人网站在国内可被访客正常打开**，可采用：

- **内容与发布**：继续在 GitHub Pages + OAuth 代理方案下使用 Decap 编辑、提交（需要时编辑者开代理）。
- **对访客展示**：将**构建后的静态站**部署到**国内可稳定访问的托管**（见下文），国内访客只访问国内节点，不依赖 GitHub。

这样：**访客体验稳定；编辑仅在登录 Decap、保存内容时需要代理。**

---

## 3. 国内托管推荐

### 3.1 国内云：对象存储 + CDN（首选）

把**已构建的静态站**（HTML/CSS/JS 与 `content/*.json` 等）放到国内对象存储，并开启静态网站托管与 CDN，国内访问通常最稳、最快。

| 服务 | 说明 |
|------|------|
| **阿里云 OSS + CDN** | 开通 OSS「静态网站托管」，绑定自有域名，再配置 CDN 加速。按流量/存储计费，个人站成本低。 |
| **腾讯云 COS + CDN** | 使用 COS 的静态网站功能，绑定域名并开启 CDN。有免费额度，适合小站。 |
| **华为云 OBS + CDN** | 同样：对象存储静态站点 + 国内 CDN。 |

**与现有流程的配合**：

- 内容照常在 GitHub Pages + OAuth 代理方案下用 Decap 编辑（需代理时使用）。
- 部署方式可任选其一或组合：
  - **方式 A**：GitHub Pages 作为「源站」发布；用 **GitHub Actions**（或其它 CI）在 push 后构建静态产物并上传到阿里云 OSS / 腾讯云 COS，国内域名指向该 CDN。
  - **方式 B**：仅用 GitHub Pages 做 Decap 后台与静态站，不对外提供国内访问；构建产物通过脚本或 CI 同步到国内云，**对访客只提供国内域名**（如 `www.xxx.cn` 解析到国内 CDN）。

### 3.2 国内代码托管自带的 Pages

若希望用「国内 Git + 静态页」一条龙，可考虑：

| 服务 | 说明 |
|------|------|
| **Gitee Pages** | 国内访问稳定。Decap 官方主要支持 GitHub/GitLab，Gitee 需自行适配或使用社区方案，通常不作为 Decap 的唯一下游。 |
| **Coding（腾讯云 DevOps）** | 提供静态 Pages，国内可访问；与 Decap 的集成不如 GitHub 成熟。 |

更稳妥的用法：**仅用 Gitee/Coding 托管「构建好的静态站」**。例如用 CI 把 GitHub 上的构建结果同步到 Gitee 仓库，用 Gitee Pages 发布给国内访客；Decap 仍连 GitHub（经 OAuth 代理），编辑时用代理。

### 3.3 境外托管 + 国内 CDN 回源（折中）

- 站点仍部署在 **GitHub Pages / Vercel** 等（仅作源站）。
- 使用**带国内节点的 CDN**（如阿里云、腾讯云、又拍云、七牛等）做**回源**到你的源站域名，国内访客通过 CDN 国内节点访问。

缺点：源站在境外，回源可能受跨境影响；需自备域名并配置 CDN。适合已熟悉 CDN 的用户。

---

## 4. 可选：减轻 Decap 后台在墙内的依赖

若希望编辑时（在代理不稳定时）稍微好一点，可考虑：

- **自托管 Decap 前端**：将 `decap-cms.js` 从 unpkg 改为**自托管**（放到自己站点或国内可访问的 CDN），减少对 unpkg 的依赖。  
  注意：**登录**仍会请求 OAuth 代理与 GitHub，墙内仍可能失败，编辑时往往仍需代理。

---

## 5. 小结

| 目标 | 建议 |
|------|------|
| **国内访客稳定打开网站** | 使用 **阿里云 OSS + CDN** 或 **腾讯云 COS + CDN** 托管构建后的静态站；通过 CI 或脚本从 GitHub 同步构建产物。 |
| **少用云控制台** | 用 **Gitee Pages**（或 Coding）仅作静态展示，通过 CI 从 GitHub 同步构建结果；Decap 继续在 GitHub Pages + OAuth 代理方案下编辑（需代理）。 |
| **编辑 Decap** | 接受在墙内编辑时使用代理；可选自托管 Decap 前端以减轻对 unpkg 的依赖。 |

相关文档：

- [Decap + GitHub Pages + OAuth 代理 部署](deploy-decap-netlify.md) — 后台与构建流程。
- Decap CMS 路线图（`.cursor/plans/decap_cms_roadmap_*.plan.md`）— 整体建站阶段与内容结构。
