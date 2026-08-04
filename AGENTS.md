<!-- DWY-BASELINE:START 由 dwy 交互式同步生成，请勿手动编辑此区块 -->

所有回答必须使用中文。

## 输出完整性要求

- **文件路径**：必须输出完整的绝对路径（如 `/Users/chances/WebstormProjects/dwy-shared/frontend/eui/src/components/input/EInput.vue`），禁止省略为相对路径或只写文件名
- **服务地址**：必须输出完整的 URL（如 `http://localhost:8000/api/users`），禁止省略协议、端口或路径
- **数据库连接串**：必须输出完整连接字符串（如 `postgresql+asyncpg://user:pass@localhost:5432/mydb`），禁止只写主机名或库名

## 团队执行任务

任务执行前必须先分析 block；无 block 的任务使用多 Agent 并行执行以提高效率。

## 代码注释

- 所有代码都必须有注释。
- 类、接口、私有方法、函数、重要参数与重要字段都必须写明用途、约束与边界。
- 每个类顶部要有简短功能说明。
- 注释重点写“为什么”和“约束”，避免仅复述代码实现。

## 图标规范

- 图标优先使用成熟稳定的图标库，不使用 emoji 作为功能性图标。
- 优先选择项目已有成熟依赖；无可用依赖时再补充稳定方案。

## 发布与打包基础准则

- PyPI 与 npm 的发布必须走 GitHub Actions，使用 OIDC 完成鉴权，禁止使用长期静态发布凭据。
- 多平台打包必须走 GitHub Actions 工作流执行，不使用本地手工打包作为唯一流程。

## 减少常见 LLM 编码错误的行为指南

与项目特定指令合并使用。

权衡：这些指南偏向谨慎而非速度。对于琐碎任务，自行判断。

### 1. 先思考再编码

不要假设。不要隐藏困惑。把权衡摊开。

在实现之前：
- 明确陈述你的假设。如果不确定，就问。
- 如果存在多种解读，提出来——不要默默选择。
- 如果有更简单的方案，说出来。在必要时提出异议。
- 如果有什么不清晰，停下来。说出困惑是什么。然后提问。

### 2. 简单优先

解决问题的最小代码。没有推测性代码。

- 不做需求之外的功能。
- 不为一次性使用的代码做抽象。
- 不做未被要求的"灵活性"或"可配置性"。
- 不为不可能发生的场景做错误处理。
- 如果你写了 200 行但可以写成 50 行，重写它。
- 问自己："一个资深工程师会说这过于复杂吗？"如果是，简化。

### 写代码前走决策阶梯

写任何新代码前，从上往下逐级问，命中即停：

1. 这任务真需要存在吗？（YAGNI——能不做就不做）
2. 代码库里已有现成的吗？
3. 标准库覆盖吗？
4. 平台 / 框架原生特性有吗？
5. 已安装的依赖能做吗？
6. 能一行解决吗？
7. 以上都不行 → 才写最小代码。

刻意的简化用注释标注：跳过了什么、何时该加回。
红线——以下永不简化掉：输入校验、错误处理、安全、可访问性。先理解问题，再谈优化。

### 3. 精准改动

只动必须动的代码。只清理自己造成的混乱。

在编辑现有代码时：
- 不要"改进"相邻的代码、注释或格式。
- 不要重构没有问题的东西。
- 匹配现有的风格，即使你会用不同的写法。
- 如果发现不相关的死代码，提一下——但不要删除。

当你的改动产生孤儿代码时：
- 移除你的改动导致的未使用的 import/变量/函数。
- 除非被要求，不要移除已有的死代码。

检验标准：每一行改动的代码都应能直接追溯到用户的需求。

### 4. 目标驱动执行

定义成功标准。循环直到验证通过。

将任务转化为可验证的目标：
- "添加校验" → "编写无效输入的测试，然后让它们通过"
- "修复 bug" → "编写重现 bug 的测试，然后让它通过"
- "重构 X" → "确保测试在重构前后都通过"

对于多步骤任务，陈述一个简要计划：
1. [步骤] → 验证：[检查项]
2. [步骤] → 验证：[检查项]
3. [步骤] → 验证：[检查项]

强成功标准让你能独立循环。弱标准（"让它工作"）需要不断澄清。

