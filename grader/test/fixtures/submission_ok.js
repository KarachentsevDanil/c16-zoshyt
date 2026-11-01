// Зошит · посилка 1001 · js-basics/hw-06 · Student One <student1@example.com>
function median(values) {
  const v = [...values].sort((a, b) => a - b);
  const middle = Math.floor(v.length / 2);
  return v.length % 2 === 1 ? v[middle] : (v[middle - 1] + v[middle]) / 2;
}

module.exports = { median };
