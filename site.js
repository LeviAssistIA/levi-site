// Simulações do Levi trabalhando. Cada demo roda em loop só enquanto aparece na tela.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

document.getElementById('ano').textContent = new Date().getFullYear();
addEventListener('scroll', () => $('#topbar').classList.toggle('scrolled', scrollY > 10), { passive: true });

// aparecer ao rolar
const seen = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); seen.unobserve(e.target); } }), { threshold: .12 });
$$('.reveal').forEach((el) => seen.observe(el));

// visível? (as demos pausam fora da tela)
const vis = new Map();
const watch = new IntersectionObserver((es) => es.forEach((e) => { const v = vis.get(e.target); v.on = e.isIntersecting; if (v.on) v.wake?.(); }), { threshold: .25 });
function gate(el) {
  const v = vis.get(el);
  return v.on && !document.hidden ? Promise.resolve() : new Promise((r) => { v.wake = () => { v.wake = null; r(); }; });
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) vis.forEach((v) => v.on && v.wake?.()); });
function loop(el, fn, final) {
  if (!el) return;
  if (calm) { final?.(); return; }
  vis.set(el, { on: false, wake: null }); watch.observe(el);
  (async () => { for (;;) { await gate(el); try { await fn(); } catch (e) { console.error(e); await sleep(2000); } } })();
}
async function type(el, text, speed = 42) {
  el.classList.add('caret'); el.textContent = '';
  for (const ch of text) { el.textContent += ch; await sleep(speed + (ch === ' ' ? 30 : Math.random() * 30)); }
  el.classList.remove('caret');
}

// 1) hero: barra flutuante respondendo o que está na tela
{
  const box = $('#heroSim');
  const S = [
    { title: 'Vendas Novembro.xlsx · Excel', q: 'O que essa fórmula faz?',
      a: 'É um PROCV: ele procura o código da célula A2 na Tabela e traz o valor da 3ª coluna (o preço). O 0 no fim pede a busca exata.' },
    { title: 'Aula 5 · Biologia · Chrome', q: 'Qual a resposta da questão 3?',
      a: 'Letra b) Nos tilacoides. A fase clara precisa de luz e acontece nas membranas dos tilacoides, dentro do cloroplasto.' },
  ];
  let i = 0;
  loop(box, async () => {
    const s = S[i++ % S.length];
    $$('.scene', box).forEach((el) => el.classList.toggle('off', +el.dataset.scene !== S.indexOf(s)));
    $('#heroTitle').textContent = s.title;
    $('#heroCard').classList.remove('show'); $('#heroQ').textContent = ''; $('#heroA').textContent = '';
    await sleep(900);
    await type($('#heroQ'), s.q, 55);
    await sleep(350);
    const scan = $('#heroScan'); scan.classList.remove('go'); void scan.offsetWidth; scan.classList.add('go');
    await sleep(1300);
    $('#heroCard').classList.add('show');
    await sleep(300);
    await type($('#heroA'), s.a, 18);
    await sleep(3800);
  }, () => { $('#heroQ').textContent = S[0].q; $('#heroA').textContent = S[0].a; $('#heroCard').classList.add('show'); });
}

// 2) vários monitores
{
  const box = $('#simMon');
  const lbl = $$('.lbl', box); const scans = $$('.scan', box); const bub = $('.bubble', box);
  loop(box, async () => {
    lbl.forEach((l) => l.classList.remove('show')); bub.classList.remove('show');
    await sleep(800);
    for (let k = 0; k < 2; k++) {
      scans[k].classList.remove('go'); void scans[k].offsetWidth; scans[k].classList.add('go');
      await sleep(900); lbl[k].classList.add('show'); await sleep(300);
    }
    await sleep(400); bub.classList.add('show');
    await sleep(4500);
  }, () => { lbl.forEach((l) => l.classList.add('show')); bub.classList.add('show'); });
}

// 3) foco do dia: tarefas sendo marcadas
{
  const box = $('#simTasks');
  const rows = $$('.tk-focus .tk-row', box); const st = (k) => $(`[data-k="${k}"]`, box);
  const pop = (el, v) => { el.textContent = v; el.classList.add('pop'); setTimeout(() => el.classList.remove('pop'), 350); };
  const confetti = () => {
    const c = $('.confetti', box); const cols = ['#ff8a3d', '#ff3d8b', '#8b3dff', '#2f80ff', '#ffc93c'];
    for (let n = 0; n < 26; n++) {
      const i = document.createElement('i');
      i.style.left = `${Math.random() * 100}%`; i.style.background = cols[n % cols.length]; i.style.animationDelay = `${Math.random() * .4}s`;
      c.appendChild(i); setTimeout(() => i.remove(), 2000);
    }
  };
  loop(box, async () => {
    rows.forEach((r) => r.classList.remove('done')); st('done').textContent = '0'; st('left').textContent = '3'; st('streak').textContent = '🔥 6';
    await sleep(1200);
    for (let k = 0; k < rows.length; k++) {
      rows[k].classList.add('done'); pop(st('done'), String(k + 1)); pop(st('left'), String(rows.length - k - 1));
      await sleep(1100);
    }
    pop(st('streak'), '🔥 7'); confetti();
    await sleep(3200);
  }, () => { rows.forEach((r) => r.classList.add('done')); st('done').textContent = '3'; st('left').textContent = '0'; st('streak').textContent = '🔥 7'; });
}

