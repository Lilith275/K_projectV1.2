/* ============================
   1. 系统全局逻辑
   ============================ */

// 1. 时钟
function updateClock() {
    const now = new Date();
    
    // 获取时间 (HH:MM)
    const timeStr = now.getHours().toString().padStart(2, '0') + ":" + 
                    now.getMinutes().toString().padStart(2, '0');
    
    // 获取日期 (YYYY/MM/DD)
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const date = now.getDate().toString().padStart(2, '0');
    const dateStr = `${year}/${month}/${date}`;

    // 更新状态栏和锁屏时间
    if(document.getElementById('current-time')) document.getElementById('current-time').innerText = timeStr;
    if(document.getElementById('lock-time')) document.getElementById('lock-time').innerText = timeStr;
    
    // 更新顶部卡片的时间和日期
    if(document.getElementById('card-time')) document.getElementById('card-time').innerText = timeStr;
    if(document.getElementById('card-date')) document.getElementById('card-date').innerText = dateStr;
}
setInterval(updateClock, 1000);
updateClock();
// 2. 锁屏控制
const lockScreen = document.getElementById('lock-screen');
lockScreen.onclick = () => lockScreen.classList.add('unlocked');

function backToLock() {
    lockScreen.classList.remove('unlocked');
}

// 3. App 启动与关闭 (带返回键联动)
const backBtn = document.getElementById('global-back-btn');

function launchApp(url) {
    const overlay = document.getElementById('app-overlay');
    const frame = document.getElementById('app-frame');
    const backBtn = document.getElementById('global-back-btn');
    
    if (frame.src !== url) frame.src = url; 
    
    overlay.classList.add('open');
    backBtn.style.display = 'flex'; // 关键：显示按钮
}

function closeApp() {
    // 只需要让整个遮罩层滑下去即可
    document.getElementById('app-overlay').classList.remove('open');
}
/* ============================
   4. iOS 滑动反馈优化
   ============================ */
// 禁止桌面整体被无意义滑动
document.addEventListener('touchmove', (e) => {
    // 允许 iframe 内部滚动，允许解锁滑动，禁止桌面整体滚动
    if (e.target.id === 'desktop' || e.target.id === 'lock-screen') {
        e.preventDefault();
    }
}, { passive: false });


function applySystemSettings() {
    // 1. 应用字体和桌面文字样式
    const fontCfg = localStorage.getItem('k_font_config');
    if (fontCfg) {
        const cfg = JSON.parse(fontCfg);
        
        // 锁屏时间 (强制应用样式)
        const timeEl = document.getElementById('lock-time');
        if (timeEl) {
            timeEl.style.setProperty('color', cfg.color, 'important');
            timeEl.style.setProperty('font-size', cfg.size, 'important');
            timeEl.style.setProperty('letter-spacing', cfg.space, 'important');
        }

        // 桌面图标文字 (新增逻辑)
        const labels = document.querySelectorAll('.app-label');
        labels.forEach(label => {
            label.style.setProperty('color', cfg.deskColor, 'important');
        });
    }

    // 2. 应用锁屏背景
    const lockBg = localStorage.getItem('k_lock_bg');
    if (lockBg) {
        const lockScreen = document.getElementById('lock-screen');
        if (lockScreen) {
            lockScreen.style.backgroundImage = `url(${lockBg})`;
            lockScreen.style.backgroundSize = "cover";
            lockScreen.style.backgroundPosition = "center";
        }
    }

    // 3. 应用桌面背景
    const deskBg = localStorage.getItem('k_desk_bg');
    if (deskBg) {
        const deskScreen = document.querySelector('.iphone-screen');
        if (deskScreen) {
            deskScreen.style.backgroundImage = `url(${deskBg})`;
            deskScreen.style.backgroundSize = "cover";
            deskScreen.style.backgroundPosition = "center";
        }
    }
}

// 核心修复：不但加载时运行，保存后切换回来也要能触发
window.onload = applySystemSettings;
window.addEventListener('pageshow', applySystemSettings); // 解决部分浏览器后退不刷新的问题


