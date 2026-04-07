// hello, you're not supposed to be reading this but if you are, neat.
// take whatever you want from this code, literally all of it is just trial and error + documentation stuff.
// feline supremacy.

// constants
const TEXT_EL = document.getElementById("text");
const CURSOR_EL = document.getElementById("cursor");
const faces = [":)", ":D", ":]", ":>", ":3", "=)", "=D", "=]", "=3"];
const randomFace = faces[Math.floor(Math.random() * faces.length)];

const MSG1 = `Welcome ${randomFace}`;
const MSG2 = "How are you?";
const TYPE_SPEED = 100;
const BS_SPEED = 100;
const PAUSE_AFTER1 = 1000;

// nav data
const BIG_BOXES = [
  { symbol: "▲", label: "About Me", glitch: "Know More." },
  { symbol: "▼", label: "Contact", glitch: "Let's Talk." },
  { symbol: "◆", label: "Portfolio", glitch: "Just Projects." },
  { symbol: "⬤", label: "Status", glitch: "Right Now." }
];

const SMALL_BOXES = [
  { symbol: "⏹", label: "Home", glitch: "Go back.", target: showBigBoxes },
  {
    symbol: "▲",
    label: "About Me",
    glitch: "Know More.",
    target: showParagraphs
  },
  {
    symbol: "▼",
    label: "Contact",
    glitch: "Let's Talk.",
    target: showContactInfo
  },
  {
    symbol: "◆",
    label: "Portfolio",
    glitch: "Just Projects.",
    target: showPortfolio
  },
  { symbol: "⬤", label: "Status", glitch: "Right Now.", target: showGallery }
];

// helpers
function bstToday(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setUTCHours(h - 1, m, 0, 0);
  return d;
}

function isActiveNow(days, startBST, endBST) {
  const now = new Date();
  const day = now.getUTCDay();
  if (!days.includes(day)) return false;
  const start = bstToday(startBST);
  const end = bstToday(endBST);
  return now >= start && now <= end;
}

function getContainer() {
  return document.getElementById("container-content");
}

function css(el, styles) {
  Object.assign(el.style, styles);
}

function fadeOut(el, ms = 1000, cb) {
  if (!el) {
    cb?.();
    return;
  }
  css(el, { transition: `opacity ${ms}ms ease`, opacity: 0 });
  setTimeout(() => {
    el.remove();
    cb?.();
  }, ms);
}

function fadeOutAll(els, ms = 1000, cb) {
  let pending = els.length;
  els.forEach((el) =>
    fadeOut(el, ms, () => {
      if (!--pending) cb?.();
    })
  );
}

function freshContainer(extraStyles = {}) {
  getContainer()?.remove();
  const div = document.createElement("div");
  div.id = "container-content";
  css(div, { opacity: 0, transition: "opacity 1s ease", ...extraStyles });
  document.querySelector(".container").appendChild(div);
  requestAnimationFrame(() =>
    requestAnimationFrame(() => (div.style.opacity = 1))
  );
  return div;
}

function makeSpan(text, styles) {
  const s = document.createElement("span");
  s.textContent = text;
  css(s, styles);
  return s;
}

// fullscreen image in port
function showLightbox(src) {
  const overlay = document.createElement("div");
  css(overlay, {
    position: "fixed",
    top: "0", left: "0", width: "100vw", height: "100vh",
    backgroundColor: "rgba(0,0,0,0.9)",
    display: "flex", justifyContent: "center", alignItems: "center",
    zIndex: "100000", 
    opacity: "0", 
    transition: "opacity 0.5s ease",
    cursor: "pointer" 
  });

  const img = document.createElement("img");
  img.src = src;
  css(img, {
    maxWidth: "90%", maxHeight: "90%",
    borderRadius: "8px",
    boxShadow: "0 0 30px rgba(255,255,255,0.05)",
    
    transform: "scale(0.8)", 
    
    transition: "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)", 
    objectFit: "contain"
  });

  overlay.appendChild(img);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.style.opacity = "1";
      img.style.transform = "scale(1)"; 
    });
  });

  overlay.addEventListener("click", () => {
    overlay.style.opacity = "0";
    img.style.transform = "scale(0.85)";
    setTimeout(() => overlay.remove(), 500);
  });
}

