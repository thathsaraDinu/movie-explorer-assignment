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
        minHeight: "75vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 4,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: { xs: 3, sm: 4 },
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
          Welcome to Movie Explorer
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Sign in to discover movies and manage your favorites.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            fullWidth
            required
            autoComplete="username"
            sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            fullWidth
            required
            autoComplete="current-password"
            sx={{ mb: 3 }}
          />
          <Button type="submit" variant="contained" fullWidth size="large">
            Sign In
          </Button>
        </Box>

        <Alert severity="info" icon={false} sx={{ mt: 3 }}>
          Demo credentials — username: <strong>demo</strong>, password:{" "}
          <strong>movie123</strong>
        </Alert>
      </Paper>
    </Box>
  );
}
