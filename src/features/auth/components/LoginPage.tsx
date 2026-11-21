import {
  Alert,
  Anchor,
  Button,
  Center,
  Collapse,
  Divider,
  Paper,
  PasswordInput,
  Stack,
  TextInput,
  Text,
  Title,
} from "@mantine/core";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { LogIn, TriangleAlert, UserPlus } from "lucide-react";
import { type FormEvent, useRef, useState } from "react";

import { STORAGE_MODE } from "../../../shared/lib/storageMode";
import { useAuth } from "../hooks/useAuth";
import { safeRedirect } from "../lib/guard";

type AuthMode = "signin" | "signup";

export function LoginPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/login" });
  const destination = safeRedirect(search.redirect);
  const {
    error,
    busy,
    clearError,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInGuest,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const lastError = useRef(error);
  if (error !== undefined) {
    lastError.current = error;
  }

  const switchMode = () => {
    clearError();
    setMode(mode === "signin" ? "signup" : "signin");
  };

  const finish = () => {
    void navigate({ to: destination, replace: true });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const ok =
      mode === "signin"
        ? await signInWithEmail(email.trim(), password)
        : await signUpWithEmail(name, email.trim(), password);
    if (ok) {
      finish();
    }
  };

  const handleGoogle = async () => {
    const ok = await signInWithGoogle();
    if (ok) {
      finish();
    }
  };

  return (
    <Center mih="calc(100vh - 100px)">
      <Paper withBorder shadow="sm" p="xl" radius="md" w="100%" maw={400}>
        <Stack gap="md">
          <div>
            <Title order={3}>
              {mode === "signin" ? "Sign in to Aven" : "Create your account"}
            </Title>
          </div>

          <Collapse expanded={error !== undefined}>
            <Alert
              color="red"
              variant="light"
              icon={<TriangleAlert size={16} />}
              withCloseButton
              onClose={clearError}
            >
              {lastError.current}
            </Alert>
          </Collapse>

          <form noValidate onSubmit={event => void handleSubmit(event)}>
            <Stack gap="sm">
              <Collapse expanded={mode === "signup"}>
                <TextInput
                  label="Display name"
                  placeholder="Your name"
                  value={name}
                  onChange={event => {
                    setName(event.currentTarget.value);
                  }}
                />
              </Collapse>
              <TextInput
                label="Email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={event => {
                  setEmail(event.currentTarget.value);
                }}
              />
              <PasswordInput
                label="Password"
                placeholder="Your password"
                required
                value={password}
                onChange={event => {
                  setPassword(event.currentTarget.value);
                }}
              />
              <Button
                type="submit"
                fullWidth
                loading={busy}
                leftSection={
                  mode === "signin" ? (
                    <LogIn size={16} />
                  ) : (
                    <UserPlus size={16} />
                  )
                }
              >
                {mode === "signin" ? "Sign in" : "Create account"}
              </Button>
            </Stack>
          </form>

          {STORAGE_MODE === "firebase" && (
            <>
              <Divider label="or" labelPosition="center" />
              <Button
                variant="default"
                fullWidth
                loading={busy}
                onClick={() => void handleGoogle()}
              >
                Continue with Google
              </Button>
            </>
          )}

          <Stack gap={6} align="center">
            <Text size="sm" c="dimmed">
              {mode === "signin"
                ? "New to Aven? "
                : "Already have an account? "}
              <Anchor
                component="button"
                type="button"
                size="sm"
                onClick={switchMode}
              >
                {mode === "signin" ? "Create an account" : "Sign in"}
              </Anchor>
            </Text>
            {STORAGE_MODE === "local" && (
              <Anchor
                component="button"
                type="button"
                size="sm"
                c="dimmed"
                onClick={() => {
                  signInGuest();
                  finish();
                }}
              >
                Try without an account
              </Anchor>
            )}
          </Stack>
        </Stack>
      </Paper>
    </Center>
  );
}
