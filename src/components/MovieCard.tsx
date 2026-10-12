import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Card, CardMedia, IconButton, Typography } from "@mui/material";
import type { Movie } from "../types/movie";
import { useFavorites } from "../context/FavoritesContext";

type MovieCardProps = {
  movie: Movie;
};

export function MovieCard({ movie }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();
  const navigate = useNavigate();

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  const releaseYear = movie.release_date
    ? movie.release_date.slice(0, 4)
    : "Release date unknown";

  const favorite = isFavorite(movie.id);

  return (
    <Card
      sx={{
        position: "relative",
        height: 380,
        bgcolor: "background.paper",
        color: "text.primary",
        overflow: "hidden",
        transition: "transform 0.3s ease",
        "&:hover": {
          transform: "translateY(-5px)",
        },
        cursor: "pointer",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/movies/${movie.id}`)}
    >
      {/* Movie poster */}
      {posterUrl ? (
        <CardMedia
          component="img"
          image={posterUrl}
          alt={movie.title}
          sx={{
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#333",
            p: 2,
          }}
        >
          <Typography>No poster available</Typography>
        </Box>
      )}

      {/* Rating badge */}
      <Box
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 2,
          bgcolor: "rgba(0, 0, 0, 0.75)",
          px: 1.5,
          py: 0.5,
          borderRadius: 1,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: "bold", color: "white" }}>
          ⭐{" "}
          {movie.vote_count > 0 ? movie.vote_average.toFixed(1) : "Not rated"}
        </Typography>
      </Box>

      {/* Favorite button */}
      <IconButton
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        onClick={(event) => {
          event.stopPropagation();
          toggleFavorite(movie);
        }}
        sx={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 3,
          width: 40,
          height: 40,
          minWidth: 40,
          p: 0,
          borderRadius: "50%",
          bgcolor: "rgba(0, 0, 0, 0.75)",
          color: favorite ? "#f43f5e" : "white",
          "&:hover": {
            bgcolor: "rgba(0, 0, 0, 0.9)",
          },
        }}
      >
        {favorite ? "♥" : "♡"}
      </IconButton>

      {/* Bottom gradient and movie information */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          pt: 8,
          background: "linear-gradient(to top, rgba(0,0,0,0.95), transparent)",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "white" }}>
          {movie.title}
        </Typography>

        <Typography variant="body2" sx={{ color: "white" }}>
          {releaseYear}
        </Typography>
      </Box>

      {/* Overview hover overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          p: 2,
          display: "flex",
          alignItems: "center",
          bgcolor: "rgba(0, 0, 0, 0.9)",
          opacity: isHovered ? 0.8 : 0,
          transition: "opacity 0.3s ease",
          pointerEvents: "none",
        }}
      >
        <Typography variant="body2" sx={{ color: "white" }}>
          {movie.overview || "No overview available."}
        </Typography>
      </Box>
    </Card>
  );
}
