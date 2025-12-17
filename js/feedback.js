(function () {
  const box = document.getElementById("feedback-box");
  if (!box) return;

  const status = document.getElementById("feedback-status");
  const noBox = document.getElementById("no-reason-box");
  const page = location.pathname;

  let selectedVote = null;   // track selection before submission
  let selectedReason = null;

  // --- Show feedback box when calculation result is ready ---
  document.addEventListener("calculator:result-ready", () => {
    box.style.display = "block";
    loadStats();
  });

  // --- Handle click on Yes / No buttons ---
  box.addEventListener("click", (e) => {
    const vote = e.target.dataset.vote;
    if (!vote) return;

    selectedVote = vote;

    if (vote === "no") {
      // Show No reasons
      noBox.style.display = "block";
    } else {
      // Hide No reasons if Yes selected
      noBox.style.display = "none";
    }
  });

  // --- Handle submission of No reason ---
  document.getElementById("submit-no-reason")?.addEventListener("click", () => {
    if (selectedVote !== "no") return;

    const reason = document.querySelector("input[name='no-reason']:checked")?.value;
    if (!reason) {
      status.textContent = "Please select a reason.";
      return;
    }

    selectedReason = reason;
    submitVote({ vote: "no", reason: selectedReason });
    noBox.style.display = "none"; // hide after submission
    selectedVote = null;
    selectedReason = null;
  });

  // --- Submit Yes vote immediately ---
  box.querySelector('button[data-vote="yes"]')?.addEventListener("click", () => {
    if (selectedVote === "yes") {
      submitVote({ vote: "yes" });
      selectedVote = null;
    }
  });

  // --- Submit vote to Worker ---
  async function submitVote(payload) {
    status.textContent = "Submitting...";

    try {
      const res = await fetch("https://paychecktools-feedback.zhouqiext.workers.dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, ...payload })
      });

      const data = await res.json();
      if (!data.success) throw new Error();

      // Display latest vote stats after submission
      status.textContent = `Thanks! Yes: ${data.yes} | No: ${data.no}`;
    } catch {
      status.textContent = "Failed to submit feedback.";
    }
  }

  // --- Load current vote stats without changing selection ---
  async function loadStats() {
    try {
      const res = await fetch("https://paychecktools-feedback.zhouqiext.workers.dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, vote: "none" })
      });

      const data = await res.json();
      if (data.success) {
        status.textContent = `Yes: ${data.yes} | No: ${data.no}`;
      }
    } catch {}
  }
})();
