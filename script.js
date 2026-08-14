// Smooth scroll for nav links with easing
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const offsetTop = target.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      // 关闭移动菜单
      document.querySelector('.nav-links')?.classList.remove('active');
    }
  });
});

// Navbar background on scroll with opacity transition
let lastScroll = 0;
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  if (currentScroll > 50) {
    navbar.style.background = 'rgba(26, 20, 16, 0.98)';
    navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.3)';
  } else {
    navbar.style.background = 'rgba(26, 20, 16, 0.95)';
    navbar.style.boxShadow = 'none';
  }
  lastScroll = currentScroll;
});

// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });
}

// Intersection Observer for fade-in animations with staggered delay
const observerOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -30px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      // Add staggered delay based on element position
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, index * 100);
    }
  });
}, observerOptions);

// Observe all animated elements
document.querySelectorAll('.about-card, .work-card, .skill-group, .contact-card, .section-title').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// Parallax effect with damping for smoother feel
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      const scrolled = window.pageYOffset;
      const circles = document.querySelectorAll('.circle');
      circles.forEach((circle, index) => {
        // Lower speed for smoother parallax
        const speed = 0.15 + (index * 0.08);
        circle.style.transform = `translateY(${scrolled * speed}px)`;
      });
      ticking = false;
    });
    ticking = true;
  }
});

// Smooth page load animation
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });
});

// Add subtle hover effects for cards
document.querySelectorAll('.about-card, .work-card, .skill-group, .contact-card').forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.transitionDelay = '0ms';
  });
  card.addEventListener('mouseleave', function() {
    this.style.transitionDelay = '50ms';
  });
});

console.log('霁云工艺美术品设计工作室 - 网站已加载 ✓');
