import {
  Alert,
  Button,
  Center,
  Divider,
  Paper,
  PasswordInput,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { LogIn, TriangleAlert, UserPlus } from "lucide-react";
import { type FormEvent, useState } from "react";

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
    signInLocal,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const finish = () => {
    void navigate({ to: destination, replace: true });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (STORAGE_MODE === "local") {
      signInLocal(mode === "signup" ? name : email.split("@")[0]);
      finish();
      return;
    }
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
            <Text size="sm" c="dimmed">
              {STORAGE_MODE === "local"
                ? "Running in local mode — data is stored in this browser."
                : "Sign in to sync spaces, boards, and members."}
            </Text>
          </div>

          <SegmentedControl
            fullWidth
            value={mode}
            onChange={value => {
              clearError();
              setMode(value === "signup" ? "signup" : "signin");
            }}
            data={[
              { label: "Sign in", value: "signin" },
              { label: "Sign up", value: "signup" },
            ]}
          />

          {error !== undefined && (
            <Alert
              color="red"
              variant="light"
              icon={<TriangleAlert size={16} />}
              withCloseButton
              onClose={clearError}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={event => void handleSubmit(event)}>
            <Stack gap="sm">
              {mode === "signup" && (
                <TextInput
                  label="Display name"
                  placeholder="Your name"
                  required
                  value={name}
                  onChange={event => {
                    setName(event.currentTarget.value);
                  }}
                />
              )}
              <TextInput
                label="Email"
                type="email"
                placeholder="you@example.com"
                required={STORAGE_MODE === "firebase"}
                value={email}
                onChange={event => {
                  setEmail(event.currentTarget.value);
                }}
              />
              <PasswordInput
                label="Password"
                placeholder="Your password"
                required={STORAGE_MODE === "firebase"}
                minLength={STORAGE_MODE === "firebase" ? 6 : undefined}
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

          {STORAGE_MODE === "firebase" ? (
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
          ) : (
            <Button
              variant="subtle"
              fullWidth
              onClick={() => {
                signInLocal();
                finish();
              }}
            >
              Continue as Local User
            </Button>
          )}
        </Stack>
      </Paper>
    </Center>
  );
}
