import { useState, useEffect, useRef, useCallback } from "react";

// ── Data ─────────────────────────────────────────────────────────────────────
// Embed sample professions for demo (in production loads from API)
const SAMPLE_PROFESSIONS = [
  { id: 1, name: "Авербандщик", siz_count: 4 },
  { id: 2, name: "Авиационный механик (техник) по планеру и двигателям", siz_count: 7 },
  { id: 7, name: "Автоклавщик", siz_count: 5 },
  { id: 11, name: "Автоматчик", siz_count: 4 },
  { id: 50, name: "Аппаратчик", siz_count: 6 },
  { id: 51, name: "Аппаратчик абсорбции", siz_count: 7 },
  { id: 80, name: "Бетонщик", siz_count: 5 },
  { id: 100, name: "Водитель автомобиля", siz_count: 4 },
  { id: 150, name: "Газосварщик", siz_count: 8 },
  { id: 200, name: "Дорожный рабочий", siz_count: 6 },
  { id: 250, name: "Электросварщик ручной сварки", siz_count: 9 },
  { id: 300, name: "Маляр", siz_count: 7 },
  { id: 350, name: "Слесарь-ремонтник", siz_count: 8 },
  { id: 400, name: "Токарь", siz_count: 5 },
  { id: 450, name: "Уборщик производственных помещений", siz_count: 4 },
  { id: 500, name: "Штукатур", siz_count: 6 },
  { id: 550, name: "Электромонтёр по ремонту и обслуживанию электрооборудования", siz_count: 8 },
  { id: 600, name: "Плотник", siz_count: 7 },
  { id: 650, name: "Каменщик", siz_count: 5 },
  { id: 700, name: "Сварщик термитной сварки", siz_count: 6 },
];

const SAMPLE_HAZARDS = [
  { name: "Скользкие, обледенелые, зажиренные, мокрые поверхности", event: "Падение из-за потери равновесия" },
  { name: "Перепад высот, отсутствие ограждения на высоте", event: "Падение работника с высоты" },
  { name: "Груз, инструмент или предмет, перемещаемый или поднимаемый", event: "Удар падающим предметом" },
  { name: "Плохо или неправильно закрепленные детали или заготовки", event: "Удар или порез" },
  { name: "Острые кромки, заусенцы, шероховатая поверхность", event: "Порезы, проколы, царапины" },
  { name: "Движущиеся части машин и механизмов", event: "Захват, затягивание, удар" },
  { name: "Электрический ток", event: "Поражение электрическим током" },
  { name: "Повышенная запылённость воздуха рабочей зоны", event: "Заболевание органов дыхания" },
  { name: "Пониженная температура воздуха и поверхностей", event: "Переохлаждение" },
  { name: "Повышенный уровень шума на рабочем месте", event: "Потеря слуха" },
  { name: "Воздействие вредных веществ — аэрозолей", event: "Профессиональные заболевания" },
  { name: "Биологические объекты", event: "Инфекционные заболевания" },
];