function makeAnimatedPara(text, fontSize) {
  const p = document.createElement("p");
  p.textContent = text;
  css(p, {
    opacity: "0",
    transform: "translateY(20px)",
    fontSize,
    lineHeight: "1.5",
    transition: "opacity 1s ease, transform 1s ease"
  });
  return p;
}

function revealEl(el) {
  el.style.opacity = "1";
  el.style.transform = "translateY(0)";
}

function createSection(title, containerStyles = {}) {
  const container = freshContainer({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "15px",
    maxWidth: "600px",
    textAlign: "center",
    ...containerStyles
  });

  const h2 = document.createElement("h2");
  h2.textContent = title;
  css(h2, {
    fontSize: "clamp(1.5rem,3vw,2rem)",
    fontWeight: "bold",
    opacity: "0",
    transform: "translateY(20px)",
    transition: "opacity 1s ease, transform 1s ease"
  });
  container.appendChild(h2);
  setTimeout(() => revealEl(h2), 0);

  return { container, h2 };
}

// typing
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

// fit text in small boxes
function fitTextToBox(span, maxWidth) {
  let fs = parseInt(getComputedStyle(span).fontSize);
  while (span.scrollWidth > maxWidth && fs > 6) {
    span.style.fontSize = --fs + "px";
  }
}

function adjustSmallBoxLabels(labelEls) {
  labelEls.forEach((label) => {
    css(label, { fontFamily: "'Montserrat', sans-serif", fontSize: "1rem" });
    fitTextToBox(label, label.parentElement.clientWidth - 10);
  });
}

