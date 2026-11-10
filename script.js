/**
 * เนื้อย่างจักรพรรดิ์ (The Imperial Thai Grill)
 * Vanilla JavaScript interactions: navigation drawer, menu filter,
 * booking modal, promo copy, gallery lightbox, and scroll reveal.
 */

(function () {
  'use strict';

  const toastEl = document.getElementById('toast');
  let toastTimer = null;

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.hidden = true;
    }, 2600);
  }

  function copyText(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => showToast(successMsg),
        () => fallbackCopy(text, successMsg)
      );
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.left = '-9999px';
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand('copy');
      showToast(successMsg);
    } catch {
      showToast('ไม่สามารถคัดลอกอัตโนมัติ กรุณาคัดลอกด้วยตนเอง');
    }
    document.body.removeChild(area);
  }

  // 1. Sticky header scroll state + Mobile Navigation Drawer
  function initNavigation() {
    const header = document.getElementById('site-header');
    const hamburger = document.getElementById('hamburger-btn');
    const drawer = document.getElementById('mobile-drawer');

    if (header) {
      const onScroll = () => {
        header.classList.toggle('is-scrolled', window.scrollY > 36);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    if (hamburger && drawer) {
      const setDrawerOpen = (isOpen) => {
        hamburger.setAttribute('aria-expanded', String(isOpen));
        drawer.hidden = !isOpen;
      };

      hamburger.addEventListener('click', () => {
        const isCurrentlyOpen = hamburger.getAttribute('aria-expanded') === 'true';
        setDrawerOpen(!isCurrentlyOpen);
      });

      drawer.querySelectorAll('a, button').forEach((item) => {
        item.addEventListener('click', () => setDrawerOpen(false));
      });
    }
  }

  // 2. Promo code copy buttons
  function initPromoCopy() {
    document.querySelectorAll('[data-copy-code]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const code = btn.getAttribute('data-copy-code') || '';
        copyText(code, `คัดลอกรหัสโปรโมชั่น "${code}" แล้ว`);
      });
    });
  }

  // 3. Signature Menu Category Filter
  function initMenuFilter() {
    const tabs = document.querySelectorAll('.menu-tab');
    const cards = document.querySelectorAll('#menu-grid .menu-card');

    if (!tabs.length || !cards.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const filter = tab.getAttribute('data-filter');

        tabs.forEach((t) => {
          const active = t === tab;
          t.classList.toggle('is-active', active);
          t.setAttribute('aria-selected', String(active));
        });

        cards.forEach((card) => {
          const category = card.getAttribute('data-category');
          const matches = filter === 'all' || category === filter;
          card.classList.toggle('is-hidden', !matches);
          if (matches) {
            card.classList.remove('is-pending');
          }
        });
      });
    });
  }

  // 4. Booking Modal
  function initBookingModal() {
    const modal = document.getElementById('booking-modal');
    const form = document.getElementById('booking-form');
    const successPanel = document.getElementById('booking-success');
    const summaryBox = document.getElementById('booking-summary-box');
    const copySummaryBtn = document.getElementById('copy-booking-btn');

    const dateInput = document.getElementById('book-date');
    const tierSelect = document.getElementById('book-tier');
    const promoInput = document.getElementById('book-promo');

    if (!modal || !form) return;

    // Default reservation date to today
    if (dateInput) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const isoToday = `${yyyy}-${mm}-${dd}`;
      dateInput.min = isoToday;
      dateInput.value = isoToday;
    }

    function openModal(presetTier, presetPromo) {
      form.hidden = false;
      if (successPanel) successPanel.hidden = true;
      if (presetTier && tierSelect) tierSelect.value = presetTier;
      if (presetPromo && promoInput) promoInput.value = presetPromo;
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.hidden = true;
      document.body.style.overflow = '';
    }

    document.querySelectorAll('[data-open-booking]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        openModal(
          trigger.getAttribute('data-tier'),
          trigger.getAttribute('data-promo')
        );
      });
    });

    modal.querySelectorAll('[data-close-modal]').forEach((closer) => {
      closer.addEventListener('click', closeModal);
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = (document.getElementById('book-name')?.value || '').trim();
      const phone = (document.getElementById('book-phone')?.value || '').trim();
      const date = dateInput?.value || '-';
      const time = document.getElementById('book-time')?.value || '-';
      const guests = document.getElementById('book-guests')?.value || '2';
      const tier = tierSelect?.value || '-';
      const promo = (promoInput?.value || '').trim() || 'ไม่มี';

      const summary = [
        '👑 จองโต๊ะร้าน เนื้อย่างจักรพรรดิ์',
        `• ชื่อผู้จอง: ${name}`,
        `• เบอร์โทร: ${phone}`,
        `• วันที่/เวลา: ${date} เวลา ${time} น.`,
        `• จำนวน: ${guests} ท่าน`,
        `• สำรับที่เลือก: ${tier}`,
        `• โปรโมชั่น/หมายเหตุ: ${promo}`,
      ].join('\n');

      if (summaryBox) summaryBox.textContent = summary;
      form.hidden = true;
      if (successPanel) successPanel.hidden = false;
    });

    if (copySummaryBtn && summaryBox) {
      copySummaryBtn.addEventListener('click', () => {
        copyText(summaryBox.textContent || '', 'คัดลอกข้อความจองโต๊ะแล้ว ส่งเข้า LINE ได้เลย!');
      });
    }

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !modal.hidden) {
        closeModal();
      }
    });
  }

  // 5. Gallery Lightbox
  function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const imgEl = document.getElementById('lightbox-img');
    const captionEl = document.getElementById('lightbox-caption');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    const items = Array.from(document.querySelectorAll('[data-lightbox-src]'));

    if (!lightbox || !imgEl || !items.length) return;

    let currentIndex = 0;

    function showSlide(index) {
      currentIndex = (index + items.length) % items.length;
      const item = items[currentIndex];
      const src = item.getAttribute('data-lightbox-src') || '';
      const caption = item.getAttribute('data-lightbox-caption') || '';
      imgEl.src = src;
      imgEl.alt = caption;
      if (captionEl) captionEl.textContent = caption;
    }

    function openLightbox(index) {
      showSlide(index);
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.hidden = true;
      document.body.style.overflow = '';
    }

    items.forEach((item, index) => {
      item.addEventListener('click', () => openLightbox(index));
    });

    lightbox.querySelectorAll('[data-close-lightbox]').forEach((closer) => {
      closer.addEventListener('click', closeLightbox);
    });

    if (prevBtn) prevBtn.addEventListener('click', () => showSlide(currentIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => showSlide(currentIndex + 1));

    document.addEventListener('keydown', (event) => {
      if (lightbox.hidden) return;
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowLeft') showSlide(currentIndex - 1);
      if (event.key === 'ArrowRight') showSlide(currentIndex + 1);
    });
  }

  // 6. Progressive Scroll Reveal (never leaves sections stuck invisible)
  function initScrollReveal() {
    const revealEls = Array.from(document.querySelectorAll('.reveal'));
    if (!revealEls.length || !('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const triggerReveal = () => {
      const limit = window.innerHeight * 1.05;
      revealEls.forEach((el) => {
        if (!el.classList.contains('is-pending')) return;
        if (el.getBoundingClientRect().top <= limit) {
          el.classList.remove('is-pending');
        }
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('is-pending');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -15px 0px' }
    );

    const viewBottom = window.innerHeight;
    revealEls.forEach((el) => {
      if (el.getBoundingClientRect().top > viewBottom) {
        el.classList.add('is-pending');
        observer.observe(el);
      }
    });

    window.addEventListener('scroll', triggerReveal, { passive: true });
    window.addEventListener('hashchange', () => setTimeout(triggerReveal, 60));
  }

  initNavigation();
  initPromoCopy();
  initMenuFilter();
  initBookingModal();
  initLightbox();
  initScrollReveal();
})();
