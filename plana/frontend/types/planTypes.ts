// config/planTypes.ts
export interface PlanType {
  id: string;
  label: string;
  icon: string;
}

export const PLAN_TYPES: PlanType[] = [
  { id: 'wedding', label: 'Wedding', icon: '💍' },
  { id: 'trip', label: 'Trip', icon: '✈️' },
  { id: 'corporate', label: 'Corporate Event', icon: '💼' },
  { id: 'birthday', label: 'Birthday', icon: '🎂' },
  { id: 'other', label: 'Other', icon: '✨' },
];