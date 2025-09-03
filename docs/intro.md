---
id: intro
title: Welcome to OpenMark
sidebar_label: Intro
slug: /intro
sidebar_position: 1
---

# 📝 Welcome to **OpenMark**

OpenMark 是一個開放協作的 Markdown 知識庫。  
目標：把我們在 ChatGPT 對話中的**精華內容**、**程式碼**、**逐步紀錄**，轉化成清晰的 Markdown 文件，並公開分享。  

OpenMark is an open, collaborative Markdown knowledge base.  
The goal is to turn our **key ChatGPT conversations**, **code snippets**, and **iteration logs** into clear Markdown documents for everyone to use and improve.

---

## 🚀 快速開始 (Quick Start)

1. **建立新檔案 (Create a new file)**
   - 進入 `/docs/`
   - 複製 `_template.md`
   - 重新命名 → 例如 (e.g.):  
     ```
     2025-09-03-my-topic.md
     ```

2. **Frontmatter 規則 (Frontmatter rules)**  
   在每篇文章最上面放置 YAML 區塊：  
   Place a YAML block at the very top of each file:
   ```md
   ---
   title: My Topic Title
   slug: /2025-09-03-my-topic
   sidebar_position: 2
   tags: [openmark, guide]
   ---
