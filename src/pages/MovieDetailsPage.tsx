import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Typography,
} from "@mui/material";
import tmdb from "../api/tmdb";

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
  cast: { id: number; name: string; character: string }[];
};

type Videos = {
  results: {
    key: string;
    name: string;
    site: string;
    type: string;
  }[];
};

export function MovieDetailsPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();

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

    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [detailsRes, creditsRes, videosRes] = await Promise.all([
          tmdb.get(`/movie/${movieId}`),
          tmdb.get(`/movie/${movieId}/credits`),
          tmdb.get(`/movie/${movieId}/videos`),
        ]);

        setMovie(detailsRes.data);
        setCast(creditsRes.data.cast);

        const trailer = (videosRes.data as Videos).results.find(
          (video) => video.site === "YouTube" && video.type === "Trailer"
        );

        setTrailerKey(trailer?.key ?? null);
      } catch (err) {
        console.error(err);
        setError("Could not load this movie. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [movieId]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !movie) {
    return (
      <Box
        sx={{
          bgcolor: "background.default",
          color: "text.primary",
          minHeight: "100vh",
          p: 4,
        }}
      >
        <Typography sx={{ mb: 2 }}>
          {error ?? "Movie not found."}
        </Typography>
        <Button onClick={() => navigate("/")}>Back to movies</Button>
      </Box>
    );
  }

  const hasBackdrop = Boolean(movie.backdrop_path);

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
        minHeight: "100vh",
      }}
    >
      {/* Movie hero section */}
      <Box
        sx={{
          p: { xs: 2, md: 5 },
          color: hasBackdrop ? "#ffffff" : "text.primary",
          backgroundColor: "background.paper",
          backgroundImage: hasBackdrop
            ? `linear-gradient(to right, rgba(0,0,0,0.9), rgba(0,0,0,0.5)), url(https://image.tmdb.org/t/p/w1280${movie.backdrop_path})`
            : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Button
          onClick={() => navigate("/")}
          sx={{
            mb: 3,
            color: hasBackdrop ? "#ffffff" : "primary.main",
          }}
        >
          ← Back
        </Button>

        <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {movie.poster_path && (
            <Box
              component="img"
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              sx={{
                width: { xs: "100%", sm: 220 },
                maxWidth: 300,
                height: "fit-content",
                borderRadius: 1,
                boxShadow: 3,
              }}
            />
          )}

          <Box sx={{ flex: 1, minWidth: 250 }}>
            <Typography
              variant="h3"
              sx={{ fontWeight: "bold", mb: 1, color: "inherit" }}
            >
              {movie.title}
            </Typography>

            <Typography sx={{ mb: 2, color: "inherit", opacity: 0.85 }}>
              {movie.release_date?.slice(0, 4) || "Release date unknown"}
              {" · "}⭐ {movie.vote_average.toFixed(1)}
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                mb: 3,
              }}
            >
              {movie.genres.map((genre) => (
                <Chip
                  key={genre.id}
                  label={genre.name}
                  sx={{
                    color: hasBackdrop ? "#ffffff" : "text.primary",
                    bgcolor: hasBackdrop
                      ? "rgba(255,255,255,0.15)"
                      : "action.hover",
                    border: 1,
                    borderColor: hasBackdrop
                      ? "rgba(255,255,255,0.3)"
                      : "divider",
                  }}
                />
              ))}
            </Box>

            <Typography
              variant="h5"
              sx={{ mb: 1, color: "inherit" }}
            >
              Overview
            </Typography>

            <Typography
              sx={{
                lineHeight: 1.8,
                color: "inherit",
                opacity: 0.9,
              }}
            >
              {movie.overview || "No overview available."}
            </Typography>

            {trailerKey && (
              <Button
                variant="contained"
                sx={{ mt: 3 }}
                onClick={() =>
                  window.open(
                    `https://www.youtube.com/watch?v=${trailerKey}`,
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
              >
                Watch trailer
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Cast section */}
      <Box sx={{ px: { xs: 2, md: 5 }, py: 4 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: "bold", mb: 2 }}
        >
          Cast
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, minmax(0, 1fr))",
              sm: "repeat(3, minmax(0, 1fr))",
              md: "repeat(5, minmax(0, 1fr))",
            },
            gap: 2,
          }}
        >
          {cast.slice(0, 10).map((person) => (
            <Box
              key={person.id}
              sx={{
                bgcolor: "background.paper",
                color: "text.primary",
                p: 2,
                borderRadius: 1,
                border: 1,
                borderColor: "divider",
              }}
            >
              <Typography sx={{ fontWeight: "bold" }}>
                {person.name}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {person.character}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}