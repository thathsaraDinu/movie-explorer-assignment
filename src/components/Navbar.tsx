import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Tooltip,
  useTheme,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useThemeMode } from "../context/ThemeContext";

export function Navbar() {
  const location = useLocation();
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeMode();

  const linkStyles = (path: string) => ({
    color: theme.palette.text.primary,
    textTransform: "none" as const,
    borderBottom:
      location.pathname === path
        ? "2px solid #f43f5e"
        : "2px solid transparent",
    borderRadius: 0,
  });

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mr: "auto" }}>
          Movie Explorer
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button component={Link} to="/" sx={linkStyles("/")}>
            Home
          </Button>

          <Button
            component={Link}
            to="/favorites"
            sx={linkStyles("/favorites")}
          >
            Favorites
          </Button>

          <Button component={Link} to="/login" sx={linkStyles("/login")}>
            Login
          </Button>

          <Tooltip
            title={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
          >
            <IconButton
              onClick={toggleTheme}
              aria-label="Toggle color theme"
              color="inherit"
            >
              {mode === "dark" ? "☀️" : "🌙"}
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
