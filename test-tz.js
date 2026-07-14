const getMondayOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const formatISO = (d) => {
  const pad = n => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Simulate UTC-6 timezone (Mexico City) by creating a date
// Wait, Node.js uses system timezone. I can force timezone with env var in the command.
console.log('Monday:', getMondayOfWeek());
console.log('Monday ISO:', formatISO(getMondayOfWeek()));

const d = new Date(getMondayOfWeek());
d.setDate(d.getDate() + 0);
console.log('Lunes dateISO:', formatISO(d));

d.setDate(d.getDate() + 1); // Not adding to base, wait.
// In the app it is:
// d = new Date(currentWeekStart);
// d.setDate(d.getDate() + 1);
const d2 = new Date(getMondayOfWeek());
d2.setDate(d2.getDate() + 1);
console.log('Martes dateISO:', formatISO(d2));
