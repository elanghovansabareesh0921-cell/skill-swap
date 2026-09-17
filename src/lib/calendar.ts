export function generateGoogleCalendarUrl(session: {
  id: string;
  skill_name: string;
  scheduled_at: string;
  duration_minutes?: number;
  partner_name?: string;
}) {
  const startDate = new Date(session.scheduled_at);
  const duration = session.duration_minutes || 45;
  const endDate = new Date(startDate.getTime() + duration * 60000);

  const formatTime = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, "");

  const title = encodeURIComponent(`SkillSwap: ${session.skill_name} Session`);
  const details = encodeURIComponent(
    `Skill exchange session for ${session.skill_name} with ${session.partner_name || "peer mentor"}.\nJoin via SkillSwap Dashboard.`
  );
  const dates = `${formatTime(startDate)}/${formatTime(endDate)}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}`;
}

export function downloadIcsFile(session: {
  id: string;
  skill_name: string;
  scheduled_at: string;
  duration_minutes?: number;
  partner_name?: string;
}) {
  const startDate = new Date(session.scheduled_at);
  const duration = session.duration_minutes || 45;
  const endDate = new Date(startDate.getTime() + duration * 60000);

  const formatTime = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, "");

  const icsData = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SkillSwap//Peer Learning//EN",
    "BEGIN:VEVENT",
    `UID:${session.id}@skillswap.local`,
    `DTSTAMP:${formatTime(new Date())}`,
    `DTSTART:${formatTime(startDate)}`,
    `DTEND:${formatTime(endDate)}`,
    `SUMMARY:SkillSwap: ${session.skill_name}`,
    `DESCRIPTION:Skill exchange session with ${session.partner_name || "peer mentor"}.`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `skillswap-${session.skill_name.toLowerCase().replace(/\s+/g, "-")}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}