// Quick verification script — run with: node verify_sip.mjs
import { calculateSIP, calculateStepUpSIP } from './src/utils/sipCalculator.js';

const cases = [
  { label: '₹5,000/mo, 12%, 10y, no step-up',   args: [5000,  12, 10] },
  { label: '₹10,000/mo, 12%, 15y, no step-up',  args: [10000, 12, 15] },
  { label: '₹10,000/mo, 15%, 20y, no step-up',  args: [10000, 15, 20] },
];

console.log('=== Standard SIP ===');
for (const c of cases) {
  const result = calculateSIP(...c.args);
  console.log(`\n${c.label}`);
  console.log(`  Invested : ₹${result.invested.toLocaleString('en-IN')}`);
  console.log(`  Returns  : ₹${result.returns.toLocaleString('en-IN')}`);
  console.log(`  Maturity : ₹${result.maturity.toLocaleString('en-IN')}`);
}

console.log('\n\n=== Step-Up SIP ===');
const stepUp = calculateStepUpSIP(10000, 12, 10, 10);
console.log('₹10,000/mo, 12%, 10y, 10% step-up');
console.log(`  Invested : ₹${stepUp.invested.toLocaleString('en-IN')}`);
console.log(`  Returns  : ₹${stepUp.returns.toLocaleString('en-IN')}`);
console.log(`  Maturity : ₹${stepUp.maturity.toLocaleString('en-IN')}`);
