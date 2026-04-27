/* ==================================================================
   ISSUES STUDY — Cross-Examination
   Orchestrator. Renders all 6 sections, handles modal/workshop/skin.
   No build step, no framework — vanilla ES6.
   ================================================================== */

'use strict';

// === STATE ============================================================

const STATE = {
    questions: null,
    thinkers: null,
    criteria: null,
    exemplars: null,
    soliloquies: null,
    activeDomain: null,
    activeThinker: null,
    workshop: {
        name: '',
        draft: '',
        thoughts: '',
        philosophers: ['', '', ''],
        criteriaState: {},  // { interrogative: 'granted' | 'examining' | 'struck' | null }
        format: 'written'
    },
    audioCtx: null,
    drone: null,
    soundOn: false
};

const DOMAIN_LABELS = {
    'ethics':       { name: 'Ethics',                hook: 'What ought we to do, and what kind of person should we be?' },
    'metaphysics':  { name: 'Metaphysics',           hook: 'What is real? What persists? What does it mean to be?' },
    'epistemology': { name: 'Epistemology',          hook: 'What do you know — and how, exactly, do you know it?' },
    'political':    { name: 'Political Philosophy',  hook: 'Why have a state at all? When is its authority legitimate?' },
    'religion':     { name: 'Philosophy of Religion', hook: 'Can belief survive examination? Should it?' },
    'mind-tech':    { name: 'Philosophy of Mind & Tech', hook: 'Could a machine think? Could you ever know it does?' },
    'aesthetics':   { name: 'Aesthetics',            hook: 'What makes something beautiful? Who decides?' }
};

const DOMAIN_ORDER = ['ethics','metaphysics','epistemology','political','religion','mind-tech','aesthetics'];

// === BOOT ============================================================

(async function boot() {
    try {
        const [q, t, c, e, s] = await Promise.all([
            fetch('data/questions.json').then(r => r.json()),
            fetch('data/thinkers.json').then(r => r.json()),
            fetch('data/criteria.json').then(r => r.json()),
            fetch('data/exemplars.json').then(r => r.json()),
            fetch('data/soliloquies.json').then(r => r.json())
        ]);
        STATE.questions = q;
        STATE.thinkers = t;
        STATE.criteria = c;
        STATE.exemplars = e.exemplars;
        STATE.exemplarsKey = e.key_takeaway;
        STATE.soliloquies = s.soliloquies;

        loadWorkshop();
        renderHero();
        renderCriteria();
        renderAllCriteria();
        renderExemplars();
        renderDomains();
        renderThinkers();
        renderGuiding();
        renderWorkshop();
        renderPhilosopherPickers();
        wireNav();
        wireModal();
        wireWorkshop();
        wireCommit();
        wireScrollSpy();
        wireSoundToggle();
    } catch (err) {
        console.error('Boot failed:', err);
        document.body.innerHTML = '<p style="color:#F2EEE6; font-family: monospace; padding: 2rem;">Site failed to load. Check that all JSON files in /data/ are present, and serve from a local HTTP server (file:// blocks fetch). Run: <code>python -m http.server 8000</code> from the site folder. Error: ' + err.message + '</p>';
    }
})();

// === HERO TYPED OVERLAY =============================================
// CSS adds the "> " prefix via ::before; JS string must NOT include it
// or the rendered text becomes ">> What does it mean…".

function renderHero() {
    const text = 'What does it mean to choose a question worth defending?';
    const target = document.getElementById('heroTypedText');
    if (!target) return;
    let i = 0;
    function tick() {
        if (i < text.length) {
            target.textContent = text.slice(0, ++i);
            const ch = text[i - 1];
            const delay = (ch === ' ' || ch === '?') ? 60 : 35 + Math.random() * 30;
            setTimeout(tick, delay);
        }
    }
    setTimeout(tick, 800);
}

// === §2 CRITERIA & EXEMPLARS =======================================

function renderCriteria() {
    const wrap = document.getElementById('criteriaList');
    if (!wrap) return;
    wrap.innerHTML = STATE.criteria.primary_five.map(c => `
        <article class="criterion" data-emphasis="primary">
            <p class="criterion__tag">${escapeHtml(c.sace_tag)}</p>
            <h4 class="criterion__label">${escapeHtml(c.label)}</h4>
            <p class="criterion__explainer">${escapeHtml(c.explainer)}</p>
        </article>
    `).join('');
}

