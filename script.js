// ══════════════════════════════════════════════════════════════════════════
// 1. TEMA RETRO LIGHT / DARK
// ══════════════════════════════════════════════════════════════════════════
const themeBtn = document.getElementById('theme-btn');
const root = document.documentElement;

function setTheme(theme) {
  root.setAttribute('data-theme', theme);
  themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
  try {
    localStorage.setItem('retro_theme', theme);
  } catch (e) {}
}

let savedTheme = null;
try {
  savedTheme = localStorage.getItem('retro_theme');
} catch (e) {}
setTheme(savedTheme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

themeBtn.addEventListener('click', () => {
  const current = root.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
});

// ══════════════════════════════════════════════════════════════════════════
// 2. MENU MOBILE (DRAWER)
// ══════════════════════════════════════════════════════════════════════════
const menuBtn = document.getElementById('menu-btn');
const navLinks = document.getElementById('nav-links');

menuBtn.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuBtn.textContent = open ? '✕' : '☰';
  menuBtn.setAttribute('aria-expanded', open);
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuBtn.textContent = '☰';
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 3. FILTER KATEGORI SKILL
// ══════════════════════════════════════════════════════════════════════════
const filterBtns = document.querySelectorAll('.filter-btn');
const skillCards = document.querySelectorAll('.skill-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.filter;
    skillCards.forEach(card => {
      const categories = card.dataset.category ? card.dataset.category.split(' ') : [];
      card.hidden = cat !== 'semua' && !categories.includes(cat);
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 4. TABS FAVORIT (ANIMES, SONGS, TOOLS) + DYNAMIC ACTION BUTTON
// ══════════════════════════════════════════════════════════════════════════
const favTabs = document.querySelectorAll('.fav-tab-btn');
const favPanels = document.querySelectorAll('.fav-panel');
const favActionBtn = document.getElementById('fav-action-btn');

function updateFavActionBtn(tab) {
  if (!favActionBtn || !tab) return;
  const linkUrl = tab.dataset.linkUrl;
  const linkText = tab.dataset.linkText;
  const linkIcon = tab.dataset.linkIcon || '↗';

  if (linkUrl) {
    favActionBtn.href = linkUrl;
    favActionBtn.style.display = 'inline-flex';
    const iconSpan = favActionBtn.querySelector('.fav-btn-icon');
    const textSpan = favActionBtn.querySelector('.fav-btn-text');
    if (iconSpan) iconSpan.textContent = linkIcon;
    if (textSpan) textSpan.textContent = linkText;
  } else {
    favActionBtn.style.display = 'none';
  }
}

// Inisialisasi tombol aksi sesuai tab yang aktif saat pertama buka
const initialActiveTab = document.querySelector('.fav-tab-btn.active');
if (initialActiveTab) {
  updateFavActionBtn(initialActiveTab);
}

favTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    favTabs.forEach(t => t.classList.remove('active'));
    favPanels.forEach(p => p.classList.remove('active'));

    tab.classList.add('active');
    const targetId = 'tab-' + tab.dataset.tab;
    const panel = document.getElementById(targetId);
    if (panel) panel.classList.add('active');

    // Update link dan teks tombol di samping kanan
    updateFavActionBtn(tab);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 5. SCROLL REVEAL, METER BARS & SCROLLSPY NAV
// ══════════════════════════════════════════════════════════════════════════
function animateMeters(container) {
  container.querySelectorAll('.retro-meter-fill[data-level]').forEach(fill => {
    fill.style.width = fill.dataset.level + '%';
  });
}

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        animateMeters(entry.target);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('[data-reveal]').forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });

  // Scrollspy untuk active link navbar
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navAnchors.forEach(a => a.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-35% 0px -55% 0px' });

  sections.forEach(s => spyObserver.observe(s));
} else {
  // Fallback untuk browser lawas
  document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('visible'));
  animateMeters(document);
}

// ══════════════════════════════════════════════════════════════════════════
// 6. TAHUN COPYRIGHT DINAMIS
// ══════════════════════════════════════════════════════════════════════════
const tahunEl = document.getElementById('tahun');
if (tahunEl) tahunEl.textContent = new Date().getFullYear();

// ══════════════════════════════════════════════════════════════════════════
// 7. CLOUDINARY UPLOADER & ARSIP TUGAS DINAMIS
// ══════════════════════════════════════════════════════════════════════════
const CLOUDINARY_CLOUD_NAME = 'jdiy8afa';
const CLOUDINARY_UPLOAD_PRESET = 'tugas_preset';

// Hash untuk PIN Keamanan
const ADMIN_PIN_HASH = 'fec8760036e94e745fd800b56df087acdb760d9a5c7d5362a76b675dfe03dc30';

async function hashSHA256(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const uploadModal = document.getElementById('upload-modal');
const btnOpenUpload = document.getElementById('btn-open-upload');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnCancelUpload = document.getElementById('btn-cancel-upload');
const uploadForm = document.getElementById('upload-form');
const uploadPin = document.getElementById('upload-pin');
const uploadFileInput = document.getElementById('upload-file-input');
const retroDropzone = document.getElementById('retro-dropzone');
const dropzoneFileDisplay = document.getElementById('dropzone-file-display');
const dropzoneFilename = document.getElementById('dropzone-filename');
const dropzoneFilesize = document.getElementById('dropzone-filesize');
const uploadTitle = document.getElementById('upload-title');
const uploadCourse = document.getElementById('upload-course');
const uploadCategory = document.getElementById('upload-category');
const uploadDesc = document.getElementById('upload-desc');
const uploadProgressWrapper = document.getElementById('upload-progress-wrapper');
const uploadProgressFill = document.getElementById('upload-progress-fill');
const uploadPercent = document.getElementById('upload-percent');
const uploadStatusText = document.getElementById('upload-status-text');
const modalAlert = document.getElementById('modal-alert');
const btnSubmitUpload = document.getElementById('btn-submit-upload');
const docsGrid = document.getElementById('docs-grid');
const tugasCounterText = document.getElementById('tugas-counter-text');

// Modal Konfirmasi Hapus Berkas
const deleteModal = document.getElementById('delete-modal');
const btnCloseDeleteModal = document.getElementById('btn-close-delete-modal');
const btnCancelDelete = document.getElementById('btn-cancel-delete');
const deleteForm = document.getElementById('delete-form');
const deletePin = document.getElementById('delete-pin');
const deleteTargetFilename = document.getElementById('delete-target-filename');
const deleteModalAlert = document.getElementById('delete-modal-alert');
let pendingDeleteDocId = null;

// Helper Sanitasi HTML & Format
function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 KB';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return '~' + (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
}

function getFileIcon(ext) {
  const e = (ext || '').toLowerCase();
  if (['pdf'].includes(e)) return '📑';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(e)) return '📦';
  if (['doc', 'docx', 'txt', 'rtf'].includes(e)) return '📄';
  if (['ppt', 'pptx'].includes(e)) return '📊';
  if (['xls', 'xlsx', 'csv'].includes(e)) return '📈';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(e)) return '🖼️';
  if (['js', 'py', 'php', 'html', 'css', 'ts', 'java', 'c', 'cpp'].includes(e)) return '💻';
  return '📁';
}