//*音乐唱片功能
function togglePlay() {
    const audio = document.getElementById('bg-audio');
    const widget = document.querySelector('.music-widget');
    const progress = document.querySelector('.progress-inner');
    
    if (audio.paused) {
        audio.play();
        widget.classList.add('playing');
        // 模拟进度条
        let p = 0;
        setInterval(() => {
            if(p < 100) { p += 0.5; progress.style.width = p + '%'; }
        }, 1000);
    } else {
        audio.pause();
        widget.classList.remove('playing');
    }
}
//*音乐唱片首尾相连系统
function initLyricsScroll() {
    const scrollContainer = document.getElementById('lyrics');
    if (!scrollContainer) return;

    // 1. 克隆一份完全相同的歌词接在后面
    const content = scrollContainer.innerHTML;
    scrollContainer.innerHTML = content + content;

    // 2. 根据歌词长度自动调整滚动时间 (可选，让长短歌词速度一致)
    // 如果你想手动控制快慢，可以直接在 CSS 里的 20s 改数字
    const totalHeight = scrollContainer.scrollHeight;
    const duration = totalHeight / 30; // 每 30px 走 1 秒，数值越大滚得越慢
    scrollContainer.style.animationDuration = `${duration}s`;
}

function loadCustomSettings() {
    // 1. 加载桌面背景
    const savedDeskBg = localStorage.getItem('k_desk_bg');
    if (savedDeskBg) {
        document.body.style.backgroundImage = `url(${savedDeskBg})`;
        // 同时强制让挡住背景的层变透明
        const screen = document.querySelector('.iphone-screen');
        if (screen) screen.style.background = 'transparent';
    }

    // 2. 加载锁屏背景
    const savedLockBg = localStorage.getItem('k_lock_bg');
    const lockScreen = document.getElementById('lock-screen');
    if (savedLockBg && lockScreen) {
        lockScreen.style.backgroundImage = `url(${savedLockBg})`;
    }

    // 3. 加载锁屏时间样式 (颜色、大小、间距、透明度)
    const fontConfig = JSON.parse(localStorage.getItem('k_font_config'));
    if (fontConfig) {
        const timeDom = document.getElementById('lock-time');
        if (timeDom) {
            timeDom.style.color = fontConfig.color;
            timeDom.style.fontSize = fontConfig.size;
            timeDom.style.letterSpacing = fontConfig.space;
            timeDom.style.opacity = fontConfig.alpha;
        }
        // 应用桌面图标文字颜色
        if (fontConfig.deskColor) {
            document.querySelectorAll('.app-label').forEach(label => {
                label.style.color = fontConfig.deskColor;
            });
        }
    }
}

window.addEventListener('storage', (e) => {
    if (e.key === 'k_font_config') {
        const newConfig = JSON.parse(e.newValue);
        // 调用你主页面里应用样式的函数
        updateDesktopUI(newConfig); 
    }
});
// 页面一加载就运行
window.addEventListener('DOMContentLoaded', loadCustomSettings);

// 页面加载完成后启动
window.addEventListener('DOMContentLoaded', initLyricsScroll);

/* ============================
. iOS 滑动反馈优化 (增强版)
   ============================ */
// 记录触摸起始点
let touchStartX = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].pageX;
}, { passive: true });

document.addEventListener('touchmove', (e) => {
    const touchMoveX = e.touches[0].pageX;
    const moveDiff = Math.abs(touchMoveX - touchStartX);

    // 1. 如果横向滑动距离大于 10px，判定为横滑尝试，直接拦截
    // 2. 只有在非 iframe 区域（即主桌面）才拦截，保证 App 内部正常
    if (moveDiff > 10 && !e.target.closest('#app-frame')) {
        e.preventDefault(); 
    }

    // 你原有的拦截逻辑也可以保留并写在这里
    if (e.target.id === 'desktop' || e.target.id === 'lock-screen') {
        e.preventDefault();
    }
}, { passive: false });

/* ============================================================
   终极实时指挥官：统一管理所有同步逻辑，互不干扰
   ============================================================ */
