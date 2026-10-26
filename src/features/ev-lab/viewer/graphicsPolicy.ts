export interface GraphicsCapabilities {
  coarsePointer: boolean;
  cores?: number;
  memoryGiB?: number;
}

export function limitedGraphics({ coarsePointer, cores, memoryGiB }: GraphicsCapabilities) {
  // Width and physical pixel density do not identify GPU capacity. A primary
  // touch pointer keeps phones conservative in both orientations; fine-pointer
  // desktops retain their existing quality unless capacity is known to be low.
  return (
    coarsePointer ||
    (cores !== undefined && cores > 0 && cores <= 4) ||
    (memoryGiB !== undefined && memoryGiB > 0 && memoryGiB <= 4)
  );
}