这些指南在生效的标志是：diff 中不必要的改动变少，因过度复杂而重写的情况减少，澄清性问题出现在实现之前而非错误之后。

## 输出精简规则

输出保持精简，去掉冗余，保留技术精确性。

### 核心规则

- **去掉填充词**：不用"了/的/吧/吗/呢"等语气助词，不用"我认为/可能/也许/似乎"等模糊词
- **不用客套话**：不用"你好/请/谢谢/不客气"等社交用语，直入主题
- **允许碎片句**：不用强制完整主谓宾，短语表达即可
- **短优先**：能用短词就不用长词，能用一句话就不用两句话
- **技术术语精确**：变量名、函数名、错误信息、代码块等保持原样，不缩写
- **代码块完整**：代码必须完整可运行，不受精简规则影响

### 例外场景（恢复完整语气）

以下场景不得精简，必须清晰明确：
- 安全警告和风险提示
- 不可逆操作确认（删除、强制推送等）
- 需要用户决策的复杂多步骤流程
- 用户明确要求详细解释时

## 必须使用成熟开源方案

开发新功能时，先给出 3 到 5 个成熟开源方案，用户确认后再实现。默认不手写已有成熟方案。

### 决策流程（必须执行）

1. 用户需求触发：确认功能范围与技术栈约束。
2. 候选检索：给出 3 到 5 个成熟开源项目（按 npm/PyPI/GitHub stars、维护活跃度、许可证兼容性排序）并说明选型理由。
3. 用户选择：先不改代码，向用户返回“候选列表 + 选型对比 + 推荐项”，等待用户明确选择。
4. 选型确认后：仅对确认方案进行适配实现；未确认方案不落地。
5. 跨语言备选：若当前技术栈无合适方案，允许并必须先列出其他语言生态（如 Kotlin/Compose、Jetpack、Flutter、React Native、Web 生态）中可借鉴且成熟的 3 到 5 个替代方案，由用户确认后再继续落地；禁止直接从 0 开始造轮子。

### 强制规则

- **禁止**手写已有主流开源方案的功能，一律使用社区主流库
- 选用开源库优先级：项目已在用的依赖 > 社区主流方案 > 小众但适合的方案
- 当候选不足 3 个且无可用替代时，说明原因并请求用户确认是否允许自研。

## 代码简约原则

只写**必要的逻辑**，不写"以防万一"的冗余代码。信任内部代码和框架保证，只在系统**外边界**（用户输入、外部 API、文件 / 网络读入）做校验。

### 禁止的冗余模式

- **多余 fallback**：值已有明确来源时，不再 `value or default` / `value ?? default`
- **多余类型转换**：上游已是目标类型时，不再 `int(x)` / `Number(x)` / `String(x)`
- **多余 else**：上面已 return，下面不再写 else 分支（用 early return）
- **多余默认值**：调用方都传值时，不写形参默认值 + 空值检查
- **多余异常兜底**：`try { ... } catch { /* swallow */ }` 掩盖 bug；只捕获**预期**的具体异常，其余让它自然抛出
- **多余空集合检查**：能直接 `for ... in collection` 时，不要 `if len(x) > 0` 再循环

### 判断标准

写每一行防御代码前问自己：**这个情况在当前上下文真的会发生吗？**

- 会 → 写防御，注释说明触发条件
- 不会 → 不写，信任上游
- 不确定 → 查调用链确认，不要"以防万一"

| 位置 | 是否校验 |
|---|---|
| 用户输入、外部 API 响应、文件 / 网络读入 | 必须校验 |
| 内部模块调用（已有类型签名） | 信任，不重复校验 |

## 用户输入长度限制

所有用户输入必须限长 / 限大小，**前端 + 后端双层**：

- 前端：即时反馈，避免无效输入浪费带宽
- 后端：防绕过、防 DoS、防内存耗尽（前端可被绕过，后端必须再校验一次）

具体数字按业务语义推断（用户名几十字符、描述几百、正文几千、图片几 MB），无须硬编码统一表。

### 前端

凡接收用户输入的控件（`input` / `textarea` / 富文本 / 文件选择 / 批量项）→ 都必须有长度 / 大小上限，并配 schema 层校验兜底（防粘贴绕过原生 maxlength）。

### 后端

