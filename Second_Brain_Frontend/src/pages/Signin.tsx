import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useAuth } from "../hooks/useAuth";

export default function Signin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { signin, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await signin({ username, password });
      navigate("/dashboard");
    } catch (err) {
      // Error is handled by useAuth hook
      console.error("Signin failed:", err);
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-200 flex justify-center items-center">
      <div className="bg-white rounded border min-w-96 p-6">
        <div className="font-bold text-2xl mb-4">Sign In</div>

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

          {error && (
            <div className="text-red-500 text-sm mt-2 mb-2">{error}</div>
          )}

          <div className="flex justify-center items-center mt-4">
            <Button
              variant="primary"
              size="md"
              text={loading ? "Signing in..." : "Sign In"}
              full={true}
              onClick={handleSubmit}
              disabled={loading}
            />
          </div>
        </form>

        <div className="text-center mt-4 text-sm text-gray-600">
          Don't have an account?{" "}
          <a href="/signup" className="text-purple-600 hover:underline">
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}
