const STORAGE_KEY = 'auth_session';
const AUTH_EVENT = 'authSessionUpdated';
const SESSION_TIMEOUT_MS = 15 * 60 * 1000;
const TOUCH_THROTTLE_MS = 30 * 1000;
function isAdminSession(session) {
	return session.user.role === 'admin';
}
function now() {
	return Date.now();
}
function normalizeSession(session) {
	if (!isAdminSession(session)) {
		return {
			...session,
			lastActivityAt: undefined,
			expiresAt: undefined,
		};
	}
	const timestamp = typeof session.lastActivityAt === 'number' ? session.lastActivityAt : now();
	return {
		...session,
		lastActivityAt: timestamp,
		expiresAt: timestamp + SESSION_TIMEOUT_MS,
	};
}
export function getAuthSession() {
	const raw = window.localStorage.getItem(STORAGE_KEY);
	if (!raw) {
		return null;
	}
	try {
		const parsed = JSON.parse(raw);
		const normalized = normalizeSession(parsed);
		if (typeof normalized.expiresAt === 'number' && normalized.expiresAt <= now()) {
			window.localStorage.removeItem(STORAGE_KEY);
			return null;
		}
		if (normalized.expiresAt !== parsed.expiresAt || normalized.lastActivityAt !== parsed.lastActivityAt) {
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
		}
		return normalized;
	}
	catch {
		window.localStorage.removeItem(STORAGE_KEY);
		return null;
	}
}
export function saveAuthSession(session) {
	const normalized = normalizeSession(session);
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
	window.dispatchEvent(new Event(AUTH_EVENT));
}
export function clearAuthSession() {
	window.localStorage.removeItem(STORAGE_KEY);
	window.dispatchEvent(new Event(AUTH_EVENT));
}
export function onAuthSessionChange(listener) {
	const sync = () => listener();
	window.addEventListener('storage', sync);
	window.addEventListener(AUTH_EVENT, sync);
	return () => {
		window.removeEventListener('storage', sync);
		window.removeEventListener(AUTH_EVENT, sync);
	};
}
export function touchAuthSession() {
	const session = getAuthSession();
	if (!session) {
		return;
	}
	if (!isAdminSession(session)) {
		return;
	}
	const currentTime = now();
	const lastActivityAt = session.lastActivityAt ?? 0;
	if (currentTime - lastActivityAt < TOUCH_THROTTLE_MS) {
		return;
	}
	saveAuthSession({
		...session,
		lastActivityAt: currentTime,
		expiresAt: currentTime + SESSION_TIMEOUT_MS,
	});
}