凡接收用户数据的字段 / Query / Path / Header → 必须显式声明长度上限。

- 分页 `page_size` 必须有上限
- 禁止用「松散字典 / map / any 类型」直接接收 body，必须有 schema
- 图片上传额外校验像素尺寸，防 decompression bomb

### 禁止

- 任一层无限制上线
- 仅前端限而后端不校验
- 后端用 dict / map / any 接收 body
- 分页 `page_size` 无上限
- 图片只校验文件大小不校验像素

## 自成长项目规则（project-rules）

写项目要自成长：同一类问题反复踩坑，主动沉淀成可复用规则，下次自动生效，不靠人事后总结。

- **触发**：写代码 / 排查问题时，同一类问题踩坑 **≥2 次**（重复的报错根因、踩同一个坑、被反复纠正同一处写法）。
- **动作**：把教训沉淀成一条可复用规则（写清「现象 / 根因 / 怎么避免」），追加到 `project-rules.md`；已有同类规则补充进去，不重复立条。
- **落盘位置**（按当前工具自动选）：
  - **Claude Code** → 项目 `.claude/rules/project-rules.md`（放进去即自动加载，无需注册）。
  - **Codex** → 项目根 `AGENTS.md`，写在 `<!-- DWY-RULES:START/END -->` 托管块**之外**的 `## [自成长] 项目规则` 节下。托管块内会被 `dwy codex sync` 整块覆盖，自成长内容**必落块外**。
- **方式**：自动沉淀，事后输出一行告知「已沉淀 <规则> 到 project-rules」，不打断当前任务、不逐条问用户。
- **边界**：只沉淀**可复用、跨任务**的教训；一次性 / 本任务特有的问题不立规则，避免噪音堆积。

<!-- DWY-BASELINE:END -->

<!-- DWY-RULES:START 由 dwy 交互式同步生成，请勿手动编辑此区块 -->

<!-- dwy-rule: dwy-dependency-freshness.md -->

## [dwy] 依赖版本新鲜度通用规则（首次技术选型下载依赖时，发布 <7 天的版本不采用；跨 npm/uv/Docker/Android/iOS/鸿蒙/Flutter 等所有栈）

> 首次技术选型下载依赖（引新包、选 base 镜像 / SDK 版本）时，刚发布的新版本常带回归 bug：构建失败、Docker 镜像缺层、API breaking change。本规则约束 AI 在装新依赖前主动查「版本发布时间」，避开 <7 天的版本。
>
> 适用**所有技术栈**：npm/pnpm、uv/pip、Docker、Android(Gradle/Maven)、iOS(CocoaPods/SPM)、鸿蒙(ohpm)、Flutter(pub) 以及未来出现的任何包管理器。下面给出总约束 + 各栈示例，未列出的栈按「查官方 registry 发布时间」通用流程自行判断。

## 一、适用边界

- **仅约束首次技术选型下载依赖**：新项目引入新包、新搭脚手架选 base 镜像 / SDK 版本、原项目引入此前没用过的依赖。
- **已安装的旧版本无需为此升级**。本规则只管「新装 / 新选」，不管「存量升级」。
- 7 天是**下限排除条件**，不是「必须选最近一个 ≥7 天的版本」。最终选哪个稳定版由 AI 综合判断（成熟度、维护活跃度、依赖体积、与项目栈兼容性）。

## 二、核心约束

- **必须**在首次安装 / 选定版本前，查候选版本的「首次发布时间」
  - 用官方 registry 的发布时间，**不是**上传时间、**不是** `latest` / `stable` tag 时间
- **禁止**采用发布时间距今 **<7 天**的版本
- **禁止**无脑用 `@latest` / `latest` / `stable` / 浮动 tag / 不带版本号安装——这些随时可能落到刚发布的新版本上
- 已安装版本**无需**为此规则升级

## 三、各栈查发布时间示例

未列出的栈，按「查官方 registry 元数据 → 取发布时间」自行处理。

