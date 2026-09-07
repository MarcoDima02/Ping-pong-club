// ⚠️ Inserisci qui le tue credenziali di Supabase
const SUPABASE_URL = "https://ehczcxhebvzhsisehogt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_uzyAkSCuJsijBI6VRiwmqg_qWatb1PF";
const OFFICEPONG_ACCESS_PASSWORD = 'gbs';
const OFFICEPONG_ADMIN_PASSWORD = 'gbsadmin';
const OFFICEPONG_CASA_PASSWORD = 'casa';
const OFFICEPONG_ACCESS_KEY = 'officepong_access_granted';
const OFFICEPONG_ROLE_KEY = 'officepong_role';

// Inizializza il client globale
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const AVATAR_BUCKET = 'avatars';

window.renderAvatar = function(avatarUrl, name, sizeClasses = 'w-8 h-8') {
	const fallback = '👤';
	if (avatarUrl) {
		return `
			<img
				src="${avatarUrl}"
				alt="Avatar di ${name}"
				class="${sizeClasses} rounded-full object-cover border border-slate-200 bg-white shrink-0"
			>
		`;
	}

	return `
		<div class="${sizeClasses} rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold border border-emerald-200 shrink-0">
			${fallback}
		</div>
	`;
};

window.initAuthGate = async function() {
	if (window.localStorage.getItem(OFFICEPONG_ACCESS_KEY) !== 'true') {
		window.location.href = 'login.html';
		return null;
	}

	return true;
};

window.signOut = async function() {
	window.localStorage.removeItem(OFFICEPONG_ACCESS_KEY);
	window.localStorage.removeItem(OFFICEPONG_ROLE_KEY);
	window.location.href = 'login.html';
};

window.verifyAppPassword = function(password) {
	if (password === OFFICEPONG_ADMIN_PASSWORD)  return 'admin';
	if (password === OFFICEPONG_ACCESS_PASSWORD) return 'user';
	if (password === OFFICEPONG_CASA_PASSWORD)   return 'casa';
	return null;
};

window.isAdmin = function() {
	const role = window.localStorage.getItem(OFFICEPONG_ROLE_KEY);
	return role === 'admin' || role === 'casa';
};

// Restituisce il contesto attivo: 'office' oppure 'casa'
window.getContext = function() {
	return window.localStorage.getItem(OFFICEPONG_ROLE_KEY) === 'casa' ? 'casa' : 'office';
};

// Season corrente per contesto: le partite di stagioni precedenti restano nel
// DB (colonna "season" su matches) ma non vengono più mostrate/contate.
const OFFICEPONG_CURRENT_SEASON = { office: 2, casa: 1 };
window.getCurrentSeason = function() {
	return OFFICEPONG_CURRENT_SEASON[getContext()] || 1;
};

// ── BADGE: TRAGUARDI DI CARRIERA (stile C, enamel pin) ──────────────
// Sbloccati una tantum ("milestone") o aggiornati nel tempo ("record").
// check/value ricevono le "signal" prodotte da computePlayerBadgeSignals().
const BADGE_CATALOG = [
	{ id: 'first_win',         type: 'milestone', tier: 'bronze', icon: '🏆', label: 'Prima Vittoria',  desc: 'Vinci la tua prima partita della stagione.',                        check: function (s) { return s.wins >= 1; } },
	{ id: 'matches_10',        type: 'milestone', tier: 'bronze', icon: '🎖️', label: 'Veterano',        desc: 'Gioca 10 partite in questa stagione.',                              check: function (s) { return s.total >= 10; } },
	{ id: 'win_streak_3',      type: 'milestone', tier: 'bronze', icon: '🔥', label: 'Tris',            desc: 'Vinci 3 partite di fila.',                                          check: function (s) { return s.bestWinStreak >= 3; } },
	{ id: 'win_streak_5',      type: 'milestone', tier: 'silver', icon: '⚡', label: 'Cinquina',        desc: 'Vinci 5 partite di fila.',                                          check: function (s) { return s.bestWinStreak >= 5; } },
	{ id: 'win_streak_10',     type: 'milestone', tier: 'gold',   icon: '👑', label: 'Inarrestabile',   desc: 'Vinci 10 partite di fila.',                                         check: function (s) { return s.bestWinStreak >= 10; } },
	{ id: 'win_streak_15',     type: 'milestone', tier: 'gold',   icon: '💫', label: 'Leggenda',        desc: 'Vinci 15 partite di fila.',                                         check: function (s) { return s.bestWinStreak >= 15; } },
	{ id: 'win_streak_20',     type: 'milestone', tier: 'gold',   icon: '🚀', label: 'Fenomeno',        desc: 'Vinci 20 partite di fila.',                                         check: function (s) { return s.bestWinStreak >= 20; } },
	{ id: 'win_streak_30',     type: 'milestone', tier: 'gold',   icon: '🐐', label: 'GOAT',            desc: 'Vinci 30 partite di fila — il record di Paolo!',                   check: function (s) { return s.bestWinStreak >= 30; } },
	{ id: 'loss_streak_3',     type: 'milestone', tier: 'bronze', icon: '💩', label: 'Periodo No',      desc: 'Perdi 3 partite di fila.',                                          check: function (s) { return s.worstLossStreak >= 3; } },
	{ id: 'loss_streak_5',     type: 'milestone', tier: 'silver', icon: '🥶', label: 'Crisi Nera',      desc: 'Perdi 5 partite di fila.',                                          check: function (s) { return s.worstLossStreak >= 5; } },
	{ id: 'giant_slayer',      type: 'milestone', tier: 'silver', icon: '⚔️', label: 'Giant Slayer',    desc: 'Batti un avversario con almeno 150 punti ELO in più di te.',       check: function (s) { return s.giantSlayer; } },
	{ id: 'best_win_streak',   type: 'record',    tier: 'gold',   icon: '🏅', label: 'Record Vittorie', desc: 'La striscia di vittorie consecutive più lunga mai raggiunta.',     value: function (s) { return s.bestWinStreak; } },
	{ id: 'worst_loss_streak', type: 'record',    tier: 'gold',   icon: '🪦', label: 'Record Sconfitte', desc: 'La striscia di sconfitte consecutive più lunga mai raggiunta.',   value: function (s) { return s.worstLossStreak; } },
];

