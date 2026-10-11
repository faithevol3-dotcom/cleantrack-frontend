import { useEffect, useState } from "react";
import api from "../../services/api";
import { scheduleService } from "../../services/scheduleService";

const frequencyLabels = { weekly: "Weekly", biweekly: "Every 2 weeks", monthly: "Monthly" };

function todayIso() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function pick(response, key) {
  return Array.isArray(response.data) ? response.data : response.data[key] || [];
}

const emptyForm = { location_id: "", waste_category_id: "", frequency: "weekly", start_date: "", notes: "" };

const RecurringPickups = () => {
  const [schedules, setSchedules] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    try {
      const [s, l, c] = await Promise.all([
        scheduleService.getMine(),
        api.get("/locations/my-locations"),
        api.get("/categories")
      ]);
      setSchedules(s.data.schedules);
      setLocations(pick(l, "locations"));
      setCategories(pick(c, "categories"));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load recurring pickups.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      await scheduleService.create(form);
      setNotice("Recurring pickup schedule created.");
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create schedule.");
    }
  }

  async function handleStatus(id, status) {
    setError("");
    setNotice("");
    try {
      await scheduleService.setStatus(id, status);
      setNotice(status === "paused" ? "Schedule paused." : "Schedule resumed.");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update schedule.");
    }
  }

  async function handleDelete(id) {
    setError("");
    setNotice("");
    try {
      await scheduleService.remove(id);
      setNotice("Schedule deleted.");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete schedule.");
    }
  }

  function update(field, value) {
    setForm({ ...form, [field]: value });
  }

  if (loading) return <p>Loading recurring pickups...</p>;

  return (
    <>
      <h1 className="h3 mb-3">Recurring Pickups</h1>
      {notice && <div className="alert alert-success">{notice}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card mb-4">
        <div className="card-body">
          <h2 className="h5">New recurring pickup</h2>
          {locations.length === 0 ? (
            <p className="text-muted mb-0">Add a location first, then you can schedule recurring pickups for it.</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="row g-2">
                <div className="col-md-6">
                  <select className="form-select" value={form.location_id} onChange={(e) => update("location_id", e.target.value)} required>
                    <option value="">Select location</option>
                    {locations.map((l) => <option key={l.id} value={l.id}>{l.location_name}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <select className="form-select" value={form.waste_category_id} onChange={(e) => update("waste_category_id", e.target.value)} required>
                    <option value="">Select waste category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <select className="form-select" value={form.frequency} onChange={(e) => update("frequency", e.target.value)}>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Every 2 weeks</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <input className="form-control" type="date" min={todayIso()} value={form.start_date} onChange={(e) => update("start_date", e.target.value)} required />
                </div>
                <div className="col-md-4">
                  <input className="form-control" maxLength={200} placeholder="Notes (optional)" value={form.notes} onChange={(e) => update("notes", e.target.value)} />
                </div>
              </div>
              <button className="btn btn-success mt-3" type="submit">Create schedule</button>
            </form>
          )}
        </div>
      </div>

      <h2 className="h5">My schedules</h2>
      {schedules.length === 0 ? (
        <p className="text-muted">No recurring pickups yet.</p>
      ) : (
        <ul className="list-group">
          {schedules.map((s) => (
            <li key={s.id} className="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <strong>{s.location_name}</strong> - {s.category_name}
                <div className="text-muted small">
                  {frequencyLabels[s.frequency]} from {s.start_date}
                  {s.status === "active" ? " | Next pickup: " + s.next_pickup_date : " | Paused"}
                  {s.notes ? " | " + s.notes : ""}
                </div>
              </div>
              <div className="d-flex gap-2">
                {s.status === "active" ? (
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => handleStatus(s.id, "paused")}>Pause</button>
                ) : (
                  <button className="btn btn-sm btn-outline-success" onClick={() => handleStatus(s.id, "active")}>Resume</button>
                )}
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(s.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default RecurringPickups;
