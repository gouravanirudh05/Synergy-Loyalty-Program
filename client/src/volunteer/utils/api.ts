import axios from "axios";

const API_BASE = import.meta.env.VITE_BACKEND_URL+"/api";

axios.defaults.withCredentials = true;

export const getEvents = async () => {
  const res = await axios.get(`${API_BASE}/events`);
  console.log(res.data);
  return res.data.events;
};

export const authorizeVolunteer = async (eventId: string, secretCode: string, token: string) => {
  const res = await axios.post(`${API_BASE}/volunteer/authorize`, {
    event_id: eventId,
    secret_code: secretCode
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const scanTeamQR = async (teamId: string, eventToken: string) => {
  const res = await axios.post(`${API_BASE}/volunteer/scan`, {
    team_id: teamId
  }, {
    headers: { Authorization: `Bearer ${eventToken}` }
  });
  return res.data;
};