function getCategoryBadgeStyle(cat) {
  const c = (cat || '').toUpperCase();
  if (c.includes('SEMESTER 5') || c.includes('SEMESTER')) return 'background:var(--accent-secondary); color:#fff;';
  if (c.includes('DIAGRAM') || c.includes('DESAIN')) return 'background:var(--accent-purple); color:#fff;';
  if (c.includes('CODE') || c.includes('KODING') || c.includes('SOURCE')) return 'background:var(--accent-green); color:#fff;';
  if (c.includes('BESAR') || c.includes('AKHIR') || c.includes('PROYEK')) return 'background:var(--accent); color:#fff;';
  if (c.includes('PRAKTIKUM') || c.includes('LAB')) return 'background:var(--accent-yellow); color:#1a1a1e;';
  return 'background:var(--accent-yellow); color:#1a1a1e;';
}

function updateTugasCounter() {
  if (!tugasCounterText || !docsGrid) return;
  const count = docsGrid.querySelectorAll('.doc-card').length;
  tugasCounterText.innerHTML = `Menampilkan <strong>${count}</strong> Berkas Dokumen`;

  const emptyState = document.getElementById('docs-empty-state');
  if (emptyState) {
    emptyState.style.display = count === 0 ? 'flex' : 'none';
  }
}

