import Hyperbeam from "https://unpkg.com/@hyperbeam/web@latest/dist/index.js";

////////////////////////////////////////////////////////////////////////////////
// 1) YOUR PREMIUM CHECKER
function isUserPremium() {
  const token = localStorage.getItem("cvm_token");
  if (!token) return false;
  return localStorage.getItem("cvm_premium") === "1";
}

////////////////////////////////////////////////////////////////////////////////
// 2) EVERYTHING THAT USED TO LIVE IN DOMContentLoaded

function initApp() {
  // ======== apply premium theme ========
  // Premium theme toggle
// Premium theme toggle
// Premium theme toggle
if (isUserPremium()) {
  document.documentElement.classList.add("premium-theme");
} else {
  document.documentElement.classList.remove("premium-theme");
}

// ======== Replace content if user is premium ========
if (isUserPremium()) {
  // Change the <h2>
  const warningH2 = document.querySelector('#warning h2');
  if (warningH2) {
    warningH2.textContent = "Thanks for buying premium and using CVM!";
  }

  // Change the second paragraph inside #warning .overlay-content
  const paras = document.querySelectorAll('#warning .overlay-content p');
  if (paras[1]) {
    paras[1].textContent =
      "With premium, you got a special theme, 40 minutes of time, AND are the first priority to fixing, CVM is also updated frequently, so you will get early updates too!";
  }
  if (paras[2]) {
    paras[2].innerHTML = 
      `If you are enjoying premium, consider subscribing to my <a href="https://www.youtube.com/@wilburzenith" target="_blank" style="color:#55C629; text-decoration:underline;">YrouTrube</a> channel!`;
  }

  // Replace both <i> cases in one loop
  document.querySelectorAll('#warning .overlay-content i').forEach(elem => {
    const txt = elem.textContent.trim();
    if (txt === "What is premium?") {
      elem.textContent = " ";
    } else if (txt === "Why is there a time limit?") {
      elem.textContent = " ";
    }
  });

  // Replace #server-switch content
  const serverSwitch = document.getElementById('server-switch');
  if (serverSwitch) {
    serverSwitch.innerHTML = `
      <button data-url="https://hungry-hippo.stilla-rrms-wlwv-k12-or-us.workers.dev/" class="selected">Main 🟢</button>
      <button data-url="https://rubber-ducky.stilla-rrms-wlwv-k12-or-us.workers.dev/">1 🟢</button>
    `;
  }

  // ======== Add personalized greeting below h2 ========
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  const username = localStorage.getItem("cvm_username") || "User";
  const greetingText = `Good ${timeOfDay}, ${username}`;

  const h2 = document.querySelector("#warning .overlay-content > h2");
  if (h2) {
    const greeting = document.createElement("p");
    greeting.textContent = greetingText;
    greeting.style.fontSize = "30px";
    greeting.style.fontWeight = "bold";
    greeting.style.marginTop = "8px";
    h2.insertAdjacentElement("afterend", greeting);
  }
}

// Helper function to get current time of day string
function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

// Helper function to get username from localStorage (or fallback)
function getUsername() {
  return localStorage.getItem("cvm_username") || "User";
}

  // ======== grab our selected serverUrl ========
  let serverUrl = document.querySelector('#server-switch button.selected').dataset.url;

  // ======== server-switch listener ========
  document.querySelectorAll('#server-switch button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#server-switch button')
              .forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      serverUrl = btn.dataset.url;
    });
  });

  // ======== fullscreen toggle ========
  const fsWrapper = document.getElementById('fullscreen-timer-wrapper');
  const fsTimer   = document.getElementById('fullscreen-timer');
  const toggleBtn = document.getElementById('toggle-timer-btn');
  toggleBtn.addEventListener('click', () => {
    const hidden = fsTimer.style.display === 'none';
    fsTimer.style.display = hidden ? 'inline' : 'none';
    toggleBtn.textContent = hidden ? '<' : '>';
  });

  // ======== main start() ========
  async function start() {
    setTimeout(() => document.getElementById('black-notif').classList.add('active'), 5000);
    try {
      const res = await fetch(serverUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}"
      });
      const { embed_url } = await res.json();
      await Hyperbeam(
        document.getElementById("hyperbeam-container"),
        embed_url,
        { iframeAttributes: { allow: "fullscreen" } }
      );
    } catch {
      const e = document.getElementById('error-message');
      e.style.display = 'block';
      e.textContent = "It's either one, you ran CVM on a proxy, two, you tried to run CVM in CVM, or three, you tried to skid (stop trying and just make your own).";
    }
  }

  // ======== overlay & timer wiring ========
  let minuteAlertShown = false, timeoutExpired = false;
  document.getElementById('acknowledge-checkbox').addEventListener('change', e =>
    document.getElementById('close-warning').disabled = !e.target.checked
  );
  document.getElementById('close-warning').addEventListener('click', () => {
    document.getElementById('warning').classList.remove('active');
    start();
    startTimer();
  });
  document.getElementById('minute-ok').addEventListener('click', () =>
    document.getElementById('minute-warning').classList.remove('active')
  );
  document.getElementById('notif-no').addEventListener('click', () =>
    document.getElementById('black-notif').classList.remove('active')
  );
  document.getElementById('notif-yes').addEventListener('click', () => {
    document.getElementById('black-notif').classList.remove('active');
    document.getElementById('black-alert').classList.add('active');
  });
  document.getElementById('black-ok').addEventListener('click', () =>
    document.getElementById('black-alert').classList.remove('active')
  );
  document.getElementById('fullscreen-btn').addEventListener('click', async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  });
  document.addEventListener('fullscreenchange', () => {
    const inFS = !!document.fullscreenElement;
    document.getElementById('bottom-bar').style.display = inFS ? 'none' : 'flex';
    document.getElementById('hyperbeam-container')
            .classList.toggle('fullscreen-mode', inFS);
    fsWrapper.style.display = inFS ? 'flex' : 'none';
    if (inFS) { fsTimer.style.display = 'inline'; toggleBtn.textContent = '<'; }
  });

  // ======== timer ========
  function startTimer() {
    let t = isUserPremium() ? 40 * 60 : 20 * 60;
    updateTimerDisplay(t);
    const iv = setInterval(() => {
      if (t > 0) {
        t--;
        updateTimerDisplay(t);
        if (t === 60 && !minuteAlertShown) {
          minuteAlertShown = true;
          document.getElementById('minute-warning').classList.add('active');
        }
      } else {
        clearInterval(iv);
        timeoutExpired = true;
        window.removeEventListener('beforeunload', blockUnload);
        window.location.href = 'https://cvm.rest/';
      }
    }, 1000);
  }

  function updateTimerDisplay(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    const txt = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    document.getElementById('timer').textContent = txt;
    document.getElementById('fullscreen-timer').textContent = txt;
  }

  // ======== key blocking ========
  document.addEventListener('keydown', e => {
    if (e.ctrlKey) {
      if (!['c','v','C','V'].includes(e.key)) e.preventDefault();
    } else if (e.altKey||e.metaKey) {
      e.preventDefault();
    } else if (['F1','F5','Tab','Escape'].includes(e.key)) {
      e.preventDefault();
    }
  });
}

