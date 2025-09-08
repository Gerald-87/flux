import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import Papa from "papaparse";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  const numberFormatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `K ${numberFormatter.format(amount)}`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function generateReceiptNumber(): string {
  return `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function calculateTax(amount: number, taxRate: number = 0.1): number {
  return amount * taxRate;
}

export function validateEmail(string: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(string);
}

export function generateBarcode(): string {
  return Math.random().toString().slice(2, 15);
}

const downloadFile = (data: string, filename: string, type: string) => {
    const blob = new Blob([data], { type });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export const exportToCsv = (data: any[], filename: string) => {
  const csv = Papa.unparse(data);
  downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8;');
};

export const downloadCsvTemplate = () => {
    const templateData = [
        {
            name: "Sample T-Shirt",
            description: "A comfortable cotton t-shirt",
            sku: "TSHIRT-RED-M",
            barcode: "123456789012",
            category: "Apparel",
            brand: "FluxWear",
            price: "19.99",
            costPrice: "5.50",
            stock: "100",
            minStock: "10",
            isActive: "true",
            // For variants, use pipe-separated values
            variants: "Color:Red|Size:M; Color:Blue|Size:M; Color:Red|Size:L",
        }
    ];
    const csv = Papa.unparse(templateData);
    downloadFile(csv, 'product_import_template.csv', 'text/csv;charset=utf-8;');
}
