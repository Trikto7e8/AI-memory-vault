import { createEncryptedVault, createIndexedDBVaultStore, importEncryptedVault, MAX_BACKUP_BYTES, openEncryptedVault, validateEnvelope, validateVaultSnapshot } from "../src/index.js";

const DB_NAME = "memoria-vault-local";
const DB_VERSION = 1;
const STORE_NAME = "encrypted-snapshots";
const VAULT_KEY = "primary";
const IDLE_LOCK_MS = 10 * 60 * 1000;
const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: true });

let unlocked = null;
let snapshot = null;
let searchText = "";
let pendingImportedEnvelope = null;
let idleLockTimer = null;

const byId = (id) => document.getElementById(id);
const lockedView = byId("locked-view");
const vaultView = byId("vault-view");
const lockForm = byId("unlock-form");
const lockButton = byId("lock-button");
const passphraseInput = byId("passphrase");
const passphraseStatus = byId("passphrase-status");
const lockStatus = byId("lock-status");
const vaultStatus = byId("vault-status");
byId("voice-description").placeholder = "Descrivi il timbro: caldo, morbido, profondo...";
byId("voice-description").maxLength = 1000;

function bytesEqual(left, right) {
  if (!left || left.byteLength !== right.byteLength) return false;
  for (let index = 0; index < left.byteLength; index += 1) if (left[index] !== right[index]) return false;
  return true;
}

const encryptedStore = createIndexedDBVaultStore({
  databaseName: DB_NAME,
  objectStoreName: STORE_NAME,
  key: VAULT_KEY,
  version: DB_VERSION,
});

async function readEnvelope() {
  const bytes = await encryptedStore.readEncryptedEnvelope();
  return bytes === undefined ? undefined : JSON.parse(decoder.decode(bytes));
}

function temporaryStore(bytes) {
  let current = new Uint8Array(bytes);
  return {
    async readEncryptedEnvelope() { return current && new Uint8Array(current); },
    async createEncryptedEnvelope(value) {
      if (current) throw new Error("Temporary vault store is not empty.");
      current = new Uint8Array(value);
    },
    async compareAndSwapEncryptedEnvelope(expected, next) {
      if (!bytesEqual(current, expected)) return false;
      current = new Uint8Array(next);
      return true;
    },
    async clearEncryptedEnvelope(expected) {
      if (!bytesEqual(current, expected)) return false;
      current = undefined;
      return true;
    },
  };
}

function defaultSnapshot() {
  const now = new Date().toISOString();
  return {
    format: "memoria-vault",
    schemaVersion: 1,
    vaultId: crypto.randomUUID(),
    exportedAt: now,
    profile: {
      schemaVersion: 1,
      language: "Italiano",
      identity: { assistantId: crypto.randomUUID(), name: "Il mio assistente", description: "", avatarDescription: "" },
      behavior: { rules: [], boundaries: [] },
      voice: { voiceIdentityId: crypto.randomUUID(), readAloud: false },
    },
    memories: [],
  };
}

function setLocked(isLocked) {
  lockedView.classList.toggle("hidden", !isLocked);
  vaultView.classList.toggle("hidden", isLocked);
  lockButton.classList.toggle("hidden", isLocked);
  if (isLocked) {
    clearTimeout(idleLockTimer);
    idleLockTimer = null;
    clearUnlockedView();
    const session = unlocked;
    unlocked = null;
    snapshot = null;
    if (session && !session.isLocked()) session.lock().catch(() => {});
    passphraseInput.value = "";
  } else {
    scheduleIdleLock();
  }
}

function scheduleIdleLock() {
  clearTimeout(idleLockTimer);
  idleLockTimer = null;
  if (!unlocked) return;
  idleLockTimer = window.setTimeout(() => {
    idleLockTimer = null;
    if (!unlocked) return;
    setLocked(true);
    setLockMode(true);
    lockStatus.textContent = "Vault bloccato dopo 10 minuti di inattività.";
  }, IDLE_LOCK_MS);
}