// box factory
function createBox(boxData, boxStyles = {}, iconStyles = {}, labelStyles = {}) {
  const boxDiv = document.createElement("div");
  css(boxDiv, {
    border: "2px solid white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderRadius: "8px",
    cursor: "pointer",
    opacity: "0",
    transition: "opacity 0.6s ease, transform 0.2s ease",
    transformOrigin: "center",
    ...boxStyles
  });

  const icon = makeSpan(boxData.symbol, {
    opacity: "1",
    position: "absolute",
    color: "white",
    transition: "opacity 0.4s ease",
    ...iconStyles
  });

  const label = makeSpan(boxData.label, {
    opacity: "0",
    position: "absolute",
    color: "white",
    transition: "opacity 0.4s ease",
    ...labelStyles
  });

  boxDiv.append(icon, label);

  // desktop hover glitching
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

  // mobile auto flickering
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

// small nav boxes
function showFourSmallBoxes(currentCb = null, targetWrapper = null) {
  const container = targetWrapper || getContainer();
  if (!container) return;

  container.querySelector(".small-box-wrapper")?.remove();

  const wrapper = document.createElement("div");
  wrapper.className = "small-box-wrapper";
  css(wrapper, {
    display: "flex",
    gap: "20px",
    justifyContent: "center",
    overflow: "visible",
    height: "0px",
    opacity: "0",
    transition: "height 0.6s ease, opacity 0.6s ease"
  });
  container.appendChild(wrapper);

  const boxes = [
    SMALL_BOXES[0],
    ...SMALL_BOXES.slice(1).filter((b) => b.target !== currentCb)
  ].slice(0, 4);

  const labelEls = [];

  boxes.forEach((box, i) => {
    const outer = document.createElement("div");
    css(outer, {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "80px",
      height: "80px",
      overflow: "visible"
    });
    wrapper.appendChild(outer);

    const { boxDiv, label } = createBox(
      box,
      { width: "80px", height: "80px" },
      { fontSize: "2rem" }
    );
    outer.appendChild(boxDiv);
    labelEls.push(label);

    boxDiv.addEventListener("click", () =>
      fadeOutAll([getContainer()], 500, box.target)
    );

    setTimeout(() => (boxDiv.style.opacity = "1"), i * 150);
  });

  setTimeout(() => {
    wrapper.style.height = wrapper.scrollHeight + 20 + "px";
    wrapper.style.opacity = "1";
    setTimeout(() => adjustSmallBoxLabels(labelEls), 50);
  }, 50);
}

// sections
function showBigBoxes() {
  const container = freshContainer({
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
    justifyContent: "center",
    alignItems: "center",
    maxWidth: "440px",
    margin: "40px auto 0 auto"
  });

  const targets = [showParagraphs, showContactInfo, showPortfolio, showGallery];

  BIG_BOXES.forEach((box, i) => {
    const { boxDiv } = createBox(
      box,
      {
        width: "200px",
        height: "200px",
        borderRadius: "10px",
        transition: "opacity 2s ease, transform 0.2s ease"
      },
      { fontSize: "4rem" },
      { fontSize: "1.8rem" }
    );
    container.appendChild(boxDiv);

    boxDiv.addEventListener("click", () =>
      fadeOutAll([container], 1000, targets[i])
    );

    setTimeout(() => (boxDiv.style.opacity = "1"), i * 400);
  });
}

function showParagraphs() {
  const { container } = createSection("About Me");

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

  function appendAnimatedPara(text, fontSize) {
    const p = makeAnimatedPara(text, fontSize);
    container.appendChild(p);
    return p;
  }

  const paraEls = paras.map((t) =>
    appendAnimatedPara(t, "clamp(0.9rem,2.5vw,1.1rem)")
  );
  const talentEls = talents.map((t) =>
    appendAnimatedPara(t, "clamp(0.85rem,2.2vw,1rem)")
  );

  paraEls.forEach((p, i) => setTimeout(() => revealEl(p), i * 1000 + 500));

  const talentStart = paras.length * 1000 + 500;
  talentEls.forEach((p, i) =>
    setTimeout(() => revealEl(p), talentStart + i * 750)
  );

  const totalTime = talentStart + talents.length * 750;
  setTimeout(
    () => showFourSmallBoxes(showParagraphs, container),
    totalTime + 500
  );
}

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

  const navDelay = contacts.length * 1000 + 500;

  contacts.forEach((c, i) => {
    let el;
    if (c.clickable) {
      el = document.createElement("a");
      el.href = c.href;
      el.target = "_blank";
    } else {
      el = document.createElement("p");
    }

    css(el, {
      opacity: "0",
      transform: "translateY(20px)",
      lineHeight: "1.5",
      fontSize: "clamp(0.9rem,2.5vw,1.1rem)",
      transition: "opacity 1s ease, transform 1s ease, color 0.3s ease",
      color: "white",
      textDecoration: "none",
      position: "relative"
    });

    if (c.clickable || c.isDiscord) {
      el.style.cursor = "pointer";
      el.addEventListener("mouseenter", () => {
        el.style.setProperty("color", "#888888", "important");
        el.style.setProperty("text-decoration", "underline", "important");
      });
      el.addEventListener("mouseleave", () => {
        el.style.setProperty("color", "white", "important");
        el.style.setProperty("text-decoration", "none", "important");
      });
    }

    if (c.isDiscord) {
      el.textContent = c.text;
      el.addEventListener("click", () => {
        navigator.clipboard.writeText(c.copyTarget).then(() => {
          const original = el.textContent;
          el.textContent = "Username copied.";
          el.style.color = "#888888";
          setTimeout(() => {
            el.textContent = original;
            el.style.color = "white";
          }, 1500);
        });
      });
    } else {
      el.textContent = c.text;
    }

    container.appendChild(el);
    setTimeout(() => revealEl(el), i * 1000);
  });

  setTimeout(() => showFourSmallBoxes(showContactInfo, container), navDelay);
}

