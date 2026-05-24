const locales = {
  en: {
    title: "Asthma Attack Guidance",
    subtitle: "This guided program will help you manage an asthma attack step by step. Follow the instructions carefully.",
    start: "Start Emergency Guidance",
    starting: "Starting…",
    improving: "Improving",
    notImproving: "Not Improving",
    failedStart: "Failed to start attack guidance.",
    emergencyTitle: "Emergency Assistance Needed",
    callEmergency: "Call Emergency Services",
    findHospital: "Find Nearest Hospital",
    timerSuffix: "s"
  }
};

let active = "en";

export function setLocale(locale) {
  if (locales[locale]) active = locale;
}

export function t(key) {
  return locales[active][key] || key;
}

export default { t, setLocale };