function renderAllCriteria() {
    const wrap = document.getElementById('allCriteriaList');
    if (!wrap) return;
    wrap.innerHTML = STATE.criteria.all_eight.map(c => {
        const colour = c.emphasis === 'primary' ? 'var(--paper)' : 'var(--color-grant)';
        return `<li><strong style="color:var(--color-grant); margin-right:0.5em">${escapeHtml(c.tag)}</strong>${escapeHtml(c.label)}</li>`;
    }).join('');
}

function renderExemplars() {
    const wrap = document.getElementById('exemplarsList');
    if (!wrap) return;
    wrap.innerHTML = STATE.exemplars.map(ex => {
        const failures = ex.what_lost_grade
            ? `<ul class="exemplar__failures">${ex.what_lost_grade.map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul>`
            : '';
        const strengths = ex.what_earned_grade
            ? `<ul class="exemplar__strengths">${ex.what_earned_grade.map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul>`
            : '';
        return `
            <article class="exemplar" data-grade="${escapeHtml(ex.grade)}">
                <p class="exemplar__grade">${escapeHtml(ex.label)}</p>
                <p class="exemplar__question">${escapeHtml(ex.question)}</p>
                ${strengths}${failures}
            </article>
        `;
    }).join('');

    const keyEl = document.getElementById('exemplarsKey');
    if (keyEl) keyEl.textContent = STATE.exemplarsKey || '';
}

// === §3 DOMAINS ====================================================

function renderDomains() {
    const wrap = document.getElementById('domainConstellation');
    if (!wrap) return;
    const counts = countByDomain(STATE.questions);

    wrap.innerHTML = DOMAIN_ORDER.map(d => {
        const meta = DOMAIN_LABELS[d];
        return `
            <button class="domain-card" data-domain="${d}" type="button" aria-selected="false">
                <h3 class="domain-card__name">${escapeHtml(meta.name)}</h3>
                <span class="domain-card__count">${counts[d] || 0} questions</span>
                <p class="domain-card__hook">${escapeHtml(meta.hook)}</p>
            </button>
        `;
    }).join('');

    wrap.querySelectorAll('.domain-card').forEach(btn => {
        btn.addEventListener('click', () => selectDomain(btn.dataset.domain));
    });
}

