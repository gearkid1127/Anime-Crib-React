import React from "react";

const SkeletonDetails = () => {
  return (
    <div className="anime-details skeleton">
      <figure className="anime-details__image-wrapper">
        <div className="anime-details__image" />
      </figure>

      <div className="select__anime--info-wrapper">
        <h2 className="anime-details__title">
          <span className="line" />
        </h2>
        <p className="anime-details__rating">
          <span className="line short" />
        </p>
        <div className="line" />
        <div className="line" />
        <div className="line short" />

        <section className="anime-details__recs" style={{ marginTop: "2rem" }}>
          <h3 className="anime-details__recs-title">
            <span className="line short" />
          </h3>
          <div className="anime-details__recs-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rec-card">
                <div className="rec-card__img" />
                <div className="line" />
                <div className="line short" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SkeletonDetails;