| 栈 | 查发布时间方法 |
|---|---|
| npm / pnpm | `npm view <pkg> time --json`（取目标版本对应的时间字段） |
| uv / pip | PyPI JSON API：`https://pypi.org/pypi/<pkg>/json` 的 `releases[<version>][0].upload_time` |
| Docker | Docker Hub 镜像页 / API 的 `last_updated`；优先看具体 tag 的 push 时间 |
| Android (Gradle/Maven) | Maven Central `maven-metadata.xml` 的 `<lastUpdated>`（格式 yyyyMMddHHmmss） |
| iOS (CocoaPods) | `https://github.com/CocoaPods/Specs` 或仓库 release / tag 时间 |
| iOS (SPM) | 源仓库 release / tag 时间 |
| 鸿蒙 (ohpm) | ohpm registry 包元数据 publishTime |
| Flutter (pub) | `https://pub.dev/packages/<pkg>/versions` 页 published 时间 |

## 四、正反例

```bash
# 反例：直接装 latest，可能落到昨天才发的版本
pnpm add some-pkg@latest
uv add some-pkg          # 不锁版本
FROM node:latest         # 随时被新镜像覆盖
implementation 'com.example:lib:latest'

# 正例：先查发布时间，选发布 ≥7 天的稳定版
npm view some-pkg time --json      # 看候选版本发布时间
pnpm add some-pkg@1.2.3            # 1.2.3 发布已满 7 天
FROM node:20.18.1-slim             # 该 tag push 已满 7 天
```

## 五、AI 自判提示

- 栈未列全时，先找该栈的**官方 registry**（包管理器背后的中央仓库），查目标版本的发布时间字段。
- 拿不到精确发布时间时，保守处理：选发布更早、更稳定的版本，不要选「最新」。
- 7 天窗口内的新版本，**等待**而非采用，**无任何例外**（含安全补丁）。等满 7 天再用。

---

<!-- dwy-rule: dwy-git-commit.md -->

## [dwy] Git Commit 规范（提交安全、敏感扫描、Scope、消息规范、AI 署名治理）

## 1. 适用范围

适用于所有 Git 提交流程，覆盖：

- `git add`
- `git commit`
- 为提交生成或校验 commit message 的场景

任一步骤不通过：中止当前提交流交付流程。

## 2. 执行顺序（硬约束）

1. 安全写法检查
2. Stage 级敏感扫描
3. 变更范围确认
4. Scope 与 message 格式校验
5. AI 署名与生成声明校验

## 3. 安全写法（命令注入防护）

`git commit -m "..."` 会对双引号内内容做 shell 展开。出现反引号或 `$(...)` 时，禁止直接使用双引号形式。

### 3.1 推荐：消息文件提交（优先）

```bash
git commit -F /tmp/commit-msg.txt
```

```bash
cat > /tmp/commit-msg.txt <<'EOF'
feat: 示例提交说明

- 修改点 A
- 修改点 B
EOF
git commit -F /tmp/commit-msg.txt
```

### 3.2 允许：单引号提交

```bash
git commit -m 'feat: 支持 runConcurrent'
```

前提：message 内无单引号字符。

### 3.3 禁止：双引号直接携带反引号

```bash
git commit -m "feat: run `build-tool`"
```

上例存在命令替换风险。

### 3.4 兜底：转义（不推荐）

```bash
git commit -m "feat: run \`build-tool\`"
```

## 4. Stage 级敏感扫描（强制）

同时扫描：
- `git diff --cached`
- `git diff --cached --name-only`

### 4.1 禁止提交文件

`.env*`、`*.pem`、`*.key`、`*.p12`、`*.pfx`、`*.jks`、`*.keystore`、`*.sql`（真实数据）、`*.dump`、`*.sqlite`、`*.xlsx`、`*.csv`（敏感表）、`*.log`、`pgdata/`、`cache/*.json`。

### 4.2 禁止内容片段（示例）

`sk-` 开头 API Key、`AKIA` 开头 AWS Key、`ghp_` GitHub Token、`password=...`、`token=...`、`secret=...`、明文数据库连接串、私钥头、`IP:端口`、`ssh user@ip`。

### 4.3 例外

`.env.example`、环境变量读取方式、`localhost`/`127.0.0.1` 示例连接串可保留。

### 4.4 处理失败

1. 立即停止。
2. 输出 `文件名:行号:命中片段`。
3. 给出修复建议（`.gitignore`、改环境变量、替换占位符）。
4. 用户确认后继续；用户强制提交时，message body 追加：
   - `GIT-SECURITY: 用户已确认提交此内容`

## 5. 变更范围与提交拆分

