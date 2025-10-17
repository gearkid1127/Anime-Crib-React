import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import "../styles/categories.css";
import heroArt from "../assets/hero-art.webp";

const Categories = () => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [previews, setPreviews] = useState({});
  const fetchedGenresRef = useRef(new Set()); // remember which genre IDs we’ve already fetched

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await fetch("https://api.jikan.moe/v4/genres/anime");
        const json = await res.json();
        if (!ignore) {
          const list = (json?.data ?? []).sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          setGenres(list);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!genres.length) return;

    const seen = new Set(); // avoid double-requests per card
    const controller = new AbortController();
    const queue = []; // simple fetch queue
    let busy = false;

    const loadOne = async (genreId) => {
      try {
        const res = await fetch(
          `https://api.jikan.moe/v4/anime?genres=${genreId}&order_by=score&sort=desc&sfw=true&limit=1`,
          { signal: controller.signal }
        );
        const json = await res.json();
        const img = json?.data?.[0]?.images?.jpg?.image_url;
        fetchedGenresRef.current.add(genreId);
        if (img) setPreviews((prev) => ({ ...prev, [genreId]: img }));
      } catch (e) {
        if (e?.name === "AbortError") return; // ignore cancels
      } finally {
        // throttle next request to respect rate limits
        setTimeout(runQueue, 1500);
      }
    };

    const runQueue = () => {
      if (busy) return;
      const nextId = queue.shift();
      if (!nextId) return;
      busy = true;
      loadOne(nextId).finally(() => {
        busy = false;
        // if more items queued, they’ll be picked up on the next setTimeout
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idStr = entry.target.getAttribute("data-genre-id");
          const genreId = Number(idStr);
          // skip if we already have a preview or already enqueued/fetched
          if (
            previews[genreId] ||
            seen.has(genreId) ||
            fetchedGenresRef.current.has(genreId)
          ) {
            io.unobserve(entry.target);
            return;
          }
          seen.add(genreId);
          queue.push(genreId);
          runQueue();
          io.unobserve(entry.target); // observe once per card
        });
      },
      { rootMargin: "200px 0px" } // start a bit before visible
    );

    document.querySelectorAll(".category-card").forEach((el) => io.observe(el));

    return () => {
      io.disconnect();
      controller.abort();
    };
  }, [genres]);

  return (
    <section id="landing-page">
      <header className="hero">
  <div className="hero__content">
    <h1 className="title">Categories</h1>
    <p className="subtitle">Browse anime by genre</p>
  </div>

  <img className="hero__art" src={heroArt} alt="" aria-hidden="true" />
</header>


      {loading ? (
        <div className="results">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="card skeleton">
              <div className="card__img" />
              <div className="line" />
              <div className="line short" />
            </div>
          ))}
        </div>
      ) : (
        <div className="results category-grid">
          {genres.map((g) => (
            <Link
              key={g.mal_id}
              to={`/browse?genreId=${g.mal_id}&genre=${encodeURIComponent(
                g.name
              )}`}
              className="anime-card category-card"
              data-genre-id={g.mal_id}
              title={`Browse ${g.name}`}
            >
              <div className="anime-card__img">
                {previews[g.mal_id] ? (
                  <img
                    className="category-img category-img--visible"
                    src={previews[g.mal_id]}
                    alt=""
                    loading="lazy"
                  />
                ) : (
                  <div className="category-placeholder" />
                )}
              </div>

              <h3 className="anime-card__title">{g.name}</h3>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default Categories;
