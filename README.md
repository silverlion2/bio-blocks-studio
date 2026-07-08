<div align="center">

<h1>Personal Site Studio · 个人主页工作室</h1>

<p>把个人主页、作品集、链接页和轻量作品展示，做成一个可视化编辑、可部署、可复用的 Next.js 模板。</p>

<p>无需数据库。公开页面负责展示，<code>/admin</code> 负责编辑，内容通过 Vercel Blob 保存。</p>

<p>
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-blue.svg"></a>
  <a href="https://nextjs.org/"><img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black.svg"></a>
  <a href="https://www.typescriptlang.org/"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-blue.svg"></a>
  <a href="https://vercel.com/"><img alt="Vercel" src="https://img.shields.io/badge/Deploy-Vercel-black.svg"></a>
</p>

<p><a href="README.en.md">English</a> | 中文</p>

</div>

---

## 这是什么

Personal Site Studio 是一个面向个人品牌、作品集、创作者链接页和轻量项目主页的开源模板。它内置一个密码保护的可视化后台，你可以像整理卡片一样调整主页内容，而不是每次都改代码。

适合：

- 个人介绍页、作品集、链接聚合页
- 独立开发者、设计师、创作者、学生、自由职业者主页
- 需要快速部署、后续自己维护内容的个人网站
- 想给不同受众展示不同版本主页的场景

不适合：

- 复杂 CMS、多用户协作后台或权限系统
- 需要私密数据存储的站点
- 纯 GitHub Pages 静态站点部署

## 核心特性

- 公开个人主页：头像、简介、标签、社交链接、联系入口和作品卡片。
- 密码保护后台：`/admin/login` 登录，`/admin` 可视化编辑。
- 桌面和移动布局编辑：同一内容可分别调整桌面端和移动端卡片尺寸。
- 卡片式内容块：项目、链接、图片、文本、状态、视频和社交卡片。
- 全宽文本块：用于章节标题和说明文字；它们是内容块，不是容器。
- 共享内容排序：卡片可以放在文本块上方、下方或中间。
- 图片上传和裁剪：支持固定比例和自定义比例，上传到 Vercel Blob。
- 项目设置：后台名称、公开站点标题、描述、站点 URL、SEO、主题和外观。
- 多语言与多版本：为不同语言或不同受众保存独立内容快照。
- 隐藏访问版本：例如 `/u1` 进入特定公开版本，并通过 HTTP-only cookie 保持一段访问次数。
- 配置导入导出：从后台导出完整 JSON，迁移或备份更轻松。
- 无传统数据库：生产内容保存到 Vercel Blob。

## 技术栈

- Next.js App Router
- TypeScript
- Tailwind CSS
- dnd-kit
- Vercel Blob
- bcryptjs
- Zod
- Lucide React
- Sonner

## 快速开始

```bash
npm install
npm run dev
```

打开：

```text
http://localhost:3000
```

公开页面在没有 Vercel Blob 的情况下也能运行，会回退到 `lib/default-site-config.ts` 的默认内容。

如果要本地测试后台登录、保存和上传，请参考下一节配置环境变量。

## 环境变量

从 `.env.example` 创建 `.env.local`：

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
BLOB_READ_WRITE_TOKEN=
ADMIN_PASSWORD=
```

最简单的生产环境配置：

- `BLOB_READ_WRITE_TOKEN`：Vercel Blob read/write token，用于保存配置和上传图片。
- `ADMIN_PASSWORD`：后台登录密码。适合完全不会代码的用户，直接在 Vercel 的 Environment Variables 里填写；Value 填你想设置的密码即可。

可选增强项：

- `ADMIN_PASSWORD_HASH`：后台密码的 bcrypt hash。如果设置了它，系统会优先使用 hash，并忽略 `ADMIN_PASSWORD`。
- `SESSION_SECRET`：用于签名后台登录 session 的随机密钥。可以不填；不填时系统会从后台密码自动派生一个签名密钥。如果你想手动设置，至少 32 个字符。

如果你不想在 Vercel 保存明文密码，可以生成后台密码 hash：

```bash
node -e "const bcrypt=require('bcryptjs'); bcrypt.hash(process.argv[1], 12).then(console.log)" "your-password"
```

把输出结果填入 `ADMIN_PASSWORD_HASH`。登录后台时输入的是原始明文密码，也就是上面命令里的 `your-password`，不是生成出来的 hash。

如果你想手动生成 session secret：

```bash
openssl rand -base64 48
```

不要把 `BLOB_READ_WRITE_TOKEN`、`ADMIN_PASSWORD`、`ADMIN_PASSWORD_HASH` 或 `SESSION_SECRET` 加上 `NEXT_PUBLIC_` 前缀。它们必须只存在服务端。只有 `NEXT_PUBLIC_SITE_URL` 可以暴露给浏览器。

## 三种部署方式

### 方式一：把提示词交给 AI 部署

如果你使用 Codex、Claude Code、Cursor 或其他代码 Agent，可以复制下面这段提示词，让 AI 帮你完成部署流程。

```text
请帮我部署这个项目：

