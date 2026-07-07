---
name: stroke-order
description: >-
  生成汉字笔顺教学内容时自动启用。通过 CDN 加载 cnchar 查询笔画数和笔画名称，
  再用修正函数消除 cnchar 的命名偏差（含管道符歧义解析），输出标准化的结构化
  笔画数据供飞象老师渲染。教研校验数据（lookup-table.md）优先级最高。
  当生成内容涉及笔顺、笔画、识字写字、笔顺演示、写字课件时启用。
---

更新时间：2026-04-15

# 汉字笔顺规范

> 版本 5.0.0 ｜ 2026-04-15 ｜ 适用范围：识字写字教学内容生成

## 一、核心架构

```
用户请求某字笔顺
    ↓
该字在 lookup-table.md 中？
  ├─ 是 → 直接使用教研校验数据（最高优先级）
  └─ 否 → 调用 cnchar 查询 → fixName 标准化修正 → 输出结构化数据
```

**AI 的唯一职责**：生成正确调用 cnchar 并应用修正的代码，输出**笔画数 + 逐笔名称**。
飞象老师的渲染引擎负责动画展示，不需要 cnchar-draw。

## 二、CDN 引入（仅需两个）

```html
<script src="https://cdn.jsdelivr.net/npm/cnchar/cnchar.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/cnchar-order/cnchar.order.min.js"></script>
```

## 三、教研校验数据（VERIFIED）

从 [lookup-table.md](lookup-table.md) 提取本次请求涉及的字，嵌入代码。VERIFIED 数据优先级最高，直接覆盖 cnchar 输出：

```javascript
const VERIFIED = {
  '竹': ['撇','横','竖','撇','横','竖钩'],
  '牙': ['横','竖折','竖钩','撇'],
  '山': ['竖','竖折','竖'],
  // 仅包含本次请求涉及且在 lookup-table 中的字
};
```

## 四、cnchar 标准化修正（核心）

cnchar 的原始输出存在两类问题，必须在代码中包含以下修正逻辑：

**问题 A**：歧义笔画以 `|` 分隔输出（如 `横撇|横钩`），需要按字判定选哪个。
**问题 B**：部分笔画名称与教材标准不一致（如 `竖弯` 应为 `竖折`），需要替换。

```javascript
// ====== 按字判定表（覆盖常见小学字） ======

// 竖折字（cnchar 无此编码，输出"竖弯"或"撇折"）
const SHUZHE = '山牙出屯区匹臣互击岁岸岗仙灵峰崖炭密幽';

// 横折弯钩字（cnchar 输出"横斜钩"，需改为"横折弯钩"）
const HZWG = '九几凡亿殳尤仇乱匕矿';
// 注意：风飞气岚 保留横斜钩，不修正

// 卧钩字（cnchar 斜钩/卧钩不分，心字底/竖心旁用卧钩）
const WOGOU = '心必思想念忘志忍急息恩感意总怎愿忠恋态您悠慧';

// 横钩字（cnchar 横撇/横钩不分，宝盖头/秃宝盖用横钩）
const HENGGOU = '写皮安家字宝它宁宽宫官完定实客密寒穴究空容';

// 横折弯字（cnchar 横折折/横折弯不分）
const HZHEWAN = '没沿船朵';

// 竖折撇字（cnchar 竖折折/竖折撇不分）
const SZZP = '专传转砖';

// 横撇弯钩字（cnchar 横折折折钩/横撇弯钩不分）
const HPWG = '那都邮邻部郑郊阳阴队陈';

// ====== 修正函数 ======

function fixName(raw, char) {
  let name = raw;

  // 第一步：解析 cnchar 的管道符歧义输出（如 "横撇|横钩"）
  if (name.includes('|')) {
    name = resolvePair(name, char);
  }

  // 第二步：修正确定性偏差
  if (name === '点2') return '点';
  if ((name === '竖弯' || name === '撇折') && SHUZHE.includes(char))
    return '竖折';
  if (name === '横斜钩' && HZWG.includes(char))
    return '横折弯钩';

  return name;
}

// 解析 "A|B" 管道符输出，按字判定选哪个
function resolvePair(pair, char) {
  if (pair.includes('横撇') && pair.includes('横钩'))
    return HENGGOU.includes(char) ? '横钩' : '横撇';

  if (pair.includes('斜钩') && pair.includes('卧钩'))
    return WOGOU.includes(char) ? '卧钩' : '斜钩';

  if (pair.includes('横折弯') && pair.includes('横折折'))
    return HZHEWAN.includes(char) ? '横折弯' : '横折折';

  if (pair.includes('竖折撇') && pair.includes('竖折折'))
    return SZZP.includes(char) ? '竖折撇' : '竖折折';

  if (pair.includes('横撇弯钩') && pair.includes('横折折折钩'))
    return HPWG.includes(char) ? '横撇弯钩' : '横折折折钩';

  // 未知歧义对：取第一个，标记警告
  return pair.split('|')[0];
}

// ====== 核对警告 ======

const ALL_KNOWN = SHUZHE + HZWG + WOGOU + HENGGOU + HZHEWAN + SZZP + HPWG;
const AMBIGUOUS = ['斜钩','卧钩','横撇','横钩','横折折','横折弯',
  '竖折撇','竖折折','横折折折钩','横撇弯钩','竖弯','横斜钩'];

function checkWarning(names, char) {
  if (!names) return null;
  const issues = [];
  names.forEach((n, i) => {
    if (AMBIGUOUS.includes(n) && !ALL_KNOWN.includes(char)) {
      issues.push({ index: i + 1, name: n });
    }
  });
  return issues.length > 0 ? issues : null;
}
```

