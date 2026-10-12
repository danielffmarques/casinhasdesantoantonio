/**
 * Casinhas de Santo António — Script do Protótipo
 * Standard de Produção Bruto AI — Motion & Interaction System
 * 
 * Filosofia de Interação (Posicionamento Alentejano):
 * - Ritmo orgânico, calmo e sereno (sem saltos bruscos / no bounce).
 * - Transições suaves com curva cúbica alentejana cubic-bezier(0.22, 1, 0.36, 1).
 * - Feedback imediato e amigável em reservas, cálculo de noites e cópia de dados.
 * 
 * NOTA DE SEGURANÇA: Todas as ações de reserva neste protótipo são demonstrativas (mock).
 * Não existem transações financeiras, chamadas a APIs externas ou reservas automáticas reais.
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollHeader();
  initScrollReveal();
  initMobileMenu();
  initBookingModal();
  initHorizontalBookingBar();
  initDedicatedBookingPage();
  initFaqAccordion();
  initDuvidasForm();
  initBrutoCustomDatePicker();
  initGpsCopy();
  initContactForm();
  initLegalModal();
  initQuintaStackingMotion();
  initAerialHotspots();
  initRoomsAccordion();
  initReviewsInteractiveScroll();
  initActivitiesTabs();
  initExperienceCarousel();
  initCasinhaGallerySlider();
});

/**
 * 1. Cabeçalho Dinâmico com Transição Suave ao Scroll (Scrolled State)
 * E controlo de visibilidade do CTA do Header (só surge quando o botão/formulário do Hero sai do ecrã)
 */
function initScrollHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  const heroBookingWrapper = document.querySelector('.hero-booking-wrapper') || document.querySelector('.hero-actions');

  const onScroll = () => {
    const scrollY = window.scrollY || window.pageYOffset;
    
    // Scrolled state para sombra e compactação de altura
    if (scrollY > 30) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }

    // CTA do Header: só surge quando o botão/formulário do Hero deixa de estar visível no topo
    if (heroBookingWrapper) {
      const rect = heroBookingWrapper.getBoundingClientRect();
      const isHeroCtaOut = rect.bottom <= 80;
      header.classList.toggle('header-cta-visible', isHeroCtaOut);
    } else {
      header.classList.toggle('header-cta-visible', scrollY > 280);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
}

/**
 * Helper de Parsing Flexível de Datas (Suporta ISO YYYY-MM-DD e Formato Europeu DD/MM/AAAA)
 */
function parseDateFlexible(val) {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  if (typeof val !== 'string') return null;
  const clean = val.trim();
  const ymd = clean.match(/^(\d{4})[-\/\.](\d{1,2})[-\/\.](\d{1,2})$/);
  if (ymd) {
    return new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));
  }
  const dmy = clean.match(/^(\d{1,2})[-\/\.](\d{1,2})[-\/\.](\d{4})$/);
  if (dmy) {
    return new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
  }
  const d = new Date(clean);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * 4. Helper de Cálculo e Feedback Dinâmico de Noites (Live Nights Counter)
 */
function setupDatesFeedback(checkinEl, checkoutEl, container) {
  if (!checkinEl || !checkoutEl) return;

  function recalculate() {
    if (!checkinEl.value || !checkoutEl.value) return;
    const d1 = parseDateFlexible(checkinEl.value);
    const d2 = parseDateFlexible(checkoutEl.value);
    if (!d1 || !d2) return;

    // Se checkout <= checkin, auto-ajusta checkout para checkin + 1 dia de forma fluida
    if (d2 <= d1) {
      const nextDay = new Date(d1);
      nextDay.setDate(nextDay.getDate() + 1);
      const y = nextDay.getFullYear();
      const m = String(nextDay.getMonth() + 1).padStart(2, '0');
      const d = String(nextDay.getDate()).padStart(2, '0');
      checkoutEl.value = `${y}-${m}-${d}`;
    }

    const finalD2 = parseDateFlexible(checkoutEl.value) || d2;
    const nights = Math.max(1, Math.round((finalD2 - d1) / (1000 * 60 * 60 * 24)));
    if (container) {
      container.style.display = 'inline-flex';
      const label = nights === 1 ? '1 noite' : `${nights} noites`;
      container.textContent = `Duração da estadia: ${label}`;
    }
  }

  checkinEl.addEventListener('change', recalculate);
  checkinEl.addEventListener('input', recalculate);
  checkoutEl.addEventListener('change', recalculate);
  checkoutEl.addEventListener('input', recalculate);
  recalculate();

  return recalculate;
}
function initScrollReveal() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const targets = document.querySelectorAll(
    '.card, .section-header, .feature-img-wrapper, .quote-highlight, .booking-bar-horizontal, .faq-item, .contact-item'
  );

  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.08
  });

  targets.forEach((el) => {
    el.classList.add('reveal-item');
    if (el.parentElement && el.parentElement.classList.contains('cards-grid')) {
      const idx = Array.from(el.parentElement.children).indexOf(el);
      el.style.transitionDelay = `${(idx % 3) * 90}ms`;
    }
    observer.observe(el);
  });
}

/**
 * 3. Menu Mobile Toggle
 */
function initMobileMenu() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const navMenu = document.querySelector('.nav-menu');

  if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const isExpanded = navMenu.classList.contains('active');
      menuBtn.setAttribute('aria-expanded', isExpanded);
    });
  }
}


/**
 * 5. Gestão do Modal de Reserva Demonstrativo (Standard de Produção)
 * Substitui páginas de reserva isoladas por um fluxo integrado em modal com entrada e saída serenas.
 */
function initBookingModal() {
  const modal = document.getElementById('bookingModal');
  if (!modal) return;

  const closeBtn = document.getElementById('modalCloseBtn');
  const form = document.getElementById('modalBookingForm');
  const resultBox = document.getElementById('modalResultBox');

  const checkinInput = document.getElementById('modalCheckin');
  const checkoutInput = document.getElementById('modalCheckout');
  const guestsSelect = document.getElementById('modalGuests');
  const unitSelect = document.getElementById('modalUnit');

  // Inicializar datas padrão (amanhã e +2 dias)
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 3);

  const formatDate = (d) => d.toISOString().split('T')[0];

  if (checkinInput) {
    checkinInput.min = formatDate(today);
    if (!checkinInput.value) checkinInput.value = formatDate(tomorrow);
  }
  if (checkoutInput) {
    checkoutInput.min = formatDate(tomorrow);
    if (!checkoutInput.value) checkoutInput.value = formatDate(dayAfter);
  }

  // Tag dinâmica de contagem de noites no modal
  let modalNightsTag = document.getElementById('modalNightsTag');
  if (!modalNightsTag && checkinInput && checkinInput.parentElement && checkinInput.parentElement.parentElement) {
    modalNightsTag = document.createElement('div');
    modalNightsTag.id = 'modalNightsTag';
    modalNightsTag.className = 'nights-feedback-tag';
    checkinInput.parentElement.parentElement.insertAdjacentElement('afterend', modalNightsTag);
  }

  const triggerModalDatesUpdate = setupDatesFeedback(checkinInput, checkoutInput, modalNightsTag);

  // Função global de abertura do modal
  window.openBookingModal = function(initialData = {}) {
    if (resultBox) {
      resultBox.style.display = 'none';
      resultBox.innerHTML = '';
    }

    if (initialData.checkin && checkinInput) checkinInput.value = initialData.checkin;
    if (initialData.checkout && checkoutInput) checkoutInput.value = initialData.checkout;
    
    if (initialData.unit && unitSelect) {
      for (let i = 0; i < unitSelect.options.length; i++) {
        if (unitSelect.options[i].value === initialData.unit || unitSelect.options[i].text.includes(initialData.unit)) {
          unitSelect.selectedIndex = i;
          break;
        }
      }
    }

    if (initialData.guests && guestsSelect) {
      for (let i = 0; i < guestsSelect.options.length; i++) {
        if (guestsSelect.options[i].value === initialData.guests || guestsSelect.options[i].text.includes(initialData.guests)) {
          guestsSelect.selectedIndex = i;
          break;
        }
      }
    }

    if (triggerModalDatesUpdate) triggerModalDatesUpdate();

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  // Fecho do modal
  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // Atribuir abertura a todos os botões com a classe .open-booking-btn
  document.querySelectorAll('.open-booking-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const unit = btn.getAttribute('data-unit') || '';
      window.openBookingModal({ unit });
    });
  });

  // Submissão do formulário do modal
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('modalName')?.value || 'Hóspede';
      const email = document.getElementById('modalEmail')?.value || '';
      const phone = document.getElementById('modalPhone')?.value || '';
      const notes = document.getElementById('modalNotes')?.value || '';
      const checkin = checkinInput?.value || '';
      const checkout = checkoutInput?.value || '';
      const guests = guestsSelect?.value || '2 Adultos';
      const unit = unitSelect?.value || 'Casinha a definir';

      // Mensagem estruturada para WhatsApp oficial (+351 930 583 315)
      const waText = encodeURIComponent(
        `Pedido de Reserva — Casinhas de Santo António\n` +
        `Nome: ${name}\n` +
        `Check-in: ${checkin}\n` +
        `Check-out: ${checkout}\n` +
        `Hóspedes: ${guests}\n` +
        `Alojamento: ${unit}\n` +
        (phone ? `Contacto: ${phone}\n` : '') +
        (notes ? `Observações: ${notes}\n` : '') +
        `\nGostaria de confirmar a disponibilidade e tarifas oficiais para estas datas.`
      );
      const waUrl = `https://wa.me/351930583315?text=${waText}`;

      // Email estruturado para geral@casinhasdesantoantonio.pt
      const emailSubject = encodeURIComponent(`Solicitação de Reserva — ${unit} (${checkin} a ${checkout})`);
      const emailBody = encodeURIComponent(
        `Exmos. Senhores Casinhas de Santo António,\n\n` +
        `Gostaria de solicitar disponibilidade para a seguinte estadia:\n` +
        `• Nome: ${name}\n` +
        `• Entrada (Check-in): ${checkin}\n` +
        `• Saída (Check-out): ${checkout}\n` +
        `• Alojamento: ${unit}\n` +
        `• Hóspedes: ${guests}\n` +
        `• Contacto Telefónico: ${phone}\n` +
        (notes ? `• Observações: ${notes}\n` : '') +
        `\nAgradeço a confirmação de disponibilidade e o envio das tarifas oficiais.\n\nCom os melhores cumprimentos,\n${name}`
      );
      const emailUrl = `mailto:geral@casinhasdesantoantonio.pt?subject=${emailSubject}&body=${emailBody}`;

      if (resultBox) {
        resultBox.style.display = 'block';
        resultBox.innerHTML = `
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 1.25rem; border-radius: 6px; animation: badgeFadeIn 0.3s var(--ease-organic) forwards;">
            <h4 style="color: #166534; font-size: 1.05rem; margin-bottom: 0.35rem;">Pedido de Reserva Estruturado</h4>
            <p style="color: #14532d; font-size: 0.85rem; margin-bottom: 0.85rem;">
              Para concluir a confirmação oficial com o anfitrião, escolha o canal pretendido:
            </p>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <a href="${waUrl}" target="_blank" class="btn btn-whatsapp" style="font-size: 0.85rem; padding: 0.45rem 0.8rem;">
                Enviar via WhatsApp (+351 930 583 315)
              </a>
              <a href="${emailUrl}" class="btn btn-dark" style="font-size: 0.85rem; padding: 0.45rem 0.8rem;">
                Enviar por Email Oficial
              </a>
            </div>
            <p style="font-size: 0.75rem; color: #166534; margin-top: 0.75rem; margin-bottom: 0;">
              Transparência: Protótipo demonstrativo sem transações financeiras reais.
            </p>
          </div>
        `;
      }
    });
  }
}

