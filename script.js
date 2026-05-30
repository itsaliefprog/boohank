// ===== CURSOR =====
const cursor = document.getElementById('cursor');
let lastTailTime = 0;

document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';

  const now = Date.now();
  if (now - lastTailTime > 30) {
    const tail = document.createElement('div');
    tail.className = 'cursor-tail';
    tail.style.left = e.clientX + 'px';
    tail.style.top = e.clientY + 'px';
    document.body.appendChild(tail);
    setTimeout(() => tail.remove(), 1000);
    lastTailTime = now;
  }
});

document.addEventListener('mouseleave', () => {
  cursor.style.display = 'none';
});

document.addEventListener('mouseenter', () => {
  cursor.style.display = 'block';
});

document.querySelectorAll('a, button, .project-card, .beyond-card, .skill-category').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// ===== HAMBURGER MENU & NAVBAR HOVER =====
const hamburger = document.getElementById('hamburger');
const navbar = document.getElementById('navbar');
if (hamburger && navbar) {
  hamburger.addEventListener('click', () => {
    navbar.classList.toggle('open');
  });
}
if (navbar) {
  navbar.addEventListener('mouseenter', () => document.body.classList.add('cursor-dark'));
  navbar.addEventListener('mouseleave', () => document.body.classList.remove('cursor-dark'));
}



// ===== PARTICLE CANVAS =====
const canvas = document.getElementById('particleCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.size = Math.random() * 1.5 + 0.3;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.5 ? '#ffffff' : '#bae6fd';
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.opacity;
      ctx.fill();
    }
  }

  for (let i = 0; i < 120; i++) particles.push(new Particle());

  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = '#ffffff';
          ctx.globalAlpha = 0.05 * (1 - dist / 100);
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = 1;
    particles.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    ctx.globalAlpha = 1;
    requestAnimationFrame(animateParticles);
  }
  animateParticles();
}

// ===== SCROLL REVEAL =====
const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('revealed');
      }, 100 * (entry.target.dataset.delay || 0));
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealElements.forEach((el, i) => {
  el.dataset.delay = i % 5;
  revealObserver.observe(el);
});

// ===== SKILL BARS =====
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.skill-fill').forEach(bar => {
        bar.classList.add('animated');
      });
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.skill-category').forEach(cat => skillObserver.observe(cat));

// ===== CONTACT FORM =====
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = document.getElementById('formSubmit');
    btn.textContent = 'Sending...';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Sent! ✅';
      btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
      form.reset();
      setTimeout(() => {
        btn.textContent = 'Send Message ✉️';
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
    }, 1500);
  });
}

// ===== PJAX & ACTIVE NAV LINK =====
function updateActiveNav(path) {
  const current = path.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === current) link.classList.add('active');
    else link.classList.remove('active');
  });
}
updateActiveNav(window.location.pathname);

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', async (e) => {
    e.preventDefault();
    const href = link.getAttribute('href');
    if (href === (window.location.pathname.split('/').pop() || 'index.html')) return;
    
    updateActiveNav(href);

    try {
      const response = await fetch(href);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const newSection = doc.querySelector('section');
      const currentSection = document.querySelector('section');
      
      if (newSection && currentSection) {
        currentSection.replaceWith(newSection);
        window.history.pushState({}, '', href);
        
        // Re-initialize reveals
        const reveals = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
        reveals.forEach((el, i) => {
          el.dataset.delay = i % 5;
          revealObserver.observe(el);
        });

        // Re-initialize skills if needed
        document.querySelectorAll('.skill-category').forEach(cat => skillObserver.observe(cat));

        // Re-initialize contact form if exists
        const form = document.getElementById('contactForm');
        if (form) {
          form.addEventListener('submit', evt => {
            evt.preventDefault();
            const btn = document.getElementById('formSubmit');
            btn.textContent = 'Sending...';
            btn.disabled = true;
            setTimeout(() => {
              btn.textContent = 'Sent! ✅';
              btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
              form.reset();
              setTimeout(() => {
                btn.textContent = 'Send Message ✉️';
                btn.style.background = '';
                btn.disabled = false;
              }, 3000);
            }, 1500);
          });
        }
      } else {
        window.location.href = href;
      }
    } catch (err) {
      window.location.href = href;
    }
  });
});

window.addEventListener('popstate', () => {
  window.location.reload();
});
