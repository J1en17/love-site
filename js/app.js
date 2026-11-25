/* ============================================================
   「我们的小宇宙」· 应用脚本
   hash 路由 + 各视图渲染 + 倒计时 + 留言/清单本地存储
   ============================================================ */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const C = CONFIG;
  const viewEl = $("#view");
  const LS_MSG = "luv_messages_v1";
  const LS_WISH = "luv_wishes_v1";

  /* ---------------- 工具 ---------------- */
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const photoSrc = (file) => file ? `assets/photos/${file}` : null;

  /* 照片占位 HTML（file 为 null 时用）*/
  const photoBlock = (item, extraClass = "") =>
    item && item.file
      ? `<img src="${esc(photoSrc(item.file))}" alt="${esc(item.caption || "")}" loading="lazy">`
      : `<div class="placeholder ${extraClass}" aria-label="照片占位：${esc(item?.caption || "待补充")}">
           <span class="ph-ico" aria-hidden="true">🖼️</span>
           <span>${esc(item?.caption || "照片待补充")}</span>
         </div>`;

  const fmtDate = (iso) => {
    if (!iso) return "—";
    const [y, m, d] = iso.split("-");
    return `${y} 年 ${Number(m)} 月 ${Number(d)} 日`;
  };

  /* ---------------- 倒计时 ---------------- */
    let countdownTimer = null;
    function renderCountdown() {
      const el = $("#cd-main");
      if (!el) return;
      const pad = (n) => String(n).padStart(2, "0");

      if (!C.loveDate) {
        el.innerHTML = `<span class="cd-num">— — —</span>`;
        const sub = $("#cd-sub");
        if (sub) sub.innerHTML = `<span>时 ——</span><span>分 ——</span><span>秒 ——</span>`;
        const note2 = $("#cd-note");
        if (note2) note2.textContent = "（纪念日设定好后，这里会开始实时倒数 ✨）";
        return;
      }
      if (countdownTimer) clearInterval(countdownTimer);
      const target = new Date(C.loveDate + "T00:00:00");
      const tick = () => {
        const diff = Math.max(0, Date.now() - target.getTime());
        const days = Math.floor(diff / 864e5);
        const hours = Math.floor(diff / 36e5) % 24;
        const mins = Math.floor(diff / 6e4) % 60;
        const secs = Math.floor(diff / 1e3) % 60;
        el.innerHTML =
          `<span class="cd-num">${days}</span>` +
          `<span class="cd-days-label">天</span>`;
        const sub = $("#cd-sub");
        if (sub)
          sub.innerHTML =
            `<span>${pad(hours)}<b> 时 </b></span>` +
            `<span>${pad(mins)}<b> 分 </b></span>` +
            `<span>${pad(secs)}<b> 秒 </b></span>`;
      };
      tick();
      countdownTimer = setInterval(tick, 1000);
    }

  /* ---------------- 花瓣背景 ---------------- */
  function makePetals() {
    const wrap = $(".petals");
    if (!wrap || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const glyphs = ["🌸", "💗", "🌸", "💞", "🌸", "✨"];
    const n = 12;
    for (let i = 0; i < n; i++) {
      const p = document.createElement("span");
      p.className = "petal";
      p.textContent = glyphs[i % glyphs.length];
      const dur = 14 + Math.random() * 14;
      const delay = -Math.random() * dur;
      p.style.left = Math.random() * 100 + "vw";
      p.style.fontSize = 10 + Math.random() * 14 + "px";
      p.style.setProperty("--sway", (Math.random() * 80 - 40) + "px");
      p.style.animationDuration = dur + "s";
      p.style.animationDelay = delay + "s";
      wrap.appendChild(p);
    }
  }

  /* ---------------- 视图渲染 ---------------- */
  const views = {
    home() {
      return `
      <section class="hero">
        <div class="hero-avatars">
          <div class="avatar-ring">
            <div class="avatar-inner">
              ${C.avatarMe ? `<img src="${esc(photoSrc(C.avatarMe))}" alt="我">` : `<div class="avatar-ph" aria-label="头像占位">🧑</div>`}
            </div>
          </div>
          <div class="avatar-ring">
            <div class="avatar-inner">
              ${C.avatarPartner ? `<img src="${esc(photoSrc(C.avatarPartner))}" alt="你">` : `<div class="avatar-ph" aria-label="头像占位">👧</div>`}
            </div>
          </div>
          <span class="hero-heart" aria-hidden="true">
            <svg viewBox="0 0 32 29"><path fill="#E2728C" d="M16 28.7C7.5 22.9 1 17.7 1 11.2 1 6 4.9 2 9.9 2c2.4 0 4.7 1.1 6.1 3C17.4 3.1 19.7 2 22.1 2 27.1 2 31 6 31 11.2c0 6.5-6.5 11.7-15 17.5z"/></svg>
          </span>
        </div>
        <h1 class="hero-title">${esc(C.siteTitle)}</h1>
        <p class="hero-sub">${esc(C.subtitle)}</p>

        <div class="countdown">
          <div class="cd-label">和你在一起</div>
          <div class="cd-main" id="cd-main"><span class="cd-num">— — —</span></div>
          <div class="cd-sub" id="cd-sub"><span>时 ——</span><span>分 ——</span><span>秒 ——</span></div>
          <div class="cd-note">${C.loveDate ? "" : "（纪念日设定好后，这里会开始实时倒数 ✨）"}</div>
        </div>

        <div class="entry-grid">
          <a class="card entry reveal" href="#/message" data-nav="message">
            <div class="entry-ico" aria-hidden="true">💌</div>
            <h3>留言板</h3><p>${esc(C.entries.message)}</p>
          </a>
          <a class="card entry reveal" href="#/album" data-nav="album">
            <div class="entry-ico" aria-hidden="true">📷</div>
            <h3>相册</h3><p>${esc(C.entries.album)}</p>
          </a>
          <a class="card entry reveal" href="#/list" data-nav="list">
            <div class="entry-ico" aria-hidden="true">✨</div>
            <h3>清单</h3><p>${esc(C.entries.list)}</p>
          </a>
          <a class="card entry reveal" href="#/diary" data-nav="diary">
            <div class="entry-ico" aria-hidden="true">📖</div>
            <h3>点滴</h3><p>${esc(C.entries.diary)}</p>
          </a>
          <a class="card entry reveal" href="#/about" data-nav="about">
            <div class="entry-ico" aria-hidden="true">💞</div>
            <h3>关于我们</h3><p>${esc(C.entries.about)}</p>
          </a>
        </div>
      </section>`;
    },

    message() {
      const msgs = getMsgs().slice().reverse().slice(0, 50);
      document.title = "留言板 · 我们的小宇宙";
      return `
      <div class="page-head reveal">
        <span class="eyebrow">MESSAGE</span>
        <h1>留言板</h1>
        <p>想对你说的话，都留在这里</p>
      </div>
      <form class="msg-form card reveal" id="msg-form">
        <div class="row">
          <input type="text" id="msg-nick" maxlength="16" placeholder="你的昵称" required>
          <textarea id="msg-text" maxlength="200" placeholder="写下一句话吧…" required></textarea>
        </div>
        <div style="text-align:right"><button class="btn" type="submit">留下这句话 ✦</button></div>
      </form>
      <div class="msg-list" id="msg-list">
        ${msgs.length
          ? msgs.map((m) => `
            <div class="card msg-item reveal">
              <div class="meta"><span class="nick">💗 ${esc(m.nick)}</span><span class="time">${new Date(m.time).toLocaleString("zh-CN", { hour12: false })}</span></div>
              <p>${esc(m.text)}</p>
            </div>`).join("")
          : `<div class="msg-empty">还没有留言，说第一句话吧 ✨</div>`}
      </div>`;
    },

    album() {
      const groups = C.albums || [];
      document.title = "相册 · 我们的小宇宙";
      return `
      <div class="page-head reveal">
        <span class="eyebrow">ALBUM</span>
        <h1>我们的相册</h1>
        <p>一起走过的日子，一格一格放好</p>
      </div>
      ${groups.length
        ? groups.map((g, gi) => `
          <section class="album-group reveal">
            <div class="ag-head">
              <span class="ag-date">${g.date ? fmtDate(g.date) : "（待补充日期）"}</span>
              <span class="ag-title">${esc(g.title)}</span>
            </div>
            <div class="album-row">
              ${(g.photos || []).map((p, i) => `
                <figure class="photo-card">
                  ${photoBlock(p)}
                  <figcaption class="ph-cap">${esc(p.caption || "")}</figcaption>
                </figure>`).join("")}
            </div>
          </section>`).join("")
        : `<div class="msg-empty">相册还是空的，把照片发给我，我帮你放进来 📸</div>`}
      `;
    },

    list() {
      const items = getWishes();
      const done = items.filter((i) => i.done).length;
      const pct = items.length ? Math.round((done / items.length) * 100) : 0;
      document.title = "清单 · 我们的小宇宙";
      return `
      <div class="page-head reveal">
        <span class="eyebrow">WISHLIST</span>
        <h1>恋爱愿望清单</h1>
        <p>想和你一起完成的每一件事</p>
      </div>
      <div class="card wish-box reveal">
        <div class="wish-progress">
          <div class="wp-top"><span>一起完成的心愿</span><b>${done} / ${items.length} 已完成 · ${pct}%</b></div>
          <div class="wish-bar"><i style="width:${pct}%"></i></div>
        </div>
        ${items.length
          ? items.map((it, i) => `
            <div class="wish-item ${it.done ? "done" : ""}" data-idx="${i}" role="checkbox" aria-checked="${it.done}" tabindex="0">
              <span class="check" aria-hidden="true">✓</span>
              <span class="wish-text">${esc(it.text)}</span>
            </div>`).join("")
          : `<div class="wish-empty">清单还是空的 ✨</div>`}
      </div>`;
    },

    diary() {
      const items = C.diaries || [];
      document.title = "点滴 · 我们的小宇宙";
      return `
      <div class="page-head reveal">
        <span class="eyebrow">DIARY</span>
        <h1>我们的小点滴</h1>
        <p>普通的日子里，藏着小确幸</p>
      </div>
      <div class="diary-list">
        ${items.length
          ? items.map((d) => `
            <article class="card diary-card reveal">
              <div class="dc-thumb">${d.file ? `<img src="${esc(photoSrc(d.file))}" alt="${esc(d.title)}" loading="lazy">` : `<div class="placeholder">📖 <span>照片待补充</span></div>`}</div>
              <div class="dc-body">
                <div class="dc-date">${d.date ? fmtDate(d.date) : "（待补充日期）"}</div>
                <h2 class="dc-title">${esc(d.title)}</h2>
                <p class="dc-text">${esc(d.text)}</p>
              </div>
            </article>`).join("")
          : `<div class="msg-empty">还没有点滴，等你去记录 📝</div>`}
      </div>`;
    },

    about() {
      const L = C.letter || {};
      const paras = L.paragraphs || [];
      document.title = "关于我们 · 我们的小宇宙";
      return `
      <div class="page-head reveal">
        <span class="eyebrow">FOR YOU</span>
        <h1>关于我们</h1>
        <p>这封信，写给你</p>
      </div>
      <div class="letter reveal">
        <div class="l-greeting">${esc(L.greeting || "")}</div>
        ${paras.map((p) => `<p>${esc(p)}</p>`).join("")}
        <div class="l-sign">${esc(L.signature || "")}</div>
      </div>`;
    },
  };

  /* ---------------- 路由 ---------------- */
  function currentRoute() {
    const h = location.hash.replace(/^#\/?/, "") || "home";
    return views[h] ? h : "home";
  }
  function navigate() {
    const route = currentRoute();
    viewEl.innerHTML = views[route]();
    viewEl.scrollTop = 0;
    window.scrollTo({ top: 0 });
    // 高亮导航
    document.querySelectorAll("[data-nav]").forEach((a) => {
      const active = a.dataset.nav === route;
      a.classList.toggle("active", active);
    });
    // 激活导航不需要 home 高亮 topnav（topnav 无 home 项）
    if (route === "home") document.querySelectorAll(".topnav a, .bottomnav a").forEach((a) => a.classList.remove("active"));
    $(`.bottomnav a[data-nav="${route}"]`)?.classList.add("active");

    bindPage(route);
    observeReveals();
    if (route === "home") renderCountdown();
  }

  /* 每页渲染后的事件绑定 */
  function bindPage(route) {
    if (route === "message") {
      const form = $("#msg-form");
      form?.addEventListener("submit", (e) => {
        e.preventDefault();
        const nick = $("#msg-nick").value.trim() || "匿名";
        const text = $("#msg-text").value.trim();
        if (!text) return;
        const msgs = getMsgs();
        msgs.push({ nick, text, time: Date.now() });
        saveMsgs(msgs);
        navigate(); // 重渲染列表
      });
    }
    if (route === "list") {
      document.querySelectorAll(".wish-item").forEach((el) => {
        const toggle = () => {
          const list = getWishes();
          const idx = Number(el.dataset.idx);
          list[idx].done = !list[idx].done;
          saveWishes(list);
          // 只更新进度条与该项样式，避免整页跳变
          el.classList.toggle("done", list[idx].done);
          el.setAttribute("aria-checked", String(list[idx].done));
          const items = getWishes();
          const done = items.filter((i) => i.done).length;
          const pct = items.length ? Math.round((done / items.length) * 100) : 0;
          $(".wp-top b").textContent = `${done} / ${items.length} 已完成 · ${pct}%`;
          $(".wish-bar i").style.width = pct + "%";
        };
        el.addEventListener("click", toggle);
        el.addEventListener("keydown", (e) => {
          if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(); }
        });
      });
    }
  }

  /* 滚动淡入 */
  function observeReveals() {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.isIntersecting && (en.target.classList.add("in"), io.unobserve(en.target))),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  }

  /* ---------------- 存储 ---------------- */
  function getMsgs() {
    try { return JSON.parse(localStorage.getItem(LS_MSG)) || []; } catch { return []; }
  }
  function saveMsgs(msgs) { try { localStorage.setItem(LS_MSG, JSON.stringify(msgs)); } catch {} }

  function getWishes() {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_WISH));
      if (Array.isArray(saved) && saved.length === C.wishlist.length) return saved;
    } catch {}
    return C.wishlist.map((w) => ({ ...w }));
  }
  function saveWishes(list) { try { localStorage.setItem(LS_WISH, JSON.stringify(list)); } catch {} }

  /* ---------------- 音乐 ---------------- */
  function initMusic() {
    const btn = $("#music-btn");
    if (!C.musicFile || !btn) return;
    btn.hidden = false;
    const audio = new Audio(`assets/${C.musicFile}`);
    audio.loop = true;
    btn.addEventListener("click", () => {
      if (audio.paused) { audio.play().catch(() => {}); btn.classList.add("playing"); }
      else { audio.pause(); btn.classList.remove("playing"); }
    });
    document.addEventListener("visibilitychange", () => document.hidden && audio.pause());
  }

  /* ---------------- 启动 ---------------- */
  makePetals();
  initMusic();
  window.addEventListener("hashchange", navigate);
  navigate();
})();