<div align="center">

<h1>Bio Blocks Studio · 拼搭式个人主页模板 🧩</h1>

<p>像搭积木一样，用模块拼出不同版本的个人主页。</p>

<p>左侧展示个人信息，右侧自由拖拽项目、图片、视频、文本和链接模块。支持隐藏版本、多语言内容和 Vercel 一键部署。</p>

<p>
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-blue.svg"></a>
  <a href="https://nextjs.org/"><img alt="Next.js" src="https://img.shields.io/badge/Next.js-App%20Router-black.svg"></a>
  <a href="https://www.typescriptlang.org/"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-blue.svg"></a>
  <a href="https://vercel.com/"><img alt="Vercel" src="https://img.shields.io/badge/Deploy-Vercel-black.svg"></a>
  <a href="https://vercel.com/docs/storage/vercel-blob"><img alt="Vercel Blob" src="https://img.shields.io/badge/Storage-Vercel%20Blob-black.svg"></a>
</p>

<p><a href="README.en.md">English</a> | 中文</p>

</div>

---

## ✨ 这是什么

**Bio Blocks Studio** 是一个开源的模块化个人主页模板。

它的灵感来自 Bonjour 这类拼搭式个人主页产品：你不需要每次改代码，也不需要上复杂 CMS，只要进入 `/admin` 后台，就可以像整理卡片、搭积木、拼图案一样，把自己的个人信息、项目、作品、图片、视频、社交链接和状态模块组合成一个可公开访问的个人主页。

页面结构很直接：

- **左侧**：头像、姓名、简介、标签、社交链接、联系入口等个人信息。
- **右侧**：可拖拽、可调整尺寸的内容模块，例如项目卡片、图片、视频、文本、链接、社交卡片和状态卡片。
- **后台**：通过密码登录后编辑内容、调整布局、上传图片、切换主题、管理多语言和隐藏版本。
- **存储**：无需传统数据库，生产内容通过 Vercel Blob 保存。

> 本项目不是 Bonjour 官方项目，也不与 Bonjour 存在官方关联。它只是受这类模块化个人主页体验启发，提供一个可自部署、可修改、可复用的开源实现。

---

## 🧩 核心特性

- **模块化搭建主页**  
  通过卡片模块搭建个人主页。项目、图片、视频、文本、链接、状态和社交卡片都可以作为独立模块自由排列。
  
  <img width="828" height="480" alt="Export-1783504403991" src="https://github.com/user-attachments/assets/c956df7d-89ef-4f86-a561-18f1b7ecc670" />

- **拖拽式编辑体验**  
  在后台直接拖拽排序、调整卡片尺寸，不需要每次改代码。
  
  <img width="828" height="480" alt="Export-1783504515592" src="https://github.com/user-attachments/assets/c48d027e-4ce5-4f43-a2f6-2d247d2a4723" />

- **左右分区展示**  
  左侧固定展示个人身份信息，右侧用于展示作品、项目、视觉内容和扩展模块，适合个人品牌和作品集展示。

- **桌面端 / 移动端分别适配**  
  同一套内容可以分别调整桌面端和移动端布局，避免手机端展示变形。
  
  <img width="828" height="480" alt="Export-1783504602389" src="https://github.com/user-attachments/assets/db6aacc6-3413-40bc-939b-48abd5939661" />


- **隐藏版本访问**  
  可以为不同受众创建不同主页版本，例如求职版、社交版、活动版、合作版。每个版本都可以拥有独立内容和独立布局。
  
  <img width="792" height="480" alt="Export-1783504935862" src="https://github.com/user-attachments/assets/f07673af-bf8d-46ee-837a-f1bc3ac4a0c8" />

- **版本下支持多语言**  
  不只是“一个网站多语言”，而是“不同版本下也可以配置不同语言”。  
  例如你可以有一个 `resume` 简历版，并在这个版本下分别配置中文和英文内容；也可以有一个 `social` 社交版，在这个版本下配置更轻松的中文介绍。

  <img width="792" height="480" alt="Export-1783505206381" src="https://github.com/user-attachments/assets/ba8a5c19-caf3-4e25-bdf3-3f4d34a0fb65" />

- **图片上传和裁剪**  
  支持上传头像、项目图、图片模块、二维码等素材，并保存到 Vercel Blob。

- **项目级设置**  
  后台可设置公开站点标题、描述、站点 URL、SEO 信息、主题、外观、语言和版本。

- **配置导入导出**  
  可以从后台导出完整 JSON，用于备份、迁移或复用结构。

