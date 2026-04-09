// say goodbye to your dark reader extension usage :)
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (
        node.tagName === "STYLE" &&
        (node.className.includes("darkreader") ||
          node.id?.includes("darkreader"))
      ) {
        node.remove();
      }
    });
  });
});
observer.observe(document.head, { childList: true });

// hello, you're not supposed to be reading this but if you are, neat.
// take whatever you want from this code, literally all of it is just trial and error + documentation stuff.
// feline supremacy.
// it took way too long to finish this site, good lord.

// saving settings

function saveSystemSettings() {
  localStorage.setItem("system_config", JSON.stringify(SYSTEM_CONFIG));
}

function loadSystemSettings() {
  const saved = localStorage.getItem("system_config");
  if (saved) Object.assign(SYSTEM_CONFIG, JSON.parse(saved));
}

// constant stuff

const TEXT_EL = document.getElementById("text");
const CURSOR_EL = document.getElementById("cursor");

const faces = [":)", ":D", ":]", ":>", ":3", "=)", "=D", "=]", "=3"];
const randomFace = faces[Math.floor(Math.random() * faces.length)];

const MSG1 = `Welcome ${randomFace}`;
const MSG2 = "How are you?";
const TYPE_SPEED = 100;
const BS_SPEED = 100;
const PAUSE_AFTER1 = 1000;

// timeout manager

const TimeoutManager = {
  timers: new Set(),
  set(callback, delay) {
    const id = setTimeout(() => {
      this.timers.delete(id);
      callback();
    }, delay);
    this.timers.add(id);
    return id;
  },
  clearAll() {
    for (const id of this.timers) clearTimeout(id);
    this.timers.clear();
  }
};

// system config

const SYSTEM_CONFIG = {
  animSpeed: 1,
  accentColor: "white",
  reducedMotion: false
};
loadSystemSettings();
document.documentElement.style.setProperty(
  "--accent",
  SYSTEM_CONFIG.accentColor
);

function ms(raw) {
  return raw / SYSTEM_CONFIG.animSpeed;
}

// navigation data

const BIG_BOXES = [
  { symbol: "△", label: "Info", glitch: "Know More.", target: showParagraphs },
  {
    symbol: "◇",
    label: "Portfolio",
    glitch: "Just Projects.",
    target: showPortfolio
  },
  {
    symbol: "☆",
    label: "Playground",
    glitch: "Play Around.",
    target: showPlayground
  },
  {
    symbol: "⬠",
    label: "Contact",
    glitch: "Let's Talk.",
    target: showContactInfo
  },
  { symbol: "◯", label: "Status", glitch: "Right Now.", target: showGallery },
  {
    symbol: "⬡",
    label: "Settings",
    glitch: "Change Visuals.",
    target: showSettingsPage
  }
];

const ALL_SMALL_BOXES = [
  { symbol: "◻", label: "Home", glitch: "Go back.", target: showBigBoxes },
  {
    symbol: "△",
    label: "About Me",
    glitch: "Know More.",
    target: showParagraphs
  },
  {
    symbol: "◇",
    label: "Portfolio",
    glitch: "Just Projects.",
    target: showPortfolio
  },
  {
    symbol: "☆",
    label: "Playground",
    glitch: "Play Around.",
    target: showPlayground
  },
  {
    symbol: "⬠",
    label: "Contact",
    glitch: "Let's Talk.",
    target: showContactInfo
  },
  { symbol: "◯", label: "Status", glitch: "Right Now.", target: showGallery },
  {
    symbol: "⬡",
    label: "Settings",
    glitch: "Change Visuals.",
    target: showSettingsPage
  }
];

// supports or helpers or smth

function bstToday(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setUTCHours(h - 1, m, 0, 0);
  return d;
}

function isActiveNow(days, startBST, endBST) {
  const now = new Date();
  if (!days.includes(now.getUTCDay())) return false;
  return now >= bstToday(startBST) && now <= bstToday(endBST);
}

function getContainer() {
  return document.getElementById("container-content");
}

function css(el, styles) {
  Object.assign(el.style, styles);
}

function fadeOut(el, rawMs, cb) {
  if (!el) {
    cb?.();
    return;
  }
  const duration = ms(rawMs ?? 1000);
  css(el, { transition: `opacity ${duration}ms ease`, opacity: 0 });
  TimeoutManager.set(() => {
    el.remove();
    cb?.();
  }, duration);
}

function fadeOutAll(els, rawMs, cb) {
  TimeoutManager.clearAll();
  let pending = els.length;
  els.forEach((el) =>
    fadeOut(el, rawMs, () => {
      if (!--pending) cb?.();
    })
  );
}

function freshContainer(extraStyles = {}) {
  getContainer()?.remove();
  const div = document.createElement("div");
  div.id = "container-content";
  css(div, {
    opacity: 0,
    transition: `opacity ${ms(1000)}ms ease`,
    ...extraStyles
  });
  document.querySelector(".container").appendChild(div);
  requestAnimationFrame(() =>
    requestAnimationFrame(() => (div.style.opacity = 1))
  );
  return div;
}

function makeSpan(text, classes = [], extraStyles = {}) {
  const s = document.createElement("span");
  s.textContent = text;
  if (classes.length) s.classList.add(...classes);
  if (Object.keys(extraStyles).length) css(s, extraStyles);
  return s;
}

function revealEl(el) {
  el.style.opacity = "1";
  el.style.transform = "translateY(0)";
}

// lightbox stuff

function showLightbox(src) {
  const overlay = document.createElement("div");
  overlay.classList.add("lightbox-overlay");
  const img = document.createElement("img");
  img.src = src;
  overlay.appendChild(img);
  document.body.appendChild(overlay);
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      overlay.style.opacity = "1";
      img.style.transform = "scale(1)";
    })
  );
  overlay.addEventListener("click", () => {
    overlay.style.opacity = "0";
    img.style.transform = "scale(0.85)";
    setTimeout(() => overlay.remove(), 500);
  });
}

// selection stuff

function createSection(title, containerStyles = {}) {
  const container = freshContainer({ ...containerStyles });
  container.classList.add("section-container");

  const fadeDuration = ms(1000);
  const h2 = document.createElement("h2");
  h2.textContent = title;
  css(h2, {
    transition: `opacity ${fadeDuration}ms ease, transform ${fadeDuration}ms ease`
  });
  container.appendChild(h2);
  TimeoutManager.set(() => revealEl(h2), 0);
  return { container, h2 };
}

// animated paragraph

function makeAnimatedPara(text, fontSize) {
  const p = document.createElement("p");
  p.textContent = text;
  p.classList.add("anim-para");
  css(p, {
    fontSize,
    transition: `opacity ${ms(1000)}ms ease, transform ${ms(1000)}ms ease`
  });
  return p;
}

// typing intro

function typeMessage(msg, cb, target = TEXT_EL) {
  let i = 0;
  CURSOR_EL.style.opacity = 1;
  CURSOR_EL.classList.remove("blink");
  (function tick() {
    if (i < msg.length) {
      target.textContent += msg[i] === " " ? "\u00A0" : msg[i];
      i++;
      setTimeout(tick, TYPE_SPEED);
    } else {
      CURSOR_EL.classList.add("blink");
      cb?.();
    }
  })();
}

function backspace(count, cb, target = TEXT_EL) {
  CURSOR_EL.classList.remove("blink");
  (function tick() {
    if (count-- > 0) {
      target.textContent = target.textContent.slice(0, -1);
      setTimeout(tick, BS_SPEED);
    } else cb?.();
  })();
}

// label stuff

function fitTextToBox(span, maxWidth) {
  let fs = parseInt(getComputedStyle(span).fontSize);
  while (span.scrollWidth > maxWidth && fs > 6) {
    span.style.fontSize = --fs + "px";
  }
}

function adjustSmallBoxLabels(labelEls) {
  labelEls.forEach((label) => {
    label.style.fontSize = "0.75rem";
    fitTextToBox(label, label.parentElement.clientWidth - 10);
  });
}

// box stuff

