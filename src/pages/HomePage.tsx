import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputBase,
  MenuItem,
  Skeleton,
  TextField,
  Typography,
  type MenuProps,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  SearchRounded,
  CloseRounded,
  LocalMoviesRounded,
  TuneRounded,
  StarRounded,
  ArrowDownwardRounded,
} from "@mui/icons-material";
import tmdb from "../api/tmdb";
import type { Movie } from "../types/movie";
import { MovieCard } from "../components/MovieCard";
import { tokens } from "../theme/theme";

type Genre = {
  id: number;
  name: string;
};

type MovieResponse = {
  results: Movie[];
  page: number;
  total_pages: number;
};

const currentYear = new Date().getFullYear();

const gridStyles = {
  display: "grid",
  gridTemplateColumns: {
    xs: "repeat(2, minmax(0, 1fr))",
    sm: "repeat(3, minmax(0, 1fr))",
    md: "repeat(4, minmax(0, 1fr))",
    lg: "repeat(5, minmax(0, 1fr))",
  },
  gap: { xs: 1.5, sm: 2.5, md: 3 },
};

const sectionTitleSx = {
  fontSize: { xs: "1.5rem", sm: "1.85rem" },
  fontWeight: 600,
  letterSpacing: "-0.035em",
  lineHeight: 1.25,
};

const filterFieldSx = {
  width: "100%",
  minWidth: 0,
  "& .MuiInputLabel-root": {
    color: "text.secondary",
  },
  "& .MuiInputBase-root": {
    minHeight: 48,
    fontSize: "0.875rem",
  },
};

const selectProps: { MenuProps: Partial<MenuProps> } = {
  MenuProps: {
    slotProps: {
      paper: {
        sx: {
          maxHeight: 320,
          mt: 0.75,
          border: 1,
          borderColor: "divider",
          backgroundImage: "none",
        },
      },
    },
  },
};

function PosterSkeletons({ count }: { count: number }) {
  return (
    <Box sx={gridStyles} aria-busy="true" aria-label="Loading movies">
      {Array.from({ length: count }, (_, index) => (
        <Box key={index} sx={{ aspectRatio: "2 / 3" }}>
          <Skeleton
            variant="rounded"
            animation="wave"
            sx={(theme) => ({
              width: "100%",
              height: "100%",
              borderRadius: `${tokens.radius}px`,
              bgcolor: alpha(
                theme.palette.text.primary,
                theme.palette.mode === "dark" ? 0.045 : 0.07,
              ),
            })}
          />
        </Box>
      ))}
    </Box>
  );
}

type NoticeProps = {
  message: string;
  tone?: "error" | "neutral";
  actionLabel?: string;
  onAction?: () => void;
};

function Notice({
  message,
  tone = "neutral",
  actionLabel,
  onAction,
}: NoticeProps) {
  return (
    <Box
      role={tone === "error" ? "alert" : "status"}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        px: 3,
        py: { xs: 5, sm: 7 },
        textAlign: "center",
        bgcolor: "background.paper",
        backgroundImage: "none",
        border: 1,
        borderColor: "divider",
        borderRadius: `${tokens.radius}px`,
      }}
    >
      <Box
        sx={(theme) => {
          const accent =
            tone === "error"
              ? theme.palette.error.main
              : theme.palette.primary.main;

          return {
            width: 52,
            height: 52,
            display: "grid",
            placeItems: "center",
            borderRadius: "16px",
            bgcolor: alpha(accent, 0.1),
            color: accent,
          };
        }}
      >
        {tone === "error" ? <CloseRounded /> : <LocalMoviesRounded />}
      </Box>

      <Typography
        sx={{
          maxWidth: 420,
          color: tone === "error" ? "error.main" : "text.secondary",
          lineHeight: 1.7,
        }}
      >
        {message}
      </Typography>

      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        mb: 1.25,
        color: "primary.main",
        fontSize: "0.7rem",
        fontWeight: 800,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </Typography>
  );
}