GitHub 仓库：https://github.com/JiahaoTang-Alvin/personal-site-studio
目标：部署一个可编辑的个人主页到 Vercel。

请按以下步骤执行：
1. Fork 或 clone 这个仓库到我的 GitHub 账号，并安装依赖。
2. 检查项目是 Next.js App Router 应用，确认需要 Vercel 运行时，不要改成 GitHub Pages 静态导出。
3. 帮我准备 Vercel 项目，并启用 Vercel Blob。
4. 让我提供一个后台登录密码。不要把明文密码写进代码或 README。
5. 默认使用零代码部署：把我提供的后台密码设置为 Vercel 环境变量 ADMIN_PASSWORD。这样我以后登录 /admin/login 时输入的就是我自己设置的密码。
6. 如果我要更保险的部署方式，可以帮我把这个密码转换成 bcrypt hash，设置为 ADMIN_PASSWORD_HASH。注意：即使使用 hash，我登录时仍然输入原始密码，不需要记住 hash。
7. SESSION_SECRET 不是后台登录密码。它只是 session 签名密钥；可以不填，系统会自动从后台密码派生。如果你要手动设置，请生成一串至少 32 个字符的随机值。
8. 至少设置这些 Vercel 环境变量。其中登录相关只需要 ADMIN_PASSWORD：
   NEXT_PUBLIC_SITE_URL=https://我的域名或 Vercel 域名
   BLOB_READ_WRITE_TOKEN=Vercel Blob 的 read/write token
   ADMIN_PASSWORD=我提供的后台密码
9. 部署到 Vercel。
10. 部署完成后，打开 /admin/login，确认我可以用原始密码登录。
11. 登录后打开「项目设置」，填写站点标题、描述、站点 URL、SEO、版本和语言，然后保存一次，把生产配置写入 Vercel Blob。

请在执行前告诉我哪些步骤需要我手动授权，例如 GitHub、Vercel 登录或创建 Blob。
```

这条路径适合不想手动处理 GitHub、Vercel 和环境变量细节的用户。你仍然需要自己保管后台密码；不要把它写进公开仓库、README 或公开聊天记录。以后想换密码，去 Vercel 后台更新 `ADMIN_PASSWORD`，然后重新部署生产环境即可。

### 方式二：从 GitHub 直接导入 Vercel

1. Fork 或复制这个仓库到你的 GitHub 账号。
2. 打开 Vercel，选择 **Add New... -> Project**，导入这个 GitHub 仓库。
3. 在 New Project 页面保持默认设置：
   - Framework Preset：`Next.js`
   - Root Directory：`./`
4. 展开 **Environment Variables**，在截图里的 Key / Value 区域逐条添加：

   ```env
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   BLOB_READ_WRITE_TOKEN=your-vercel-blob-read-write-token
   ADMIN_PASSWORD=your-admin-login-password
   ```

   后台登录相关只需要 `ADMIN_PASSWORD`。Value 可以填你想用的任意强密码，例如一段自己能记住、别人猜不到的短语。

5. `Environments` 可以选择 `Production and Preview`，也可以只选 `Production`。
6. 点击 **Deploy**。
7. 部署完成后，在 Vercel 项目里启用 Vercel Blob，并把 Blob read/write token 填回 `BLOB_READ_WRITE_TOKEN`。如果你是在部署前已经创建好 Blob token，也可以直接填。如果是部署后才补充或修改环境变量，需要重新部署一次生产环境。
8. 打开 `https://your-domain.com/admin/login`，使用 `ADMIN_PASSWORD` 里的原始密码登录。
9. 在后台打开「项目设置」，设置项目名称、公开标题、描述、站点 URL、SEO、版本和语言。
10. 点击保存一次，把生产配置写入 Vercel Blob。

