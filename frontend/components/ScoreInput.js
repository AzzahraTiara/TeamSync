// Pilihan skor skala 1-5 modern
export default function ScoreInput({ name, value, onChange }) {
  return (
    <div className="scale" role="radiogroup">
      {[1, 2, 3, 4, 5].map((n) => (
        <label
          key={n}
          className={value === n ? 'on' : ''}
          title={`Skor ${n}`}
        >
          <input
            type="radio"
            name={name}
            checked={value === n}
            onChange={() => onChange(n)}
          />
          {n}
        </label>
      ))}
    </div>
  );
}
