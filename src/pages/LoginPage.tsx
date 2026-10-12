
import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { LocalMoviesRounded, ArrowForwardRounded } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../theme/theme";
import { useAuth } from "../context/AuthContext";

type LoginLocationState = {
  from?: { pathname?: string };
};

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const state = location.state as LoginLocationState | null;
  const destination = state?.from?.pathname ?? "/";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(destination, { replace: true });
    }
  }, [destination, isAuthenticated, navigate]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (login(username, password)) {
      navigate(destination, { replace: true });
    } else {
      setError("Incorrect username or password.");
    }
  }

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 1.5,
      backgroundColor: alpha(theme.palette.text.primary, isDark ? 0.025 : 0.025),
      transition: "background-color 180ms ease",
      "& fieldset": {
        borderColor: theme.palette.divider,
      },
      "&:hover fieldset": {
        borderColor: alpha(theme.palette.text.primary, 0.35),
      },
      "&.Mui-focused fieldset": {
        borderColor: "primary.main",
        borderWidth: 1,
      },
    },
    "& .MuiInputBase-input": {
      py: 1.7,
      fontSize: "0.9rem",
    },
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, sm: 4 },
        py: { xs: 5, md: 8 },
        backgroundColor: "background.default",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 1000,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "0.9fr 1.1fr" },
          overflow: "hidden",
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          backgroundColor: "background.paper",
        }}
      >
        {/* Brand panel */}
        <Box
          sx={{
            position: "relative",
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: 590,
            p: 5,
            overflow: "hidden",
            color: "#ffffff",
            background: isDark
              ? "linear-gradient(145deg, #211b1a 0%, #11100f 58%, #0c0a09 100%)"
              : "linear-gradient(145deg, #39302d 0%, #211b1a 58%, #141211 100%)",
            "&::after": {
              content: '""',
              position: "absolute",
              width: 340,
              height: 340,
              right: -180,
              bottom: -150,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.09)",
              boxShadow:
                "0 0 0 45px rgba(255,255,255,0.025), 0 0 0 90px rgba(255,255,255,0.02)",
              pointerEvents: "none",
            },
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  display: "grid",
                  placeItems: "center",
                  border: "1px solid rgba(255,255,255,0.18)",
                  borderRadius: 1.5,
                  color: "primary.main",
                }}
              >
                <LocalMoviesRounded sx={{ fontSize: 23 }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: "0.9rem",
                    letterSpacing: "0.13em",
                  }}
                >
                  MOVIE EXPLORER
                </Typography>
                <Typography
                  sx={{
                    mt: 0.25,
                    fontSize: "0.65rem",
                    letterSpacing: "0.18em",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  YOUR NEXT GREAT STORY
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ position: "relative", zIndex: 1, maxWidth: 360 }}>
            <Box
              sx={{
                width: 36,
                height: 2,
                mb: 3,
                backgroundColor: "primary.main",
              }}
            />
            <Typography
              sx={{
                fontSize: { md: "2.6rem", lg: "3.15rem" },
                lineHeight: 1.13,
                letterSpacing: "-0.055em",
                fontWeight: 700,
              }}
            >
              Stories worth
              <Box component="span" sx={{ display: "block", color: "primary.main" }}>
                staying up for.
              </Box>
            </Typography>
            <Typography
              sx={{
                mt: 2.5,
                maxWidth: 310,
                color: "rgba(255,255,255,0.62)",
                fontSize: "0.95rem",
                lineHeight: 1.9,
              }}
            >
              Discover your next favourite film, explore new genres, and keep
              track of the movies you love.
            </Typography>
          </Box>

          <Typography
            sx={{
              position: "relative",
              zIndex: 1,
              color: "rgba(255,255,255,0.4)",
              fontSize: "0.72rem",
              letterSpacing: "0.04em",
            }}
          >
            FIND YOUR NEXT FAVOURITE.
          </Typography>
        </Box>

        {/* Login form */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: 3, sm: 5, md: 6 },
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 360 }}>
            <Box sx={{ mb: 4 }}>
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
                Your account
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 750,
                  letterSpacing: "-0.045em",
                  fontSize: { xs: "1.8rem", sm: "2.1rem" },
                }}
              >
                Welcome back.
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ mt: 1.25, fontSize: "0.9rem", lineHeight: 1.7 }}
              >
                Sign in to continue exploring.
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 1.5 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Typography
                component="label"
                htmlFor="username"
                sx={{
                  display: "block",
                  mb: 1,
                  fontSize: "0.8rem",
                  fontWeight: 650,
                }}
              >
                Username
              </Typography>
              <TextField
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                fullWidth
                required
                autoComplete="username"
                sx={{ ...fieldSx, mb: 2.5 }}
              />

              <Typography
                component="label"
                htmlFor="password"
                sx={{
                  display: "block",
                  mb: 1,
                  fontSize: "0.8rem",
                  fontWeight: 650,
                }}
              >
                Password
              </Typography>
              <TextField
                id="password"
                placeholder="Enter your password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                fullWidth
                required
                autoComplete="current-password"
                sx={{ ...fieldSx, mb: 3 }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                endIcon={<ArrowForwardRounded />}
                sx={{
                  py: 1.55,
                  borderRadius: 1.5,
                  fontWeight: 750,
                  textTransform: "none",
                  fontSize: "0.9rem",
                  boxShadow: "none",
                  "&:hover": {
                    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                }}
              >
                Sign in
              </Button>
            </Box>

            <Box
              sx={{
                mt: 4,
                pt: 3,
                borderTop: 1,
                borderColor: "divider",
              }}
            >
              <Typography
                sx={{
                  mb: 1.5,
                  color: "text.secondary",
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                Demo access
              </Typography>

              <Box
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1.5,
                  backgroundColor: alpha(theme.palette.text.primary, 0.025),
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 2,
                    alignItems: "center",
                  }}
                >
                  <Typography color="text.secondary" sx={{ fontSize: "0.82rem" }}>
                    Username
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      fontFamily: "monospace",
                    }}
                  >
                    demo
                  </Typography>
                </Box>
                <Box
                  sx={{
                    mt: 1.25,
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 2,
                    alignItems: "center",
                  }}
                >
                  <Typography color="text.secondary" sx={{ fontSize: "0.82rem" }}>
                    Password
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      fontFamily: "monospace",
                    }}
                  >
                    movie123
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
