import { alpha, createTheme } from "@mui/material/styles";

/**
 * Design tokens — "Late Show" theme.
 * A deep plum-night base (like a dimmed theatre) with a saffron accent
 * (projector light) and rose for love/favorites.
 * Reuse these everywhere so every component stays consistent.
 */
export const tokens = {
  night: "#13111F", // page background
  plum: "#1C1930", // cards / surfaces
  plumRaised: "#26223F", // hover / raised surfaces
  line: "rgba(242, 238, 249, 0.08)", // borders & dividers
  saffron: "#F5B84B", // primary accent (ratings, focus, key actions)
  rose: "#FF5C7A", // favorites
  text: "#F2EEF9",
  muted: "#A7A2BC",
  glass: "rgba(19, 17, 31, 0.62)", // translucent chips over posters

  // Anything drawn ON TOP of a poster sits on a dark scrim, so these
  // stay the same in light and dark mode. Never use theme text colors there.
  onPoster: "#F2EEF9",
  onPosterMuted: "rgba(242, 238, 249, 0.72)",
  onPosterBody: "rgba(242, 238, 249, 0.88)",
  onPosterLine: "rgba(255, 255, 255, 0.14)",
  radius: 14,
  fontDisplay: '"Fraunces", Georgia, "Times New Roman", serif',
  fontBody: '"Manrope", "Segoe UI", system-ui, -apple-system, sans-serif',
} as const;

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: tokens.saffron, contrastText: "#1A1204" },
    secondary: { main: tokens.rose },
    background: { default: tokens.night, paper: tokens.plum },
    text: { primary: tokens.text, secondary: tokens.muted },
    divider: tokens.line,
  },
  shape: { borderRadius: tokens.radius },
  typography: {
    fontFamily: tokens.fontBody,
    h1: {
      fontFamily: tokens.fontDisplay,
      fontWeight: 600,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontFamily: tokens.fontDisplay,
      fontWeight: 600,
      letterSpacing: "-0.02em",
    },
    h3: {
      fontFamily: tokens.fontDisplay,
      fontWeight: 600,
      letterSpacing: "-0.01em",
    },
    h4: {
      fontFamily: tokens.fontDisplay,
      fontWeight: 600,
      letterSpacing: "-0.01em",
    },
    h5: { fontFamily: tokens.fontDisplay, fontWeight: 600 },
    h6: { fontFamily: tokens.fontDisplay, fontWeight: 600, lineHeight: 1.2 },
    body2: { lineHeight: 1.55 },
    button: { textTransform: "none", fontWeight: 700 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: tokens.night,
          WebkitFontSmoothing: "antialiased",
        },
        "::selection": { backgroundColor: tokens.saffron, color: "#1A1204" },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: tokens.plum,
          border: `1px solid ${tokens.line}`,
          boxShadow: "none",
        },
      },
    },
    // Form fields: surface fill, quiet border, saffron focus
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          borderRadius: tokens.radius,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.divider,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha(theme.palette.text.primary, 0.3),
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.main,
            borderWidth: 1,
          },
        }),
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 999, paddingInline: 20 },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          "&:focus-visible": {
            outline: `2px solid ${tokens.saffron}`,
            outlineOffset: 2,
          },
        },
      },
    },
  },
});
