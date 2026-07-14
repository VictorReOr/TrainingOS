const getMondayOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

console.log('Today:', new Date());
console.log('Monday:', getMondayOfWeek());

const testDates = [
  '2026-07-12T12:00:00Z', // Sunday
  '2026-07-13T12:00:00Z', // Monday
  '2026-07-14T12:00:00Z', // Tuesday
];

testDates.forEach(t => {
  console.log(t, '->', getMondayOfWeek(new Date(t)));
});
