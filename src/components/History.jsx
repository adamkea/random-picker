import LottieRacer from './LottieRacer'

export default function History({ items, onClear }) {
  return (
    <div className="history">
      <h3>
        Race History
        <button className="history-clear" onClick={onClear}>Clear</button>
      </h3>
      <ul className="history-list">
        {items.map((item, i) => (
          <li key={i} className="history-item">
            <span className="history-num">#{items.length - i}</span>
            <span className="history-emoji">
              {item.lottie ? (
                <LottieRacer src={item.lottie.src} size={36} />
              ) : (
                item.emoji
              )}
            </span>
            <span className="history-name">{item.name}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
