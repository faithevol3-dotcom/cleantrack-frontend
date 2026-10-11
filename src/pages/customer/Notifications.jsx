import { useEffect, useState } from "react";
import { notificationService } from "../../services/notificationService";

const Notifications = () => {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    try {
      const response = await notificationService.getMine();
      setItems(response.data.notifications);
      setUnread(response.data.unread);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleRead(id) {
    setError("");
    setNotice("");
    try {
      await notificationService.markRead(id);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update notification.");
    }
  }

  async function handleReadAll() {
    setError("");
    setNotice("");
    try {
      await notificationService.markAllRead();
      setNotice("All notifications marked as read.");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update notifications.");
    }
  }

  if (loading) return <p>Loading notifications...</p>;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Notifications <span className="badge bg-success">{unread} unread</span></h1>
        {unread > 0 && <button className="btn btn-sm btn-outline-success" onClick={handleReadAll}>Mark all as read</button>}
      </div>
      {notice && <div className="alert alert-success">{notice}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {items.length === 0 ? (
        <p className="text-muted">No notifications yet. You will be notified when a pickup is assigned, on the way, collected or failed.</p>
      ) : (
        <ul className="list-group">
          {items.map((n) => (
            <li key={n.id} className={"list-group-item d-flex justify-content-between align-items-center" + (n.status === "unread" ? " list-group-item-success" : "")}>
              <div>
                <strong>{n.title}</strong>
                <div>{n.message}</div>
                <div className="text-muted small">{new Date(n.created_at).toLocaleString()}</div>
              </div>
              {n.status === "unread" && <button className="btn btn-sm btn-outline-secondary" onClick={() => handleRead(n.id)}>Mark as read</button>}
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default Notifications;