// Manajemen Modal
function openModal() {
  if (!uploadModal) return;
  uploadModal.classList.add('open');
  uploadModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (uploadPin) uploadPin.focus();
}

function closeModal() {
  if (!uploadModal) return;
  uploadModal.classList.remove('open');
  uploadModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function resetForm() {
  if (uploadForm) uploadForm.reset();
  if (dropzoneFileDisplay) dropzoneFileDisplay.style.display = 'none';
  if (uploadProgressWrapper) uploadProgressWrapper.style.display = 'none';
  if (uploadProgressFill) uploadProgressFill.style.width = '0%';
  if (uploadPercent) uploadPercent.textContent = '0%';
  showAlert('', '');
}

function showAlert(msg, type) {
  if (!modalAlert) return;
  if (!msg) {
    modalAlert.style.display = 'none';
    modalAlert.className = '';
    modalAlert.textContent = '';
    return;
  }
  modalAlert.textContent = msg;
  modalAlert.className = `modal-alert ${type}`;
  modalAlert.style.display = 'flex';
}

if (btnOpenUpload) btnOpenUpload.addEventListener('click', openModal);
if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
if (btnCancelUpload) btnCancelUpload.addEventListener('click', closeModal);

// Manajemen Modal Hapus Berkas
function showDeleteAlert(msg, type) {
  if (!deleteModalAlert) return;
  if (!msg) {
    deleteModalAlert.style.display = 'none';
    deleteModalAlert.className = '';
    deleteModalAlert.textContent = '';
    return;
  }
  deleteModalAlert.textContent = msg;
  deleteModalAlert.className = `modal-alert ${type}`;
  deleteModalAlert.style.display = 'flex';
}

function openDeleteModal(doc) {
  if (!deleteModal) return;
  pendingDeleteDocId = doc.id;
  if (deleteTargetFilename) {
    deleteTargetFilename.textContent = `Hapus "${doc.title}" dari arsip dokumen?`;
  }
  if (deletePin) deletePin.value = '';
  showDeleteAlert('', '');
  deleteModal.classList.add('open');
  deleteModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (deletePin) deletePin.focus();
}

function closeDeleteModal() {
  if (!deleteModal) return;
  deleteModal.classList.remove('open');
  deleteModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  pendingDeleteDocId = null;
  showDeleteAlert('', '');
}

if (btnCloseDeleteModal) btnCloseDeleteModal.addEventListener('click', closeDeleteModal);
if (btnCancelDelete) btnCancelDelete.addEventListener('click', closeDeleteModal);

if (deleteModal) {
  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) closeDeleteModal();
  });
}

if (uploadModal) {
  uploadModal.addEventListener('click', (e) => {
    if (e.target === uploadModal) closeModal();
  });
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (uploadModal && uploadModal.classList.contains('open')) closeModal();
    if (deleteModal && deleteModal.classList.contains('open')) closeDeleteModal();
  }
});

// Drag & Drop File Picker
function handleFileSelected(file) {
  if (!file) return;
  if (dropzoneFileDisplay && dropzoneFilename && dropzoneFilesize) {
    dropzoneFileDisplay.style.display = 'flex';
    const ext = file.name.split('.').pop() || '';
    dropzoneFilename.textContent = `${getFileIcon(ext)} ${file.name}`;
    dropzoneFilesize.textContent = formatBytes(file.size);
  }

  if (uploadTitle && !uploadTitle.value.trim()) {
    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    uploadTitle.value = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  }
}

