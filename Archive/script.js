// --- 独立逻辑补丁：适配多角色世界书 ---

// 1. 获取当前对话的角色名（你可以根据需要修改这个值，或从 URL 参数获取）
const activeCharacter = "Chrollo"; 

// 2. 从新版存储结构中读取数据
// 注意：现在 archive.html 把 identity/background/speech 都合并在 setting 里的
const fullSetting = localStorage.getItem(`k_world_${activeCharacter}_setting`) || "";
const memory = localStorage.getItem(`k_world_${activeCharacter}_memory`) || "";

// 3. 结构化拼接 (适配你要求的 finalPrompt 格式)
// 既然合并了，我们把 fullSetting 放在核心人设里，其他项标记为已整合
const finalPrompt = `
【核心人设】：${fullSetting}
【背景设定】：（已整合至上述设定）
【语言风格】：（已整合至上述设定）
【当前关键记忆】：${memory}
`;

// 4. 打印调试（可选，方便你在浏览器控制台查看拼接是否正确）
console.log("🚀 拼接后的最终 Prompt:", finalPrompt);

/**
 * 如果你需要将这个 finalPrompt 喂给 API
 * 请在 fetchAI 的 body 部分引用 finalPrompt 变量
 */