- **无需传统数据库**  
  生产配置和上传素材保存到 Vercel Blob，适合轻量个人站点。

---

## 🎯 适合什么场景

适合：

- 个人主页
- 作品集网站
- 独立开发者主页
- 学生求职主页
- 设计师 / 创作者展示页
- 自由职业者介绍页
- 项目合集页
- 链接聚合页
- 给不同受众展示不同版本主页的场景

典型例子：

| 场景 | 可以怎么用 |
|---|---|
| 💼 求职版 | 创建一个隐藏版本，只展示简历、项目、技能和联系方式 |
| 🤝 企业活动版 | 面向活动、展会或企业交流，突出身份、项目、合作方向和联系方式 |
| 🍸 社交 / 酒馆版 | 展示更轻松的个人形象、兴趣、社交账号和近期状态 |
| 🚀 创业 / 产品版 | 展示正在做的产品、Demo、链接、媒体资料和联系入口 |
| 🎓 学生作品集 | 展示课程项目、软件技能、个人经历和作品截图 |
| 🎨 创作者主页 | 展示视频、社交账号、代表作品和合作方式 |

不适合：

- 复杂 CMS
- 多用户协作后台
- 严格权限系统
- 存储私密数据的站点
- 需要订单、评论、会员、支付等业务系统的站点
- 纯 GitHub Pages 静态部署

---

## 🕶️ 隐藏版本是什么

隐藏版本是这个项目最重要的功能之一。

你可以在后台创建多个特定版本，例如：

```text
resume
job
social
bar
event
partner
v1
```

每个版本都可以单独配置：

- 展示哪些个人信息
- 展示哪些模块
- 使用什么简介
- 使用什么头像或视觉风格
- 项目卡片怎么排序
- 哪些内容隐藏
- 哪些内容更适合当前访问者

例如：

| 版本 | 适合对象 | 展示重点 |
|---|---|---|
| `resume` | 招聘方、HR、面试官 | 学历、技能、项目、简历、联系方式 |
| `social` | 新朋友、线下社交对象 | 兴趣、社交账号、轻松介绍、个人状态 |
| `bar` | 酒馆、活动、轻社交场景 | 更生活化的形象、兴趣、照片、社交入口 |
| `event` | 企业活动、Meetup、展会 | 当前身份、项目、Demo、合作方向 |
| `partner` | 潜在合作方 | 商业项目、案例、能力介绍、联系入口 |

访问方式示例：

```text
https://your-site.com/resume
```

用户第一次通过这个后缀进入后，系统会把该版本写入 HTTP-only cookie。之后用户会自动回到无后缀地址：

```text
https://your-site.com
```

但接下来一定次数访问中，仍会看到这个隐藏版本的内容。

这适合非常定向的展示场景：你不用把所有信息都公开给所有人，也不用维护多个网站。

> 注意：隐藏版本不是严格权限系统。它适合做定向展示，不适合保存秘密、证件、私密资料或任何敏感信息。

---

## 🌐 版本和语言的关系

Bio Blocks Studio 的内容结构不是简单的“全站切换语言”，而是：

```text
版本 Variant
└── 语言 Locale
    └── 当前版本 + 当前语言下的独立内容
```

也就是说，同一个版本下面可以继续配置不同语言。

例如：

```text
resume:zh-Hans
resume:en
social:zh-Hans
event:zh-Hans
event:en
partner:en
```

这样你可以实现：

- 简历版有中文和英文
- 社交版只保留中文
- 企业活动版同时准备中文和英文
- 合作版只准备英文
- 每个版本的内容、语气、模块和重点都不一样

这比普通多语言网站更灵活，因为它不是单纯翻译同一份内容，而是允许你为不同受众准备不同表达。

---

## 🧱 页面模块

当前支持的主要内容块包括：

- 项目卡片
- 链接卡片
- 图片卡片
- 文本卡片
- 视频卡片
- 社交卡片
- 状态卡片
- 全宽章节文本块

全宽章节文本块只是内容块，不是容器。它可以用于分隔不同区域，例如：

```text
Selected Projects
About Me
Contact
Recent Work
```

所有模块共享同一个排序系统，所以你可以把文本块放在卡片上方、下方或中间。

---

## 🛠️ 技术栈

- Next.js App Router
- TypeScript
- Tailwind CSS
- dnd-kit
- Vercel Blob
- bcryptjs
- Zod
- Lucide React
- Sonner

---

