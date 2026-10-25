import PropTypes from "prop-types";
import "../styles/Note.css";

function Note({ note, onDelete, onToggleFavorite, isFavorite, index }) {
    const formattedDate = new Date(note.created_at).toLocaleDateString("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
    const palette = ["lavender", "mint", "peach", "blue"];

    return (
        <article className={`note-card note-${palette[index % palette.length]}`}>
            <div className="note-card-top">
                <span className="note-mark" aria-hidden="true">✳</span>
                <div className="note-actions">
                    <button
                    className={`note-favorite${isFavorite ? " is-favorite" : ""}`}
                    type="button"
                    onClick={() => onToggleFavorite(note.id)}
                    aria-label={isFavorite ? `Remove ${note.title} from favorites` : `Add ${note.title} to favorites`}
                    aria-pressed={isFavorite}
                    title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                    ★
                    </button>
                    <button
                    className="note-delete"
                    type="button"
                    onClick={() => onDelete(note.id)}
                    aria-label={`Delete ${note.title}`}
                    title="Delete note"
                    >
                    ×
                    </button>
                </div>
            </div>
            <h3 className="note-title">{note.title}</h3>
            <p className="note-content">{note.content}</p>
            <div className="note-meta">
                <span className="note-meta-dot" />
                <time dateTime={note.created_at}>{formattedDate}</time>
                <span className="note-meta-label">NOTE</span>
            </div>
        </article>
    );
}

Note.propTypes = {
    note: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        title: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        created_at: PropTypes.string.isRequired,
    }).isRequired,
    onDelete: PropTypes.func.isRequired,
    onToggleFavorite: PropTypes.func.isRequired,
    isFavorite: PropTypes.bool.isRequired,
    index: PropTypes.number.isRequired,
};

export default Note;
