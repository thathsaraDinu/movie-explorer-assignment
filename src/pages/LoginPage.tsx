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
import { LocalMoviesRounded } from "@mui/icons-material";
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

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, sm: 3 },
        py: { xs: 5, sm: 7 },
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          width: 380,
          height: 380,
          borderRadius: "50%",
          background: alpha(tokens.saffron, 0.07),
          filter: "blur(100px)",
          top: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          pointerEvents: "none",
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: 440,
          p: { xs: 3, sm: 4.5 },
          borderRadius: 3,
          border: `1px solid ${tokens.line}`,
          background: alpha(tokens.plum, 0.88),
          backdropFilter: "blur(18px)",
          boxShadow: `0 24px 80px ${alpha("#000000", 0.24)}`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 3.5,
          }}
        >
          <Box
            sx={{
              width: 58,
              height: 58,
              display: "grid",
              placeItems: "center",
              borderRadius: 2.5,
              color: "primary.main",
              background: alpha(tokens.saffron, 0.1),
              border: `1px solid ${alpha(tokens.saffron, 0.2)}`,
              mb: 2.5,
            }}
          >
            <LocalMoviesRounded sx={{ fontSize: 30 }} />
          </Box>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              textAlign: "center",
              letterSpacing: "-0.035em",
              lineHeight: 1.2,
            }}
          >
            Welcome back
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 1.25, textAlign: "center", lineHeight: 1.7 }}
          >
            Sign in to discover movies and keep track of your favorites.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
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
              fontSize: "0.875rem",
              fontWeight: 700,
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
            sx={{ mb: 2.5 }}
          />

          <Typography
            component="label"
            htmlFor="password"
            sx={{
              display: "block",
              mb: 1,
              fontSize: "0.875rem",
              fontWeight: 700,
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
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            sx={{
              py: 1.5,
              fontWeight: 800,
              boxShadow: "none",
              "&:hover": {
                boxShadow: `0 8px 24px ${alpha(tokens.saffron, 0.18)}`,
              },
            }}
          >
            Sign In
          </Button>
        </Box>

        <Box
          sx={{
            mt: 3,
            pt: 2.5,
            borderTop: `1px solid ${tokens.line}`,
          }}
        >
          <Typography
            sx={{
              mb: 1.25,
              color: "text.secondary",
              fontSize: "0.7rem",
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Demo account
          </Typography>

          <Alert
            severity="info"
            icon={false}
            sx={{
              borderRadius: 2,
              background: alpha(tokens.saffron, 0.06),
              border: `1px solid ${alpha(tokens.saffron, 0.14)}`,
              color: "text.secondary",
              "& .MuiAlert-message": { width: "100%" },
            }}
          >
            <Typography variant="body2">
              Username:{" "}
              <Box component="strong" sx={{ color: "text.primary" }}>
                demo
              </Box>
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              Password:{" "}
              <Box component="strong" sx={{ color: "text.primary" }}>
                movie123
              </Box>
            </Typography>
          </Alert>
        </Box>
      </Paper>
    </Box>
  );
}
