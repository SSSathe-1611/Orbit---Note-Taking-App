import PropTypes from "prop-types";
import { lazy, Suspense, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import LoadingIndicator from "./LoadingIndicator";
import "../styles/Form.css";

const AmbientScene = lazy(() => import("./AmbientScene"));

function Form({ route, method }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    const isLogin = method === "login";
    const name = isLogin ? "Welcome back" : "Create your account";
    const wasRegistered = isLogin && location.state?.registered;

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await api.post(route, { username, password });
            if (isLogin) {
                localStorage.setItem(ACCESS_TOKEN, response.data.access);
                localStorage.setItem(REFRESH_TOKEN, response.data.refresh);
                navigate("/");
            } else {
                navigate("/login", { state: { registered: true }, replace: true });
            }
        } catch (requestError) {
            setError(
                requestError.response?.data?.detail
                || requestError.response?.data?.username?.[0]
                || requestError.response?.data?.password?.[0]
                || requestError.message
                || "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-layout">
            <section className="auth-visual" aria-label="Orbit notes">
                <Link className="brand auth-brand" to="/" aria-label="Orbit home">
                    <span className="brand-mark"><span /></span>
                    <span>orbit<span className="brand-period">.</span></span>
                </Link>
                <Suspense fallback={<div className="ambient-scene" aria-hidden="true" />}>
                    <AmbientScene />
                </Suspense>
                <div className="auth-visual-copy">
                    <div className="eyebrow"><span className="eyebrow-star">✳</span> A PLACE TO THINK CLEARLY</div>
                    <h1>Make room<br />for <span>what matters.</span></h1>
                    <p>Your best ideas deserve more than a passing thought.<br />Give them a place to land.</p>
                </div>
                <div className="auth-quote"><span>✦</span> A LITTLE SPACE FOR BIG THOUGHTS</div>
            </section>

            <section className="auth-content">
                <Link className="brand auth-mobile-brand" to="/" aria-label="Orbit home">
                    <span className="brand-mark"><span /></span>
                    <span>orbit<span className="brand-period">.</span></span>
                </Link>
                <div className="auth-card">
                    <div className="auth-kicker">{isLogin ? "YOUR SPACE IS WAITING" : "BEGIN YOUR JOURNEY"}</div>
                    <h2>{name}</h2>
                    <p className="auth-subtitle">
                        {isLogin
                            ? "Pick up right where your mind left off."
                            : "Create an account and give your ideas a home."}
                    </p>
                    {wasRegistered && <div className="auth-success" role="status">Account created. Sign in to continue.</div>}
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <label htmlFor="username">USERNAME</label>
                        <div className="auth-input-wrap">
                            <span className="auth-input-icon user" aria-hidden="true" />
                            <input
                                id="username"
                                type="text"
                                autoComplete="username"
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                                placeholder="Your username"
                                required
                            />
                        </div>
                        <label htmlFor="password">PASSWORD</label>
                        <div className="auth-input-wrap">
                            <span className="auth-input-icon lock" aria-hidden="true" />
                            <input
                                id="password"
                                type="password"
                                autoComplete={isLogin ? "current-password" : "new-password"}
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="Your password"
                                required
                            />
                        </div>
                        {error && <div className="auth-error" role="alert">{error}</div>}
                        <button className="auth-submit" type="submit" disabled={loading}>
                            {loading ? <span className="auth-loading"><LoadingIndicator /></span> : <>{isLogin ? "Enter your space" : "Create account"} <span aria-hidden="true">↗</span></>}
                        </button>
                    </form>
                    <p className="auth-switch">
                        {isLogin ? "New to Orbit?" : "Already have an account?"}{" "}
                        <Link to={isLogin ? "/register" : "/login"}>
                            {isLogin ? "Create an account" : "Sign in"}
                        </Link>
                    </p>
                </div>
                <p className="auth-security"><span aria-hidden="true">⌑</span> YOUR THOUGHTS STAY YOURS &nbsp;·&nbsp; PRIVATE BY DESIGN</p>
            </section>
        </main>
    );
}

Form.propTypes = {
    route: PropTypes.string.isRequired,
    method: PropTypes.string.isRequired,
};

export default Form;