if (retroDropzone && uploadFileInput) {
  retroDropzone.addEventListener('click', () => uploadFileInput.click());
  retroDropzone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      uploadFileInput.click();
    }
  });

  ['dragenter', 'dragover'].forEach(name => {
    retroDropzone.addEventListener(name, (e) => {
      e.preventDefault();
      retroDropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(name => {
    retroDropzone.addEventListener(name, (e) => {
      e.preventDefault();
      retroDropzone.classList.remove('dragover');
    });
  });

  retroDropzone.addEventListener('drop', (e) => {
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFileInput.files = e.dataTransfer.files;
      handleFileSelected(e.dataTransfer.files[0]);
    }
  });

  uploadFileInput.addEventListener('change', () => {
    if (uploadFileInput.files && uploadFileInput.files[0]) {
      handleFileSelected(uploadFileInput.files[0]);
    }
  });
}

// Render Card Dokumen ke Grid
function renderDocCard(doc, isPrepend = false) {
  if (!docsGrid) return;
  const article = document.createElement('article');
  article.className = 'doc-card reveal visible';
  article.dataset.docId = doc.id;

  const icon = getFileIcon(doc.format);
  const badgeStyle = getCategoryBadgeStyle(doc.category);
  const displayFormat = (doc.format || 'FILE').toUpperCase();

  article.innerHTML = `
    <div class="window-header">
      <div class="window-dots"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div>
      <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:180px;">${escapeHTML(doc.filename)}</span>
      <span class="badge-retro" style="background:var(--accent-yellow); font-size:0.65rem;">CLOUD</span>
    </div>
    <div class="doc-body">
      <div class="doc-top">
        <div class="doc-icon-box">${icon}</div>
        <div class="doc-top-right">
          <span class="badge-retro" style="${badgeStyle}">${escapeHTML(doc.category)}</span>
          <button type="button" class="btn-delete-doc" data-delete-id="${doc.id}" title="Hapus dari daftar">🗑️</button>
        </div>
      </div>
      <h3>${escapeHTML(doc.title)}</h3>
      <span class="doc-course">Mata Kuliah: ${escapeHTML(doc.course)}</span>
      <p class="doc-desc">${escapeHTML(doc.desc || 'Berkas tugas kuliah terunggah aman di Cloudinary.')}</p>
      <div class="doc-meta-box">
        <div class="doc-meta-item"><span>${icon}</span><span>Format: <strong>${displayFormat}</strong></span></div>
        <div class="doc-meta-item"><span>💾</span><span>Ukuran: <strong>${escapeHTML(doc.size)}</strong></span></div>
      </div>
      <div class="doc-actions">
        <a class="btn outline" href="${escapeHTML(doc.url)}" target="_blank" rel="noopener">Preview ↗</a>
        <a class="btn" href="${escapeHTML(doc.url)}" download="${escapeHTML(doc.filename)}" target="_blank" rel="noopener">Unduh 📥</a>
      </div>
    </div>
  `;

  const delBtn = article.querySelector('.btn-delete-doc');
  if (delBtn) {
    delBtn.addEventListener('click', () => {
      openDeleteModal(doc);
    });
  }

  if (isPrepend) {
    docsGrid.prepend(article);
  } else {
    docsGrid.appendChild(article);
  }
}

// LocalStorage Persistence
function getCloudDocs() {
  try {
    const raw = localStorage.getItem('user_cloud_docs');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCloudDoc(doc) {
  const list = getCloudDocs();
  list.unshift(doc);
  try {
    localStorage.setItem('user_cloud_docs', JSON.stringify(list));
  } catch (e) {}
}

function deleteCloudDoc(id) {
  const list = getCloudDocs().filter(item => item.id !== id);
  try {
    localStorage.setItem('user_cloud_docs', JSON.stringify(list));
  } catch (e) {}
  const card = document.querySelector(`.doc-card[data-doc-id="${id}"]`);
  if (card) card.remove();
  updateTugasCounter();
}

function loadCloudDocs() {
  const list = getCloudDocs();
  list.forEach(doc => renderDocCard(doc, true));
  updateTugasCounter();
}

// Submit Form Upload ke Cloudinary
if (uploadForm) {
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const pin = (uploadPin.value || '').trim();
    const pinHash = await hashSHA256(pin);

    if (pinHash !== ADMIN_PIN_HASH) {
      showAlert('❌ PIN Keamanan salah! Akses unggah hanya untuk pemilik portofolio.', 'error');
      uploadPin.focus();
      return;
    }

    const file = uploadFileInput.files ? uploadFileInput.files[0] : null;
    if (!file) {
      showAlert('❌ Pilih berkas yang ingin diunggah terlebih dahulu!', 'error');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      showAlert('❌ Ukuran berkas melebihi batas 25 MB.', 'error');
      return;
    }

    showAlert('', '');

    btnSubmitUpload.disabled = true;
    btnSubmitUpload.textContent = '⏳ Mengunggah...';
    uploadProgressWrapper.style.display = 'block';
    uploadProgressFill.style.width = '0%';
    uploadPercent.textContent = '0%';
    uploadStatusText.textContent = 'Menghubungkan ke server Cloudinary...';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`);

    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) {
        const pct = Math.round((ev.loaded / ev.total) * 100);
        uploadProgressFill.style.width = pct + '%';
        uploadPercent.textContent = pct + '%';
        uploadStatusText.textContent = pct < 100 
          ? `Mengunggah berkas (${pct}%)...` 
          : 'Memproses berkas di cloud...';
      }
    };

    xhr.onload = () => {
      btnSubmitUpload.disabled = false;
      btnSubmitUpload.textContent = '🚀 Mulai Unggah';

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          const ext = (res.format || file.name.split('.').pop() || 'file').toLowerCase();
          
          const newDoc = {
            id: 'cloud_' + Date.now(),
            title: uploadTitle.value.trim() || file.name,
            course: uploadCourse.value.trim() || 'Umum',
            category: (uploadCategory && uploadCategory.value.trim() ? uploadCategory.value.trim().toUpperCase() : 'DOKUMEN'),
            desc: uploadDesc.value.trim() || 'Berkas tugas kuliah terunggah aman di Cloudinary.',
            format: ext,
            size: formatBytes(res.bytes || file.size),
            url: res.secure_url,
            filename: file.name,
            uploadedAt: new Date().toISOString()
          };

          saveCloudDoc(newDoc);
          renderDocCard(newDoc, true);
          updateTugasCounter();

          showAlert('🎉 Berhasil! Berkas telah tersimpan di Cloudinary dan muncul di daftar tugas.', 'success');

          setTimeout(() => {
            closeModal();
            resetForm();
          }, 1600);
        } catch (err) {
          showAlert('❌ Gagal memproses respons dari Cloudinary: ' + err.message, 'error');
        }
      } else {
        let errMsg = 'Gagal mengunggah berkas.';
        try {
          const errObj = JSON.parse(xhr.responseText);
          if (errObj && errObj.error && errObj.error.message) {
            errMsg += ' ' + errObj.error.message;
          }
        } catch(e) {}
        showAlert('❌ ' + errMsg, 'error');
      }
    };

    xhr.onerror = () => {
      btnSubmitUpload.disabled = false;
      btnSubmitUpload.textContent = '🚀 Mulai Unggah';
      showAlert('❌ Terjadi kesalahan jaringan saat mengunggah.', 'error');
    };

    xhr.send(formData);
  });
}

// Submit Form Hapus Berkas (Verifikasi SHA-256 PIN)
if (deleteForm) {
  deleteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!pendingDeleteDocId) return;

    const pin = (deletePin.value || '').trim();
    const pinHash = await hashSHA256(pin);

    if (pinHash !== ADMIN_PIN_HASH) {
      showDeleteAlert('❌ PIN Keamanan salah! Akses hapus hanya diizinkan untuk pemilik.', 'error');
      if (deletePin) deletePin.focus();
      return;
    }

    deleteCloudDoc(pendingDeleteDocId);
    showDeleteAlert('✅ Berkas berhasil dihapus!', 'success');

    setTimeout(() => {
      closeDeleteModal();
    }, 800);
  });
}

// Inisialisasi Berkas Cloud yang tersimpan
loadCloudDocs();

