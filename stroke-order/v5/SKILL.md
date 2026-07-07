---
name: stroke-order
description: 生成汉字笔顺教学内容时自动启用。通过 CDN 加载 cnchar 库实现笔顺数据的运行时查询，杜绝 AI 从记忆中编造。教研校验数据（lookup-table.md）作为最高优先级覆盖cnchar 的已知偏差。内置 32 种标准笔画名称、cnchar 名称修正函数、cnchar-draw。动画集成模板。当生成内容涉及笔顺、笔画、识字写字、笔顺演示、写字课件时启用。
---

更新时间：2026-04-15

# 汉字笔顺规范

> 版本 4.0.0 ｜ 2026-04-15 ｜ 适用范围：识字写字教学内容生成

## 一、核心架构：cnchar 运行时查询 + 教研数据覆盖

笔顺数据**严禁从 AI 记忆生成**。数据来源只有两个，按优先级：

| 优先级 | 数据源 | 覆盖范围 | 作用 |
|--------|--------|---------|------|
| **最高** | [lookup-table.md](lookup-table.md) 教研校验表 | ~150 字 | 作为 JS 对象嵌入代码，覆盖 cnchar 输出 |
| **次高** | cnchar 库（CDN 运行时加载） | 全量汉字 | 笔画动画 + 笔顺名称（经修正函数处理） |

**AI 的角色不是"记忆笔顺"，而是"生成正确调用 cnchar 的代码"。**

### 两种输出模式

| 模式 | 触发条件 | 行为 |
|------|---------|------|
| **HTML 生成模式** | 用户要求制作动画/课件/网页 | 生成包含 cnchar CDN 的 HTML，所有字均可输出 |
| **纯文本模式** | 用户仅询问某字笔顺（非代码） | 查 lookup-table → 在表则输出，不在表则拒绝 |

## 二、HTML 生成模式（主要模式）

### 2.1 CDN 引入

在生成的 HTML 中引入以下脚本（顺序不可变）：

```html
<script src="https://cdn.jsdelivr.net/npm/cnchar/cnchar.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/cnchar-order/cnchar.order.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/cnchar-draw/cnchar.draw.min.js"></script>
```

### 2.2 教研校验数据覆盖

从 lookup-table.md 中提取**本次请求涉及的字**，以 JS 对象形式嵌入。lookup-table 中的字，其笔画名称具有最高优先级，直接覆盖 cnchar 输出：

```javascript
const VERIFIED = {
  '竹': {count: 6, strokes: ['撇','横','竖','撇','横','竖钩']},
  '牙': {count: 4, strokes: ['横','竖折','竖钩','撇']},
  '山': {count: 3, strokes: ['竖','竖折','竖']},
  // 仅包含本次请求涉及且在 lookup-table 中的字
};
```

### 2.3 cnchar 笔画名称修正 + 核对机制

cnchar 存在 6 类命名偏差。以下修正函数覆盖了常见小学字的判定规则，必须嵌入生成的代码中：

```javascript
// ========== cnchar 偏差修正 ==========

// 偏差1: cnchar 无竖折编码，输出"竖弯"或"撇折"→ 对这些字修正为"竖折"
const SHUZHE = '山牙出屯区匹臣互击岁岸岗仙灵峰崖炭密幽';

// 偏差2: cnchar 无横折弯钩编码，输出"横斜钩"→ 对这些字修正为"横折弯钩"
const HZWG = '九几凡亿殳尤仇乱匕矿';
// 保留横斜钩的字（不修正）：风飞气岚

// 偏差3: cnchar 斜钩/卧钩共用 y → 按字判定
// 卧钩字（心字底/心字变形）：
const WOGOU = '心必思想念忘志忍急息恩感意总怎愿忠恋态您悠慧';
// 斜钩字（戈部/戈字旁）：
const XIEGOU = '我找成式或戈武代伐越战载戏栽裁截';

// 偏差4: cnchar 横撇/横钩共用 e → 按字判定
// 横钩字（宝盖头/秃宝盖等）：
const HENGGOU = '写皮安家字宝它宁宽宫官完定实客密寒穴究空';
// 横撇字（又/夕/水等部件）：
const HENGPIE = '水又多各冬夕名外条复备处夜够将';

// 偏差5: cnchar 横折折/横折弯共用 v → 按字判定
// 横折弯字：
const HZHEWAN = '没沿船朵';
// 横折折字：
const HZHEZHE = '凹鼎';

// 偏差6: 点2 → 点（全部替换）

function fixName(name, char) {
  if (name === '点2') return '点';
  if ((name === '竖弯' || name === '撇折') && SHUZHE.includes(char)) return '竖折';
  if (name === '横斜钩' && HZWG.includes(char)) return '横折弯钩';
  if (name === '斜钩' && WOGOU.includes(char)) return '卧钩';
  if (name === '卧钩' && XIEGOU.includes(char)) return '斜钩';
  if (name === '横撇' && HENGGOU.includes(char)) return '横钩';
  if (name === '横钩' && HENGPIE.includes(char)) return '横撇';
  if (name === '横折弯' && HZHEZHE.includes(char)) return '横折折';
  if (name === '横折折' && HZHEWAN.includes(char)) return '横折弯';
  return name;
}

// ========== 核对警告机制 ==========

// cnchar 的歧义笔画名称（fixName 可能未覆盖的字需要标记警告）
const AMBIGUOUS = ['斜钩','卧钩','横撇','横钩','横折折','横折弯',
                   '竖折撇','竖折折','横折折折钩','横撇弯钩','竖弯','横斜钩'];
const ALL_KNOWN = SHUZHE + HZWG + WOGOU + XIEGOU + HENGGOU + HENGPIE + HZHEWAN + HZHEZHE;

function checkWarning(names, char) {
  if (!names) return null;
  const issues = [];
  names.forEach((n, i) => {
    if (AMBIGUOUS.includes(n) && !ALL_KNOWN.includes(char)) {
      issues.push(`第${i+1}笔「${n}」可能与教材不一致`);
    }
  });
  return issues.length > 0 ? issues : null;
}
```

