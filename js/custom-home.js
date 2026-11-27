(function () {
  'use strict';
  const links = Array.from(document.querySelectorAll('.main_navigation .scroll > a'));
  function update() {
    let active = links[0];
    links.forEach(link => {
      const section = document.getElementById(link.hash.slice(1));
      if (section && section.getBoundingClientRect().top <= 200) active = link;
    });
    links.forEach(link => link.parentElement.classList.toggle('active', link === active));
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();
