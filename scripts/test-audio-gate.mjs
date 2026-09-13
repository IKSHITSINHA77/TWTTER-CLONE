// scripts/test-audio-gate.mjs
function checkISTTimeGate(testDate = new Date()) {
  const utc = testDate.getTime() + testDate.getTimezoneOffset() * 60000;
  const istDate = new Date(utc + 330 * 60000);
  const hours = istDate.getHours();
  const minutes = istDate.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  const start = 14 * 60; // 2:00 PM IST
  const end = 19 * 60;   // 7:00 PM IST

  const isAllowed = totalMinutes >= start && totalMinutes < end;
  return {
    istTime: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} IST`,
    isAllowed,
    message: isAllowed ? 'Window Open' : 'Window Closed (Only 2 PM - 7 PM IST permitted)',
  };
}

console.log('--- Task 2 Audio Time-Gate Verification ---');
console.log('Current Check:', checkISTTimeGate());

// Test edge cases
console.log('Test 1:59 PM IST:', checkISTTimeGate(new Date('2026-09-14T08:29:00Z'))); // Expect false
console.log('Test 2:00 PM IST:', checkISTTimeGate(new Date('2026-09-14T08:30:00Z'))); // Expect true
console.log('Test 6:59 PM IST:', checkISTTimeGate(new Date('2026-09-14T13:29:00Z'))); // Expect true
console.log('Test 7:00 PM IST:', checkISTTimeGate(new Date('2026-09-14T13:30:00Z'))); // Expect false