> **修正覆盖范围**：fixName 覆盖了约 100 个常见小学字的歧义判定。
> 对于不在修正列表中的字，`checkWarning` 会标记哪些笔画可能有误，
> 在界面上显示 ⚠ 警告，提示教师人工核对。

### 2.4 统一数据查询函数

```javascript
function getStrokes(char) {
  // 优先级1：教研校验数据
  if (VERIFIED[char]) {
    return {
      names: VERIFIED[char].strokes,
      count: VERIFIED[char].count,
      source: 'verified',     // 教研校验 ✓
      warnings: null
    };
  }
  // 优先级2：cnchar 查询 + 修正 + 核对
  const raw = char.stroke('order', 'name');
  if (!raw || raw.length === 0) return null;
  const fixed = raw.map(n => fixName(n, char));
  return {
    names: fixed,
    count: parseInt(char.stroke('count')),
    source: 'cnchar',          // cnchar 数据
    warnings: checkWarning(fixed, char)
  };
}
```

### 2.5 界面核对标识

生成的 HTML 中，根据数据源和警告状态显示不同标识：

```javascript
function renderSourceBadge(info) {
  if (info.source === 'verified') {
    return '<span class="badge verified">✓ 教研校验</span>';
  }
  if (info.warnings) {
    return '<span class="badge warning">⚠ 含待核对笔画</span>'
      + '<ul class="warnings">'
      + info.warnings.map(w => `<li>${w}</li>`).join('')
      + '</ul>';
  }
  return '<span class="badge cnchar">cnchar 数据</span>';
}
```

样式建议：`verified`绿色、`cnchar`蓝色、`warning`橙色。

### 2.5 cnchar-draw 笔顺动画

cnchar-draw 基于 HanziWriter，**笔画视觉形态正确可靠**（来自字体 SVG 数据，不受命名偏差影响）。用于渲染笔顺演示动画：

```javascript
function drawChar(char, el) {
  cnchar.draw(char, {
    el: el,
    type: 'animation',
    clear: true,
    style: {
      length: 120,
      currentColor: '#e74c3c',    // 红色高亮当前笔画
      strokeColor: '#333',
      outlineColor: '#ddd',
    },
    animation: {
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 500,
      autoAnimate: false,          // 手动控制，配合笔画信息面板
    },
    line: { lineStraight: true, lineCross: true, border: true }
  });
}
```

### 2.6 完整代码模板

生成笔顺教学动画时，使用以下结构：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>笔顺学习</title>
  <script src="https://cdn.jsdelivr.net/npm/cnchar/cnchar.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/cnchar-order/cnchar.order.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/cnchar-draw/cnchar.draw.min.js"></script>
</head>
<body>
  <!-- 笔顺演示区 + 笔画信息面板 -->
  <script>
    // 1. 教研校验数据（从 lookup-table 提取本次涉及的字）
    const VERIFIED = { /* ... */ };

    // 2. cnchar 名称修正
    function fixName(name, char) { /* 见 2.3 */ }

    // 3. 统一查询
    function getStrokes(char) { /* 见 2.4 */ }

    // 4. 渲染动画 + 笔画信息
    const chars = ['竹', '牙']; // 本次请求的字
    chars.forEach(char => {
      const info = getStrokes(char);
      if (!info) return;
      // 渲染 cnchar-draw 动画
      drawChar(char, `#draw-${char}`);
      // 渲染笔画信息面板
      renderStrokePanel(char, info);
    });
  </script>
</body>
</html>
```

## 三、纯文本模式（备用模式）

当用户仅以对话方式询问笔顺（不需要生成 HTML/动画），执行以下策略：

```
查 lookup-table.md
  ├─ 找到 → 逐笔输出表中数据
  └─ 未找到 → 拒绝：「该字暂未收录经教研校验的标准笔顺数据，
                      请以部编版教材为准。如需查看该字笔顺动画，
                      可以要求我生成笔顺教学网页。」