function selectDomain(d) {
    STATE.activeDomain = d;
    document.documentElement.dataset.domain = d;

    document.querySelectorAll('.domain-card').forEach(c => {
        c.setAttribute('aria-selected', c.dataset.domain === d ? 'true' : 'false');
    });

    const detail = document.getElementById('domainDetail');
    const title = document.getElementById('domainDetailTitle');
    const count = document.getElementById('domainDetailCount');
    const list = document.getElementById('domainDetailQuestions');
    if (!detail) return;

    const meta = DOMAIN_LABELS[d];
    const qs = STATE.questions.filter(q => q.domain === d);
    title.textContent = meta.name;
    count.textContent = `${qs.length} questions`;
    list.innerHTML = qs.map(q =>
        `<li class="domain-question" data-origin="${q.origin}">${escapeHtml(q.text)}</li>`
    ).join('');
    detail.removeAttribute('hidden');
    detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// === §4 THINKERS ===================================================

function renderThinkers() {
    const wrap = document.getElementById('thinkersClusters');
    if (!wrap) return;

    // Cross-cutting cluster is hard-coded by ID because Murdoch is filed
    // under domain="ethics" in the data (her primary specialty) but belongs
    // visually with Hobbes (political) and Žižek (critical theory) as the
    // 3-philosopher cross-cutting row in the lineup design.
    const CROSS_CUT_IDS = new Set(['hobbes', 'zizek', 'murdoch']);
    const isCross = t => CROSS_CUT_IDS.has(t.id);

    const byDomain = {
        ethics:        STATE.thinkers.filter(t => t.domain === 'ethics' && !isCross(t)),
        epistemology:  STATE.thinkers.filter(t => t.domain === 'epistemology'),
        metaphysics:   STATE.thinkers.filter(t => t.domain === 'metaphysics'),
        crossCutting:  STATE.thinkers.filter(isCross)
    };

    const clusters = [
        { id: 'ethics',       title: 'Ethics',                count: byDomain.ethics.length,       extra: '', list: byDomain.ethics },
        { id: 'epistemology', title: 'Epistemology',          count: byDomain.epistemology.length, extra: '', list: byDomain.epistemology },
        { id: 'metaphysics',  title: 'Metaphysics',           count: byDomain.metaphysics.length,  extra: '', list: byDomain.metaphysics },
        { id: 'cross',        title: 'Cross-cutting',         count: byDomain.crossCutting.length, extra: 'Political · Critical · Aesthetic-moral', list: byDomain.crossCutting }
    ];

    wrap.innerHTML = clusters.map(cl => `
        <section class="thinker-cluster" data-domain="${cl.id}">
            <header class="thinker-cluster__head">
                <h3 class="thinker-cluster__title">${escapeHtml(cl.title)}</h3>
                <span class="thinker-cluster__count">${cl.count} ${cl.extra ? '· ' + escapeHtml(cl.extra) : ''}</span>
            </header>
            <div class="thinker-row ${cl.id === 'cross' ? 'thinker-row--cross-cut' : ''}">
                ${cl.list.map(t => `
                    <button class="thinker-card" type="button" data-thinker="${t.id}">
                        <img class="thinker-card__portrait" src="${t.portrait}" alt="Portrait of ${escapeHtml(t.name)}">
                        <span class="thinker-card__name">${escapeHtml(t.name)}</span>
                        <span class="thinker-card__era">${escapeHtml(t.era)}</span>
                        <span class="thinker-card__hook">${escapeHtml(t.hook)}</span>
                    </button>
                `).join('')}
            </div>
        </section>
    `).join('');

    wrap.querySelectorAll('.thinker-card').forEach(card => {
        card.addEventListener('click', () => openThinkerModal(card.dataset.thinker));
    });
}

// === MODAL =========================================================

function openThinkerModal(id) {
    const t = STATE.thinkers.find(x => x.id === id);
    if (!t) return;
    // Remember the element that opened the modal so we can return focus to
    // it when the modal closes (keyboard accessibility).
    STATE._lastModalTrigger = document.activeElement;
    STATE.activeThinker = id;
    document.documentElement.dataset.thinker = id;
    document.documentElement.dataset.domain = t.domain;

    document.getElementById('modalEra').textContent = t.era;
    document.getElementById('modalName').textContent = t.name;
    document.getElementById('modalPrimaryText').textContent = `From ${t.primary_text}`;
    document.getElementById('modalHook').textContent = t.hook;
    document.getElementById('modalBio').textContent = t.bio;
    document.getElementById('modalPortrait').src = t.portrait;
    document.getElementById('modalPortrait').alt = `Portrait of ${t.name}`;

    const audio = document.getElementById('modalAudio');
    audio.src = `assets/audio/${id}.wav`;
    audio.load();

    const transcriptDiv = document.getElementById('modalTranscript');
    const sol = STATE.soliloquies.find(s => s.id === id);
    transcriptDiv.textContent = sol ? sol.script : '';
    transcriptDiv.classList.remove('is-visible');
    document.getElementById('modalTranscriptToggle').textContent = 'Show transcript';

    // Linked questions
    const list = document.getElementById('modalSpeaksToList');
    const linked = (t.linked_question_ids || []).slice(0, 6).map(qid => {
        const q = STATE.questions.find(x => x.id === qid);
        return q ? `<li>${escapeHtml(q.text)}</li>` : '';
    }).filter(Boolean);
    list.innerHTML = linked.length ? linked.join('') :
        `<li style="opacity:0.6">No direct bank links — this thinker is a foil for adjacent positions.</li>`;

    document.getElementById('modalBackdrop').classList.add('is-open');
    document.body.style.overflow = 'hidden';
    // Move focus into the modal for keyboard users. requestAnimationFrame
    // ensures the modal is visible and laid out before we focus, without
    // the racy setTimeout that could fire before the browser had painted.
    requestAnimationFrame(() => {
        const closeBtn = document.getElementById('modalClose');
        if (closeBtn) closeBtn.focus();
    });
}

// Focusable selectors used by the modal focus trap. Excludes elements that
// are disabled, tabindex=-1, or hidden by being out of layout.
const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'audio[controls]',
    'video[controls]',
    '[tabindex]:not([tabindex="-1"])'
].join(',');

function getModalFocusables() {
    const backdrop = document.getElementById('modalBackdrop');
    if (!backdrop) return [];
    return Array.from(backdrop.querySelectorAll(FOCUSABLE_SELECTOR))
        .filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
}

function trapModalFocus(e) {
    if (e.key !== 'Tab') return;
    const backdrop = document.getElementById('modalBackdrop');
    if (!backdrop || !backdrop.classList.contains('is-open')) return;
    const focusables = getModalFocusables();
    if (!focusables.length) {
        e.preventDefault();
        return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    // If focus has somehow escaped the modal, pull it back in.
    if (!backdrop.contains(active)) {
        e.preventDefault();
        first.focus();
        return;
    }
    if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
    } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
    }
}

