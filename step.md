这是一份基于我们之前确定的 **"React (Web) + React Native (App) + Spring Boot (Backend)"** 架构，专门为您定制的 **VS Code 从 0 到 1 实战构建指南**。

我们将摒弃复杂的理论，直接进入“手术室”级别的操作步骤。

---

### Phase 0: 环境准备 (Prerequisites)

在敲下一行代码前，请确保您的基础设施已就绪。这是逻辑闭环的基础。

1. **Node.js (LTS)**: 推荐 v20+ (前端构建依赖)。
2. **JDK 17+**: (Spring Boot 3.x 必须)。
3. **Android Studio / Xcode**: (React Native 编译环境)。
4. **VS Code 插件 (必装)**:

- **Nx Console**: (核心指挥部，可视化操作)。
- **Extension Pack for Java**: (Java 调试)。
- **Spring Boot Tools**: (Spring 专享)。
- **ES7+ React/Redux/React-Native snippets**: (代码补全)。

---

### Phase 1: 初始化 Monorepo 空壳 (The Foundation)

我们将创建一个空的 Nx 工作区，然后像搭积木一样填入应用。

1. **打开终端 (Terminal)**，运行：

```bash
npx create-nx-workspace@latest juxyi-cms

```

2. **交互式选择** (请严格按此选择以保持架构纯净)：

- `Where would you like to create your workspace?` -> **. (当前目录)** 或直接回车
- `Which stack do you want to use?` -> **None** (选这个！我们要手动控制架构)
- `Package-based or Integrated?` -> **Integrated** (我们需要 Nx 的插件能力)
- `CI` -> **Skip** (稍后配置 Azure)

3. **进入目录**：

```bash
cd juxyi-cms
code .  # 用 VS Code 打开

```

---

### Phase 2: 构建 Web 前端 (The Web Shell)

我们将使用 Vite 构建 React 应用。

1. **安装 React 插件**：

```bash
npm install -D @nx/react

```

2. **生成前端应用**：

```bash
# --bundler=vite 是关键
npx nx g @nx/react:app apps/frontend --bundler=vite --style=css --routing --e2eTestRunner=playwright

```

3. **验证**：
   查看 `apps/frontend/project.json`，确保 targets 里有 `build` 和 `serve`。

---

### Phase 3: 构建移动端 App (The Mobile Shell)

1. **安装 React Native 插件**：

```bash
npm install -D @nx/react-native

```

2. **生成移动端应用**：

```bash
# 这会自动处理 Metro 配置和 Symlink 问题
npx nx g @nx/react-native:app apps/mobile --install=true

```

3. **关键修复** (针对 Git)：
   React Native 会生成 `.gitignore`。请检查根目录的 `.gitignore`，确保没有把 `apps/mobile/android` 或 `ios` 误忽略掉。

---

### Phase 4: 构建后端 (The Java Sovereign)

这是最关键的一步。我们不使用 Nx 的 Java 生成器，而是手动植入一个标准的 Spring Boot 项目，以保持其独立性。

1. **生成 Spring Boot 项目**：

- 访问 [start.spring.io](https://start.spring.io/)。
- Project: **Gradle - Groovy**.
- Language: **Java**.
- Spring Boot: **3.4.x**.
- Dependencies: `Spring Web`, `Lombok`, `Spring Data JPA`.
- **点击 GENERATE**，下载压缩包。

2. **植入 Monorepo**：

- 在 `apps/` 目录下新建文件夹 `backend`。
- 解压下载的文件，将内容（`src`, `build.gradle`, `settings.gradle` 等）**全部复制**到 `apps/backend/` 中。

3. **接入 Nx (The Bridge)**：
   在 `apps/backend/` 下手动创建一个 `project.json` 文件，让 Nx 能控制它：

```json
{
  "name": "backend",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "apps/backend/src",
  "projectType": "application",
  "tags": ["type:api", "lang:java"],
  "targets": {
    "build": {
      "executor": "nx:run-commands",
      "options": {
        "cwd": "apps/backend",
        "command": "./gradlew build -x test"
      },
      "outputs": ["{projectRoot}/build"]
    },
    "serve": {
      "executor": "nx:run-commands",
      "options": {
        "cwd": "apps/backend",
        "command": "./gradlew bootRun"
      }
    }
  }
}
```

---

### Phase 5: 创建共享库 (The Glue)

现在我们将创建连接 Web 和 Mobile 的共享逻辑库。

1. **生成 API 客户端库**：

```bash
npx nx g @nx/js:lib libs/shared/api-client --bundler=tsc

```

2. **使用库**：

- 在 `libs/shared/api-client/src/lib/` 下写代码（如 `export const API_URL = '...';`）。
- 在 `apps/frontend/src/app.tsx` 中尝试输入 `import { API_URL } from ...`，VS Code 应该会自动补全为 `@juxyi-cms/shared/api-client`。

---

### Phase 6: 启动与验证 (Execution)

现在，见证 Monorepo 的威力。

1. **启动后端**：
   打开 VS Code 终端：

```bash
npx nx serve backend
# 或者直接点击 Nx Console 里的 backend -> serve

```

_此时 Spring Boot 应该在 8080 端口启动。_ 2. **启动 Web 前端**：
新建一个终端窗口：

```bash
npx nx serve frontend

```

_Vite 应该在 4200 端口启动。_ 3. **启动 Mobile (Android)** (需启动模拟器)：
新建终端：

```bash
npx nx run-android mobile

```

---

### Phase 7: 最终目录结构检查

如果您的操作无误，您的目录结构应该长这样：

```text
juxyi-cms/
├── apps/
│   ├── backend/          # 有 build.gradle 和 project.json
│   ├── frontend/         # 有 vite.config.ts 和 project.json
│   └── mobile/           # 有 android/ios 目录 和 project.json
├── libs/
│   └── shared/
│       └── api-client/   # 有 tsconfig.lib.json
├── nx.json
├── package.json
└── tsconfig.base.json    # 自动包含了 paths 映射

```

### 下一步建议

您现在的核心骨架已经搭建完毕。接下来的逻辑步骤是：

1. **配置代理**：在 `apps/frontend/vite.config.ts` 中配置 Proxy 指向 `localhost:8080`。
2. **API 生成**：配置 `openapi-generator`，让后端一改，前端自动变。

需要我指导如何配置 **Vite 的反向代理** 来解决跨域问题吗？
