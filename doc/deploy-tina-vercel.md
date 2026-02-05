# 部署 TinaCMS 后台到 Vercel

本指南说明如何将 `admin-tina`（TinaCMS 后台）部署到 Vercel，使线上也能用后台编辑内容。

## 前置条件

- 代码已推送到 **GitHub** 仓库
- 拥有 **Vercel** 账号（[vercel.com](https://vercel.com)）
- 已创建 **Vercel KV**（Upstash Redis）存储，用于生产环境

---

## 一、准备环境变量

部署前需要准备好以下变量的值，并在 Vercel 里填写。

### 1. GitHub

| 变量名 | 说明 | 获取方式 |
|--------|------|----------|
| `GITHUB_OWNER` | 仓库所属用户或组织名 | 如 `oldorbe` |
| `GITHUB_REPO` | 仓库名 | 如 `nini_website` |
| `GITHUB_BRANCH` | 内容所在分支 | 一般用 `main` |
| `GITHUB_PERSONAL_ACCESS_TOKEN` | GitHub 个人访问令牌 | 见下方 |

**创建 GitHub PAT：**

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. 勾选权限：**repo**（完整仓库读写）
4. 生成后复制 token，只显示一次，妥善保存

### 2. NextAuth（登录）

| 变量名 | 说明 | 获取方式 |
|--------|------|----------|
| `NEXTAUTH_SECRET` | 会话加密密钥 | 本地运行：`openssl rand -hex 32` |
| `NEXTAUTH_URL` | 生产环境后台地址 | 部署后再填，如 `https://你的项目.vercel.app` |

### 3. Vercel KV（生产必填）

| 变量名 | 说明 | 获取方式 |
|--------|------|----------|
| `KV_REST_API_URL` | KV 的 REST API 地址 | 在 Vercel Dashboard 创建 KV 后复制 |
| `KV_REST_API_TOKEN` | KV 的 REST API 令牌 | 同上 |

**创建 Vercel KV：**

1. 登录 Vercel → 选你的 Team/账号
2. Storage → Create Database → **KV**
3. 起名（如 `tina-kv`），选区域，创建
4. 在 KV 页面点 **Connect to Project** 可自动注入 `KV_REST_API_*`，或到 **.env** 标签里手动复制

---

## 二、在 Vercel 部署

### 1. 导入项目

1. 打开 [vercel.com/new](https://vercel.com/new)
2. 选择 **Import Git Repository**，选中你的 GitHub 仓库
3. 点击 **Import**

### 2. 配置项目

在配置页面：

| 设置项 | 值 |
|--------|-----|
| **Framework Preset** | Next.js（一般会自动识别） |
| **Root Directory** | 点击 **Edit**，填 `admin-tina`，确认 |
| **Build Command** | `npm run build`（默认即可） |
| **Install Command** | `npm install --legacy-peer-deps`（若已按项目 `vercel.json` 配置则可留空） |

### 3. 添加环境变量

在 **Environment Variables** 里添加（Production、Preview 都勾选）：

- `GITHUB_OWNER`
- `GITHUB_REPO`
- `GITHUB_BRANCH`
- `GITHUB_PERSONAL_ACCESS_TOKEN`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` → 先填 `https://你的项目.vercel.app`（部署后若用自定义域名再改）
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

若 KV 是“Connect to Project”连接的，这两项可能已自动加好。

### 4. 部署

点击 **Deploy**，等待构建完成。

### 5. 首次访问

1. 部署完成后，打开 `https://你的项目.vercel.app`
2. 进入后台：`https://你的项目.vercel.app/admin`
3. 使用 `content/users/index.json` 里配置的用户登录（默认如 tinauser / tinarocks，首次登录会要求改密码）

---

## 三、部署后检查

- 能打开 `/admin` 并登录 → 正常
- 若提示 “Failed loading TinaCMS assets” → 检查 Root Directory 是否为 `admin-tina`
- 若编辑后保存失败 → 检查 `GITHUB_PERSONAL_ACCESS_TOKEN` 权限是否为 **repo**
- 若生产环境报错与 KV 相关 → 检查 `KV_REST_API_URL`、`KV_REST_API_TOKEN` 是否填对且已连接到当前项目

---

## 四、自定义域名（可选）

1. Vercel 项目 → Settings → Domains
2. 添加你的域名（如 `cms.你的站.com`）
3. 按提示在域名服务商处添加 CNAME 或 A 记录
4. 把 **Environment Variables** 里的 `NEXTAUTH_URL` 改为 `https://cms.你的站.com`

---

## 五、和前端的关系

- **前端**：继续用 GitHub Pages 等托管静态站，读取 `content/*.json`
- **后台**：Vercel 上的 Tina 只负责编辑，保存时通过 GitHub API 写回同一仓库的 `content/`
- 编辑并保存后，GitHub 仓库更新，若 Pages 是自动部署，刷新前端即可看到新内容

---

## 简要清单

- [ ] GitHub PAT 已创建（repo 权限）
- [ ] Vercel KV 已创建并拿到 `KV_REST_API_URL`、`KV_REST_API_TOKEN`
- [ ] `NEXTAUTH_SECRET` 已用 `openssl rand -hex 32` 生成
- [ ] Vercel 项目 Root Directory = `admin-tina`
- [ ] 所有环境变量已在 Vercel 中填写
- [ ] 部署成功后用 `/admin` 登录测试