function closeModal() {
    const audio = document.getElementById('modalAudio');
    audio.pause();
    audio.currentTime = 0;
    document.getElementById('modalBackdrop').classList.remove('is-open');
    document.body.style.overflow = '';
    delete document.documentElement.dataset.thinker;
    STATE.activeThinker = null;
    // Return focus to the card that opened the modal
    if (STATE._lastModalTrigger && typeof STATE._lastModalTrigger.focus === 'function') {
        try { STATE._lastModalTrigger.focus(); } catch (e) { /* element may have been removed */ }
        STATE._lastModalTrigger = null;
    }
}

function wireModal() {
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalBackdrop').addEventListener('click', e => {
        if (e.target.id === 'modalBackdrop') closeModal();
    });
    document.addEventListener('keydown', e => {
        const backdrop = document.getElementById('modalBackdrop');
        if (!backdrop || !backdrop.classList.contains('is-open')) return;
        if (e.key === 'Escape') {
            closeModal();
        } else if (e.key === 'Tab') {
            trapModalFocus(e);
        }
    });
    document.getElementById('modalTranscriptToggle').addEventListener('click', () => {
        const t = document.getElementById('modalTranscript');
        const btn = document.getElementById('modalTranscriptToggle');
        t.classList.toggle('is-visible');
        btn.textContent = t.classList.contains('is-visible') ? 'Hide transcript' : 'Show transcript';
    });
}

// === §5 WORKSHOP ===================================================

function renderGuiding() {
    const list = document.getElementById('guidingList');
    if (!list) return;
    list.innerHTML = STATE.criteria.task_guiding_questions.map(q =>
        `<li>${escapeHtml(q.text)}<small>${escapeHtml(q.maps_to)}</small></li>`
    ).join('');
}

function renderWorkshop() {
    // Criteria adjudication margin
    const ul = document.getElementById('criteriaCheck');
    if (!ul) return;
    ul.innerHTML = STATE.criteria.primary_five.map(c => {
        const state = STATE.workshop.criteriaState[c.id] || null;
        return `
            <li class="criterion-check" data-cid="${c.id}" data-state="${state || ''}" tabindex="0" role="button" aria-label="Adjudicate: ${escapeHtml(c.label)}">
                <span class="criterion-check__mark">${markFor(state)}</span>
                <span class="criterion-check__label">${escapeHtml(c.label)}</span>
                <button class="criterion-check__expander" type="button" aria-expanded="false">Show worked examples ↓</button>
                <div class="criterion-check__examples">
                    ${c.examples.map(ex => `
                        <p class="criterion-example">
                            <span class="criterion-example__verdict" data-v="${escapeHtml(ex.verdict)}">${escapeHtml(ex.verdict.replace(/-/g,' '))}</span>
                            <span class="criterion-example__text">"${escapeHtml(ex.text)}"</span>
                            <span class="criterion-example__why">${escapeHtml(ex.why)}</span>
                        </p>
                    `).join('')}
                </div>
            </li>
        `;
    }).join('');

    // Restore inputs
    const nameField = document.getElementById('nameInput');
    const draft = document.getElementById('draftInput');
    const thoughts = document.getElementById('thoughtsInput');
    if (nameField) nameField.value = STATE.workshop.name || '';
    if (draft) draft.value = STATE.workshop.draft;
    if (thoughts) thoughts.value = STATE.workshop.thoughts;

    // Restore format
    const fmt = document.querySelector(`input[name="format"][value="${STATE.workshop.format}"]`);
    if (fmt) fmt.checked = true;

    // Show autosave indicator if there's anything saved
    const hint = document.getElementById('autosaveHint');
    if (hint && (STATE.workshop.name || STATE.workshop.draft || STATE.workshop.thoughts)) {
        hint.textContent = 'Restored from this browser. Saves on every keystroke.';
        hint.classList.add('is-saved');
    }

    // Default the evidence panel (middle workshop column) to the first
    // criterion's worked examples so it's never empty.
    if (STATE.criteria.primary_five.length) {
        renderEvidencePanel(STATE.criteria.primary_five[0].id);
    }
}

// Populate the middle workshop column with a criterion's worked examples.
// Called on hover/focus/click of any criterion-check row in the right column.
function renderEvidencePanel(cid) {
    const wrap = document.getElementById('evidencePanel');
    if (!wrap) return;
    const c = STATE.criteria.primary_five.find(x => x.id === cid);
    if (!c) return;
    wrap.innerHTML = `
        <article class="evidence-active">
            <p class="evidence-active__tag">${escapeHtml(c.sace_tag)}</p>
            <h4 class="evidence-active__label">${escapeHtml(c.label)}</h4>
            <p class="evidence-active__explainer">${escapeHtml(c.explainer)}</p>
            <div class="evidence-active__examples">
                ${c.examples.map(ex => `
                    <p class="criterion-example">
                        <span class="criterion-example__verdict" data-v="${escapeHtml(ex.verdict)}">${escapeHtml(ex.verdict.replace(/-/g, ' '))}</span>
                        <span class="criterion-example__text">"${escapeHtml(ex.text)}"</span>
                        <span class="criterion-example__why">${escapeHtml(ex.why)}</span>
                    </p>
                `).join('')}
            </div>
        </article>
    `;
}