function clearUnlockedView() {
  // Hiding the vault is not enough: remove rendered plaintext from the DOM too.
  byId("memory-list").replaceChildren();
  snapshot = null;
  clearContextPreview();
  byId("memory-count").textContent = "0";
  byId("search").value = "";
  searchText = "";
  for (const field of vaultView.querySelectorAll("input, textarea")) {
    if (field.type === "checkbox") field.checked = false;
    else field.value = "";
  }
  for (const select of vaultView.querySelectorAll("select")) select.selectedIndex = 0;
  vaultStatus.textContent = "";
  passphraseStatus.textContent = "";
  byId("memory-form-title").textContent = "Aggiungi un ricordo";
  byId("memory-submit").textContent = "Salva nel vault";
  byId("memory-cancel").classList.add("hidden");
}

function clearContextPreview() {
  byId("context-preview-form").reset();
  byId("context-preview-result").replaceChildren();
}

function renderContextPreview(candidate) {
  const result = byId("context-preview-result");
  result.replaceChildren();
  const summary = document.createElement("p");
  summary.className = "context-local-label";
  summary.textContent = `Anteprima locale — ${candidate.records.length} ${candidate.records.length === 1 ? "ricordo trovato" : "ricordi trovati"}. Nessun dato è stato inviato.`;
  result.append(summary);
  if (!candidate.records.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "Nessun ricordo approvato e pertinente. I ricordi da rivedere, archiviati o scaduti non vengono inclusi.";
    result.append(empty);
    return;
  }
  const list = document.createElement("div");
  list.className = "context-memory-list";
  for (const memory of candidate.records) {
    const card = document.createElement("article");
    card.className = "memory-card";
    const title = document.createElement("h3");
    title.textContent = memory.title;
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `${memory.category} · ${memory.sensitivity === "sensitive" ? "sensibile — incluso su tua richiesta" : "ordinario"}`;
    const content = document.createElement("p");
    content.textContent = memory.content;
    card.append(title, meta, content);
    list.append(card);
  }
  result.append(list);
}

function setLockMode(hasVault, importing = false) {
  if (importing) {
    byId("lock-title").textContent = "Importa un backup cifrato";
    byId("lock-description").textContent = "Inserisci la passphrase del backup. Il vault attuale resterà intatto fino alla verifica e alla tua conferma.";
    byId("unlock-submit").textContent = "Verifica e importa";
    byId("cancel-import").classList.remove("hidden");
    lockForm.dataset.mode = "import";
    return;
  }
  byId("cancel-import").classList.add("hidden");
  byId("lock-title").textContent = hasVault ? "Sblocca il tuo vault" : "Crea il vault locale";
  byId("lock-description").textContent = hasVault
    ? "Inserisci la passphrase per decifrare il vault su questo dispositivo."
    : "Scegli una passphrase lunga (almeno 12 caratteri) e conservala al sicuro: non può essere recuperata. Protegge la chiave privata e serve per riaprire o importare il vault su un altro dispositivo.";
  byId("unlock-submit").textContent = hasVault ? "Sblocca vault" : "Crea vault";
  lockForm.dataset.mode = hasVault ? "unlock" : "create";
}

