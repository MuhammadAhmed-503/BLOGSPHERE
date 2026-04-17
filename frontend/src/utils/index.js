export function formatDate(date) {
	const value = typeof date === 'string' ? new Date(date) : date;
	return new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	}).format(value);
}
export function truncateText(text, maxLength) {
	if (text.length <= maxLength) {
		return text;
	}
	return `${text.substring(0, maxLength).trim()}...`;
}
export function extractExcerpt(content, maxLength = 200) {
	const plainText = content
		.replace(/#{1,6}\s+/g, '')
		.replace(/\*\*(.+?)\*\*/g, '$1')
		.replace(/\*(.+?)\*/g, '$1')
		.replace(/\[(.+?)\]\(.+?\)/g, '$1')
		.replace(/`(.+?)`/g, '$1')
		.replace(/\n/g, ' ')
		.trim();
	return truncateText(plainText, maxLength);
}