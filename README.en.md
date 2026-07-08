<div align="center">

<h1>Bio Blocks Studio · Modular Personal Homepage Builder 🧩</h1>

<p>Build different versions of your personal homepage like stacking blocks.</p>

<p>Show your profile on the left, then freely arrange projects, images, videos, text, and links on the right. Supports hidden versions, multilingual content, and Vercel deployment.</p>

<p>
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-blue.svg"></a>
  <a href="https://nextjs.org/"><img alt="Next.js" src="https://img.shields.io/badge/Next.js-App%20Router-black.svg"></a>
  <a href="https://www.typescriptlang.org/"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-blue.svg"></a>
  <a href="https://vercel.com/"><img alt="Vercel" src="https://img.shields.io/badge/Deploy-Vercel-black.svg"></a>
  <a href="https://vercel.com/docs/storage/vercel-blob"><img alt="Vercel Blob" src="https://img.shields.io/badge/Storage-Vercel%20Blob-black.svg"></a>
</p>

<p>English | <a href="README.md">中文</a></p>

</div>

---

## ✨ What is this?

**Bio Blocks Studio** is an open-source modular personal homepage template.

It is inspired by block-based personal homepage products such as Bonjour. Instead of editing code every time or setting up a heavy CMS, you can log in to the `/admin` panel and build your homepage visually — like arranging cards, stacking blocks, or creating a small visual layout.

The page structure is simple:

* **Left side**: Your avatar, name, bio, tags, social links, contact entry, and personal information.
* **Right side**: Draggable and resizable content blocks, including projects, images, videos, text, links, social cards, and status cards.
* **Admin panel**: Edit content, adjust layout, upload images, switch themes, manage languages, and create hidden versions after logging in with a password.
* **Storage**: No traditional database required. Production content is stored in Vercel Blob.

> This project is not an official Bonjour project and is not affiliated with Bonjour. It is an open-source, self-hostable implementation inspired by modular personal homepage experiences.

---

## 🧩 Features

* **Modular homepage builder**
  Build your personal homepage with independent content blocks. Projects, images, videos, text, links, status cards, and social cards can all be arranged freely.

* **Visual drag-and-drop editing**
  Reorder blocks and adjust card sizes directly in the admin panel. No code changes are needed for normal content updates.

* **Two-column personal layout**
  The left side focuses on your identity and profile, while the right side displays your work, visual content, projects, links, and custom modules.

* **Separate desktop and mobile layouts**
  The same content can have different layout sizes for desktop and mobile, so the page remains usable across devices.

* **Hidden audience-specific versions**
  Create different homepage versions for different audiences, such as a resume version, social version, event version, or partnership version. Each version can have its own content and layout.

* **Languages under each version**
  This is not just “one website with multiple languages.”
  Each version can also have its own language variants. For example, your `resume` version can have both English and Chinese content, while your `social` version may only have a more casual Chinese version.

* **Image upload and cropping**
  Upload avatars, project images, content block images, QR codes, and other assets to Vercel Blob.

* **Project-level settings**
  Manage public site title, description, site URL, SEO metadata, theme, appearance, languages, and versions from the admin panel.

* **Config import and export**
  Export the full `SiteConfig` JSON for backup, migration, or reuse.

* **No traditional database**
  Production config and uploaded assets are stored in Vercel Blob, making the project lightweight and easy to deploy.

---

## 🎯 Use cases

Good for:

* Personal homepages
* Portfolio websites
* Indie developer pages
* Student resume pages
* Designer / creator profiles
* Freelancer introduction pages
* Project collection pages
* Link-in-bio style pages
* Different profile versions for different audiences

Examples:

| Scenario                     | How you can use it                                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 💼 Resume version            | Create a hidden version for recruiters, showing your resume, skills, projects, and contact information              |
| 🤝 Corporate event version   | Highlight your current role, projects, collaboration direction, and contact entry for events or business networking |
| 🍸 Social / casual version   | Show a more relaxed identity, interests, social links, photos, and recent status                                    |
| 🚀 Startup / product version | Display your products, demos, media links, case studies, and contact entry                                          |
| 🎓 Student portfolio         | Show school projects, software skills, personal experience, and screenshots                                         |
| 🎨 Creator homepage          | Display videos, social accounts, representative work, and collaboration details                                     |

