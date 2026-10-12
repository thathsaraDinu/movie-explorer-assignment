import {
  AppBar,
  Box,
  Button,
  IconButton,
  Toolbar,
  Typography,
  Tooltip,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  DarkModeRounded,
  LightModeRounded,
  MovieFilterRounded,
} from "@mui/icons-material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useThemeMode } from "../context/ThemeContext";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const navButtonSx = (active: boolean) => ({
    px: 2,
    py: 1,
    minHeight: 40,
    borderRadius: "10px",
    color: active ? "primary.main" : "text.secondary",
    bgcolor: active ? alpha("#F5B84B", 0.09) : "transparent",
    transition: "all 180ms ease",
    "&:hover": {
      bgcolor: alpha("#F5B84B", 0.1),
      color: "primary.main",
    },
  });

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: (theme) => alpha(theme.palette.background.default, 0.86),
        color: "text.primary",
        borderBottom: 1,
        borderColor: "divider",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
      }}
    >
      <Toolbar
        sx={{
          width: "100%",
          maxWidth: 1440,
          mx: "auto",
          px: { xs: 2, sm: 3, md: 5 },
          py: 1.25,
          minHeight: { xs: 68, sm: 76 },
          gap: 2,
          justifyContent: "space-between",
        }}
      >
        {/* Brand */}
        <Box
          component={Link}
          to="/"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1.25,
            color: "inherit",
            textDecoration: "none",
            flexShrink: 0,
            "&:hover .brand-icon": {
              transform: "rotate(-5deg) scale(1.05)",
            },
          }}
        >
          <Box
            className="brand-icon"
            sx={{
              width: 42,
              height: 42,
              display: "grid",
              placeItems: "center",
              borderRadius: "13px",
              bgcolor: "primary.main",
              color: "#1A1204",
              transition: "transform 180ms ease",
            }}
          >
            <MovieFilterRounded sx={{ fontSize: 25 }} />
          </Box>

          <Box>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: { xs: "1.05rem", sm: "1.2rem" },
                letterSpacing: "-0.045em",
                lineHeight: 1.15,
              }}
            >
              Movie Explorer
            </Typography>

            <Typography
              sx={{
                mt: 0.35,
                color: "text.secondary",
                fontSize: "0.62rem",
                fontWeight: 700,
                letterSpacing: "0.17em",
                textTransform: "uppercase",
              }}
            >
              Your next favorite
            </Typography>
          </Box>
        </Box>

        {/* Navigation */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: { xs: 0.5, sm: 1 },
            flexWrap: "wrap",
          }}
        >
          {isAuthenticated && (
            <>
              <Button
                component={Link}
                to="/"
                sx={navButtonSx(isActive("/"))}
              >
                Home
              </Button>

              <Button
                component={Link}
                to="/favorites"
                sx={navButtonSx(isActive("/favorites"))}
              >
                Favorites
              </Button>
            </>
          )}

          <Tooltip
            title={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
          >
            <IconButton
              onClick={toggleTheme}
              aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
              sx={{
                width: 42,
                height: 42,
                ml: { xs: 0, sm: 0.5 },
                color: "text.secondary",
                border: 1,
                borderColor: "divider",
                borderRadius: "12px",
                "&:hover": {
                  color: "primary.main",
                  bgcolor: alpha("#F5B84B", 0.09),
                  borderColor: alpha("#F5B84B", 0.35),
                },
              }}
            >
              {mode === "dark" ? (
                <LightModeRounded fontSize="small" />
              ) : (
                <DarkModeRounded fontSize="small" />
              )}
            </IconButton>
          </Tooltip>

          {isAuthenticated ? (
            <Button
              onClick={handleLogout}
              variant="outlined"
              color="inherit"
              sx={{
                ml: { xs: 0, sm: 0.5 },
                minHeight: 42,
                px: { xs: 1.5, sm: 2.25 },
                borderRadius: "12px",
                borderColor: "divider",
                color: "text.primary",
                "&:hover": {
                  borderColor: "secondary.main",
                  bgcolor: alpha("#FF5C7A", 0.08),
                  color: "secondary.main",
                },
              }}
            >
              Logout
            </Button>
          ) : (
            <Button
              component={Link}
              to="/login"
              variant="contained"
              sx={{
                ml: { xs: 0, sm: 0.5 },
                minHeight: 42,
                px: { xs: 2, sm: 2.75 },
                borderRadius: "12px",
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "none",
                  filter: "brightness(1.08)",
                },
              }}
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}