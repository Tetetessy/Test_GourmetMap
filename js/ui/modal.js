// ============================================================
// Gourmet Map - Modal UI
// モーダルの共通操作
// ============================================================

function closeModal() {
  const modalContent = document.getElementById('modal-content');
  if (modalContent) modalContent.classList.remove('list-manage-modal-content', 'store-register-modal-content', 'area-register-modal-content');
  document.getElementById('modal-overlay').style.display = 'none';
}
