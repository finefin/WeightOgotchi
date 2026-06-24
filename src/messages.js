const ACTIVITY_MESSAGES = {
  sports: ['Sports 1', 'Sports 2', 'Sports 3'],
  sportStairs: ['Stairs 1', 'Stairs 2', 'Stairs 3'],
  sportWalk: ['Walk 1', 'Walk 2', 'Walk 3'],
  sportTramp: ['Trampoline 1', 'Trampoline 2', 'Trampoline 3'],
  sportMarathon: ['Marathon 1', 'Marathon 2', 'Marathon 3', 'Marathon 4'],
  candySome: ['Candy 1', 'Candy 2', 'Candy 3'],
  candyLots: ['Candy lots 1', 'Candy lots 2', 'Candy lots 3', 'Candy lots 4'],
  foodFast: ['Fast food 1', 'Fast food 2', 'Fast food 3', 'Fast food 4'],
  foodHealthy: ['Healthy 1', 'Healthy 2', 'Healthy 3', 'Healthy 4', 'Healthy 5'],
  alcoholSome: ['Alcohol 1', 'Alcohol 2', 'Alcohol 3'],
  alcoholLots: ['Alcohol lots 1', 'Alcohol lots 2', 'Alcohol lots 3'],
  smokingSome: ['Smoking 1', 'Smoking 2', 'Smoking 3'],
  smokingLots: ['Smoking lots 1', 'Smoking lots 2', 'Smoking lots 3'],
  sleepWell: ['Sleep well 1', 'Sleep well 2', 'Sleep well 3'],
  sleepPoorly: ['Sleep poorly 1', 'Sleep poorly 2', 'Sleep poorly 3'],
  sleepShort: ['Sleep short 1', 'Sleep short 2', 'Sleep short 3'],
  sleepLong: ['Sleep long 1', 'Sleep long 2', 'Sleep long 3'],
};

const MESSAGES = {
  welcome: ['Welcome 1', 'Welcome 2', 'Welcome 3', 'Welcome 4', 'Welcome 5', 'Welcome 6'],
  firstLog: ['First log 1', 'First log 2', 'First log 3', 'First log 4', 'First log 5'],
  progress: ['Progress 1', 'Progress 2', 'Progress 3', 'Progress 4', 'Progress 5', 'Progress 6'],
  halfway: ['Halfway 1', 'Halfway 2', 'Halfway 3', 'Halfway 4'],
  almostThere: ['Almost there 1', 'Almost there 2', 'Almost there 3', 'Almost there 4'],
  goalReached: ['Goal! 1', 'Goal! 2', 'Goal! 3', 'Goal! 4', 'Goal! 5'],
  setback: ['Setback 1', 'Setback 2', 'Setback 3', 'Setback 4', 'Setback 5', 'Setback 6'],
  onTrack: ['On track 1', 'On track 2', 'On track 3', 'On track 4', 'On track 5'],
  overdue: ['Overdue 1', 'Overdue 2', 'Overdue 3', 'Overdue 4', 'Overdue 5'],
};

function getMessage(actionKey) {
  if (!state.profile) return MESSAGES.welcome[0];

  if (state.weights.length === 0) {
    return MESSAGES.welcome[Math.floor(Math.random() * MESSAGES.welcome.length)];
  }

  const sorted = [...state.weights].sort((a, b) => a.date.localeCompare(b.date));
  const first = sorted[0].weight;
  const last = sorted[sorted.length - 1].weight;
  const target = state.profile.targetWeight;
  const prog = calcProgress();
  const due = new Date(state.profile.targetDate);
  const overdue = due < new Date();

  if (prog && prog.completed >= 10) {
    return MESSAGES.goalReached[Math.floor(Math.random() * MESSAGES.goalReached.length)];
  }

  if (overdue) {
    return MESSAGES.overdue[Math.floor(Math.random() * MESSAGES.overdue.length)];
  }

  if (actionKey && ACTIVITY_MESSAGES[actionKey]) {
    const msgs = ACTIVITY_MESSAGES[actionKey];
    return msgs[Math.floor(Math.random() * msgs.length)];
  }

  if (sorted.length === 1) {
    return MESSAGES.firstLog[Math.floor(Math.random() * MESSAGES.firstLog.length)];
  }

  const pct = prog ? prog.completed / prog.total : 0;
  if (pct >= 0.75) {
    return MESSAGES.almostThere[Math.floor(Math.random() * MESSAGES.almostThere.length)];
  }
  if (pct >= 0.5) {
    return MESSAGES.halfway[Math.floor(Math.random() * MESSAGES.halfway.length)];
  }
  if (pct > 0) {
    return MESSAGES.progress[Math.floor(Math.random() * MESSAGES.progress.length)];
  }

  if (sorted.length >= 2) {
    const prev = sorted[sorted.length - 2].weight;
    const diff = last - prev;
    const goingDown = target < first;
    const goingUp = target > first;
    if ((goingDown && diff < 0) || (goingUp && diff > 0)) {
      return MESSAGES.onTrack[Math.floor(Math.random() * MESSAGES.onTrack.length)];
    }
    if (diff !== 0) {
      return MESSAGES.setback[Math.floor(Math.random() * MESSAGES.setback.length)];
    }
  }

  return MESSAGES.progress[Math.floor(Math.random() * MESSAGES.progress.length)];
}