## 🚀 快速部署上线

推荐部署到 Vercel。

完整应用不支持纯 GitHub Pages / 静态 HTML 部署。原因是项目使用了动态 Next.js 路由、cookie、后台 API routes、登录 session，以及 Vercel Blob 写入。

GitHub 适合用来托管源码，Vercel 适合用来运行应用。

---

### 🤖 方式一：让 AI Agent 帮你部署

如果你使用 Codex、Claude Code、Cursor 或其他代码 Agent，并且它已经连接了 Vercel的MCP 或 CLI 工具，可以把下面这段提示词交给 AI，让它帮你完成部署。

复制下面完整提示词给 AI Agent：

```text
请帮我把这个开源项目直接部署到我的 Vercel，并完成部署后的可用性检查。

项目仓库：
https://github.com/JiahaoTang-Alvin/bio-blocks-studio

我的后台登录密码：[请把这里改成你想要的后台登录密码]

项目说明：
这是一个 Next.js App Router 项目，需要 Vercel 运行时。
公开页面是个人主页。
后台路径是 /admin/login 和 /admin。
生产环境使用 Vercel Blob 保存站点配置和上传图片。
公开页面只读取内容，后台登录后才可以保存配置和上传图片。

请按下面步骤执行：
1. 在 Vercel 中直接导入公开仓库
   - 打开 Vercel 的 Add New Project / Import Project。
   - 直接使用这个公开仓库链接导入：
     https://github.com/JiahaoTang-Alvin/bio-blocks-studio
   - 如果 Vercel 支持通过 Git URL 导入，请直接使用 Git URL。
   - 如果 Vercel 需要我登录、授权 GitHub、授权 Vercel 或确认导入，请明确告诉我需要手动点击哪里。
2. 使用默认项目配置
   - Framework Preset 使用 Next.js。
   - Root Directory 保持为 ./。
   - Install Command、Build Command、Output Directory 保持 Vercel 默认识别结果。
   - 不要主动修改构建配置，除非构建日志明确要求。

3. 设置 Vercel 环境变量
   请在 Vercel Project 的 Production 环境中设置：
   NEXT_PUBLIC_SITE_URL=部署后的正式访问地址
   ADMIN_PASSWORD=我上面提供的后台登录密码

   重要：
   - ADMIN_PASSWORD 必须设置为我在提示词里填写的后台登录密码。
   - ADMIN_PASSWORD 是 /admin/login 的后台登录密码。
   - 不要把 ADMIN_PASSWORD 写入 README、前端代码、Git 提交记录或公开日志。
   - 如果部署前还不知道正式域名，可以先用 Vercel 自动生成的域名填写 NEXT_PUBLIC_SITE_URL。
   - 如果后面绑定了自定义域名，请更新 NEXT_PUBLIC_SITE_URL 后重新部署 Production。

4. 配置 Vercel Blob
   这个项目需要 Vercel Blob 来保存：
   - 站点配置 config/site-config.json
   - 上传的头像、图片模块、项目图、二维码等图片

   请在 Vercel 项目的 Storage 中创建 Blob Store。

   要求：
   - Blob Store 使用 Public access，因为公开主页需要读取配置和图片。
   - Blob Store 要连接到当前 Vercel Project。
   - Vercel 创建并连接 Blob Store 时，通常会自动添加相关环境变量。
   - 请重点确认当前 Vercel Project 的 Production 环境变量里存在：

     BLOB_READ_WRITE_TOKEN

   - 不要只看到 BLOB_STORE_ID 或 BLOB_WEBHOOK_PUBLIC_KEY 就结束。
   - 保存配置和上传图片需要 read-write token，也就是 BLOB_READ_WRITE_TOKEN。
   - 如果 BLOB_READ_WRITE_TOKEN 已经自动存在，只需要确认即可。
   - 如果不存在，请在 Blob Store 的 Project Connection / Settings 中，把 read-write token 添加到当前项目的环境变量里。

5. 不要额外设置这些变量，除非我明确要求
   - 不要主动设置 SESSION_SECRET。
   - 当前项目在 SESSION_SECRET 为空时，会从后台登录凭据派生 session signing secret，适合普通 no-code 部署。
   - 如果你确实需要设置 SESSION_SECRET，必须使用至少 32 个字符的随机字符串，并且不要显示给用户。

6. 部署或重新部署 Production
   - 完成环境变量和 Blob 设置后，触发 Production 部署或 Redeploy。
   - 等待部署完成，并确认状态为 Ready。

7. 部署后检查
   请检查以下内容：
   - 公开页面可以访问。
   - /admin/login 可以打开。
   - 可以使用我提供的 ADMIN_PASSWORD 登录后台。
   - /admin 后台可以进入。
   - 后台可以打开项目设置。
   - 点击保存一次后，没有因为缺少 BLOB_READ_WRITE_TOKEN 报错。
   - 保存后，Vercel Blob 中应该能写入站点配置。
   - 如果可以测试上传图片，请测试一次图片上传。
   - 如果不能测试上传图片，至少确认 /api/admin/upload 没有明显环境变量缺失问题。

8. 安全提醒
   - Vercel Blob 中的配置和上传图片是公开可读的。
   - 不要把密钥、证件、私人笔记、未公开凭证或敏感个人数据放进站点配置。
   - 隐藏版本只是面向不同受众展示不同内容，不是严格权限系统。
   - 隐藏访问后缀不能当作密码使用。

9. 如果遇到问题
   - 如果是 Vercel 或 GitHub 授权问题，请告诉我需要我手动点击哪里。
   - 如果 Vercel 不能直接导入公开 GitHub URL，请告诉我具体原因，并给出替代操作。
   - 如果是环境变量问题，请列出缺少哪个变量，不要显示已有变量的值。
   - 如果是 Blob 问题，请优先检查 BLOB_READ_WRITE_TOKEN 是否存在于当前 Vercel Project 的 Production 环境变量中。
   - 如果是构建失败，请读取构建日志，指出具体报错文件、报错原因和修复建议。
   - 不要泛泛地说“部署失败”，要给出下一步可执行操作。

最终请返回：
1. 生产环境访问链接
2. 后台登录链接
```

