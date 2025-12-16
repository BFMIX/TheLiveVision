// headerScroll.js
// Add shadow to header on scroll

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.header');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
});
