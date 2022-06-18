import options from '../../../options.json';

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