// ── BADGE: RICONOSCIMENTI MENSILI (stile B, medaglia + nastro) ──────
// Calcolati una volta a mese (vedi ensureMonthlyBadgesComputed), persistiti
// con year/month per restare in bacheca anche dopo la fine del mese.
const MONTHLY_BADGE_META = {
	monthly_top1:          { icon: '🥇', label: '1° Classificato',         tier: 'gold',   desc: '1° in classifica alla fine del mese.' },
	monthly_top2:          { icon: '🥈', label: '2° Classificato',         tier: 'silver', desc: '2° in classifica alla fine del mese.' },
	monthly_top3:          { icon: '🥉', label: '3° Classificato',         tier: 'bronze', desc: '3° in classifica alla fine del mese.' },
	monthly_most_active:   { icon: '🎯', label: 'Più Attivo',              tier: 'gold',   desc: 'Il giocatore con più partite disputate nel mese.' },
	monthly_best_winrate:  { icon: '📈', label: 'Miglior Win Rate',        tier: 'gold',   desc: 'Miglior percentuale di vittorie nel mese (minimo 10 partite).' },
	monthly_biggest_win:   { icon: '💥', label: 'Vittoria più Netta',      tier: 'gold',   desc: 'La vittoria con lo scarto di punti più ampio del mese.' },
	monthly_closest_match: { icon: '⚔️', label: 'Partita più Combattuta', tier: 'gold',   desc: 'La partita più combattuta (scarto minimo) del mese.' },
};

window.OFFICEPONG_MONTH_NAMES = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
	'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

// Ricalcola, da una lista di partite (ascendente per id, stesso context+season),
// ELO progressivo di tutti i giocatori e i segnali di badge per playerName.
function computePlayerBadgeSignals(matches, playerName) {
	const eloMap = {};
	let winStreak = 0, lossStreak = 0, bestWinStreak = 0, worstLossStreak = 0;
	let total = 0, wins = 0, giantSlayer = false;

	matches.forEach(function (m) {
		if (!(m.p1 in eloMap)) eloMap[m.p1] = 1000;
		if (!(m.p2 in eloMap)) eloMap[m.p2] = 1000;
		const r1 = eloMap[m.p1], r2 = eloMap[m.p2];
		const p1Wins = m.s1 > m.s2;

		if (m.p1 === playerName || m.p2 === playerName) {
			total++;
			const iAmP1 = m.p1 === playerName;
			const iWon = iAmP1 ? p1Wins : !p1Wins;
			const myEloBefore = iAmP1 ? r1 : r2;
			const oppEloBefore = iAmP1 ? r2 : r1;

			if (iWon) {
				wins++;
				winStreak++; lossStreak = 0;
				if (winStreak > bestWinStreak) bestWinStreak = winStreak;
				if (oppEloBefore - myEloBefore >= 150) giantSlayer = true;
			} else {
				lossStreak++; winStreak = 0;
				if (lossStreak > worstLossStreak) worstLossStreak = lossStreak;
			}
		}

		const e1 = 1 / (1 + Math.pow(10, (r2 - r1) / 400));
		const e2 = 1 / (1 + Math.pow(10, (r1 - r2) / 400));
		const K = 32;
		eloMap[m.p1] = Math.round(r1 + K * ((p1Wins ? 1 : 0) - e1));
		eloMap[m.p2] = Math.round(r2 + K * ((p1Wins ? 0 : 1) - e2));
	});

	return { total: total, wins: wins, bestWinStreak: bestWinStreak, worstLossStreak: worstLossStreak, giantSlayer: giantSlayer };
}

// Da chiamare dopo ogni salvataggio/modifica di partita: ricalcola i segnali
// dei giocatori coinvolti e assegna eventuali nuovi badge di carriera.
window.checkAndAwardCareerBadges = async function (context, season, playerNames) {
	const matchesRes = await _supabase.from('matches').select('*').eq('context', context).eq('season', season).order('id', { ascending: true });
	const matches = matchesRes.data || [];

	const existingRes = await _supabase.from('player_badges').select('player_name, badge_id, value')
		.eq('context', context).eq('season', season).is('year', null).in('player_name', playerNames);
	const existing = existingRes.data || [];

	for (const name of playerNames) {
		const signals = computePlayerBadgeSignals(matches, name);
		const existingForPlayer = existing.filter(function (r) { return r.player_name === name; });

		for (const b of BADGE_CATALOG) {
			if (b.type === 'milestone') {
				const already = existingForPlayer.some(function (r) { return r.badge_id === b.id; });
				if (!already && b.check(signals)) {
					await _supabase.from('player_badges').insert([{ context: context, player_name: name, season: season, badge_id: b.id }]);
					showToast('🏅 Nuovo badge: ' + b.icon + ' ' + b.label + '!');
				}
			} else {
				const newValue = b.value(signals);
				const existingRow = existingForPlayer.find(function (r) { return r.badge_id === b.id; });
				if (newValue > 0 && (!existingRow || newValue > existingRow.value)) {
					if (existingRow) {
						await _supabase.from('player_badges').update({ value: newValue, unlocked_at: new Date().toISOString() }).eq('id', existingRow.id);
					} else {
						await _supabase.from('player_badges').insert([{ context: context, player_name: name, season: season, badge_id: b.id, value: newValue }]);
					}
					showToast('🏅 Nuovo record: ' + b.icon + ' ' + b.label + ' (' + newValue + ')!');
				}
			}
		}
	}
};

