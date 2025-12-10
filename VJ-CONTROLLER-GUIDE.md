# VJ Controller 設計整合指南

本文件說明如何將 `media-stage-control.html` 的設計系統整合到其他專案中。

## 目錄
1. [設計概述](#設計概述)
2. [核心設計系統](#核心設計系統)
3. [組件架構](#組件架構)
4. [整合步驟](#整合步驟)
5. [自定義配置](#自定義配置)
6. [常見問題](#常見問題)

---

## 設計概述

### 介面特色
- **深色主題**：專為舞台/演出環境設計的低亮度介面
- **青綠色強調色**：`#48dbc2` (168, 80%, 55%) 作為主要互動色
- **圖層系統**：4 層垂直堆疊，每層 6 個場景單元
- **平板友好**：觸控優化，最小點擊區域 40px
- **固定控制列**：底部全局控制不隨滾動移動

### 檔案結構
```
media-stage-control.html (單一檔案，包含所有功能)
├── CSS 樣式 (內嵌)
├── HTML 結構
└── JavaScript 邏輯 (內嵌)
```

---

## 核心設計系統

### 色彩系統

```css
/* CSS 變數定義 */
:root {
    /* 背景色 */
    --background: 220 20% 8%;           /* #141821 深藍灰色背景 */
    --foreground: 0 0% 95%;             /* #f2f2f2 主文字色 */

    /* 卡片與彈出層 */
    --card: 220 18% 12%;                /* #1c2028 卡片背景 */
    --card-foreground: 0 0% 95%;        /* 卡片文字色 */

    /* 主要強調色 (青綠色) */
    --primary: 168 80% 55%;             /* #48dbc2 主要互動色 */
    --primary-foreground: 220 20% 8%;   /* 主色上的文字 */

    /* 次要色 */
    --secondary: 220 15% 18%;           /* #272c36 次要元素背景 */
    --secondary-foreground: 0 0% 90%;   /* 次要元素文字 */

    /* 柔和色 */
    --muted: 220 15% 15%;               /* #222732 柔和背景 */
    --muted-foreground: 220 10% 55%;    /* #7d8594 柔和文字 */

    /* 邊框與輸入 */
    --border: 220 15% 20%;              /* #2d323d 邊框色 */
    --input: 220 15% 18%;               /* 輸入框背景 */

    /* 焦點環 */
    --ring: 168 80% 55%;                /* 焦點狀態顏色 */

    /* 圓角 */
    --radius: 0.5rem;                   /* 8px 預設圓角 */
}
```

### 字型系統

```css
/* 字體定義 */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Noto+Sans+TC:wght@400;500;600&display=swap');

body {
    font-family: 'Noto Sans TC', 'JetBrains Mono', sans-serif;
}

/* 字型大小階層 */
.text-xs    { font-size: 0.75rem; }   /* 12px - 按鈕標籤 */
.text-sm    { font-size: 0.875rem; }  /* 14px - 小型文字 */
.text-base  { font-size: 1rem; }      /* 16px - 一般文字 */
.text-lg    { font-size: 1.125rem; }  /* 18px - 圖層名稱 */
```

### 間距系統

```css
/* Tailwind 兼容的間距值 */
0.25rem = 4px  (gap-1)
0.375rem = 6px (gap-1.5)
0.5rem = 8px   (gap-2)
0.625rem = 10px (gap-2.5)
0.75rem = 12px (gap-3)
1rem = 16px    (gap-4)
```

---

## 組件架構

### 1. 圖層系統 (Layer System)

#### HTML 結構
```html
<div class="layer-row">
    <!-- 左側控制區 -->
    <div class="layer-control">
        <div class="layer-name">L1</div>
        <div class="layer-buttons">
            <button class="layer-btn">
                <svg><!-- Play icon --></svg>
            </button>
            <button class="layer-btn">
                <svg><!-- Pause icon --></svg>
            </button>
            <button class="layer-btn">
                <svg><!-- Stop icon --></svg>
            </button>
        </div>
    </div>

    <!-- 右側場景網格 -->
    <div class="clips-grid">
        <!-- 6 個場景單元 -->
    </div>
</div>
```

#### CSS 關鍵樣式
```css
.layer-row {
    display: flex;
    background: var(--card);
    border: 2px solid transparent;
    transition: border-color 0.2s;
}

.layer-row.active {
    border-color: var(--primary);
    background: rgba(72, 219, 194, 0.1);
}

/* 左側控制區 - 垂直排列按鈕 (平板友好) */
.layer-control {
    width: 5rem;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem 0.5rem;
}

.layer-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
}

.layer-btn {
    padding: 0.625rem;
    border-radius: 0.375rem;
    min-height: 2.5rem;          /* 40px 觸控友好 */
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### 2. 場景網格 (Clips Grid)

#### HTML 結構
```html
<div class="clips-grid">
    <div class="clip-thumbnail">
        <div class="clip-preview">
            <span class="clip-id">FOG</span>
        </div>
        <div class="clip-label">
            <span class="clip-name">FogAndDust</span>
        </div>
    </div>
    <!-- 重複 6 次 -->
</div>
```

#### CSS 關鍵樣式
```css
.clips-grid {
    flex: 1;
    padding: 0.5rem;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 0.5rem;
}

.clip-thumbnail {
    aspect-ratio: 16/9;
    cursor: pointer;
    transition: all 0.2s;
}

.clip-thumbnail.selected {
    outline: 2px solid var(--primary);
}

.clip-preview {
    background: linear-gradient(135deg, var(--muted), var(--secondary));
    border-radius: 0.375rem;
    overflow: hidden;
    position: relative;
}

.clip-id {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 0.625rem;
    color: var(--muted-foreground);
    font-family: 'JetBrains Mono', monospace;
}
```

### 3. 底部控制列 (Bottom Control Bar)

#### HTML 結構
```html
<div class="control-bar">
    <div class="control-bar-inner">
        <!-- Global 控制 -->
        <div class="control-section">
            <span class="global-label">Global</span>
            <button class="control-btn"><!-- Play --></button>
            <button class="control-btn"><!-- Pause --></button>
            <button class="control-btn"><!-- Stop --></button>
        </div>

        <div class="divider"></div>

        <!-- Resync 按鈕 -->
        <button class="resync-btn">
            <svg><!-- Resync icon --></svg>
            <span class="resync-text">RESYNC</span>
        </button>

        <div class="divider"></div>

        <!-- 音量控制 -->
        <div class="volume-control">
            <svg class="volume-icon"><!-- Volume icon --></svg>
            <div class="volume-slider">
                <div class="volume-fill">
                    <div class="volume-thumb"></div>
                </div>
            </div>
            <span class="volume-text">70%</span>
        </div>

        <div class="divider"></div>

        <!-- 欄位按鈕 -->
        <div class="column-buttons">
            <button class="column-btn">Column 1</button>
            <!-- 更多按鈕 -->
        </div>

        <!-- 文字輸入 -->
        <div class="text-input-wrapper">
            <input type="text" class="text-input" placeholder="輸入文字...">
            <button class="text-action-btn clear-btn"><!-- X icon --></button>
            <button class="text-action-btn send-btn"><!-- Send icon --></button>
        </div>
    </div>
</div>
```

#### CSS 關鍵樣式
```css
.control-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--card);
    border-top: 1px solid var(--border);
    padding: 0.5rem 0.75rem;
    z-index: 10;
}

.control-bar-inner {
    display: flex;
    align-items: center;
    gap: 1rem;
}

/* 音量滑桿 - 可拖曳設計 */
.volume-slider {
    flex: 1;
    height: 0.5rem;
    border-radius: 0.25rem;
    background: var(--muted);
    position: relative;
    cursor: pointer;
}

.volume-thumb {
    position: absolute;
    right: -0.625rem;
    top: 50%;
    transform: translateY(-50%);
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
    background: var(--primary);
    border: 2px solid var(--background);
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.3);
    transition: transform 0.1s;
}

.volume-slider:hover .volume-thumb {
    transform: translateY(-50%) scale(1.15);
}
```

### 4. Toast 通知系統

#### HTML 結構
```html
<div class="toast">
    <div class="toast-title">標題</div>
    <div class="toast-description">描述內容</div>
</div>
```

#### CSS 關鍵樣式
```css
.toast {
    position: fixed;
    bottom: 5rem;
    right: 1rem;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    animation: slideIn 0.3s ease-out;
    z-index: 1000;
    min-width: 250px;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(1rem);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

---

## 整合步驟

### 方案 A：單一檔案整合 (快速原型)

適用於快速測試或小型專案。

1. **複製完整檔案**
   ```bash
   cp media-stage-control.html your-project/vj-controller.html
   ```

2. **修改資料結構**

   找到 JavaScript 的 `clipData` 物件 (約第 562 行)：
   ```javascript
   const clipData = {
       4: [
           { id: 'L4-FOG', name: 'FogAndDust' },
           // 修改為你的場景資料
       ],
       // ...
   };
   ```

3. **自定義欄位按鈕**

   修改 `columnButtons` 陣列 (約第 597 行)：
   ```javascript
   const columnButtons = [
       { id: 'scene1', label: '場景 1' },
       { id: 'scene2', label: '場景 2' },
       // 根據需求調整
   ];
   ```

4. **調整初始狀態**

   修改 `state` 物件 (約第 607 行)：
   ```javascript
   const state = {
       layers: {
           1: { isActive: false, isPlaying: false, isPaused: false, selectedClip: null },
           2: { isActive: true, isPlaying: false, isPaused: false, selectedClip: 'L2-ORG' },
           // 設定預設選中的場景
       },
       volume: 70,
       activeColumn: 'scene1'
   };
   ```

### 方案 B：模組化整合 (React/Vue 專案)

適用於現代前端框架專案。

#### Step 1: 提取 CSS 變數

創建 `vj-theme.css`：
```css
:root {
    --background: 220 20% 8%;
    --foreground: 0 0% 95%;
    --card: 220 18% 12%;
    --card-foreground: 0 0% 95%;
    --primary: 168 80% 55%;
    --primary-foreground: 220 20% 8%;
    --secondary: 220 15% 18%;
    --secondary-foreground: 0 0% 90%;
    --muted: 220 15% 15%;
    --muted-foreground: 220 10% 55%;
    --border: 220 15% 20%;
    --input: 220 15% 18%;
    --ring: 168 80% 55%;
    --radius: 0.5rem;
}
```

#### Step 2: 創建組件

**LayerRow.jsx** (React 範例)
```jsx
import React from 'react';
import './LayerRow.css';

const LayerRow = ({
    layerNumber,
    isActive,
    isPlaying,
    isPaused,
    clips,
    selectedClip,
    onPlay,
    onPause,
    onStop,
    onClipSelect
}) => {
    return (
        <div className={`layer-row ${isActive ? 'active' : ''}`}>
            <div className="layer-control">
                <div className="layer-name">L{layerNumber}</div>
                <div className="layer-buttons">
                    <button
                        className={`layer-btn ${isPlaying ? 'playing' : ''}`}
                        onClick={onPlay}
                    >
                        <PlayIcon />
                    </button>
                    <button
                        className={`layer-btn ${isPaused ? 'playing' : ''}`}
                        onClick={onPause}
                    >
                        <PauseIcon />
                    </button>
                    <button className="layer-btn" onClick={onStop}>
                        <StopIcon />
                    </button>
                </div>
            </div>

            <div className="clips-grid">
                {clips.map(clip => (
                    <ClipThumbnail
                        key={clip.id}
                        clip={clip}
                        isSelected={selectedClip === clip.id}
                        onClick={() => onClipSelect(clip.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default LayerRow;
```

**ClipThumbnail.jsx**
```jsx
import React from 'react';
import './ClipThumbnail.css';

const ClipThumbnail = ({ clip, isSelected, onClick }) => {
    // 移除圖層前綴以顯示
    const displayId = clip.id.replace(/^L\d+-/, '');

    return (
        <div
            className={`clip-thumbnail ${isSelected ? 'selected' : ''}`}
            onClick={onClick}
        >
            <div className="clip-preview">
                {clip.thumbnail ? (
                    <img src={clip.thumbnail} alt={clip.name} />
                ) : (
                    <span className="clip-id">{displayId}</span>
                )}
            </div>
            <div className="clip-label">
                <span className="clip-name">{clip.name}</span>
            </div>
        </div>
    );
};

export default ClipThumbnail;
```

**BottomControlBar.jsx**
```jsx
import React from 'react';
import './BottomControlBar.css';

const BottomControlBar = ({
    isGlobalPlaying,
    isGlobalPaused,
    volume,
    columnButtons,
    activeColumnId,
    onGlobalPlay,
    onGlobalPause,
    onGlobalStop,
    onResync,
    onVolumeChange,
    onColumnClick,
    onTextSend
}) => {
    return (
        <div className="control-bar">
            <div className="control-bar-inner">
                {/* Global Controls */}
                <div className="control-section">
                    <span className="global-label">Global</span>
                    <button
                        className={`control-btn ${isGlobalPlaying && !isGlobalPaused ? 'active' : ''}`}
                        onClick={onGlobalPlay}
                    >
                        <PlayIcon />
                    </button>
                    <button
                        className={`control-btn ${isGlobalPaused ? 'active' : ''}`}
                        onClick={onGlobalPause}
                    >
                        <PauseIcon />
                    </button>
                    <button className="control-btn" onClick={onGlobalStop}>
                        <StopIcon />
                    </button>
                </div>

                <div className="divider" />

                {/* Volume Control */}
                <VolumeControl
                    volume={volume}
                    onChange={onVolumeChange}
                />

                <div className="divider" />

                {/* Column Buttons */}
                <div className="column-buttons">
                    {columnButtons.map(btn => (
                        <button
                            key={btn.id}
                            className={`column-btn ${activeColumnId === btn.id ? 'active' : ''}`}
                            onClick={() => onColumnClick(btn.id)}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>

                {/* Text Input */}
                <TextInput onSend={onTextSend} />
            </div>
        </div>
    );
};

export default BottomControlBar;
```

#### Step 3: 狀態管理

使用 React Context 或 Redux 管理全局狀態：

```jsx
// VJControllerContext.jsx
import React, { createContext, useContext, useState } from 'react';

const VJControllerContext = createContext();

export const VJControllerProvider = ({ children }) => {
    const [state, setState] = useState({
        layers: {
            1: { isActive: false, isPlaying: false, isPaused: false, selectedClip: null },
            2: { isActive: true, isPlaying: false, isPaused: false, selectedClip: 'L2-ORG' },
            3: { isActive: false, isPlaying: false, isPaused: false, selectedClip: 'L3-CYB' },
            4: { isActive: false, isPlaying: false, isPaused: false, selectedClip: 'L4-NEO' }
        },
        global: { isPlaying: false, isPaused: false },
        volume: 70,
        activeColumn: 'col1'
    });

    const selectLayer = (layerNum) => {
        setState(prev => ({
            ...prev,
            layers: Object.keys(prev.layers).reduce((acc, key) => {
                acc[key] = { ...prev.layers[key], isActive: parseInt(key) === layerNum };
                return acc;
            }, {})
        }));
    };

    const toggleLayerPlay = (layerNum) => {
        setState(prev => ({
            ...prev,
            layers: {
                ...prev.layers,
                [layerNum]: {
                    ...prev.layers[layerNum],
                    isPlaying: !prev.layers[layerNum].isPlaying,
                    isPaused: false
                }
            }
        }));
    };

    // 更多操作...

    return (
        <VJControllerContext.Provider value={{ state, selectLayer, toggleLayerPlay }}>
            {children}
        </VJControllerContext.Provider>
    );
};

export const useVJController = () => useContext(VJControllerContext);
```

### 方案 C：Tailwind CSS 整合

如果你的專案使用 Tailwind CSS，可以使用工具類別替代自定義 CSS。

#### tailwind.config.js
```javascript
module.exports = {
    theme: {
        extend: {
            colors: {
                background: 'hsl(220, 20%, 8%)',
                foreground: 'hsl(0, 0%, 95%)',
                card: 'hsl(220, 18%, 12%)',
                'card-foreground': 'hsl(0, 0%, 95%)',
                primary: 'hsl(168, 80%, 55%)',
                'primary-foreground': 'hsl(220, 20%, 8%)',
                secondary: 'hsl(220, 15%, 18%)',
                'secondary-foreground': 'hsl(0, 0%, 90%)',
                muted: 'hsl(220, 15%, 15%)',
                'muted-foreground': 'hsl(220, 10%, 55%)',
                border: 'hsl(220, 15%, 20%)',
            },
            borderRadius: {
                DEFAULT: '0.5rem',
            }
        }
    }
}
```

#### 使用 Tailwind 類別
```jsx
<div className="flex bg-card border-2 border-transparent rounded-lg overflow-hidden hover:border-primary">
    <div className="w-20 flex-shrink-0 flex flex-col items-center justify-center gap-2 p-4">
        <div className="text-base font-bold">L1</div>
        <div className="flex flex-col gap-2 w-full">
            <button className="px-2.5 py-2.5 rounded-md bg-white/5 border border-white/10 min-h-[2.5rem] hover:bg-muted hover:border-primary transition-all">
                <PlayIcon className="w-4 h-4" />
            </button>
        </div>
    </div>
    <div className="flex-1 p-2 grid grid-cols-6 gap-2">
        {/* Clips */}
    </div>
</div>
```

---

## 自定義配置

### 修改圖層數量

**原始：4 層**

要改為 6 層：

1. 修改 `clipData`：
```javascript
const clipData = {
    6: [/* 第 6 層資料 */],
    5: [/* 第 5 層資料 */],
    4: [/* 第 4 層資料 */],
    3: [/* 第 3 層資料 */],
    2: [/* 第 2 層資料 */],
    1: [/* 第 1 層資料 */]
};
```

2. 修改 `state.layers`：
```javascript
const state = {
    layers: {
        1: { isActive: false, isPlaying: false, isPaused: false, selectedClip: null },
        2: { isActive: false, isPlaying: false, isPaused: false, selectedClip: null },
        3: { isActive: false, isPlaying: false, isPaused: false, selectedClip: null },
        4: { isActive: false, isPlaying: false, isPaused: false, selectedClip: null },
        5: { isActive: false, isPlaying: false, isPaused: false, selectedClip: null },
        6: { isActive: true, isPlaying: false, isPaused: false, selectedClip: null }
    },
    // ...
};
```

3. 不需要修改 `renderLayers()` 函數，它會自動根據 `clipData` 的鍵值渲染。

### 修改每層場景數量

**原始：每層 6 個場景**

要改為 8 個場景：

1. CSS 修改網格列數：
```css
.clips-grid {
    grid-template-columns: repeat(8, 1fr);  /* 原本是 repeat(6, 1fr) */
}
```

2. 資料結構中新增場景：
```javascript
const clipData = {
    4: [
        { id: 'L4-FOG', name: 'FogAndDust' },
        { id: 'L4-NEO', name: 'NeonRoom2' },
        { id: 'L4-INT1', name: 'IntoTheGlow' },
        { id: 'L4-NOT', name: 'NoHopeJustF...' },
        { id: 'L4-INT2', name: 'IntoTheGlow' },
        { id: 'L4-SHE', name: '584a04fceb9...' },
        { id: 'L4-NEW1', name: 'NewClip1' },    // 新增
        { id: 'L4-NEW2', name: 'NewClip2' }     // 新增
    ],
    // ...
};
```

### 修改主題顏色

**更換強調色為紫色**

```css
:root {
    --primary: 270 80% 60%;                 /* 紫色 #9966ff */
    --primary-foreground: 0 0% 100%;        /* 白色文字 */
    --ring: 270 80% 60%;                    /* 焦點環同色 */
}
```

**更換為橘色**

```css
:root {
    --primary: 25 95% 55%;                  /* 橘色 #ff7629 */
    --primary-foreground: 0 0% 100%;
    --ring: 25 95% 55%;
}
```

### 新增縮圖預覽

修改 `renderLayers()` 函數中的縮圖渲染：

```javascript
thumbnail.innerHTML = `
    <div class="clip-preview">
        ${clip.thumbnail
            ? `<img src="${clip.thumbnail}" alt="${clip.name}" class="w-full h-full object-cover" />`
            : `<span class="clip-id">${displayId}</span>`
        }
    </div>
    <div class="clip-label">
        <span class="clip-name">${clip.name}</span>
    </div>
`;
```

然後在資料中加入 `thumbnail` 屬性：

```javascript
const clipData = {
    4: [
        {
            id: 'L4-FOG',
            name: 'FogAndDust',
            thumbnail: '/images/fog-thumbnail.jpg'  // 新增
        },
        // ...
    ]
};
```

### 連接後端 API

將靜態資料改為動態載入：

```javascript
// 原始靜態資料
// const clipData = { ... };

// 改為動態載入
let clipData = {};

async function loadClipsData() {
    try {
        const response = await fetch('/api/clips');
        clipData = await response.json();
        renderLayers();
    } catch (error) {
        console.error('載入場景資料失敗:', error);
        showToast('錯誤', '無法載入場景資料');
    }
}

// 初始化時呼叫
loadClipsData();
```

---

## 常見問題

### Q1: 如何讓底部控制列響應式？

在小螢幕上，可以讓部分控制項換行：

```css
@media (max-width: 768px) {
    .control-bar-inner {
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .volume-control {
        min-width: 100%;
        order: 10;
    }

    .text-input-wrapper {
        min-width: 100%;
        order: 11;
    }
}
```

### Q2: 如何加入鍵盤快捷鍵？

在 JavaScript 中新增鍵盤事件監聽：

```javascript
document.addEventListener('keydown', (e) => {
    // 空白鍵：全局播放/暫停
    if (e.code === 'Space' && !e.target.matches('input')) {
        e.preventDefault();
        if (state.global.isPlaying) {
            globalPause();
        } else {
            globalPlay();
        }
    }

    // 數字鍵 1-4：切換圖層
    if (e.code.startsWith('Digit') && !e.target.matches('input')) {
        const layerNum = parseInt(e.code.replace('Digit', ''));
        if (layerNum >= 1 && layerNum <= 4) {
            selectLayer(layerNum);
        }
    }

    // R：重新同步
    if (e.code === 'KeyR' && !e.target.matches('input')) {
        resync();
    }
});
```

### Q3: 如何實作場景拖放排序？

使用 HTML5 Drag and Drop API：

```javascript
function renderLayers() {
    // ... 現有程式碼

    clips.forEach((clip, index) => {
        const thumbnail = document.createElement('div');
        thumbnail.className = `clip-thumbnail ${layer.selectedClip === clip.id ? 'selected' : ''}`;
        thumbnail.draggable = true;

        // 拖放事件
        thumbnail.ondragstart = (e) => {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', JSON.stringify({
                layerNum,
                clipId: clip.id,
                fromIndex: index
            }));
        };

        thumbnail.ondragover = (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        };

        thumbnail.ondrop = (e) => {
            e.preventDefault();
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));

            // 交換場景位置
            const clips = clipData[layerNum];
            const [removed] = clips.splice(data.fromIndex, 1);
            clips.splice(index, 0, removed);

            renderLayers();
            showToast('已移動', `場景已移至位置 ${index + 1}`);
        };

        // ... 其他程式碼
    });
}
```

### Q4: 如何加入場景過渡效果？

在選擇場景時加入淡入淡出效果：

```javascript
function selectClip(layerNum, clipId) {
    const layer = state.layers[layerNum];
    const oldClip = layer.selectedClip;

    // 更新狀態
    layer.selectedClip = clipId;
    renderLayers();

    // 顯示過渡資訊
    const clip = clipData[layerNum].find(c => c.id === clipId);
    showToast(`L${layerNum} 已切換`, `${clip.name}${oldClip ? ' (淡入)' : ''}`);

    // 如果需要實際視訊過渡，這裡可以加入視訊播放邏輯
    // 例如：fadeTransition(oldClip, clipId, 1000);
}
```

### Q5: 音量滑桿不靈敏怎麼辦？

增加觸控/滑鼠事件的精確度：

```javascript
// 修改 updateVolume 函數
function updateVolume(e) {
    const rect = volumeSlider.getBoundingClientRect();
    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const percent = Math.round(((x - rect.left) / rect.width) * 100);
    state.volume = Math.max(0, Math.min(100, percent));
    volumeFill.style.width = state.volume + '%';
    volumeText.textContent = state.volume + '%';
}

// 加入觸控支援
volumeSlider.ontouchstart = (e) => {
    isDragging = true;
    updateVolume(e);
    e.preventDefault();
};

document.addEventListener('touchmove', (e) => {
    if (isDragging) {
        updateVolume(e);
        e.preventDefault();
    }
}, { passive: false });

document.addEventListener('touchend', () => {
    isDragging = false;
});
```

### Q6: 如何實作場景預覽功能？

在滑鼠懸停時顯示場景預覽：

```javascript
// 在 renderLayers() 中加入
thumbnail.onmouseenter = () => {
    if (!clip.previewUrl) return;

    // 建立預覽視窗
    const preview = document.createElement('div');
    preview.className = 'clip-preview-popup';
    preview.innerHTML = `
        <video src="${clip.previewUrl}" autoplay loop muted></video>
        <div class="clip-info">
            <div class="clip-name">${clip.name}</div>
            <div class="clip-duration">${clip.duration || '00:00'}</div>
        </div>
    `;

    // 定位到縮圖旁
    const rect = thumbnail.getBoundingClientRect();
    preview.style.left = rect.left + 'px';
    preview.style.top = (rect.top - 200) + 'px';

    document.body.appendChild(preview);
    thumbnail.dataset.previewId = 'preview-' + clip.id;
};

thumbnail.onmouseleave = () => {
    const preview = document.querySelector('.clip-preview-popup');
    if (preview) preview.remove();
};
```

CSS：
```css
.clip-preview-popup {
    position: fixed;
    width: 320px;
    background: var(--card);
    border: 2px solid var(--primary);
    border-radius: var(--radius);
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    z-index: 1000;
    animation: fadeIn 0.2s;
}

.clip-preview-popup video {
    width: 100%;
    height: 180px;
    object-fit: cover;
}

.clip-preview-popup .clip-info {
    padding: 0.75rem;
    display: flex;
    justify-content: space-between;
}
```

---

## 效能優化建議

### 1. 虛擬滾動

當圖層數量超過 10 層時，使用虛擬滾動：

```javascript
// 使用 react-window 或 react-virtualized
import { FixedSizeList } from 'react-window';

<FixedSizeList
    height={600}
    itemCount={layerCount}
    itemSize={150}
>
    {({ index, style }) => (
        <div style={style}>
            <LayerRow layerNumber={index + 1} {...layerProps} />
        </div>
    )}
</FixedSizeList>
```

### 2. 延遲載入縮圖

使用 Intersection Observer 延遲載入縮圖：

```javascript
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target.querySelector('img');
            if (img && img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(entry.target);
            }
        }
    });
});

document.querySelectorAll('.clip-thumbnail').forEach(thumb => {
    observer.observe(thumb);
});
```

### 3. 防抖動音量更新

避免音量滑動時頻繁更新：

```javascript
let volumeUpdateTimeout;

function updateVolumeDebounced(percent) {
    clearTimeout(volumeUpdateTimeout);
    volumeUpdateTimeout = setTimeout(() => {
        // 實際更新音量到後端或音訊系統
        console.log('Volume updated to:', percent);
    }, 100);
}
```

---

## 瀏覽器兼容性

### 支援的瀏覽器
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Android Chrome 90+

### 需要 Polyfill 的功能
- CSS `aspect-ratio` (Safari < 15)
- CSS `gap` in Flexbox (Safari < 14.1)

### 加入 Polyfill
```html
<script src="https://cdn.jsdelivr.net/npm/css-aspect-ratio-polyfill@1.0.0/dist/aspect-ratio.min.js"></script>
```

---

## 授權與使用

此設計可以自由用於：
- ✅ 商業專案
- ✅ 開源專案
- ✅ 個人專案
- ✅ 修改與客製化

---

## 聯絡與支援

如有問題或需要協助，請查閱原始檔案或相關文件。

**相關檔案：**
- `media-stage-control.html` - 完整單頁應用
- `vj-controller.html` - 靜態版本
- `media-stage-control-main/` - React 原始專案

---

最後更新：2025-12-09
