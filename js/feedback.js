(function () {
  const box = document.getElementById("feedback-box");
  if (!box) return;

  const status = document.getElementById("feedback-status");
  const noBox = document.getElementById("no-reason-box");
  const page = location.pathname;

  let selectedVote = null;
  let selectedReason = null;

  // Show feedback when calculation is ready
  document.addEventListener("calculator:result-ready", () => {
    box.style.display = "block";
    loadStats();
  });

  // Handle Yes / No selection
  box.addEventListener("click", (e) => {
    const vote = e.target.dataset.vote;
    if (!vote) return;

    selectedVote = vote;

    if (vote === "no") {
      noBox.style.display = "block";
      status.textContent = ""; // 清空提示
    } else {
      noBox.style.display = "none";
      // 提示用户点击 Submit
      status.textContent = "You selected Yes. Click Submit to confirm.";
    }
  });

  // Unified Submit button
  document.getElementById("feedback-submit")?.addEventListener("click", () => {
    if (!selectedVote) {
      status.textContent = "Please select Yes or No.";
      return;
    }

    if (selectedVote === "no") {
      const reason = document.querySelector("input[name='no-reason']:checked")?.value;
      if (!reason) {
        status.textContent = "Please select a reason for No.";
        return;
      }
      selectedReason = reason;
      submitVote({ vote: "no", reason: selectedReason });
    } else {
      submitVote({ vote: "yes" });
    }

    // Reset selections after submission
    selectedVote = null;
    selectedReason = null;
    noBox.style.display = "none";
  });

  // Submit vote to Worker
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

      status.textContent = `Thanks! Yes: ${data.yes} | No: ${data.no}`;
    } catch {
      status.textContent = "Failed to submit feedback.";
    }
  }

  // Load current stats without changing selection
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