// Da chiamare al caricamento del report mensile (solo quando è "pronto"):
// calcola una tantum i riconoscimenti del mese, se non già presenti.
window.ensureMonthlyBadgesComputed = async function (year, month, context, monthMatches, ranking) {
	const existing = await _supabase.from('player_badges').select('id').eq('context', context).eq('year', year).eq('month', month).limit(1);
	if (existing.data && existing.data.length > 0) return;

	const season = getCurrentSeason();
	const rows = [];
	const podiumIds = ['monthly_top1', 'monthly_top2', 'monthly_top3'];
	for (let i = 0; i < 3; i++) {
		if (ranking[i]) rows.push({ context: context, player_name: ranking[i].name, season: season, badge_id: podiumIds[i], year: year, month: month });
	}

	const mostActive = [...ranking].sort(function (a, b) { return b.total - a.total; })[0];
	if (mostActive) rows.push({ context: context, player_name: mostActive.name, season: season, badge_id: 'monthly_most_active', year: year, month: month, value: mostActive.total });

	const qualified = ranking.filter(function (p) { return p.total >= 10; });
	const topRate = qualified.length ? qualified.sort(function (a, b) { return b.rate - a.rate; })[0] : null;
	if (topRate) rows.push({ context: context, player_name: topRate.name, season: season, badge_id: 'monthly_best_winrate', year: year, month: month, value: Math.round(topRate.rate * 100) });

	if (monthMatches.length > 0) {
		let biggestWin = monthMatches[0], closestMatch = monthMatches[0];
		monthMatches.forEach(function (m) {
			if (Math.abs(m.s1 - m.s2) > Math.abs(biggestWin.s1 - biggestWin.s2)) biggestWin = m;
			const mDiff = Math.abs(m.s1 - m.s2), cDiff = Math.abs(closestMatch.s1 - closestMatch.s2);
			if (mDiff < cDiff || (mDiff === cDiff && (m.s1 + m.s2) > (closestMatch.s1 + closestMatch.s2))) closestMatch = m;
		});
		const bigWinner = biggestWin.s1 > biggestWin.s2 ? biggestWin.p1 : biggestWin.p2;
		rows.push({ context: context, player_name: bigWinner, season: season, badge_id: 'monthly_biggest_win', year: year, month: month });
		rows.push({ context: context, player_name: closestMatch.p1, season: season, badge_id: 'monthly_closest_match', year: year, month: month });
		rows.push({ context: context, player_name: closestMatch.p2, season: season, badge_id: 'monthly_closest_match', year: year, month: month });
	}

	if (rows.length) await _supabase.from('player_badges').insert(rows);
};

// Capitoli ("sezioni") in cui raggruppare i traguardi di carriera nel libro.
const CAREER_BADGE_SECTIONS = [
	{ title: 'Vittorie', icon: '🏆', ids: ['first_win', 'matches_10'] },
	{ title: 'Streak di Vittorie', icon: '🔥', ids: ['win_streak_3', 'win_streak_5', 'win_streak_10', 'win_streak_15', 'win_streak_20', 'win_streak_30'] },
	{ title: 'Streak di Sconfitte', icon: '💩', ids: ['loss_streak_3', 'loss_streak_5'] },
	{ title: 'Record & Speciali', icon: '🏅', ids: ['giant_slayer', 'best_win_streak', 'worst_loss_streak'] },
];

const BADGE_CHAPTER_CHEVRON = '<svg class="opc-badge-chapter-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>';

function renderCareerBadgeCol(b, row) {
	const unlocked = !!row;
	const valueSuffix = (b.type === 'record' && row && row.value) ? ' — record attuale: ' + row.value : '';
	return '<div class="opc-badge-row' + (unlocked ? '' : ' opc-badge-row--locked') + '">' +
		'<div class="opc-badge-c tier-' + b.tier + (unlocked ? '' : ' opc-badge-c--locked') + '">' + b.icon + '</div>' +
		'<div class="opc-badge-row-text">' +
			'<div class="opc-badge-row-name">' + b.label + (unlocked ? '' : ' 🔒') + '</div>' +
			'<div class="opc-badge-row-desc">' + b.desc + valueSuffix + '</div>' +
		'</div>' +
	'</div>';
}

function renderMonthlyBadgeCol(r) {
	const meta = MONTHLY_BADGE_META[r.badge_id];
	if (!meta) return '';
	const valueSuffix = r.value ? ' — ' + r.value + (r.badge_id === 'monthly_best_winrate' ? '%' : '') : '';
	return '<div class="opc-badge-row">' +
		'<div class="opc-badge-b-wrap"><div class="opc-badge-b tier-' + meta.tier + '">' + meta.icon + '</div>' +
			'<div class="opc-badge-b-ribbon tier-' + meta.tier + '"></div></div>' +
		'<div class="opc-badge-row-text">' +
			'<div class="opc-badge-row-name">' + meta.label + '</div>' +
			'<div class="opc-badge-row-desc">' + meta.desc + valueSuffix + '</div>' +
		'</div>' +
	'</div>';
}

// Renderizza il "libro" dei riconoscimenti di un giocatore: un accordion con un
// capitolo per categoria di traguardo di carriera, seguito da un capitolo per
// ogni mese con riconoscimenti (più recente in cima).
window.renderPlayerBadgeBook = async function (playerName, context, season) {
	const res = await _supabase.from('player_badges').select('*').eq('context', context).eq('player_name', playerName).eq('season', season);
	const rows = res.data || [];
	const career = rows.filter(function (r) { return r.year === null; });

	const monthlyByKey = {};
	rows.filter(function (r) { return r.year !== null; }).forEach(function (r) {
		const key = r.year + '-' + r.month;
		if (!monthlyByKey[key]) monthlyByKey[key] = { year: r.year, month: r.month, rows: [] };
		monthlyByKey[key].rows.push(r);
	});
	const monthlyChapters = Object.values(monthlyByKey)
		.sort(function (a, b) { return (b.year * 12 + b.month) - (a.year * 12 + a.month); });

	const careerChaptersHtml = CAREER_BADGE_SECTIONS.map(function (section) {
		const badges = BADGE_CATALOG.filter(function (b) { return section.ids.indexOf(b.id) !== -1; });
		const unlockedCount = badges.filter(function (b) { return career.some(function (r) { return r.badge_id === b.id; }); }).length;
		const bodyHtml = '<div class="opc-badge-list">' + badges.map(function (b) {
			return renderCareerBadgeCol(b, career.find(function (r) { return r.badge_id === b.id; }));
		}).join('') + '</div>';
		return '<details class="opc-badge-chapter"><summary>' +
			'<span>' + section.icon + ' ' + section.title + '</span>' +
			'<span style="display:flex;align-items:center;gap:8px">' +
				'<span class="opc-badge-chapter-count">' + unlockedCount + '/' + badges.length + '</span>' +
				BADGE_CHAPTER_CHEVRON +
			'</span>' +
		'</summary><div class="opc-badge-chapter-body">' + bodyHtml + '</div></details>';
	}).join('');

	const monthlyChaptersHtml = monthlyChapters.length ? monthlyChapters.map(function (ch) {
		const monthLabel = OFFICEPONG_MONTH_NAMES[ch.month] + ' ' + ch.year;
		const bodyHtml = '<div class="opc-badge-list">' + ch.rows.map(renderMonthlyBadgeCol).join('') + '</div>';
		return '<details class="opc-badge-chapter opc-badge-chapter--monthly"><summary>' +
			'<span>📅 ' + monthLabel + '</span>' +
			'<span style="display:flex;align-items:center;gap:8px">' +
				'<span class="opc-badge-chapter-count">' + ch.rows.length + '</span>' +
				BADGE_CHAPTER_CHEVRON +
			'</span>' +
		'</summary><div class="opc-badge-chapter-body">' + bodyHtml + '</div></details>';
	}).join('') : '<p class="text-sm text-slate-400 p-4">Nessun riconoscimento mensile ancora.</p>';

	return '<div class="opc-badge-book">' + careerChaptersHtml + monthlyChaptersHtml + '</div>';
};

