import { TechnexParticleSystem } from './lib/particle-system';
import { FORMS, FormConfig } from './config';

const app = document.getElementById('app');

if (app) {
  // 1. Initialize WebGL Particle Engine
  const system = new TechnexParticleSystem(app, {
    onMorphStart: (id) => console.log('Morph started:', id),
    onMorphComplete: (id) => console.log('Morph complete:', id),
  });

  system.init().catch(console.error);

  // 2. Build DOM Spark Buttons
  const hudContainer = document.createElement('div');
  hudContainer.style.cssText = `
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  const sparkGrid = document.createElement('div');
  sparkGrid.style.cssText = `
    position: relative;
    width: 100%;
    max-width: 1240px;
    height: 82vh;
    pointer-events: none;
  `;
  hudContainer.appendChild(sparkGrid);
  app.appendChild(hudContainer);

  // 3. Build A4 Card Container
  const a4Card = document.createElement('aside');
  a4Card.style.cssText = `
    position: fixed;
    top: 24px;
    right: 24px;
    bottom: 24px;
    width: 92vw;
    max-width: 440px;
    z-index: 50;
    pointer-events: auto;
    transform: translateX(115%);
    transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    background: rgba(12, 10, 16, 0.95);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(212, 175, 55, 0.6);
    border-radius: 12px;
    box-shadow: 0 25px 60px rgba(0,0,0,0.9), 0 0 40px rgba(212,175,55,0.25);
    padding: 28px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #e5e5e5;
  `;
  app.appendChild(a4Card);

  function openCard(form: FormConfig) {
    a4Card.style.transform = 'translateX(0)';
    a4Card.innerHTML = `
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(212,175,55,0.3); padding-bottom:12px;">
          <div style="display:flex; gap:8px; align-items:center;">
            <span style="font-size:10px; font-family:monospace; padding:2px 8px; border-radius:9999px; background:rgba(140,226,224,0.2); color:#8ce2e0; border:1px solid rgba(140,226,224,0.4); text-transform:uppercase;">${form.tag}</span>
            <span style="font-size:11px; font-family:monospace; color:#d4af37;">NO. ${form.eventNumber} · SPEC A4</span>
          </div>
          <button id="close-btn" style="background:none; border:none; color:#888; font-family:monospace; font-size:14px; cursor:pointer; padding:4px 8px;">ESC ✕</button>
        </div>
        <h2 style="font-size:24px; color:#ffd6a0; margin-top:20px; font-family:serif;">${form.title}</h2>
        <p style="font-size:11px; font-family:monospace; color:#8ce2e0; text-transform:uppercase; margin-top:4px;">3D Constellation: ${form.name}</p>
        <div style="height:1px; background:linear-gradient(90deg, rgba(212,175,55,0.6), transparent); margin:16px 0;"></div>
        <div style="display:flex; flex-direction:column; gap:14px; font-size:12px; line-height:1.5;">
          <div>
            <span style="font-size:10px; font-family:monospace; color:#d4af37; text-transform:uppercase; display:block; margin-bottom:4px;">Inspiration</span>
            <p style="background:rgba(255,255,255,0.05); padding:8px; border-radius:4px; font-style:italic;">"${form.source}" &mdash; ${form.concept}</p>
          </div>
          <div>
            <span style="font-size:10px; font-family:monospace; color:#8ce2e0; text-transform:uppercase; display:block; margin-bottom:4px;">Innovation</span>
            <p style="color:#ddd;">${form.innovation}</p>
          </div>
          <div>
            <span style="font-size:10px; font-family:monospace; color:#888; text-transform:uppercase; display:block; margin-bottom:4px;">Particle Anatomy</span>
            <p style="color:#aaa; font-size:11px;">${form.description}</p>
          </div>
        </div>
      </div>
      <div style="margin-top:20px; border-top:1px solid rgba(212,175,55,0.3); padding-top:16px; display:flex; gap:10px;">
        <button id="reg-btn" style="flex:1; padding:12px; border-radius:8px; background:linear-gradient(90deg, #d4af37, #ffd6a0, #d4af37); color:#000; font-weight:700; font-size:11px; text-transform:uppercase; border:none; cursor:pointer;">Register for Event</button>
        <button id="ret-btn" style="padding:12px 18px; border-radius:8px; background:none; border:1px solid rgba(255,255,255,0.2); color:#ccc; font-family:monospace; font-size:11px; cursor:pointer;">Close</button>
      </div>
    `;

    document.getElementById('close-btn')?.addEventListener('click', closeCard);
    document.getElementById('ret-btn')?.addEventListener('click', closeCard);
    document.getElementById('reg-btn')?.addEventListener('click', () => {
      window.location.href = `/registration?event=${form.id}`;
    });
  }

  function closeCard() {
    a4Card.style.transform = 'translateX(115%)';
    system.resetToHuman();
  }

  // 4. Populate Sparks
  const eventForms = FORMS.filter((f) => f.id !== 'human');
  eventForms.forEach((form, idx) => {
    const isLeft = idx < 7;
    const row = isLeft ? idx : idx - 7;
    const topPct = 14 + row * 11.5;
    const leftPct = isLeft ? 4.5 + (row % 2) * 3 : 75 - (row % 2) * 3;

    const btn = document.createElement('button');
    btn.style.cssText = `
      position: absolute;
      top: ${topPct}%;
      left: ${leftPct}%;
      pointer-events: auto;
      padding: 6px 14px;
      border-radius: 9999px;
      border: 1px solid rgba(255, 214, 160, 0.35);
      background: rgba(6, 4, 8, 0.65);
      backdrop-filter: blur(8px);
      color: #fff;
      font-family: monospace;
      font-size: 11px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
    `;

    const dot = document.createElement('span');
    dot.style.cssText = `
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #ffd6a0;
      box-shadow: 0 0 8px #ffd6a0;
    `;

    const label = document.createElement('span');
    label.innerText = `${form.eventNumber} · ${form.title.split(' ')[0]}`;

    btn.appendChild(dot);
    btn.appendChild(label);

    btn.addEventListener('mouseenter', () => {
      btn.style.borderColor = '#8ce2e0';
      btn.style.boxShadow = '0 0 15px rgba(140, 226, 224, 0.5)';
      dot.style.background = '#8ce2e0';
      dot.style.boxShadow = '0 0 10px #8ce2e0';
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.borderColor = 'rgba(255, 214, 160, 0.35)';
      btn.style.boxShadow = 'none';
      dot.style.background = '#ffd6a0';
      dot.style.boxShadow = '0 0 8px #ffd6a0';
    });

    btn.addEventListener('click', (e) => {
      const rect = btn.getBoundingClientRect();
      system.triggerEventMorph(form.id, rect.left + rect.width / 2, rect.top + rect.height / 2);
      openCard(form);
    });

    sparkGrid.appendChild(btn);
  });

  // 5. Keyboard Navigation
  let currentIdx = -1;
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCard();
      currentIdx = -1;
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      currentIdx = (currentIdx + 1) % eventForms.length;
      const f = eventForms[currentIdx];
      system.triggerEventMorph(f.id);
      openCard(f);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      currentIdx = (currentIdx - 1 + eventForms.length) % eventForms.length;
      const f = eventForms[currentIdx];
      system.triggerEventMorph(f.id);
      openCard(f);
    }
  });
}