/**
 * 6. Barra Horizontal de Disponibilidade (Homepage)
 * Abre diretamente o modal com os dados pré-preenchidos e cálculo dinâmico de noites.
 */
function initHorizontalBookingBar() {
  const horizontalForm = document.querySelector('.booking-form-horizontal');
  if (!horizontalForm) return;

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 3);

  const formatDate = (d) => d.toISOString().split('T')[0];

  const checkinInput = horizontalForm.querySelector('input[name="checkin"]');
  const checkoutInput = horizontalForm.querySelector('input[name="checkout"]');

  if (checkinInput && !checkinInput.value) checkinInput.value = formatDate(tomorrow);
  if (checkoutInput && !checkoutInput.value) checkoutInput.value = formatDate(dayAfter);

  setupDatesFeedback(checkinInput, checkoutInput, null);

  horizontalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const checkin = checkinInput?.value || '';
    const checkout = checkoutInput?.value || '';
    const guests = horizontalForm.querySelector('select[name="guests"]')?.value || '2 Hóspedes';
    const unit = horizontalForm.querySelector('select[name="unit"]')?.value || 'Qualquer Casinha';

    const params = new URLSearchParams();
    if (checkin) params.set('checkin', checkin);
    if (checkout) params.set('checkout', checkout);
    if (guests) params.set('guests', guests);
    if (unit && unit !== 'Qualquer Casinha') params.set('unit', unit);

    window.location.href = `reservas.html?${params.toString()}`;
  });
}

/**
 * 7. Cópia de Coordenadas GPS com Notificação Fluida
 */
function initGpsCopy() {
  const copyBtn = document.getElementById('copyGpsBtn');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', () => {
    const coords = '39°10\'22.63"N 7°46\'35.11"W';
    navigator.clipboard.writeText(coords).then(() => {
      const origText = copyBtn.textContent;
      copyBtn.textContent = 'Coordenadas Copiadas';
      copyBtn.style.backgroundColor = '#166534';
      copyBtn.style.color = '#ffffff';
      showToast('Coordenadas GPS copiadas: 39°10\'22.63"N 7°46\'35.11"W', 'success');
      setTimeout(() => {
        copyBtn.textContent = origText;
        copyBtn.style.backgroundColor = '';
        copyBtn.style.color = '';
      }, 2500);
    }).catch(() => {
      showToast(`Coordenadas GPS: ${coords}`, 'info');
    });
  });
}

/**
 * 8. Formulário Específico de Dúvidas / Contacto (contactos.html)
 */
function initContactForm() {
  const form = document.getElementById('contactForm') || document.getElementById('questionForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const feedbackBox = document.getElementById('contactFeedback') || document.getElementById('questionFeedback');
    if (feedbackBox) {
      feedbackBox.style.display = 'block';
      feedbackBox.innerHTML = `
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 1.25rem; border-radius: 4px; margin-top: 1rem; animation: badgeFadeIn 0.3s var(--ease-organic) forwards;">
          <h4 style="color: #166534; margin-bottom: 0.25rem;">Mensagem Registada com Sucesso</h4>
          <p style="font-size: 0.9rem; margin: 0; color: #14532d;">
            Obrigado pelo seu contacto. No website em produção, esta mensagem é entregue diretamente no email oficial (geral@casinhasdesantoantonio.pt).
          </p>
        </div>
      `;
      showToast('Mensagem registada com sucesso.', 'success');
      form.reset();
    }
  });
}

/**
 * 9. Toast Notificação Flutuante Discreta (Padrão de UX Elegante)
 */
function showToast(message, type = 'info') {
  let toast = document.getElementById('prototypeToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'prototypeToast';
    toast.className = 'prototype-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `prototype-toast visible toast-${type}`;

  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => {
    toast.classList.remove('visible');
  }, 3200);
}

/**
 * 10. Modais Informativos de Enquadramento Legal (Política de Privacidade & Termos)
 */
function initLegalModal() {
  document.querySelectorAll('.legal-modal-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const type = trigger.getAttribute('data-legal');
      openLegalModal(type);
    });
  });
}