window.buildAvatarFilePath = function(playerName, file) {
	const safeName = playerName
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '') || 'player';

	return `${safeName}/avatar`;
};

window.uploadAvatarFile = async function(playerName, file) {
	const filePath = buildAvatarFilePath(playerName, file);
	const { error: uploadError } = await _supabase.storage
		.from(AVATAR_BUCKET)
		.upload(filePath, file, { contentType: file.type, upsert: true });

	if (uploadError) {
		throw uploadError;
	}

	const { data } = _supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);
	return data.publicUrl;
};

// ── CSS INJECTION ────────────────────────────────────────────
(function () {
	const s = document.createElement('style');
	s.textContent = `
		@media (max-width: 767px) {
			.opc-navlinks { display: none !important; }
			body { padding-bottom: 80px; }
		}

		/* Bottom Navigation */
		.opc-bn {
			position: fixed; bottom: 0; left: 0; right: 0;
			height: 64px;
			padding-bottom: env(safe-area-inset-bottom, 0px);
			background: #0D2745;
			border-top: 1px solid #1a3a5c;
			box-shadow: 0 -2px 16px rgba(0,0,0,0.25);
			display: flex; align-items: center; justify-content: space-around;
			z-index: 50;
		}
		@media (min-width: 768px) { .opc-bn { display: none; } }

		.opc-bn-tab {
			display: flex; flex-direction: column; align-items: center;
			justify-content: center; gap: 3px; flex: 1; height: 100%;
			text-decoration: none; color: #6b82a0;
			font-size: 10px; font-weight: 600; padding: 8px 4px;
			transition: color 0.15s; -webkit-tap-highlight-color: transparent;
		}
		.opc-bn-tab.opc-bn-tab--active, .opc-bn-tab:hover { color: #A5D62C; }

		.opc-bn-fab {
			width: 50px; height: 50px; border-radius: 50%;
			background: #A5D62C; color: #0D2745; border: none; cursor: pointer;
			display: flex; align-items: center; justify-content: center;
			box-shadow: 0 4px 14px rgba(165,214,44,0.45);
			margin-bottom: 8px; flex-shrink: 0;
			transition: background 0.15s, transform 0.1s;
			-webkit-tap-highlight-color: transparent;
		}
		.opc-bn-fab:hover { background: #8FBB1E; }
		.opc-bn-fab:active { transform: scale(0.93); }

		/* Overlay */
		.opc-overlay {
			position: fixed; inset: 0;
			background: rgba(15,23,42,0);
			z-index: 100; pointer-events: none;
			transition: background 0.25s;
		}
		.opc-overlay._open { background: rgba(15,23,42,0.5); pointer-events: auto; }

		/* Modal Sheet */
		.opc-modal {
			position: fixed; bottom: 0; left: 0; right: 0;
			background: #ffffff; border-radius: 20px 20px 0 0;
			z-index: 101; overflow-y: auto; max-height: 90vh;
			padding-bottom: env(safe-area-inset-bottom, 16px);
			transform: translateY(100%);
			transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
		}
		.opc-modal._open { transform: translateY(0); }

		.opc-modal-handle {
			width: 36px; height: 4px; background: #e2e8f0;
			border-radius: 2px; margin: 12px auto 0;
		}
		.opc-modal-head {
			display: flex; align-items: center; justify-content: space-between;
			padding: 16px 20px 8px;
		}
		.opc-modal-title { font-size: 17px; font-weight: 700; color: #0f172a; }
		.opc-modal-close {
			width: 32px; height: 32px; border-radius: 50%;
			border: none; background: #f1f5f9; cursor: pointer;
			display: flex; align-items: center; justify-content: center; color: #64748b;
		}
		.opc-modal-close:hover { background: #e2e8f0; }

		.opc-modal-body {
			padding: 8px 20px 28px;
			display: flex; flex-direction: column; gap: 18px;
		}
		.opc-modal-selects { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
		.opc-modal-field { display: flex; flex-direction: column; gap: 5px; }
		.opc-modal-field label {
			font-size: 10.5px; font-weight: 700; letter-spacing: 0.08em;
			text-transform: uppercase; color: #94a3b8;
		}
		.opc-modal-field select {
			width: 100%; padding: 10px 28px 10px 12px;
			border: 1.5px solid #e2e8f0; border-radius: 10px;
			font-size: 14px; background: #f8fafc; color: #0f172a;
			-webkit-appearance: none; appearance: none;
			background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
			background-repeat: no-repeat; background-position: right 10px center;
		}
		.opc-modal-field select:focus { outline: none; border-color: #A5D62C; background-color: #fff; }

		/* Search filter */
		.opc-sel-filter {
			width: 100%; padding: 7px 12px;
			border: 1.5px solid #e2e8f0; border-radius: 8px;
			font-size: 13px; background: #ffffff; color: #0f172a;
			margin-bottom: 4px;
		}
		.opc-sel-filter:focus { outline: none; border-color: #A5D62C; }

		/* Player search autocomplete */
		.opc-ac-wrap { position: relative; }
		.opc-ac-list {
			position: absolute; left: 0; right: 0; top: 100%;
			margin-top: 2px; background: #ffffff;
			border: 1.5px solid #e2e8f0; border-radius: 10px;
			box-shadow: 0 8px 24px rgba(15,23,42,0.12);
			max-height: 190px; overflow-y: auto;
			z-index: 30; display: none;
		}
		.opc-ac-list._open { display: block; }
		.opc-ac-item {
			padding: 8px 12px; font-size: 13px; color: #0f172a; cursor: pointer;
		}
		.opc-ac-item:hover, .opc-ac-item._active { background: #f0fdf4; color: #166534; }
		.opc-ac-empty { padding: 8px 12px; font-size: 12.5px; color: #94a3b8; }

		/* Score Controls */
		.opc-scores {
			display: flex; align-items: center;
			justify-content: center; gap: 12px;
		}
		.opc-score-block { text-align: center; flex: 1; }
		.opc-score-ctrl { display: flex; align-items: center; justify-content: center; gap: 8px; }
		.opc-score-btn {
			min-width: 48px; min-height: 48px; border-radius: 50%;
			border: 2px solid #e2e8f0; background: #ffffff;
			font-size: 22px; line-height: 1; cursor: pointer;
			display: flex; align-items: center; justify-content: center; color: #94a3b8;
			transition: transform 0.1s; -webkit-tap-highlight-color: transparent;
		}
		.opc-score-plus { border-color: #A5D62C; color: #7da020; }
		.opc-score-btn:active { transform: scale(0.9); }
		.opc-score-num {
			font-size: 52px; font-weight: 900; letter-spacing: -0.04em;
			color: #0f172a; width: 72px; text-align: center;
			line-height: 1; font-variant-numeric: tabular-nums;
			border: none; outline: none; background: transparent;
			-moz-appearance: textfield; appearance: textfield; padding: 0;
		}
		.opc-score-num::-webkit-outer-spin-button,
		.opc-score-num::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
		.opc-score-sep {
			font-size: 12px; font-weight: 800; letter-spacing: 0.12em;
			text-transform: uppercase; color: #cbd5e1; flex-shrink: 0; padding-top: 8px;
		}

		.opc-modal-save {
			width: 100%; padding: 14px; background: #A5D62C; color: #0D2745;
			border: none; border-radius: 14px; font-size: 15px; font-weight: 700;
			cursor: pointer; transition: background 0.15s;
			-webkit-tap-highlight-color: transparent;
		}
		.opc-modal-save:hover { background: #8FBB1E; }
		.opc-modal-save:disabled { background: #94a3b8; cursor: not-allowed; }

		/* Player modal inputs */
		.opc-modal-input {
			width: 100%; padding: 11px 14px;
			border: 1.5px solid #e2e8f0; border-radius: 10px;
			font-size: 14px; background: #f8fafc; color: #0f172a;
			outline: none; transition: border-color 0.15s;
			box-sizing: border-box;
		}
		.opc-modal-input:focus { border-color: #A5D62C; background: #fff; }
		.opc-modal-input::placeholder { color: #94a3b8; }

		/* Toast */
		.opc-toast {
			position: fixed; bottom: 84px; left: 50%;
			transform: translateX(-50%) translateY(8px);
			background: #0D2745; color: #f8fafc;
			padding: 11px 18px; border-radius: 12px;
			font-size: 14px; font-weight: 600; white-space: nowrap;
			z-index: 200; opacity: 0; pointer-events: none;
			transition: opacity 0.2s, transform 0.2s;
			box-shadow: 0 4px 20px rgba(0,0,0,0.18);
		}
		.opc-toast--error { background: #dc2626; }
		.opc-toast--show { opacity: 1; transform: translateX(-50%) translateY(0); }

		/* Badge list: icona + nome + spiegazione (come si ottiene) */
		.opc-badge-list { display: flex; flex-direction: column; gap: 12px; }
		.opc-badge-row { display: flex; align-items: center; gap: 12px; }
		.opc-badge-row-text { min-width: 0; }
		.opc-badge-row-name { font-size: 13px; font-weight: 700; color: #1e293b; }
		.opc-badge-row-desc { font-size: 11.5px; color: #94a3b8; margin-top: 1px; line-height: 1.3; }
		.opc-badge-row--locked .opc-badge-row-name { color: #94a3b8; }

		/* Stile C — traguardi di carriera (enamel pin) */
		.opc-badge-c {
			width: 52px; height: 52px; border-radius: 50%;
			display: flex; align-items: center; justify-content: center;
			font-size: 22px; background: #0f172a; border: 3px solid #e8c14a;
			box-shadow: 0 2px 6px rgba(0,0,0,0.3);
		}
		.opc-badge-c.tier-silver { border-color: #b6c2cf; }
		.opc-badge-c.tier-bronze { border-color: #c17a4a; }
		.opc-badge-c--locked { opacity: 0.35; filter: grayscale(1); }

		/* Stile B — riconoscimenti mensili (medaglia metallo + nastro) */
		.opc-badge-b-wrap { display: flex; flex-direction: column; align-items: center; }
		.opc-badge-b {
			width: 52px; height: 52px; border-radius: 50%;
			display: flex; align-items: center; justify-content: center; font-size: 20px;
			box-shadow: 0 3px 8px rgba(0,0,0,0.25), inset 0 1px 2px rgba(255,255,255,0.6);
		}
		.opc-badge-b.tier-gold   { background: radial-gradient(circle at 32% 28%, #fff6d8, #e8c14a 45%, #a97c1f 85%); }
		.opc-badge-b.tier-silver { background: radial-gradient(circle at 32% 28%, #f8fafc, #b9c4cf 45%, #7c8894 85%); }
		.opc-badge-b.tier-bronze { background: radial-gradient(circle at 32% 28%, #f6d9c2, #c17a4a 45%, #7c4423 85%); }
		.opc-badge-b-ribbon { width: 20px; height: 13px; margin-top: -3px; }
		.opc-badge-b-ribbon.tier-gold   { background: linear-gradient(135deg, #dc2626, #7f1d1d); clip-path: polygon(0 0,100% 0,100% 100%,50% 75%,0 100%); }
		.opc-badge-b-ribbon.tier-silver { background: linear-gradient(135deg, #64748b, #334155); clip-path: polygon(0 0,100% 0,100% 100%,50% 75%,0 100%); }
		.opc-badge-b-ribbon.tier-bronze { background: linear-gradient(135deg, #b45309, #78350f); clip-path: polygon(0 0,100% 0,100% 100%,50% 75%,0 100%); }

		/* Libro dei riconoscimenti (accordion a capitoli) */
		.opc-badge-book { border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; background: #fff; }
		.opc-badge-chapter { border-bottom: 1px solid #e2e8f0; border-left: 4px solid #A5D62C; }
		.opc-badge-chapter:last-child { border-bottom: none; }
		.opc-badge-chapter--monthly { border-left-color: #e8c14a; }
		.opc-badge-chapter > summary {
			padding: 14px 16px; cursor: pointer; display: flex; align-items: center; justify-content: space-between;
			font-weight: 700; font-size: 13.5px; color: #334155; list-style: none; user-select: none;
			-webkit-tap-highlight-color: transparent;
		}
		.opc-badge-chapter > summary::-webkit-details-marker { display: none; }
		.opc-badge-chapter > summary:hover { background: #f8fafc; }
		.opc-badge-chapter-count { font-size: 11px; font-weight: 700; color: #94a3b8; background: #f1f5f9; padding: 2px 9px; border-radius: 999px; }
		.opc-badge-chapter-chevron { color: #94a3b8; transition: transform 0.2s; flex-shrink: 0; }
		.opc-badge-chapter[open] > summary .opc-badge-chapter-chevron { transform: rotate(180deg); }
		.opc-badge-chapter-body { padding: 4px 16px 18px; }
	`;
	document.head.appendChild(s);
})();

