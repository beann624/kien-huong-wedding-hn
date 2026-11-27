(function () {
  'use strict';
  const countdown = document.getElementById('countdowncontainer');
  const weddingDate = new Date('2025-07-05T00:00:00+07:00').getTime();
  let timerInterval;
  function updateTimer() {
    const remaining = weddingDate - Date.now();
    if (remaining <= 0) {
      countdown.innerHTML = '<li class="wedding-complete">Chúng mình đã nên duyên</li>';
      clearInterval(timerInterval);
      return false;
    }
    const seconds = Math.floor(remaining / 1000);
    const values = [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24,
      Math.floor(seconds / 60) % 60, seconds % 60];
    countdown.innerHTML = values.map((value, index) =>
      `<li><span>${value}</span><p>${['Ngày', 'Giờ', 'Phút', 'Giây'][index]}</p></li>`).join('');
    return true;
  }
  if (countdown && updateTimer()) timerInterval = setInterval(updateTimer, 1000);

  const form = document.getElementById('wish_form');
  const submit = form.querySelector('button[type="submit"]');
  const feedback = document.createElement('p');
  feedback.className = 'form-feedback';
  feedback.setAttribute('role', 'status');
  form.appendChild(feedback);
  let sending = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    sending = true;
    submit.disabled = true;
    const originalText = submit.textContent;
    submit.textContent = 'Đang gửi…';
    feedback.textContent = '';
    document.getElementById('thankyou').style.display = 'none';
    try {
      const response = await fetch(form.action, { method: 'POST', body: new FormData(form) });
      if (!response.ok) throw new Error('Không gửi được lời chúc');
      form.reset();
      document.getElementById('thankyou').style.display = 'block';
      fetchWishes();
    } catch (error) {
      feedback.textContent = 'Chưa gửi được lời chúc. Bạn kiểm tra kết nối và thử lại nhé.';
    } finally {
      sending = false;
      submit.disabled = false;
      submit.textContent = originalText;
    }
  });
  async function fetchWishes() {
    const container = document.getElementById('wishes-container');
    container.textContent = 'Đang tải lời chúc…';
    try {
      const response = await fetch('https://opensheet.elk.sh/1EjkFX81lCDP5VLHOnycLLjcJv6V1I6vYCeD1aVR6BWE/Sheet1');
      if (!response.ok) throw new Error('Không tải được lời chúc');
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Dữ liệu không hợp lệ');
      container.replaceChildren();
      if (!data.length) container.textContent = 'Hãy là người đầu tiên gửi lời chúc cho chúng mình ♡';
      data.slice().reverse().forEach(item => {
        const card = document.createElement('div');
        card.className = 'wish-card';
        const message = document.createElement('p');
        const author = document.createElement('p');
        message.textContent = `💬 “${item['Lời chúc '] || item['Lời chúc'] || 'Không có lời chúc'}”`;
        author.className = 'wish-author';
        author.textContent = `— ${item['Họ và tên'] || 'Ẩn danh'}`;
        card.append(message, author);
        container.appendChild(card);
      });
    } catch (error) {
      container.textContent = 'Chưa tải được lời chúc. ';
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.className = 'btn btn-default btn-sm';
      retry.textContent = 'Thử lại';
      retry.addEventListener('click', fetchWishes);
      container.appendChild(retry);
    }
  }
  fetchWishes();

  const audio = document.getElementById('bg-music');
  const musicButton = document.getElementById('music-toggle');
  function syncMusicButton() {
    const playing = !audio.paused && !audio.muted;
    musicButton.classList.toggle('off', !playing);
    musicButton.setAttribute('aria-pressed', String(playing));
    musicButton.setAttribute('aria-label', playing ? 'Tắt nhạc' : 'Bật nhạc');
  }
  musicButton.addEventListener('click', async () => {
    if (!audio.paused && !audio.muted) audio.pause();
    else {
      audio.muted = false;
      try { await audio.play(); } catch (error) { audio.pause(); }
    }
    syncMusicButton();
  });
  ['play', 'pause', 'volumechange', 'error'].forEach(name => audio.addEventListener(name, syncMusicButton));
  syncMusicButton();

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', event => {
      const id = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(id || 'slider');
      if (!target) return;
      event.preventDefault();
      const offset = document.getElementById('header').getBoundingClientRect().height + 12;
      window.scrollTo({ top: Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset),
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      if (window.innerWidth < 768 && window.jQuery) {
        window.jQuery('#main_navigation > ul').slideUp();
        document.querySelector('.nav-collapser').setAttribute('aria-expanded', 'false');
      }
    });
  });
  if (window.Fancybox && typeof window.Fancybox.bind === 'function') {
    window.Fancybox.bind('[data-fancybox="gallery"]', {});
  }
  const modal = document.getElementById('qrModal');
  modal.addEventListener('click', event => { if (event.target === modal) window.closeModal(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') window.closeModal(); });
})();