(function() {
    let _lastCfg = "";
    let _lastLock = "";
    let _lastDesk = "";

    function masterSync() {
        // 1. 获取最新存储
        const cfgStr = localStorage.getItem('k_font_config');
        const lockBg = localStorage.getItem('k_lock_bg');
        const deskBg = localStorage.getItem('k_desk_bg');

        // --- A. 字体与颜色同步 ---
        if (cfgStr && cfgStr !== _lastCfg) {
            const cfg = JSON.parse(cfgStr);
            const timeEl = document.getElementById('lock-time');
            if (timeEl) {
                if (cfg.color) timeEl.style.setProperty('color', cfg.color, 'important');
                if (cfg.size) timeEl.style.setProperty('font-size', cfg.size, 'important');
                if (cfg.space) timeEl.style.setProperty('letter-spacing', cfg.space, 'important');
                if (cfg.alpha) timeEl.style.setProperty('opacity', cfg.alpha, 'important');
            }
            // 同步桌面文字
            document.querySelectorAll('.app-label').forEach(label => {
                if (cfg.deskColor) label.style.setProperty('color', cfg.deskColor, 'important');
            });
            _lastCfg = cfgStr;
            console.log("【同步】字体已更新");
        }

        // --- B. 锁屏背景同步 ---
        if (lockBg && lockBg !== _lastLock) {
            const lockEl = document.getElementById('lock-screen');
            if (lockEl) {
                lockEl.style.setProperty('background-image', `url(${lockBg})`, 'important');
                lockEl.style.backgroundSize = "cover";
                lockEl.style.backgroundPosition = "center";
                _lastLock = lockBg;
                console.log("【同步】锁屏背景已更新");
            }
        }

        // --- C. 桌面背景同步 ---
        if (deskBg && deskBg !== _lastDesk) {
            const deskEl = document.querySelector('.iphone-screen');
            document.body.style.setProperty('background-image', `url(${deskBg})`, 'important');
            document.body.style.backgroundSize = "cover";
            document.body.style.backgroundPosition = "center";
            
            if (deskEl) {
                // 强制透明，防止遮挡
                deskEl.style.setProperty('background-color', 'transparent', 'important');
                deskEl.style.setProperty('background-image', 'none', 'important');
            }
            _lastDesk = deskBg;
            console.log("【同步】桌面背景已更新");
        }
    }

    // 每 400 毫秒扫描一次，确保壁纸和字体同时生效
    setInterval(masterSync, 400);
})();
//强力 JS 居中补丁
(function() {
    const adjustBackBtn = () => {
        const header = document.querySelector('.header');
        const backBtn = document.querySelector('#app-back-btn');
        
        if (header && backBtn) {
            // 1. 获取 Header 的实际渲染高度（包括安全区内边距）
            const headerRect = header.getBoundingClientRect();
            const headerHeight = headerRect.height;
            
            // 2. 获取按钮自身高度
            const btnHeight = backBtn.offsetHeight;
            
            // 3. 计算物理中心点：(Header总高 / 2) - (按钮高 / 2)
            // 这样无论刘海占了多少像素，按钮永远在 Header 的垂直中轴线上
            const centerY = (headerHeight / 2) - (btnHeight / 2);
            
            // 4. 暴力应用位置
            backBtn.style.position = 'fixed';
            backBtn.style.top = `${centerY}px`;
            backBtn.style.transform = 'none'; // 清除 CSS 可能存在的偏移干扰
            
            // 5. 针对 WebApp 全屏模式的微调
            // 如果是在桌面全屏，由于状态栏消失，Header 会变窄，这里能自动适配
            if (window.matchMedia('(display-mode: standalone)').matches) {
                backBtn.style.left = '15px';
            }
        }
    };

    // 初始化执行
    window.addEventListener('load', adjustBackBtn);
    // 窗口大小改变（如旋转或全屏切换）时重新计算
    window.addEventListener('resize', adjustBackBtn);
    // 针对 iOS 键盘弹起后的视口变化
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', adjustBackBtn);
    }
    
    // 立即执行一次
    setTimeout(adjustBackBtn, 100);
})();