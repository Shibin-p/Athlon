import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/admin");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // navigation handled by onAuthStateChanged
    } catch (err) {
      console.error(err);
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center animate-in fade-in duration-500">
      <form onSubmit={handleLogin} className="p-8 rounded-3xl bg-[#0a0a0f] border border-white/10 max-w-md w-full shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 to-orange-500"></div>
        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="p-5 bg-gradient-to-br from-red-500/20 to-orange-500/10 text-red-500 rounded-full mb-5">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-white" style={{ fontFamily: "'Orbitron', sans-serif" }}>Admin Portal</h2>
          <p className="text-gray-400 mt-2 text-center text-sm">Protected access for tournament officials.</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <div className="relative mb-4">
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-4 bg-black/60 border border-white/10 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-white text-center tracking-wide placeholder:tracking-normal"
            required
          />
        </div>
        <div className="relative mb-6">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-4 bg-black/60 border border-white/10 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-white text-center tracking-widest placeholder:tracking-normal"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Authenticating..." : "Authenticate"}
        </button>
      </form>
    </div>
  );
}
