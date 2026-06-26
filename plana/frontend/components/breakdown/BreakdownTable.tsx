import { BudgetItem } from '@/frontend/types/types'; 
export const BreakdownTable = ({ items }: { items: BudgetItem[] }) => (
  <table>
    {items.map(item => (
      <tr key={item.id}>
        <td>{item.name}</td>
        <td>{item.estimatedCost}</td>
      </tr>
    ))}
  </table>
);