```

**关键**：纯文本模式下严禁从记忆生成。但拒绝时引导用户切换到 HTML 模式（cnchar 可覆盖全量汉字）。

## 四、标准笔画名称表（32 种）

cnchar 输出的笔画名称和 fixName 修正后的名称，都必须在此 32 种之内。

### 基本笔画（6）

| 名称 | 笔形 | 例字 | cnchar字母 |
|------|------|------|-----------|
| 点 | 丶 | 主 | k |
| 横 | 一 | 三 | j |
| 竖 | 丨 | 十 | f |
| 撇 | 丿 | 八 | s |
| 捺 | ㇏ | 人 | l |
| 提 | ㇀ | 打 | i |

### 折类（5）

| 名称 | 例字 | cnchar字母 | 备注 |
|------|------|-----------|------|
| 横折 | 口 | c | |
| 竖折 | 山 | ⚠ 无编码 | cnchar 用 b(竖弯) 或 n(撇折) 替代 |
| 撇折 | 云 | n | |
| 横撇 | 水 | e | 与横钩共用 e |
| 撇点 | 女 | m | |

### 钩类（12）

| 名称 | 例字 | cnchar字母 | 备注 |
|------|------|-----------|------|
| 竖钩 | 小 | g | |
| 弯钩 | 了 | t | |
| 斜钩 | 我 | y | 与卧钩共用 y |
| 卧钩 | 心 | y | 与斜钩共用 y |
| 竖弯钩 | 儿 | u | |
| 横钩 | 写 | e | 与横撇共用 e |
| 横折钩 | 力 | r | |
| 横折弯钩 | 九 | o | 与横斜钩共用 o |
| 横撇弯钩 | 那 | w | 与横折折折钩共用 w |
| 横折折折钩 | 奶 | w | 与横撇弯钩共用 w |
| 竖折折钩 | 与 | z | |
| 横斜钩 | 风 | o | 与横折弯钩共用 o |

### 提类（2）

| 名称 | 例字 | cnchar字母 |
|------|------|-----------|
| 竖提 | 长 | h |
| 横折提 | 语 | p |

### 弯折组合（7）

| 名称 | 例字 | cnchar字母 | 备注 |
|------|------|-----------|------|
| 竖弯 | 四 | b | 与竖折无法区分 |
| 横折弯 | 没 | v | 与横折折共用 v |
| 横折折撇 | 及 | a | |
| 竖折撇 | 专 | x | 与竖折折共用 x |
| 竖折折 | 鼎 | x | 与竖折撇共用 x |
| 横折折 | 凹 | v | 与横折弯共用 v |
| 横折折折 | 凸 | q | |

## 五、输出前自检

### HTML 模式

```
□ 1. 是否引入了三个 CDN 脚本（cnchar, cnchar-order, cnchar-draw）？
□ 2. 是否包含 VERIFIED 对象（从 lookup-table 提取本次涉及的字）？
□ 3. 是否包含 fixName 修正函数？
□ 4. 是否通过 getStrokes 统一查询（而非 AI 直接写死笔画数据）？
□ 5. cnchar-draw 动画配置是否完整？
```

### 纯文本模式

```
□ 1. 该字是否在 lookup-table.md 中？不在则拒绝
□ 2. 笔画总数 = 列举数？
□ 3. 每个名称在 32 种之内？
□ 4. ★ 字逐笔核对？
```

## 六、已知错误模式

### AI 记忆生成的典型错误（HTML 模式可避免）

| 错误 | 案例 | 说明 |
|------|------|------|
| 复合笔画拆分 | 吃：横折弯钩→横+竖弯钩 | cnchar-draw 不会拆分 |
| 竖钩遗漏为竖 | 竹第6笔 | cnchar 数据正确 |
| 笔顺顺序错误 | 成的斜钩错位 | cnchar 数据正确 |
| 笔画数错误 | 亿3画变4画 | cnchar 计数正确 |

### cnchar 命名偏差修正覆盖度

| 偏差类型 | fixName 覆盖 | 兜底机制 |
|---------|-------------|---------|
| 点2→点 | ✅ 全部自动修正 | — |
| 竖弯→竖折 | ✅ 约20个常见字 | checkWarning 标记未覆盖字 |
| 横斜钩→横折弯钩 | ✅ 约10个常见字 | checkWarning 标记未覆盖字 |
| 斜钩↔卧钩 | ✅ 约35个常见字（心字底+戈部） | checkWarning 标记未覆盖字 |
| 横撇↔横钩 | ✅ 约30个常见字（宝盖头+又/夕部） | checkWarning 标记未覆盖字 |
| 横折折↔横折弯 | ✅ 约6个常见字 | checkWarning 标记未覆盖字 |

三层防护：VERIFIED 教研数据 > fixName 规则修正 > checkWarning 标记待核对
