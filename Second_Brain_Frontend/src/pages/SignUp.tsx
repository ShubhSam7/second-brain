import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useAuth } from "../hooks/useAuth";

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState("");
  const { signup, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // Validate password length
    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters");
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    try {
      await signup({ username, password });
      // Redirect to signin after successful signup
      navigate("/signin");
    } catch (err) {
      // Error is handled by useAuth hook
      console.error("Signup failed:", err);
    }
  };

  return (
    <div className="h-screen w-screen bg-background-primary flex justify-center items-center">
      <div className="bg-surface border border-border-muted rounded-xl min-w-96 max-w-md p-8 shadow-2xl animate-slide-up">
        <div className="font-bold text-3xl mb-2 text-text-primary tracking-wide">Sign Up</div>
        <p className="text-text-secondary mb-6">Create your Second Brain account</p>

        <form onSubmit={handleSubmit}>
          <Input
            placeholder="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            placeholder="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {(error || validationError) && (
            <div className="text-red-400 text-sm mt-2 mb-4 bg-red-900/20 border border-red-900/50 rounded-lg p-3">
              {error || validationError}
            </div>
          )}

          <div className="flex justify-center items-center mt-6">
            <Button
              variant="primary"
              size="md"
              text={loading ? "Signing up..." : "Sign Up"}
              full={true}
              onClick={handleSubmit}
              disabled={loading}
            />
          </div>
        </form>

        <div className="text-center mt-6 text-sm text-text-secondary">
          Already have an account?{" "}
          <a href="/signin" className="text-accent-primary hover:text-accent-primary/80 transition-colors duration-300 font-medium">
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