function openLegalModal(type) {
  let modal = document.getElementById('legalModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'legalModal';
    modal.className = 'booking-modal-backdrop';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `
      <div class="booking-modal-content" style="max-width: 580px;">
        <div class="booking-modal-header">
          <div>
            <span class="section-subtitle" style="margin-bottom: 0.2rem;">Enquadramento Legal</span>
            <h3 id="legalModalTitle" style="margin: 0;">Informação</h3>
          </div>
          <button type="button" class="booking-modal-close" id="legalModalClose" aria-label="Fechar Janela">&times;</button>
        </div>
        <div id="legalModalBody" style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6;"></div>
        <div style="margin-top: 1.5rem; text-align: right;">
          <button type="button" class="btn btn-dark" id="legalModalBtnOk" style="padding: 0.5rem 1.25rem;">Fechar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const close = () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    };

    modal.querySelector('#legalModalClose').addEventListener('click', close);
    modal.querySelector('#legalModalBtnOk').addEventListener('click', close);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) close();
    });
  }

  const titleEl = document.getElementById('legalModalTitle');
  const bodyEl = document.getElementById('legalModalBody');

  if (type === 'privacy') {
    titleEl.textContent = 'Política de Privacidade & RGPD';
    bodyEl.innerHTML = `
      <p>Em conformidade com o Regulamento Geral sobre a Proteção de Dados (RGPD), as Casinhas de Santo António garantem o respeito pela privacidade dos seus hóspedes e visitantes:</p>
      <ul style="margin: 0.75rem 0 1rem 1.25rem;">
        <li><strong>Finalidade dos Dados:</strong> Os contactos fornecidos (nome, telefone e email) destinam-se exclusivamente ao esclarecimento de dúvidas e à gestão de pedidos de reserva.</li>
        <li><strong>Sigilo e Não Partilha:</strong> As informações recolhidas não são cedidas, comercializadas ou partilhadas com entidades terceiras.</li>
        <li><strong>Direitos do Titular:</strong> O utilizador pode solicitar a qualquer momento a consulta, alteração ou eliminação dos seus dados através do email oficial <a href="mailto:geral@casinhasdesantoantonio.pt">geral@casinhasdesantoantonio.pt</a>.</li>
      </ul>
      <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">Ambiente de protótipo demonstrativo com salvaguarda estrita de dados.</p>
    `;
  } else {
    titleEl.textContent = 'Termos e Condições';
    bodyEl.innerHTML = `
      <p>Condições gerais aplicáveis às estadias na Quinta de Santo António:</p>
      <ul style="margin: 0.75rem 0 1rem 1.25rem;">
        <li><strong>Check-in & Check-out:</strong> Procedimento personalizado acordado diretamente com o anfitrião no dia anterior à chegada.</li>
        <li><strong>Tarifas & Confirmação:</strong> As tarifas e condições de cancelamento são fornecidas diretamente pelo alojamento sob consulta de disponibilidade.</li>
        <li><strong>Uso Responsável:</strong> Respeito pelo património rural, silêncio da herdade e descanso dos restantes hóspedes.</li>
      </ul>
      <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">Protótipo demonstrativo Bruto AI sem transações financeiras reais.</p>
    `;
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/**
 * 9. Calendário Personalizado de Seleção de Intervalo (Bruto Range Datepicker)
 * Regra 3.8: Seleção Contínua (Check-in e Check-out sequencial em 2 cliques),
 * Paleta da Marca (#a2222e), Pré-visualização ao Hover e Sem Emojis.
 */
function initBrutoCustomDatePicker() {
  let popover = document.getElementById('brutoDatePickerPopover');
  if (!popover) {
    popover = document.createElement('div');
    popover.id = 'brutoDatePickerPopover';
    popover.className = 'bruto-datepicker-popover';
    popover.setAttribute('role', 'dialog');
    popover.setAttribute('aria-label', 'Calendário de Seleção de Estadia');
    popover.innerHTML = `
      <div class="datepicker-header">
        <button type="button" class="datepicker-nav-btn" id="dpPrevBtn" aria-label="Mês Anterior">
          <svg class="icon-svg" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
        </button>
        <span class="datepicker-month-title" id="dpMonthTitle"></span>
        <button type="button" class="datepicker-nav-btn" id="dpNextBtn" aria-label="Mês Seguinte">
          <svg class="icon-svg" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
        </button>
      </div>
      <div class="datepicker-weekdays">
        <span class="datepicker-weekday">Seg</span>
        <span class="datepicker-weekday">Ter</span>
        <span class="datepicker-weekday">Qua</span>
        <span class="datepicker-weekday">Qui</span>
        <span class="datepicker-weekday">Sex</span>
        <span class="datepicker-weekday">Sáb</span>
        <span class="datepicker-weekday">Dom</span>
      </div>
      <div class="datepicker-days" id="dpDaysGrid"></div>
    `;
    document.body.appendChild(popover);
  }

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  let activeCheckinInput = null;
  let activeCheckoutInput = null;
  let currentMonth = new Date();
  currentMonth.setDate(1);

  let selectedCheckin = null;
  let selectedCheckout = null;
  let hoverDate = null;
  let step = 'checkin'; // 'checkin' | 'checkout'

  const monthTitle = document.getElementById('dpMonthTitle');
  const daysGrid = document.getElementById('dpDaysGrid');
  const prevBtn = document.getElementById('dpPrevBtn');
  const nextBtn = document.getElementById('dpNextBtn');

  function formatDateISO(d) {
    if (!d) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function formatDateShort(d) {
    if (!d) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}/${m}`;
  }

  function isSameDay(d1, d2) {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  function isBeforeDay(d1, d2) {
    if (!d1 || !d2) return false;
    const t1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
    const t2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime();
    return t1 < t2;
  }

  function isAfterDay(d1, d2) {
    if (!d1 || !d2) return false;
    const t1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
    const t2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime();
    return t1 > t2;
  }

  function updateDayHighlights() {
    const cells = daysGrid.querySelectorAll('.datepicker-day-cell');
    cells.forEach(cell => {
      const btn = cell.querySelector('.datepicker-day-btn');
      if (!btn || !btn.getAttribute('data-date')) return;
      const cellDate = parseDateFlexible(btn.getAttribute('data-date'));
      if (!cellDate) return;

      cell.classList.remove('is-start', 'is-end', 'is-in-range', 'is-hover-range');

      const isStart = selectedCheckin && isSameDay(cellDate, selectedCheckin);
      const isEnd = selectedCheckout && isSameDay(cellDate, selectedCheckout);

      if (isStart) cell.classList.add('is-start');
      if (isEnd) cell.classList.add('is-end');

      if (selectedCheckin && selectedCheckout) {
        if (isAfterDay(cellDate, selectedCheckin) && isBeforeDay(cellDate, selectedCheckout)) {
          cell.classList.add('is-in-range');
        }
      } else if (selectedCheckin && step === 'checkout' && hoverDate) {
        if (isAfterDay(cellDate, selectedCheckin) && (isBeforeDay(cellDate, hoverDate) || isSameDay(cellDate, hoverDate))) {
          cell.classList.add('is-hover-range');
        }
      }
    });
  }

  function renderCalendar() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    monthTitle.textContent = `${monthNames[month]} ${year}`;

    // Desativar recuo para meses passados
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    prevBtn.disabled = currentMonth <= startOfCurrentMonth;
    prevBtn.style.opacity = prevBtn.disabled ? '0.35' : '1';

    // Primeiro dia da semana (Segunda-feira = 0)
    const firstDayIndex = new Date(year, month, 1).getDay();
    const startOffset = (firstDayIndex + 6) % 7;
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    daysGrid.innerHTML = '';

    // Células vazias de offset
    for (let i = 0; i < startOffset; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'datepicker-day-cell';
      daysGrid.appendChild(emptyCell);
    }

    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Gerar dias do mês
    for (let dayNum = 1; dayNum <= totalDaysInMonth; dayNum++) {
      const cellDate = new Date(year, month, dayNum);
      const isPast = cellDate < todayDate;

      const cell = document.createElement('div');
      cell.className = 'datepicker-day-cell';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'datepicker-day-btn';
      btn.textContent = dayNum;
      btn.setAttribute('data-date', formatDateISO(cellDate));

      if (isPast) {
        btn.disabled = true;
      } else {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          onDateClick(cellDate);
        });

        btn.addEventListener('mouseenter', () => {
          if (step === 'checkout' && selectedCheckin) {
            hoverDate = cellDate;
            updateDayHighlights();
          }
        });
      }

      cell.appendChild(btn);
      daysGrid.appendChild(cell);
    }

    updateDayHighlights();
  }

  function onDateClick(clickedDate) {
    if (step === 'checkin') {
      selectedCheckin = clickedDate;
      selectedCheckout = null;
      hoverDate = null;
      step = 'checkout';

      if (activeCheckinInput) {
        activeCheckinInput.value = formatDateISO(selectedCheckin);
        activeCheckinInput.dispatchEvent(new Event('input', { bubbles: true }));
        activeCheckinInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      updateDayHighlights();
    } else if (step === 'checkout') {
      if (isBeforeDay(clickedDate, selectedCheckin) || isSameDay(clickedDate, selectedCheckin)) {
        selectedCheckin = clickedDate;
        selectedCheckout = null;
        hoverDate = null;
        step = 'checkout';

        if (activeCheckinInput) {
          activeCheckinInput.value = formatDateISO(selectedCheckin);
          activeCheckinInput.dispatchEvent(new Event('input', { bubbles: true }));
          activeCheckinInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        updateDayHighlights();
      } else {
        selectedCheckout = clickedDate;
        step = 'checkin';
        applySelectionToInputs();
        updateDayHighlights();

        setTimeout(() => {
          closePopover();
        }, 200);
      }
    }
  }

  function applySelectionToInputs() {
    if (!selectedCheckin || !selectedCheckout) return;
    if (activeCheckinInput) {
      activeCheckinInput.value = formatDateISO(selectedCheckin);
      activeCheckinInput.dispatchEvent(new Event('input', { bubbles: true }));
      activeCheckinInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (activeCheckoutInput) {
      activeCheckoutInput.value = formatDateISO(selectedCheckout);
      activeCheckoutInput.dispatchEvent(new Event('input', { bubbles: true }));
      activeCheckoutInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  let currentTriggerEl = null;

  function openPicker(checkinInput, checkoutInput, triggerElement) {
    activeCheckinInput = checkinInput;
    activeCheckoutInput = checkoutInput;
    currentTriggerEl = triggerElement || checkinInput;

    const valIn = parseDateFlexible(checkinInput.value);
    const valOut = parseDateFlexible(checkoutInput.value);

    selectedCheckin = valIn || null;
    selectedCheckout = valOut || null;
    step = 'checkin';

    if (selectedCheckin) {
      currentMonth = new Date(selectedCheckin.getFullYear(), selectedCheckin.getMonth(), 1);
    } else {
      currentMonth = new Date();
      currentMonth.setDate(1);
    }

    renderCalendar();
    popover.classList.add('active');
    positionPopover(currentTriggerEl);
  }

  function positionPopover(targetEl) {
    if (!targetEl) return;
    const rect = targetEl.getBoundingClientRect();

    const popoverWidth = popover.offsetWidth || 340;
    const popoverHeight = popover.offsetHeight || 360;

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Espaço disponível no ecrã (acima e abaixo do elemento alvo)
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Quantidade de pixels do calendário visíveis se abrir abaixo vs se abrir acima
    const visibleBelow = Math.max(0, Math.min(popoverHeight, spaceBelow - 8));
    const visibleAbove = Math.max(0, Math.min(popoverHeight, spaceAbove - 8));

    // Abre para cima ou para baixo conforme onde o calendário fica mais visível no ecrã
    const openUpward = visibleAbove > visibleBelow;

    let top;
    if (openUpward) {
      top = rect.top - popoverHeight - 8;
      if (top < 8) top = 8;
      popover.setAttribute('data-placement', 'top');
    } else {
      top = rect.bottom + 8;
      if (top + popoverHeight > viewportHeight - 8) {
        top = Math.max(8, viewportHeight - popoverHeight - 8);
      }
      popover.setAttribute('data-placement', 'bottom');
    }

    let left = rect.left;
    if (left + popoverWidth > viewportWidth - 16) {
      left = Math.max(16, viewportWidth - popoverWidth - 16);
    }
    if (left < 16) {
      left = 16;
    }

    popover.style.top = `${Math.round(top)}px`;
    popover.style.left = `${Math.round(left)}px`;
  }

  function closePopover() {
    popover.classList.remove('active');
    hoverDate = null;
    currentTriggerEl = null;
  }

  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    renderCalendar();
    if (currentTriggerEl) positionPopover(currentTriggerEl);
  });

  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    renderCalendar();
    if (currentTriggerEl) positionPopover(currentTriggerEl);
  });

  // Reposicionar dinamicamente durante scroll ou resize da janela
  window.addEventListener('scroll', () => {
    if (popover.classList.contains('active') && currentTriggerEl) {
      positionPopover(currentTriggerEl);
    }
  }, true);

  window.addEventListener('resize', () => {
    if (popover.classList.contains('active') && currentTriggerEl) {
      positionPopover(currentTriggerEl);
    }
  });

  document.addEventListener('click', (e) => {
    if (!popover.classList.contains('active')) return;
    if (popover.contains(e.target)) return;
    if (activeCheckinInput && (activeCheckinInput.contains(e.target) || activeCheckinInput === e.target)) return;
    if (activeCheckoutInput && (activeCheckoutInput.contains(e.target) || activeCheckoutInput === e.target)) return;
    if (e.target.closest('.date-calendar-btn')) return;
    closePopover();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popover.classList.contains('active')) {
      closePopover();
    }
  });

  function attachPair(checkinId, checkoutId) {
    const inEl = document.getElementById(checkinId);
    const outEl = document.getElementById(checkoutId);
    if (!inEl || !outEl) return;

    const triggerIn = inEl.closest('.date-input-container') || inEl;
    const triggerOut = outEl.closest('.date-input-container') || outEl;

    const inBtn = inEl.parentElement?.querySelector('.date-calendar-btn');
    const outBtn = outEl.parentElement?.querySelector('.date-calendar-btn');

    const handleOpenIn = (e) => {
      e.preventDefault();
      openPicker(inEl, outEl, triggerIn);
    };

    const handleOpenOut = (e) => {
      e.preventDefault();
      openPicker(inEl, outEl, triggerOut);
    };

    inEl.addEventListener('click', handleOpenIn);
    if (inBtn) inBtn.addEventListener('click', handleOpenIn);

    outEl.addEventListener('click', handleOpenOut);
    if (outBtn) outBtn.addEventListener('click', handleOpenOut);
  }

  attachPair('checkin', 'checkout');
  attachPair('modalCheckin', 'modalCheckout');
  attachPair('bookCheckin', 'bookCheckout');
}

