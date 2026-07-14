import api from "./axios";

export const fakeCallApi = {
  generate: (callerType) =>
    api.post("/api/fakecall/generate", { callerType }),
};