function createBox(boxData, sizeStyles = {}, iconFontSize, labelFontSize) {
  const boxDiv = document.createElement("div");
  boxDiv.classList.add("nav-box");
  css(boxDiv, {
    transition: `opacity ${ms(600)}ms ease, transform ${ms(200)}ms ease`,
    ...sizeStyles
  });

  const icon = makeSpan(boxData.symbol, ["box-icon"], {
    opacity: "1",
    fontSize: iconFontSize,
    transition: `opacity ${ms(400)}ms ease`
  });

  const label = makeSpan(boxData.label, ["box-label"], {
    opacity: "0",
    fontSize: labelFontSize,
    transition: `opacity ${ms(400)}ms ease`
  });

  boxDiv.append(icon, label);

  let glitchTimeout = null;

  boxDiv.addEventListener("mouseenter", () => {
    boxDiv.style.transform = "scale(1.05)";
    icon.style.opacity = "0";
    label.style.opacity = "1";
    if (boxData.glitch) {
      let showGlitch = false;
      function triggerGlitch() {
        showGlitch = !showGlitch;
        label.textContent = showGlitch ? boxData.glitch : boxData.label;
        glitchTimeout = setTimeout(triggerGlitch, Math.random() * 1900 + 100);
      }
      glitchTimeout = setTimeout(triggerGlitch, Math.random() * 1900 + 100);
    }
  });

  boxDiv.addEventListener("mouseleave", () => {
    boxDiv.style.transform = "scale(1)";
    icon.style.opacity = "1";
    label.style.opacity = "0";
    clearTimeout(glitchTimeout);
    glitchTimeout = null;
    label.textContent = boxData.label;
  });

  // mobile auto flicker
  if (window.innerWidth < 768) {
    let flickerTimer = null;
    const autoFlicker = () => {
      if (!document.body.contains(boxDiv)) {
        clearTimeout(flickerTimer);
        return;
      }
      const isShowingIcon = icon.style.opacity === "1";
      icon.style.opacity = isShowingIcon ? "0" : "1";
      label.style.opacity = isShowingIcon ? "1" : "0";
      flickerTimer = setTimeout(autoFlicker, 2500 + Math.random() * 2000);
    };
    flickerTimer = setTimeout(autoFlicker, 1500);
  }

  return { boxDiv, icon, label };
}

// wheel math

function wheelPosition(index, total, radius) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
}

// big wheel

