import moment from "moment";

export function formatVND(number) {
	return Number.parseFloat(Math.round(number)).toLocaleString(undefined) + 'đ'
}
export function formatNumber(number) {
	return Number.parseFloat(Math.round(number)).toLocaleString(undefined)
}

export const formatDateTime = x =>
	moment(x)
		.format('DD/MM/YYYY - HH:mm:ss');

export const formatDate = x =>
	moment(x)
		.format('DD/MM/YYYY');

export const formatDateUS = x =>
	moment(x).format("YYYY-MM-DD").toString()

export function displayNumber(number) {
	return Number.parseFloat(Math.floor(number)).toLocaleString(undefined)
}


export function checkRole(role, permissions) {
	return !!permissions.includes(role);
}
export function formatBalance(n) {
	var parts = Number(n).toFixed(2).toString().split(".");
	const numberPart = parts[0];
	const decimalPart = parts[1];
	const thousands = /\B(?=(\d{3})+(?!\d))/g;
	return numberPart.replace(thousands, ",") + (decimalPart ? "." + decimalPart : "");
}
export function formatAddress(address) {
	return address && address.slice(0, 6)+'...'+address.slice(
		address.length - 5, address.length)
}