// ── Styles ────────────────────────────────────────────────────────────────────
const COLORS = {
  primary: "#4CAAFE",
  primaryDark: "#2E8FEA",
  primaryLight: "#E8F4FF",
  bg: "#F0F7FF",
  surface: "#FFFFFF",
  text: "#1C1C1C",
  textLight: "#6B7280",
  error: "#FF3D00",
  border: "#D9D9D9",
  success: "#22C55E",
  accent: "#4CAAFE",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600;700;800&display=swap');
  
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
  body {
    font-family: 'Jost', sans-serif;
    background: ${COLORS.bg};
    color: ${COLORS.text};
    min-height: 100vh;
    overflow-x: hidden;
  }
  
  :root {
    --primary: ${COLORS.primary};
    --error: ${COLORS.error};
    --border: ${COLORS.border};
  }

  /* ── Page transitions ── */
  .page { animation: pageIn 0.4s ease; }
  @keyframes pageIn {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ── Buttons ── */
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    border: none; cursor: pointer; font-family: 'Jost', sans-serif;
    font-size: 15px; font-weight: 600; border-radius: 12px;
    padding: 12px 24px; height: 48px;
    transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
    white-space: nowrap; text-decoration: none;
  }
  .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(76,170,254,0.35); }
  .btn:active { transform: translateY(0); }
  
  .btn-primary {
    background: ${COLORS.primary}; color: white;
    box-shadow: 0 4px 15px rgba(76,170,254,0.3);
  }
  .btn-primary:hover { background: ${COLORS.primaryDark}; }
  
  .btn-outline {
    background: transparent; color: ${COLORS.text};
    border: 2px solid ${COLORS.border};
  }
  .btn-outline:hover { border-color: ${COLORS.primary}; color: ${COLORS.primary}; box-shadow: 0 8px 25px rgba(76,170,254,0.15); }
  
  .btn-danger {
    background: transparent; color: ${COLORS.error};
    border: 2px solid ${COLORS.error};
  }
  .btn-danger:hover { background: ${COLORS.error}; color: white; box-shadow: 0 8px 25px rgba(255,61,0,0.3); }
  
  .btn-sm { height: 36px; padding: 8px 16px; font-size: 13px; border-radius: 8px; }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; box-shadow: none !important; }

  /* ── Inputs ── */
  .input {
    width: 100%; padding: 12px 16px; border-radius: 12px;
    border: 2px solid ${COLORS.border}; font-family: 'Jost', sans-serif;
    font-size: 15px; color: ${COLORS.text}; background: white;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    outline: none;
  }
  .input:focus { border-color: ${COLORS.primary}; box-shadow: 0 0 0 4px rgba(76,170,254,0.15); }
  .input::placeholder { color: ${COLORS.textLight}; }
  .input-error { border-color: ${COLORS.error} !important; }

  /* ── Cards ── */
  .card {
    background: white; border-radius: 20px;
    box-shadow: 0 2px 16px rgba(0,0,0,0.07);
    padding: 24px;
  }

  /* ── Header ── */
  .header {
    position: sticky; top: 0; z-index: 100;
    background: rgba(255,255,255,0.95); backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(76,170,254,0.15);
    padding: 0 32px; height: 64px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .header-logo {
    display: flex; align-items: center; gap: 10px;
    font-size: 22px; font-weight: 800; color: ${COLORS.primary};
    text-decoration: none; cursor: pointer;
  }
  .header-logo svg { width: 32px; height: 32px; }
  .header-nav { display: flex; align-items: center; gap: 12px; }

  /* ── Landing ── */
  .landing {
    min-height: calc(100vh - 64px);
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 48px 24px;
    background: linear-gradient(135deg, #E8F4FF 0%, #F0F7FF 50%, #EBF3FF 100%);
    position: relative; overflow: hidden;
  }
  .landing::before {
    content: ''; position: absolute; top: -100px; right: -100px;
    width: 400px; height: 400px; border-radius: 50%;
    background: radial-gradient(circle, rgba(76,170,254,0.15) 0%, transparent 70%);
  }
  .landing::after {
    content: ''; position: absolute; bottom: -80px; left: -80px;
    width: 300px; height: 300px; border-radius: 50%;
    background: radial-gradient(circle, rgba(76,170,254,0.1) 0%, transparent 70%);
  }
  .landing-icon {
    font-size: 120px; line-height: 1; margin-bottom: 32px;
    animation: float 3s ease-in-out infinite;
    filter: drop-shadow(0 20px 40px rgba(76,170,254,0.3));
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-12px); }
  }
  .landing h1 {
    font-size: clamp(32px, 5vw, 56px); font-weight: 800;
    text-align: center; line-height: 1.15;
    background: linear-gradient(135deg, ${COLORS.text} 0%, ${COLORS.primary} 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text; margin-bottom: 16px;
  }
  .landing-sub {
    font-size: clamp(16px, 2vw, 22px); font-weight: 500; color: ${COLORS.textLight};
    text-align: center; margin-bottom: 24px; max-width: 560px;
  }
  .landing-features {
    display: flex; flex-wrap: wrap; gap: 12px; justify-content: center;
    margin-bottom: 40px; max-width: 600px;
  }
  .feature-chip {
    background: white; border: 1px solid rgba(76,170,254,0.3);
    border-radius: 100px; padding: 8px 18px; font-size: 14px;
    font-weight: 500; color: ${COLORS.primary};
    box-shadow: 0 2px 8px rgba(76,170,254,0.1);
  }
  .landing-btn-wrap {
    width: 100%; max-width: 320px; display: flex; flex-direction: column; gap: 12px;
  }

  /* ── Auth ── */
  .auth-wrap {
    min-height: calc(100vh - 64px);
    display: flex; align-items: center; justify-content: center;
    padding: 48px 24px;
    background: linear-gradient(135deg, #E8F4FF 0%, #F0F7FF 100%);
  }
  .auth-card {
    background: white; border-radius: 24px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.1);
    padding: 40px; width: 100%; max-width: 440px;
  }
  .auth-card h2 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
  .auth-card p { color: ${COLORS.textLight}; margin-bottom: 28px; font-size: 15px; }
  .auth-tabs {
    display: flex; gap: 4px; background: #F3F4F6;
    border-radius: 12px; padding: 4px; margin-bottom: 24px;
  }
  .auth-tab {
    flex: 1; padding: 10px; border: none; background: transparent;
    font-family: 'Jost', sans-serif; font-weight: 600; font-size: 14px;
    border-radius: 10px; cursor: pointer; transition: all 0.2s ease; color: ${COLORS.textLight};
  }
  .auth-tab.active { background: white; color: ${COLORS.primary}; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
  .field-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
  .field-label { font-size: 14px; font-weight: 600; color: ${COLORS.text}; }
  .field-error { font-size: 12px; color: ${COLORS.error}; }
  .auth-divider {
    display: flex; align-items: center; gap: 12px; margin: 20px 0;
    color: ${COLORS.textLight}; font-size: 13px;
  }
  .auth-divider::before, .auth-divider::after {
    content: ''; flex: 1; height: 1px; background: ${COLORS.border};
  }
  .btn-google {
    width: 100%; background: white; color: ${COLORS.text};
    border: 2px solid; height: 48px; margin-bottom: 10px;
    border-image: linear-gradient(90deg, #FF3D00, #FF7F04, #4CAF50, #1976D2) 1;
    border-radius: 12px !important;
  }
  .btn-yandex {
    width: 100%; background: #FF3D00; color: white; border: none; height: 48px;
  }
  .skip-link {
    display: block; text-align: center; margin-top: 16px;
    color: ${COLORS.textLight}; font-size: 14px; cursor: pointer;
    text-decoration: underline; text-underline-offset: 3px;
  }
  .skip-link:hover { color: ${COLORS.primary}; }

  /* ── Main workspace ── */
  .workspace {
    max-width: 1280px; margin: 0 auto; padding: 32px 24px;
  }
  .workspace-title {
    font-size: 28px; font-weight: 700; margin-bottom: 8px;
  }
  .workspace-sub { color: ${COLORS.textLight}; font-size: 15px; margin-bottom: 28px; }
  
  .workspace-grid {
    display: grid; grid-template-columns: 380px 1fr;
    gap: 24px; align-items: start;
  }
  @media (max-width: 900px) {
    .workspace-grid { grid-template-columns: 1fr; }
  }

  /* ── Search/Select ── */
  .search-wrap { position: relative; }
  .search-results {
    position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 50;
    background: white; border: 2px solid ${COLORS.primary}; border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.12); max-height: 260px; overflow-y: auto;
  }
  .search-result-item {
    padding: 12px 16px; cursor: pointer; font-size: 14px;
    transition: background 0.15s ease; border-bottom: 1px solid #F3F4F6;
  }
  .search-result-item:last-child { border-bottom: none; }
  .search-result-item:hover { background: ${COLORS.primaryLight}; color: ${COLORS.primary}; }
  .search-result-item mark { background: rgba(76,170,254,0.2); color: inherit; padding: 0 2px; border-radius: 3px; }

  /* ── Hazards checkboxes ── */
  .hazards-list {
    max-height: 220px; overflow-y: auto;
    border: 2px solid ${COLORS.border}; border-radius: 12px;
  }
  .hazard-item {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 10px 14px; cursor: pointer; border-bottom: 1px solid #F3F4F6;
    transition: background 0.15s ease;
  }
  .hazard-item:last-child { border-bottom: none; }
  .hazard-item:hover { background: ${COLORS.primaryLight}; }
  .hazard-item input[type="checkbox"] {
    width: 18px; height: 18px; flex-shrink: 0; margin-top: 2px;
    accent-color: ${COLORS.primary}; cursor: pointer;
  }
  .hazard-name { font-size: 13px; font-weight: 500; }
  .hazard-event { font-size: 11px; color: ${COLORS.textLight}; margin-top: 2px; }

  /* ── Professions table ── */
  .prof-table { width: 100%; border-collapse: collapse; }
  .prof-table th {
    text-align: left; padding: 12px 16px; font-size: 12px;
    font-weight: 600; color: ${COLORS.textLight}; text-transform: uppercase;
    letter-spacing: 0.5px; border-bottom: 2px solid ${COLORS.border};
    background: #FAFAFA;
  }
  .prof-table td {
    padding: 12px 16px; font-size: 14px; border-bottom: 1px solid #F3F4F6;
    vertical-align: middle;
  }
  .prof-table tr:hover td { background: ${COLORS.primaryLight}; }
  .prof-num {
    width: 36px; height: 36px; border-radius: 8px; background: ${COLORS.primaryLight};
    color: ${COLORS.primary}; font-weight: 700; font-size: 15px;
    display: inline-flex; align-items: center; justify-content: center;
  }
  .hazard-tags { display: flex; flex-wrap: wrap; gap: 4px; }
  .hazard-tag {
    background: #FFF3E0; color: #E65100; border-radius: 6px;
    padding: 2px 8px; font-size: 11px; font-weight: 600;
  }
  .action-btns { display: flex; gap: 6px; }
  .empty-table {
    text-align: center; padding: 48px 24px; color: ${COLORS.textLight};
  }
  .empty-table .icon { font-size: 48px; margin-bottom: 12px; }

  /* ── Bottom actions ── */
  .bottom-actions {
    position: sticky; bottom: 0;
    background: rgba(255,255,255,0.97); backdrop-filter: blur(12px);
    border-top: 1px solid rgba(76,170,254,0.15);
    padding: 16px 24px; display: flex; gap: 12px;
    flex-wrap: wrap;
  }

  /* ── Profile ── */
  .profile-wrap {
    max-width: 900px; margin: 0 auto; padding: 32px 24px;
  }
  .history-item {
    display: flex; align-items: center; gap: 16px;
    padding: 16px; border-bottom: 1px solid #F3F4F6;
    transition: background 0.15s;
  }
  .history-item:hover { background: ${COLORS.primaryLight}; border-radius: 12px; }
  .history-date { font-size: 12px; color: ${COLORS.textLight}; margin-top: 4px; }

  /* ── Thank you ── */
  .thanks-wrap {
    min-height: calc(100vh - 64px);
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 48px 24px; text-align: center;
  }
  .thanks-icon { font-size: 96px; margin-bottom: 24px; animation: float 3s ease-in-out infinite; }
  .thanks-wrap h1 { font-size: 40px; font-weight: 800; margin-bottom: 12px; }
  .thanks-wrap p { color: ${COLORS.textLight}; font-size: 18px; margin-bottom: 40px; max-width: 480px; }

  /* ── Tag ── */
  .tag {
    display: inline-flex; align-items: center; gap: 6px;
    background: ${COLORS.primaryLight}; color: ${COLORS.primary};
    border-radius: 8px; padding: 6px 12px; font-size: 13px; font-weight: 600;
  }

  /* ── Notification ── */
  .notify {
    position: fixed; top: 80px; right: 24px; z-index: 1000;
    background: white; border-radius: 14px; padding: 14px 20px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 10px;
    font-size: 14px; font-weight: 500; animation: slideIn 0.3s ease;
    border-left: 4px solid ${COLORS.primary};
  }
  .notify.error { border-color: ${COLORS.error}; }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }

  /* ── Modal ── */
  .modal-overlay {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; padding: 24px;
  }
  .modal {
    background: white; border-radius: 24px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    padding: 32px; width: 100%; max-width: 480px;
    animation: modalIn 0.3s ease;
  }
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.95) translateY(8px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  .modal h3 { font-size: 22px; font-weight: 700; margin-bottom: 16px; }
  .modal-actions { display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end; }

  /* ── Section title ── */
  .section-title {
    font-size: 16px; font-weight: 700; margin-bottom: 12px;
    display: flex; align-items: center; gap: 8px;
  }
  .section-title::before {
    content: ''; display: block; width: 4px; height: 18px;
    background: ${COLORS.primary}; border-radius: 4px;
  }

  /* ── Loading spinner ── */
  .spinner {
    width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.4);
    border-top-color: white; border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #F3F4F6; border-radius: 3px; }
  ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: ${COLORS.primary}; }