Not suitable for:

* Complex CMS projects
* Multi-user collaborative admin systems
* Strict permission systems
* Sites that store private data
* E-commerce, comments, memberships, payments, or business workflows
* Pure GitHub Pages / static HTML deployment

---

## 🕶️ What are hidden versions?

Hidden versions are one of the most important features of this project.

You can create multiple audience-specific versions in the admin panel, such as:

```text
resume
job
social
bar
event
partner
v1
```

Each version can have its own:

* Profile information
* Visible or hidden modules
* Bio text
* Avatar or visual style
* Project order
* Content emphasis
* Layout and block arrangement

For example:

| Version   | Audience                               | Focus                                                                 |
| --------- | -------------------------------------- | --------------------------------------------------------------------- |
| `resume`  | Recruiters, HR, interviewers           | Education, skills, projects, resume, contact information              |
| `social`  | New friends or casual contacts         | Interests, social accounts, casual introduction, current status       |
| `bar`     | Bar, meetup, or casual social scenes   | More lifestyle-oriented identity, interests, photos, and social links |
| `event`   | Corporate events, meetups, exhibitions | Current identity, projects, demos, collaboration direction            |
| `partner` | Potential partners                     | Business projects, case studies, capabilities, contact entry          |

Example access URL:

```text
https://your-site.com/resume
```

When a visitor enters through this suffix, the system stores the selected version in an HTTP-only cookie. The visitor is then redirected back to the clean root URL:

```text
https://your-site.com
```

For the next limited number of visits, they will continue seeing that hidden version.

This is useful when you want to show different information to different people without maintaining multiple websites.

> Hidden versions are not a strict access-control system. They are designed for audience-specific presentation, not for storing secrets, documents, credentials, or sensitive personal data.

---

## 🌐 Versions and languages

Bio Blocks Studio does not use a simple “global language switch” model.

Instead, the content structure is:

```text
Variant
└── Locale
    └── Independent content for the selected version and language
```

That means each version can have its own language variants.

For example:

```text
resume:zh-Hans
resume:en
social:zh-Hans
event:zh-Hans
event:en
partner:en
```

This allows you to create:

* A resume version in both Chinese and English
* A social version only in Chinese
* An event version in both Chinese and English
* A partnership version only in English
* Different tone, content, modules, and priorities for each audience

This is more flexible than a normal multilingual website because you are not forced to translate the same content everywhere. You can prepare different expressions for different audiences.

---

## 🧱 Content blocks

Current supported block types include:

* Project card
* Link card
* Image card
* Text card
* Video card
* Social card
* Status card
* Full-width section text block

A full-width section block is a content block, not a container. It can be used to separate areas such as:

```text
Selected Projects
About Me
Contact
Recent Work
```

All blocks share the same ordering system, so section text blocks can appear above, below, or between cards.

---

## 🛠️ Tech stack

* Next.js App Router
* TypeScript
* Tailwind CSS
* dnd-kit
* Vercel Blob
* bcryptjs
* Zod
* Lucide React
* Sonner

---

## 🚀 Quick deployment

Vercel is the recommended deployment platform.

The full application does not support pure GitHub Pages or static HTML deployment because it uses dynamic Next.js routes, cookies, admin API routes, login sessions, and Vercel Blob writes.

GitHub is suitable for hosting the source code. Vercel is suitable for running the application.

---

### 🤖 Option 1: Deploy with an AI Agent

If you use Codex, Claude Code, Cursor, or another coding agent, and it has access to Vercel MCP or Vercel CLI tools, you can give it the prompt below to deploy this project for you.

Copy the full prompt below and send it to your AI Agent:

