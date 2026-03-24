/**
 * Fisher-Yates Shuffle Algorithm
 */
function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

self.onmessage = (e: MessageEvent) => {
  const { type, data } = e.data;

  if (type === 'SHUFFLE') {
    const shuffled = shuffle(data);
    self.postMessage({ type: 'SHUFFLE_COMPLETE', data: shuffled });
  }
};