function showBigBoxes() {
  const isMobile = window.innerWidth < 768;
  const BOX_SIZE = isMobile ? 80 : 180;
  const RADIUS = isMobile ? 105 : 250;
  const WHEEL_SIZE = (RADIUS + BOX_SIZE / 2 + 10) * 2;

  const container = freshContainer({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    overflow: "hidden"
  });

  const wheelWrapper = document.createElement("div");
  wheelWrapper.classList.add("wheel-wrapper");
  css(wheelWrapper, { width: WHEEL_SIZE + "px", height: WHEEL_SIZE + "px" });
  container.appendChild(wheelWrapper);

  const disc = document.createElement("div");
  disc.classList.add("wheel-disc");
  css(disc, {
    transform: "rotate(-540deg) scale(0.2)",
    opacity: "0",
    transition: `transform ${ms(
      1100
    )}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${ms(600)}ms ease`
  });
  wheelWrapper.appendChild(disc);

  const centerDot = document.createElement("div");
  centerDot.classList.add("wheel-center-dot");
  css(centerDot, {
    width: isMobile ? "8px" : "12px",
    height: isMobile ? "8px" : "12px"
  });
  disc.appendChild(centerDot);

  BIG_BOXES.forEach((box, i) => {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const cx = WHEEL_SIZE / 2 + Math.cos(angle) * RADIUS;
    const cy = WHEEL_SIZE / 2 + Math.sin(angle) * RADIUS;
    const rotation = angle - Math.PI / 2;

    const wrapper = document.createElement("div");
    wrapper.classList.add("wheel-box-wrapper");
    css(wrapper, {
      width: BOX_SIZE + "px",
      height: BOX_SIZE + "px",
      left: cx - BOX_SIZE / 2 + "px",
      top: cy - BOX_SIZE / 2 + "px",
      transform: `rotate(${rotation}rad)`
    });

    const { boxDiv, icon, label } = createBox(
      box,
      {
        width: "100%",
        height: "100%",
        position: "relative",
        borderRadius: isMobile ? "6px" : "10px",
        opacity: "1",
        transition: `transform ${ms(200)}ms ease`
      },
      isMobile ? "1.8rem" : "3.8rem",
      isMobile ? "0.75rem" : "1.7rem"
    );

    // Flip text on boxes that face inward
    if (i === 0 || i === 1 || i === 5) {
      icon.style.transform = "rotate(180deg)";
      label.style.transform = "rotate(180deg)";
    }

    wrapper.appendChild(boxDiv);
    disc.appendChild(wrapper);
    boxDiv.addEventListener("click", () =>
      fadeOutAll([container], 1000, box.target)
    );
  });

  // Spin-in, then settle
  TimeoutManager.set(() => {
    disc.style.transform = "rotate(15deg) scale(1)";
    disc.style.opacity = "1";
    TimeoutManager.set(() => {
      disc.style.transition = `transform ${ms(
        150
      )}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      disc.style.transform = "rotate(0deg) scale(1)";
    }, ms(1100));
  }, ms(80));
}

// small wheel

function showFourSmallBoxes(currentCb = null, targetWrapper = null) {
  const isMobile = window.innerWidth < 768;
  const container = targetWrapper || getContainer();
  if (!container) return;

  container.querySelector(".small-box-wrapper")?.remove();

  const pool = ALL_SMALL_BOXES.filter((b) => b.target !== currentCb);
  const homeBox = pool.find((b) => b.target === showBigBoxes);
  const others = pool.filter((b) => b.target !== showBigBoxes);
  const boxes = [homeBox, ...others];
  const total = boxes.length;

  const BOX_SIZE = isMobile ? 64 : 76;
  const RADIUS = isMobile ? 90 : 110;
  const WHEEL_SIZE = (RADIUS + BOX_SIZE / 2 + 8) * 2;

  const wrapper = document.createElement("div");
  wrapper.classList.add("small-box-wrapper");
  css(wrapper, {
    width: WHEEL_SIZE + "px",
    height: "0px",
    marginTop: "0px",
    opacity: "0",
    transition: `height ${ms(700)}ms cubic-bezier(0.25, 1, 0.4, 1),
                 margin-top ${ms(700)}ms cubic-bezier(0.25, 1, 0.4, 1),
                 opacity ${ms(400)}ms ease`
  });
  container.appendChild(wrapper);
  void wrapper.offsetHeight; // force reflow before animating

  wrapper.style.height = WHEEL_SIZE + "px";
  wrapper.style.marginTop = isMobile ? "20px" : "40px";
  wrapper.style.opacity = "1";

  const pin = document.createElement("div");
  pin.classList.add("small-wheel-pin");
  wrapper.appendChild(pin);

  const labelEls = [];
  const appearanceDelay = ms(400);

  boxes.forEach((box, i) => {
    const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
    const cx = WHEEL_SIZE / 2 + Math.cos(angle) * RADIUS;
    const cy = WHEEL_SIZE / 2 + Math.sin(angle) * RADIUS;
    const rotation = angle - Math.PI / 2;

    const boxWrapper = document.createElement("div");
    boxWrapper.classList.add("wheel-box-wrapper");
    css(boxWrapper, {
      width: BOX_SIZE + "px",
      height: BOX_SIZE + "px",
      left: cx - BOX_SIZE / 2 + "px",
      top: cy - BOX_SIZE / 2 + "px",
      transform: `rotate(${rotation}rad)`,
      opacity: "0",
      transition: `opacity ${ms(500)}ms ease, transform ${ms(200)}ms ease`
    });

    const { boxDiv, label, icon } = createBox(
      box,
      { width: "100%", height: "100%", position: "relative", opacity: "1" },
      isMobile ? "1.4rem" : "1.8rem",
      isMobile ? "0.6rem" : "0.75rem"
    );

    if (i === 0 || i === 1 || i === total - 1) {
      icon.style.transform = "rotate(180deg)";
      label.style.transform = "rotate(180deg)";
    }

    boxWrapper.appendChild(boxDiv);
    wrapper.appendChild(boxWrapper);
    labelEls.push(label);

    boxDiv.addEventListener("click", () =>
      fadeOutAll([getContainer()], 500, box.target)
    );

    TimeoutManager.set(() => {
      boxWrapper.style.opacity = "1";
    }, appearanceDelay + ms(i * 180 + 50));
  });

  TimeoutManager.set(
    () => adjustSmallBoxLabels(labelEls),
    appearanceDelay + ms(total * 180 + 200)
  );
}

// about me

function showParagraphs() {
  const { container } = createSection("About Me", { maxWidth: "900px" });

  const paras = [
    "Hello hello, I'm Milo.",
    "I'm 23, currently living in Bournemouth, UK. But, I was born in Poland.",
    "Bournemouth University Criminology BA (Hons) Graduate (2:1), Human Centred Artificial Intelligence (MSc) student.",
    "I am a man of many talents, being a:"
  ];

  const talents = [
    "Retired semi-professional Overwatch player.",
    "Retired model.",
    "Retired radio-host.",
    "Amateur photographer.",
    "Amateur programmer.",
    "Amateur golfer.",
    "Amateur muay-thai fighter."
  ];

  const paraEls = paras.map((t) => {
    const p = makeAnimatedPara(t, "clamp(0.9rem,2.5vw,1.1rem)");
    container.appendChild(p);
    return p;
  });
  const talentEls = talents.map((t) => {
    const p = makeAnimatedPara(t, "clamp(0.85rem,2.2vw,1rem)");
    container.appendChild(p);
    return p;
  });

  paraEls.forEach((p, i) =>
    TimeoutManager.set(() => revealEl(p), ms(i * 1000 + 500))
  );

  const talentStart = ms(paras.length * 1000 + 500);
  talentEls.forEach((p, i) =>
    TimeoutManager.set(() => revealEl(p), talentStart + ms(i * 750))
  );

  const totalTime = talentStart + ms(talents.length * 750);
  TimeoutManager.set(
    () => showFourSmallBoxes(showParagraphs, container),
    totalTime + ms(500)
  );
}

// contact

function showContactInfo() {
  const { container } = createSection("Contact");

  const contacts = [
    { text: "Contact Information:", clickable: false },
    {
      text: "Instagram: @MiloSelfEsteem",
      clickable: true,
      href: "https://instagram.com/Milo_SelfEsteem"
    },
    {
      text: "Discord: @45g",
      clickable: false,
      isDiscord: true,
      copyTarget: "45g"
    },
    {
      text: "Twitter/X: @MiloSeIfEsteem",
      clickable: true,
      href: "https://twitter.com/MiloSeIfEsteem"
    },
    {
      text: "Github: @MiloSelfEsteem",
      clickable: true,
      href: "https://github.com/MiloSelfEsteem"
    }
  ];

  const navDelay = ms(contacts.length * 1000 + 500);

  contacts.forEach((c, i) => {
    const el = c.clickable
      ? document.createElement("a")
      : document.createElement("p");
    el.classList.add("contact-item");
    if (c.clickable) {
      el.href = c.href;
      el.target = "_blank";
      el.classList.add("is-clickable");
    }
    if (c.isDiscord) {
      el.classList.add("is-clickable");
    }

    // transition depends on animSpeed
    css(el, {
      transition: `opacity ${ms(1000)}ms ease, transform ${ms(
        1000
      )}ms ease, color 0.3s ease`
    });

    if (c.isDiscord) {
      el.textContent = c.text;
      el.addEventListener("click", () => {
        navigator.clipboard.writeText(c.copyTarget).then(() => {
          const original = el.textContent;
          el.textContent = "Username copied.";
          el.style.color = "rgba(136, 136, 136, 1)";
          setTimeout(() => {
            el.textContent = original;
            el.style.color = "";
          }, 1500);
        });
      });
    } else {
      el.textContent = c.text;
    }

    container.appendChild(el);
    TimeoutManager.set(() => revealEl(el), ms(i * 1000));
  });

  TimeoutManager.set(
    () => showFourSmallBoxes(showContactInfo, container),
    navDelay
  );
}

// portfolio

function showPortfolio() {
  const { container } = createSection("Portfolio", {
    maxWidth: "960px",
    width: "100%"
  });

  const split = document.createElement("div");
  split.classList.add("portfolio-split");
  container.appendChild(split);

  const projects = [
    {
      title: "TradingView Indicator Suite",
      skill: "PineScript",
      description:
        "A collection of custom PineScript indicators developed for financial analysis, ranging from higher timeframe candle overlays to near-automated trading strategies. Built through a combination of reverse-engineering existing solutions and original development.",
      image: "./images/PINESCRIPTSITE.png"
    },
    {
      title: "MSE XAUUSD ORB — Expert Advisor",
      skill: "MQL5 (C++ derivative)",
      description:
        "An automated trading bot built for MetaTrader 5, designed for fully objective, rule-based trade execution on XAUUSD. Successful in a backtesting environment, never used in a live-scenario due to lack of initial funding.",
      image: "./images/XAUUSDSITE.png"
    },
    {
      title: "AscendUpward — Team Tool",
      skill: "AutoHotkey (AHK)",
      description:
        "A real-time communication tool developed for Guild Wars 2 World vs World operations, enabling near-instant relay of tactical instructions to groups of 50+ players during high-intensity engagements.",
      image: "./images/ASCENDUPWARDSITE.png"
    },
    {
      title: "Mic-Ro-Phone — Social Game",
      skill: "LUA",
      description:
        "A voice-chat-centric social game developed in two weeks for the Roblox platform. Players could socialise, compete in mini-games, and explore an open world environment.",
      image: "./images/MICROSITE.png"
    },
    {
      title: "L???",
      skill: "Javascript / Python",
      description:
        "An optimized fork of a prominent open-source repository, refactored to enhance execution speed, performance and utility for a global user base.",
      image: "./images/LQUESTIONMARKSITE.png"
    }
  ];

  const projectsPanel = document.createElement("div");
  projectsPanel.classList.add("portfolio-panel");
  split.appendChild(projectsPanel);

  const controlsWrapper = document.createElement("div");
  controlsWrapper.classList.add("portfolio-controls");
  css(controlsWrapper, { transition: `opacity ${ms(1000)}ms ease` });
  split.appendChild(controlsWrapper);

  const ITEMS_PER_PAGE = 3;
  let currentPage = 0;
  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);

  const prevBtn = makeSpan("[ ◄ ]", ["portfolio-page-btn"]);
  const pageIndicator = makeSpan(`PAGE ${currentPage + 1} / ${totalPages}`, [
    "portfolio-page-indicator"
  ]);
  const nextBtn = makeSpan("[ ► ]", ["portfolio-page-btn"]);
  controlsWrapper.append(prevBtn, pageIndicator, nextBtn);

  function setupArrow(btn, direction) {
    btn.addEventListener("mouseenter", () => {
      if (btn.style.opacity !== "0.3") btn.style.opacity = "0.6";
    });
    btn.addEventListener("mouseleave", () => {
      if (btn.style.opacity !== "0.3") btn.style.opacity = "1";
    });
    btn.addEventListener("click", () => {
      if (btn.style.opacity === "0.3") return;
      currentPage += direction;
      renderPage(false);
    });
  }
  setupArrow(prevBtn, -1);
  setupArrow(nextBtn, 1);

  function renderPage(isInitialLoad = true) {
    pageIndicator.textContent = `PAGE ${currentPage + 1} / ${totalPages}`;
    css(prevBtn, {
      opacity: currentPage === 0 ? "0.3" : "1",
      cursor: currentPage === 0 ? "default" : "pointer"
    });
    css(nextBtn, {
      opacity: currentPage === totalPages - 1 ? "0.3" : "1",
      cursor: currentPage === totalPages - 1 ? "default" : "pointer"
    });

    projectsPanel.innerHTML = "";
    const slice = projects.slice(
      currentPage * ITEMS_PER_PAGE,
      (currentPage + 1) * ITEMS_PER_PAGE
    );

    slice.forEach((proj, i) => {
      const card = document.createElement("div");
      card.classList.add("portfolio-card");
      css(card, {
        transition: `opacity ${ms(600)}ms ease, transform ${ms(600)}ms ease`
      });

      const textWrapper = document.createElement("div");
      textWrapper.classList.add("portfolio-card-text");

      const cardHeader = document.createElement("div");
      cardHeader.classList.add("portfolio-card-header");

      const titleEl = document.createElement("strong");
      titleEl.textContent = proj.title;
      titleEl.classList.add("portfolio-card-title");

      const skillTag = document.createElement("span");
      skillTag.textContent = proj.skill;
      skillTag.classList.add("portfolio-skill-tag");

      cardHeader.append(titleEl, skillTag);

      const desc = document.createElement("p");
      desc.textContent = proj.description;
      desc.classList.add("portfolio-card-desc");

      textWrapper.append(cardHeader, desc);

      if (proj.image) {
        const imgWrapper = document.createElement("div");
        imgWrapper.classList.add("portfolio-img-wrapper");
        const img = document.createElement("img");
        img.src = proj.image;
        imgWrapper.addEventListener("click", () => showLightbox(proj.image));
        imgWrapper.appendChild(img);
        card.append(textWrapper, imgWrapper);
      } else {
        card.append(textWrapper);
      }

      projectsPanel.appendChild(card);
      const delay = isInitialLoad ? ms(i * 1000 + 500) : ms(i * 150 + 50);
      TimeoutManager.set(() => revealEl(card), delay);
    });
  }

  renderPage(true);

  const note = document.createElement("p");
  note.textContent = "More projects will be published as they are completed.";
  note.classList.add("portfolio-note");
  css(note, { transition: `opacity ${ms(1000)}ms ease` });
  container.appendChild(note);

  const initialAnimationTime = ms(ITEMS_PER_PAGE * 1000 + 500);
  TimeoutManager.set(() => {
    controlsWrapper.style.opacity = "1";
    note.style.opacity = "0.4";
  }, initialAnimationTime);
  TimeoutManager.set(
    () => showFourSmallBoxes(showPortfolio, container),
    initialAnimationTime + ms(1000)
  );
}

// status

function showGallery() {
  const { container } = createSection("Status", { width: "380px" });

  const WEEKDAYS = [1, 2, 3, 4, 5];
  let activityLabel, activityActive;

  if (isActiveNow(WEEKDAYS, "14:30", "16:00")) {
    activityLabel = "Trading — NQ1! (CRT)";
    activityActive = true;
  } else if (isActiveNow(WEEKDAYS, "16:00", "17:00")) {
    activityLabel = "Studying — Human Centred AI (MSc)";
    activityActive = true;
  } else if (isActiveNow([2, 4], "18:30", "21:00")) {
    activityLabel = "Training — Muay Thai";
    activityActive = true;
  } else if (isActiveNow([3], "11:00", "13:00")) {
    activityLabel = "Training — Golf";
    activityActive = true;
  } else {
    activityLabel = "Nothing important.";
    activityActive = false;
  }

  function makeStatusCard(sectionLabel, value, isLive) {
    const box = document.createElement("div");
    box.classList.add("status-card");
    css(box, {
      transition: `opacity ${ms(1000)}ms ease, transform ${ms(1000)}ms ease`
    });

    const top = document.createElement("div");
    top.classList.add("status-card-top");

    const lbl = document.createElement("span");
    lbl.textContent = sectionLabel;
    lbl.classList.add("status-card-label");

    const dot = document.createElement("span");
    dot.classList.add("live-dot", isLive ? "is-live" : "is-idle");

    top.append(lbl, dot);

    const val = document.createElement("span");
    val.textContent = value;
    val.classList.add("status-card-value");

    box.append(top, val);
    return box;
  }

  const activityBox = makeStatusCard("Activity", activityLabel, activityActive);
  const musicBox = makeStatusCard(
    "Listening",
    "Establishing secure connection...",
    false
  );
  container.appendChild(activityBox);
  container.appendChild(musicBox);

  TimeoutManager.set(() => revealEl(activityBox), 0);
  TimeoutManager.set(() => revealEl(musicBox), ms(1000));

  fetchRecentTrack((trackLabel, isLive) => {
    const valSpan = musicBox.querySelector(".status-card-value");
    const dot = musicBox.querySelector(".live-dot");
    if (isLive && dot) {
      dot.classList.replace("is-idle", "is-live");
    }
    let showGlitch = true,
      count = 0;
    const iv = setInterval(() => {
      valSpan.textContent = showGlitch ? "DECRYPTING STREAM..." : trackLabel;
      showGlitch = !showGlitch;
      if (++count > 6) {
        clearInterval(iv);
        valSpan.textContent = trackLabel;
      }
    }, 150);
  });

  TimeoutManager.set(
    () => showFourSmallBoxes(showGallery, container),
    ms(2500)
  );
}

// settings

function showSettingsPage() {
  const { container } = createSection("Settings:", { maxWidth: "450px" });

  const subheading = document.createElement("p");
  subheading.textContent = "Because power to the people.";
  subheading.classList.add("settings-subheading");

  function makeRow(labelTxt, controlEl) {
    const row = document.createElement("div");
    row.classList.add("settings-row");
    const label = document.createElement("p");
    label.textContent = labelTxt;
    label.classList.add("settings-row-label");
    row.append(label, controlEl);
    return row;
  }

  // speed slider
  const speedWrapper = document.createElement("div");
  speedWrapper.classList.add("settings-speed-wrapper");
  const speedLabel = document.createElement("p");
  speedLabel.textContent = `Animation Speed Multiplier: [ ${SYSTEM_CONFIG.animSpeed}x ]`;
  speedLabel.classList.add("settings-speed-label");

  const speedSlider = document.createElement("input");
  speedSlider.type = "range";
  speedSlider.min = "0.1";
  speedSlider.max = "4.0";
  speedSlider.step = "0.05";
  speedSlider.value = SYSTEM_CONFIG.animSpeed;
  css(speedSlider, {
    width: "100%",
    cursor: "pointer",
    accentColor: SYSTEM_CONFIG.accentColor
  });
  speedSlider.addEventListener("input", (e) => {
    SYSTEM_CONFIG.animSpeed = parseFloat(e.target.value).toFixed(1);
    speedLabel.textContent = `Animation Speed Multiplier: [ ${SYSTEM_CONFIG.animSpeed}x ]`;
    saveSystemSettings();
  });
  speedWrapper.append(speedLabel, speedSlider);

  // motion toggling
  const motionToggle = document.createElement("button");
  motionToggle.textContent = SYSTEM_CONFIG.reducedMotion ? "[ ON ]" : "[ OFF ]";
  motionToggle.classList.add("settings-toggle-btn");
  motionToggle.addEventListener("click", () => {
    SYSTEM_CONFIG.reducedMotion = !SYSTEM_CONFIG.reducedMotion;
    motionToggle.textContent = SYSTEM_CONFIG.reducedMotion
      ? "[ ON ]"
      : "[ OFF ]";
    saveSystemSettings();
    if (SYSTEM_CONFIG.reducedMotion) {
      if (stopBgEffect) {
        stopBgEffect();
        stopBgEffect = null;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
      if (stopBgEffect) stopBgEffect();
      stopBgEffect = BG_EFFECTS[
        Math.floor(Math.random() * BG_EFFECTS.length)
      ]();
    }
  });

  // colour selecting
  const colorSelect = document.createElement("select");
  colorSelect.classList.add("settings-color-select");
  [
    { name: "Monochrome", hex: "#FFFFFF" },
    { name: "Phosphor Green", hex: "#00FF41" },
    { name: "Sunset Orange", hex: "#FFB000" },
    { name: "Cryo Cyan", hex: "#00F0FF" },
    { name: "Lotus Pink", hex: "#FF00FF" }
  ].forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.hex;
    opt.textContent = c.name;
    if (c.hex === SYSTEM_CONFIG.accentColor) opt.selected = true;
    colorSelect.appendChild(opt);
  });
  colorSelect.addEventListener("change", (e) => {
    SYSTEM_CONFIG.accentColor = e.target.value;
    saveSystemSettings();
    document.documentElement.style.setProperty(
      "--accent",
      SYSTEM_CONFIG.accentColor
    );
    const cursor = document.getElementById("custom-cursor");
    if (cursor) {
      cursor.style.setProperty(
        "background-color",
        "var(--accent)",
        "important"
      );
      cursor.style.setProperty("border-color", "var(--accent)", "important");
      cursor.style.setProperty(
        "box-shadow",
        `0 0 10px 2px ${SYSTEM_CONFIG.accentColor}b3`,
        "important"
      );
    }
    speedSlider.style.accentColor = "var(--accent)";
  });

  // Proceed button
  const continueBtn = document.createElement("button");
  continueBtn.textContent = "PROCEED";
  continueBtn.classList.add("settings-proceed-btn");
  continueBtn.addEventListener("click", () =>
    fadeOutAll([container], 800 / SYSTEM_CONFIG.animSpeed, showBigBoxes)
  );

  // Hint
  const hintWrapper = document.createElement("div");
  hintWrapper.classList.add("settings-hint-wrapper");
  const hintText = document.createElement("p");
  hintText.textContent = "Also, try keys ` - 6 out if on desktop.";
  hintText.classList.add("settings-hint");
  hintWrapper.appendChild(hintText);

  const controls = [
    speedWrapper,
    makeRow("Reduced Motion:", motionToggle),
    makeRow("UI Colour:", colorSelect),
    continueBtn,
    hintWrapper
  ];

  container.appendChild(subheading);
  controls.forEach((el) => container.appendChild(el));

  [subheading, ...controls].forEach((el, i) => {
    // base hidden state already in CSS; just inject the reveal transition
    css(el, {
      opacity: "0",
      transform: "translateY(20px)",
      transition: "opacity 0.6s ease, transform 0.6s ease"
    });
    TimeoutManager.set(
      () => revealEl(el),
      (i * 150 + 400) / SYSTEM_CONFIG.animSpeed
    );
  });

  TimeoutManager.set(
    () => showFourSmallBoxes(showSettingsPage, container),
    ms(1800)
  );
}

// playground

function showPlayground() {
  const { container } = createSection("Playground", { maxWidth: "520px" });

  const subtitle = document.createElement("p");
  subtitle.textContent = "Three things to mess around with.";
  subtitle.classList.add("playground-subtitle");
  container.appendChild(subtitle);

  const games = [
    {
      title: "Reaction Time",
      desc: "How sharp are your reflexes?",
      fn: launchReactionGame
    },
    {
      title: "Memory Pattern",
      desc: "Watch the sequence. Repeat it.",
      fn: launchMemoryGame
    },
    {
      title: "Aim Trainer",
      desc: "Click the targets. Don't miss.",
      fn: launchAimTrainer
    }
  ];

  const cardWrapper = document.createElement("div");
  cardWrapper.classList.add("playground-card-list");
  container.appendChild(cardWrapper);

  games.forEach((g, i) => {
    const card = document.createElement("div");
    card.classList.add("playground-card");
    css(card, {
      transition: `opacity ${ms(800)}ms ease, transform ${ms(
        800
      )}ms ease, background 0.2s ease`
    });

    const left = document.createElement("div");
    const titleEl = document.createElement("strong");
    titleEl.textContent = g.title;
    titleEl.classList.add("playground-card-title");
    const descEl = document.createElement("p");
    descEl.textContent = g.desc;
    descEl.classList.add("playground-card-desc");
    left.append(titleEl, descEl);

    const arrow = document.createElement("span");
    arrow.textContent = "▶";
    arrow.classList.add("playground-card-arrow");

    card.append(left, arrow);
    cardWrapper.appendChild(card);
    card.addEventListener("click", () => fadeOutAll([container], 600, g.fn));
    TimeoutManager.set(() => revealEl(card), ms(i * 350 + 400));
  });

  TimeoutManager.set(
    () => showFourSmallBoxes(showPlayground, container),
    ms(games.length * 350 + 1200)
  );
}

// reaction trainer

function launchReactionGame() {
  const { container } = createSection("Reaction Time", { maxWidth: "400px" });

  const instruction = document.createElement("p");
  instruction.textContent =
    "Wait for the box to turn white. Then click it as fast as you can.";
  instruction.classList.add("game-instruction");
  container.appendChild(instruction);

  const box = document.createElement("div");
  box.textContent = "Ready?";
  box.classList.add("reaction-box");
  // two-phase transition: first reveal, then switch to bg-only
  css(box, {
    transition: `opacity ${ms(800)}ms ease, transform ${ms(800)}ms ease`
  });
  container.appendChild(box);

  const result = document.createElement("p");
  result.classList.add("reaction-result");
  container.appendChild(result);

  const best = document.createElement("p");
  best.classList.add("reaction-best");
  container.appendChild(best);

  TimeoutManager.set(() => {
    revealEl(box);
    box.style.transition = "background 0.15s ease, color 0.15s ease";
  }, ms(400));

  let state = "idle",
    startTime = 0,
    bestTime = Infinity,
    waitTimer = null;

  function reset() {
    state = "waiting";
    box.textContent = "Wait...";
    box.style.background = "transparent";
    result.textContent = "";
    result.style.opacity = "0.7";
    waitTimer = setTimeout(() => {
      state = "ready";
      box.style.background = "var(--accent)";
      box.style.color = "black";
      box.textContent = "NOW";
      startTime = performance.now();
    }, 1500 + Math.random() * 3500);
  }

  box.addEventListener("click", () => {
    if (state === "idle") {
      reset();
    } else if (state === "waiting") {
      clearTimeout(waitTimer);
      result.textContent = "Too early. Try again.";
      result.style.opacity = "0.7";
      box.textContent = "Click to retry";
      box.style.color = "var(--accent)";
      state = "idle";
    } else if (state === "ready") {
      const elapsed = Math.round(performance.now() - startTime);
      box.style.background = "transparent";
      box.style.color = "var(--accent)";
      box.textContent = "Again?";
      result.textContent = `${elapsed}ms`;
      result.style.opacity = "1";
      if (elapsed < bestTime) {
        bestTime = elapsed;
        best.textContent = `Best: ${bestTime}ms`;
        best.style.opacity = "0.4";
      }
      state = "idle";
    }
  });

  const backBtn = document.createElement("button");
  backBtn.textContent = "[ BACK TO PLAYGROUND ]";
  backBtn.classList.add("back-btn");
  backBtn.addEventListener("click", () =>
    fadeOutAll([container], 600, showPlayground)
  );
  container.appendChild(backBtn);

  TimeoutManager.set(() => revealEl(result), ms(800));
  TimeoutManager.set(() => revealEl(best), ms(900));
  TimeoutManager.set(
    () => showFourSmallBoxes(showPlayground, container),
    ms(1200)
  );
}

// memory trainer

function launchMemoryGame() {
  const { container } = createSection("Memory Pattern", { maxWidth: "420px" });

  const infoEl = document.createElement("p");
  infoEl.textContent = "Watch the pattern, then repeat it.";
  infoEl.classList.add("game-instruction");
  container.appendChild(infoEl);

  const GRID_SIZE = 4;
  const SYMBOLS = ["▲", "▼", "◆", "⬤", "◼", "★", "⬡", "▶"];

  const scoreEl = document.createElement("p");
  scoreEl.textContent = "Level 1";
  scoreEl.classList.add("memory-score");
  container.appendChild(scoreEl);

  const grid = document.createElement("div");
  grid.classList.add("memory-grid");
  css(grid, {
    gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
    transition: `opacity ${ms(700)}ms ease, transform ${ms(700)}ms ease`
  });
  container.appendChild(grid);

  const statusEl = document.createElement("p");
  statusEl.classList.add("memory-status");
  container.appendChild(statusEl);

  const cells = [];
  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    const cell = document.createElement("div");
    cell.classList.add("memory-cell");
    cell.dataset.idx = i;
    grid.appendChild(cell);
    cells.push(cell);
  }

  TimeoutManager.set(() => revealEl(grid), ms(400));

  let sequence = [],
    playerTurn = false,
    playerIndex = 0,
    level = 1;

  function randomSeq(len) {
    return Array.from({ length: len }, () =>
      Math.floor(Math.random() * GRID_SIZE * GRID_SIZE)
    );
  }

  function assignSymbols() {
    cells.forEach(
      (c) =>
        (c.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
    );
  }

  function flashCell(idx, duration = 350) {
    return new Promise((resolve) => {
      cells[idx].classList.add("flash");
      setTimeout(() => {
        cells[idx].classList.remove("flash");
        setTimeout(resolve, 100);
      }, duration);
    });
  }

  async function playSequence() {
    playerTurn = false;
    statusEl.textContent = "Watch...";
    for (const idx of sequence) {
      await flashCell(idx, 400);
      await new Promise((r) => setTimeout(r, 150));
    }
    statusEl.textContent = "Your turn.";
    playerTurn = true;
    playerIndex = 0;
  }

  function nextLevel() {
    level++;
    scoreEl.textContent = `Level ${level}`;
    sequence.push(randomSeq(1)[0]);
    assignSymbols();
    setTimeout(() => playSequence(), ms(500));
  }

  function startGame() {
    sequence = randomSeq(1);
    level = 1;
    scoreEl.textContent = "Level 1";
    assignSymbols();
    setTimeout(() => playSequence(), ms(600));
  }

  cells.forEach((cell) => {
    cell.addEventListener("click", () => {
      if (!playerTurn) return;
      const idx = parseInt(cell.dataset.idx);
      flashCell(idx, 200);
      if (idx === sequence[playerIndex]) {
        playerIndex++;
        if (playerIndex === sequence.length) {
          playerTurn = false;
          statusEl.textContent = "Correct! ↑";
          setTimeout(() => nextLevel(), ms(800));
        }
      } else {
        playerTurn = false;
        statusEl.textContent = `Wrong. Reached level ${level}. Click any cell to restart.`;
        cells.forEach((c) => c.classList.remove("flash"));
        cells.forEach((c) => {
          const handler = () => {
            startGame();
            c.removeEventListener("click", handler);
          };
          c.addEventListener("click", handler, { once: true });
        });
      }
    });
  });

  const backBtn = document.createElement("button");
  backBtn.textContent = "[ BACK TO PLAYGROUND ]";
  backBtn.classList.add("back-btn");
  backBtn.addEventListener("click", () =>
    fadeOutAll([container], 600, showPlayground)
  );
  container.appendChild(backBtn);

  TimeoutManager.set(() => startGame(), ms(700));
  TimeoutManager.set(
    () => showFourSmallBoxes(showPlayground, container),
    ms(1400)
  );
}

// aim trainer

function launchAimTrainer() {
  const { container } = createSection("Aim Trainer", { maxWidth: "420px" });

  const desc = document.createElement("p");
  desc.textContent = "Click the targets before they vanish. They get faster.";
  desc.classList.add("game-subtitle");
  container.appendChild(desc);

  const header = document.createElement("div");
  header.classList.add("aim-header");

  const scoreEl = document.createElement("span");
  scoreEl.textContent = "Score: 0";
  scoreEl.classList.add("aim-score");

  const statusEl = document.createElement("span");
  statusEl.textContent = "Ready.";
  statusEl.classList.add("aim-status");

  header.append(scoreEl, statusEl);
  container.appendChild(header);

  const gameArea = document.createElement("div");
  gameArea.classList.add("aim-area");
  container.appendChild(gameArea);

  let score = 0,
    isPlaying = false,
    targetTimer = null,
    currentDuration = 2000;

  const targetsPool = Array.from({ length: 3 }, () => {
    const el = document.createElement("div");
    el.classList.add("aim-target");
    const obj = { el, isActive: false };

    el.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      if (!isPlaying || !obj.isActive) return;
      clearTimeout(targetTimer);
      score++;
      scoreEl.textContent = `Score: ${score}`;
      currentDuration = Math.max(350, currentDuration * 0.98);
      obj.isActive = false;
      el.style.transform = "scale(0)";
      el.style.pointerEvents = "none";
      TimeoutManager.set(spawnTarget, 150);
    });

    gameArea.appendChild(el);
    return obj;
  });

  function spawnTarget() {
    const t = targetsPool.find((t) => !t.isActive);
    if (!t) return;
    const size = 40;
    const x = Math.random() * (gameArea.clientWidth - size);
    const y = Math.random() * (gameArea.clientHeight - size);
    t.el.style.transition = "none";
    t.el.style.left = `${x}px`;
    t.el.style.top = `${y}px`;
    t.isActive = true;
    void t.el.offsetWidth;
    t.el.style.transition =
      "transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    t.el.style.transform = "scale(1)";
    t.el.style.pointerEvents = "auto";
    targetTimer = setTimeout(() => endGame("Too slow!"), currentDuration);
  }

  function startGame() {
    isPlaying = true;
    score = 0;
    currentDuration = 2000;
    scoreEl.textContent = "Score: 0";
    statusEl.textContent = "Playing...";
    btn.textContent = "[ STOP ]";
    gameArea.style.borderColor = "var(--accent)";
    spawnTarget();
  }

  function endGame(reason = "Game Over") {
    isPlaying = false;
    clearTimeout(targetTimer);
    targetsPool.forEach((t) => {
      if (t.isActive) {
        t.isActive = false;
        t.el.style.transform = "scale(0)";
        t.el.style.pointerEvents = "none";
      }
    });
    statusEl.textContent = reason;
    btn.textContent = "[ TRY AGAIN ]";
    gameArea.style.borderColor = "rgba(255,255,255,0.3)";
  }

  gameArea.addEventListener("mousedown", () => {
    if (isPlaying) endGame("Missed!");
  });

  const btn = document.createElement("button");
  btn.textContent = "[ START ]";
  btn.classList.add("game-btn");
  btn.addEventListener("click", () => {
    if (isPlaying) endGame("Stopped.");
    else startGame();
  });
  container.appendChild(btn);

  const backBtn = document.createElement("button");
  backBtn.textContent = "[ BACK TO PLAYGROUND ]";
  backBtn.classList.add("back-btn");
  backBtn.addEventListener("click", () =>
    fadeOutAll([container], 600, showPlayground)
  );
  container.appendChild(backBtn);

  TimeoutManager.set(
    () => showFourSmallBoxes(launchAimTrainer, container),
    ms(1000)
  );
}

// last.fm

function fetchRecentTrack(callback) {
  const API_KEY = "33a3c950939d5144118f8e5cd4b952bc";
  const USERNAME = "MiloSelfEsteem";
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${USERNAME}&api_key=${API_KEY}&format=json&limit=1`;
  fetch(url)
    .then((r) => r.json())
    .then((data) => {
      const list = data.recenttracks?.track;
      const track = Array.isArray(list) ? list[0] : list;
      if (!track) {
        callback("No recent tracks found.", false);
        return;
      }
      const isLive = track["@attr"]?.nowplaying === "true";
      callback(
        isLive ? `${track.artist["#text"]} — ${track.name}` : "Silence.",
        isLive
      );
    })
    .catch(() => callback("Signal Lost — Connection Refused.", false));
}

// intro

function handleTextClick(goToSettings = false) {
  if (isTransitioning) return;
  isTransitioning = true;
  CURSOR_EL.classList.remove("blink");
  css(CURSOR_EL, { opacity: "0", transition: "opacity 1500ms ease" });
  css(TEXT_EL, { opacity: "0", transition: "opacity 1500ms ease" });
  TEXT_EL.textContent = TEXT_EL.textContent;
  setTimeout(() => {
    TEXT_EL.remove();
    CURSOR_EL.remove();
    setTimeout(() => {
      goToSettings ? showSettingsPage() : showBigBoxes();
      setTimeout(() => {
        isTransitioning = false;
      }, 2000);
    }, 500);
  }, 1000);
}

function startSubtleGlitch(el, a, b, minMs = 1000, maxMs = 3000) {
  let showA = true,
    timer;
  function glitch() {
    el.textContent = (showA = !showA) ? b : a;
    timer = setTimeout(glitch, Math.random() * (maxMs - minMs) + minMs);
  }
  timer = setTimeout(glitch, Math.random() * (maxMs - minMs) + minMs);
  return () => clearTimeout(timer);
}

// boot

window.onload = () => {
  TEXT_EL.classList.add("visible");
  document.getElementById("bgCanvas")?.classList.add("visible");

  const isMobile = window.innerWidth < 768;
  const skipTextWelcome = isMobile
    ? "Double Tap to Skip Intro."
    : "Enter to Skip Intro.";
  const skipTextHowAreYou = isMobile ? "Press me." : "Click me.";

  setTimeout(() => {
    typeMessage(MSG1, () => {
      const stopGlitch1 = startSubtleGlitch(
        TEXT_EL,
        MSG1,
        skipTextWelcome,
        50,
        950
      );
      setTimeout(() => {
        stopGlitch1();
        TEXT_EL.textContent = MSG1;
        backspace(MSG1.length, () => {
          typeMessage(MSG2, () => {
            isIntroFinished = true;
            TEXT_EL.style.cursor = "pointer";
            TEXT_EL.addEventListener("click", () => handleTextClick(false), {
              once: true
            });
            startSubtleGlitch(TEXT_EL, MSG2, skipTextHowAreYou, 50, 2500);
          });
        });
      }, PAUSE_AFTER1 + 1500);
    });
  }, 500);
};

// canvas

const canvas = document.createElement("canvas");
canvas.id = "bgCanvas";
document.body.prepend(canvas);
const ctx = canvas.getContext("2d", { alpha: false });

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// cursor

const customCursor = document.createElement("div");
customCursor.id = "custom-cursor";
customCursor.style.cssText = `
  position: fixed; top: 0; left: 0;
  width: 8px; height: 8px;
  background-color: var(--accent) !important;
  border: 1px solid var(--accent) !important;
  border-radius: 50% !important;
  pointer-events: none !important;
  z-index: 99999 !important;
  transform: translate(-50%, -50%);
  mix-blend-mode: difference !important;
  transition: width 0.3s cubic-bezier(0.23,1,0.32,1),
              height 0.3s cubic-bezier(0.23,1,0.32,1),
              background-color 0.3s ease,
              border 0.3s ease,
              transform 0.2s ease;
`;
document.body.appendChild(customCursor);

document.addEventListener("mousemove", (e) => {
  customCursor.style.left = `${e.clientX}px`;
  customCursor.style.top = `${e.clientY}px`;
});

document.addEventListener("mouseover", (e) => {
  const isClickable = e.target.closest(
    "a, .nav-box, .portfolio-img-wrapper, .clickable-image, .game-btn, .back-btn, .settings-proceed-btn, .playground-card, .memory-cell"
  );
  if (isClickable) {
    customCursor.style.setProperty("width", "45px", "important");
    customCursor.style.setProperty("height", "45px", "important");
    customCursor.style.setProperty(
      "background-color",
      "transparent",
      "important"
    );
    customCursor.style.setProperty(
      "border",
      "1px solid var(--accent)",
      "important"
    );
  } else {
    customCursor.style.setProperty("width", "8px", "important");
    customCursor.style.setProperty("height", "8px", "important");
    customCursor.style.setProperty(
      "background-color",
      "var(--accent)",
      "important"
    );
    customCursor.style.setProperty(
      "border",
      "1px solid var(--accent)",
      "important"
    );
  }
});

document.addEventListener("mousedown", () => {
  customCursor.style.setProperty(
    "transform",
    "translate(-50%, -50%) scale(0.6)",
    "important"
  );
});
document.addEventListener("mouseup", () => {
  customCursor.style.setProperty(
    "transform",
    "translate(-50%, -50%) scale(1)",
    "important"
  );
});

// bg fx

function animateParticlesEffect() {
  const isMobile = window.innerWidth < 768;
  const COUNT = isMobile ? 20 : 40;
  const TRAIL = isMobile ? 8 : 17;
  const particles = Array.from({ length: COUNT }, () => {
    const angle = Math.random() * Math.PI * 2,
      speed = Math.random() + 0.5;
    const shade = Math.floor(Math.random() * 256);
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.8 + 0.4,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      glitch: 0,
      trail: [],
      color: `${shade},${shade},${shade}`
    };
  });
  const start = performance.now();
  let rafId;
  (function animate() {
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const fade = Math.min(1, (performance.now() - start) / 1000);
    particles.forEach((p) => {
      p.x = (p.x + p.vx + canvas.width) % canvas.width;
      p.y = (p.y + p.vy + canvas.height) % canvas.height;
      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > TRAIL) p.trail.shift();
      if (Math.random() < 0.001 && !p.glitch)
        p.glitch = 5 + Math.floor(Math.random() * 5);
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${p.color},${0.3 * fade})`;
      ctx.lineWidth = p.size * 0.7;
      for (let i = 0; i < p.trail.length - 1; i++) {
        const [t1, t2] = [p.trail[i], p.trail[i + 1]];
        if (Math.abs(t2.x - t1.x) < 100 && Math.abs(t2.y - t1.y) < 100) {
          ctx.moveTo(t1.x, t1.y);
          ctx.lineTo(t2.x, t2.y);
        }
      }
      ctx.stroke();
      ctx.beginPath();
      ctx.fillStyle = `rgba(${p.color},${(p.glitch ? 1 : 0.7) * fade})`;
      ctx.arc(p.x, p.y, p.glitch ? p.size * 1.4 : p.size, 0, Math.PI * 2);
      ctx.fill();
      if (p.glitch > 0) p.glitch--;
    });
    rafId = requestAnimationFrame(animate);
  })();
  return () => cancelAnimationFrame(rafId);
}

