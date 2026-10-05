# 如何修改问卷

这份说明写给改问卷和材料清单的人，不需要懂代码。问卷的全部内容只在三个文件里：

| 改什么                             | 文件                                        |
| ---------------------------------- | ------------------------------------------- |
| 有哪些题、什么顺序、怎么作答       | `packages/core/src/intake/questionnaire.ts` |
| 题面、提示语、选项、节标题（中文） | `apps/web/messages/zh-CN.json`              |
| 同上（英文）                       | `apps/web/messages/en.json`                 |

改完之后在仓库根目录运行：

```
pnpm check:intake
```

一秒左右出结果。全部通过就可以提交；没通过的话，它会用中文说清楚是哪个文件、哪一条、该怎么改。**一次会列出所有问题**，照着改完再跑一次即可。

---

## 你可以随便改的

- **文案**：任何题面、提示语、选项文字、节标题。中英文两个文件都要改，而且**分别撰写，不要互译**（见 `design/guidelines/internationalization-en.md` §7）。
- **顺序**：在 `questionnaire.ts` 里把一道题（一整行或一整块）挪到别的位置，或者把整节挪动。顺序不影响后台。
- **补充题**：标了 `extra: true` 的题，可以随意新增、修改、删除，放在任何一节，也可以单独成一节。

## 需要工程师的

没有标 `extra: true` 的题叫**核心题**。后台生成材料、材料清单、conductor 都按它们读答案，所以它们的 **id、作答方式（文字/日期/选择）、校验规则、选项** 都记录在 `contract.lock.json` 里。改动其中任何一项，`pnpm check:intake` 都会提示「这一项属于作业契约」，请找工程师。

核心题的**顺序和文案**仍然可以随便改。

---

## 加一道补充题

例：在「行程安排」里加一道「第一晚住哪家酒店？」

**1. 在 `questionnaire.ts` 的 `travel` 节里加一行：**

```ts
{ id: "hotelName", extra: true, rule: text(1, 100), example: "Hotel Sol Madrid" },
```

- `id`：英文字母和数字，小写字母开头。它会出现在网址里，**上线后不要再改**，否则已经填过的答案会对不上。
- `extra: true`：表示这是补充题。
- `rule`：什么样的答案算合格。常用的：
  - `text(1, 100)`：1 到 100 个字
  - `dateString`：日期（同时要写 `kind: "date"`）
  - `pastDate`：今天或以前的日期（同时要写 `kind: "date"`）
  - 其他规则见 `rules.ts`；需要新规则请找工程师。
- `example`：一个合格的示例答案。检查会用它验证规则选得对不对，自动测试也会用它来填这道题。

**2. 在两个文案文件的 `intake.question.travel` 下各加一条：**

`zh-CN.json`：

```json
"hotelName": "第一晚住哪家酒店？",
"hotelNameHint": "写预订单上的酒店名称。"
```

`en.json`：

```json
"hotelName": "Which hotel is the first night in?",
"hotelNameHint": "As it appears on the booking."
```

提示语（`…Hint`）可以不写；写了就会显示在题目下面。

**3. 运行 `pnpm check:intake`。**

## 加一道选择题

```ts
{ id: "visitedBefore", extra: true, kind: "choice", options: "yesNoUnsure", example: "no" },
```

`options` 是选项组的名字。现有的选项组在 `questionnaire.ts` 的 `OPTION_GROUPS` 里。需要新的一组时：

1. 在 `OPTION_GROUPS` 上方加一行，例如
   `export const ROOM_TYPE = ["single", "double", "suite"] as const;`
2. 在 `OPTION_GROUPS` 里加 `roomType: ROOM_TYPE,`
3. 在两个文案文件的 `intake.option` 下加一组 `roomType`，每个选项一条文字。

**核心题正在用的选项组（`travellingWith`、`whoPays`、`yesNoUnsure`）不能增删选项**，否则会改动作业契约。

## 新建一节

在 `questionnaire.ts` 里、`review` 那一节之前加：

```ts
{
  id: "accommodation",
  questions: [
    { id: "hotelName", extra: true, rule: text(1, 100), example: "Hotel Sol Madrid" },
  ],
},
```

并在两个文案文件的 `intake.section` 下加一条 `"accommodation": "住宿安排"`（英文同理），在 `intake.question` 下加一组 `accommodation`。每一节至少要有一道题。

## 删除一道补充题

在 `questionnaire.ts` 里删掉那一行，再把两个文案文件里对应的题面和提示语一起删掉。`pnpm check:intake` 会提醒你有没有删干净。

---

## 改材料清单

材料清单在 `packages/core/src/rules/schengen-spain.ts` 的 `SCHENGEN_SPAIN_DOCUMENTS` 里，一份材料一条：

```ts
{ id: "sponsorProof", necessity: "conditional", multiPage: true,
  appliesWhen: { answer: "companions.whoPays", in: ["family", "employer"] } },
```

- `necessity`：`"required"`（必须交）、`"recommended"`（建议交，不交也能提交）、`"conditional"`（满足条件时才要）。
- `multiPage`：这份材料通常不止一页时写 `true`。
- `appliesWhen`：什么情况下才需要这份材料。不写就是每个人都要。写法：
  - `{ answer: "history.schengenBefore", is: "yes" }`：某道题的答案等于某个选项
  - `{ answer: "companions.whoPays", in: ["family", "employer"] }`：等于其中任意一个
  - `{ all: [条件, 条件] }`：都成立；`{ any: [条件, 条件] }`：任意一个成立；`{ not: 条件 }`：不成立

  `answer` 只能是**核心选择题**（「<节 id>.<题 id>」），比较的值必须是它真有的选项。写错了 `pnpm check:intake` 会指出来。

每份材料还要在两个文案文件的 `documents.item` 下各加两条：名称（`<id>`）和为什么要它（`<id>Why`）。

## 必须注意

- **不要用补充题收集邮箱、账号或登录信息。** 补充题的答案会原样交给后台作业，而作业里不允许出现账号信息。检查会拦住看起来在问邮箱的题。
- **已上线的题不要改 id。** 改 id 等于删掉旧题、加一道新题，已经填过的人要重新回答。
- **新增的题对正在填写的人也生效**：他们提交前需要回答新题。
- 改完的问卷在提交前请找工程师在本地跑一遍完整测试（`pnpm turbo lint typecheck test` 和浏览器测试）。
