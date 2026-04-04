import { slotOptions } from '../data/sports';

function normalizeSegment(segment: string): string {
  return segment.trim();
}

export function getSlotLabel(slotId: number): string {
  const match = slotOptions.find((slot) => slot.id === slotId);
  return match?.label ?? '';
}

export function formatTimeRange(startSlotId: number, endSlotId: number): string {
  const startLabel = getSlotLabel(startSlotId);
  const endLabel = getSlotLabel(endSlotId);

  if (!startLabel || !endLabel) {
    return '--:-- - --:--';
  }

  const startSegment = startLabel.split('-')[0];
  const endSegment = endLabel.split('-')[1];

  if (!startSegment || !endSegment) {
    return '--:-- - --:--';
  }

  return `${normalizeSegment(startSegment)} - ${normalizeSegment(endSegment)}`;
}
