import { createTheme } from "@mui/material/styles";

// Central MUI theme for consistent tutor UI styling.
export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1e5a8a" },
    secondary: { main: "#c45c26" },
    background: { default: "#f5f7fb", paper: "#ffffff" },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"DM Sans", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});
