/* ============================================================
   rc-persona.jsx — Entry screen: persona pick (Step 0)
   ============================================================ */
const { IconBadge: _IB, Icon: _PIcon } = window;

function PersonaScreen({ mobile, onPick }) {
  const personas = [PERSONA_COPY.international, PERSONA_COPY.startup];

  function Card({ p }) {
    return (
      <button type="button" onClick={() => onPick(p.key)}
        className="group relative text-left rounded-2xl border border-line bg-white p-6 hover:border-primary hover:shadow-pop transition-all
          focus:outline-none focus:border-primary focus:ring-4 focus:ring-sky-soft flex flex-col">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-xl bg-sky-soft text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
            <Icon name={p.cardIcon} size={24} />
          </div>
          <span className="text-[11px] font-semibold text-primary-700 bg-sky-soft rounded-full px-2.5 py-1 whitespace-nowrap">{p.badge}</span>
        </div>
        <h3 className="mt-4 text-[19px] font-bold text-ink">{p.cardTitle}</h3>
        <p className="mt-1.5 text-[13.5px] text-body leading-relaxed">{p.cardSub}</p>
        <div className="mt-5 pt-4 border-t border-line/70 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-primary whitespace-nowrap">Start here</span>
          <span className="w-8 h-8 rounded-full bg-canvas group-hover:bg-primary group-hover:text-white text-primary flex items-center justify-center transition-colors">
            <Icon name="arrowRight" size={16} />
          </span>
        </div>
      </button>
    );
  }

  return (
    <div className={`mx-auto ${mobile ? 'max-w-[360px] px-1' : 'max-w-[760px]'}`}>
      <div className="text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-sky-soft text-primary flex items-center justify-center mb-4">
          <Icon name="compass" size={24} />
        </div>
        <p className="text-[12px] font-bold tracking-[0.14em] text-primary uppercase">Choose your journey</p>
        <h1 className={`mt-2 font-bold text-ink ${mobile ? 'text-[26px]' : 'text-[34px]'} tracking-tight`}>
          What brings you to Australia?
        </h1>
        <p className={`mt-3 text-body mx-auto ${mobile ? 'text-[15px] max-w-[320px]' : 'text-[16px] max-w-[480px]'} leading-relaxed`}>
          Your path shapes everything that follows — the goals we show, the matches we make, and how your report reads.
        </p>
      </div>

      <div className={`mt-8 grid ${mobile ? 'grid-cols-1 gap-3.5' : 'grid-cols-2 gap-5'}`}>
        {personas.map((p) => <Card key={p.key} p={p} />)}
      </div>

      <p className="mt-6 text-center text-[12.5px] text-muted">
        You can switch journeys anytime — nothing is locked in.
      </p>
    </div>
  );
}

window.PersonaScreen = PersonaScreen;