function showPortfolio() {
  const { container } = createSection("Portfolio", {
    maxWidth: "960px",
    width: "100%"
  });

  const split = document.createElement("div");
  css(split, {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    maxWidth: "680px"
  });
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
  css(projectsPanel, {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    width: "100%",
    minHeight: "450px"
  });
  split.appendChild(projectsPanel);

  const controlsWrapper = document.createElement("div");
  css(controlsWrapper, {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "clamp(10px, 5vw, 30px)",
    width: "100%",
    marginTop: "10px",
    opacity: "0",
    transition: "opacity 1s ease"
  });
  split.appendChild(controlsWrapper);

  const ITEMS_PER_PAGE = 3;
  let currentPage = 0;
  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);

  const prevBtn = makeSpan(`[ ◄ ]`, {
    fontSize: "1.2rem",
    transition: "color 0.3s ease"
  });
  const pageIndicator = makeSpan(`PAGE ${currentPage + 1} / ${totalPages}`, {
    fontSize: "0.9rem",
    letterSpacing: "0.1em"
  });
  const nextBtn = makeSpan(`[ ► ]`, {
    fontSize: "1.2rem",
    transition: "color 0.3s ease"
  });

  controlsWrapper.append(prevBtn, pageIndicator, nextBtn);

  function setupArrow(btn, direction) {
    btn.addEventListener("mouseenter", () => {
      if (btn.style.opacity !== "0.3") btn.style.color = "gray";
    });
    btn.addEventListener("mouseleave", () => (btn.style.color = "white"));
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

    const atStart = currentPage === 0;
    const atEnd = currentPage === totalPages - 1;
    css(prevBtn, {
      opacity: atStart ? "0.3" : "1",
      cursor: atStart ? "default" : "pointer"
    });
    css(nextBtn, {
      opacity: atEnd ? "0.3" : "1",
      cursor: atEnd ? "default" : "pointer"
    });

    projectsPanel.innerHTML = "";
    const start = currentPage * ITEMS_PER_PAGE;
    const currentSlice = projects.slice(start, start + ITEMS_PER_PAGE);

    currentSlice.forEach((proj, i) => {
      const card = document.createElement("div");
      css(card, {
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: "10px",
        padding: "20px",
        background: "rgba(255,255,255,0.03)",
        opacity: "0",
        transform: "translateY(20px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
        width: "100%",
        boxSizing: "border-box",
        textAlign: "left",
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        gap: "20px"
      });

      const textWrapper = document.createElement("div");
      css(textWrapper, {
        display: "flex",
        flexDirection: "column",
        flex: "1"
      });

      const cardHeader = document.createElement("div");
      css(cardHeader, {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "10px",
        marginBottom: "12px"
      });

      const titleEl = document.createElement("strong");
      titleEl.textContent = proj.title;
      css(titleEl, { fontSize: "clamp(1rem, 4vw, 1.1rem)", lineHeight: "1.3" });

      const skillTag = document.createElement("span");
      skillTag.textContent = proj.skill;
      css(skillTag, {
        fontSize: "0.7rem",
        padding: "4px 10px",
        border: "1px solid rgba(255,255,255,0.35)",
        borderRadius: "20px",
        color: "rgba(255,255,255,0.7)",
        whiteSpace: "nowrap"
      });

      cardHeader.append(titleEl, skillTag);

      const desc = document.createElement("p");
      desc.textContent = proj.description;
      css(desc, {
        fontSize: "clamp(0.85rem, 1.6vw, 0.95rem)",
        lineHeight: "1.6",
        color: "rgba(255,255,255,0.75)"
      });

      textWrapper.append(cardHeader, desc);

      let imgWrapper = null;
      if (proj.image) {
        imgWrapper = document.createElement("div");
        css(imgWrapper, {
          flexShrink: "0",
          width: "120px",
          height: "120px",
          borderRadius: "6px",
          overflow: "hidden",
          cursor: "pointer",
          position: "relative"
        });

        const img = document.createElement("img");
        img.src = proj.image;
        css(img, {
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: "transform 0.4s ease"
        });

        imgWrapper.addEventListener(
          "mouseenter",
          () => (img.style.transform = "scale(1.05)")
        );
        imgWrapper.addEventListener(
          "mouseleave",
          () => (img.style.transform = "scale(1)")
        );

        imgWrapper.addEventListener("click", () => showLightbox(proj.image));

        imgWrapper.appendChild(img);
      }

      if (imgWrapper) {
        card.append(textWrapper, imgWrapper);
      } else {
        card.append(textWrapper);
      }

      projectsPanel.appendChild(card);

      const delay = isInitialLoad ? i * 1000 + 500 : i * 150 + 50;
      setTimeout(() => revealEl(card), delay);
    });
  }

  renderPage(true);

  const note = document.createElement("p");
  note.textContent = "More projects will be published as they are completed.";
  css(note, {
    fontSize: "0.8rem",
    color: "rgba(255,255,255,0.4)",
    fontStyle: "italic",
    opacity: "0",
    transition: "opacity 1s ease"
  });
  container.appendChild(note);

  const initialAnimationTime = ITEMS_PER_PAGE * 1000 + 500;
  setTimeout(() => {
    controlsWrapper.style.opacity = "1";
    note.style.opacity = "1";
  }, initialAnimationTime);

  setTimeout(
    () => showFourSmallBoxes(showPortfolio, container),
    initialAnimationTime + 1000
  );
}

