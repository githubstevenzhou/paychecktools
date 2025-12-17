(function () {
  const box = document.getElementById("feedback-box");
  if (!box) return;

  const status = document.getElementById("feedback-status");
  const noBox = document.getElementById("no-reason-box");
  const page = location.pathname;
  let pendingNo = false;

  // --- Event triggered when calculation result is ready ---
  document.addEventListener("calculator:result-ready", () => {
    box.style.display = "block";
    loadStats();
  });

  // --- Handle click on Yes / No buttons ---
  box.addEventListener("click", async (e) => {
    const vote = e.target.dataset.vote;
    if (!vote) return;

    // Always hide No Reason box first
    noBox.style.display = "none";
    pendingNo = false;

    if (vote === "no") {
      // Show No Reason box
      pendingNo = true;
      noBox.style.display = "block";
      return;
    }

    // Vote Yes
    submitVote({ vote });
  });

  // --- Handle submission of No reason ---
  document.getElementById("submit-no-reason")?.addEventListener("click", () => {
    const reason = document.querySelector("input[name='no-reason']:checked")?.value;
    if (!reason) {
      status.textContent = "Please select a reason.";
      return;
    }

    submitVote({ vote: "no", reason });
    noBox.style.display = "none"; // hide after submission
    pendingNo = false;
  });

  // --- Submit vote to Worker ---
  async function submitVote(payload) {
    status.textContent = "Submitting...";

    try {
      const res = await fetch("https://paychecktools-feedback.zhouqiext.workers.dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page,
          ...payload
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error();

      // Display latest vote stats
      status.textContent = `Thanks! Yes: ${data.yes} | No: ${data.no}`;
    } catch {
      status.textContent = "Failed to submit feedback.";
    }
  }

  // --- Load current vote stats ---
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