function renderPhilosopherPickers() {
    [1, 2, 3].forEach(n => {
        const sel = document.getElementById(`picker${n}`);
        if (!sel) return;
        const opts = STATE.thinkers.map(t =>
            `<option value="${t.id}">${escapeHtml(t.name)} — ${escapeHtml(t.domain)}</option>`
        ).join('');
        sel.innerHTML = `<option value="">— pick #${n} —</option>${opts}`;
        sel.value = STATE.workshop.philosophers[n - 1] || '';
    });
}

function markFor(state) {
    if (state === 'granted') return '✓';
    if (state === 'examining') return '?';
    if (state === 'struck') return '✗';
    return '·';
}

const STATE_CYCLE = [null, 'granted', 'examining', 'struck'];

function cycleCriterionState(cid) {
    const cur = STATE.workshop.criteriaState[cid] || null;
    const idx = STATE_CYCLE.indexOf(cur);
    const next = STATE_CYCLE[(idx + 1) % STATE_CYCLE.length];
    STATE.workshop.criteriaState[cid] = next;
    saveWorkshop();
    const li = document.querySelector(`.criterion-check[data-cid="${cid}"]`);
    if (li) {
        li.dataset.state = next || '';
        li.querySelector('.criterion-check__mark').textContent = markFor(next);
    }
    playUiSound(next);
}

function wireWorkshop() {
    const nameField = document.getElementById('nameInput');
    const draft = document.getElementById('draftInput');
    const thoughts = document.getElementById('thoughtsInput');

    function flashSaved() {
        const hint = document.getElementById('autosaveHint');
        if (!hint) return;
        hint.textContent = 'Saved.';
        hint.classList.add('is-saved');
        clearTimeout(flashSaved._t);
        flashSaved._t = setTimeout(() => {
            hint.textContent = 'Saves to this browser as you type. Won’t be lost if you close the tab.';
            hint.classList.remove('is-saved');
        }, 1200);
    }

    if (nameField) nameField.addEventListener('input', () => { STATE.workshop.name = nameField.value; saveWorkshop(); flashSaved(); });
    if (draft) draft.addEventListener('input', () => { STATE.workshop.draft = draft.value; saveWorkshop(); flashSaved(); });
    if (thoughts) thoughts.addEventListener('input', () => { STATE.workshop.thoughts = thoughts.value; saveWorkshop(); flashSaved(); });

    [1, 2, 3].forEach(n => {
        const sel = document.getElementById(`picker${n}`);
        if (!sel) return;
        sel.addEventListener('change', () => {
            STATE.workshop.philosophers[n - 1] = sel.value;
            saveWorkshop();
        });
    });

    document.querySelectorAll('input[name="format"]').forEach(r => {
        r.addEventListener('change', () => {
            if (r.checked) { STATE.workshop.format = r.value; saveWorkshop(); }
        });
    });

    document.querySelectorAll('.criterion-check').forEach(li => {
        // Hovering / focusing a criterion swaps the middle panel to its examples
        const showPanel = () => renderEvidencePanel(li.dataset.cid);
        li.addEventListener('mouseenter', showPanel);
        li.addEventListener('focusin', showPanel);

        li.addEventListener('click', e => {
            // Only cycle if click was on the row but not on the expander button
            if (e.target.closest('.criterion-check__expander')) return;
            if (e.target.closest('.criterion-check__examples')) return;
            renderEvidencePanel(li.dataset.cid);   // update middle panel too
            cycleCriterionState(li.dataset.cid);
        });
        li.querySelector('.criterion-check__expander').addEventListener('click', e => {
            e.stopPropagation();
            li.classList.toggle('is-expanded');
            const exp = li.querySelector('.criterion-check__expander');
            const isOpen = li.classList.contains('is-expanded');
            exp.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            exp.textContent = isOpen ? 'Hide worked examples ↑' : 'Show worked examples ↓';
        });
        li.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                if (e.target === li) {
                    e.preventDefault();
                    cycleCriterionState(li.dataset.cid);
                }
            }
        });
    });
}

// === §6 COMMIT ====================================================

