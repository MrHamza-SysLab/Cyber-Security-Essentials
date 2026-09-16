
export const checkPasswordStrength = (password: string) => {
  let score = 0;
  const feedback: string[] = [];

  if (!password) return { score: 0, feedback: ["Enter a password to begin"] };

  // Length
  if (password.length >= 8) {
    score += 20;
  } else {
    feedback.push("Password is too short (min 8 characters)");
  }
  if (password.length >= 12) score += 10;

  // Uppercase
  if (/[A-Z]/.test(password)) {
    score += 15;
  } else {
    feedback.push("Add uppercase letters");
  }

  // Lowercase
  if (/[a-z]/.test(password)) {
    score += 15;
  } else {
    feedback.push("Add lowercase letters");
  }

  // Numbers
  if (/[0-9]/.test(password)) {
    score += 15;
  } else {
    feedback.push("Add numbers");
  }

  // Special characters
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 15;
  } else {
    feedback.push("Add special characters");
  }

  // Common patterns
  const commonPasswords = ["123456", "password", "qwerty", "12345678", "admin"];
  if (commonPasswords.includes(password.toLowerCase())) {
    score = Math.min(score, 10);
    feedback.push("This password is very common and easily hacked");
  }

  // Personal info simulation (just examples)
  const personalInfo = ["hamza", "2026", "admin"];
  if (personalInfo.some(info => password.toLowerCase().includes(info))) {
    score -= 10;
    feedback.push("Avoid using names or years");
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    feedback: feedback.length > 0 ? feedback : ["Strong password - hard to crack"]
  };
};

export const calculateTimeToCrack = (password: string) => {
  const { score } = checkPasswordStrength(password);
  
  if (score < 30) return "Instantly";
  if (score < 50) return "2 seconds";
  if (score < 70) return "2 days";
  if (score < 90) return "200 years";
  return "Centuries";
};