function showGallery() {
  const { container } = createSection("Status", { width: "380px" });

  const WEEKDAYS = [1, 2, 3, 4, 5];

  const activityOverride = null;
  let activityLabel, activityActive;

  if (activityOverride) {
    activityLabel = activityOverride;
    activityActive = false;
  } else if (isActiveNow(WEEKDAYS, "14:30", "16:00")) {
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

  if (!document.getElementById("liveDotStyle")) {
    const style = document.createElement("style");
    style.id = "liveDotStyle";
    style.textContent =
      "@keyframes liveDot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(0.6); } }";
    document.head.appendChild(style);
  }

  function makeBox(sectionLabel, value, isLive) {
    const box = document.createElement("div");
    css(box, {
      width: "100%",
      border: "1px solid rgba(255,255,255,0.2)",
      borderRadius: "10px",
      padding: "20px 24px",
      background: "rgba(255,255,255,0.03)",
      opacity: "0",
      transform: "translateY(20px)",
      transition: "opacity 1s ease, transform 1s ease",
      display: "flex",
      flexDirection: "column",
      gap: "10px"
    });

    const top = document.createElement("div");
    css(top, {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    });

    const lbl = document.createElement("span");
    lbl.textContent = sectionLabel;
    css(lbl, {
      fontSize: "0.7rem",
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.4)"
    });

    const dot = document.createElement("span");
    dot.className = "live-dot";
    css(dot, {
      width: "7px",
      height: "7px",
      borderRadius: "50%",
      background: "white",
      animation: isLive ? "liveDot 1.4s ease-in-out infinite" : "none",
      opacity: isLive ? "1" : "0"
    });
    top.append(lbl, dot);

    const val = document.createElement("span");
    val.textContent = value;
    css(val, {
      fontSize: "clamp(0.9rem,2vw,1rem)",
      color: "white",
      lineHeight: "1.4"
    });

    box.append(top, val);
    return box;
  }

  const activityBox = makeBox("Activity", activityLabel, activityActive);
  const musicBox = makeBox(
    "Listening",
    "Establishing secure connection...",
    false
  );

  container.appendChild(activityBox);
  container.appendChild(musicBox);

  setTimeout(() => revealEl(activityBox), 0);
  setTimeout(() => revealEl(musicBox), 1000);

  fetchRecentTrack((trackLabel, isLive) => {
    const valSpan = musicBox.lastElementChild;
    const dot = musicBox.querySelector(".live-dot");

    if (isLive && dot) {
      dot.style.opacity = "1";
      dot.style.animation = "liveDot 1.4s ease-in-out infinite";
    }

    let showGlitch = true,
      count = 0;
    const decryptInterval = setInterval(() => {
      valSpan.textContent = showGlitch ? "DECRYPTING STREAM..." : trackLabel;
      showGlitch = !showGlitch;
      if (++count > 6) {
        clearInterval(decryptInterval);
        valSpan.textContent = trackLabel;
      }
    }, 150);
  });

  setTimeout(() => showFourSmallBoxes(showGallery, container), 2500);
}

