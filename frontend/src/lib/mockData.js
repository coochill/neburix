export const cities = ["Manila", "Biñan", "Batangas City"];

export const symptomSeries = {
  wheezing: [2, 4, 1, 3, 5, 2, 1],
  coughing: [3, 5, 2, 4, 6, 3, 2],
  shortness: [1, 3, 1, 2, 4, 1, 0],
};

export const weeklyLogs = [
  { day: "Mon", coughing: 4, wheezing: 2, shortness: 2, triggers: ["dust", "cold"], severity: 4 },
  { day: "Tue", coughing: 6, wheezing: 4, shortness: 3, triggers: ["dust"], severity: 6 },
  { day: "Wed", coughing: 5, wheezing: 2, shortness: 1, triggers: ["dust", "smoke"], severity: 4 },
  { day: "Thu", coughing: 2, wheezing: 1, shortness: 1, triggers: ["cold"], severity: 2 },
  { day: "Fri", coughing: 6, wheezing: 5, shortness: 4, triggers: ["dust", "exercise"], severity: 7 },
  { day: "Sat", coughing: 4, wheezing: 2, shortness: 2, triggers: ["smoke"], severity: 4 },
  { day: "Sun", coughing: 3, wheezing: 1, shortness: 1, triggers: ["dust"], severity: 3 },
];

export const initialMeds = [
  { id: 1, name: "Albuterol", dose: "90mcg", time: "8:00 AM", type: "Rescue inhaler", taken: true },
  { id: 2, name: "Budesonide", dose: "180mcg", time: "8:00 PM", type: "Maintenance inhaler", taken: false },
];

export const quickSymptoms = [
  { id: "wheezing",  label: "Wheezing", icon: "ti-lungs" },
  { id: "coughing",  label: "Coughing", icon: "ti-virus" },
  { id: "shortness", label: "Breath",   icon: "ti-wind" },
  { id: "tightness", label: "Tightness",icon: "ti-heart-rate-monitor" },
];

export const moods = [
  { value: 5, icon: "ti-mood-happy",     label: "Great" },
  { value: 4, icon: "ti-mood-smile",     label: "Good" },
  { value: 3, icon: "ti-mood-empty",      label: "Okay" },
  { value: 2, icon: "ti-mood-sad",       label: "Poor" },
  { value: 1, icon: "ti-mood-sad-dizzy", label: "Bad" },
];

