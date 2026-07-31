import api from "./axios";

// Submits a new report. `data` = { userId?, lat, lng, address?, category, description }
// `imageFiles` = array of File objects from an <input type="file" multiple>
export async function submitReport(data, imageFiles = []) {
  const form = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) form.append(key, value);
  });
  imageFiles.forEach((file) => form.append("images", file));

  const { data: res } = await api.post("/api/reports", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.report;
}

// filters: { category?, status?, lat?, lng?, radiusKm? }
export async function fetchReports(filters = {}) {
  const { data } = await api.get("/api/reports", { params: filters });
  return data.reports;
}

export async function fetchReportById(id) {
  const { data } = await api.get(`/api/reports/${id}`);
  return data.report;
}

export async function upvoteReport(id) {
  const { data } = await api.post(`/api/reports/${id}/upvote`);
  return data.report;
}

// Admin only
export async function updateReportStatus(id, status, adminNote, adminUserId) {
  const { data } = await api.patch(`/api/reports/${id}/status`, {
    status,
    adminNote,
    adminUserId,
  });
  return data.report;
}

export async function deleteReport(id) {
  const { data } = await api.delete(`/api/reports/${id}`);
  return data;
}