```text
Please deploy this open-source project directly to my Vercel account and complete a post-deployment usability check.

Project repository:
https://github.com/JiahaoTang-Alvin/bio-blocks-studio

My admin login password:
[Replace this with the admin password you want to use]

Project notes:
This is a Next.js App Router project and requires the Vercel runtime.
The public page is a personal homepage.
The admin paths are /admin/login and /admin.
Production uses Vercel Blob to store site config and uploaded images.
The public page only reads content. Config saving and image uploads are only available after admin login.

Please follow these steps:

1. Import the public repository directly into Vercel
   - Open Vercel Add New Project / Import Project.
   - Import directly from this public repository URL:
     https://github.com/JiahaoTang-Alvin/bio-blocks-studio
   - If Vercel supports importing by Git URL, use the Git URL directly.
   - If Vercel requires me to log in, authorize GitHub, authorize Vercel, or confirm the import, clearly tell me where I need to click.

   Important:
   - Do not fork the repository.
   - Do not copy the repository to my GitHub.
   - Do not create a new GitHub repository.
   - Do not convert the project to GitHub Pages.
   - Do not convert it to static HTML.
   - Do not use next export.

2. Use default Vercel project settings
   - Framework Preset should be Next.js.
   - Root Directory should remain ./.
   - Keep Install Command, Build Command, and Output Directory as Vercel detects them by default.
   - Do not change build settings unless the build logs clearly require it.

3. Set Vercel environment variables
   In the Vercel Project Production environment, set:

   NEXT_PUBLIC_SITE_URL=the final production URL
   ADMIN_PASSWORD=the admin login password I provided above

   Important:
   - ADMIN_PASSWORD must be set to the password I wrote in this prompt.
   - ADMIN_PASSWORD is the login password for /admin/login.
   - Do not write ADMIN_PASSWORD into README files, frontend code, Git commits, or public logs.
   - If the final domain is not known before deployment, use the Vercel-generated domain for NEXT_PUBLIC_SITE_URL first.
   - If I later bind a custom domain, update NEXT_PUBLIC_SITE_URL and redeploy Production.

4. Configure Vercel Blob
   This project needs Vercel Blob to store:
   - Site config at config/site-config.json
   - Uploaded avatars, image blocks, project images, QR codes, and other images

   Please create a Blob Store in the Vercel project Storage area.

   Requirements:
   - Blob Store should use Public access, because the public homepage needs to read config and images.
   - Blob Store must be connected to the current Vercel Project.
   - When Vercel creates and connects a Blob Store, it usually adds related environment variables automatically.
   - Please specifically confirm that the current Vercel Project Production environment contains:

     BLOB_READ_WRITE_TOKEN

   - Do not stop after seeing only BLOB_STORE_ID or BLOB_WEBHOOK_PUBLIC_KEY.
   - Saving config and uploading images require the read-write token, which is BLOB_READ_WRITE_TOKEN.
   - If BLOB_READ_WRITE_TOKEN already exists automatically, just confirm it.
   - If it does not exist, add the read-write token to the current project environment variables from the Blob Store Project Connection / Settings area.

5. Do not set extra variables unless I explicitly ask
   - Do not proactively set SESSION_SECRET.
   - When SESSION_SECRET is empty, this project derives the session signing secret from the admin login credentials, which is suitable for normal no-code deployment.
   - If you truly need to set SESSION_SECRET, use a random string with at least 32 characters and do not reveal it to the user.

6. Deploy or redeploy Production
   - After environment variables and Blob are configured, trigger a Production deployment or Redeploy.
   - Wait until the deployment is complete and the status is Ready.

7. Post-deployment checks
   Please check the following:

   - The public page is accessible.
   - /admin/login opens correctly.
   - I can log in with the ADMIN_PASSWORD provided above.
   - /admin can be accessed after login.
   - Project Settings can be opened in the admin panel.
   - Saving once does not fail due to missing BLOB_READ_WRITE_TOKEN.
   - After saving, the site config should be written into Vercel Blob.
   - If image upload can be tested, test one image upload.
   - If image upload cannot be tested, at least confirm that /api/admin/upload does not have an obvious missing environment variable issue.

8. Security reminders
   - Config and uploaded images in Vercel Blob are publicly readable.
   - Do not put secrets, identity documents, private notes, unreleased credentials, or sensitive personal data into the site config.
   - Hidden versions are only for audience-specific presentation, not strict access control.
   - Hidden access suffixes should not be treated as passwords.

9. If something goes wrong
   - If the problem is Vercel or GitHub authorization, tell me exactly where I need to click.
   - If Vercel cannot import the public GitHub URL directly, tell me the specific reason and give an alternative.
   - If the problem is environment variables, list which variable is missing. Do not show existing variable values.
   - If the problem is Blob, first check whether BLOB_READ_WRITE_TOKEN exists in the current Vercel Project Production environment.
   - If the build fails, read the build logs and identify the exact file, cause, and suggested fix.
   - Do not only say “deployment failed.” Give the next executable step.

At the end, return:
1. Production URL
2. Admin login URL
```

