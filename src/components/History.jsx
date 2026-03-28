import LottieRacer from './LottieRacer'

export default function History({ items, onClear }) {
  return (
    <div className="w-full bg-white/[.04] rounded-2xl p-5 border border-white/[.08]">
      <h3 className="text-base font-semibold mb-3 text-white/60">
        Race History
        <button
          className="float-right bg-transparent border-0 text-white/30 cursor-pointer text-xs hover:text-red-light transition-colors"
          onClick={onClear}
        >
          Clear
        </button>
      </h3>
      <ul className="list-none flex flex-col gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2.5 px-3 py-2 bg-white/[.04] rounded-lg text-sm">
            <span className="text-white/30 text-xs min-w-[20px]">#{items.length - i}</span>
            <span className="inline-flex items-center">
              {item.lottie ? (
                <LottieRacer src={item.lottie.src} size={36} />
              ) : (
                item.emoji
              )}
            </span>
            <span className="font-semibold">{item.name}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
