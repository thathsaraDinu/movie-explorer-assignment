import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import {
  ArrowBackRounded,
  PlayArrowRounded,
  StarRounded,
  MovieOutlined,
  PersonOutlineRounded,
} from "@mui/icons-material";
import tmdb from "../api/tmdb";
import { tokens } from "../theme/theme";

type MovieDetails = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genres: { id: number; name: string }[];
};

type Credits = {
  cast: {
    id: number;
    name: string;
    character: string;
    profile_path?: string | null;
  }[];
};

type Videos = {
  results: {
    key: string;
    name: string;
    site: string;
    type: string;
    official?: boolean;
  }[];
};

const imageBase = "https://image.tmdb.org/t/p";
const heroText = "#FFFFFF";
const heroMuted = "rgba(255,255,255,0.7)";
const heroBorder = "rgba(255,255,255,0.14)";

export function MovieDetailsPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [cast, setCast] = useState<Credits["cast"]>([]);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!movieId) {
      setError("Invalid movie ID.");
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchDetails() {
      setIsLoading(true);
      setError(null);

      try {
        const [detailsRes, creditsRes, videosRes] = await Promise.all([
          tmdb.get(`/movie/${movieId}`),
          tmdb.get(`/movie/${movieId}/credits`),
          tmdb.get(`/movie/${movieId}/videos`),
        ]);

        if (cancelled) return;

        setMovie(detailsRes.data);
        setCast((creditsRes.data as Credits).cast ?? []);

        const videos = (videosRes.data as Videos).results ?? [];
        const trailer =
          videos.find(
            (video) =>
              video.site === "YouTube" &&
              video.type === "Trailer" &&
              video.official,
          ) ??
          videos.find(
            (video) => video.site === "YouTube" && video.type === "Trailer",
          );

        setTrailerKey(trailer?.key ?? null);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Could not load this movie. Please try again.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void fetchDetails();

    return () => {
      cancelled = true;
    };
  }, [movieId]);

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "70vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <CircularProgress color="primary" />
        <Typography color="text.secondary" variant="body2">
          Setting the scene...
        </Typography>
      </Box>
    );
  }

  if (error || !movie) {
    return (
      <Box
        sx={{
          minHeight: "65vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: 3,
          gap: 2,
          textAlign: "center",
        }}
      >
        <Alert severity="error">{error ?? "Movie not found."}</Alert>
        <Button
          startIcon={<ArrowBackRounded />}
          onClick={() => navigate("/")}
          variant="outlined"
        >
          Back to movies
        </Button>
      </Box>
    );
  }

  const hasBackdrop = Boolean(movie.backdrop_path);
  const releaseYear = movie.release_date?.slice(0, 4);
  const rating = Number(movie.vote_average);
  const validRating = Number.isFinite(rating);

  return (
    <Box sx={{ color: "text.primary", pb: 7 }}>
      {/* Cinematic hero: deliberately dark in both themes */}
      <Box
        sx={{
          position: "relative",
          isolation: "isolate",
          overflow: "hidden",
          color: heroText,
          backgroundColor: "#100F0E",
          backgroundImage: hasBackdrop
            ? `linear-gradient(90deg, rgba(12,10,9,0.97) 0%, rgba(12,10,9,0.88) 38%, rgba(12,10,9,0.58) 72%, rgba(12,10,9,0.4) 100%), linear-gradient(0deg, #100F0E 0%, rgba(16,15,14,0.15) 65%, rgba(16,15,14,0.3) 100%), url(${imageBase}/original${movie.backdrop_path})`
            : `radial-gradient(ellipse at 80% 15%, ${alpha(tokens.saffron, 0.16)}, transparent 45%), linear-gradient(145deg, #211B1A, #100F0E)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderBottom: `1px solid ${isDark ? tokens.line : "rgba(0,0,0,0.12)"}`,
        }}
      >
        <Box
          sx={{
            maxWidth: 1440,
            mx: "auto",
            px: { xs: 2, sm: 3, lg: 5 },
            pt: { xs: 2, md: 3 },
            pb: { xs: 5, md: 8 },
          }}
        >
          <Button
            startIcon={<ArrowBackRounded />}
            onClick={() => navigate(-1)}
            sx={{
              mb: { xs: 3, md: 5 },
              color: heroMuted,
              "&:hover": {
                color: heroText,
                bgcolor: "rgba(255,255,255,0.08)",
              },
            }}
          >
            Go back
          </Button>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: movie.poster_path ? "220px minmax(0, 1fr)" : "1fr",
                md: movie.poster_path ? "280px minmax(0, 1fr)" : "1fr",
              },
              alignItems: "start",
              gap: { xs: 4, md: 6 },
            }}
          >
            {movie.poster_path ? (
              <Box
                component="img"
                src={`${imageBase}/w500${movie.poster_path}`}
                alt={`${movie.title} poster`}
                sx={{
                  display: "block",
                  width: "100%",
                  maxWidth: { xs: 260, sm: "none" },
                  mx: { xs: "auto", sm: 0 },
                  aspectRatio: "2 / 3",
                  objectFit: "cover",
                  borderRadius: 1.5,
                  border: `1px solid ${heroBorder}`,
                  boxShadow: "0 24px 70px rgba(0,0,0,0.5)",
                }}
              />
            ) : (
              <Box
                sx={{
                  display: "grid",
                  placeItems: "center",
                  width: { xs: "100%", sm: 220, md: 280 },
                  aspectRatio: "2 / 3",
                  borderRadius: 1.5,
                  bgcolor: "rgba(255,255,255,0.05)",
                  border: `1px solid ${heroBorder}`,
                  color: heroMuted,
                }}
              >
                <MovieOutlined sx={{ fontSize: 52 }} />
              </Box>
            )}

            <Box sx={{ minWidth: 0, pt: { sm: 1, md: 3 } }}>
              <Typography
                sx={{
                  color: "primary.main",
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  mb: 1.5,
                }}
              >
                Movie details
              </Typography>

              <Typography
                variant="h1"
                sx={{
                  color: heroText,
                  fontSize: {
                    xs: "2.5rem",
                    sm: "2.8rem",
                    md: "4rem",
                  },
                  fontWeight: 700,
                  lineHeight: 1.08,
                  letterSpacing: "-0.04em",
                  overflowWrap: "anywhere",
                  mb: 2,
                }}
              >
                {movie.title}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 3,
                  color: heroMuted,
                }}
              >
                {releaseYear && (
                  <Typography variant="body2" sx={{ color: heroMuted }}>
                    {releaseYear}
                  </Typography>
                )}

                {releaseYear && validRating && (
                  <Typography sx={{ color: "rgba(255,255,255,0.4)" }}>
                    •
                  </Typography>
                )}

                {validRating && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      color: "primary.main",
                    }}
                  >
                    <StarRounded sx={{ fontSize: 20 }} />
                    <Typography
                      variant="body2"
                      sx={{ color: heroText, fontWeight: 800 }}
                    >
                      {rating.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: heroMuted }}>
                      / 10
                    </Typography>
                  </Box>
                )}
              </Box>

              {movie.genres.length > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    mb: 4,
                  }}
                >
                  {movie.genres.map((genre) => (
                    <Chip
                      key={genre.id}
                      label={genre.name}
                      size="small"
                      sx={{
                        color: heroText,
                        bgcolor: "rgba(255,255,255,0.07)",
                        border: `1px solid ${heroBorder}`,
                        fontWeight: 600,
                        "& .MuiChip-label": { px: 1.5 },
                      }}
                    />
                  ))}
                </Box>
              )}

              <Typography
                sx={{
                  color: heroMuted,
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  mb: 1.25,
                }}
              >
                Synopsis
              </Typography>

              <Typography
                sx={{
                  maxWidth: 720,
                  fontSize: { xs: "0.95rem", md: "1.05rem" },
                  lineHeight: 1.9,
                  color: "rgba(255,255,255,0.84)",
                  whiteSpace: "pre-line",
                }}
              >
                {movie.overview || "No synopsis is available for this movie."}
              </Typography>

              {trailerKey && (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PlayArrowRounded />}
                  onClick={() => {
                    window.open(
                      `https://www.youtube.com/watch?v=${trailerKey}`,
                      "_blank",
                      "noopener,noreferrer",
                    );
                  }}
                  sx={{
                    mt: 3.5,
                    px: 3,
                    py: 1.3,
                    fontWeight: 800,
                    boxShadow: "none",
                    "&:hover": {
                      boxShadow: `0 6px 22px ${alpha(theme.palette.primary.main, 0.22)}`,
                    },
                  }}
                >
                  Watch trailer
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Cast: adapts to the active app theme */}
      <Box
        sx={{
          maxWidth: 1440,
          mx: "auto",
          px: { xs: 2, sm: 3, lg: 5 },
          pt: { xs: 4, md: 6 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: 3,
          }}
        >
          <Box
            sx={{
              width: 4,
              height: 28,
              borderRadius: 1,
              bgcolor: "primary.main",
            }}
          />
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                fontSize: "1.6rem",
                letterSpacing: "-0.025em",
              }}
            >
              The cast
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.25 }}
            >
              The people who brought this story to life
            </Typography>
          </Box>
        </Box>

        {cast.length > 0 ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                sm: "repeat(3, minmax(0, 1fr))",
                md: "repeat(4, minmax(0, 1fr))",
                lg: "repeat(5, minmax(0, 1fr))",
              },
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            {cast.slice(0, 10).map((person) => (
              <Box
                key={person.id}
                sx={{
                  minWidth: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: { xs: 1.25, sm: 1.75 },
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1.5,
                  bgcolor: "background.paper",
                  transition: "border-color 180ms ease, transform 180ms ease",
                  "&:hover": {
                    borderColor: alpha(theme.palette.primary.main, 0.5),
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {person.profile_path ? (
                  <Box
                    component="img"
                    src={`${imageBase}/w185${person.profile_path}`}
                    alt={person.name}
                    loading="lazy"
                    sx={{
                      width: { xs: 44, sm: 52 },
                      height: { xs: 44, sm: 52 },
                      flexShrink: 0,
                      objectFit: "cover",
                      borderRadius: 1,
                      bgcolor: "action.hover",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: { xs: 44, sm: 52 },
                      height: { xs: 44, sm: 52 },
                      flexShrink: 0,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 1,
                      bgcolor: "action.hover",
                      color: "text.secondary",
                    }}
                  >
                    <PersonOutlineRounded />
                  </Box>
                )}

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: "0.85rem",
                      fontWeight: 750,
                      lineHeight: 1.4,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {person.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                      fontSize: "0.75rem",
                      lineHeight: 1.45,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {person.character || "Character unknown"}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">
            Cast information is not available for this movie.
          </Typography>
        )}

        <Divider sx={{ mt: 5, borderColor: "divider" }} />
      </Box>
    </Box>
  );
}