export function HomePage() {
  const initialSearch = () => localStorage.getItem("lastSearch") ?? "";

  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeQuery, setActiveQuery] = useState(initialSearch);

  const [genreFilter, setGenreFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("0");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isLoadingTrending, setIsLoadingTrending] = useState(true);
  const [isLoadingSearch, setIsLoadingSearch] = useState(() =>
    Boolean(initialSearch()),
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [trendingError, setTrendingError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  const [searchAttempt, setSearchAttempt] = useState(0);
  const [retryLoadMore, setRetryLoadMore] = useState(0);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingMoreRef = useRef(false);
  const searchInFlightRef = useRef(false);
  const searchRequestRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchInitialData() {
      setIsLoadingTrending(true);
      setTrendingError(null);

      try {
        const [trendingResponse, genresResponse] = await Promise.all([
          tmdb.get<MovieResponse>("/trending/movie/day"),
          tmdb.get<{ genres: Genre[] }>("/genre/movie/list"),
        ]);

        if (cancelled) return;

        setTrendingMovies(trendingResponse.data.results);
        setGenres(genresResponse.data.genres);
      } catch (error) {
        console.error("Failed to load initial movie data:", error);

        if (!cancelled) {
          setTrendingError("Could not load trending movies. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingTrending(false);
        }
      }
    }

    void fetchInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const query = activeQuery.trim();
    const requestId = ++searchRequestRef.current;
    let cancelled = false;

    loadingMoreRef.current = false;
    searchInFlightRef.current = false;

    setIsLoadingMore(false);
    setLoadMoreError(null);
    setSearchError(null);
    setPage(1);
    setTotalPages(1);
    setSearchResults([]);

    if (!query) {
      setIsLoadingSearch(false);
      return;
    }

    searchInFlightRef.current = true;
    setIsLoadingSearch(true);

    async function fetchSearchResults() {
      try {
        const response = await tmdb.get<MovieResponse>("/search/movie", {
          params: { query, page: 1 },
        });

        if (cancelled || requestId !== searchRequestRef.current) return;

        setSearchResults(response.data.results);
        setPage(response.data.page);
        setTotalPages(response.data.total_pages);
      } catch (error) {
        console.error("Failed to search movies:", error);

        if (!cancelled && requestId === searchRequestRef.current) {
          setSearchError("Could not load search results. Please try again.");
        }
      } finally {
        if (!cancelled && requestId === searchRequestRef.current) {
          searchInFlightRef.current = false;
          setIsLoadingSearch(false);
        }
      }
    }

    void fetchSearchResults();

    return () => {
      cancelled = true;

      if (requestId === searchRequestRef.current) {
        searchInFlightRef.current = false;
      }
    };
  }, [activeQuery, searchAttempt]);

  const loadNextPage = useCallback(async () => {
    const query = activeQuery.trim();
    const requestId = searchRequestRef.current;

    if (
      !query ||
      isLoadingSearch ||
      searchInFlightRef.current ||
      loadingMoreRef.current ||
      page >= totalPages ||
      searchError ||
      loadMoreError
    ) {
      return;
    }

    loadingMoreRef.current = true;
    setIsLoadingMore(true);

    try {
      const nextPage = page + 1;

      const response = await tmdb.get<MovieResponse>("/search/movie", {
        params: { query, page: nextPage },
      });

      if (requestId !== searchRequestRef.current) return;

      setSearchResults((current) => {
        const existingIds = new Set(current.map((movie) => movie.id));
        const newMovies = response.data.results.filter(
          (movie) => !existingIds.has(movie.id),
        );

        return [...current, ...newMovies];
      });

      setPage(response.data.page);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error("Failed to load more movies:", error);

      if (requestId === searchRequestRef.current) {
        setLoadMoreError("Could not load more results. Please try again.");
      }
    } finally {
      if (requestId === searchRequestRef.current) {
        loadingMoreRef.current = false;
        setIsLoadingMore(false);
      }
    }
  }, [
    activeQuery,
    isLoadingSearch,
    page,
    totalPages,
    searchError,
    loadMoreError,
  ]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (
      !sentinel ||
      !activeQuery.trim() ||
      isLoadingSearch ||
      isLoadingMore ||
      page >= totalPages ||
      searchError ||
      loadMoreError
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadNextPage();
        }
      },
      { root: null, rootMargin: "500px", threshold: 0 },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [
    activeQuery,
    isLoadingSearch,
    isLoadingMore,
    page,
    totalPages,
    searchError,
    loadMoreError,
    retryLoadMore,
    loadNextPage,
  ]);

  const filteredMovies = useMemo(() => {
    return searchResults.filter((movie) => {
      const matchesGenre =
        !genreFilter || movie.genre_ids.includes(Number(genreFilter));

      const releaseYear = movie.release_date
        ? Number(movie.release_date.slice(0, 4))
        : 0;

      const matchesYear = !yearFilter || releaseYear === Number(yearFilter);
      const matchesRating = movie.vote_average >= Number(ratingFilter);

      return matchesGenre && matchesYear && matchesRating;
    });
  }, [searchResults, genreFilter, yearFilter, ratingFilter]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = searchQuery.trim();

    setSearchQuery(query);
    setGenreFilter("");
    setYearFilter("");
    setRatingFilter("0");
    setLoadMoreError(null);

    if (query) {
      localStorage.setItem("lastSearch", query);
    } else {
      localStorage.removeItem("lastSearch");
    }

    if (query === activeQuery.trim()) {
      setSearchAttempt((attempt) => attempt + 1);
    } else {
      setActiveQuery(query);
    }
  }

  function clearSearch() {
    setSearchQuery("");
    setActiveQuery("");
    localStorage.removeItem("lastSearch");
    setGenreFilter("");
    setYearFilter("");
    setRatingFilter("0");
    setLoadMoreError(null);
  }

  function retrySearch() {
    setSearchAttempt((attempt) => attempt + 1);
  }

  function retryTrending() {
    setTrendingError(null);
    setIsLoadingTrending(true);

    Promise.all([
      tmdb.get<MovieResponse>("/trending/movie/day"),
      tmdb.get<{ genres: Genre[] }>("/genre/movie/list"),
    ])
      .then(([trendingResponse, genresResponse]) => {
        setTrendingMovies(trendingResponse.data.results);
        setGenres(genresResponse.data.genres);
      })
      .catch((error) => {
        console.error("Failed to retry trending movies:", error);
        setTrendingError("Could not load trending movies. Please try again.");
      })
      .finally(() => setIsLoadingTrending(false));
  }

  const hasActiveSearch = Boolean(activeQuery.trim());
  const activeFilterCount = [
    genreFilter,
    yearFilter,
    ratingFilter !== "0" ? ratingFilter : "",
  ].filter(Boolean).length;

  function clearFilters() {
    setGenreFilter("");
    setYearFilter("");
    setRatingFilter("0");
  }

  return (
    <Box
      component="main"
      sx={{
        width: "100%",
        maxWidth: 1440,
        mx: "auto",
        px: { xs: 2, sm: 3, md: 4, lg: 5 },
        pt: { xs: 4, sm: 6, md: 7 },
        pb: { xs: 6, sm: 8 },
        boxSizing: "border-box",
      }}
    >
      {/* Hero */}
      <Box
        sx={(theme) => ({
          position: "relative",
          mb: { xs: 5, sm: 7 },
          overflow: "hidden",
          borderRadius: { xs: "18px", sm: "24px" },
          border: 1,
          borderColor: "divider",
          background:
            theme.palette.mode === "dark"
              ? `
                radial-gradient(ellipse at 90% 0%, ${alpha(tokens.saffron, 0.12)}, transparent 42%),
                linear-gradient(135deg, ${tokens.plum} 0%, ${tokens.night} 80%)
              `
              : `
                radial-gradient(ellipse at 90% 0%, ${alpha(tokens.saffron, 0.18)}, transparent 48%),
                linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)
              `,
          px: { xs: 2.5, sm: 4, md: 6 },
          py: { xs: 4, sm: 5, md: 6 },
        })}
      >
        <Box
          sx={(theme) => ({
            position: "absolute",
            right: { xs: -35, sm: 30, md: 65 },
            top: "50%",
            transform: "translateY(-50%) rotate(-12deg)",
            color: alpha(
              tokens.saffron,
              theme.palette.mode === "dark" ? 0.07 : 0.12,
            ),
            pointerEvents: "none",
            display: { xs: "none", sm: "block" },
          })}
          aria-hidden="true"
        >
          <LocalMoviesRounded sx={{ fontSize: { sm: 180, md: 240 } }} />
        </Box>

        <Box sx={{ position: "relative", zIndex: 1, maxWidth: 760 }}>
          <SectionEyebrow>Your personal cinema guide</SectionEyebrow>

          <Typography
            component="h1"
            sx={{
              fontFamily: tokens.fontDisplay,
              fontSize: {
                xs: "2.25rem",
                sm: "3.3rem",
                md: "4rem",
              },
              lineHeight: { xs: 1.1, sm: 1.05 },
              letterSpacing: "-0.045em",
              fontWeight: 600,
              maxWidth: 720,
              "& .accent": {
                color: "primary.main",
                fontStyle: "italic",
              },
            }}
          >
            Find your next
            <br />
            <Box component="span" className="accent">
              favorite movie.
            </Box>
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 2,
              mb: 3.5,
              maxWidth: 470,
              fontSize: { xs: "0.95rem", sm: "1.05rem" },
              lineHeight: 1.8,
            }}
          >
            Discover what&apos;s trending, explore new genres, and find
            something worth watching tonight.
          </Typography>

          {/* Search */}
          <Box
            component="form"
            role="search"
            onSubmit={handleSearch}
            sx={(theme) => ({
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              width: "100%",
              maxWidth: 680,
              minHeight: 62,
              pl: { xs: 1.5, sm: 2 },
              pr: 1,
              py: 1,
              boxSizing: "border-box",
              bgcolor: alpha(theme.palette.background.default, 0.85),
              border: 1,
              borderColor: "divider",
              borderRadius: "16px",
              transition: "border-color 180ms ease, box-shadow 180ms ease",
              "&:focus-within": {
                borderColor: "primary.main",
                boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.13)}`,
              },
            })}
          >
            <SearchRounded
              sx={{
                fontSize: 25,
                color: "text.secondary",
                flexShrink: 0,
              }}
            />

            <InputBase
              fullWidth
              placeholder="Search titles, classics, new releases..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              inputProps={{
                "aria-label": "Search movies",
                enterKeyHint: "search",
                autoComplete: "off",
              }}
              sx={{
                flex: 1,
                minWidth: 0,
                px: 0.75,
                fontSize: { xs: "0.85rem", sm: "0.95rem" },
                "& input::placeholder": {
                  color: "text.secondary",
                  opacity: 0.8,
                },
              }}
            />

            {(searchQuery || hasActiveSearch) && (
              <IconButton
                aria-label="Clear search"
                onClick={clearSearch}
                size="small"
                sx={{
                  width: 36,
                  height: 36,
                  color: "text.secondary",
                  flexShrink: 0,
                }}
              >
                <CloseRounded fontSize="small" />
              </IconButton>
            )}

            <Button
              type="submit"
              variant="contained"
              disabled={!searchQuery.trim()}
              startIcon={<SearchRounded />}
              sx={{
                minHeight: 44,
                px: { xs: 1.5, sm: 2.5 },
                borderRadius: "11px",
                flexShrink: 0,
                "& .MuiButton-startIcon": {
                  mr: { xs: 0, sm: 0.75 },
                },
                "& .MuiButton-startIcon svg": {
                  fontSize: 19,
                },
              }}
            >
              <Box
                component="span"
                sx={{ display: { xs: "none", sm: "inline" } }}
              >
                Search
              </Box>
            </Button>
          </Box>

          <Typography
            sx={{
              mt: 1.5,
              fontSize: "0.75rem",
              color: "text.secondary",
            }}
          >
            Discover your next movie-night pick.
          </Typography>
        </Box>
      </Box>

      {/* Trending */}
      {!hasActiveSearch && (
        <Box component="section" aria-labelledby="trending-title">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: 2,
              mb: 3,
            }}
          >
            <Box>
              <SectionEyebrow>Worth a watch</SectionEyebrow>

              <Typography
                id="trending-title"
                component="h2"
                sx={sectionTitleSx}
              >
                Trending today
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ mt: 0.75, fontSize: "0.875rem" }}
              >
                Popular picks everyone&apos;s talking about.
              </Typography>
            </Box>

            <Box
              sx={{
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                gap: 0.75,
                color: "text.secondary",
                fontSize: "0.8rem",
                whiteSpace: "nowrap",
              }}
            >
              <LocalMoviesRounded sx={{ fontSize: 18 }} />
              Daily picks
            </Box>
          </Box>

          {isLoadingTrending ? (
            <PosterSkeletons count={10} />
          ) : trendingError ? (
            <Notice
              tone="error"
              message={trendingError}
              actionLabel="Try again"
              onAction={retryTrending}
            />
          ) : trendingMovies.length === 0 ? (
            <Notice message="No trending movies are available right now. Check back later." />
          ) : (
            <Box sx={gridStyles}>
              {trendingMovies.slice(0, 10).map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* Search results */}
      {hasActiveSearch && (
        <Box component="section" aria-labelledby="results-title">
          <Box sx={{ mb: 3.5 }}>
            <SectionEyebrow>Movie discovery</SectionEyebrow>

            <Typography
              id="results-title"
              component="h2"
              sx={{
                ...sectionTitleSx,
                wordBreak: "break-word",
              }}
            >
              Results for{" "}
              <Box
                component="span"
                sx={{ color: "primary.main", fontStyle: "italic" }}
              >
                &ldquo;{activeQuery}&rdquo;
              </Box>
            </Typography>

            {!isLoadingSearch && !searchError && (
              <Typography
                color="text.secondary"
                sx={{ mt: 0.75, fontSize: "0.875rem" }}
              >
                {filteredMovies.length}{" "}
                {filteredMovies.length === 1 ? "movie" : "movies"} shown
                {activeFilterCount > 0
                  ? ` · ${activeFilterCount} active ${activeFilterCount === 1 ? "filter" : "filters"}`
                  : ""}
              </Typography>
            )}
          </Box>

          {/* Filters */}
          <Box
            sx={{
              p: { xs: 1.75, sm: 2.5 },
              mb: 3.5,
              border: 1,
              borderColor: "divider",
              borderRadius: "16px",
              bgcolor: "background.paper",
              backgroundImage: "none",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                mb: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <TuneRounded sx={{ color: "primary.main", fontSize: 20 }} />
                <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
                  Refine results
                </Typography>

                {activeFilterCount > 0 && (
                  <Box
                    sx={{
                      display: "grid",
                      placeItems: "center",
                      minWidth: 22,
                      height: 22,
                      px: 0.5,
                      borderRadius: "7px",
                      bgcolor: alpha(tokens.saffron, 0.13),
                      color: "primary.main",
                      fontSize: "0.72rem",
                      fontWeight: 800,
                    }}
                  >
                    {activeFilterCount}
                  </Box>
                )}
              </Box>

              {activeFilterCount > 0 && (
                <Button
                  onClick={clearFilters}
                  size="small"
                  color="inherit"
                  sx={{
                    color: "text.secondary",
                    minWidth: 0,
                    px: 1,
                    "&:hover": { color: "primary.main" },
                  }}
                >
                  Reset
                </Button>
              )}
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, minmax(0, 1fr))",
                  sm: "repeat(3, minmax(0, 1fr))",
                },
                gap: 1.5,
                minWidth: 0,
              }}
            >
              <TextField
                select
                size="small"
                label="Genre"
                value={genreFilter}
                onChange={(event) => setGenreFilter(event.target.value)}
                slotProps={{ select: selectProps }}
                sx={{
                  ...filterFieldSx,
                  gridColumn: { xs: "1 / -1", sm: "auto" },
                }}
              >
                <MenuItem value="">All genres</MenuItem>
                {genres.map((genre) => (
                  <MenuItem key={genre.id} value={String(genre.id)}>
                    {genre.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                size="small"
                label="Release year"
                value={yearFilter}
                onChange={(event) => setYearFilter(event.target.value)}
                slotProps={{ select: selectProps }}
                sx={filterFieldSx}
              >
                <MenuItem value="">All years</MenuItem>
                {Array.from(
                  { length: currentYear - 1894 },
                  (_, index) => currentYear - index,
                ).map((year) => (
                  <MenuItem key={year} value={String(year)}>
                    {year}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                size="small"
                label="Minimum rating"
                value={ratingFilter}
                onChange={(event) => setRatingFilter(event.target.value)}
                slotProps={{ select: selectProps }}
                sx={filterFieldSx}
              >
                <MenuItem value="0">Any rating</MenuItem>
                <MenuItem value="5">5+ stars</MenuItem>
                <MenuItem value="6">6+ stars</MenuItem>
                <MenuItem value="7">7+ stars</MenuItem>
                <MenuItem value="8">8+ stars</MenuItem>
              </TextField>
            </Box>
          </Box>

          {isLoadingSearch ? (
            <PosterSkeletons count={10} />
          ) : searchError ? (
            <Notice
              tone="error"
              message={searchError}
              actionLabel="Try again"
              onAction={retrySearch}
            />
          ) : filteredMovies.length === 0 ? (
            <Notice
              message={
                searchResults.length === 0
                  ? `No movies found for “${activeQuery}”. Check the spelling or try a shorter title.`
                  : "No movies match these filters. Try another genre, year or rating."
              }
            />
          ) : (
            <>
              <Box sx={gridStyles}>
                {filteredMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </Box>

              <Box
                ref={sentinelRef}
                sx={{ minHeight: 24, mt: 3 }}
                aria-hidden="true"
              />

              {isLoadingMore && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1.5,
                    py: 4,
                    color: "text.secondary",
                  }}
                >
                  <CircularProgress
                    size={23}
                    aria-label="Loading more movies"
                    sx={{ color: "primary.main" }}
                  />
                  <Typography sx={{ fontSize: "0.85rem" }}>
                    Finding more movies...
                  </Typography>
                </Box>
              )}

              {loadMoreError && (
                <Box sx={{ mt: 2 }}>
                  <Notice
                    tone="error"
                    message={loadMoreError}
                    actionLabel="Try again"
                    onAction={() => {
                      setLoadMoreError(null);
                      setRetryLoadMore((count) => count + 1);
                    }}
                  />
                </Box>
              )}

              {!isLoadingMore &&
                !loadMoreError &&
                page >= totalPages &&
                searchResults.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                      py: 4,
                      color: "text.secondary",
                    }}
                  >
                    <StarRounded sx={{ fontSize: 18, color: "primary.main" }} />
                    <Typography sx={{ fontSize: "0.85rem" }}>
                      You&apos;ve reached the end of the results.
                    </Typography>
                  </Box>
                )}

              {!isLoadingMore &&
                !loadMoreError &&
                page < totalPages &&
                filteredMovies.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mt: 2,
                    }}
                  >
                    <Button
                      onClick={() => {
                        setRetryLoadMore((count) => count + 1);
                        void loadNextPage();
                      }}
                      variant="text"
                      color="inherit"
                      endIcon={<ArrowDownwardRounded />}
                      sx={{
                        color: "text.secondary",
                        "&:hover": { color: "primary.main" },
                      }}
                    >
                      Load more movies
                    </Button>
                  </Box>
                )}
            </>
          )}
        </Box>
      )}
    </Box>
  );
}