function animateLinesEffect() {
  const isMobile = window.innerWidth < 768;
  const lines = Array.from({ length: isMobile ? 10 : 20 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    length: Math.random() * (isMobile ? 100 : 200) + 50,
    speed: Math.random() * 4 + (isMobile ? 4 : 16),
    shade: Math.random() * 0.35 + 0.05,
    phase: Math.random() * Math.PI * 2
  }));
  let t = 0,
    rafId;
  ctx.lineWidth = 0.3;
  (function animate() {
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    lines.forEach((l) => {
      ctx.strokeStyle = `rgba(255,255,255,${Math.max(
        0.05,
        Math.min(0.6, l.shade + Math.sin(t + l.phase) * 0.05)
      )})`;
      ctx.beginPath();
      ctx.moveTo(l.x, l.y);
      ctx.lineTo(l.x + l.length, l.y);
      ctx.stroke();
      l.x -= l.speed;
      if (l.x + l.length < 0) l.x = canvas.width;
    });
    t += 0.02;
    rafId = requestAnimationFrame(animate);
  })();
  return () => cancelAnimationFrame(rafId);
}

function animateNoiseCloudEffect() {
  const isMobile = window.innerWidth < 768;
  const off = document.createElement("canvas");
  off.width = off.height = 200;
  const oCtx = off.getContext("2d");
  const grad = oCtx.createRadialGradient(100, 100, 0, 100, 100, 100);
  grad.addColorStop(0, "rgba(255,255,255,0.05)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  oCtx.fillStyle = grad;
  oCtx.beginPath();
  oCtx.arc(100, 100, 100, 0, Math.PI * 2);
  oCtx.fill();
  const clouds = Array.from({ length: isMobile ? 15 : 30 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * (isMobile ? 50 : 80) + 30,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    phase: Math.random() * Math.PI * 2
  }));
  let rafId;
  (function animate() {
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "lighter";
    clouds.forEach((c) => {
      ctx.globalAlpha = Math.max(
        0.3,
        0.5 + Math.sin(performance.now() * 0.001 + c.phase) * 0.2
      );
      ctx.drawImage(off, c.x - c.r, c.y - c.r, c.r * 2, c.r * 2);
      c.x += c.vx;
      c.y += c.vy;
      if (c.x - c.r > canvas.width) c.x = -c.r;
      if (c.x + c.r < 0) c.x = canvas.width + c.r;
      if (c.y - c.r > canvas.height) c.y = -c.r;
      if (c.y + c.r < 0) c.y = canvas.height + c.r;
    });
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    rafId = requestAnimationFrame(animate);
  })();
  return () => cancelAnimationFrame(rafId);
}

