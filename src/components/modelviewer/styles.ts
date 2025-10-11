export class ModelViewerStyles {
  static readonly hotspot = {
    display: 'block',
    width: '20px',
    height: '20px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: 'red',
    boxSizing: 'border-box',
    pointerEvents: 'none',
  } as const;

  static readonly hotspotHand = {
    ...this.hotspot,
    '--min-hotspot-opacity': '0',
    backgroundColor: 'red',
  } as const;

  static readonly hotspotFoot = {
    ...this.hotspot,
    backgroundColor: 'transparent',
    border: '3px solid blue',
  } as const;

  static readonly annotation = {
    backgroundColor: '#888888',
    position: 'absolute',
    transform: 'translate(10px, 10px)',
    borderRadius: '10px',
    padding: '10px',
  } as const;

  static readonly hiddenWhileLoading = {
    display: 'none',
  } as const;
}