> 不要把后台密码写进公开仓库、README、Issue、公开聊天记录或前端代码。以后想换密码，去 Vercel 后台更新 `ADMIN_PASSWORD`，然后重新部署生产环境即可。

---

### 🧭 方式二：手动部署到 Vercel

<details>
<summary>展开完整手动部署步骤</summary>

#### 1. 打开 Vercel 并新建项目

打开 [Vercel](https://vercel.com/)，点击右上角：

```text
Add New... -> Project
```

<img width="720" alt="Vercel add new project" src="https://github.com/user-attachments/assets/2e8a7495-5d1d-43a1-a8c2-fbdb76bee8d0" />

---

#### 2. 导入 GitHub 仓库

在导入框中输入：

```text
https://github.com/JiahaoTang-Alvin/bio-blocks-studio
```

<img width="720" alt="Import GitHub repository" src="https://github.com/user-attachments/assets/bbdabceb-1b23-46c0-8609-033ed04c7d04" />

---

#### 3. 保持默认项目设置

在 New Project 页面保持默认设置：

```text
Framework Preset: Next.js
Root Directory: ./
```

<img width="720" alt="Vercel project settings" src="https://github.com/user-attachments/assets/5706e98b-edaa-4a04-b7f4-ba09b54fc936" />

---

#### 4. 添加管理员密码

展开 **Environment Variables**，添加：

```env
ADMIN_PASSWORD=你想要登录后台用的密码
```

`ADMIN_PASSWORD` 的 Value 填你想用的后台登录密码。建议使用一段自己能记住、但别人不容易猜到的短语。

<img width="720" alt="Add ADMIN_PASSWORD env" src="https://github.com/user-attachments/assets/f622bf09-ab32-488e-8f4b-8f297593a0d7" />

---

#### 5. 首次部署

点击 **Deploy**，等待第一次部署完成。

<img width="720" alt="Deploy project" src="https://github.com/user-attachments/assets/8aceebcc-b071-4428-8add-b75f10c8c440" />

> 第一次部署后，公开页面通常可以打开，但后台保存和图片上传还需要配置 Vercel Blob。

---

#### 6. 进入 Storage

进入刚部署好的 Vercel 项目，左侧点击 **Storage**。

<img width="720" alt="Open Storage" src="https://github.com/user-attachments/assets/0d5fdceb-7359-4dd8-8c5e-2567970586c6" />

---

#### 7. 创建 Blob Store

点击 **Create Database**，选择 **Blob**。

<img width="720" alt="Create Database" src="https://github.com/user-attachments/assets/0c8733ca-aac0-4772-8d4d-d066b7c4c8eb" />

<img width="720" alt="Choose Blob" src="https://github.com/user-attachments/assets/db95a23d-09bf-4956-bbc7-ef0c8622c3c3" />

---

#### 8. 设置 Blob Store

填写 Blob Store 名称，例如：

```text
personal-site-studio-blob
```

Region 建议选择离主要访问用户最近的区域。  
如果主要给中国、新加坡或东南亚用户访问，可以优先选择香港或新加坡，如果列表里有。

Access 选择：

```text
Public
```

然后点击 **Create**。

<img width="720" alt="Create public Blob store" src="https://github.com/user-attachments/assets/c95b133d-b32e-4b9f-a22d-98464d5f42ee" />

---

#### 9. 检查项目连接

创建后如果弹出连接项目的窗口，可以先关闭。Vercel 可能已经自动把 Blob 连接到了当前项目，重复点击 Connect 可能会提示已经连接。

回到左侧 **Storage**，点击刚创建的 Blob Store。

<img width="720" alt="Open Blob store" src="https://github.com/user-attachments/assets/44937894-e745-4576-b028-f22c024eda85" />

---

#### 10. 进入 Projects

进入 Blob Store 后，左侧点击 **Projects**。

<img width="720" alt="Blob projects" src="https://github.com/user-attachments/assets/d15918a9-0f5a-497d-bd37-47769ac540db" />

---

#### 11. 更新项目连接

在 Projects 列表里找到你的项目。刚开始 Info 里通常只有：

```text
BLOB_STORE_ID
BLOB_WEBHOOK_PUBLIC_KEY
```

点击这一行右侧的三个点 **...**，选择 **Update Project Connection**。

<img width="720" alt="Update project connection" src="https://github.com/user-attachments/assets/311aa46b-648d-4433-a7fb-b7ef1d683d1e" />

---

#### 12. 添加 read-write token

勾选：

```text
Add read-write token env var to this connection
```

<img width="720" alt="Add read-write token" src="https://github.com/user-attachments/assets/62a3f6f0-ade3-43e1-a0b8-c62ffde608dd" />

点击 **Save Changes**。

保存后 Info 里应该能看到：

```text
BLOB_READ_WRITE_TOKEN
BLOB_STORE_ID
BLOB_WEBHOOK_PUBLIC_KEY
```

<img width="720" alt="Blob env vars ready" src="https://github.com/user-attachments/assets/5ccf416e-8148-45bd-aac7-5cb27b30a4e3" />

---

#### 13. 重新部署 Production

回到项目左侧 **Deployments**。

找到最新的一条 Deployment，点击右侧三个点 **...**。

<img width="720" alt="Open deployments menu" src="https://github.com/user-attachments/assets/eca8b90b-7a85-4c99-a57c-2e72e9f56345" />

选择 **Redeploy**，等待状态变成 Ready。

---

#### 14. 登录后台

打开：

```text
https://你的域名/admin/login
```

使用 `ADMIN_PASSWORD` 里的密码登录。

<img width="720" alt="Admin login" src="https://github.com/user-attachments/assets/78d522b2-8ba8-4734-998f-b9e216101822" />

---

#### 15. 初始化站点配置

登录后打开「项目设置」，设置：

- 项目名称
- 公开站点标题
- 站点描述
- 站点 URL
- SEO 信息
- 语言
- 版本
- 主题和外观

然后点击保存一次，把生产配置写入 Vercel Blob。

<img width="720" alt="Admin project settings" src="https://github.com/user-attachments/assets/be23c48d-2175-491b-891b-8656f8578dfb" />

---

#### 16. 后续修改后台密码

如果后续要改后台密码，到 Vercel 项目的：

```text
Settings -> Environment Variables
```

更新：

```env
ADMIN_PASSWORD=新的后台密码
```

然后重新部署生产环境。

`SESSION_SECRET` 不是登录密码。只有在你想让所有旧登录立刻失效时，才需要同时更新它。

<img width="720" alt="Update env vars" src="https://github.com/user-attachments/assets/51074966-f0d2-4b4e-bf38-42c1ab824c34" />

</details>

---

## 💻 本地开发

```bash
npm install
npm run dev
```

打开：

```text
http://localhost:3000
```

公开页面在没有 Vercel Blob 的情况下也能运行，会回退到 `lib/default-site-config.ts` 的默认内容。

如果要本地测试后台登录、保存和上传，请配置 `.env.local`。

---

## 🔐 环境变量

从 `.env.example` 创建 `.env.local`：

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
BLOB_READ_WRITE_TOKEN=
ADMIN_PASSWORD=
```

最基本需要：

| 变量 | 说明 |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | 公开站点 URL。可以暴露给浏览器 |
| `ADMIN_PASSWORD` | 后台登录密码 |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob read/write token，用于保存配置和上传图片 |

可选增强项：

| 变量 | 说明 |
|---|---|
| `ADMIN_PASSWORD_HASH` | 后台密码的 bcrypt hash。设置后会优先使用 hash，并忽略 `ADMIN_PASSWORD` |
| `SESSION_SECRET` | 用于签名后台登录 session 的随机密钥，建议至少 32 个字符 |

不要把下面这些变量加上 `NEXT_PUBLIC_` 前缀：

```text
BLOB_READ_WRITE_TOKEN
ADMIN_PASSWORD
ADMIN_PASSWORD_HASH
SESSION_SECRET
```

它们必须只存在服务端。只有 `NEXT_PUBLIC_SITE_URL` 可以暴露给浏览器。

---

## 🧭 路由

| 路由 | 说明 |
|---|---|
| `/` | 公开个人主页 |
| `/[locale]` | 主版本指定语言入口，例如 `/en`、`/zh-CN` |
| `/admin/login` | 后台登录 |
| `/admin` | 可视化后台编辑器 |
| `/api/admin/config` | 登录后读取和保存配置 |
| `/api/admin/upload` | 登录后上传图片 |
| `/[accessCode]` | 隐藏版本访问入口，例如 `/resume`、`/event`、`/social` |
| `/[accessCode]/[locale]` | 隐藏版本指定语言入口，例如 `/resume/en` |

---

## 🗂️ 数据模型

站点由一个经过校验的 `SiteConfig` 驱动。

主要字段：

| 字段 | 说明 |
|---|---|
| `profile` | 头像、名称、简介、标签、社交链接和个人信息模块显示状态 |
| `sections` | 历史兼容字段；当前编辑器保持为空 |
| `blocks` | 项目、链接、图片、文本、社交、视频、状态卡片，以及全宽 `section` 文本块 |
| `theme` | 颜色、圆角、阴影和字体设置 |
| `settings` | 项目名称、公开标题、描述、URL、SEO、多语言、多版本和功能开关 |
| `contentVariants` | 可选的版本 / 语言内容快照，键名格式为 `variantId:locale` |

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

---

## 📦 配置导入导出

后台「项目设置」支持导出完整 `SiteConfig` JSON。

你可以用它来：

- 备份当前站点
- 迁移到新的 Vercel 项目
- 在多个站点之间复用结构
- 本地调试后同步到生产环境
- 为不同人快速复制一套主页模板

导入 JSON 后只会替换当前编辑草稿。检查无误后点击「保存」，才会写入 Vercel Blob。

---

## ✅ 验证

```bash
npm run lint
npm run typecheck
npm run build
npm audit --audit-level=moderate
```

---

## 📚 文档

- [Admin editor notes](docs/admin-editor-notes.md)
- [Project background for AI agents](docs/project-background.md)
- [Security and deployment notes](docs/security-and-deployment.md)

---

## 🧠 设计原则

- **像搭积木一样做主页**  
  用户应该通过拖拽和配置完成大部分内容维护，而不是每次改代码。

- **内容优先**  
  第一屏应该直接展示身份、重点项目和联系入口。

- **模块独立**  
  每个内容块都应该能独立移动、调整、隐藏和复用。

- **版本先于语言**  
  不同受众应该可以看到不同版本；每个版本下再按需要配置不同语言。

- **公开页只读，后台写入**  
  公开页面只负责展示，保存配置和上传图片必须通过登录后台完成。

- **隐藏版本用于定向展示**  
  隐藏版本适合给不同受众展示不同内容，但不应该被当作严格权限系统。

- **少依赖，易部署**  
  不引入传统数据库，让个人用户更容易部署、迁移和维护。

- **配置边界清晰**  
  Vercel Blob 适合保存公开展示内容，不适合保存任何秘密信息。

---

## 🚧 模板状态

这是一个仍在演进的可用模板。当前重点是：

- 个人主页展示
- 可视化编辑后台
- 模块化卡片布局
- 桌面端 / 移动端布局适配
- 多语言内容
- 隐藏版本
- Vercel Blob 持久化

后续可能会继续完善：

- 更完整的版本历史
- 更细的布局控制
- 更多模块类型
- 更好的模板市场 / 预设布局
- 更完善的迁移工具
- 登录限流
- 更复杂的权限系统

---

## License

MIT
