export function getStatusInRussian(status: string): string {
	const statusMap: Record<string, string> = {
		pending: 'Ожидает',
		completed: 'Завершено',
		issued: 'Выдано',
		paid: 'Оплачено',
		unpaid: 'Не оплачено',
		partial: 'Частично оплачено',
		cancelled: 'Отменено',
	};
	return statusMap[status?.toLowerCase()] || status || '—';
}

export function isUnpaidPurchase(purchase: any): boolean {
	const status = (purchase?.payment_status || purchase?.status || '').toLowerCase();
	return status !== 'paid' && status !== 'completed';
} 