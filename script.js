// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // 关闭移动菜单
      document.querySelector('.nav-links')?.classList.remove('active');
    }
  });
});

// Navbar background on scroll
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.style.background = 'rgba(26, 20, 16, 0.98)';
  } else {
    navbar.style.background = 'rgba(26, 20, 16, 0.95)';
  }
});

// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });
}

// Intersection Observer for fade-in animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

// Add fade-in class to elements and observe them
document.querySelectorAll('.about-card, .work-card, .skill-group, .contact-card').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// Parallax effect for decorative circles
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const circles = document.querySelectorAll('.circle');
  circles.forEach((circle, index) => {
    const speed = 0.5 + (index * 0.2);
    circle.style.transform = `translateY(${scrolled * speed}px)`;
  });
});

// Add loading animation
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease';
  setTimeout(() => {
    document.body.style.opacity = '1';
  }, 100);
});

console.log('纪云工艺美术品设计工作室 - 网站已加载 ✓');
