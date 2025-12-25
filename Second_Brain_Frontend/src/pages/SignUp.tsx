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
    <div className="h-screen w-screen bg-gray-200 flex justify-center items-center">
      <div className="bg-white rounded border min-w-96 p-6">
        <div className="font-bold text-2xl mb-4">Sign Up</div>

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
            <div className="text-red-500 text-sm mt-2 mb-2">
              {error || validationError}
            </div>
          )}

          <div className="flex justify-center items-center mt-4">
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

        <div className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/signin" className="text-purple-600 hover:underline">
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
