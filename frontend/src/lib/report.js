import jsPDF from "jspdf";

export function exportWeeklyReport({ patientName, weekLabel, summary }) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const left = 14;
  const right = pageWidth - 14;
  const contentWidth = right - left;

  let y = 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Neburix Weekly Doctor Report", left, y);

  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Patient: ${patientName}`, left, y);
  doc.text(`Week: ${weekLabel}`, right, y, { align: "right" });

  y += 6;
  drawDivider(doc, left, right, y);
  y += 7;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Symptom Charts (Last 7 Days)", left, y);
  y += 5;

  y = drawSparkPanel(doc, {
    x: left,
    y,
    width: contentWidth,
    title: "Wheezing",
    values: summary.symptomChart?.wheezing || [],
    labels: summary.symptomChart?.labels || [],
  });

  y = drawSparkPanel(doc, {
    x: left,
    y,
    width: contentWidth,
    title: "Coughing",
    values: summary.symptomChart?.coughing || [],
    labels: summary.symptomChart?.labels || [],
  });

  y = drawSparkPanel(doc, {
    x: left,
    y,
    width: contentWidth,
    title: "Shortness",
    values: summary.symptomChart?.shortness || [],
    labels: summary.symptomChart?.labels || [],
  });

  y += 2;
  const colGap = 4;
  const colWidth = (contentWidth - colGap) / 2;
  const panelHeight = 35;

  drawPanel(doc, left, y, colWidth, panelHeight, "Adherence Summary", [
    `Medication adherence: ${summary.medsTakenPct}%`,
    `Average AQI: ${summary.avgAqi} (${summary.aqiBand})`,
    `Trigger impact: ${summary.triggerRatio}x`,
  ]);

  drawPanel(doc, left + colWidth + colGap, y, colWidth, panelHeight, "Weekly Risk Summary", [
    `Risk score: ${summary.weeklyRisk?.scorePct ?? 0}%`,
    `Risk level: ${summary.weeklyRisk?.level || "LOW"}`,
    `${summary.weeklyRisk?.reason || "No risk reason available."}`,
  ]);

  y += panelHeight + 4;

  drawPanel(doc, left, y, colWidth, 36, "Worst AQI Days", buildWorstAqiLines(summary.worstAqiDays));
  drawPanel(doc, left + colWidth + colGap, y, colWidth, 36, "Top Triggers", buildTopTriggerLines(summary));

  y += 40;
  drawFieldBox(doc, left, y, contentWidth, 28, "Clinical Notes");
  y += 32;
  drawFieldBox(doc, left, y, contentWidth, 34, "Recommendations", summary.recommendations || []);

  doc.save("neburix_report.pdf");
}

function capitalize(value) {
  if (!value) return "None";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function drawDivider(doc, x1, x2, y) {
  doc.setDrawColor(220, 220, 220);
  doc.line(x1, y, x2, y);
}

function drawSparkPanel(doc, { x, y, width, title, values, labels }) {
  const panelHeight = 22;
  drawPanelBorder(doc, x, y, width, panelHeight);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(title, x + 2, y + 5);

  drawSparkline(doc, x + 24, y + 4, width - 28, 10, values);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const avg = averageNumber(values);
  doc.text(`Avg ${avg.toFixed(1)}`, x + 2, y + 11);
  doc.text(
    (labels || []).join("  "),
    x + 2,
    y + 18,
    { maxWidth: width - 4 },
  );

  return y + panelHeight + 3;
}

function drawSparkline(doc, x, y, width, height, values) {
  const safeValues = Array.isArray(values) && values.length ? values : [0];
  const maxVal = Math.max(1, ...safeValues);
  const step = safeValues.length > 1 ? width / (safeValues.length - 1) : width;

  doc.setDrawColor(80, 80, 80);
  doc.setLineWidth(0.5);

  safeValues.forEach((value, index) => {
    if (index === 0) return;
    const prevX = x + (index - 1) * step;
    const prevY = y + height - (safeValues[index - 1] / maxVal) * height;
    const currX = x + index * step;
    const currY = y + height - (value / maxVal) * height;
    doc.line(prevX, prevY, currX, currY);
  });
}

function drawPanel(doc, x, y, width, height, title, lines) {
  drawPanelBorder(doc, x, y, width, height);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(title, x + 2, y + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  let lineY = y + 10;
  (lines || []).forEach((line) => {
    const wrapped = doc.splitTextToSize(String(line), width - 4);
    wrapped.forEach((segment) => {
      if (lineY <= y + height - 2) {
        doc.text(segment, x + 2, lineY);
        lineY += 4;
      }
    });
  });
}

function drawPanelBorder(doc, x, y, width, height) {
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.4);
  doc.roundedRect(x, y, width, height, 2, 2);
}

function drawFieldBox(doc, x, y, width, height, title, prefillLines = []) {
  drawPanelBorder(doc, x, y, width, height);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(title, x + 2, y + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  let cursorY = y + 10;

  (prefillLines || []).forEach((line) => {
    const wrapped = doc.splitTextToSize(`- ${line}`, width - 4);
    wrapped.forEach((segment) => {
      if (cursorY <= y + height - 6) {
        doc.text(segment, x + 2, cursorY);
        cursorY += 4;
      }
    });
  });

  while (cursorY <= y + height - 3) {
    doc.setDrawColor(230, 230, 230);
    doc.line(x + 2, cursorY, x + width - 2, cursorY);
    cursorY += 4;
  }
}

function buildWorstAqiLines(days) {
  if (!Array.isArray(days) || !days.length) {
    return ["No AQI day breakdown available."];
  }

  return days.map((entry, index) => `${index + 1}. ${entry.day}: AQI ${entry.aqi}`);
}

function buildTopTriggerLines(summary) {
  const ranked = Array.isArray(summary.topTriggers) ? summary.topTriggers : [];

  if (!ranked.length) {
    return ["No trigger tags captured in this period."];
  }

  const lines = ranked.map((entry, index) => `${index + 1}. ${capitalize(entry.trigger)} (${entry.count})`);
  lines.push(`Primary: ${capitalize(summary.topTrigger)} (${summary.topTriggerCount})`);
  return lines;
}

function averageNumber(values) {
  if (!Array.isArray(values) || !values.length) return 0;
  const total = values.reduce((sum, value) => sum + Number(value || 0), 0);
  return total / values.length;
}