/**
 * Transição Dinâmica e Profundidade Tátil nas Secções de Sobreposição da Quinta (Sticky Stacking)
 */
function initQuintaStackingMotion() {
  const sections = document.querySelectorAll('.stacking-section');
  if (!sections || sections.length < 2) return;

  const updateStackDepth = () => {
    const headerOffset = 90;

    sections.forEach((sec, idx) => {
      const nextSec = sections[idx + 1];
      if (!nextSec) {
        sec.classList.remove('is-underneath', 'is-deep-underneath');
        return;
      }

      const nextRect = nextSec.getBoundingClientRect();

      // Quando a próxima secção começa a sobrepor a secção atual
      if (nextRect.top <= headerOffset + 80) {
        const nextNext = sections[idx + 2];
        if (nextNext && nextNext.getBoundingClientRect().top <= headerOffset + 80) {
          sec.classList.add('is-deep-underneath');
          sec.classList.remove('is-underneath');
        } else {
          sec.classList.add('is-underneath');
          sec.classList.remove('is-deep-underneath');
        }
      } else {
        sec.classList.remove('is-underneath', 'is-deep-underneath');
      }
    });
  };

  window.addEventListener('scroll', updateStackDepth, { passive: true });
  window.addEventListener('resize', updateStackDepth, { passive: true });
  updateStackDepth();
}

/**
 * Hotspots Interativos e Card Flutuante na Vista Aérea da Herdade
 * Inspirado na imagem de referência da quinta: Pins circulares numerados e Card flutuante
 */
function initAerialHotspots() {
  const pins = document.querySelectorAll('.aerial-pin');
  const card = document.getElementById('aerialSpotCard');
  if (!pins.length || !card) return;

  const cardImg = document.getElementById('aerialCardImg');
  const cardTag = document.getElementById('aerialCardTag');
  const cardTitle = document.getElementById('aerialCardTitle');
  const cardDesc = document.getElementById('aerialCardDesc');
  const cardPills = document.getElementById('aerialCardPills');
  const cardCta = document.getElementById('aerialCardCta');
  const closeBtn = document.getElementById('aerialCardClose');

  const SPOTS_DATA = {
    '1': {
      title: 'Piscina da Herdade',
      desc: 'Piscina exterior e solário integrados na tranquilidade alentejana com vista aberta sobre o olival.',
      img: 'assets/images/accommodation_50.jpg',
      pills: [
        'Acesso livre para todos os hóspedes',
        'Solário calmo com vista para o olival'
      ]
    },
    '2': {
      title: 'Casinhas Tradicionais',
      desc: 'Unidades rústicas independentes para descanso pleno, com privacidade e terraço virado para o campo.',
      img: 'assets/images/accommodation_14.jpg',
      pills: [
        'Pão fresco matinal entregue à porta',
        'Terraço e kitchenette privativos'
      ]
    },
    '3': {
      title: 'Olival & Produção de Azeite',
      desc: 'Mais de 50 hectares de olival tradicional onde se produz o azeite virgem extra da quinta.',
      img: 'assets/images/farm_65.jpg',
      pills: [
        'Azeite virgem extra da herdade incluído',
        'Passeios tranquilos entre as oliveiras'
      ]
    },
    '4': {
      title: 'Estacionamento Privado & Coberto',
      desc: 'Área de estacionamento coberto e privativo dentro da herdade, garantindo conveniência, proteção solar e acesso seguro aos alojamentos.',
      img: 'assets/images/estacionamento_coberto.jpg',
      pills: [
        'Estacionamento coberto gratuito no local',
        'Acesso direto e seguro aos alojamentos'
      ]
    }
  };

  // Garante que nenhum card abre sozinho no arranque (respeito à vontade do utilizador)
  card.classList.remove('active');
  pins.forEach(p => p.classList.remove('active'));

  let hideTimeout = null;
  let activeSpotId = null;

  function selectSpot(spotId) {
    if (hideTimeout) clearTimeout(hideTimeout);
    activeSpotId = spotId;

    const data = SPOTS_DATA[spotId];
    if (!data) return;

    // Atualizar pins ativos
    pins.forEach(pin => {
      const isCurrent = pin.getAttribute('data-spot') === spotId;
      pin.classList.toggle('active', isCurrent);
    });

    // Atualizar conteúdo do card
    if (cardImg) {
      cardImg.src = data.img;
      cardImg.alt = data.title;
    }
    if (cardTitle) cardTitle.textContent = data.title;
    if (cardDesc) cardDesc.textContent = data.desc;

    if (cardPills) {
      cardPills.innerHTML = data.pills.map(text => `
        <div class="aerial-card-pill">
          <svg class="icon-svg" style="fill: var(--primary-accent); width: 0.8rem; height: 0.8rem;" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          <span>${text}</span>
        </div>
      `).join('');
    }

    // Mostrar card
    card.classList.add('active');
  }

  function hideCard() {
    card.classList.remove('active');
    pins.forEach(p => p.classList.remove('active'));
    activeSpotId = null;
  }

  function scheduleHide() {
    hideTimeout = setTimeout(() => {
      hideCard();
    }, 220);
  }

  // Interação idêntica ao projeto Gavião Nature Village:
  // MouseEnter ativa imediatamente, MouseLeave agenda fecho com tolerância de 220ms,
  // Card mantém-se aberto ao entrar com o rato, e clique fixa/seleciona o ponto.
  pins.forEach(pin => {
    const spotId = pin.getAttribute('data-spot');
    if (!spotId) return;

    pin.addEventListener('mouseenter', () => {
      selectSpot(spotId);
    });

    pin.addEventListener('mouseleave', () => {
      scheduleHide();
    });

    pin.addEventListener('click', (e) => {
      e.stopPropagation();
      selectSpot(spotId);
    });
  });

  // Manter card aberto se o cursor passar para dentro dele
  card.addEventListener('mouseenter', () => {
    if (hideTimeout) clearTimeout(hideTimeout);
  });

  card.addEventListener('mouseleave', () => {
    scheduleHide();
  });

  const mapFrame = document.getElementById('aerialMapFrame');
  if (mapFrame) {
    mapFrame.addEventListener('click', (e) => {
      if (!e.target.closest('.aerial-pin') && !e.target.closest('.aerial-spot-card')) {
        hideCard();
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      hideCard();
    });
  }

  document.addEventListener('click', (e) => {
    if (mapFrame && !mapFrame.contains(e.target)) {
      hideCard();
    }
  });
}

/**
 * 11. Acordeão de Perguntas Frequentes (FAQ)
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => {
        i.classList.remove('active');
        i.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
      });
      if (!isActive) {
        item.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/**
 * 12. Formulário de Dúvidas Diretas (Homepage)
 */
function initDuvidasForm() {
  const form = document.getElementById('duvidasForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const resultBox = document.getElementById('duvidasResultBox');
    const nome = document.getElementById('duvidaNome')?.value || 'Visitante';

    if (resultBox) {
      resultBox.style.display = 'block';
      resultBox.style.backgroundColor = '#f0fdf4';
      resultBox.style.border = '1px solid #bbf7d0';
      resultBox.style.color = '#166534';
      resultBox.innerHTML = `
        <strong>Dúvida registada com sucesso!</strong><br>
        Obrigado, ${nome}. A gerência das Casinhas de Santo António responderá com a maior brevidade.
      `;
    }
    showToast('A sua dúvida foi registada com sucesso.', 'success');
    form.reset();
  });
}

