function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  let left = 0;
  let right = sorted.length - 1;
  while (left < right) {
    if (sorted[left] !== sorted[right]) {
      left += 1;
      right -= 1;
    }
  }
  return left === right ? sorted[left] : (sorted[left] + sorted[right]) / 2;
}

module.exports = { median };
