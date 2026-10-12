import { Box, Button, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import {
  FavoriteBorderRounded,
  ArrowForwardRounded,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { MovieCard } from "../components/MovieCard";
import { useFavorites } from "../context/FavoritesContext";

export function FavoritesPage() {
  const { favorites } = useFavorites();
  const navigate = useNavigate();
  const theme = useTheme();

  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1440,
        mx: "auto",
        px: { xs: 2, sm: 3, lg: 5 },
        py: { xs: 4, sm: 5, md: 7 },
        boxSizing: "border-box",
        minHeight: "70vh",
      }}
    >
      {/* Page heading */}
      <Box
        sx={{
          mb: { xs: 4, md: 5 },
          pb: { xs: 3, md: 4 },
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography
          sx={{
            mb: 1.5,
            color: "primary.main",
            fontSize: "0.7rem",
            fontWeight: 800,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          YOUR COLLECTION
        </Typography>

        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "2.35rem", sm: "3rem", md: "3.5rem" },
            fontWeight: 750,
            lineHeight: 1.1,
            letterSpacing: "-0.045em",
            mb: 1.5,
          }}
        >
          My Favorites
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          <Typography
            sx={{
              color: "text.secondary",
              fontSize: { xs: "0.9rem", md: "0.95rem" },
              lineHeight: 1.7,
              maxWidth: 540,
            }}
          >
            The movies worth keeping, all in one place.
          </Typography>

          {favorites.length > 0 && (
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
                px: 1.25,
                py: 0.5,
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                color: "text.secondary",
                flexShrink: 0,
              }}
            >
              <FavoriteBorderRounded
                sx={{ fontSize: 15, color: "primary.main" }}
              />
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {favorites.length} {favorites.length === 1 ? "movie" : "movies"}
              </Typography>
            </Box>
          )}
        </Box>
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
            px: { xs: 2.5, sm: 4 },
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
            bgcolor: "background.paper",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              background: `linear-gradient(90deg, transparent, ${theme.palette.primary.main}, transparent)`,
              opacity: 0.8,
            },
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              display: "grid",
              placeItems: "center",
              borderRadius: 1.5,
              bgcolor: alpha(theme.palette.primary.main, isDark ? 0.12 : 0.07),
              border: 1,
              borderColor: alpha(theme.palette.primary.main, 0.22),
              color: "primary.main",
              mb: 3,
            }}
          >
            <FavoriteBorderRounded sx={{ fontSize: 27 }} />
          </Box>

          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: "1.4rem", md: "1.7rem" },
              fontWeight: 700,
              letterSpacing: "-0.035em",
              mb: 1.25,
            }}
          >
            Nothing saved yet
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
            When a movie catches your eye, save it to your favorites. Your
            personal collection will be waiting here.
          </Typography>

          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForwardRounded />}
            onClick={() => navigate("/")}
            sx={{
              px: 2.5,
              py: 1.25,
              borderRadius: 1.5,
              fontWeight: 750,
              textTransform: "none",
              boxShadow: "none",
              "&:hover": {
                boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
              },
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