// last.fm
function fetchRecentTrack(callback) {
  const API_KEY = "33a3c950939d5144118f8e5cd4b952bc";
  const USERNAME = "MiloSelfEsteem";
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${USERNAME}&api_key=${API_KEY}&format=json&limit=1`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      const trackList = data.recenttracks?.track;
      const track = Array.isArray(trackList) ? trackList[0] : trackList;

      if (!track) {
        callback("No recent tracks found.", false);
        return;
      }

      const isLive = track["@attr"]?.nowplaying === "true";
      if (isLive) {
        callback(`${track.artist["#text"]} — ${track.name}`, true);
      } else {
        callback("Silence.", false);
      }
    })
    .catch(() => callback("Signal Lost — Connection Refused.", false));
}

// intro sequence
function handleTextClick() {
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
      showBigBoxes();
      setTimeout(() => {
        isTransitioning = false;
      }, 2000);
    }, 500);
  }, 1000);
}

function startSubtleGlitch(el, a, b, minMs = 1000, maxMs = 3000) {
  let showA = true;
  let timer;
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
  const bgCanvas = document.getElementById("bgCanvas");
  bgCanvas?.classList.add("visible");

  const isMobile = window.innerWidth < 768;

  const skipTextWelcome = isMobile ? "Press Twice." : "Press Enter.";
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
            TEXT_EL.style.cursor = "pointer";
            TEXT_EL.addEventListener("click", handleTextClick, { once: true });

            startSubtleGlitch(TEXT_EL, MSG2, skipTextHowAreYou, 50, 2500);
          });
        });
      }, PAUSE_AFTER1 + 1500);
    });
  }, 500);
};

// canvas setup
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

// custom cursor
const customCursor = document.createElement("div");
customCursor.id = "custom-cursor";
customCursor.style.cssText = `
  position: fixed; top: 0; left: 0;
  width: 8px; height: 8px;
  background-color: white !important;
  border: 1px solid white !important;
  box-shadow: 0 0 10px 2px rgba(255,255,255,0.7) !important;
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
    'a, [style*="cursor: pointer"], .clickable-image'
  );
  if (isClickable) {
    customCursor.style.setProperty("width", "45px", "important");
    customCursor.style.setProperty("height", "45px", "important");
    customCursor.style.setProperty(
      "background-color",
      "transparent",
      "important"
    );
    customCursor.style.setProperty("border", "1px solid white", "important");
  } else {
    customCursor.style.setProperty("width", "8px", "important");
    customCursor.style.setProperty("height", "8px", "important");
    customCursor.style.setProperty("background-color", "white", "important");
    customCursor.style.setProperty("border", "1px solid white", "important");
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

// background effects

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

      const size = p.glitch ? p.size * 1.4 : p.size;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${p.color},${(p.glitch ? 1 : 0.7) * fade})`;
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fill();
      if (p.glitch > 0) p.glitch--;
    });
    rafId = requestAnimationFrame(animate);
  })();

  return () => cancelAnimationFrame(rafId);
}

function animateLinesEffect() {
  const isMobile = window.innerWidth < 768;
  const COUNT = isMobile ? 10 : 20;
  const MAX_LEN = isMobile ? 100 : 200;
  const MAX_SPEED = isMobile ? 8 : 16;
  const lines = Array.from({ length: COUNT }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    length: Math.random() * MAX_LEN + 50,
    speed: Math.random() * 4 + (isMobile ? 4 : MAX_SPEED),
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
  const COUNT = isMobile ? 15 : 30;
  const MAX_R = isMobile ? 50 : 80;
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

  const clouds = Array.from({ length: COUNT }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * MAX_R + 30,
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
  const spacing = isMobile ? 10 : 20;
  const step = candleWidth + spacing;
  const maxCandles = Math.ceil(canvas.width / step) + 2;
  const candles = [];

  let currentPrice = canvas.height / 2;
  for (let i = 0; i < maxCandles; i++) {
    const open = currentPrice;
    const close = open + (Math.random() - 0.5) * 150;
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
      let open = candles[candles.length - 1].close;
      let close = open + (Math.random() - 0.5) * 180;
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

    const colorBullish = "rgba(211,211,211,0.3)";
    const colorBearish = "rgba(85,85,85,0.3)";

    for (let i = 0; i < candles.length; i++) {
      const c = candles[i];
      const x = i * step + offset;
      const isBullish = c.close <= c.open;
      const bodyTop = Math.min(c.open, c.close);
      const bodyBottom = Math.max(c.open, c.close);
      const wickTop = Math.min(c.high, c.low);
      const wickBottom = Math.max(c.high, c.low);

      ctx.strokeStyle = ctx.fillStyle = isBullish ? colorBullish : colorBearish;
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, wickTop);
      ctx.lineTo(x + candleWidth / 2, bodyTop);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, bodyBottom);
      ctx.lineTo(x + candleWidth / 2, wickBottom);
      ctx.stroke();

      if (isBullish) ctx.fillRect(x, c.close, candleWidth, c.open - c.close);
      else ctx.fillRect(x, c.open, candleWidth, c.close - c.open);
    }
    rafId = requestAnimationFrame(animate);
  })();

  return () => cancelAnimationFrame(rafId);
}

function animateLargeClockEffect() {
  let rafId;

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  let cachedWidth = 0;
  let fontMain = "";
  let fontSub = "";
  let fontSizeMain = 0;

  let lastSecond = -1;
  let timeString = "";

  (function animate() {
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const now = new Date();
    const currentSecond = now.getSeconds();

    if (currentSecond !== lastSecond) {
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(currentSecond).padStart(2, "0");
      timeString = `${h}:${m}:${s}`;
      lastSecond = currentSecond;
    }

    const ms = String(now.getMilliseconds()).padStart(3, "0");

    if (cachedWidth !== canvas.width) {
      cachedWidth = canvas.width;
      const isMobile = window.innerWidth < 768;

      fontSizeMain = isMobile ? cachedWidth * 0.22 : cachedWidth * 0.12;
      fontMain = `bold ${fontSizeMain}px Montserrat`;
      fontSub = `normal ${fontSizeMain * 0.18}px Montserrat`;
    }

    const cx = cachedWidth / 2;
    const cy = canvas.height / 2;

    const isGlitching = Math.random() > 0.98;
    const offsetX = isGlitching ? (Math.random() - 0.5) * 15 : 0;
    const offsetY = isGlitching ? (Math.random() - 0.5) * 15 : 0;

    const opacity = 0.02 + Math.abs(Math.sin(now.getTime() * 0.0015)) * 0.04;

    ctx.font = fontMain;
    ctx.fillStyle = `rgba(255, 255, 255, ${
      isGlitching ? opacity * 2 : opacity
    })`;
    ctx.fillText(timeString, cx + offsetX, cy + offsetY);

    ctx.font = fontSub;
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.8})`;
    ctx.fillText(
      `LOCAL SYSTEM TIME [ .${ms} ]`,
      cx + offsetX,
      cy + fontSizeMain * 0.6 + offsetY
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

    const now = new Date();
    const ms = now.getMilliseconds();
    const s = now.getSeconds() + ms / 1000;
    const m = now.getMinutes() + s / 60;
    const h = (now.getHours() % 12) + m / 60;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const isMobile = window.innerWidth < 768;
    const radius = isMobile ? Math.min(cx, cy) * 1.2 : Math.min(cx, cy) * 1.1;

    const pulse = Math.abs(Math.sin(now.getTime() * 0.0015)) * 0.03;
    const baseAlpha = 0.08 + pulse;

    function drawHand(angle, length, width, alpha) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(
        cx + Math.cos(angle - Math.PI / 2) * length,
        cy + Math.sin(angle - Math.PI / 2) * length
      );
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    drawHand((h * Math.PI) / 6, radius * 0.6, 8, baseAlpha * 2);
    drawHand((m * Math.PI) / 30, radius * 0.85, 4, baseAlpha * 2.5);
    drawHand((s * Math.PI) / 30, radius * 1.05, 2, baseAlpha * 4);
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${baseAlpha * 4})`;
    ctx.fill();

    rafId = requestAnimationFrame(animate);
  })();

  return () => cancelAnimationFrame(rafId);
}

// pick a random effect and start it
const BG_EFFECTS = [
  animateParticlesEffect,
  animateLinesEffect,
  animateNoiseCloudEffect,
  animateDigitalRainEffect,
  animateCandlestickChartEffect,
  animateLargeClockEffect,
  animateAnalogClockEffect
];

let stopBgEffect = BG_EFFECTS[Math.floor(Math.random() * BG_EFFECTS.length)]();

// pause when tab is hidden, resume on return
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopBgEffect();
  } else {
    stopBgEffect = BG_EFFECTS[Math.floor(Math.random() * BG_EFFECTS.length)]();
  }
});

// keyboard nav
let isTransitioning = false;

document.addEventListener("keydown", (e) => {
  if (isTransitioning) return;

  const routes = {
    Escape: showBigBoxes,
    0: showBigBoxes,
    1: showParagraphs,
    2: showContactInfo,
    3: showPortfolio,
    4: showGallery
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
  } else if (!container) {
    if (e.key === "Enter" || e.key === " ") {
      handleTextClick();
    }
  }
});

// mobile
let lastTap = 0;
document.addEventListener("touchend", (e) => {
  if (!getContainer()) {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;

    if (tapLength < 500 && tapLength > 0) {
      handleTextClick();
      e.preventDefault();
    }
    lastTap = currentTime;
  }
});