先执行 `git diff --cached`，明确：修改了哪些模块、影响边界、是否一次可归因。

若单条 message 无法在 `subject` 中清晰表达，必须拆分 commit。

## 6. Commit Scope

Scope 由 AI 根据变更模块与项目语义自行决定，保持与现有提交习惯一致且可读。

- 单模块改动：优先加 scope，名称贴近主改动模块（如 `eui` / `backend` / `cli` 等）。
- 跨模块改动：可不带 scope。
- 无法稳定归类：短期使用无 scope，避免强行造新约束。

## 7. Commit Message 规则

格式：

`<type>(<scope>): <subject>`

或

`<type>: <subject>`

或

`<type>!: <subject>`

或

`<type>(<scope>)!: <subject>`

`type` 限定为：`feat`、`fix`、`refactor`、`chore`、`docs`、`test`、`perf`、`style`、`ci`。

`subject` 规则：

- 中文、动宾短语。
- ≤72 字符。
- 不用句号、不用“了”。
- 不得含 emoji。
- 可选 body 仅说明 why，不要复述 what。
- 破坏性变更：`feat!:` / `fix!:`（带 scope 时写成 `feat(<scope>)!:` / `fix(<scope>)!:`） + `BREAKING CHANGE: ...`

## 8. AI 署名与生成声明治理

commit 的 subject、body、footer、trailer 中禁止出现任何形式的 AI 署名或生成声明。AI 应自行判断：凡由 AI 工具（Claude、ChatGPT、GPT、Copilot、Cursor、Gemini、Llama、LLM 等）生成或参与撰写的署名、尾随声明、自动生成标记，均不得写入 commit message。

包括但不限于：

- `Co-Authored-By: <AI 名称> <noreply@...>`（任何 AI 产品 + 邮箱组合）
- `Generated with Claude Code` / `Generated with ...`（任何"由 XX 生成"声明）
- 含 AI 产品名的署名行（Claude、ChatGPT、GPT、Copilot、Cursor、Gemini、LLM 等）
- AI 平台noreply 邮箱（noreply@anthropic.com、noreply@openai.com 等）

`git commit -m "..."` 不得附带 AI 署名 trailer。

> PreToolUse hook `pre-git-commit-ai-signature-check.sh` 会在 commit message 中检出 Co-Authored-By / Generated with 等 AI 署名模式时硬拦截（exit 2），规则约束 + 工程兜底双保险。

## 9. 参考示例

- `feat(eui): 添加 Image 组件懒加载支持`
- `refactor(backend): 提取分页逻辑为共享工具`
- `fix(eui)!: 重构 EDialog open 属性为 v-model:open`
  - `BREAKING CHANGE: EDialog 不再接受 visible 属性，请改用 v-model:open`

---

<!-- dwy-rule: dwy-tdd-development.md -->

## [dwy] TDD 开发流程(新功能/bug 修复/重构的测试先行与回归策略)与测试-源码分隔(测试工程独立 tests/ 目录、镜像源码结构、各栈目录约定)

所有代码变更必须遵循测试驱动开发流程。测试不是事后补的，是开发的起点。

## 开发流程

### 新功能

1. 先写测试 — 定义预期行为，测试此时应失败
2. 再写实现 — 用最简代码让测试通过
3. 重构优化 — 在测试保护下重构，确保始终通过

### Bug 修复

1. 先写复现测试 — 写一个能暴露 bug 的测试用例，确认它失败
2. 再修代码 — 修复 bug，确认测试通过
3. 跑回归 — 确认没有引入新问题

### 重构

1. 先跑现有测试 — 确认当前全部通过
2. 再重构 — 修改代码
3. 再跑测试 — 确认行为没变

## 测试与源码分隔（硬约束）

测试工程必须与源码分隔，不混在一起。

### 核心规则

- 测试代码**禁止**与源码同目录混放；测试集中在项目根 / 包根的独立 `tests/` 目录。
- `tests/` **镜像源码结构**，测试文件与被测源码一一对应、可反查：
  - `src/foo/bar.ts` → `tests/foo/bar.test.ts`
  - `src/services/user.py` → `tests/test_user.py`
