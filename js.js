// ========== Utility Functions ==========
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
  
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  }
  
  function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    passwordInput.type = passwordInput.type === "password" ? "text" : "password";
  }
  
  // ========== Main ==========
  document.addEventListener("DOMContentLoaded", function () {
    // ======== Login Form ========
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      const urlParams = new URLSearchParams(window.location.search);
      const emailParam = urlParams.get("email");
      const passwordParam = urlParams.get("password");
  
      if (emailParam && passwordParam) {
        document.getElementById("loginEmail").value = emailParam;
        document.getElementById("loginPassword").value = passwordParam;
      }
  
      loginForm.addEventListener("submit", function (event) {
        event.preventDefault();
  
        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value.trim();
  
        if (!email || !password) {
          Swal.fire("Lỗi!", "Vui lòng nhập email và mật khẩu!", "error");
          return;
        }
  
        let users = JSON.parse(localStorage.getItem("users")) || [];
        const user = users.find(u => u.email === email && u.password === password);
  
        if (user) {
          Swal.fire({
            icon: "success",
            title: "Đăng nhập thành công!",
            text: "Chào mừng bạn quay trở lại!",
            timer: 2000,
            showConfirmButton: false
          }).then(() => {
            window.location.href = "html2.html";
          });
        } else {
          Swal.fire("Thất bại!", "Email hoặc mật khẩu không đúng!", "error");
        }
      });
    }
  
    // ======== Register Form ========
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
      registerForm.addEventListener("submit", function (event) {
        event.preventDefault();
  
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value.trim();
        const confirmPassword = document.getElementById("registerConfirmPassword").value.trim();
  
        if (!validateEmail(email)) {
          Swal.fire("Lỗi!", "Vui lòng nhập địa chỉ email hợp lệ!", "error");
          return;
        }
  
        if (password.length < 6) {
          Swal.fire("Lỗi!", "Mật khẩu phải có ít nhất 6 ký tự!", "error");
          return;
        }
  
        if (password !== confirmPassword) {
          Swal.fire("Lỗi!", "Mật khẩu xác nhận không khớp!", "error");
          return;
        }
  
        let users = JSON.parse(localStorage.getItem("users")) || [];
        if (users.some(user => user.email === email)) {
          Swal.fire("Lỗi!", "Email này đã được đăng ký!", "error");
          return;
        }
  
        users.push({ email, password });
        localStorage.setItem("users", JSON.stringify(users));
  
        Swal.fire({
          icon: "success",
          title: "Đăng ký thành công!",
          text: "Chuyển hướng đến đăng nhập...",
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          window.location.href = `html.html?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
        });
      });
    }
  
    // ======== Background Music ========
    const musicBtn = document.getElementById("music-btn");
    const music = document.getElementById("background-music");
  
    if (music && musicBtn) {
      music.play().catch(err => console.log("Không thể phát nhạc nền:", err));
      musicBtn.textContent = "⏸ Pause";
  
      musicBtn.addEventListener("click", function () {
        if (music.paused) {
          music.play().catch(err => console.log("Không thể phát nhạc nền:", err));
          musicBtn.textContent = "⏸ Pause";
        } else {
          music.pause();
          musicBtn.textContent = "🎵 Play";
        }
      });
    }
  
    // ======== Music Player ========
    const playBtn = document.getElementById("play-btn");
    const audio = document.getElementById("audio-player");
    const playIcon = playBtn?.querySelector("i");
    const currentTimeDisplay = document.getElementById("current-time");
    const totalTimeDisplay = document.getElementById("duration");
    const progressBar = document.getElementById("progress-bar");
    const albumArt = document.querySelector(".album-art");
  
    let audioContext, analyser, dataArray;
    let pulseInterval;
  
    if (audio) {
      function initAudioContext() {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        analyser.fftSize = 256;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
      }
  
      function startVisualization() {
        if (!audioContext) initAudioContext();
  
        pulseInterval = setInterval(() => {
          analyser.getByteFrequencyData(dataArray);
          const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
  
          if (avg > 50) {
            albumArt.classList.add("pulse");
            setTimeout(() => albumArt.classList.remove("pulse"), 100);
          }
        }, 50);
      }
  
      function stopVisualization() {
        clearInterval(pulseInterval);
      }
  
      audio.addEventListener("loadedmetadata", () => {
        totalTimeDisplay.textContent = formatTime(audio.duration);
        progressBar.max = audio.duration;
      });
  
      audio.addEventListener("timeupdate", () => {
        currentTimeDisplay.textContent = formatTime(audio.currentTime);
        progressBar.value = audio.currentTime;
      });
  
      progressBar.addEventListener("input", () => {
        audio.currentTime = progressBar.value;
      });
  
      playBtn?.addEventListener("click", () => {
        if (audio.paused) {
          audio.play().catch(err => console.log("Lỗi phát nhạc:", err));
          playIcon?.classList.replace("fa-play", "fa-pause");
          albumArt.classList.add("playing");
          startVisualization();
        } else {
          audio.pause();
          playIcon?.classList.replace("fa-pause", "fa-play");
          albumArt.classList.remove("playing");
          stopVisualization();
        }
      });
  
      audio.addEventListener("ended", () => {
        playIcon?.classList.replace("fa-pause", "fa-play");
        albumArt.classList.remove("playing");
        stopVisualization();
      });
    }
  
    // ======== Navbar Scroll Effect ========
    window.addEventListener("scroll", () => {
      const navbar = document.querySelector(".navbar");
      navbar?.classList.toggle("scrolled", window.scrollY > 50);
    });
  
    // ======== Hover effect on links (Optional) ========
    document.querySelectorAll('.navbar.scrolled .nav-links a').forEach(link => {
      link.addEventListener('mousemove', (e) => {
        const rect = link.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        link.style.setProperty('--x', `${x}px`);
        link.style.setProperty('--y', `${y}px`);
      });
    });
  
    // ======== Clickable Cards ========
    document.querySelectorAll('.clickable-card').forEach(card => {
      card.addEventListener('click', function () {
        const onclickAttr = this.getAttribute('onclick');
        const match = onclickAttr?.match(/'([^']+)'/);
        if (match && match[1]) {
          window.location.href = match[1];
        }
      });
    });
  });
  