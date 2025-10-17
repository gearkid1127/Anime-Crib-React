import React, { useEffect, useState, useRef } from "react";
import "../styles/App.css";
import heroArt from "../assets/hero-art.webp";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import useDebounce from "../Hooks/useDebounce";
import SkeletonCard from "../Components/SkeletonCard.jsx";
import sorryAnime from "../assets/sorry-anime.png";
import { Link, useSearchParams } from "react-router-dom";

// Exclude specific anime by mal_id (add IDs here later)
const BLOCKLIST = new Set(); // e.g., BLOCKLIST.add(12345)

function cleanResults(list, query) {
  const q = query?.trim().toLowerCase();
  const seen = new Map(); // mal_id -> item

  for (const a of list || []) {
    if (!a || !a.mal_id || !a.images?.jpg?.image_url) continue;

    if (q) {
      // check all known title fields + Jikan's titles[] array
      const nameFields = [
        a.title,
        a.title_english,
        a.title_japanese,
        ...(a.titles?.map((t) => t?.title) || []),
      ]
        .filter(Boolean)
        .map((s) => s.toLowerCase());

      if (!nameFields.some((s) => s.includes(q))) continue;
    }

    if (!seen.has(a.mal_id)) seen.set(a.mal_id, a);
  }

  return Array.from(seen.values());
}

