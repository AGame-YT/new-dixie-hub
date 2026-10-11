"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Icon } from "@/components/Icon";

export function AdminLoginForm({
  localEnabled,
  googleEnabled
}: {
  localEnabled: boolean;
  googleEnabled: boolean;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const result = await signIn("admin-credentials", {
      username,
      password,
      callbackUrl: "/admin",
      redirect: false
    });

    if (!result?.ok) {
      setSubmitting(false);
      setError("The username or password was not recognised.");
      return;
    }

    window.location.assign(result.url ?? "/admin");
  }

  return (
    <div className="admin-login-options">
      {localEnabled ? (
        <form className="admin-login-form" onSubmit={submit}>
          <label>
            <span>Administrator username</span>
            <input
              required
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>
          <label>
            <span>Password</span>
            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error && <p className="admin-login-error">{error}</p>}
          <button
            className="button primary"
            type="submit"
            disabled={submitting}
          >
            <Icon name="settings" size={17} />
            {submitting ? "Signing in…" : "Sign in to admin"}
          </button>
        </form>
      ) : (
        <div className="admin-login-warning">
          <Icon name="alert" />
          <p>
            Local admin credentials have not been configured on the server.
          </p>
        </div>
      )}

      {googleEnabled && (
        <>
          <div className="admin-login-divider"><span>or</span></div>
          <button
            className="button secondary admin-google-button"
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/admin" })}
          >
            <span className="google-g">G</span>
            Sign in with approved Google account
          </button>
        </>
      )}
    </div>
  );
}