function animateDigitalRainEffect() {
  const isMobile = window.innerWidth < 768;
  const fs = isMobile ? 10 : 16;
  const cols = Math.floor(canvas.width / fs);
  const drops = Array.from({ length: cols }, () =>
    Math.floor(Math.random() * (canvas.height / fs))
  );
  const words = [
    "ARTIFICIALINTELLIGENCE",
    "PROGRAMMING",
    "MILOSELFESTEEM",
    "MILO",
    "WHOAREYOU",
    "THISISONTHEINTERNET",
    "WELCOMETOTHEWEBSITE",
    "AI"
  ];
  const active = Array.from(
    { length: cols },
    () => words[Math.floor(Math.random() * words.length)]
  );
  let frame = 0,
    rafId;
  ctx.font = `${fs}px Montserrat`;
  (function animate() {
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (frame++ % 3 === 0) {
      for (let i = 0; i < drops.length; i++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.15 + 0.15})`;
        ctx.fillText(
          active[i][drops[i] % active[i].length],
          i * fs,
          drops[i] * fs
        );
        if (drops[i] * fs > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
          active[i] = words[Math.floor(Math.random() * words.length)];
        }
        drops[i]++;
      }
    }
    rafId = requestAnimationFrame(animate);
  })();
  return () => cancelAnimationFrame(rafId);
}

function animateCandlestickChartEffect() {
  const isMobile = window.innerWidth < 768;
  const candleWidth = isMobile ? 15 : 30;
  const step = candleWidth + (isMobile ? 10 : 20);
  const maxCandles = Math.ceil(canvas.width / step) + 2;
  const candles = [];
  let currentPrice = canvas.height / 2;
  for (let i = 0; i < maxCandles; i++) {
    const open = currentPrice,
      close = open + (Math.random() - 0.5) * 150;
    candles.push({
      open,
      close,
      high: Math.max(open, close) + Math.random() * 80,
      low: Math.min(open, close) - Math.random() * 80
    });
    currentPrice = close;
  }
  let offset = 0,
    rafId;
  (function animate() {
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    offset -= 0.375;
    if (Math.abs(offset) >= step) {
      offset = 0;
      candles.shift();
      let open = candles[candles.length - 1].close,
        close = open + (Math.random() - 0.5) * 180;
      if (close < 100) close += 80;
      if (close > canvas.height - 100) close -= 80;
      candles.push({
        open,
        close,
        high: Math.max(open, close) + Math.random() * 100,
        low: Math.min(open, close) - Math.random() * 100
      });
    }
    ctx.strokeStyle = "rgba(255,255,255,0.02)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let y = 0; y < canvas.height; y += 100) {
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();
    for (let i = 0; i < candles.length; i++) {
      const c = candles[i],
        x = i * step + offset,
        isBullish = c.close <= c.open;
      ctx.strokeStyle = ctx.fillStyle = isBullish
        ? "rgba(211,211,211,0.3)"
        : "rgba(85,85,85,0.3)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, Math.min(c.high, c.low));
      ctx.lineTo(x + candleWidth / 2, Math.min(c.open, c.close));
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, Math.max(c.open, c.close));
      ctx.lineTo(x + candleWidth / 2, Math.max(c.high, c.low));
      ctx.stroke();
      if (isBullish) ctx.fillRect(x, c.close, candleWidth, c.open - c.close);
      else ctx.fillRect(x, c.open, candleWidth, c.close - c.open);
    }
    rafId = requestAnimationFrame(animate);
  })();
  return () => cancelAnimationFrame(rafId);
}

function animateLargeClockEffect() {
  let rafId,
    cachedWidth = 0,
    fontMain = "",
    fontSub = "",
    fontSizeMain = 0,
    lastSecond = -1,
    timeString = "";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  (function animate() {
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const now = new Date(),
      currentSecond = now.getSeconds();
    if (currentSecond !== lastSecond) {
      timeString = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}:${String(currentSecond).padStart(2, "0")}`;
      lastSecond = currentSecond;
    }
    const ms_now = String(now.getMilliseconds()).padStart(3, "0");
    if (cachedWidth !== canvas.width) {
      cachedWidth = canvas.width;
      fontSizeMain =
        window.innerWidth < 768 ? cachedWidth * 0.22 : cachedWidth * 0.12;
      fontMain = `bold ${fontSizeMain}px Montserrat`;
      fontSub = `normal ${fontSizeMain * 0.18}px Montserrat`;
    }
    const cx = cachedWidth / 2,
      cy = canvas.height / 2;
    const isGlitching = Math.random() > 0.98;
    const ox = isGlitching ? (Math.random() - 0.5) * 15 : 0;
    const oy = isGlitching ? (Math.random() - 0.5) * 15 : 0;
    const opacity = 0.02 + Math.abs(Math.sin(now.getTime() * 0.0015)) * 0.04;
    ctx.font = fontMain;
    ctx.fillStyle = `rgba(255,255,255,${isGlitching ? opacity * 2 : opacity})`;
    ctx.fillText(timeString, cx + ox, cy + oy);
    ctx.font = fontSub;
    ctx.fillStyle = `rgba(255,255,255,${opacity * 0.8})`;
    ctx.fillText(
      `LOCAL SYSTEM TIME [ .${ms_now} ]`,
      cx + ox,
      cy + fontSizeMain * 0.6 + oy
    );
    rafId = requestAnimationFrame(animate);
  })();
  return () => cancelAnimationFrame(rafId);
}

