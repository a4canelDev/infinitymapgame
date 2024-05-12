function togglePopup() {
    var overlay = document.getElementById('popup-overlay');
    var popup = document.getElementById('popup-content');
    overlay.style.display = overlay.style.display === 'block' ? 'none' : 'block';
    popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
  }