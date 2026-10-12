import { Box, Button, Typography } from "@mui/material";
import {
  FavoriteBorderRounded,
  ArrowForwardRounded,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { MovieCard } from "../components/MovieCard";
import { useFavorites } from "../context/FavoritesContext";
import { tokens } from "../theme/theme";

export function FavoritesPage() {
  const { favorites } = useFavorites();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1440,
        mx: "auto",
        px: { xs: 2, sm: 3, lg: 5 },
        py: { xs: 4, sm: 5, md: 6 },
        boxSizing: "border-box",
        minHeight: "70vh",
      }}
    >
      {/* Page heading */}
      <Box sx={{ mb: { xs: 4, md: 5 } }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "2.4rem", sm: "3rem", md: "3.5rem" },
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.04em",
            mb: 1.5,
          }}
        >
          My Favorites
        </Typography>

        <Typography
          sx={{
            color: "text.secondary",
            fontSize: { xs: "0.95rem", md: "1rem" },
            lineHeight: 1.7,
            maxWidth: 540,
          }}
        >
          The movies worth keeping, all in one place.
        </Typography>

        {favorites.length > 0 && (
          <Typography
            sx={{
              mt: 2.5,
              color: "text.secondary",
              fontSize: "0.8rem",
              fontWeight: 700,
            }}
          >
            {favorites.length}{" "}
            {favorites.length === 1 ? "movie saved" : "movies saved"}
          </Typography>
        )}
      </Box>
      {favorites.length === 0 ? (
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            py: { xs: 6, md: 9 },
            px: 3,
            borderRadius: 3,
            border: `1px solid ${tokens.line}`,
            bgcolor: alpha(tokens.plum, 0.55),
            "&::before": {
              content: '""',
              position: "absolute",
              width: 240,
              height: 240,
              borderRadius: "50%",
              bgcolor: alpha(tokens.saffron, 0.06),
              filter: "blur(65px)",
              top: -130,
              left: "50%",
              transform: "translateX(-50%)",
              pointerEvents: "none",
            },
          }}
        >
          <Box
            sx={{
              width: 68,
              height: 68,
              display: "grid",
              placeItems: "center",
              borderRadius: 2.5,
              bgcolor: alpha(tokens.saffron, 0.09),
              border: `1px solid ${alpha(tokens.saffron, 0.18)}`,
              color: "primary.main",
              mb: 3,
            }}
          >
            <FavoriteBorderRounded sx={{ fontSize: 32 }} />
          </Box>

          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: "1.5rem", md: "1.8rem" },
              fontWeight: 700,
              mb: 1.25,
            }}
          >
            Your collection starts here
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              maxWidth: 400,
              lineHeight: 1.8,
              mb: 3,
              fontSize: "0.9rem",
            }}
          >
            Found a movie you love? Tap its heart to save it here and build your
            own watch-worthy collection.
          </Typography>

          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForwardRounded />}
            onClick={() => navigate("/")}
            sx={{
              px: 3,
              py: 1.25,
              fontWeight: 800,
              boxShadow: "none",
            }}
          >
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
            gap: { xs: 1.5, sm: 2.5 },
            alignItems: "start",
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