function render() {
  const list = byId("memory-list");
  list.replaceChildren();
  const search = searchText.trim().toLocaleLowerCase();
  const memories = snapshot.memories.filter((record) =>
    `${record.title} ${record.category} ${record.content} ${record.tags.join(" ")}`.toLocaleLowerCase().includes(search));
  byId("memory-count").textContent = String(memories.length);

  if (!memories.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = search ? "Nessun risultato nel vault locale." : "Ancora vuoto. Aggiungi un ricordo di prova per vedere come funziona.";
    list.append(empty);
  }

  for (const memory of [...memories].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))) {
    const card = document.createElement("article");
    card.className = "memory-card";
    const title = document.createElement("h3");
    title.textContent = memory.title;
    const meta = document.createElement("div");
    meta.className = "meta";
    const statusLabel = ({ suggested: "da rivedere", approved: "approvato", archived: "archiviato" })[memory.status];
    meta.textContent = `${memory.category} · ${statusLabel} · ${memory.sensitivity === "sensitive" ? "sensibile" : "ordinario"} · ${new Date(memory.updatedAt).toLocaleDateString()}`;
    const content = document.createElement("p");
    content.textContent = memory.content;
    const tags = document.createElement("div");
    tags.className = "tags";
    for (const tag of memory.tags) {
      const chip = document.createElement("span");
      chip.className = "tag";
      chip.textContent = tag;
      tags.append(chip);
    }
    const actions = document.createElement("div");
    actions.className = "card-actions";
    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "secondary";
    edit.textContent = "Modifica";
    edit.addEventListener("click", () => editMemory(memory.id));
    const review = document.createElement("button");
    review.type = "button";
    review.className = "secondary";
    review.textContent = memory.status === "suggested" ? "Approva" : memory.status === "archived" ? "Ripristina" : "Archivia";
    review.addEventListener("click", () => changeMemoryStatus(memory.id, memory.status === "approved" ? "archived" : "approved"));
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "danger";
    remove.textContent = "Elimina";
    remove.addEventListener("click", async () => {
      if (!confirm(`Eliminare il ricordo “${memory.title}” dal vault locale?`)) return;
      try {
        snapshot = await unlocked.deleteMemory(memory.id);
        clearContextPreview();
        render();
        vaultStatus.textContent = "Ricordo eliminato dal vault locale.";
      } catch (error) {
        vaultStatus.textContent = error instanceof Error ? error.message : "Impossibile salvare la modifica.";
      }
    });
    actions.append(edit, review, remove);
    card.append(title, meta, content, tags, actions);
    list.append(card);
  }

  const profile = snapshot.profile;
  byId("profile-language").value = profile.language ?? "";
  byId("assistant-name").value = profile.identity?.name ?? "";
  byId("assistant-description").value = profile.identity?.description ?? "";
  byId("assistant-avatar-description").value = profile.identity?.avatarDescription ?? "";
  byId("profile-tone").value = profile.behavior?.tone ?? "";
  byId("profile-response-length").value = profile.behavior?.responseLength ?? "balanced";
  byId("profile-rules").value = (profile.behavior?.rules ?? []).join("\n");
  byId("profile-boundaries").value = (profile.behavior?.boundaries ?? []).join("\n");
  byId("voice-description").value = profile.voice?.timbreDescription ?? "";
  byId("voice-accent").value = profile.voice?.accentDescription ?? "";
  byId("voice-language").value = profile.voice?.language ?? "";
  byId("voice-pace").value = profile.voice?.pace ?? "natural";
  byId("voice-label").value = profile.voice?.preferredVoiceLabel ?? "";
  byId("voice-identity-id").value = profile.voice?.voiceIdentityId ?? "";
  byId("voice-engine-id").value = profile.voice?.engineId ?? "";
  byId("read-aloud").checked = profile.voice?.readAloud ?? false;
}

function editMemory(id) {
  const record = snapshot.memories.find((item) => item.id === id);
  if (!record) return;
  byId("memory-id").value = record.id;
  byId("memory-title").value = record.title;
  byId("memory-category").value = record.category;
  byId("memory-content").value = record.content;
  byId("memory-tags").value = record.tags.join(", ");
  byId("memory-sensitive").checked = record.sensitivity === "sensitive";
  byId("memory-form-title").textContent = "Modifica ricordo";
  byId("memory-submit").textContent = "Aggiorna ricordo";
  byId("memory-cancel").classList.remove("hidden");
  byId("memory-title").focus();
}

async function changeMemoryStatus(id, status) {
  try {
    snapshot = await unlocked.setMemoryStatus(id, status);
    clearContextPreview();
    render();
    vaultStatus.textContent = status === "approved" ? "Ricordo approvato per il recupero locale." : "Ricordo archiviato; non verrà proposto al recupero.";
  } catch (error) {
    vaultStatus.textContent = error instanceof Error ? error.message : "Impossibile aggiornare lo stato del ricordo.";
  }
}

function clearMemoryForm() {
  byId("memory-form").reset();
  byId("memory-id").value = "";
  byId("memory-form-title").textContent = "Aggiungi un ricordo";
  byId("memory-submit").textContent = "Salva nel vault";
  byId("memory-cancel").classList.add("hidden");
}

lockForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const passphrase = passphraseInput.value;
  lockStatus.textContent = "Operazione in corso…";
  byId("unlock-submit").disabled = true;
  try {
    if (lockForm.dataset.mode === "create") {
      if (passphrase.length < 12) throw new Error("Scegli una passphrase di almeno 12 caratteri.");
      unlocked = await createEncryptedVault({ store: encryptedStore, passphrase, snapshot: defaultSnapshot(), validateSnapshot: validateVaultSnapshot });
    } else if (lockForm.dataset.mode === "import") {
      if (!pendingImportedEnvelope) throw new Error("Seleziona di nuovo il backup da importare.");
      const backupBytes = encoder.encode(JSON.stringify(pendingImportedEnvelope));
      const verificationStore = temporaryStore(backupBytes);
      const verificationSession = await openEncryptedVault({ store: verificationStore, passphrase, validateSnapshot: validateVaultSnapshot });
      await verificationSession.readSnapshot();
      await verificationSession.lock();
      const current = await readEnvelope();
      if (current && !confirm("Backup verificato. Sostituire il vault locale con questo backup?")) {
        pendingImportedEnvelope = null;
        setLockMode(true);
        lockStatus.textContent = "Importazione annullata; il vault locale è rimasto invariato.";
        return;
      }
      unlocked = await importEncryptedVault({
        store: encryptedStore,
        backupBytes,
        passphrase,
        validateSnapshot: validateVaultSnapshot,
        replaceExisting: Boolean(current),
      });
      pendingImportedEnvelope = null;
    } else {
      unlocked = await openEncryptedVault({ store: encryptedStore, passphrase, validateSnapshot: validateVaultSnapshot });
    }
    snapshot = await unlocked.readSnapshot();
    lockStatus.textContent = "";
    setLocked(false);
    render();
  } catch (error) {
    if (unlocked && !unlocked.isLocked()) unlocked.lock().catch(() => {});
    unlocked = null;
    snapshot = null;
    lockStatus.textContent = error instanceof Error ? error.message : "Impossibile aprire il vault.";
  } finally {
    byId("unlock-submit").disabled = false;
    passphraseInput.value = "";
  }
});

lockButton.addEventListener("click", () => {
  setLocked(true);
  setLockMode(true);
  lockStatus.textContent = "Vault bloccato.";
});

for (const eventName of ["pointerdown", "touchstart", "wheel", "keydown", "input", "change"]) {
  document.addEventListener(eventName, () => {
    if (unlocked) scheduleIdleLock();
  });
}

byId("cancel-import").addEventListener("click", async () => {
  pendingImportedEnvelope = null;
  setLockMode(Boolean(await readEnvelope()));
  lockStatus.textContent = "Importazione annullata; nessun dato è stato sostituito.";
});

byId("memory-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const now = new Date().toISOString();
    const id = byId("memory-id").value || crypto.randomUUID();
    await unlocked.saveMemory({
      kind: ({ progetti: "project", preferenze: "preference", persone: "fact" }[byId("memory-category").value] ?? "note"),
      category: byId("memory-category").value,
      title: byId("memory-title").value,
      content: byId("memory-content").value.trim(),
      tags: byId("memory-tags").value.split(","),
      sensitivity: byId("memory-sensitive").checked ? "sensitive" : "ordinary",
      source: { type: "user-authored", capturedAt: now },
    }, id);
    snapshot = await unlocked.readSnapshot();
    clearContextPreview();
    clearMemoryForm();
    render();
    vaultStatus.textContent = "Ricordo salvato nel vault locale.";
  } catch (error) {
    vaultStatus.textContent = error instanceof Error ? error.message : "Impossibile salvare il ricordo.";
  }
});

byId("memory-cancel").addEventListener("click", clearMemoryForm);
byId("search").addEventListener("input", (event) => { searchText = event.target.value; render(); });

byId("context-preview-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const candidate = await unlocked.previewContext(
      { purpose: byId("context-purpose").value.trim(), text: byId("context-request").value.trim(), limit: 8 },
      { kind: "local-model", adapterId: "local-preview", label: "Anteprima locale (nessun invio)" },
      { includeSensitive: byId("context-include-sensitive").checked },
    );
    renderContextPreview(candidate);
  } catch (error) {
    const result = byId("context-preview-result");
    result.replaceChildren();
    const message = document.createElement("p");
    message.className = "status";
    message.textContent = error instanceof Error ? error.message : "Impossibile creare l'anteprima locale.";
    result.append(message);
  }
});
byId("context-preview-clear").addEventListener("click", clearContextPreview);

