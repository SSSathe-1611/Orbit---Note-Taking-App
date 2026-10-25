import { Link } from "react-router-dom";

function NotFound() {
    return (
        <main className="not-found-page">
            <Link className="brand" to="/" aria-label="Orbit home">
                <span className="brand-mark"><span /></span>
                <span>orbit<span className="brand-period">.</span></span>
            </Link>
            <div className="not-found-content">
                <span className="auth-kicker">SIGNAL LOST · 404</span>
                <div className="not-found-number" aria-hidden="true">404</div>
                <h1>This page got lost in space.</h1>
                <p>The destination you’re looking for isn’t in this orbit.</p>
                <Link className="hero-cta" to="/">Back to your workspace <span aria-hidden="true">↗</span></Link>
            </div>
            <div className="auth-quote"><span>✦</span> THERE’S ALWAYS ANOTHER WAY HOME</div>
        </main>
    );
}

export default NotFound;
