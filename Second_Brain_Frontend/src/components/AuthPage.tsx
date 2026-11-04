import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Layers3,
  LoaderCircle,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Brand from "./Brand";

export default function AuthPage({ mode }: { mode: "signin" | "signup" }) {
  const creating = mode === "signup";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [visible, setVisible] = useState(false);
  const [validation, setValidation] = useState("");
  const { signin, signup, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidation("");
    if (creating && password !== confirmation) {
      setValidation("Your passwords don’t match. Please try again.");
      return;
    }
    try {
      if (creating) {
        await signup({ username: username.trim(), password });
        navigate("/signin", { state: { registered: true } });
      } else {
        await signin({ username: username.trim(), password });
        navigate("/dashboard");
      }
    } catch {
      /* The auth hook displays the request error. */
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-story">
        <Brand />
        <div className="auth-story-copy">
          <span className="eyebrow">A LITTLE SPACE FOR YOUR BIG IDEAS</span>
          <h1>
            Make room
            <br />
            for <em>possibility.</em>
          </h1>
          <p>
            Somewhere for the things that inspire you.
            <br />
            And the ideas they’ll become.
          </p>
          <div className="auth-illustration" aria-hidden="true">
            <div className="auth-idea idea-one">
              <span>01 / A LITTLE CURIOSITY</span>
              <p>
                What if the next
                <br />
                big idea is already
                <br />
                <em>in your collection?</em>
              </p>
            </div>
            <div className="auth-idea idea-two">
              <Layers3 size={31} strokeWidth={1.2} />
              <span>your second brain.</span>
            </div>
            <span className="auth-spark">✳</span>
          </div>
        </div>
        <span className="auth-story-footer">
          Less scattered. More inspired.
        </span>
      </div>
      <main className="auth-form-side">
        <Link to="/" className="back-link">
          <ArrowLeft size={15} /> Back to home
        </Link>
        <div className="auth-form-wrap">
          <span className="eyebrow">
            {creating
              ? "YOUR NEXT CHAPTER STARTS HERE"
              : "YOUR IDEAS MISSED YOU"}
          </span>
          <h2>{creating ? "A fresh space for you." : "Welcome back."}</h2>
          <p>
            {creating
              ? "Start collecting the things that make you, you."
              : "Pick up where your curiosity left off."}
          </p>
          <form onSubmit={submit}>
            {!creating && location.state?.registered && (
              <div className="form-success" role="status">
                Your space is ready. Log in to start collecting.
              </div>
            )}
            <label htmlFor="username">Username</label>
            <input
              autoFocus
              id="username"
              name="username"
              placeholder="Your username"
              autoComplete="username"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              disabled={loading}
            />
            <label htmlFor="password">
              Password {creating && <span>At least 6 characters</span>}
            </label>
            <div className="password-field">
              <input
                id="password"
                name="password"
                type={visible ? "text" : "password"}
                placeholder={
                  creating ? "Create a password" : "Enter your password"
                }
                autoComplete={creating ? "new-password" : "current-password"}
                minLength={creating ? 6 : undefined}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                aria-label={visible ? "Hide password" : "Show password"}
                onClick={() => setVisible(!visible)}
              >
                {visible ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {creating && (
              <>
                <label htmlFor="confirm-password">Confirm password</label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={visible ? "text" : "password"}
                  placeholder="One more time"
                  autoComplete="new-password"
                  required
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  disabled={loading}
                />
              </>
            )}
            {(validation || error) && (
              <div className="form-error" role="alert">
                {validation || error}
              </div>
            )}
            <button
              className="action-primary auth-submit"
              disabled={loading}
              type="submit"
            >
              {loading ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" />{" "}
                  {creating ? "Creating your space…" : "Signing you in…"}
                </>
              ) : (
                <>
                  {creating ? "Create your second brain" : "Step inside"}
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
          <p className="auth-switch">
            {creating
              ? "Already have a little space here?"
              : "New around here?"}{" "}
            <Link to={creating ? "/signin" : "/signup"}>
              {creating ? "Log in" : "Create an account"}{" "}
              <ArrowRight size={12} />
            </Link>
          </p>
          {creating && (
            <span className="auth-reassurance">
              <Check size={13} /> Free to get started. Room to keep growing.
            </span>
          )}
        </div>
        <span className="auth-form-footer">
          A calmer home for a curious mind.
        </span>
      </main>
    </div>
  );
}
