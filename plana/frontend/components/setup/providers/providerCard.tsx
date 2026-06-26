// components/providers/ProviderCard.tsx
interface Props {
  name: string;
  category: string;
  onQuoteRequest: () => void; // Decoupled: Parent handles the API call
}

export const ProviderCard = ({ name, category, onQuoteRequest }: Props) => (
  <div className="card">
    <h3>{name}</h3>
    <p>{category}</p>
    <button onClick={onQuoteRequest}>Request Quote</button>
  </div>
);
