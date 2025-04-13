export function Popup({ closePopup }: any) {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Popup Window</h2>
        <p>This is a simple popup window.</p>
        <button onClick={closePopup}>Close</button>
      </div>
    </div>
  );
}
