import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { MovieCard } from "../components/MovieCard";
import { useFavorites } from "../context/FavoritesContext";

export function FavoritesPage() {
  const { favorites } = useFavorites();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        bgcolor: "background.default",
        color: "text.primary",
        minHeight: "100vh",
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
        My Favorites
      </Typography>

      <Typography variant="body1" sx={{ color: "text.secondary", mb: 3 }}>
        Your saved movies, all in one place.
      </Typography>

      {favorites.length === 0 ? (
        <Box sx={{ py: 5, textAlign: "center" }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            No favorites yet
          </Typography>

          <Typography sx={{ color: "text.secondary", mb: 3 }}>
            Browse movies and tap the heart icon to save your favorites.
          </Typography>

          <Button variant="contained" onClick={() => navigate("/")}>
            Explore movies
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, minmax(0, 1fr))",
              sm: "repeat(3, minmax(0, 1fr))",
              md: "repeat(4, minmax(0, 1fr))",
              lg: "repeat(5, minmax(0, 1fr))",
            },
            gap: 2,
          }}
        >
          {favorites.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </Box>
      )}
    </Box>
  );
}