function wireCommit() {
    document.getElementById('setDownBtn').addEventListener('click', async e => {
        e.preventDefault();
        playUiSound('commit');
        await downloadAsPdf();
    });

    // Live mailto: link
    const mailto = document.getElementById('mailtoBtn');
    function updateMailto() {
        const w = STATE.workshop;
        const lines = [
            `My Issues Study question (draft):`,
            ``,
            w.draft || '[no draft yet]',
            ``,
            `Format I plan to work in: ${w.format}`,
            ``,
            `Three philosophers I'll engage:`,
            (w.philosophers || []).map((id, i) => {
                const t = STATE.thinkers.find(x => x.id === id);
                return `  ${i + 1}. ${t ? t.name : '[not chosen]'}`;
            }).join('\n'),
            ``,
            `First thoughts on my position:`,
            ``,
            w.thoughts || '[no thoughts yet]'
        ];
        const subject = encodeURIComponent('Issues Study draft');
        const body = encodeURIComponent(lines.join('\n'));
        mailto.href = `mailto:peter.ellis.teacher@gmail.com?subject=${subject}&body=${body}`;
    }
    updateMailto();
    document.addEventListener('input', updateMailto);
    document.addEventListener('change', updateMailto);
}

// === REAL PDF DOWNLOAD (not print dialog) =========================
//
// Builds a hidden A4-styled "Set Down" sheet from current workshop state,
// rasterises it via html2canvas, paginates into a jsPDF, and triggers
// a true file download. Filename is "Issues-Study-<Name>.pdf".

async function downloadAsPdf() {
    const status = document.getElementById('pdfStatus');
    if (status) {
        status.textContent = 'Preparing PDF…';
        status.className = 'commit__pdf-status is-saving';
    }

    // Verify libraries loaded
    if (!window.html2canvas || !window.jspdf) {
        if (status) {
            status.textContent = 'PDF libraries failed to load. Check your internet connection and try again, or use the Email-to-Peter option.';
            status.className = 'commit__pdf-status is-error';
        }
        return;
    }

    const w = STATE.workshop;
    const studentName = (w.name || '').trim() || 'Unnamed Student';
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-AU', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const fmtMap = {
        written: 'Written response (max 2,000 words)',
        oral: 'Oral presentation (max 12 minutes)',
        multimodal: 'Multimodal (equivalent)'
    };
    const philosophersHtml = (w.philosophers || []).map((id, i) => {
        if (!id) return `<li><em>[Philosopher ${i + 1} not chosen]</em></li>`;
        const t = STATE.thinkers.find(x => x.id === id);
        if (!t) return `<li>${escapeHtml(id)}</li>`;
        return `<li><strong>${escapeHtml(t.name)}</strong>
            <span class="pdf-phil-era"> — ${escapeHtml(t.era)}</span><br>
            <span class="pdf-phil-hook">${escapeHtml(t.hook)}</span></li>`;
    }).join('');

    // Build the sheet off-screen at exact A4 print dimensions (210mm × ~297mm).
    // We render at 794px × 1123px (96 DPI A4) so html2canvas produces a clean image.
    const sheet = document.createElement('div');
    sheet.id = '__pdfSheet';
    sheet.innerHTML = `
        <header class="pdf__head">
            <p class="pdf__eyebrow">SACE Stage 2 Philosophy · AT3 Investigation · 30%</p>
            <h1 class="pdf__title">My question, set down.</h1>
            <p class="pdf__author">${escapeHtml(studentName)}</p>
            <p class="pdf__date">${escapeHtml(dateStr)}</p>
        </header>
        <section class="pdf__block">
            <h2>The question I will defend</h2>
            <p class="pdf__question">${escapeHtml(w.draft) || '<em>[No question drafted yet.]</em>'}</p>
            <p class="pdf__format">Format: ${escapeHtml(fmtMap[w.format] || w.format || 'not chosen')}</p>
        </section>
        <section class="pdf__block">
            <h2>The five guiding questions my final response must answer</h2>
            <ol class="pdf__guiding">
                <li><strong>RA1</strong> — Why is it a philosophical issue?</li>
                <li><strong>KU1, KU2</strong> — What positions do various philosophers hold?</li>
                <li><strong>KU2, RA2</strong> — What are the philosophers' reasons for holding these positions?</li>
                <li><strong>CA1</strong> — What objections or counter-examples are relevant?</li>
                <li><strong>RA3</strong> — What is my own position, and why?</li>
            </ol>
        </section>
        <section class="pdf__block">
            <h2>Three philosophers I will engage</h2>
            <ul class="pdf__philosophers">${philosophersHtml}</ul>
        </section>
        <section class="pdf__block">
            <h2>First thoughts on my position</h2>
            <div class="pdf__thoughts">${escapeHtml(w.thoughts) || '<em>[No first thoughts written yet.]</em>'}</div>
        </section>
        <section class="pdf__block pdf__signature">
            <h2>Signed</h2>
            <div class="pdf__sig-line"></div>
            <p class="pdf__sig-caption">Bring this to Peter on Monday. Be ready to be cross-examined on it.</p>
        </section>
        <footer class="pdf__foot">
            Issues Study · Cross-Examination · Set down on ${escapeHtml(dateStr)}
        </footer>
    `;
    document.body.appendChild(sheet);

    try {
        // Wait a tick so layout settles
        await new Promise(r => setTimeout(r, 50));

        const canvas = await window.html2canvas(sheet, {
            scale: 2,
            backgroundColor: '#FAFAF6',
            useCORS: true,
            logging: false
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageW = pdf.internal.pageSize.getWidth();   // 210
        const pageH = pdf.internal.pageSize.getHeight();  // 297

        const imgW = pageW;
        const imgH = (canvas.height * imgW) / canvas.width;

        let heightLeft = imgH;
        let position = 0;
        pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH);
        heightLeft -= pageH;
        while (heightLeft > 0) {
            position = heightLeft - imgH;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH);
            heightLeft -= pageH;
        }

        const safeName = studentName.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        const filename = `Issues-Study-${safeName}-${today.toISOString().slice(0, 10)}.pdf`;
        pdf.save(filename);

        if (status) {
            status.textContent = `Saved as ${filename}. Bring it to Peter on Monday.`;
            status.className = 'commit__pdf-status is-saved';
        }
    } catch (err) {
        console.error('PDF download failed:', err);
        if (status) {
            status.textContent = `PDF generation failed (${err.message}). Try the Email-to-Peter option instead.`;
            status.className = 'commit__pdf-status is-error';
        }
    } finally {
        // Remove the off-screen sheet
        if (sheet.parentNode) sheet.parentNode.removeChild(sheet);
    }
}