// ── ACTIVE TAB + CONTEXT BADGE ──────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
	const page = document.body.dataset.page;
	if (!page) return;
	const tab = document.querySelector('.opc-bn-tab[data-page="' + page + '"]');
	if (tab) tab.classList.add('opc-bn-tab--active');

	// Badge "Casa" nella navbar quando il contesto è casa
	if (getContext() === 'casa') {
		const logo = document.querySelector('nav a[href="index.html"]');
		if (logo) {
			const badge = document.createElement('span');
			badge.textContent = '🏠 Casa';
			badge.style.cssText = 'font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;background:#0891B2;color:#fff;letter-spacing:0.04em;margin-left:8px;vertical-align:middle';
			logo.insertAdjacentElement('afterend', badge);
		}
	}

	maybeShowSeasonAnnouncement();
});

// ── ANNUNCIO SEASON 2 (solo il 2026-09-07, solo contesto office) ────
function maybeShowSeasonAnnouncement() {
	if (getContext() !== 'office') return;

	const todayRome = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Rome' });
	if (todayRome !== '2026-09-07') return;

	const flagKey = 'opc_season2_announced_2026-09-07';
	if (window.localStorage.getItem(flagKey) === '1') return;

	const overlay = document.createElement('div');
	overlay.className = 'opc-overlay';
	const modal = document.createElement('div');
	modal.className = 'opc-modal';
	modal.innerHTML = `
		<div class="opc-modal-handle"></div>
		<div class="opc-modal-head">
			<span class="opc-modal-title">🎉 È iniziata la Season 2!</span>
			<button class="opc-modal-close" id="_seasonAnnounceClose">✕</button>
		</div>
		<div class="opc-modal-body">
			<p style="font-size:14px;color:#334155;line-height:1.5;margin:0;">
				Le classifiche sono state azzerate: si riparte tutti da 1000 punti ELO.
				Lo storico della Season 1 resta salvato, ma non conta più nei punteggi.
				Buona fortuna a tutti! 🏓
			</p>
			<button class="opc-modal-save" id="_seasonAnnounceOk">Si comincia!</button>
		</div>
	`;
	document.body.appendChild(overlay);
	document.body.appendChild(modal);

	function dismiss() {
		window.localStorage.setItem(flagKey, '1');
		overlay.classList.remove('_open');
		modal.classList.remove('_open');
		setTimeout(function () { overlay.remove(); modal.remove(); }, 300);
	}
	overlay.addEventListener('click', dismiss);
	modal.querySelector('#_seasonAnnounceClose').addEventListener('click', dismiss);
	modal.querySelector('#_seasonAnnounceOk').addEventListener('click', dismiss);

	requestAnimationFrame(function () {
		requestAnimationFrame(function () {
			overlay.classList.add('_open');
			modal.classList.add('_open');
		});
	});
}

