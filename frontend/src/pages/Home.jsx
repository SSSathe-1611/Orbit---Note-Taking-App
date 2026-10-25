import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import api from "../api";
import Note from "../components/Note";
import "../styles/Home.css";

const AmbientScene = lazy(() => import("../components/AmbientScene"));

function Home() {
    const location = useLocation();
    const currentPage = location.pathname === "/notes" ? "notes" : location.pathname === "/favorites" ? "favorites" : "overview";
    const [notes, setNotes] = useState([]);
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const searchInputRef = useRef(null);
    const [favoriteIds, setFavoriteIds] = useState(() => {
        try {
            const storedFavorites = JSON.parse(localStorage.getItem("orbit-favorite-notes") || "[]");
            return Array.isArray(storedFavorites) ? storedFavorites : [];
        } catch (storageError) {
            console.error("Unable to read saved favorite notes.", storageError);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem("orbit-favorite-notes", JSON.stringify(favoriteIds));
        } catch (storageError) {
            console.error("Unable to save favorite notes.", storageError);
            setError("Your favorite could not be saved in this browser.");
        }
    }, [favoriteIds]);

    const getNotes = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await api.get("/api/notes/");
            setNotes(response.data);
        } catch (requestError) {
            setError(requestError.response?.data?.detail || requestError.message || "Your notes could not be loaded.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        getNotes();
    }, [getNotes]);

    useEffect(() => {
        const handleSearchShortcut = (event) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener("keydown", handleSearchShortcut);
        return () => window.removeEventListener("keydown", handleSearchShortcut);
    }, []);

    const filteredNotes = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        return [...notes]
            .sort((left, right) => new Date(right.created_at) - new Date(left.created_at))
            .filter((note) => currentPage !== "favorites" || favoriteIds.includes(note.id))
            .filter((note) => !normalizedQuery || `${note.title} ${note.content}`.toLowerCase().includes(normalizedQuery));
    }, [notes, query, currentPage, favoriteIds]);

    const toggleFavorite = (id) => {
        setFavoriteIds((currentIds) => (
            currentIds.includes(id)
                ? currentIds.filter((favoriteId) => favoriteId !== id)
                : [...currentIds, id]
        ));
    };

    const createNote = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setNotice("");
        try {
            const response = await api.post("/api/notes/", { content, title });
            if (response.status !== 201) throw new Error("The note could not be saved. Please try again.");
            setNotes((currentNotes) => [response.data, ...currentNotes]);
            setTitle("");
            setContent("");
            setNotice("Your note is in orbit.");
        } catch (requestError) {
            setError(requestError.response?.data?.detail || requestError.message || "Your note could not be saved.");
        } finally {
            setSaving(false);
        }
    };

    const deleteNote = async (id) => {
        setError("");
        setNotice("");
        try {
            const response = await api.delete(`/api/notes/delete/${id}/`);
            if (response.status !== 204) throw new Error("The note could not be deleted. Please try again.");
            setNotes((currentNotes) => currentNotes.filter((note) => note.id !== id));
            setFavoriteIds((currentIds) => currentIds.filter((favoriteId) => favoriteId !== id));
            setNotice("Note removed.");
        } catch (requestError) {
            setError(requestError.response?.data?.detail || requestError.message || "The note could not be deleted.");
        }
    };

    const recentNotes = [...notes]
        .sort((left, right) => new Date(right.created_at) - new Date(left.created_at))
        .slice(0, 1);
    const dateLabel = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date());

    return (
        <div className="workspace">
            <aside className="sidebar">
                <Link className="brand" to="/" aria-label="Orbit home">
                    <span className="brand-mark"><span /></span>
                    <span>orbit<span className="brand-period">.</span></span>
                </Link>

                <div className="sidebar-caption">YOUR SPACE</div>
                <nav className="side-navigation" aria-label="Main navigation">
                    <NavLink end className={({ isActive }) => `side-link${isActive ? " is-active" : ""}`} to="/">
                        <span className="nav-icon nav-overview" aria-hidden="true" />
                        Overview
                        {currentPage === "overview" && <span className="nav-indicator" />}
                    </NavLink>
                    <NavLink className={({ isActive }) => `side-link${isActive ? " is-active" : ""}`} to="/notes">
                        <span className="nav-icon nav-notes" aria-hidden="true" />
                        All notes
                        <span className="side-count">{notes.length}</span>
                        {currentPage === "notes" && <span className="nav-indicator" />}
                    </NavLink>
                    <NavLink className={({ isActive }) => `side-link${isActive ? " is-active" : ""}`} to="/favorites">
                        <span className="nav-icon nav-favorites" aria-hidden="true">★</span>
                        Favorites
                        <span className="side-count">{favoriteIds.length}</span>
                        {currentPage === "favorites" && <span className="nav-indicator" />}
                    </NavLink>
                    <Link className="side-link create-side-link" to="/#composer">
                        <span className="nav-icon nav-create" aria-hidden="true">＋</span>
                        New note
                    </Link>
                </nav>

                <div className="sidebar-bottom">
                    <div className="sidebar-user">
                        <div className="avatar">O</div>
                        <div>
                            <span className="user-name">Your workspace</span>
                            <span className="user-tier">PERSONAL SPACE</span>
                        </div>
                    </div>
                    <Link className="logout-link" to="/logout">
                        <span className="logout-icon" aria-hidden="true">↗</span>
                        Sign out
                    </Link>
                    <div className="sidebar-version">ORBIT STUDIO <span>·</span> 01.26</div>
                </div>
            </aside>

            <main className="workspace-main" id="overview">
                <header className="topbar">
                    <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-slash">/</span> {currentPage === "overview" ? "Overview" : currentPage === "notes" ? "All notes" : "Favorites"}</div>
                    <div className="topbar-right">
                        <span className="live-indicator"><i /> Personal space</span>
                        <div className="topbar-avatar">O</div>
                    </div>
                </header>

                <div className="dashboard-content">
                    {currentPage === "overview" && <section className="hero-panel">
                        <div className="hero-glow" />
                        <Suspense fallback={<div className="ambient-scene" aria-hidden="true" />}>
                            <AmbientScene />
                        </Suspense>
                        <div className="hero-copy">
                            <div className="eyebrow"><span className="eyebrow-star">✳</span> YOUR IDEAS, IN ORBIT</div>
                            <h1>A little space<br />for <span>big thoughts.</span></h1>
                            <p>Capture the thought before it drifts away.<br className="desktop-break" /> Your space is ready when you are.</p>
                            <a href="#composer" className="hero-cta">Write a note <span aria-hidden="true">↗</span></a>
                        </div>
                        <div className="hero-date"><span className="hero-date-dot" /> {dateLabel}</div>
                        <div className="hero-coordinate mono">N 37° 33′ 12″ &nbsp;·&nbsp; E 126° 58′ 41″</div>
                    </section>}

                    {currentPage === "overview" && <section className="overview-row" aria-label="Workspace overview">
                        <div className="overview-heading">
                            <div className="section-kicker">AT A GLANCE</div>
                            <h2>Your space, lately.</h2>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon notes-stat-icon" aria-hidden="true"><span /></div>
                            <div className="stat-copy"><span className="stat-label">TOTAL NOTES</span><strong>{notes.length.toString().padStart(2, "0")}</strong></div>
                            <span className="stat-sparkline" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></span>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon recent-stat-icon" aria-hidden="true">↗</div>
                            <div className="stat-copy"><span className="stat-label">MOST RECENT</span><strong className="recent-stat">{recentNotes.length ? new Date(recentNotes[0].created_at).toLocaleDateString("en", { month: "short", day: "numeric" }) : "—"}</strong></div>
                            <span className="stat-status"><i /> UPDATED</span>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon favorite-stat-icon" aria-hidden="true">★</div>
                            <div className="stat-copy"><span className="stat-label">FAVORITES</span><strong>{favoriteIds.length.toString().padStart(2, "0")}</strong></div>
                        </div>
                    </section>}

                    {error && <div className="workspace-alert is-error" role="alert">{error}</div>}
                    {notice && <div className="workspace-alert is-success" role="status">{notice}</div>}

                    <div className={`content-grid ${currentPage === "overview" ? "overview-grid" : "library-grid"}`}>
                        <section className="notes-panel" id="notes">
                            <div className="notes-header">
                                <div>
                                    <div className="section-kicker">{currentPage === "favorites" ? "SAVED FOR LATER" : currentPage === "overview" ? "THE COLLECTION" : "YOUR LIBRARY"}</div>
                                    <h2>{currentPage === "favorites" ? "Favorite notes" : currentPage === "overview" ? "Your notes" : "All notes"} <span>{(currentPage === "favorites" ? filteredNotes.length : notes.length).toString().padStart(2, "0")}</span></h2>
                                </div>
                                <label className="search-box">
                                    <span className="search-icon" aria-hidden="true" />
                                    <input
                                        type="search"
                                        aria-label="Search notes"
                                        placeholder="Search your notes"
                                        ref={searchInputRef}
                                        value={query}
                                        onChange={(event) => setQuery(event.target.value)}
                                    />
                                    <kbd>⌘ K</kbd>
                                </label>
                                {currentPage !== "overview" && <Link className="library-create-button" to="/#composer">New note <span aria-hidden="true">＋</span></Link>}
                            </div>
                            {currentPage !== "overview" && <div className="library-filters" role="group" aria-label="Note collection">
                                <NavLink to="/notes" className={({ isActive }) => `library-filter${isActive ? " is-active" : ""}`}>All notes <span>{notes.length}</span></NavLink>
                                <NavLink to="/favorites" className={({ isActive }) => `library-filter${isActive ? " is-active" : ""}`}>★ Favorites <span>{favoriteIds.length}</span></NavLink>
                                <span className="sort-indicator">Recently updated <span aria-hidden="true">⌄</span></span>
                            </div>}
                            {loading ? (
                                <div className="notes-state"><span className="state-spinner" />Finding your notes...</div>
                            ) : filteredNotes.length ? (
                                <div className="notes-grid">
                                    {(currentPage === "overview" ? filteredNotes.slice(0, 4) : filteredNotes).map((note, index) => (
                                        <Note note={note} onDelete={deleteNote} onToggleFavorite={toggleFavorite} isFavorite={favoriteIds.includes(note.id)} key={note.id} index={index} />
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-orbit"><span /></div>
                                    <h3>{query ? "Nothing in this orbit." : currentPage === "favorites" ? "No favorites yet." : "It’s quiet out here."}</h3>
                                    <p>{query ? "Try a different search term." : currentPage === "favorites" ? "Tap the star on a note to save it here." : "Your next good idea has a place to land."}</p>
                                    {!query && currentPage !== "favorites" && <a href="#composer">Create your first note <span aria-hidden="true">↗</span></a>}
                                </div>
                            )}
                            {currentPage === "overview" && filteredNotes.length > 4 && <Link className="view-all-notes" to="/notes">View all {notes.length} notes <span aria-hidden="true">↗</span></Link>}
                        </section>

                        <aside className="composer-panel" id="composer">
                            <div className="composer-heading">
                                <div className="section-kicker">QUICK CAPTURE</div>
                                <span className="composer-plus" aria-hidden="true">✳</span>
                                <h2>Catch a thought.</h2>
                                <p>A blank page is a beautiful place to start.</p>
                            </div>
                            <form className="note-form" onSubmit={createNote}>
                                <label htmlFor="note-title">GIVE IT A NAME</label>
                                <input
                                    id="note-title"
                                    name="title"
                                    type="text"
                                    placeholder="A thought, a plan, a spark..."
                                    value={title}
                                    onChange={(event) => setTitle(event.target.value)}
                                    maxLength={100}
                                    required
                                />
                                <label htmlFor="note-content">LET IT OUT</label>
                                <textarea
                                    id="note-content"
                                    name="content"
                                    placeholder="Start writing here..."
                                    value={content}
                                    onChange={(event) => setContent(event.target.value)}
                                    required
                                />
                                <div className="composer-footer">
                                    <span><i /> SAVED TO YOUR SPACE</span>
                                    <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save note"} <span aria-hidden="true">↗</span></button>
                                </div>
                            </form>
                            <div className="composer-tip"><span>✦</span> Ideas are like stars. You just have to look up.</div>
                        </aside>
                    </div>

                    <footer className="workspace-footer">
                        <span>MADE FOR THE SPACE BETWEEN THOUGHTS</span>
                        <span className="footer-status"><i /> YOUR SPACE IS PRIVATE</span>
                    </footer>
                </div>
            </main>
        </div>
    );
}

export default Home;