如果后续要改后台密码，到 Vercel 项目的 **Settings -> Environment Variables** 更新 `ADMIN_PASSWORD`，然后重新部署一次生产环境。`SESSION_SECRET` 不是登录密码；只有在你想让所有旧登录立刻失效时，才需要同时更新它。

### 方式三：手动发布到 GitHub，再连接 Vercel

如果你已经有本地副本，可以手动创建 GitHub 仓库并推送源码：

```bash
git init
git add .
git commit -m "Initial personal site studio"
git branch -M main
git remote add origin https://github.com/your-name/your-repo.git
git push -u origin main
```

然后在 Vercel 中导入这个 GitHub 仓库，按「方式二」配置 Blob 和环境变量。

注意：完整应用不支持纯 GitHub Pages / 静态 HTML 部署。原因是它使用了动态 Next.js 路由、cookie、后台 API routes、登录 session，以及 Vercel Blob 写入。GitHub 在这里适合用来托管源码；推荐运行环境仍然是 Vercel。

## 路由

- `/`：公开个人主页
- `/admin/login`：后台登录
- `/admin`：可视化后台编辑器
- `/api/admin/config`：登录后读取和保存配置
- `/api/admin/upload`：登录后上传图片
- `/[accessCode]`：隐藏版本访问入口，例如 `/u1`

## 数据模型

站点由一个经过校验的 `SiteConfig` 驱动：

- `profile`：头像、名称、简介、标签、社交链接和个人信息模块显示状态。
- `sections`：历史兼容字段；当前编辑器保持为空。
- `blocks`：项目、链接、图片、文本、社交、视频、状态卡片，以及全宽 `section` 文本块。
- `theme`：颜色、圆角、阴影和字体设置。
- `settings`：项目名称、公开标题、描述、URL、SEO、多语言、多版本和功能开关。
- `contentVariants`：可选的版本/语言内容快照，键名格式为 `variantId:locale`。

生产配置保存到 Vercel Blob：

```text
config/site-config.json
```

上传图片保存到：

```text
images/avatar
images/blocks
images/gallery
images/qrcode
```

Blob 中的配置和图片是公开可读的。不要在配置里保存密钥、私人笔记、未公开凭证或敏感个人数据。

## 配置导入导出

后台「项目设置」可以导出完整 `SiteConfig` JSON。导入 JSON 后只会替换当前编辑草稿；检查无误后点击「保存」，才会写入 Vercel Blob。

这适合用于备份、迁移部署、从本地交接到生产环境，或在多个站点之间复用结构。

## 验证

```bash
npm run lint
npm run typecheck
npm run build
npm audit --audit-level=moderate
```

## 文档

- [Admin editor notes](docs/admin-editor-notes.md)
- [Project background for AI agents](docs/project-background.md)
- [Security and deployment notes](docs/security-and-deployment.md)

## 设计原则

- 内容优先：主页第一屏应该直接展示个人身份和重点作品。
- 可视化维护：日常改内容尽量在后台完成，而不是每次改代码。
- 小而可塑：模板保持轻量，方便按个人品牌继续改造。
- 前台只读，后台写入：公开页面不写数据，所有保存和上传都必须通过登录后台。
- 公开配置边界清晰：Vercel Blob 适合保存公开展示内容，不适合保存秘密。

## 模板状态

这是一个仍在演进的可用模板。当前重点是个人主页、作品卡片、视觉编辑、多语言/多版本和 Vercel Blob 持久化。迁移工具、版本历史、登录限流和更复杂的权限系统还没有内置。
