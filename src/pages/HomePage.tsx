import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import tmdb from "../api/tmdb";
import type { Movie } from "../types/movie";
import { MovieCard } from "../components/MovieCard";
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
  gap: 2,
};
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
  // Fetch trending movies and available genres.
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
  // Fetch the first page whenever a new search is submitted.
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
          params: {
            query,
            page: 1,
          },
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
  // Fetch and append the next page when the user reaches the results' end.
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
        params: {
          query,
          page: nextPage,
        },
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
  // Observe a sentinel below the search results instead of watching
  // the entire window's scroll position.
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
      {
        root: null,
        rootMargin: "500px",
        threshold: 0,
      },
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
  // Apply filters to all search results already fetched.
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
  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
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
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1440,
        mx: "auto",
        px: { xs: 2, sm: 3, lg: 4 },
        py: { xs: 2.5, sm: 3 },
        boxSizing: "border-box",
      }}
    >
      <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 800 }}>
        Movie Explorer
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2.5 }}>
        Discover your next favorite movie.
      </Typography>
      <Box
        component="form"
        onSubmit={handleSearch}
        sx={{
          display: "flex",
          alignItems: { xs: "stretch", sm: "flex-start" },
          gap: 1.25,
          mb: 3.5,
          width: "100%",
          minWidth: 0,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <TextField
          fullWidth
          sx={{
            flex: "1 1 auto",
            minWidth: 0,
            "& .MuiInputBase-root": { minHeight: 56 },
          }}
          label="Search movies"
          placeholder="Enter a movie title..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        <Box
          sx={{
            display: "flex",
            flex: { xs: "1 1 auto", sm: "0 0 auto" },
            minWidth: 0,
            gap: 1,
            width: { xs: "100%", sm: "auto" },
            "& .MuiButton-root": {
              minHeight: 56,
              whiteSpace: "nowrap",
              px: { xs: 1.5, sm: 2.5 },
            },
            "& .MuiButton-root:first-of-type": {
              flex: { xs: "1 1 0", sm: "0 0 auto" },
            },
          }}
        >
          <Button
            type="submit"
            variant="contained"
            disabled={!searchQuery.trim()}
          >
            Search
          </Button>
          {activeQuery.trim() && (
            <Button
              type="button"
              variant="outlined"
              onClick={() => {
                setSearchQuery("");
                setActiveQuery("");
                localStorage.removeItem("lastSearch");
                setGenreFilter("");
                setYearFilter("");
                setRatingFilter("0");
                setLoadMoreError(null);
              }}
            >
              Clear Search
            </Button>
          )}
        </Box>
      </Box>
      {/* Trending appears only when there is no active search. */}
      {!activeQuery.trim() && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            Trending Today
          </Typography>
          {isLoadingTrending ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress />
            </Box>
          ) : trendingError ? (
            <Box>
              <Typography color="error" sx={{ mb: 2 }}>
                {trendingError}
              </Typography>
              <Button variant="outlined" onClick={retryTrending}>
                Retry
              </Button>
            </Box>
          ) : trendingMovies.length === 0 ? (
            <Typography color="text.secondary">
              No trending movies are available right now.
            </Typography>
          ) : (
            <Box sx={gridStyles}>
              {trendingMovies.slice(0, 10).map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </Box>
          )}
        </Box>
      )}
      {/* Search results are shown directly below the search bar. */}
      {activeQuery.trim() && (
        <Box>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            Search Results for &quot;{activeQuery}&quot;
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(3, minmax(0, 1fr))",
              },
              gap: { xs: 1.5, sm: 2 },
              width: "100%",
              minWidth: 0,
              mb: 3,
              alignItems: "start",
              "& .MuiFormControl-root": {
                width: "100%",
                minWidth: 0,
              },
            }}
          >
            <TextField
              select
              label="Genre"
              value={genreFilter}
              onChange={(event) => setGenreFilter(event.target.value)}
              fullWidth
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
              label="Release year"
              value={yearFilter}
              onChange={(event) => setYearFilter(event.target.value)}
              fullWidth
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
              label="Minimum rating"
              value={ratingFilter}
              onChange={(event) => setRatingFilter(event.target.value)}
              fullWidth
            >
              <MenuItem value="0">Any rating</MenuItem>
              <MenuItem value="5">5+</MenuItem>
              <MenuItem value="6">6+</MenuItem>
              <MenuItem value="7">7+</MenuItem>
              <MenuItem value="8">8+</MenuItem>
            </TextField>
          </Box>
          {isLoadingSearch ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 180,
                py: 2,
              }}
            >
              <CircularProgress />
            </Box>
          ) : searchError ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography color="error" sx={{ mb: 2 }}>
                {searchError}
              </Typography>
              <Button variant="contained" onClick={retrySearch}>
                Retry Search
              </Button>
            </Box>
          ) : filteredMovies.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 3 }}>
              {searchResults.length === 0
                ? "No movies found. Try another search."
                : "No movies match your selected filters."}
            </Typography>
          ) : (
            <>
              <Box sx={gridStyles}>
                {filteredMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </Box>
              {/* IntersectionObserver watches this element to load more. */}
              <Box
                ref={sentinelRef}
                sx={{ minHeight: 24, mt: 3 }}
                aria-hidden="true"
              />
              {isLoadingMore && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    py: 3,
                  }}
                >
                  <CircularProgress />
                </Box>
              )}
              {loadMoreError && (
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <Typography color="error" sx={{ mb: 2 }}>
                    {loadMoreError}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setLoadMoreError(null);
                      setRetryLoadMore((count) => count + 1);
                    }}
                  >
                    Retry Loading More
                  </Button>
                </Box>
              )}
              {!isLoadingMore &&
                !loadMoreError &&
                page >= totalPages &&
                searchResults.length > 0 && (
                  <Typography
                    sx={{
                      py: 3,
                      color: "text.secondary",
                      textAlign: "center",
                    }}
                  >
                    You&apos;ve reached the end of the results.
                  </Typography>
                )}
            </>
          )}
        </Box>
      )}
    </Box>
  );
}