const Browse = () => {
  const [animeList, setAnimeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);
  const [searchParams] = useSearchParams();
  const genreId = searchParams.get("genreId");
  const genreName = searchParams.get("genre");
  const heading = genreId ? `Top ${genreName || "Category"} Anime` : "Browse";
  const [page, setPage] = useState(1); // current page for Jikan's ?page=
  const [hasMore, setHasMore] = useState(true); // does API say there is a next page?
  const [totalPages, setTotalPages] = useState(1);
  const reqSeq = useRef(0); // increment before each fetch; ignore replies from older requests
  const lastReqTsRef = useRef(0);
  const RATE_LIMIT_MS = 500; // ~2 req/sec across ALL effects
  const restoreRef = useRef(null); // Keeps one-time “restore me” info across the details page visit
  const pageChangeByClickRef = useRef(false);

  const handlePageClick = (n) => {
    if (n === page || n < 1) return;
    pageChangeByClickRef.current = true;
    setPage(n);
    window.scrollTo(0, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    window.scrollTo(0, 0);
  };

  const respectRateLimit = async () => {
    const now = Date.now();
    const delta = now - lastReqTsRef.current;
    if (delta < RATE_LIMIT_MS) {
      await new Promise((r) => setTimeout(r, RATE_LIMIT_MS - delta));
    }
    lastReqTsRef.current = Date.now();
  };

  useEffect(() => {
    // If a search is active, let the search effect own the list
    if (isSearching) return;
    if (debouncedQuery.trim()) return;

    const controller = new AbortController();

    const run = async () => {
      try {
        setIsLoading(page === 1);

        const url = genreId
          ? `https://api.jikan.moe/v4/anime?genres=${genreId}&order_by=score&sort=desc&sfw=true&page=${page}`
          : `https://api.jikan.moe/v4/top/anime?page=${page}&limit=24`;

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error("Load failed");

        const json = await res.json();
        if (controller.signal.aborted) return;

        const items = cleanResults(json.data, "");
        const replace =
          page === 1 || pageChangeByClickRef.current || restoreRef.current;
        setAnimeList((prev) => (replace ? items : [...prev, ...items]));

        const last = json?.pagination?.last_visible_page ?? page;
        setTotalPages(last);
        setHasMore(Boolean(json?.pagination?.has_next_page));
      } catch (err) {
        if (err?.name !== "AbortError") console.error(err);
      } finally {
        pageChangeByClickRef.current = false;
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [genreId, page, debouncedQuery, isSearching]);

  // On first mount, restore page & query if we have a saved state
  useEffect(() => {
    const raw = sessionStorage.getItem("browseState");
    if (!raw) return;
    try {
      const st = JSON.parse(raw);
      // only restore if genre matches (avoid mixing categories)
      if (String(st?.genreId || "") === String(genreId || "")) {
        if (typeof st.page === "number" && st.page > 0) {
          setPage(st.page);
        }
        if (typeof st.query === "string") {
          setQuery(st.query);
        }
        // stash scroll to restore after results paint
        restoreRef.current = { y: Number(st.scrollY) || 0 };
      }
    } catch {}
    // one-shot: don’t keep restoring on future visits
    sessionStorage.removeItem("browseState");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // After data is loaded, jump back to previous scroll position
  useEffect(() => {
    if (!restoreRef.current) return;
    if (isLoading) return; // wait until list is ready
    // tiny rAF to ensure DOM is painted
    requestAnimationFrame(() => {
      window.scrollTo(0, restoreRef.current.y || 0);
      restoreRef.current = null; // one-time
    });
  }, [isLoading, animeList]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + window.innerHeight;
      const threshold = document.body.offsetHeight - 300;

      // Only trigger if mobile (under 768px width) and near bottom
      if (
        window.innerWidth < 768 &&
        scrollY >= threshold &&
        hasMore &&
        !isLoading
      ) {
        setPage((p) => p + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, isLoading]);

  useEffect(() => {
    const controller = new AbortController();

    const q = debouncedQuery.trim();
    if (!q) {
      setIsSearching(false);
      return () => controller.abort();
    }

    const run = async () => {
      try {
        setIsSearching(true);
        setIsLoading(true);

        const url = genreId
          ? `https://api.jikan.moe/v4/anime?genres=${genreId}&q=${encodeURIComponent(
              q
            )}&limit=24&sfw=true&order_by=popularity`
          : `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(
              q
            )}&limit=24&sfw=true&order_by=popularity`;

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error("Search failed");

        const json = await res.json();
        if (controller.signal.aborted) return;

        const items = cleanResults(json.data, q);
        setAnimeList(items);
        setHasMore(false); // search shows the best matches only
      } catch (err) {
        if (err?.name !== "AbortError") console.error(err);
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
          setIsLoading(false);
        }
      }
    };

    run();
    return () => controller.abort();
  }, [debouncedQuery, genreId]);

  // Save current browse state right before navigating to details
  const saveBrowseState = () => {
    try {
      sessionStorage.setItem(
        "browseState",
        JSON.stringify({
          page,
          query,
          genreId, // from your URL search params
          scrollY: window.scrollY,
          t: Date.now(),
        })
      );
    } catch {}
  };

  return (
    <section id="landing-page">
      <header className="hero">
        <div className="hero__content">
          <h1 className="title">{heading}</h1>
          <p className="subtitle">Discover your next favorite series</p>

          {/* Search */}
          <form className="search" id="search-form" onSubmit={handleSubmit}>
            <div className="search__field">
              <input
                id="search-input"
                className="search__input"
                type="text"
                placeholder="Search anime by title…"
                aria-label="Search anime by title"
                autoComplete="off"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                className="search__icon"
                type="submit"
                aria-label="Search"
              >
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className="fa-solid"
                />
              </button>
            </div>
          </form>
        </div>

        <img className="hero__art" src={heroArt} alt="" aria-hidden="true" />
      </header>

      <section
        className={`results ${query && !debouncedQuery ? "is-fading" : ""}`}
      >
        {isLoading || isSearching ? (
          Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
        ) : animeList.length === 0 ? (
          <div className="no__results">
            <img
              src={sorryAnime}
              alt="Embarrassed anime character"
              className="no__results--img"
            />
          </div>
        ) : (
          animeList.map((a) => (
            <Link
              to={`/anime/${a.mal_id}`}
              key={a.mal_id}
              className="anime-card fade-in"
              onClick={saveBrowseState}
            >
              <img
                className="anime-card__img"
                src={a.images?.jpg?.image_url}
                alt={a.title}
              />
              <h3 className="anime-card__title">{a.title}</h3>
            </Link>
          ))
        )}
      </section>
      {!isLoading && totalPages > 1 && (
        <div
          className="pagination"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "0.5rem",
            flexWrap: "wrap",
            margin: "1rem 0",
          }}
        >
          <button
            className="btn"
            disabled={page === 1}
            onClick={() => handlePageClick(Math.max(1, page - 1))}

          >
            ‹ Prev
          </button>

          {Array.from({ length: totalPages })
            .slice(0, 10) // only show up to 10 pages for readability
            .map((_, i) => {
              const num = i + 1;
              return (
                <button
                  key={num}
                  className={`btn ${num === page ? "btn--active" : ""}`}
                  onClick={() => handlePageClick(num)}
                >
                  {num}
                </button>
              );
            })}

          <button
            className="btn"
            disabled={!hasMore}
            onClick={() => handlePageClick(Math.min(totalPages, page + 1))}
            
          >
            Next ›
          </button>
        </div>
      )}
      <button
        type="button"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="back-to-top"
      >
        ↑ Top
      </button>
    </section>
  );
};

export default Browse;