> Do not put your admin password in a public repository, README, Issue, public chat, or frontend code. To change the password later, update `ADMIN_PASSWORD` in Vercel environment variables and redeploy Production.

---

### 🧭 Option 2: Manual deployment on Vercel

<details>
<summary>Show full manual deployment steps</summary>

#### 1. Open Vercel and create a new project

Open [Vercel](https://vercel.com/) and click:

```text
Add New... -> Project
```

<img width="720" alt="Vercel add new project" src="https://github.com/user-attachments/assets/2e8a7495-5d1d-43a1-a8c2-fbdb76bee8d0" />

---

#### 2. Import the GitHub repository

Enter the repository URL:

```text
https://github.com/JiahaoTang-Alvin/bio-blocks-studio
```

<img width="720" alt="Import GitHub repository" src="https://github.com/user-attachments/assets/bbdabceb-1b23-46c0-8609-033ed04c7d04" />

---

#### 3. Keep default project settings

On the New Project page, keep the default settings:

```text
Framework Preset: Next.js
Root Directory: ./
```

<img width="720" alt="Vercel project settings" src="https://github.com/user-attachments/assets/5706e98b-edaa-4a04-b7f4-ba09b54fc936" />

---

#### 4. Add the admin password

Expand **Environment Variables** and add:

```env
ADMIN_PASSWORD=your-admin-login-password
```

Use a password phrase that you can remember but others cannot easily guess.

<img width="720" alt="Add ADMIN_PASSWORD env" src="https://github.com/user-attachments/assets/f622bf09-ab32-488e-8f4b-8f297593a0d7" />

---

#### 5. First deployment

Click **Deploy** and wait for the first deployment to finish.

<img width="720" alt="Deploy project" src="https://github.com/user-attachments/assets/8aceebcc-b071-4428-8add-b75f10c8c440" />

> After the first deployment, the public page may be available, but saving content and uploading images still require Vercel Blob setup.

---

#### 6. Open Storage

Enter the deployed Vercel project and click **Storage** in the left sidebar.

<img width="720" alt="Open Storage" src="https://github.com/user-attachments/assets/0d5fdceb-7359-4dd8-8c5e-2567970586c6" />

---

#### 7. Create a Blob Store

Click **Create Database** and choose **Blob**.

<img width="720" alt="Create Database" src="https://github.com/user-attachments/assets/0c8733ca-aac0-4772-8d4d-d066b7c4c8eb" />

<img width="720" alt="Choose Blob" src="https://github.com/user-attachments/assets/db95a23d-09bf-4956-bbc7-ef0c8622c3c3" />

---

#### 8. Configure the Blob Store

Set a Blob Store name, for example:

```text
personal-site-studio-blob
```

Choose a region close to your main visitors.
If most visitors are from China, Singapore, or Southeast Asia, choose Hong Kong or Singapore if available.

Set Access to:

```text
Public
```

Then click **Create**.

<img width="720" alt="Create public Blob store" src="https://github.com/user-attachments/assets/c95b133d-b32e-4b9f-a22d-98464d5f42ee" />

---

#### 9. Check project connection

If a project connection dialog appears after creation, you can close it first. Vercel may have already connected the Blob Store to the current project. Clicking Connect again may show that it is already connected.

Return to **Storage** and open the Blob Store you just created.

<img width="720" alt="Open Blob store" src="https://github.com/user-attachments/assets/44937894-e745-4576-b028-f22c024eda85" />

---

#### 10. Open Projects

Inside the Blob Store, click **Projects** in the left sidebar.

<img width="720" alt="Blob projects" src="https://github.com/user-attachments/assets/d15918a9-0f5a-497d-bd37-47769ac540db" />

---

#### 11. Update project connection

Find your project in the Projects list. At first, the Info column usually only contains:

```text
BLOB_STORE_ID
BLOB_WEBHOOK_PUBLIC_KEY
```

Click the three-dot menu **...** on the right side of the project row and choose **Update Project Connection**.

<img width="720" alt="Update project connection" src="https://github.com/user-attachments/assets/311aa46b-648d-4433-a7fb-b7ef1d683d1e" />

---

#### 12. Add the read-write token

Check:

```text
Add read-write token env var to this connection
```

<img width="720" alt="Add read-write token" src="https://github.com/user-attachments/assets/62a3f6f0-ade3-43e1-a0b8-c62ffde608dd" />

Click **Save Changes**.

After saving, the Info column should include:

```text
BLOB_READ_WRITE_TOKEN
BLOB_STORE_ID
BLOB_WEBHOOK_PUBLIC_KEY
```

<img width="720" alt="Blob env vars ready" src="https://github.com/user-attachments/assets/5ccf416e-8148-45bd-aac7-5cb27b30a4e3" />

---

#### 13. Redeploy Production

Go back to the project and open **Deployments**.

Find the latest deployment and click the three-dot menu **...**.

<img width="720" alt="Open deployments menu" src="https://github.com/user-attachments/assets/eca8b90b-7a85-4c99-a57c-2e72e9f56345" />

Choose **Redeploy** and wait until the status becomes Ready.

---

#### 14. Log in to the admin panel

Open:

```text
https://your-domain/admin/login
```

Log in with your `ADMIN_PASSWORD`.

<img width="720" alt="Admin login" src="https://github.com/user-attachments/assets/78d522b2-8ba8-4734-998f-b9e216101822" />

---

#### 15. Initialize site settings

After logging in, open **Project Settings** and configure:

* Project name
* Public site title
* Site description
* Site URL
* SEO metadata
* Languages
* Versions
* Theme and appearance

Then save once to write the production config into Vercel Blob.

<img width="720" alt="Admin project settings" src="https://github.com/user-attachments/assets/be23c48d-2175-491b-891b-8656f8578dfb" />

---

#### 16. Change admin password later

To change the admin password later, go to the Vercel project:

```text
Settings -> Environment Variables
```

Update:

```env
ADMIN_PASSWORD=new-admin-password
```

Then redeploy Production.

`SESSION_SECRET` is not the login password. You only need to update it if you want all previous login sessions to become invalid immediately.

<img width="720" alt="Update env vars" src="https://github.com/user-attachments/assets/51074966-f0d2-4b4e-bf38-42c1ab824c34" />

</details>

---

## 💻 Local development

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

The public page can run without Vercel Blob. In that case, it falls back to the default content in:

```text
lib/default-site-config.ts
```

To test admin login, saving, and uploads locally, configure `.env.local`.

---

## 🔐 Environment variables

Create `.env.local` from `.env.example`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
BLOB_READ_WRITE_TOKEN=
ADMIN_PASSWORD=
```

Basic variables:

| Variable                | Description                                                         |
| ----------------------- | ------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`  | Public site URL. This can be exposed to the browser                 |
| `ADMIN_PASSWORD`        | Admin login password                                                |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob read/write token for saving config and uploading images |

Optional variables:

| Variable              | Description                                                                        |
| --------------------- | ---------------------------------------------------------------------------------- |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of the admin password. If set, it takes priority over `ADMIN_PASSWORD` |
| `SESSION_SECRET`      | Random secret for signing admin login sessions. At least 32 characters recommended |

Do not add the `NEXT_PUBLIC_` prefix to these variables:

```text
BLOB_READ_WRITE_TOKEN
ADMIN_PASSWORD
ADMIN_PASSWORD_HASH
SESSION_SECRET
```

They must stay server-side only. Only `NEXT_PUBLIC_SITE_URL` may be exposed to the browser.

---

## 🧭 Routes

| Route               | Description                                                     |
| ------------------- | --------------------------------------------------------------- |
| `/`                 | Public personal homepage                                        |
| `/admin/login`      | Admin login                                                     |
| `/admin`            | Visual admin editor                                             |
| `/api/admin/config` | Read and save config after login                                |
| `/api/admin/upload` | Upload images after login                                       |
| `/[accessCode]`     | Hidden version entry, such as `/resume`, `/event`, or `/social` |

---

## 🗂️ Data model

The site is driven by a validated `SiteConfig`.

Main fields:

| Field             | Description                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------------- |
| `profile`         | Avatar, name, bio, tags, social links, and profile display settings                           |
| `sections`        | Legacy compatibility field. The current editor keeps this empty                               |
| `blocks`          | Project, link, image, text, social, video, status cards, and full-width `section` text blocks |
| `theme`           | Colors, border radius, shadows, and font settings                                             |
| `settings`        | Project name, public title, description, URL, SEO, languages, versions, and feature toggles   |
| `contentVariants` | Optional version / language content snapshots. Keys use the `variantId:locale` format         |

Production config is stored in Vercel Blob:

```text
config/site-config.json
```

Uploaded images are stored in:

```text
images/avatar
images/blocks
images/gallery
images/qrcode
```

The config and images stored in Blob are publicly readable. Do not store secrets, private notes, unreleased credentials, or sensitive personal data in the config.

---

## 📦 Config import and export

The admin panel supports exporting the full `SiteConfig` JSON from **Project Settings**.

You can use it to:

* Back up your current site
* Migrate to a new Vercel project
* Reuse the same structure across multiple sites
* Sync local testing content to production
* Quickly duplicate a homepage template for another person

Importing JSON only replaces the current editing draft. It will not write to Vercel Blob until you review the content and click Save.

---

## ✅ Validation

```bash
npm run lint
npm run typecheck
npm run build
npm audit --audit-level=moderate
```

---

## 📚 Documentation

* [Admin editor notes](docs/admin-editor-notes.md)
* [Project background for AI agents](docs/project-background.md)
* [Security and deployment notes](docs/security-and-deployment.md)

---

## 🧠 Design principles

* **Build a homepage like stacking blocks**
  Users should be able to maintain most content through visual editing instead of code changes.

* **Content first**
  The first screen should clearly show identity, key projects, and contact entry.

* **Independent modules**
  Each content block should be movable, resizable, hideable, and reusable.

* **Version before language**
  Different audiences can see different versions. Each version can then have its own languages.

* **Public page reads, admin writes**
  The public page only displays content. Saving config and uploading images must go through the logged-in admin panel.

* **Hidden versions are for targeted presentation**
  Hidden versions help show different content to different audiences, but they should not be treated as a strict permission system.

* **Lightweight and easy to deploy**
  No traditional database is required, making the project easier to deploy, migrate, and maintain.

* **Clear public data boundary**
  Vercel Blob is suitable for public display content, not for storing secrets.

---

## 🚧 Project status

This is a usable template that is still evolving. Current focus areas:

* Personal homepage display
* Visual admin editor
* Modular card layout
* Desktop / mobile layout adaptation
* Multilingual content
* Hidden versions
* Vercel Blob persistence

Possible future improvements:

* More complete version history
* More detailed layout controls
* More block types
* Better template presets
* Improved migration tools
* Login rate limiting
* More advanced permission system

---

## License

MIT