////////////////////////////////////////////////////////////////////////////////
// 3) HOOKING UP AUTH FLOW

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("overlay");
  const guestBtn = document.getElementById("auth-guest");
  const submit   = document.getElementById("auth-submit");
  const toggle   = document.getElementById("auth-toggle");
  const titleEl  = document.getElementById("auth-title");
  const userEl   = document.getElementById("auth-username");
  const passEl   = document.getElementById("auth-password");
  const errorEl  = document.getElementById("auth-error");
  const WORKER_BASE = "https://cvm-accounts.stilla-rrms-wlwv-k12-or-us.workers.dev";

  let isSignup = false;
  let started  = false;

  function finishAuth() {
    overlay.style.display = "none";
    if (!started) {
      started = true;
      initApp();
    }
  }

  // Auto-login
  if (localStorage.getItem("cvm_token")) {
    finishAuth();
  }

  // Guest access
  guestBtn.addEventListener("click", finishAuth);

  // Toggle login/signup UI
  toggle.addEventListener("click", () => {
    isSignup = !isSignup;
    titleEl.textContent = isSignup ? "Sign Up" : "Login";
    submit.textContent   = isSignup ? "Sign Up" : "Login";
    toggle.textContent   = isSignup
      ? "Already have an account? Login"
      : "Don't have an account? Sign up";
    errorEl.textContent = "";
  });

  // Login / Sign Up flow
  submit.addEventListener("click", async () => {
    const username = userEl.value.trim();
    const password = passEl.value;
    if (!username || !password) {
      errorEl.textContent = "Please fill in both fields.";
      return;
    }
    const endpoint = isSignup ? "/signup" : "/login";
    try {
      const res = await fetch(WORKER_BASE + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
localStorage.setItem("cvm_token", data.token);
localStorage.setItem("cvm_username", username);
localStorage.setItem("cvm_premium", data.premium ? "1" : "0");

if (isSignup) {
  finishAuth();
} else {
  finishAuth();
}
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });
});
