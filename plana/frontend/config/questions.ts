// config/questions.ts
export const QUESTION_TEMPLATES: Record<string, any[]> = {
  wedding: [
    { id: 'guests', label: 'Guest Count', type: 'number', placeholder: 'e.g., 200' },
    { id: 'date', label: 'Wedding Date', type: 'date' },
    { id: 'style', label: 'Style', type: 'select', options: ['Traditional', 'Modern', 'Garden', 'Beach'] }
  ],
  trip: [
    { id: 'duration', label: 'Trip Duration (days)', type: 'number', placeholder: 'e.g., 5' },
    { id: 'travelers', label: 'Number of Travelers', type: 'number' },
    { id: 'mode', label: 'Travel Mode', type: 'select', options: ['Flight', 'Road Trip', 'Train'] }
  ]
};