import { useEffect, useState } from "react";
import { summaryService } from "../../services/summaryService";

const statusLabels = {
  pending: "Pending",
  assigned: "Assigned",
  on_the_way: "On the way",
  collected: "Collected",
  failed: "Failed",
  cancelled: "Cancelled"
};

const PickupSummary = () => {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    summaryService.getMyPickups()
      .then((response) => setSummary(response.data.summary))
      .catch((err) => setError(err.response?.data?.message || "Unable to load your pickup summary."));
  }, []);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!summary) return <p>Loading your pickup summary...</p>;

  return (
    <>
      <h1 className="h3 mb-3">My Pickup Summary</h1>
      <div className="row g-3 mb-4">
        <div className="col-md-4"><div className="card"><div className="card-body"><div className="text-muted">Total requests</div><div className="h3 mb-0">{summary.total}</div></div></div></div>
        <div className="col-md-4"><div className="card"><div className="card-body"><div className="text-muted">Last collected</div><div className="h5 mb-0">{summary.lastCollected || "None yet"}</div></div></div></div>
        <div className="col-md-4"><div className="card"><div className="card-body"><div className="text-muted">Active recurring schedules</div><div className="h3 mb-0">{summary.activeSchedules}</div></div></div></div>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <h2 className="h5">Requests by status</h2>
          <ul className="list-group">
            {Object.keys(statusLabels).map((key) => (
              <li key={key} className="list-group-item d-flex justify-content-between">
                <span>{statusLabels[key]}</span><strong>{summary.byStatus[key]}</strong>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-md-6">
          <h2 className="h5">Requests by waste category</h2>
          {summary.byCategory.length === 0 ? (
            <p className="text-muted">No pickup requests yet.</p>
          ) : (
            <ul className="list-group">
              {summary.byCategory.map((item) => (
                <li key={item.name} className="list-group-item d-flex justify-content-between">
                  <span>{item.name}</span><strong>{item.count}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default PickupSummary;
