import { InventoryUsageDetailInput } from '@/schemas/inventory-usage';
interface SimpleTreatmentFormProps {
    title: string;
    subtipo: string;
    items: readonly string[];
    addDetail: (detail: InventoryUsageDetailInput) => void;
    maxQuantity?: number;
}
export declare function SimpleTreatmentForm({ title, subtipo, items, addDetail, maxQuantity }: SimpleTreatmentFormProps): import("react").JSX.Element;
export {};
