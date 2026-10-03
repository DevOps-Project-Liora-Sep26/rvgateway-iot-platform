"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Orbitron } from "next/font/google";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export default function Home() {
  const router = useRouter();

  const [registerMode, setRegisterMode] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  // Login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Registration
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");

  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  // Password reset
  const [resetEmail, setResetEmail] = useState("");

  // Login API
  const handleLogin = async () => {
    setLoginError("");

    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      // Eingabefelder nach jedem Login-Versuch leeren
      setEmail("");
      setPassword("");

      if (response.ok) {
        router.push("/portal");
      } else if (response.status === 401) {
        setLoginError("invalid");
      } else {
        setLoginError("server");
      }
    } catch (error) {
      setEmail("");
      setPassword("");
      setLoginError("connection");
    }
  };

  // Registration API
  const handleRegister = async () => {
    setRegisterError("");
    setRegisterSuccess("");

    // Check if passwords match
    if (registerPassword !== repeatPassword) {
      setRegisterError("Passwords do not match");

      setRegisterPassword("");
      setRepeatPassword("");

      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: registerEmail,
          password: registerPassword,
        }),
      });

      // Clear all fields
      setRegisterEmail("");
      setRegisterPassword("");
      setRepeatPassword("");

      if (response.ok) {
        setRegisterSuccess("Sucessfull registered");
      } else if (response.status === 409) {
        setRegisterError("Email is already registered");
      } else {
        setRegisterError("Registration failed. Please try again");
      }

    } catch (error) {
      setRegisterEmail("");
      setRegisterPassword("");
      setRepeatPassword("");

      setRegisterError("Unable to connect to the server");
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">

        <div className="logo">
          <h1 className={orbitron.className}>RvGateway</h1>
          <span>IoT Monitoring Platform</span>
        </div>

        {resetMode ? (

          /* PASSWORD RESET */
          <form
            className="login-form"
            onSubmit={(e) => {
              e.preventDefault();

              // Reset API will be added later
              console.log("Reset password:", resetEmail);
            }}
          >
            <div className="input-group">
              <label htmlFor="reset-email">Email</label>

              <input
                id="reset-email"
                type="email"
                placeholder="Email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="login-button"
            >
              Reset Password
            </button>

            <button
              type="button"
              className="register-button"
              onClick={() => {
                setResetMode(false);
                setLoginError("");
              }}
            >
              Login
            </button>
          </form>

        ) : !registerMode ? (

          /* LOGIN */
          <form
            className="login-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            {loginError && (
              <div className="login-error">
                <span>Email or password incorrect!</span>
              </div>
            )}

            <div className="input-group">
              <label htmlFor="email">Email</label>

              <input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setLoginError("");
                }}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>

              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLoginError("");
                  }}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
            </div>
            {/*      
            <button
              type="button"
              className="forgot-password"
              onClick={() => {
                setResetMode(true);
                setLoginError("");
              }}
            >
              Forgot password?
            </button>
            */}
            <button
              type="submit"
              className="login-button"
            >
              Login
            </button>

            <button
              type="button"
              className="register-button"
              onClick={() => {
                setRegisterMode(true);
                setLoginError("");
              }}
            >
              Register
            </button>
          </form>

        ) : (

          /* REGISTRATION */
          <form
            className="login-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleRegister();
            }}
          >

            {registerError && (
              <div className="login-error">
                <span>{registerError}</span>
              </div>
            )}

            {registerSuccess && (
              <div className="register-success">
                <span>{registerSuccess}</span>
              </div>
            )}

            <div className="input-group">
              <label htmlFor="register-email">
                Email
              </label>

              <input
                id="register-email"
                type="email"
                placeholder="Email"
                value={registerEmail}
                onChange={(e) =>
                  setRegisterEmail(e.target.value)
                }
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="register-password">
                Password
              </label>

              <div className="password-wrapper">
                <input
                  id="register-password"
                  type={
                    showRegisterPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Password"
                  value={registerPassword}
                  onChange={(e) =>
                    setRegisterPassword(e.target.value)
                  }
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowRegisterPassword(
                      !showRegisterPassword
                    )
                  }
                  aria-label={
                    showRegisterPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  <EyeIcon
                    visible={showRegisterPassword}
                  />
                </button>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="repeat-password">
                Repeat password
              </label>

              <div className="password-wrapper">
                <input
                  id="repeat-password"
                  type={
                    showRepeatPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Repeat password"
                  value={repeatPassword}
                  onChange={(e) =>
                    setRepeatPassword(e.target.value)
                  }
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowRepeatPassword(
                      !showRepeatPassword
                    )
                  }
                  aria-label={
                    showRepeatPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  <EyeIcon
                    visible={showRepeatPassword}
                  />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-button"
            >
              Register
            </button>

            <button
              type="button"
              className="register-button"
              onClick={() => {
                setRegisterMode(false);
                setLoginError("");
              }}
            >
              Login
            </button>
          </form>
        )}

        <footer>
          © RvGateway
        </footer>

      </section>
    </main>
  );
}


/* Eye icon */

function EyeIcon({ visible }: { visible: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {visible ? (
        <>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M3 3l18 18" />
          <path d="M10.6 10.6a2 2 0 002.8 2.8" />
          <path d="M9.9 4.2A10.8 10.8 0 0112 4c6.5 0 10 8 10 8a18 18 0 01-2.1 3.2" />
          <path d="M6.6 6.6C3.7 8.5 2 12 2 12s3.5 8 10 8a9.8 9.8 0 005.4-1.6" />
        </>
      )}
    </svg>
  );
}