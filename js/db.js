// ⚠️ Inserisci qui le tue credenziali di Supabase
const SUPABASE_URL = "https://ehczcxhebvzhsisehogt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_uzyAkSCuJsijBI6VRiwmqg_qWatb1PF";
const OFFICEPONG_ACCESS_PASSWORD = 'gbs';
const OFFICEPONG_ADMIN_PASSWORD = 'gbsadmin';
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
	if (password === OFFICEPONG_ADMIN_PASSWORD) return 'admin';
	if (password === OFFICEPONG_ACCESS_PASSWORD) return 'user';
	return null;
};

window.isAdmin = function() {
	return window.localStorage.getItem(OFFICEPONG_ROLE_KEY) === 'admin';
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
	`;
	document.head.appendChild(s);
})();

// ── ACTIVE TAB ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
	const page = document.body.dataset.page;
	if (!page) return;
	const tab = document.querySelector('.opc-bn-tab[data-page="' + page + '"]');
	if (tab) tab.classList.add('opc-bn-tab--active');
});

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

	var res = await _supabase.from('players').select('name').order('name');
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
			inp.addEventListener('input', (function (s) { return function () {
				var v = this.value.toLowerCase().trim();
				Array.from(s.options).forEach(function (o) {
					o.hidden = !!v && !!o.value && !o.text.toLowerCase().includes(v);
				});
			}; })(sel));
			sel.parentNode.insertBefore(inp, sel);
		} else {
			inp.value = '';
			Array.from(sel.options).forEach(function (o) { o.hidden = false; });
		}
	});

	// Reset scores
	var s1El = document.getElementById('_modalS1');
	var s2El = document.getElementById('_modalS2');
	if (s1El) s1El.value = '0';
	if (s2El) s2El.value = '0';

	// Pre-select players (per rivincita)
	if (presetP1 && p1El) p1El.value = presetP1;
	if (presetP2 && p2El) p2El.value = presetP2;

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
		result = await _supabase.from('matches').insert([{ p1: p1, p2: p2, s1: s1, s2: s2 }]);
	}

	if (btn) { btn.disabled = false; btn.textContent = 'Salva Partita'; }

	if (result.error) {
		showToast('Errore nel salvataggio', 'error');
		return;
	}

	var wasEdit = !!_editMatchId;
	closeMatchModal();
	showToast(wasEdit ? 'Partita aggiornata! ✏️' : 'Partita salvata! 🏓');

	// Refresh page-specific data if available
	if (typeof updateUI === 'function') updateUI();
	if (typeof loadHistory === 'function') loadHistory();
	if (typeof loadPlayerProfile === 'function') loadPlayerProfile();
};