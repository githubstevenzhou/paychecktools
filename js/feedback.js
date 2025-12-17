(function () {
  const box = document.getElementById("feedback-box");
  if (!box) return;

  const status = document.getElementById("feedback-status");
  const noBox = document.getElementById("no-reason-box");
  const submitBtn = document.getElementById("feedback-submit");
  const page = location.pathname;

  let selectedVote = null;
  let selectedReason = null;

  // Show feedback box when calculation is ready
  document.addEventListener("calculator:result-ready", () => {
    box.style.display = "block";
    loadStats();
  });

  // Handle Yes / No button clicks
  const voteButtons = box.querySelectorAll("button[data-vote]");
  voteButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      selectedVote = btn.dataset.vote;

      if (selectedVote === "no") {
        noBox.style.display = "block";
        status.textContent = "You selected No. Please choose a reason and click Submit.";
      } else if (selectedVote === "yes") {
        noBox.style.display = "none";
        status.textContent = "You selected Yes. Click Submit to confirm.";
      }
    });
  });

  // Handle Submit button click
  submitBtn.addEventListener("click", () => {
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
