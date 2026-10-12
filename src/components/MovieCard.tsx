import { useState } from "react";
import type { KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Card, IconButton, SvgIcon, Typography } from "@mui/material";
import type { Movie } from "../types/movie";
import { useFavorites } from "../context/FavoritesContext";
import { tokens } from "../theme/theme";

type MovieCardProps = {
  movie: Movie;
};

/* Small inline icons so no extra icon package is required */
function StarIcon() {
  return (
    <SvgIcon sx={{ fontSize: 15, color: "primary.main" }} viewBox="0 0 24 24">
      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </SvgIcon>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <SvgIcon sx={{ fontSize: 20 }} viewBox="0 0 24 24">
      {filled ? (
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      ) : (
        <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" />
      )}
    </SvgIcon>
  );
}

export function MovieCard({ movie }: MovieCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();
  const navigate = useNavigate();

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  const releaseYear = movie.release_date
    ? movie.release_date.slice(0, 4)
    : "Date unknown";

  const favorite = isFavorite(movie.id);
  const isRated = movie.vote_count > 0;

  const openDetails = () => navigate(`/movies/${movie.id}`);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Only react when the card itself is focused, not the favorite button
    if (event.target === event.currentTarget && event.key === "Enter") {
      openDetails();
    }
  };

  return (
    <Card
      role="link"
      tabIndex={0}
      aria-label={`View details for ${movie.title}`}
      onClick={openDetails}
      onKeyDown={handleKeyDown}
      sx={{
        position: "relative",
        aspectRatio: "2 / 3",
        width: "100%",
        overflow: "hidden",
        cursor: "pointer",
        borderRadius: `${tokens.radius}px`,
        borderColor: "divider",
        transition:
          "transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.35s ease, border-color 0.35s ease",
        "&:hover, &:focus-visible": {
          transform: "translateY(-6px)",
          borderColor: "rgba(245, 184, 75, 0.45)",
          boxShadow: "0 22px 44px -12px rgba(0, 0, 0, 0.65)",
        },
        "&:focus-visible": {
          outline: `2px solid ${tokens.saffron}`,
          outlineOffset: 3,
        },
        // Reveal the overview on hover or keyboard focus
        "&:hover .movie-details, &:focus-within .movie-details": {
          gridTemplateRows: "1fr",
        },
        "&:hover .movie-overview, &:focus-within .movie-overview": {
          opacity: 1,
          transform: "translateY(0)",
        },
        "&:hover .movie-poster, &:focus-visible .movie-poster": {
          transform: "scale(1.05)",
        },
        "@media (prefers-reduced-motion: reduce)": {
          transition: "none",
          "&:hover, &:focus-visible": { transform: "none" },
          "& .movie-poster, & .movie-details, & .movie-overview": {
            transition: "none",
          },
          "&:hover .movie-poster, &:focus-visible .movie-poster": {
            transform: "none",
          },
        },
      }}
    >
      {/* Poster */}
      {posterUrl ? (
        <Box
          component="img"
          className="movie-poster"
          src={posterUrl}
          alt={movie.title}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: imageLoaded ? 1 : 0,
            transform: "scale(1)",
            transition:
              "opacity 0.5s ease, transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
        />
      ) : (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            bgcolor: "action.hover",
            p: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            No poster available
          </Typography>
        </Box>
      )}

      {/* Rating chip */}
      <Box
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          height: 32,
          px: 1.25,
          borderRadius: 999,
          bgcolor: tokens.glass,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: `1px solid ${tokens.onPosterLine}`,
        }}
      >
        {isRated && <StarIcon />}
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            fontSize: 13,
            lineHeight: 1,
            color: tokens.onPoster,
          }}
        >
          {isRated ? movie.vote_average.toFixed(1) : "Unrated"}
        </Typography>
      </Box>

      {/* Favorite button */}
      <IconButton
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        aria-pressed={favorite}
        onClick={(event) => {
          event.stopPropagation();
          toggleFavorite(movie);
        }}
        sx={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 3,
          width: 36,
          height: 36,
          p: 0,
          bgcolor: tokens.glass,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: `1px solid ${favorite ? "rgba(255, 92, 122, 0.5)" : tokens.onPosterLine}`,
          color: favorite ? tokens.rose : tokens.onPoster,
          transition:
            "transform 0.2s ease, background-color 0.2s ease, color 0.2s ease",
          "&:hover": {
            bgcolor: "rgba(19, 17, 31, 0.85)",
            transform: "scale(1.08)",
          },
          "&:active": { transform: "scale(0.92)" },
        }}
      >
        <HeartIcon filled={favorite} />
      </IconButton>

      {/* Bottom scrim + info */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
          px: 2,
          pb: 2,
          pt: 10,
          background:
            "linear-gradient(to top, rgba(19,17,31,0.96) 0%, rgba(19,17,31,0.82) 45%, rgba(19,17,31,0) 100%)",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: tokens.onPoster,
            fontSize: "1.1rem",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {movie.title}
        </Typography>

        <Typography
          variant="body2"
          sx={{ mt: 0.5, color: tokens.onPosterMuted, fontWeight: 600 }}
        >
          {releaseYear}
        </Typography>

        {/* Overview — expands smoothly on hover / focus */}
        <Box
          className="movie-details"
          sx={{
            display: "grid",
            gridTemplateRows: "0fr",
            transition:
              "grid-template-rows 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
        >
          <Box sx={{ overflow: "hidden" }}>
            <Typography
              className="movie-overview"
              variant="body2"
              sx={{
                pt: 1.25,
                color: tokens.onPosterBody,
                opacity: 0,
                transform: "translateY(8px)",
                transition: "opacity 0.35s ease, transform 0.35s ease",
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {movie.overview || "No overview available."}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
