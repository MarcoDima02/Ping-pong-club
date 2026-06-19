// ⚠️ Inserisci qui le tue credenziali di Supabase
const SUPABASE_URL = "https://ehczcxhebvzhsisehogt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_uzyAkSCuJsijBI6VRiwmqg_qWatb1PF";
const OFFICEPONG_ACCESS_PASSWORD = 'gbs';
const OFFICEPONG_ACCESS_KEY = 'officepong_access_granted';

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
	window.location.href = 'login.html';
};

window.verifyAppPassword = function(password) {
	return password === OFFICEPONG_ACCESS_PASSWORD;
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