// ── TOAST ────────────────────────────────────────────────────
window.showToast = function (msg, type) {
	type = type || 'success';
	document.querySelectorAll('.opc-toast').forEach(function (t) { t.remove(); });
	const t = document.createElement('div');
	t.className = 'opc-toast opc-toast--' + type;
	t.textContent = msg;
	document.body.appendChild(t);
	requestAnimationFrame(function () {
		requestAnimationFrame(function () { t.classList.add('opc-toast--show'); });
	});
	setTimeout(function () {
		t.classList.remove('opc-toast--show');
		setTimeout(function () { t.remove(); }, 400);
	}, 3000);
};

// ── PLAYER SEARCH AUTOCOMPLETE ───────────────────────────────
// Wires a text input to a <select> of player names: typing live-filters
// the select's options into a clickable suggestion dropdown, instead of
// only hiding <option>s (which stayed invisible until the select was opened).
window.attachPlayerAutocomplete = function (inputEl, selectEl) {
	if (!inputEl || !selectEl || inputEl._opcAcAttached) return;
	inputEl._opcAcAttached = true;

	var wrap = document.createElement('div');
	wrap.className = 'opc-ac-wrap';
	inputEl.parentNode.insertBefore(wrap, inputEl);
	wrap.appendChild(inputEl);

	var list = document.createElement('div');
	list.className = 'opc-ac-list';
	wrap.appendChild(list);

	var activeIndex = -1;

	function close() {
		list.classList.remove('_open');
		list.innerHTML = '';
		activeIndex = -1;
	}

	function setActive(items) {
		items.forEach(function (it, i) { it.classList.toggle('_active', i === activeIndex); });
		if (activeIndex >= 0) items[activeIndex].scrollIntoView({ block: 'nearest' });
	}

	function pick(value, text) {
		selectEl.value = value;
		inputEl.value = text;
		close();
	}

	function render(query) {
		var q = query.toLowerCase().trim();
		if (!q) { close(); return; }
		var matches = Array.from(selectEl.options)
			.map(function (o) {
				if (!o.value) return null;
				var words = o.text.toLowerCase().split(/\s+/);
				if (words[0].startsWith(q)) return { o: o, rank: 0 };
				if (words.some(function (word) { return word.startsWith(q); })) return { o: o, rank: 1 };
				return null;
			})
			.filter(Boolean)
			.sort(function (a, b) { return a.rank - b.rank; })
			.map(function (m) { return m.o; });

		if (!matches.length) {
			list.innerHTML = '<div class="opc-ac-empty">Nessun giocatore trovato</div>';
			list.classList.add('_open');
			activeIndex = -1;
			return;
		}

		list.innerHTML = matches.map(function (o) {
			return '<div class="opc-ac-item" data-value="' + o.value.replace(/"/g, '&quot;') + '">' + o.text + '</div>';
		}).join('');
		activeIndex = -1;
		list.classList.add('_open');
	}

	inputEl.addEventListener('input', function () { render(inputEl.value); });
	inputEl.addEventListener('focus', function () { if (inputEl.value) render(inputEl.value); });

	inputEl.addEventListener('keydown', function (e) {
		var items = list.querySelectorAll('.opc-ac-item');
		if (!items.length) return;
		if (e.key === 'ArrowDown') { e.preventDefault(); activeIndex = Math.min(activeIndex + 1, items.length - 1); setActive(items); }
		else if (e.key === 'ArrowUp') { e.preventDefault(); activeIndex = Math.max(activeIndex - 1, 0); setActive(items); }
		else if (e.key === 'Enter') { e.preventDefault(); if (activeIndex >= 0) items[activeIndex].click(); }
		else if (e.key === 'Escape') { close(); }
	});

	list.addEventListener('mousedown', function (e) {
		var item = e.target.closest('.opc-ac-item');
		if (!item) return;
		e.preventDefault();
		pick(item.dataset.value, item.textContent);
	});

	document.addEventListener('click', function (e) {
		if (!wrap.contains(e.target)) close();
	});
};

// ── MATCH MODAL ──────────────────────────────────────────────
var _ms = { p1: 0, p2: 0 };
var _editMatchId = null;

window.changeScore = function (player, delta) {
	var el = document.getElementById(player === 1 ? '_modalS1' : '_modalS2');
	if (!el) return;
	var cur = parseInt(el.value, 10);
	el.value = Math.max(0, (isNaN(cur) ? 0 : cur) + delta);
};

window.openMatchModal = async function (presetP1, presetP2) {
	var overlay = document.getElementById('_opcOverlay');
	var modal = document.getElementById('_opcModal');
	if (!overlay || !modal) return;

	var p1El = document.getElementById('_modalP1');
	var p2El = document.getElementById('_modalP2');

	// Load players into selects
	var ph = '<option value="" disabled selected>Seleziona...</option>';
	if (p1El) p1El.innerHTML = ph;
	if (p2El) p2El.innerHTML = ph;

	var res = await _supabase.from('players').select('name').eq('context', getContext()).order('name');
	var players = (res.data || []);
	var opts = players.map(function (p) {
		return '<option value="' + p.name + '">' + p.name + '</option>';
	}).join('');

	if (p1El) p1El.innerHTML = ph + opts;
	if (p2El) p2El.innerHTML = ph + opts;

	// Add search filter inputs (created once, reset on reopen)
	[['_p1Filter', '_modalP1'], ['_p2Filter', '_modalP2']].forEach(function (pair) {
		var fid = pair[0], sid = pair[1];
		var sel = document.getElementById(sid);
		if (!sel) return;
		var inp = document.getElementById(fid);
		if (!inp) {
			inp = document.createElement('input');
			inp.type = 'text'; inp.id = fid; inp.placeholder = 'Cerca...';
			inp.className = 'opc-sel-filter'; inp.setAttribute('autocomplete', 'off');
			sel.parentNode.insertBefore(inp, sel);
		}
		attachPlayerAutocomplete(inp, sel);
		inp.value = '';
	});

	// Reset scores
	var s1El = document.getElementById('_modalS1');
	var s2El = document.getElementById('_modalS2');
	if (s1El) s1El.value = '0';
	if (s2El) s2El.value = '0';

	// Pre-select players (per rivincita)
	if (presetP1 && p1El) p1El.value = presetP1;
	if (presetP2 && p2El) p2El.value = presetP2;
	var f1Preset = document.getElementById('_p1Filter');
	var f2Preset = document.getElementById('_p2Filter');
	if (presetP1 && f1Preset) f1Preset.value = presetP1;
	if (presetP2 && f2Preset) f2Preset.value = presetP2;

	overlay.classList.add('_open');
	modal.classList.add('_open');
	document.body.style.overflow = 'hidden';
};

window.closeMatchModal = function () {
	_editMatchId = null;
	var overlay = document.getElementById('_opcOverlay');
	var modal = document.getElementById('_opcModal');
	if (overlay) overlay.classList.remove('_open');
	if (modal) modal.classList.remove('_open');
	document.body.style.overflow = '';
	// Reset modal to "new match" state
	var p1El = document.getElementById('_modalP1');
	var p2El = document.getElementById('_modalP2');
	if (p1El) p1El.disabled = false;
	if (p2El) p2El.disabled = false;
	var f1 = document.getElementById('_p1Filter');
	var f2 = document.getElementById('_p2Filter');
	if (f1) f1.style.display = '';
	if (f2) f2.style.display = '';
	var titleEl = document.getElementById('_opcModalTitle');
	if (titleEl) titleEl.textContent = '🏓 Nuova Partita';
};

window.openEditModal = async function (btn) {
	var matchId = +btn.dataset.matchid;
	var p1 = btn.dataset.p1;
	var p2 = btn.dataset.p2;
	var s1 = +btn.dataset.s1;
	var s2 = +btn.dataset.s2;
	_editMatchId = matchId;
	await openMatchModal(p1, p2);
	// Override scores set to 0 by openMatchModal
	var s1El = document.getElementById('_modalS1');
	var s2El = document.getElementById('_modalS2');
	if (s1El) s1El.value = s1;
	if (s2El) s2El.value = s2;
	// Lock player selects — we're editing an existing match
	var p1El = document.getElementById('_modalP1');
	var p2El = document.getElementById('_modalP2');
	if (p1El) p1El.disabled = true;
	if (p2El) p2El.disabled = true;
	// Hide search filters (irrelevant when selects are locked)
	var f1 = document.getElementById('_p1Filter');
	var f2 = document.getElementById('_p2Filter');
	if (f1) f1.style.display = 'none';
	if (f2) f2.style.display = 'none';
	var titleEl = document.getElementById('_opcModalTitle');
	if (titleEl) titleEl.textContent = '✏️ Modifica Partita';
};

window.saveModalMatch = async function () {
	var p1El = document.getElementById('_modalP1');
	var p2El = document.getElementById('_modalP2');
	var p1 = p1El ? p1El.value : '';
	var p2 = p2El ? p2El.value : '';
	var s1El = document.getElementById('_modalS1');
	var s2El = document.getElementById('_modalS2');
	var s1 = s1El ? (parseInt(s1El.value, 10) || 0) : 0;
	var s2 = s2El ? (parseInt(s2El.value, 10) || 0) : 0;

	if (!p1 || !p2 || p1 === p2) {
		showToast('Seleziona due giocatori diversi', 'error');
		return;
	}
	if (s1 === s2) {
		showToast('I punteggi devono essere diversi (niente pareggi)', 'error');
		return;
	}

	var btn = document.getElementById('_modalSaveBtn');
	if (btn) { btn.disabled = true; btn.textContent = 'Salvataggio...'; }

	var result;
	if (_editMatchId) {
		result = await _supabase.from('matches').update({ s1: s1, s2: s2 }).eq('id', _editMatchId);
	} else {
		result = await _supabase.from('matches').insert([{ p1: p1, p2: p2, s1: s1, s2: s2, context: getContext(), season: getCurrentSeason() }]);
	}

	if (btn) { btn.disabled = false; btn.textContent = 'Salva Partita'; }

	if (result.error) {
		showToast('Errore nel salvataggio', 'error');
		return;
	}

	var wasEdit = !!_editMatchId;
	closeMatchModal();
	showToast(wasEdit ? 'Partita aggiornata! ✏️' : 'Partita salvata! 🏓');
	checkAndAwardCareerBadges(getContext(), getCurrentSeason(), [p1, p2]);

	// Refresh page-specific data if available
	if (typeof updateUI === 'function') updateUI();
	if (typeof loadHistory === 'function') loadHistory();
	if (typeof loadPlayerProfile === 'function') loadPlayerProfile();
};

// ── PLAYER MODAL ─────────────────────────────────────────────
var _newPlayerAvatarFile = null;

window.openPlayerModal = function () {
	var overlay = document.getElementById('_opcPOverlay');
	var modal   = document.getElementById('_opcPModal');
	if (!overlay || !modal) return;

	_newPlayerAvatarFile = null;
	var nameEl    = document.getElementById('_pModalName');
	var urlEl     = document.getElementById('_pModalUrl');
	var fileEl    = document.getElementById('_pModalFile');
	var preview   = document.getElementById('_pModalAvatarPreview');
	if (nameEl)  nameEl.value  = '';
	if (urlEl)   urlEl.value   = '';
	if (fileEl)  fileEl.value  = '';
	if (preview) preview.innerHTML = '👤';

	if (fileEl) {
		fileEl.onchange = function (e) {
			var file = e.target.files && e.target.files[0];
			if (!file) return;
			_newPlayerAvatarFile = file;
			var objUrl = URL.createObjectURL(file);
			if (preview) preview.innerHTML = '<img src="' + objUrl + '" class="w-20 h-20 rounded-full object-cover">';
		};
	}

	overlay.classList.add('_open');
	modal.classList.add('_open');
	document.body.style.overflow = 'hidden';
	if (nameEl) setTimeout(function () { nameEl.focus(); }, 350);
};

window.closePlayerModal = function () {
	var overlay = document.getElementById('_opcPOverlay');
	var modal   = document.getElementById('_opcPModal');
	if (overlay) overlay.classList.remove('_open');
	if (modal)   modal.classList.remove('_open');
	document.body.style.overflow = '';
};

window.saveNewPlayer = async function () {
	var name = ((document.getElementById('_pModalName') || {}).value || '').trim();
	if (!name) { showToast('Inserisci un nome', 'error'); return; }

	var urlVal   = ((document.getElementById('_pModalUrl') || {}).value || '').trim();
	var finalUrl = urlVal || null;

	if (_newPlayerAvatarFile) {
		try {
			finalUrl = await uploadAvatarFile(name, _newPlayerAvatarFile);
		} catch (e) {
			showToast('Errore upload foto', 'error');
			return;
		}
	}

	var saveBtn = document.querySelector('#_opcPModal .opc-modal-save');
	if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Salvataggio...'; }

	var res = await _supabase.from('players').insert([{ name: name, avatar_url: finalUrl, context: getContext() }]);

	if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Aggiungi Giocatore'; }

	if (res.error) {
		showToast('Errore: ' + res.error.message, 'error');
		return;
	}

	closePlayerModal();
	showToast('Giocatore aggiunto! 👤');
	_newPlayerAvatarFile = null;

	if (typeof updateUI === 'function') updateUI();
};