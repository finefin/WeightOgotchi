const MESSAGES = {
  welcome: [
    'Oh great, another human who thinks this time it\'ll stick. Fine, tap me.',
    'You again? Alright, fine. Let\'s see if you last longer than a week this time.',
    'Look who finally showed up. The scale\'s been waiting. So have I.',
    'Don\'t make me look stupid for believing in you again. Tap me.',
    'Oh, you exist. Cool. Ready to log some sad numbers? Let\'s go.',
    'Welcome to the circus. Step on the scale whenever you\'re ready to cry.',
  ],
  firstLog: [
    'A wild number appeared! It\'s… a start. I guess.',
    'First weight logged. The bar was on the floor and you still barely cleared it. Proud?',
    'One down, infinity to go. You love suffering, don\'t you?',
    'You actually did it. I\'m genuinely shocked. Don\'t prove me right again.',
    'The first step of many. Or the only step. History says… only step.',
  ],
  progress: [
    'Still here? Huh. Starting to think you might actually be serious.',
    'Consistency? From YOU? Who possessed you and what did they pay?',
    'Congratulations, you\'re doing the bare minimum. Don\'t let it go to your head.',
    'You keep showing up. I hate that I\'m starting to respect you.',
    'Riveting stuff. Another number. Another day. Another step closer. Fine, I\'m impressed.',
    'You\'re building a habit. Or a very boring routine. Tomato, tomato.',
  ],
  halfway: [
    'HALFWAY. I take back 30% of the mean things I said about you.',
    'Middle child energy. You\'re not at the start, not at the finish. Just existing. Proud anyway.',
    '50%! If this were a test you\'d still fail, but for you? This is Olympic gold.',
    'You actually made it halfway. I owe someone an apology. Probably you.',
  ],
  almostThere: [
    'The finish line is so close even YOU can\'t trip over it. Probably.',
    'Almost there! Don\'t screw it up now. That\'s my job — to nag.',
    'So close I can taste it. Tastes like vindication. Don\'t prove me wrong NOW.',
    'One more push. If you quit now I will personally haunt your bathroom scale.',
  ],
  goalReached: [
    'YOU DID IT?! I\'M LITERALLY SHAKING. I NEVER DOUBTED YOU. (I doubted you.)',
    'GOAL WEIGHT. I need to sit down. You actually did the thing. The whole thing.',
    'Unbelievable. You reached your goal. I take back EVERYTHING. You\'re a legend.',
    '🎉🎉🎉 GOAL WEIGHT 🎉🎉🎉 Time to maintain. Which means you still can\'t eat garbage. Sorry.',
    'You won. The scale lost. I\'m crying pixels. This is beautiful.',
  ],
  setback: [
    'Up a bit? That\'s fine. Water weight, salt, gravity. We move.',
    'Weight fluctuates. Unlike your willpower, which is rock solid. Usually.',
    'It\'s one number. Not a life sentence. Stop spiraling and log the next one.',
    'You gained. So what? The scale isn\'t your eulogy. Try again tomorrow.',
    'Ah yes, the classic "two steps forward, one step back" dance. You\'re still ahead, idiot.',
    'Gained weight? Boring. Next entry, please. We don\'t do drama here.',
  ],
  onTrack: [
    'Downward trend. Nice. You\'re less of a disaster than yesterday.',
    'Dropping weight like it\'s hot. Which it is. Because you\'re on fire.',
    'Another good entry. I\'m running out of insults. This is concerning.',
    'You\'re doing well. And I hate that I had to admit that out loud.',
    'The numbers are going the right way. Don\'t let it get to your head. Or do. I don\'t care.',
  ],
  overdue: [
    'The deadline passed but YOU\'RE STILL HERE. That\'s more than most people. Keep going.',
    'Target date? Overrated. You\'re playing the long game. Or you forgot. Either way, log it.',
    'So you\'re late. Fashionably late. The scale doesn\'t care about dates. It cares about you.',
    'Missed your target date. Big deal. The universe didn\'t explode. Keep logging.',
    'Deadlines are made up. Results are real. You\'re still in the fight. That\'s what counts.',
  ],
};

function getMessage() {
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