/**
 * 13. Experiência Dedicada de Reservas Online (reservas.html)
 */
function initDedicatedBookingPage() {
  const form = document.getElementById('dedicatedBookingForm');
  if (!form) return;

  const urlParams = new URLSearchParams(window.location.search);
  const paramCheckin = urlParams.get('checkin');
  const paramCheckout = urlParams.get('checkout');
  const paramGuests = urlParams.get('guests');

  const checkinInput = document.getElementById('bookCheckin');
  const checkoutInput = document.getElementById('bookCheckout');
  const guestsSelect = document.getElementById('bookGuests');
  const nameInput = document.getElementById('bookName');
  const emailInput = document.getElementById('bookEmail');
  const phoneInput = document.getElementById('bookPhone');

  const summaryUnitName = document.getElementById('summaryUnitName');
  const summaryUnitThumb = document.getElementById('summaryUnitThumb');
  const summaryCheckin = document.getElementById('summaryCheckin');
  const summaryCheckout = document.getElementById('summaryCheckout');
  const summaryNights = document.getElementById('summaryNights');
  const summaryGuests = document.getElementById('summaryGuests');
  const summaryRateType = document.getElementById('summaryRateType');
  const summaryBreakfast = document.getElementById('summaryBreakfast');
  const summaryPaymentMethod = document.getElementById('summaryPaymentMethod');

  // Pricing calculation elements
  const rateNonRefDisplay = document.getElementById('rateNonRefDisplay');
  const rateRefDisplay = document.getElementById('rateRefDisplay');
  const calcNightlyRate = document.getElementById('calcNightlyRate');
  const calcNightsCount = document.getElementById('calcNightsCount');
  const calcLodgingSubtotal = document.getElementById('calcLodgingSubtotal');
  const calcBreakfastRow = document.getElementById('calcBreakfastRow');
  const calcBreakfastCount = document.getElementById('calcBreakfastCount');
  const calcBreakfastNights = document.getElementById('calcBreakfastNights');
  const calcBreakfastSubtotal = document.getElementById('calcBreakfastSubtotal');
  const summaryTotalPrice = document.getElementById('summaryTotalPrice');
  const btnTotalPrice = document.getElementById('btnTotalPrice');

  // Pre-fill from query params
  if (paramCheckin && checkinInput) checkinInput.value = paramCheckin;
  if (paramCheckout && checkoutInput) checkoutInput.value = paramCheckout;
  if (paramGuests && guestsSelect) {
    for (let opt of guestsSelect.options) {
      if (opt.value.includes(paramGuests) || paramGuests.includes(opt.value)) {
        opt.selected = true;
        break;
      }
    }
  }

  // Tabela de Preços fakes baseada na imagem real do Booking.com
  const GUEST_RATES = {
    '1': { nonRef: 98, ref: 102 },
    '2': { nonRef: 108, ref: 112 },
    '3': { nonRef: 135, ref: 140 },
    '4': { nonRef: 146, ref: 152 },
  };

  const fmtEur = (n) => '€' + n.toFixed(2).replace('.', ',');

  function updateBookingCalculation() {
    const cin = checkinInput?.value || '';
    const cout = checkoutInput?.value || '';
    if (summaryCheckin) summaryCheckin.textContent = cin || 'Não selecionado';
    if (summaryCheckout) summaryCheckout.textContent = cout || 'Não selecionado';

    let nights = 1;
    let hasValidDates = false;
    if (cin && cout) {
      const d1 = parseDateFlexible(cin);
      const d2 = parseDateFlexible(cout);
      if (d1 && d2 && d2 > d1) {
        nights = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
        hasValidDates = true;
      }
    }

    if (summaryNights) {
      summaryNights.textContent = hasValidDates 
        ? (nights === 1 ? '1 noite' : `${nights} noites`)
        : '— noites';
    }

    // Obter número de hóspedes
    const guestsVal = guestsSelect ? guestsSelect.value : '2 Hóspedes';
    const guestMatch = guestsVal.match(/\d+/);
    const guestNum = guestMatch ? parseInt(guestMatch[0], 10) : 2;
    if (summaryGuests) summaryGuests.textContent = guestsVal;

    // Obter tarifas por noite
    const rateInfo = GUEST_RATES[String(guestNum)] || GUEST_RATES['2'];
    if (rateNonRefDisplay) rateNonRefDisplay.textContent = '€' + rateInfo.nonRef;
    if (rateRefDisplay) rateRefDisplay.textContent = '€' + rateInfo.ref;

    // Tarifa selecionada
    const rateRadio = document.querySelector('input[name="rateOption"]:checked');
    const isRefundable = rateRadio ? rateRadio.value === 'refundable' : false;
    const nightlyPrice = isRefundable ? rateInfo.ref : rateInfo.nonRef;
    const rateTypeName = isRefundable ? 'Totalmente Reembolsável' : 'Não Reembolsável';

    if (summaryRateType) summaryRateType.textContent = rateTypeName;
    if (calcNightlyRate) calcNightlyRate.textContent = '€' + nightlyPrice;
    if (calcNightsCount) calcNightsCount.textContent = nights;

    const lodgingSubtotal = nightlyPrice * nights;
    if (calcLodgingSubtotal) calcLodgingSubtotal.textContent = fmtEur(lodgingSubtotal);

    // Pequeno-almoço selecionado
    const bkRadio = document.querySelector('input[name="breakfastOption"]:checked');
    const hasExtraBreakfast = bkRadio ? bkRadio.value === 'extra' : false;
    const breakfastPricePerPersonDay = 12.50;
    const breakfastSubtotal = hasExtraBreakfast ? (breakfastPricePerPersonDay * guestNum * nights) : 0;

    if (summaryBreakfast) {
      summaryBreakfast.textContent = hasExtraBreakfast 
        ? 'Menu Encomenda (+€12,50/p)'
        : 'Apenas Alojamento (€0)';
    }

    if (calcBreakfastRow) {
      calcBreakfastRow.style.display = hasExtraBreakfast ? 'flex' : 'none';
      if (calcBreakfastCount) calcBreakfastCount.textContent = guestNum;
      if (calcBreakfastNights) calcBreakfastNights.textContent = nights;
      if (calcBreakfastSubtotal) calcBreakfastSubtotal.textContent = fmtEur(breakfastSubtotal);
    }

    // Preço Total
    const grandTotal = lodgingSubtotal + breakfastSubtotal;
    const formattedTotal = fmtEur(grandTotal);

    if (summaryTotalPrice) summaryTotalPrice.textContent = formattedTotal;
    if (btnTotalPrice) btnTotalPrice.textContent = formattedTotal;
  }

  // Rate card selection
  const rateCards = document.querySelectorAll('.rate-card');
  rateCards.forEach(card => {
    card.addEventListener('click', () => {
      rateCards.forEach(c => {
        c.classList.remove('selected');
        c.style.borderColor = 'var(--border-color)';
        c.style.borderWidth = '1px';
        const r = c.querySelector('input[type="radio"]');
        if (r) r.checked = false;
      });
      card.classList.add('selected');
      card.style.borderColor = 'var(--primary-accent)';
      card.style.borderWidth = '2px';
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      updateBookingCalculation();
    });
  });

  // Breakfast card selection
  const breakfastCards = document.querySelectorAll('.breakfast-card');
  breakfastCards.forEach(card => {
    card.addEventListener('click', () => {
      breakfastCards.forEach(c => {
        c.classList.remove('selected');
        c.style.borderColor = 'var(--border-color)';
        c.style.borderWidth = '1px';
        const r = c.querySelector('input[type="radio"]');
        if (r) r.checked = false;
      });
      card.classList.add('selected');
      card.style.borderColor = 'var(--primary-accent)';
      card.style.borderWidth = '2px';
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      updateBookingCalculation();
    });
  });

  if (checkinInput) {
    checkinInput.addEventListener('input', updateBookingCalculation);
    checkinInput.addEventListener('change', updateBookingCalculation);
  }
  if (checkoutInput) {
    checkoutInput.addEventListener('input', updateBookingCalculation);
    checkoutInput.addEventListener('change', updateBookingCalculation);
  }
  if (guestsSelect) {
    guestsSelect.addEventListener('change', updateBookingCalculation);
  }

  // Payment methods selection & fields switching
  const paymentCards = document.querySelectorAll('.payment-method-card');
  const paymentFieldsCard = document.getElementById('paymentFieldsCard');
  const paymentFieldsMbway = document.getElementById('paymentFieldsMbway');
  const paymentFieldsMultibanco = document.getElementById('paymentFieldsMultibanco');

  function updatePaymentMethod() {
    const selectedPay = document.querySelector('.payment-method-card.selected input[type="radio"]:checked') ||
                        document.querySelector('.payment-method-card input[type="radio"]:checked');
    const val = selectedPay ? selectedPay.value : 'Cartão de Crédito/Débito';
    const cardEl = selectedPay ? selectedPay.closest('.payment-method-card') : null;
    const methodType = cardEl ? cardEl.getAttribute('data-method') : 'card';

    if (summaryPaymentMethod) {
      if (methodType === 'card') summaryPaymentMethod.textContent = 'Cartão';
      else if (methodType === 'mbway') summaryPaymentMethod.textContent = 'MB WAY';
      else if (methodType === 'multibanco') summaryPaymentMethod.textContent = 'Multibanco';
      else summaryPaymentMethod.textContent = val;
    }

    if (paymentFieldsCard) paymentFieldsCard.style.display = methodType === 'card' ? 'block' : 'none';
    if (paymentFieldsMbway) paymentFieldsMbway.style.display = methodType === 'mbway' ? 'block' : 'none';
    if (paymentFieldsMultibanco) paymentFieldsMultibanco.style.display = methodType === 'multibanco' ? 'block' : 'none';
  }

  paymentCards.forEach(card => {
    card.addEventListener('click', () => {
      paymentCards.forEach(c => {
        c.classList.remove('selected');
        const r = c.querySelector('input[type="radio"]');
        if (r) r.checked = false;
      });
      card.classList.add('selected');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      updatePaymentMethod();
    });
  });

  updateBookingCalculation();
  updatePaymentMethod();

  // Toggle e gestão de dados de faturação (NIF e Morada)
  const invoiceToggle = document.getElementById('toggleInvoiceFields');
  const invoiceFieldsCollapse = document.getElementById('invoiceFieldsCollapse');
  const invoiceNifInput = document.getElementById('invoiceNif');
  const invoiceNameInput = document.getElementById('invoiceName');
  const invoiceAddressInput = document.getElementById('invoiceAddress');
  const invoicePostalInput = document.getElementById('invoicePostal');
  const invoiceCityInput = document.getElementById('invoiceCity');
  const invoiceCountrySelect = document.getElementById('invoiceCountry');

  if (invoiceToggle && invoiceFieldsCollapse) {
    invoiceToggle.addEventListener('change', () => {
      const isChecked = invoiceToggle.checked;
      invoiceFieldsCollapse.style.display = isChecked ? 'block' : 'none';
      if (isChecked && invoiceNameInput && !invoiceNameInput.value && nameInput && nameInput.value) {
        invoiceNameInput.value = nameInput.value;
      }
    });
  }

  // Submission handler -> Show Modal with instant confirmation and receipt
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const unitName = 'Casa com 2 Quartos (65 m²)';
    const cin = checkinInput?.value || 'Data a definir';
    const cout = checkoutInput?.value || 'Data a definir';
    const guests = guestsSelect?.value || '2 Hóspedes';
    const name = nameInput?.value || 'Hóspede';
    const email = emailInput?.value || '';
    const phone = phoneInput?.value || '';
    const notes = document.getElementById('bookNotes')?.value || '';

    // Tarifa e pequeno-almoço
    const rateRadio = document.querySelector('input[name="rateOption"]:checked');
    const isRefundable = rateRadio ? rateRadio.value === 'refundable' : false;
    const rateTypeName = isRefundable ? 'Totalmente Reembolsável' : 'Não Reembolsável';

    const bkRadio = document.querySelector('input[name="breakfastOption"]:checked');
    const hasExtraBreakfast = bkRadio ? bkRadio.value === 'extra' : false;
    const breakfastTypeName = hasExtraBreakfast ? 'Com Menu Pequeno-Almoço/Brunch (+€12,50/p)' : 'Apenas Alojamento (€0)';

    const totalStr = summaryTotalPrice?.textContent || '€108,00';

    // Dados de faturação se ativados
    const wantInvoice = invoiceToggle && invoiceToggle.checked;
    const invNif = wantInvoice ? (invoiceNifInput?.value || '').trim() : '';
    const invName = wantInvoice ? (invoiceNameInput?.value || name).trim() : '';
    const invAddress = wantInvoice ? (invoiceAddressInput?.value || '').trim() : '';
    const invPostal = wantInvoice ? (invoicePostalInput?.value || '').trim() : '';
    const invCity = wantInvoice ? (invoiceCityInput?.value || '').trim() : '';
    const invCountry = wantInvoice ? (invoiceCountrySelect?.value || 'Portugal') : '';
    const hasBilling = wantInvoice && invNif;

    const selectedPay = document.querySelector('.payment-method-card input[type="radio"]:checked');
    const payMethodName = selectedPay ? selectedPay.value : 'Cartão de Crédito/Débito';

    let nightsStr = '1 noite';
    const d1 = parseDateFlexible(cin);
    const d2 = parseDateFlexible(cout);
    if (d1 && d2 && d2 > d1) {
      const n = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
      nightsStr = n === 1 ? '1 noite' : `${n} noites`;
    }

    const modal = document.getElementById('bookingSuccessModal');
    if (modal) {
      const resUnit = document.getElementById('modalResUnit');
      const resDates = document.getElementById('modalResDates');
      const resNights = document.getElementById('modalResNights');
      const resName = document.getElementById('modalResName');
      const resGuests = document.getElementById('modalResGuests');
      const resContact = document.getElementById('modalResContact');
      const resPayment = document.getElementById('modalResPayment');
      const resRate = document.getElementById('modalResRate');
      const resTotal = document.getElementById('modalResTotal');
      const resBillingRow = document.getElementById('modalResBillingRow');
      const resBilling = document.getElementById('modalResBilling');

      if (resUnit) resUnit.textContent = unitName;
      if (resDates) resDates.textContent = `${cin} a ${cout}`;
      if (resNights) resNights.textContent = nightsStr;
      if (resName) resName.textContent = name;
      if (resGuests) resGuests.textContent = guests;
      if (resRate) resRate.textContent = `${rateTypeName} • ${breakfastTypeName}`;
      if (resTotal) resTotal.textContent = totalStr;
      if (resContact) resContact.textContent = `${email} • ${phone}`;
      if (resPayment) resPayment.textContent = payMethodName;

      if (resBillingRow && resBilling) {
        if (hasBilling) {
          resBillingRow.style.display = 'block';
          const billingLocation = [invAddress, invPostal, invCity].filter(Boolean).join(', ');
          resBilling.textContent = `NIF ${invNif}${invName !== name ? ` (${invName})` : ''}${billingLocation ? ` — ${billingLocation}` : ''}`;
        } else {
          resBillingRow.style.display = 'none';
        }
      }

      const billingWaText = hasBilling
        ? `• Faturação: NIF ${invNif}${invName ? ` (${invName})` : ''}${invAddress ? `, ${invAddress} ${invPostal} ${invCity}` : ''}\n`
        : '';

      const waMsg = encodeURIComponent(
        `Olá! Concluí o pagamento e a reserva da minha estadia nas Casinhas de Santo António:\n` +
        `• Alojamento: ${unitName}\n` +
        `• Entrada: ${cin}\n` +
        `• Saída: ${cout} (${nightsStr})\n` +
        `• Hóspedes: ${guests}\n` +
        `• Tarifa: ${rateTypeName}\n` +
        `• Pequeno-Almoço: ${breakfastTypeName}\n` +
        `• Preço Total: ${totalStr} (Liquidado no momento)\n` +
        `• Titular: ${name}\n` +
        `• Pagamento: ${payMethodName}\n` +
        billingWaText +
        (notes ? `• Observações: ${notes}\n` : '') +
        `\nSegue o meu contacto para envio das instruções de check-in contactless.`
      );
      const waLink = document.getElementById('modalWhatsAppLink');
      if (waLink) waLink.href = `https://wa.me/351930583315?text=${waMsg}`;

      const billingEmailText = hasBilling
        ? `• Dados de Faturação:\n  - NIF: ${invNif}\n  - Nome Fiscal: ${invName}\n  - Morada: ${invAddress}\n  - Código Postal / Localidade: ${invPostal} ${invCity} (${invCountry})\n`
        : '';

      const emailSubj = encodeURIComponent(`Comprovativo de Reserva e Pagamento — ${unitName} (${cin} a ${cout})`);
      const emailBody = encodeURIComponent(
        `Exmos. Senhores Casinhas de Santo António,\n\n` +
        `Concluí com sucesso o pagamento da reserva para a estadia na vossa herdade:\n` +
        `• Alojamento: ${unitName}\n` +
        `• Check-in: ${cin}\n` +
        `• Check-out: ${cout} (${nightsStr})\n` +
        `• Hóspedes: ${guests}\n` +
        `• Tarifa: ${rateTypeName}\n` +
        `• Pequeno-Almoço: ${breakfastTypeName}\n` +
        `• Valor Total: ${totalStr} (Liquidado no momento)\n` +
        `• Titular: ${name}\n` +
        `• Contacto: ${phone}\n` +
        `• Método de Pagamento: ${payMethodName} (Confirmado)\n` +
        billingEmailText +
        (notes ? `• Observações: ${notes}\n\n` : '\n') +
        `Aguardo os códigos de acesso à casinha na véspera da chegada.\nCom os melhores cumprimentos,\n${name}`
      );
      const mailLink = document.getElementById('modalEmailLink');
      if (mailLink) mailLink.href = `mailto:geral@casinhasdesantoantonio.pt?subject=${emailSubj}&body=${emailBody}`;

      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  });

  const closeModal = () => {
    const modal = document.getElementById('bookingSuccessModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  document.getElementById('successModalCloseBtn')?.addEventListener('click', closeModal);
  document.getElementById('modalCloseReviewBtn')?.addEventListener('click', closeModal);
  document.getElementById('bookingSuccessModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'bookingSuccessModal') closeModal();
  });
}

