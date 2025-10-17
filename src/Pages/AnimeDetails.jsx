import "../styles/animeDetails.css";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import SkeletonDetails from "../Components/SkeletonDetails.jsx";


const AnimeDetails = () => {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recs, setRecs] = useState([]);
  const [recsLoading, setRecsLoading] = useState(true);

  const [showFull, setShowFull] = useState(false);
  const synopsis = anime?.synopsis || "No synopsis available.";
  const shortSynopsis =
    synopsis.length > 350 ? synopsis.slice(0, 350) + "..." : synopsis;

  useEffect(() => {
    const controller = new AbortController();

    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`https://api.jikan.moe/v4/anime/${id}`, {
          signal: controller.signal,
        });
        const json = await res.json();
        setAnime(json.data);
      } catch (err) {
        if (err.name !== "AbortError") setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchRecs = async () => {
      try {
        setRecsLoading(true);
        const res = await fetch(
          `https://api.jikan.moe/v4/anime/${id}/recommendations`,
          { signal: controller.signal }
        );
        const json = await res.json();

        // Jikan returns { entry: { mal_id, title, images } } inside each item
        const unique = new Map(
          (json.data || [])
            .map((r) => r.entry)
            .filter((e) => e && e.mal_id && e.images?.jpg?.image_url)
            .map((e) => [e.mal_id, e])
        );

        setRecs(Array.from(unique.values()).slice(0, 4));
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      } finally {
        setRecsLoading(false);
      }
    };

    fetchRecs();
    return () => controller.abort();
  }, [id]);

  console.log("AnimeDetails id:", id); // temporary debug

  if (isLoading) return <SkeletonDetails />;

  if (error) return <div className="anime-details">Error: {error.message}</div>;

  return (
    <div className="anime__details--page">
      <div className="anime-details">
        <figure className="anime-details__image-wrapper">
          <img
            className="anime-details__image"
            src={
              anime?.images?.jpg?.large_image_url ||
              anime?.images?.jpg?.image_url
            }
            alt={anime?.title}
          />
        </figure>
        <div className="select__anime--info-wrapper">
          <h2 className="anime-details__title">{anime?.title}</h2>
          <p className="anime-details__rating">
            <FontAwesomeIcon icon={faStar} />{" "}
            {anime?.score ? anime.score.toFixed(1) : "N/A"} / 10
          </p>
          <p className={`anime-details__info ${showFull ? "expanded" : ""}`}>
            {showFull ? synopsis : shortSynopsis}
          </p>
          {synopsis.length > 350 && (
            <button
              className="anime-details__toggle"
              onClick={() => setShowFull(!showFull)}
            >
              {showFull ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      </div>

      <section className="anime-details__recs">
        <h3 className="anime-details__recs-title">You might also like</h3>

        {recsLoading ? (
          <div className="anime-details__recs-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rec-card skeleton">
                <div className="rec-card__img" />
                <div className="line" />
                <div className="line short" />
              </div>
            ))}
          </div>
        ) : (
          <div className="anime-details__recs-grid">
            {recs.map((r) => (
              <Link
                key={r.mal_id}
                to={`/anime/${r.mal_id}`}
                className="rec-card"
              >
                <img
                  className="rec-card__img"
                  src={r.images?.jpg?.image_url}
                  alt={r.title}
                />
                <p className="rec-card__title">{r.title}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AnimeDetails;