byId("profile-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
  const lines = byId("profile-rules").value.split("\n").map((line) => line.trim()).filter(Boolean);
  const boundaries = byId("profile-boundaries").value.split("\n").map((line) => line.trim()).filter(Boolean);
  const profile = {
    schemaVersion: 1,
    language: byId("profile-language").value.trim() || "Italiano",
    identity: {
      assistantId: snapshot.profile.identity?.assistantId ?? crypto.randomUUID(),
      name: byId("assistant-name").value.trim(),
      description: byId("assistant-description").value.trim(),
      avatarDescription: byId("assistant-avatar-description").value.trim(),
      avatarAssetId: snapshot.profile.identity?.avatarAssetId ?? "",
    },
    behavior: {
      tone: byId("profile-tone").value.trim(),
      responseLength: byId("profile-response-length").value,
      rules: lines,
      boundaries,
    },
    voice: {
      voiceIdentityId: byId("voice-identity-id").value.trim() || snapshot.profile.voice?.voiceIdentityId || crypto.randomUUID(),
      readAloud: byId("read-aloud").checked,
      language: byId("voice-language").value.trim(),
      timbreDescription: byId("voice-description").value.trim(),
      accentDescription: byId("voice-accent").value.trim(),
      pace: byId("voice-pace").value,
      preferredVoiceLabel: byId("voice-label").value.trim(),
      engineId: byId("voice-engine-id").value.trim(),
      voiceModelAssetId: snapshot.profile.voice?.voiceModelAssetId ?? "",
    },
  };
  snapshot = await unlocked.updateProfile(profile);
  clearContextPreview();
  vaultStatus.textContent = "Profilo salvato nel vault locale.";
  } catch (error) {
    vaultStatus.textContent = error instanceof Error ? error.message : "Impossibile salvare il profilo.";
  }
});

byId("passphrase-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const currentPassphrase = byId("current-passphrase").value;
  const newPassphrase = byId("new-passphrase").value;
  const confirmation = byId("confirm-new-passphrase").value;
  try {
    if (newPassphrase !== confirmation) throw new Error("Le nuove passphrase non coincidono.");
    await unlocked.changePassphrase(currentPassphrase, newPassphrase);
    passphraseStatus.textContent = "Passphrase aggiornata. I ricordi e la chiave del vault non sono stati ricifrati.";
  } catch (error) {
    passphraseStatus.textContent = error instanceof Error ? error.message : "Impossibile aggiornare la passphrase.";
  } finally {
    byId("current-passphrase").value = "";
    byId("new-passphrase").value = "";
    byId("confirm-new-passphrase").value = "";
  }
});

byId("export-button").addEventListener("click", async () => {
  try {
    const blob = new Blob([await unlocked.exportEncryptedBackup()], { type: "application/vnd.memoria-vault+json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ai-memoria-vault-${new Date().toISOString().slice(0, 10)}.mvault`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    vaultStatus.textContent = "Backup cifrato esportato. Conservalo in un luogo sicuro.";
  } catch (error) {
    vaultStatus.textContent = error instanceof Error ? error.message : "Impossibile esportare il backup.";
  }
});

byId("delete-vault").addEventListener("click", async () => {
  const confirmation = prompt("Questa operazione cancella il vault da questo browser. Digita ELIMINA per confermare. Un backup esportato in precedenza resterà separato.");
  if (confirmation !== "ELIMINA") return;
  await unlocked.destroy();
  unlocked = null;
  snapshot = null;
  setLocked(true);
  setLockMode(false);
  lockStatus.textContent = "Vault eliminato da questo browser.";
});

byId("import-file").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    if (file.size > MAX_BACKUP_BYTES) throw new Error("Il backup supera il limite di 25 MB previsto da questo prototipo.");
    const envelope = JSON.parse(await file.text());
    if (!validateEnvelope(envelope)) throw new Error("Il file non sembra un backup cifrato AI Memoria Vault.");
    const current = await readEnvelope();
    pendingImportedEnvelope = envelope;
    setLockMode(Boolean(current), true);
    lockStatus.textContent = "Backup selezionato. Verifica la passphrase: il vault esistente non è stato modificato.";
    passphraseInput.focus();
  } catch (error) {
    lockStatus.textContent = error instanceof Error ? error.message : "Impossibile importare il backup.";
  } finally {
    event.target.value = "";
  }
});

try {
  const envelope = await readEnvelope();
  setLockMode(Boolean(envelope));
} catch {
  setLockMode(false);
  lockStatus.textContent = "Questo browser non consente lo storage locale richiesto. Apri l'app da localhost o da un'origine sicura.";
  byId("unlock-submit").disabled = true;
}

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
