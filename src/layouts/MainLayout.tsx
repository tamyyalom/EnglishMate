import { Link as RouterLink, Outlet, useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import { clearSession } from "@/services/session";

const navItems = [
  { label: "Chat", to: "/chat" },
  { label: "Practice", to: "/practice" },
  { label: "Progress", to: "/progress" },
] as const;

/** Top navigation shell for authenticated areas. */
export function MainLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <AppBar position="sticky" color="inherit" elevation={0}>
        <Toolbar sx={{ borderBottom: 1, borderColor: "divider", gap: 2 }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/chat"
            sx={{
              flexGrow: { xs: 1, md: 0 },
              fontWeight: 700,
              textDecoration: "none",
              color: "primary.main",
            }}
          >
            EnglishMate
          </Typography>
          <Stack direction="row" spacing={1} sx={{ display: { xs: "none", sm: "flex" } }}>
            {navItems.map((item) => (
              <Button key={item.to} component={RouterLink} to={item.to} color="inherit">
                {item.label}
              </Button>
            ))}
          </Stack>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="outlined" color="inherit" onClick={handleLogout}>
            Log out
          </Button>
        </Toolbar>
        <Toolbar
          variant="dense"
          sx={{ display: { xs: "flex", sm: "none" }, gap: 1, py: 1 }}
        >
          {navItems.map((item) => (
            <Button
              key={item.to}
              component={RouterLink}
              to={item.to}
              size="small"
              color="inherit"
            >
              {item.label}
            </Button>
          ))}
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ py: 3, flex: 1 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
