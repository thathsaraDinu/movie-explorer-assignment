import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { FavoritesProvider } from "./context/FavoritesContext";
import { ThemeModeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "@emotion/react";
import { theme } from "./theme/theme";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <ThemeModeProvider>
        <AuthProvider>
          <BrowserRouter>
            <FavoritesProvider>
              <App />
            </FavoritesProvider>
          </BrowserRouter>
        </AuthProvider>
      </ThemeModeProvider>
    </ThemeProvider>
  </StrictMode>,
);