- 源码目录（`src/`）保持纯净，**只放产品代码**；打包 / 发布产物天然不含测试，CI 用一个目录通配即可圈定全部测试。
- 测试用的 fixture / mock 数据 / 测试工具，放 `tests/` 内（如 `tests/fixtures/`、`tests/conftest.py`），不散落进源码目录。

### 为什么（约束的根因）

测试混入源码目录会引发一连串问题，分隔后一次性收口：

- **被打包进发布产物**：测试随源码一起发到 npm / PyPI，污染产物、撑大体积。
- **source map / 内部细节泄露**：测试常含内部实现假设、mock 的真实数据，泄露到产物有安全风险。
- **覆盖率 / 构建统计污染**：测试文件被计入源码统计，覆盖率、行数失真。
- **CI 难圈定范围**：源码与测试交织，CI 无法用一条目录规则排除测试。
- **AI / 工具难定位**：找不到「源码↔测试」对应关系，反复把测试误写进 `src/`。

### 各栈目录与命令速查表

| 栈 | 测试目录 | 命名约定 | 运行命令 |
|----|---------|---------|---------|
| Vue / Vitest | `tests/` 镜像 `src/` | `*.test.ts` | `pnpm vitest run [路径]` |
| Python / pytest | `tests/` | `test_*.py` | `pytest tests/ -v` / `uv run pytest` |
| Android | `src/test/`（单元）+ `src/androidTest/`（仪器） | `*Test.kt` | `./gradlew test` / `./gradlew connectedAndroidTest` |
| Node / CLI | `tests/` 镜像 `src/` | `*.test.ts` | 对应 runner（vitest / jest） |

注：Android 的 `src/test` / `src/androidTest` 是 Gradle 生态**强约定**的独立测试源集（test source set），与 `src/main` 源码完全分隔，符合本规范"测试与源码分隔"理念，按其生态默认即可，**属合规分隔**，不视为"测试写进 src"。

**通用准则（表中未列的栈）**：遵循「独立测试目录 + 镜像源码结构 + 该生态主流 runner 约定」三条原则自行判断，不硬套上表布局。

## 回归测试

### 开发中：只跑受影响的测试

每次代码改动后，只运行受影响的测试文件，提高开发效率：

```bash
# 后端：只跑改动涉及的测试文件
uv run pytest tests/test_factor.py -v          # 改了 factor 相关代码
uv run pytest tests/test_tick.py tests/test_upload.py -v  # 改了多个模块

# 前端：只跑对应目录
pnpm vitest run tests/stores/               # 改了 store
pnpm vitest run tests/utils/format.test.ts   # 改了单个工具函数
```

判断"受影响的测试"的规则：
- 改了 `services/xxx.py` → 跑 `tests/test_xxx.py`
- 改了 `routers/xxx.py` → 跑 `tests/test_xxx.py`
- 改了 `schemas/` 或 `models/` → 跑引用了它们的测试
- 改了 `conftest.py` 或公共依赖 → 全量回归
- 不确定影响范围 → 全量回归

### 提交前：跑受影响的测试即可

提交前确保受影响的测试通过即可，不要求全量回归。全量测试留给 CI 或手动触发。

## TEST_CASES.md

每个包/项目维护一份 `TEST_CASES.md`，记录所有测试用例的清单。**`TEST_CASES.md` 跟测试目录走，不放项目根**：

- 有 `tests/` → 放 `tests/TEST_CASES.md`
- 测试源集分散（如 Android `src/test/`）→ 放对应测试根（`src/test/TEST_CASES.md`），与该模块测试同处
- 理念：测试清单是测试工程的一部分，归测试目录，与「测试与源码分隔」一致

内容要求：

- 人类可读，方便审查和手动编辑
- 新增/修改/删除功能时必须同步更新
- 内容与实际测试文件保持一致
- 作为版本回测基准

## 禁止事项

- **禁止**不写测试就提交功能代码
- **禁止**写完代码再补测试（先测试后代码）
- **禁止**测试不通过就提交
- **禁止** TEST_CASES.md 与实际测试不同步
- **禁止**测试文件写进 `src/` 源码目录（Android `src/test`、`src/androidTest` 例外，是 Gradle 标准测试源集）
- **禁止**测试目录结构与源码脱节（找不到「源码↔测试」对应关系）
- **禁止**把测试 fixture / mock 数据散落进源码目录

<!-- DWY-RULES:END -->
