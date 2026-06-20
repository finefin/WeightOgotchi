const BMI_CATEGORIES = [
  { min: 0, max: 18.5, label: 'Underweight', color: '#60a5fa' },
  { min: 18.5, max: 25, label: 'Normal', color: '#22c55e' },
  { min: 25, max: 30, label: 'Overweight', color: '#f59e0b' },
  { min: 30, max: Infinity, label: 'Obese', color: '#ef4444' },
];

function calcBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm) return null;
  return weightKg / ((heightCm / 100) ** 2);
}

function bmiCategory(bmi) {
  if (bmi == null) return null;
  return BMI_CATEGORIES.find(c => bmi >= c.min && bmi < c.max) || BMI_CATEGORIES[BMI_CATEGORIES.length - 1];
}
