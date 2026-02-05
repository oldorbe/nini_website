# 部署 TinaCMS 后台到 Vercel

本指南说明如何将 `admin-tina`（TinaCMS 后台）部署到 Vercel，使线上也能用后台编辑内容。

## 前置条件

- 代码已推送到 **GitHub** 仓库
- 拥有 **Vercel** 账号（[vercel.com](https://vercel.com)）
- 已创建 **Vercel KV**（Upstash Redis）存储，用于生产环境

---

## Root Directory 与 content / UI 的关系

设置 **Root Directory = `admin-tina`** 之后：

- **Vercel 只构建和运行 `admin-tina` 里的代码**  
  构建命令、启动的 Next.js 都在 `admin-tina/` 下执行，所以 **UI（页面、接口）** 自然就是 `admin-tina` 里的 `app/`、`pages/`、`public/` 等，不需要再单独“告诉” Vercel 哪里是 UI。

- **content 不在 Vercel 机器上，而在 GitHub 仓库里**  
  生产环境下 Tina 不用本机磁盘上的 `content/`，而是通过 **GitHub Provider** 用 API 读写你仓库里的文件。  
  - 仓库由环境变量 `GITHUB_OWNER`、`GITHUB_REPO`、`GITHUB_BRANCH` 指定。  
  - 各 collection 里的 `path: "content"` 表示**该仓库根目录下的 `content/` 文件夹**，例如 `content/installations.json`。  
  因此：**content 的位置 = 你 GitHub 仓库里的 `content/`**，和 Vercel 上有没有这个文件夹无关。

- **本地开发时** 才会用到本地的 `content/`（或通过 `admin-tina/content` → `../content` 的 symlink），方便 Tina 读本地文件；部署到 Vercel 后只连 GitHub，不依赖部署包里的 `content`。

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

### 3. 环境变量（Environment Variables）

在 Vercel 项目 → **Settings → Environment Variables** 里添加下面每一项。  
**Environment** 建议全选：Production、Preview、Development。

| Name | Value | 说明 |
|------|--------|------|
| `GITHUB_OWNER` | 你的 GitHub 用户名或组织名 | 如 `oldorbe` |
| `GITHUB_REPO` | 仓库名 | 如 `nini_website` |
| `GITHUB_BRANCH` | `main` | 内容所在分支 |
| `GITHUB_PERSONAL_ACCESS_TOKEN` | 你的 GitHub PAT | 需 **repo** 权限 |
| `NEXTAUTH_SECRET` | 随机字符串 | 本地运行 `openssl rand -hex 32` 生成 |
| `NEXTAUTH_URL` | `https://你的项目.vercel.app` | 部署后换成实际地址；用自定义域名则填域名 |
| `KV_REST_API_URL` | Vercel KV 提供的 URL | 在 Storage → 你的 KV → .env 里复制 |
| `KV_REST_API_TOKEN` | Vercel KV 提供的 Token | 同上 |

若 KV 是通过 **Connect to Project** 连到当前项目的，`KV_REST_API_URL` 和 `KV_REST_API_TOKEN` 可能已自动注入，无需再填。

### 4. Build & Output 设置（可选）

项目里的 `admin-tina/vercel.json` 已写好，一般**不用在 Vercel 界面再改**。若你改过或想确认，可按下面核对：

| 设置项 | 填什么 |
|--------|--------|
| **Root Directory** | `admin-tina`（必填，否则会从仓库根构建） |
| **Framework Preset** | Next.js |
| **Build Command** | 留空（用默认）或 `npm run build`。项目里使用 `tinacms build --skip-indexing`，避免构建时连 KV 超时；首次打开后台时会在运行时完成索引。 |
| **Output Directory** | 留空（Next.js 自动） |
| **Install Command** | 留空（用默认）或 `npm install --legacy-peer-deps` |

若在 **Settings → General** 里没有单独改 Install/Build Command，Vercel 会使用 Root Directory 下 `vercel.json` 的配置。

### 5. 部署

点击 **Deploy**，等待构建完成。

### 6. 首次访问

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

## 六、认证方式说明

当前项目配置使用 **Vercel Authentication** 进行用户认证。

### 当前方式：Vercel Authentication（推荐）

- **工作原理**：用户访问 `/admin` 时，先由 Vercel 验证身份，只有 Vercel 团队成员才能访问
- **优点**：
  - 无需管理独立的 TinaCMS 用户
  - 使用 Vercel 账户登录，更安全
  - 团队成员自动拥有访问权限
- **要求**：必须在 Vercel 项目设置中**开启 Vercel Authentication**

### 如何开启/配置 Vercel Authentication

1. Vercel Dashboard → 你的项目 → **Settings** → **Deployment Protection**
2. 找到 **Vercel Authentication** 部分
3. 选择保护范围：
   - **Standard Protection**：保护预览部署和生产环境
   - **All Deployments**：保护所有部署
   - **Only Preview Deployments**：只保护预览部署（不推荐用于 CMS）

### 切换到用户名/密码认证（可选）

如果你想关闭 Vercel Authentication，改用 TinaCMS 内置的用户名/密码登录，需要修改代码：

1. **修改 `tina/config.tsx`**：
   ```tsx
   import {
     UsernamePasswordAuthJSProvider,
     TinaUserCollection,
   } from "tinacms-authjs/dist/tinacms";
   
   // 将 authProvider 改为：
   authProvider: isLocal
     ? new LocalAuthProvider()
     : new UsernamePasswordAuthJSProvider(),
   
   // 在 collections 中添加 TinaUserCollection：
   collections: [
     TinaUserCollection as any,
     // ...其他 collections
   ],
   ```

2. **修改 `pages/api/tina/[...routes].ts`**：
   ```ts
   import { TinaAuthJSOptions, AuthJsBackendAuthProvider } from "tinacms-authjs";
   
   // 将 authProvider 改为：
   authProvider: isLocal
     ? LocalBackendAuthProvider()
     : AuthJsBackendAuthProvider({
         authOptions: TinaAuthJSOptions({
           databaseClient,
           secret: process.env.NEXTAUTH_SECRET!,
         }),
       }),
   ```

3. **配置用户**：在 `content/users/index.json` 中设置用户，密码需要使用 SHA512 哈希：
   ```json
   {
     "users": [
       {
         "username": "admin",
         "name": "Admin",
         "email": "admin@example.com",
         "password": {
           "value": "SHA512哈希值",
           "passwordChangeRequired": false
         }
       }
     ]
   }
   ```
   生成哈希：`echo -n "你的密码" | sha512sum | cut -d ' ' -f1`

4. **重新部署**并确保 Vercel Authentication 已关闭

5. **重新索引**：本地运行 `npx tinacms build`（带正确的环境变量）来更新 Redis schema

---

## 简要清单

- [ ] GitHub PAT 已创建（repo 权限）
- [ ] Vercel KV 已创建并拿到 `KV_REST_API_URL`、`KV_REST_API_TOKEN`
- [ ] `NEXTAUTH_SECRET` 已用 `openssl rand -hex 32` 生成
- [ ] Vercel 项目 Root Directory = `admin-tina`
- [ ] 所有环境变量已在 Vercel 中填写
- [ ] **Vercel Authentication 已开启**（当前认证方式需要）
- [ ] 部署成功后用 `/admin` 登录测试