/**
 * 14. Catálogo Interativo de Casinhas (Acordeão Expansível Estilo Hotel Odisej)
 * Ao clicar no cabeçalho da linha, desdobra as informações detalhadas e galeria
 */
function initRoomsAccordion() {
  const items = document.querySelectorAll('.room-accordion-item');
  if (!items.length) return;

  items.forEach(item => {
    const header = item.querySelector('.room-accordion-header');
    if (!header) return;

    header.addEventListener('click', () => {
      const isAlreadyActive = item.classList.contains('active');

      // Fecha as outras casinhas abertas
      items.forEach(other => {
        if (other !== item) {
          other.classList.remove('active');
          other.querySelector('.room-accordion-header')?.setAttribute('aria-expanded', 'false');
        }
      });

      if (isAlreadyActive) {
        item.classList.remove('active');
        header.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('active');
        header.setAttribute('aria-expanded', 'true');

        // Scroll suave se o topo da casinha expandida estiver fora de vista
        setTimeout(() => {
          const rect = item.getBoundingClientRect();
          if (rect.top < 80) {
            window.scrollBy({ top: rect.top - 90, behavior: 'smooth' });
          }
        }, 150);
      }
    });

    // Acessibilidade por teclado
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        header.click();
      }
    });
  });
}

/**
 * 15. Carrossel / Ticker Interativo de Opiniões dos Hóspedes
 * Suporta rotação automática contínua em loop infinito, arrastar com rato/touch,
 * pausa ao ler (hover) e botões Anterior / Seguinte para controlo manual preciso.
 */