// === LOCALSTORAGE ==================================================

const LS_KEY = 'issues-study-workshop-v1';

function saveWorkshop() {
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(STATE.workshop));
    } catch (e) { /* private browsing, etc. */ }
}

function loadWorkshop() {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw);
        Object.assign(STATE.workshop, saved);
    } catch (e) { /* ignore */ }
}

// === NAV / SCROLL SPY ==============================================

function wireNav() {
    document.querySelectorAll('.nav__link').forEach(a => {
        a.addEventListener('click', e => {
            const target = a.getAttribute('href');
            if (target.startsWith('#')) {
                const el = document.querySelector(target);
                if (el) {
                    e.preventDefault();
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });
}

function wireScrollSpy() {
    const sectionMap = {
        'hero': null,
        'what': null,
        'domains': null,
        'thinkers': null,
        'workshop': null,
        'commit': null
    };
    Object.keys(sectionMap).forEach(id => sectionMap[id] = document.getElementById(id));

    const observer = new IntersectionObserver(entries => {
        entries.forEach(en => {
            if (en.isIntersecting) {
                const id = en.target.id;
                document.querySelectorAll('.nav__link').forEach(a => {
                    a.setAttribute('aria-current', a.getAttribute('href') === '#' + id ? 'true' : 'false');
                });
                // If this is a thinkers cluster, set the data-domain skin from cluster
                if (en.target.classList.contains('thinker-cluster')) {
                    const d = en.target.dataset.domain;
                    if (d && d !== 'cross' && !STATE.activeThinker) {
                        document.documentElement.dataset.domain = d === 'cross' ? 'political' : d;
                    }
                }
            }
        });
    }, { threshold: 0.4 });

    Object.values(sectionMap).forEach(el => el && observer.observe(el));
    document.querySelectorAll('.thinker-cluster').forEach(el => observer.observe(el));
}

// === WEB AUDIO — synthesised ambient drone (Lyria fallback) =======

async function ensureAudio() {
    if (!STATE.audioCtx) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return null;
        STATE.audioCtx = new Ctx();
    }
    // iOS Safari and several other browsers create the context in 'suspended'
    // state until a user gesture resumes it. Await the resume promise before
    // scheduling so oscillator start-times don't fall behind ctx.currentTime
    // when the clock jumps forward on resume.
    if (STATE.audioCtx.state === 'suspended') {
        try { await STATE.audioCtx.resume(); } catch (e) { /* ignore */ }
    }
    return STATE.audioCtx;
}

async function startDrone() {
    const ctx = await ensureAudio();
    if (!ctx) return;
    // If a stop was scheduled but hasn't completed, cancel it. If the drone
    // is still alive (mid-fade-out), ramp the gain back up instead of
    // returning early — otherwise a rapid off-then-on toggle leaves the
    // drone "on" but silent.
    if (STATE._stopTimer) {
        clearTimeout(STATE._stopTimer);
        STATE._stopTimer = null;
        if (STATE.drone) {
            const g = STATE.drone.master.gain;
            g.cancelScheduledValues(ctx.currentTime);
            g.setValueAtTime(g.value, ctx.currentTime);
            g.linearRampToValueAtTime(0.6, ctx.currentTime + 1);
            return;
        }
    }
    if (STATE.drone) return;

    // Two slightly detuned low oscillators + a high shimmer + filtered noise
    const master = ctx.createGain();
    master.gain.value = 0.0;
    master.connect(ctx.destination);

    const o1 = ctx.createOscillator();
    o1.type = 'sine';
    o1.frequency.value = 110; // A2
    const g1 = ctx.createGain();
    g1.gain.value = 0.18;
    o1.connect(g1).connect(master);

    const o2 = ctx.createOscillator();
    o2.type = 'sine';
    o2.frequency.value = 110.5;  // slight detune for warmth
    const g2 = ctx.createGain();
    g2.gain.value = 0.14;
    o2.connect(g2).connect(master);

    const o3 = ctx.createOscillator();
    o3.type = 'triangle';
    o3.frequency.value = 165; // perfect fifth above
    const g3 = ctx.createGain();
    g3.gain.value = 0.06;
    o3.connect(g3).connect(master);

    // High air shimmer
    const o4 = ctx.createOscillator();
    o4.type = 'sine';
    o4.frequency.value = 880;
    const g4 = ctx.createGain();
    g4.gain.value = 0.0;
    // LFO to modulate the shimmer
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.02;
    lfo.connect(lfoGain).connect(g4.gain);
    o4.connect(g4).connect(master);

    // Slow fade in
    master.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 4);

    o1.start(); o2.start(); o3.start(); o4.start(); lfo.start();
    STATE.drone = { master, oscs: [o1, o2, o3, o4, lfo] };
}

function stopDrone() {
    if (!STATE.drone) return;
    const ctx = STATE.audioCtx;
    STATE.drone.master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
    STATE._stopTimer = setTimeout(() => {
        if (STATE.drone) {
            STATE.drone.oscs.forEach(o => { try { o.stop(); } catch (e) {} });
            STATE.drone = null;
        }
        STATE._stopTimer = null;
    }, 1700);
}

function wireSoundToggle() {
    const btn = document.getElementById('soundToggle');
    if (!btn) return;
    btn.addEventListener('click', async () => {
        STATE.soundOn = !STATE.soundOn;
        if (STATE.soundOn) {
            btn.textContent = 'Sound: on';
            await startDrone();
        } else {
            btn.textContent = 'Sound: off';
            stopDrone();
        }
    });
}

// === UI SOUNDS — paper rustle / pen scratch / gavel / chord =======

async function playUiSound(kind) {
    if (!STATE.soundOn) return;
    const ctx = await ensureAudio();
    if (!ctx) return;

    if (kind === 'granted') {
        // soft paper rustle (filtered noise)
        playNoise(ctx, 0.18, 1500, 800);
    } else if (kind === 'struck') {
        // pen scratch — quick sweep noise
        playNoise(ctx, 0.10, 700, 1200);
    } else if (kind === 'examining') {
        // small gavel tap
        playTap(ctx, 220);
    } else if (kind === 'commit') {
        // ambiguous chord
        playChord(ctx, [261.63, 392.00, 415.30]); // C, G, A♭ — open-fifth + minor sixth
    }
}

function playNoise(ctx, dur, freq, q) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.4;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = q / 100;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.4, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    src.connect(filter).connect(g).connect(ctx.destination);
    src.start();
    src.stop(ctx.currentTime + dur);
}

function playTap(ctx, freq) {
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.18);
}

function playChord(ctx, freqs) {
    freqs.forEach((f, i) => {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = f;
        const g = ctx.createGain();
        const start = ctx.currentTime + i * 0.5;
        g.gain.setValueAtTime(0, start);
        g.gain.linearRampToValueAtTime(0.20, start + 0.4);
        g.gain.linearRampToValueAtTime(0, start + 4.0);
        o.connect(g).connect(ctx.destination);
        o.start(start);
        o.stop(start + 4.1);
    });
}

// === HELPERS =======================================================

function countByDomain(qs) {
    const out = {};
    qs.forEach(q => { out[q.domain] = (out[q.domain] || 0) + 1; });
    return out;
}

function escapeHtml(s) {
    if (typeof s !== 'string') return '';
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
