export default function SkeletonCard() {
  return (
    <div className="anime-card skeleton" aria-hidden="true">
      <div className="anime-card__img" />
      <div className="line" />
      <div className="line short" />
    </div>
  );
}