function initReviewsInteractiveScroll() {
  const wrapper = document.querySelector('.reviews-ticker-wrapper');
  const track = document.querySelector('.reviews-ticker-track');
  if (!wrapper || !track) return;

  const prevBtn = document.getElementById('reviewsPrevBtn');
  const nextBtn = document.getElementById('reviewsNextBtn');

  let offset = 0;
  const speed = 0.5; // pixels por frame (~30px por segundo a 60fps)
  let isHovered = false;
  let isDragging = false;
  let isAnimatingStep = false;
  let startX = 0;
  let dragStartOffset = 0;
  let resumeTimeout = null;
  let rafId = null;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Helper para obter metade da largura do track (duplicação para loop infinito)
  function getHalfWidth() {
    return track.scrollWidth / 2;
  }

  // Helper para calcular a distância de 1 cartão (largura + gap)
  function getCardStep() {
    const cards = track.querySelectorAll('.review-card');
    if (cards.length >= 2) {
      const rect0 = cards[0].getBoundingClientRect();
      const rect1 = cards[1].getBoundingClientRect();
      const step = Math.abs(rect1.left - rect0.left);
      if (step > 50) return step;
    }
    return 430; // fallback padrão (380px card + 50px gap)
  }

  // Normaliza o offset dentro de [0, halfWidth)
  function normalizeOffset(val) {
    const half = getHalfWidth();
    if (half <= 0) return 0;
    let norm = val % half;
    if (norm < 0) norm += half;
    return norm;
  }

  // Atualiza a posição visual no DOM
  function updateTransform() {
    track.style.transform = `translate3d(${-offset}px, 0, 0)`;
  }

  // Loop de Animação Contínua (RAF)
  function tick() {
    if (!isDragging && !isHovered && !isAnimatingStep && !prefersReducedMotion) {
      offset += speed;
      const half = getHalfWidth();
      if (half > 0 && offset >= half) {
        offset %= half;
      }
      updateTransform();
    }
    rafId = requestAnimationFrame(tick);
  }

  rafId = requestAnimationFrame(tick);

  // Pausa ao passar o rato por cima (para permitir ler a opinião com conforto)
  wrapper.addEventListener('mouseenter', () => {
    isHovered = true;
    if (resumeTimeout) clearTimeout(resumeTimeout);
  });

  wrapper.addEventListener('mouseleave', () => {
    if (!isDragging && !isAnimatingStep) {
      isHovered = false;
    }
  });

  // Interação de Arrastar (Pointer Events — Rato e Touch)
  wrapper.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;

    isDragging = true;
    startX = e.clientX;
    dragStartOffset = offset;
    wrapper.classList.add('is-dragging');
    try {
      wrapper.setPointerCapture(e.pointerId);
    } catch (_) {}

    if (resumeTimeout) clearTimeout(resumeTimeout);
  });

  wrapper.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    offset = normalizeOffset(dragStartOffset - dx);
    updateTransform();
  });

  function endDrag(e) {
    if (!isDragging) return;
    isDragging = false;
    wrapper.classList.remove('is-dragging');
    try {
      if (wrapper.hasPointerCapture(e.pointerId)) {
        wrapper.releasePointerCapture(e.pointerId);
      }
    } catch (_) {}

    // Pausa temporária após arrastar antes de retomar a rotação automática suave
    isHovered = true;
    if (resumeTimeout) clearTimeout(resumeTimeout);
    resumeTimeout = setTimeout(() => {
      isHovered = false;
    }, 2500);
  }

  wrapper.addEventListener('pointerup', endDrag);
  wrapper.addEventListener('pointercancel', endDrag);

  // Animação suave para saltar de cartão (Prev / Next)
  function smoothShift(delta, duration = 480) {
    if (isAnimatingStep) return;
    isAnimatingStep = true;
    if (resumeTimeout) clearTimeout(resumeTimeout);

    const start = offset;
    const target = start + delta;
    const startTime = performance.now();

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      offset = normalizeOffset(start + (target - start) * eased);
      updateTransform();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        isAnimatingStep = false;
        resumeTimeout = setTimeout(() => {
          isHovered = false;
        }, 3000);
      }
    }

    isHovered = true;
    requestAnimationFrame(animate);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      smoothShift(-getCardStep());
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      smoothShift(getCardStep());
    });
  }
}