## 五、统一查询函数

```javascript
function getStrokeData(char) {
  // 优先级1：教研校验数据
  if (VERIFIED[char]) {
    return {
      char: char,
      count: VERIFIED[char].length,
      strokes: VERIFIED[char],
      source: 'verified',
      warnings: null
    };
  }
  // 优先级2：cnchar 查询 + 标准化修正
  const raw = char.stroke('order', 'name');
  if (!raw || raw.length === 0) return null;
  const strokes = raw.map(n => fixName(n, char));
  return {
    char: char,
    count: strokes.length,
    strokes: strokes,
    source: 'cnchar',
    warnings: checkWarning(strokes, char)
  };
}
```

输出示例：

```javascript
getStrokeData('对')
// → { char:'对', count:5, strokes:['横撇','点','横','竖钩','点'],
//     source:'cnchar', warnings:null }

getStrokeData('竹')
// → { char:'竹', count:6, strokes:['撇','横','竖','撇','横','竖钩'],
//     source:'verified', warnings:null }
```

## 六、标准笔画名称表（32 种）

fixName 修正后的名称必须在此 32 种之内。如果修正后仍不在此列表中，说明修正逻辑有误。

| 类别 | 名称 |
|------|------|
| 基本（6） | 点、横、竖、撇、捺、提 |
| 折类（5） | 横折、竖折、撇折、横撇、撇点 |
| 钩类（12） | 竖钩、弯钩、斜钩、卧钩、竖弯钩、横钩、横折钩、横折弯钩、横撇弯钩、横折折折钩、竖折折钩、横斜钩 |
| 提类（2） | 竖提、横折提 |
| 弯折组合（7） | 竖弯、横折弯、横折折撇、竖折撇、竖折折、横折折、横折折折 |

## 七、纯文本模式

当用户仅以对话方式询问笔顺（不生成代码），执行：

```
查 lookup-table.md
  ├─ 找到 → 逐笔输出
  └─ 未找到 → 「该字暂未收录教研校验数据，请以部编版教材为准。
                如需笔顺动画，可以要求我生成教学网页。」
```

纯文本模式下严禁从 AI 记忆生成笔顺数据。

## 八、输出前自检

### 代码生成模式

```
□ 1. 是否引入了 cnchar + cnchar-order 两个 CDN？（不需要 cnchar-draw）
□ 2. 是否包含 VERIFIED 对象（从 lookup-table 提取本次涉及的字）？
□ 3. 是否包含完整的 fixName + resolvePair + checkWarning 函数？
□ 4. 笔画数据是否通过 getStrokeData() 获取（而非 AI 直接写死）？
□ 5. 是否有任何笔画名称是 AI 从记忆中硬编码的？→ 如有，删除，改用查询
```

### 纯文本模式

```
□ 1. 该字是否在 lookup-table.md 中？不在则拒绝
□ 2. 笔画总数 = 列举数？
□ 3. 每个名称在 32 种之内？
```

## 九、cnchar 偏差修正覆盖一览

| 偏差类型 | cnchar 表现 | 修正方式 | 覆盖度 |
|---------|-----------|---------|--------|
| 点2→点 | 输出"点2" | fixName 全量替换 | ✅ 100% |
| 竖弯→竖折 | 输出"竖弯"或"撇折" | fixName 按字修正 | ✅ ~20 字 |
| 横斜钩→横折弯钩 | 输出"横斜钩" | fixName 按字修正 | ✅ ~10 字 |
| 横撇\|横钩 | 输出"横撇\|横钩" | resolvePair 按字判定 | ✅ ~30 字 |
| 斜钩\|卧钩 | 输出"斜钩\|卧钩" | resolvePair 按字判定 | ✅ ~35 字 |
| 横折折\|横折弯 | 输出"横折折\|横折弯" | resolvePair 按字判定 | ✅ ~6 字 |
| 竖折折\|竖折撇 | 输出"竖折折\|竖折撇" | resolvePair 按字判定 | ✅ ~6 字 |
| 横折折折钩\|横撇弯钩 | 输出管道符 | resolvePair 按字判定 | ✅ ~12 字 |

未在判定表中的字 → checkWarning 在输出中标记 `⚠ 待教研核对`。

三层防护：**VERIFIED** 教研数据 → **fixName + resolvePair** 规则修正 → **checkWarning** 标记待核对。