function animateAnalogClockEffect() {
  let rafId;
  (function animate() {
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const now = new Date(),
      msnow = now.getMilliseconds();
    const s = now.getSeconds() + msnow / 1000;
    const m = now.getMinutes() + s / 60;
    const h = (now.getHours() % 12) + m / 60;
    const cx = canvas.width / 2,
      cy = canvas.height / 2;
    const radius =
      window.innerWidth < 768 ? Math.min(cx, cy) * 1.2 : Math.min(cx, cy) * 1.1;
    const baseAlpha = 0.08 + Math.abs(Math.sin(now.getTime() * 0.0015)) * 0.03;
    function drawHand(angle, length, width, alpha) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(
        cx + Math.cos(angle - Math.PI / 2) * length,
        cy + Math.sin(angle - Math.PI / 2) * length
      );
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.stroke();
    }
    drawHand((h * Math.PI) / 6, radius * 0.6, 8, baseAlpha * 2);
    drawHand((m * Math.PI) / 30, radius * 0.85, 4, baseAlpha * 2.5);
    drawHand((s * Math.PI) / 30, radius * 1.05, 2, baseAlpha * 4);
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${baseAlpha * 4})`;
    ctx.fill();
    rafId = requestAnimationFrame(animate);
  })();
  return () => cancelAnimationFrame(rafId);
}

const BG_EFFECTS = [
  animateParticlesEffect,
  animateLinesEffect,
  animateNoiseCloudEffect,
  animateDigitalRainEffect,
  animateCandlestickChartEffect,
  animateLargeClockEffect,
  animateAnalogClockEffect
];

let stopBgEffect = null;
if (!SYSTEM_CONFIG.reducedMotion) {
  stopBgEffect = BG_EFFECTS[Math.floor(Math.random() * BG_EFFECTS.length)]();
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    if (stopBgEffect) stopBgEffect();
  } else if (!SYSTEM_CONFIG.reducedMotion) {
    if (stopBgEffect) stopBgEffect();
    stopBgEffect = BG_EFFECTS[Math.floor(Math.random() * BG_EFFECTS.length)]();
  }
});

// keyboard nav

let isTransitioning = false;
let isIntroFinished = false;

document.addEventListener("keydown", (e) => {
  if (isTransitioning) return;

  const routes = {
    Escape: showBigBoxes,
    "`": showBigBoxes,
    0: showBigBoxes,
    1: showParagraphs,
    2: showPortfolio,
    3: showPlayground,
    4: showContactInfo,
    5: showGallery,
    6: showSettingsPage
  };

  const targetFunc = routes[e.key];
  const container = getContainer();

  if (container && targetFunc) {
    isTransitioning = true;
    fadeOutAll([container], 600, () => {
      targetFunc();
      setTimeout(() => {
        isTransitioning = false;
      }, 1000);
    });
  } else if (!container && (e.key === "Enter" || e.key === " ")) {
    handleTextClick(false);
  }
});

// mobile double tap
let lastTap = 0;
document.addEventListener("touchend", (e) => {
  if (getContainer()) return;
  const now = new Date().getTime();
  const tapLen = now - lastTap;
  if (tapLen < 500 && tapLen > 0) {
    handleTextClick(false);
    e.preventDefault();
  }
  lastTap = now;
});