`;

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = {
  Logo: () => (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#4CAAFE"/>
      <path d="M8 10h16M8 16h10M8 22h13" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="23" cy="22" r="3" fill="white"/>
    </svg>
  ),
  Calculator: () => <span style={{fontSize: 'inherit'}}>🛡️</span>,
  Plus: () => <span>＋</span>,
  Trash: () => <span>🗑️</span>,
  Edit: () => <span>✏️</span>,
  Card: () => <span>🪪</span>,
  Download: () => <span>⬇️</span>,
  Check: () => <span>✅</span>,
  User: () => <span>👤</span>,
  History: () => <span>📋</span>,
  Logout: () => <span>🚪</span>,
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
    </svg>
  ),
};

// ── Helper Functions ──────────────────────────────────────────────────────────
function highlight(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function generateDocxBlob(professions, type) {
  // In a real app, this calls the backend API
  // For demo purposes, create a text blob
  let content = '';
  
  if (type === 'normy') {
    content = `НОРМЫ ВЫДАЧИ СИЗ\n${'='.repeat(60)}\n`;
    content += `Дата формирования: ${new Date().toLocaleDateString('ru-RU')}\n\n`;
    content += `${'№'.padEnd(4)} ${'Профессия'.padEnd(40)} ${'Опасности'.padEnd(30)}\n`;
    content += `${'-'.repeat(80)}\n`;
    professions.forEach((p, i) => {
      content += `${(i+1).toString().padEnd(4)} ${p.profession_name.padEnd(40)} ${p.hazards.length > 0 ? p.hazards[0].slice(0, 28) : 'Базовые СИЗ'}\n`;
      if (p.hazards.length > 1) {
        p.hazards.slice(1).forEach(h => {
          content += `${''.padEnd(45)} ${h.slice(0, 28)}\n`;
        });
      }
    });
    content += `\n${'='.repeat(60)}\n`;
    content += `Основание: Приказ Минтруда России от 29.10.2021 №767н\n`;
  } else {
    content = `ЛИЧНАЯ КАРТОЧКА УЧЁТА ВЫДАЧИ СИЗ\n${'='.repeat(60)}\n`;
    professions.forEach(p => {
      content += `\nПрофессия: ${p.profession_name}\n`;
      content += `Дополнительные условия: ${p.hazards.join(', ') || 'Нет'}\n`;
      content += `\nСИЗ:\n`;
      content += `- СИЗ согласно нормам для профессии\n`;
      p.hazards.forEach(h => {
        content += `- СИЗ по опасности: ${h.slice(0, 50)}\n`;
      });
      content += `\n${'-'.repeat(60)}\n`;
    });
  }
  
  return new Blob([content], { type: 'text/plain;charset=utf-8' });
}

// ── Notification ──────────────────────────────────────────────────────────────
function Notify({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  
  return (
    <div className={`notify ${type === 'error' ? 'error' : ''}`}>
      <span>{type === 'error' ? '❌' : '✅'}</span>
      {msg}
    </div>
  );
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>⚠️ Подтверждение</h3>
        <p style={{ color: COLORS.textLight, lineHeight: 1.6 }}>{message}</p>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onCancel}>Отмена</button>
          <button className="btn btn-danger" onClick={onConfirm}>Подтвердить</button>
        </div>
      </div>
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────
function Header({ page, setPage, user, onLogout }) {
  return (
    <header className="header">
      <div className="header-logo" onClick={() => setPage('landing')}>
        <Icon.Logo />
        CalcHub
      </div>
      <nav className="header-nav">
        {user ? (
          <>
            <button className="btn btn-outline btn-sm" onClick={() => setPage('profile')}>
              <Icon.User /> {user.name}
            </button>
            <button className="btn btn-outline btn-sm" onClick={onLogout}>
              <Icon.Logout /> Выйти
            </button>
          </>
        ) : page !== 'landing' && page !== 'auth' ? (
          <button className="btn btn-outline btn-sm" onClick={() => setPage('auth')}>
            Войти
          </button>
        ) : null}
        {(page === 'workspace' || page === 'profile') && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setPage('workspace')}
            style={{ opacity: page === 'workspace' ? 1 : 0.8 }}
          >
            🛡️ Расчёт СИЗ
          </button>
        )}
      </nav>
    </header>
  );
}

// ── Landing Page ──────────────────────────────────────────────────────────────
function LandingPage({ setPage }) {
  return (
    <div className="landing page">
      <div className="landing-icon">🛡️</div>
      <h1>Добро пожаловать в CalcHub</h1>
      <p className="landing-sub">Ваш надёжный помощник для расчёта норм выдачи средств индивидуальной защиты</p>
      <div className="landing-features">
        <span className="feature-chip">✓ Выбор профессий</span>
        <span className="feature-chip">✓ Учёт опасностей</span>
        <span className="feature-chip">✓ Генерация документов</span>
        <span className="feature-chip">✓ Личные карточки</span>
        <span className="feature-chip">✓ История расчётов</span>
      </div>
      <div className="landing-btn-wrap">
        <button className="btn btn-primary" style={{ width: '100%', height: 52 }} onClick={() => setPage('auth')}>
          Перейти к калькулятору
        </button>
        <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setPage('workspace')}>
          Продолжить без регистрации
        </button>
      </div>
    </div>
  );
}

// ── Auth Page ─────────────────────────────────────────────────────────────────
function AuthPage({ setPage, setUser, notify }) {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', name: '', password2: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Введите email';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Некорректный email';
    if (!form.password) e.password = 'Введите пароль';
    else if (form.password.length < 8) e.password = 'Минимум 8 символов';
    if (tab === 'register') {
      if (!form.name) e.name = 'Введите имя';
      if (form.password !== form.password2) e.password2 = 'Пароли не совпадают';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setLoading(true);
    
    setTimeout(() => {
      // Demo auth
      const user = { name: form.name || form.email.split('@')[0], email: form.email };
      setUser(user);
      localStorage.setItem('calchub_user', JSON.stringify(user));
      notify(tab === 'login' ? 'Вход выполнен успешно!' : 'Аккаунт создан!');
      setPage('workspace');
      setLoading(false);
    }, 800);
  };

  const f = (key) => ({
    value: form[key],
    onChange: e => setForm(p => ({ ...p, [key]: e.target.value })),
    className: `input ${errors[key] ? 'input-error' : ''}`,
    onKeyDown: e => e.key === 'Enter' && handleSubmit(),
  });

  return (
    <div className="auth-wrap page">
      <div className="auth-card">
        <h2>{tab === 'login' ? 'Вход в CalcHub' : 'Создать аккаунт'}</h2>
        <p>{tab === 'login' ? 'Войдите для доступа к истории расчётов' : 'Зарегистрируйтесь для сохранения расчётов'}</p>
        
        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setErrors({}); }}>Вход</button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setErrors({}); }}>Регистрация</button>
        </div>

        {tab === 'register' && (
          <div className="field-group">
            <label className="field-label">Имя</label>
            <input {...f('name')} placeholder="Иван Иванов" />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>
        )}
        
        <div className="field-group">
          <label className="field-label">Email</label>
          <input {...f('email')} type="email" placeholder="example@company.ru" />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>
        
        <div className="field-group">
          <label className="field-label">Пароль</label>
          <input {...f('password')} type="password" placeholder="Минимум 8 символов" />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>
        
        {tab === 'register' && (
          <div className="field-group">
            <label className="field-label">Повторите пароль</label>
            <input {...f('password2')} type="password" placeholder="Введите пароль ещё раз" />
            {errors.password2 && <span className="field-error">{errors.password2}</span>}
          </div>
        )}

        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSubmit} disabled={loading}>
          {loading ? <div className="spinner" /> : (tab === 'login' ? 'Войти' : 'Зарегистрироваться')}
        </button>

        <div className="auth-divider">или</div>
        
        <button className="btn btn-google" style={{ width: '100%', marginBottom: 10 }}
          onClick={() => notify('OAuth интеграция требует бекенд', 'error')}>
          <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Войти через Google
        </button>
        
        <button className="btn btn-yandex" style={{ width: '100%' }}
          onClick={() => notify('OAuth интеграция требует бекенд', 'error')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><text y="18" fontSize="18" fontWeight="bold" fontFamily="sans-serif">Я</text></svg>
          Войти через Яндекс ID
        </button>

        <span className="skip-link" onClick={() => setPage('workspace')}>
          Продолжить без регистрации
        </span>
      </div>
    </div>
  );
}

// ── Profession Selector ───────────────────────────────────────────────────────
function ProfessionSelector({ professions, value, onChange }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const filtered = query.length >= 1
    ? professions.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 20)
    : [];

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (prof) => {
    onChange(prof);
    setQuery(prof.name);
    setOpen(false);
  };

  return (
    <div className="search-wrap" ref={ref}>
      <div style={{ position: 'relative' }}>
        <input
          className="input"
          placeholder="Поиск профессии..."
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); if (!e.target.value) onChange(null); }}
          onFocus={() => setOpen(true)}
        />
        <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: COLORS.textLight, pointerEvents: 'none' }}>
          <Icon.Search />
        </div>
      </div>
      {open && filtered.length > 0 && (
        <div className="search-results">
          {filtered.map(p => (
            <div key={p.id} className="search-result-item" onClick={() => select(p)}>
              <div style={{ fontWeight: 600 }}>{highlight(p.name, query)}</div>
              <div style={{ fontSize: 12, color: COLORS.textLight, marginTop: 2 }}>
                СИЗ: {p.siz_count} позиций
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Workspace ─────────────────────────────────────────────────────────────────
function WorkspacePage({ user, setPage, notify, history, setHistory }) {
  const [professions] = useState(SAMPLE_PROFESSIONS);
  const [hazards] = useState(SAMPLE_HAZARDS);
  const [selectedProf, setSelectedProf] = useState(null);
  const [selectedHazards, setSelectedHazards] = useState([]);
  const [profList, setProfList] = useState([]);
  const [confirmClear, setConfirmClear] = useState(false);
  const [generating, setGenerating] = useState(null);
  const [editIdx, setEditIdx] = useState(null);
  const [hazardSearch, setHazardSearch] = useState('');

  const filteredHazards = hazardSearch
    ? hazards.filter(h => h.name.toLowerCase().includes(hazardSearch.toLowerCase()))
    : hazards;

  const addProfession = () => {
    if (!selectedProf) { notify('Выберите профессию', 'error'); return; }
    
    const entry = {
      profession_id: selectedProf.id,
      profession_name: selectedProf.name,
      hazards: selectedHazards,
    };
    
    if (editIdx !== null) {
      setProfList(prev => prev.map((p, i) => i === editIdx ? entry : p));
      setEditIdx(null);
    } else {
      setProfList(prev => [...prev, entry]);
    }
    
    setSelectedProf(null);
    setSelectedHazards([]);
    notify(editIdx !== null ? 'Профессия обновлена' : 'Профессия добавлена');
  };

  const startEdit = (idx) => {
    const entry = profList[idx];
    setSelectedProf({ id: entry.profession_id, name: entry.profession_name });
    setSelectedHazards([...entry.hazards]);
    setEditIdx(idx);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeProfession = (idx) => {
    setProfList(prev => prev.filter((_, i) => i !== idx));
    notify('Профессия удалена');
  };

  const toggleHazard = (hazardName) => {
    setSelectedHazards(prev =>
      prev.includes(hazardName) ? prev.filter(h => h !== hazardName) : [...prev, hazardName]
    );
  };

  const saveToHistory = (type) => {
    if (!user) return;
    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      professions: profList,
      type,
    };
    setHistory(prev => {
      const exists = prev.some(h =>
        JSON.stringify(h.professions) === JSON.stringify(profList) && h.type === type
      );
      if (exists) return prev;
      return [entry, ...prev];
    });
  };

  const generateDocument = async (type) => {
    if (profList.length === 0) { notify('Добавьте хотя бы одну профессию', 'error'); return; }
    setGenerating(type);
    
    await new Promise(r => setTimeout(r, 1000));
    
    const blob = generateDocxBlob(profList, type);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ext = type === 'normy' ? 'docx' : (profList.length > 1 ? 'zip' : 'docx');
    a.href = url;
    a.download = type === 'normy' ? `normy-vydachi-siz.txt` : `ankety-siz.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    saveToHistory(type);
    setGenerating(null);
    setPage('thanks');
  };

  const generateSingleAnketa = async (entry) => {
    setGenerating('single');
    await new Promise(r => setTimeout(r, 600));
    const blob = generateDocxBlob([entry], 'anketa');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anketa-${entry.profession_name.slice(0, 20)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setGenerating(null);
    notify('Личная карточка сформирована');
  };

  return (
    <div style={{ paddingBottom: 100 }}>
      <div className="workspace page">
        <div className="workspace-title">🛡️ Расчёт норм выдачи СИЗ</div>
        <div className="workspace-sub">
          Выберите профессии и дополнительные условия для формирования документов
        </div>

        <div className="workspace-grid">
          {/* Left: Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card">
              <div className="section-title">
                {editIdx !== null ? '✏️ Редактирование' : '➕ Добавить профессию'}
              </div>

              <div style={{ marginBottom: 16 }}>
                <div className="field-label" style={{ marginBottom: 8 }}>Профессия</div>
                <ProfessionSelector
                  professions={professions}
                  value={selectedProf}
                  onChange={setSelectedProf}
                />
                {selectedProf && (
                  <div className="tag" style={{ marginTop: 8 }}>
                    ✓ {selectedProf.name}
                  </div>
                )}
              </div>

              {selectedProf && (
                <div>
                  <div className="field-label" style={{ marginBottom: 8 }}>
                    Идентифицированные опасности
                    {selectedHazards.length > 0 && (
                      <span style={{ color: COLORS.primary, marginLeft: 8 }}>
                        ({selectedHazards.length} выбрано)
                      </span>
                    )}
                  </div>
                  <input
                    className="input"
                    placeholder="Поиск опасностей..."
                    value={hazardSearch}
                    onChange={e => setHazardSearch(e.target.value)}
                    style={{ marginBottom: 8 }}
                  />
                  <div className="hazards-list">
                    {filteredHazards.map(h => (
                      <label key={h.name} className="hazard-item">
                        <input
                          type="checkbox"
                          checked={selectedHazards.includes(h.name)}
                          onChange={() => toggleHazard(h.name)}
                        />
                        <div>
                          <div className="hazard-name">{h.name}</div>
                          {h.event && <div className="hazard-event">{h.event}</div>}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={addProfession}>
                  {editIdx !== null ? '✓ Сохранить' : '＋ Добавить в список'}
                </button>
                {editIdx !== null && (
                  <button className="btn btn-outline" onClick={() => {
                    setEditIdx(null); setSelectedProf(null); setSelectedHazards([]);
                  }}>
                    Отмена
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right: Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="section-title" style={{ margin: 0 }}>
                Список профессий
                {profList.length > 0 && (
                  <span style={{ background: COLORS.primary, color: 'white', borderRadius: '100px', padding: '2px 10px', fontSize: 13, marginLeft: 8 }}>
                    {profList.length}
                  </span>
                )}
              </div>
            </div>

            {profList.length === 0 ? (
              <div className="empty-table">
                <div className="icon">📋</div>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Список пуст</div>
                <div style={{ fontSize: 14, color: COLORS.textLight }}>Добавьте профессии для формирования документов</div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="prof-table">
                  <thead>
                    <tr>
                      <th>№</th>
                      <th>Профессия</th>
                      <th>Опасности</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profList.map((entry, idx) => (
                      <tr key={idx}>
                        <td><span className="prof-num">{idx + 1}</span></td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{entry.profession_name}</div>
                        </td>
                        <td>
                          {entry.hazards.length > 0 ? (
                            <div className="hazard-tags">
                              {entry.hazards.slice(0, 2).map(h => (
                                <span key={h} className="hazard-tag">{h.slice(0, 25)}…</span>
                              ))}
                              {entry.hazards.length > 2 && (
                                <span className="hazard-tag">+{entry.hazards.length - 2}</span>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: COLORS.textLight, fontSize: 13 }}>Базовые СИЗ</span>
                          )}
                        </td>
                        <td>
                          <div className="action-btns">
                            <button className="btn btn-outline btn-sm" title="Редактировать" onClick={() => startEdit(idx)}>
                              ✏️
                            </button>
                            <button className="btn btn-outline btn-sm" title="Личная карточка" onClick={() => generateSingleAnketa(entry)}
                              disabled={generating === 'single'}>
                              🪪
                            </button>
                            <button className="btn btn-danger btn-sm" title="Удалить" onClick={() => removeProfession(idx)}>
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="bottom-actions">
        <button
          className="btn btn-primary"
          style={{ minWidth: 220 }}
          onClick={() => generateDocument('normy')}
          disabled={!!generating || profList.length === 0}
        >
          {generating === 'normy' ? <><div className="spinner" /> Формирование…</> : '📄 Сформировать документ'}
        </button>
        <button
          className="btn btn-outline"
          style={{ minWidth: 220, borderColor: COLORS.primary, color: COLORS.primary }}
          onClick={() => generateDocument('anketa')}
          disabled={!!generating || profList.length === 0}
        >
          {generating === 'anketa' ? <><div className="spinner" style={{ borderTopColor: COLORS.primary }} /> Формирование…</> : '🪪 Личные карточки для всех'}
        </button>
        <button
          className="btn btn-outline"
          onClick={() => profList.length > 0 ? setConfirmClear(true) : notify('Список уже пуст')}
        >
          ✕ Отмена
        </button>
      </div>

      {confirmClear && (
        <ConfirmModal
          message="Вы уверены? Весь список профессий будет очищен и вы вернётесь к началу."
          onConfirm={() => { setProfList([]); setConfirmClear(false); notify('Список очищен'); }}
          onCancel={() => setConfirmClear(false)}
        />
      )}
    </div>
  );
}

// ── Profile Page ──────────────────────────────────────────────────────────────
function ProfilePage({ user, setUser, setPage, notify, history, setHistory }) {
  const [name, setName] = useState(user?.name || '');
  const [confirmClear, setConfirmClear] = useState(false);

  const saveProfile = () => {
    const updated = { ...user, name };
    setUser(updated);
    localStorage.setItem('calchub_user', JSON.stringify(updated));
    notify('Данные сохранены');
  };

  if (!user) {
    return (
      <div className="profile-wrap page">
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Требуется авторизация</div>
          <div style={{ color: COLORS.textLight, marginBottom: 24 }}>Войдите в аккаунт для доступа к профилю</div>
          <button className="btn btn-primary" onClick={() => setPage('auth')}>Войти</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-wrap page">
      <div style={{ marginBottom: 24 }}>
        <div className="workspace-title">👤 Профиль</div>
        <div className="workspace-sub">{user.email}</div>
      </div>

      <div style={{ display: 'grid', gap: 24 }}>
        <div className="card">
          <div className="section-title">Данные профиля</div>
          <div className="field-group">
            <label className="field-label">Имя</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="field-group">
            <label className="field-label">Email</label>
            <input className="input" value={user.email} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-primary" onClick={saveProfile}>Сохранить изменения</button>
            <button className="btn btn-outline" onClick={() => {
              setUser(null); localStorage.removeItem('calchub_user'); setPage('landing');
            }}>
              <Icon.Logout /> Выйти
            </button>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div className="section-title" style={{ margin: 0 }}>
              История расчётов
              {history.length > 0 && (
                <span style={{ background: COLORS.primary, color: 'white', borderRadius: '100px', padding: '2px 10px', fontSize: 13, marginLeft: 8 }}>
                  {history.length}
                </span>
              )}
            </div>
            {history.length > 0 && (
              <button className="btn btn-danger btn-sm" onClick={() => setConfirmClear(true)}>
                Очистить всё
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: COLORS.textLight }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              История пуста
            </div>
          ) : (
            <div>
              {history.map((item) => (
                <div key={item.id} className="history-item">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>
                      {item.type === 'normy' ? '📄 Нормы выдачи СИЗ' : '🪪 Личные карточки'}
                    </div>
                    <div className="history-date">
                      {new Date(item.date).toLocaleString('ru-RU')} · {item.professions.length} профессий
                    </div>
                    <div style={{ marginTop: 4, fontSize: 13, color: COLORS.textLight }}>
                      {item.professions.map(p => p.profession_name).join(', ').slice(0, 80)}…
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-danger btn-sm" onClick={() => {
                      setHistory(prev => prev.filter(h => h.id !== item.id));
                      notify('Запись удалена');
                    }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {confirmClear && (
        <ConfirmModal
          message="Очистить всю историю расчётов? Это действие необратимо."
          onConfirm={() => { setHistory([]); setConfirmClear(false); notify('История очищена'); }}
          onCancel={() => setConfirmClear(false)}
        />
      )}
    </div>
  );
}

// ── Thanks Page ───────────────────────────────────────────────────────────────
function ThanksPage({ setPage }) {
  return (
    <div className="thanks-wrap page">
      <div className="thanks-icon">🎉</div>
      <h1>Спасибо за использование CalcHub!</h1>
      <p>Ваш документ сформирован и загружен. Нам важно ваше мнение о сервисе!</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
        <a
          href="https://forms.gle/CGiXqY3YKj456VU17"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center' }}
        >
          ⭐ Оставить отзыв
        </a>
        <button className="btn btn-outline" onClick={() => setPage('workspace')}>
          Продолжить без отзыва
        </button>
        <button className="btn btn-outline" onClick={() => setPage('workspace')}>
          Вернуться к списку
        </button>
      </div>
    </div>
  );
}

// ── App Root ──────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState('landing');
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('calchub_user')); } catch { return null; }
  });
  const [history, setHistory] = useState([]);
  const [notification, setNotification] = useState(null);

  const notify = useCallback((msg, type = 'success') => {
    setNotification({ msg, type, id: Date.now() });
  }, []);

  return (
    <>
      <style>{css}</style>
      <Header
        page={page}
        setPage={setPage}
        user={user}
        onLogout={() => {
          setUser(null);
          localStorage.removeItem('calchub_user');
          setPage('landing');
          notify('Вы вышли из аккаунта');
        }}
      />
      
      <main>
        {page === 'landing' && <LandingPage setPage={setPage} />}
        {page === 'auth' && <AuthPage setPage={setPage} setUser={setUser} notify={notify} />}
        {page === 'workspace' && (
          <WorkspacePage
            user={user}
            setPage={setPage}
            notify={notify}
            history={history}
            setHistory={setHistory}
          />
        )}
        {page === 'profile' && (
          <ProfilePage
            user={user}
            setUser={setUser}
            setPage={setPage}
            notify={notify}
            history={history}
            setHistory={setHistory}
          />
        )}
        {page === 'thanks' && <ThanksPage setPage={setPage} />}
      </main>

      {notification && (
        <Notify
          key={notification.id}
          msg={notification.msg}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
}