/**
 * 16. Seletor de Categorias e Navegação por Setas de Atividades
 * Suporta paginação fluida no modo "Todos" com setas laterais e indicador de página,
 * e filtragem direta nas categorias específicas (Percursos, Monumentos, Atividades, Restaurantes).
 */
function initActivitiesTabs() {
  const tabBtns = document.querySelectorAll('.activity-tab-btn');
  const cards = Array.from(document.querySelectorAll('.activities-grid .activity-card'));
  const prevBtn = document.getElementById('activityPrevBtn');
  const nextBtn = document.getElementById('activityNextBtn');
  const pagination = document.getElementById('activitiesPagination');
  const pageDots = document.querySelectorAll('.activity-page-dot');

  if (!tabBtns.length || !cards.length) return;

  let currentCategory = 'todos';
  let currentPage = 0;
  const pageSize = 4;

  function updateActivitiesDisplay() {
    if (currentCategory === 'todos') {
      if (prevBtn) prevBtn.style.display = 'flex';
      if (nextBtn) nextBtn.style.display = 'flex';
      if (pagination) pagination.style.display = 'flex';

      pageDots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentPage);
        dot.setAttribute('aria-current', idx === currentPage ? 'true' : 'false');
      });

      if (prevBtn) prevBtn.classList.toggle('disabled', currentPage === 0);
      if (nextBtn) nextBtn.classList.toggle('disabled', currentPage === 1);

      const startIndex = currentPage * pageSize;
      const endIndex = startIndex + pageSize;

      cards.forEach((card, idx) => {
        if (idx >= startIndex && idx < endIndex) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          card.style.transform = 'translateY(6px)';
          requestAnimationFrame(() => {
            card.style.transition = 'opacity 0.22s cubic-bezier(0.22, 1, 0.36, 1), transform 0.22s cubic-bezier(0.22, 1, 0.36, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
        } else {
          card.style.display = 'none';
        }
      });
    } else {
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      if (pagination) pagination.style.display = 'none';

      cards.forEach(card => {
        const cats = (card.getAttribute('data-categories') || '').split(' ');
        const matches = cats.includes(currentCategory);
        if (matches) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          card.style.transform = 'translateY(6px)';
          requestAnimationFrame(() => {
            card.style.transition = 'opacity 0.22s cubic-bezier(0.22, 1, 0.36, 1), transform 0.22s cubic-bezier(0.22, 1, 0.36, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
        } else {
          card.style.display = 'none';
        }
      });
    }
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.getAttribute('data-category');
      currentPage = 0;

      tabBtns.forEach(b => {
        const isActive = b === btn;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      updateActivitiesDisplay();
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 0) {
        currentPage--;
        updateActivitiesDisplay();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentPage < 1) {
        currentPage++;
        updateActivitiesDisplay();
      }
    });
  }

  pageDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const p = parseInt(dot.getAttribute('data-page'), 10);
      if (!isNaN(p) && p !== currentPage) {
        currentPage = p;
        updateActivitiesDisplay();
      }
    });
  });

  updateActivitiesDisplay();
}

/**
 * Galeria Rotativa e Interativa da Quinta (Loop Automático & Arrastar com Rato / Touch)
 * - 8 Imagens autênticas da herdade e alojamentos
 * - Loop infinito contínuo e suave via requestAnimationFrame
 * - Interatividade completa: clicar e arrastar (drag & swipe) com física suave
 * - Pausa em hover/drag e retoma automática
 */
function setupSingleContinuousCarousel(carouselId, trackId) {
  const carousel = document.getElementById(carouselId);
  const track = document.getElementById(trackId);
  if (!carousel || !track) return;

  const originalSlides = Array.from(track.children);
  if (originalSlides.length === 0) return;

  originalSlides.forEach(slide => {
    const clone = slide.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });

  let singleSetWidth = 0;
  function measureTrack() {
    let width = 0;
    const gap = parseFloat(window.getComputedStyle(track).gap) || 20;
    originalSlides.forEach(slide => {
      width += slide.offsetWidth + gap;
    });
    singleSetWidth = width;
  }

  measureTrack();
  window.addEventListener('resize', measureTrack, { passive: true });

  let offset = 0;
  const speed = 0.55;
  let isHovered = false;
  let isDragging = false;
  let startX = 0;
  let dragStartOffset = 0;
  let lastX = 0;
  let velocity = 0;

  function loop() {
    if (!isDragging) {
      if (Math.abs(velocity) > 0.05) {
        offset -= velocity;
        velocity *= 0.94;
      } else if (!isHovered) {
        offset -= speed;
      }
    }

    if (singleSetWidth > 0) {
      while (offset <= -singleSetWidth) {
        offset += singleSetWidth;
      }
      while (offset > 0) {
        offset -= singleSetWidth;
      }
    }

    track.style.transform = `translate3d(${offset}px, 0, 0)`;
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);

  carousel.addEventListener('mouseenter', () => { isHovered = true; });
  carousel.addEventListener('mouseleave', () => {
    isHovered = false;
    if (isDragging) {
      isDragging = false;
      carousel.classList.remove('is-dragging');
    }
  });

  carousel.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    isDragging = true;
    startX = e.clientX;
    lastX = e.clientX;
    dragStartOffset = offset;
    velocity = 0;
    carousel.classList.add('is-dragging');
    if (carousel.setPointerCapture) {
      try { carousel.setPointerCapture(e.pointerId); } catch (err) {}
    }
  });

  carousel.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const currentX = e.clientX;
    const deltaX = currentX - startX;
    velocity = currentX - lastX;
    lastX = currentX;
    offset = dragStartOffset + deltaX;

    if (singleSetWidth > 0) {
      while (offset <= -singleSetWidth) {
        offset += singleSetWidth;
        dragStartOffset += singleSetWidth;
      }
      while (offset > 0) {
        offset -= singleSetWidth;
        dragStartOffset -= singleSetWidth;
      }
    }

    track.style.transform = `translate3d(${offset}px, 0, 0)`;
  });

  const stopDrag = (e) => {
    if (!isDragging) return;
    isDragging = false;
    carousel.classList.remove('is-dragging');
    if (e && carousel.releasePointerCapture && e.pointerId) {
      try { carousel.releasePointerCapture(e.pointerId); } catch (err) {}
    }
  };

  carousel.addEventListener('pointerup', stopDrag);
  carousel.addEventListener('pointercancel', stopDrag);
}

function initExperienceCarousel() {
  setupSingleContinuousCarousel('experienceCarousel', 'experienceTrack');
}

/**
 * 23. Carrossel Automático de Fotografias da Casinha (Booking.com)
 * Apresenta as fotografias oficiais do alojamento com transição automática contínua (3.5s),
 * pausa ao hover, botões de avanço/recuo e indicadores de pontos.
 */
function initCasinhaGallerySlider() {
  const container = document.getElementById('casinhasCarousel');
  if (!container) return;

  const slides = container.querySelectorAll('.casinha-slide');
  const prevBtn = document.getElementById('casinhasPrevBtn');
  const nextBtn = document.getElementById('casinhasNextBtn');
  const dotsContainer = document.getElementById('casinhasDots');

  if (!slides.length) return;

  let currentIndex = 0;
  let timer = null;
  const interval = 3500;

  // Gerar dots se não existirem
  if (dotsContainer && !dotsContainer.children.length) {
    slides.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `casinha-slider-dot${idx === 0 ? ' active' : ''}`;
      dot.setAttribute('aria-label', `Ir para fotografia ${idx + 1}`);
      dot.addEventListener('click', () => {
        goToSlide(idx);
        startAutoPlay();
      });
      dotsContainer.appendChild(dot);
    });
  }

  const dots = dotsContainer ? dotsContainer.querySelectorAll('.casinha-slider-dot') : [];

  function updateSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
    if (dots.length) {
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }
    currentIndex = index;
  }

  function goToSlide(index) {
    let nextIdx = index;
    if (nextIdx >= slides.length) nextIdx = 0;
    if (nextIdx < 0) nextIdx = slides.length - 1;
    updateSlide(nextIdx);
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  function startAutoPlay() {
    stopAutoPlay();
    timer = setInterval(nextSlide, interval);
  }

  function stopAutoPlay() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      startAutoPlay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      startAutoPlay();
    });
  }

  container.addEventListener('mouseenter', stopAutoPlay);
  container.addEventListener('mouseleave', startAutoPlay);

  // Gestos de toque / swipe em dispositivos móveis
  let touchStartX = 0;
  container.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoPlay();
  }, { passive: true });

  container.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(diff) > 40) {
      if (diff < 0) nextSlide();
      else prevSlide();
    }
    startAutoPlay();
  }, { passive: true });

  startAutoPlay();
}

