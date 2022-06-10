import options from '../../../options.json';
import type { Song } from '../queue/Song';

export function inactivityTime() {
  let response: number = 30000; // Default 30 seconds

  if (!options) {
    return response;
  }
  if (!options.inactivityTime) {
    return response;
  }
  const savedOption = Number(options.inactivityTime);
  if (savedOption < 0) return response;
  if (Number.isInteger(savedOption)) {
    response = savedOption * 1000;
  }

  response == 0 ? (response = 30000) : null;

  return response;
}

export function shuffleQueue(queue: Song[]) {
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }
}