// 4) e-mails: chegam, ganham etiqueta, busca e anexo
{
  const box = $('#simMail');
  const rows = $$('.mx-row', box); const q = $('.mx-search .q', box); const att = $('.mx-att', box);
  loop(box, async () => {
    rows.forEach((r) => { r.classList.remove('in', 'dim', 'hit'); $('.lab', r).classList.remove('show'); });
    att.classList.remove('show'); q.textContent = '';
    await sleep(700);
    for (const r of rows) { r.classList.add('in'); await sleep(380); }
    await sleep(300);
    for (const r of rows) { $('.lab', r).classList.add('show'); await sleep(420); }
    await sleep(900);
    await type(q, 'fatura', 90);
    await sleep(300);
    rows.forEach((r, k) => { r.classList.toggle('dim', k !== 3); r.classList.toggle('hit', k === 3); });
    await sleep(700); att.classList.add('show');
    await sleep(3600);
  }, () => { rows.forEach((r) => { r.classList.add('in'); $('.lab', r).classList.add('show'); }); att.classList.add('show'); });
}

// 5) conversa trocando de IA
{
  const box = $('#simChat');
  const modes = $$('.mode', box); const chat = $('.chat', box);
  const T = [
    { m: 0, q: 'Monta uma planilha de gastos do mês', a: 'Pronto! Criei “Gastos Novembro.xlsx” com moradia, mercado, transporte e lazer, e o total soma sozinho. 📊' },
    { m: 1, q: 'Reescreve esse e-mail mais educado', a: 'Claro: “Olá, Júlia! Tudo bem? Poderia me enviar o contrato revisado até sexta? Obrigado!”' },
    { m: 2, q: 'Resume esse PDF em 3 tópicos', a: '1) Prazo de entrega: 30 dias. 2) Pagamento em 2 vezes. 3) Multa de 2% por atraso.' },
    { m: 3, q: 'Me explica juros compostos', a: 'É juro sobre juro: cada mês o rendimento entra na conta e passa a render também. Por isso cresce cada vez mais rápido.' },
  ];
  const add = (cls, html) => { const d = document.createElement('div'); d.className = `msg ${cls}`; d.innerHTML = html; chat.appendChild(d); requestAnimationFrame(() => d.classList.add('show')); return d; };
  let i = 0;
  loop(box, async () => {
    const t = T[i++ % T.length];
    modes.forEach((m) => m.classList.toggle('on', +m.dataset.m === t.m));
    chat.innerHTML = '';
    await sleep(700);
    add('me', t.q); await sleep(700);
    const w = add('ai', `<small>${modes[t.m].textContent}</small><span class="dots"><span></span><span></span><span></span></span>`);
    await sleep(1200);
    w.innerHTML = `<small>${modes[t.m].textContent}</small><span></span>`;
    await type($('span', w), t.a, 16);
    await sleep(3000);
  }, () => { modes[0].classList.add('on'); add('me', T[0].q).classList.add('show'); add('ai', `<small>Levi</small>${T[0].a}`).classList.add('show'); });
}

// 6) minha rotina
{
  const box = $('#simRot');
  const items = $$('.rt-item', box); const sum = $('.rt-sum', box);
  loop(box, async () => {
    items.forEach((x) => x.classList.remove('show')); sum.classList.remove('show');
    await sleep(700);
    for (const x of items) { x.classList.add('show'); await sleep(900); }
    await sleep(500); sum.classList.add('show');
    await sleep(4500);
  }, () => { items.forEach((x) => x.classList.add('show')); sum.classList.add('show'); });
}

// 7) voz
{
  const box = $('#simVoice');
  const mic = $('.mic', box); const wave = $('.wave', box); const said = $('.said', box); const cal = $('.cal', box);
  for (let n = 0; n < 22; n++) wave.appendChild(document.createElement('i'));
  const bars = $$('i', wave);
  let talking = false;
  (function anim() { bars.forEach((b) => { b.style.height = `${talking ? 6 + Math.random() * 34 : 6}px`; }); setTimeout(anim, 120); })();
  loop(box, async () => {
    cal.classList.remove('show'); said.innerHTML = ''; mic.classList.remove('on');
    await sleep(900);
    mic.classList.add('on'); talking = true;
    said.innerHTML = '“Ei, Levi”'; await sleep(1200);
    said.innerHTML = '“Marca dentista sexta às 10h”'; await sleep(1700);
    talking = false; mic.classList.remove('on');
    said.innerHTML = 'Marcado! 😉<small>Sexta, 20 de novembro, às 10:00</small>';
    await sleep(300); cal.classList.add('show');
    await sleep(3800);
  }, () => { said.innerHTML = 'Marcado! 😉<small>Sexta, 20 de novembro, às 10:00</small>'; cal.classList.add('show'); });
}
