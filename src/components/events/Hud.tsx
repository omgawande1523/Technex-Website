interface Props {
  index: number;
  total: number;
  showHint: boolean;
}

const pad = (n: number) => String(n).padStart(2, '0');

export default function Hud({ index, total, showHint }: Props) {
  return (
    <>
      <div className={`ev-hint${showHint ? ' is-on' : ''}`} aria-hidden="true">
        <span>Scroll</span>
        <i />
      </div>

      <footer className="ev-foot">
        <span className="ev-foot-r" aria-live="polite">
          {pad(index + 1)} / {pad(total)}
        </span>
      </footer>
    </>
  );
}