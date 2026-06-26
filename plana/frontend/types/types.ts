// types/index.ts

export type PlanType = 
  | 'Trip' 
  | 'Wedding' 
  | 'Party' 
  | 'Graduation' 
  | 'Corporate' 
  | 'Introduction' 
  | 'Custom';

export interface BudgetItem {
  id: string;
  name: string;
  category: string;
  estimatedCost: number;
  actualSpend?: number;
}

export interface Plan {
  id: string;
  type: PlanType;
  destination: string;
  totalBudget: number;
  items: BudgetItem[];
  createdAt: Date;
}