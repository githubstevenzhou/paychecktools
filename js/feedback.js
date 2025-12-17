(function () {
  const box = document.getElementById("feedback-box");
  if (!box) return;

  const status = document.getElementById("feedback-status");
  const noBox = document.getElementById("no-reason-box");
  const page = location.pathname;
  let pendingNo = false;

  document.addEventListener("calculator:result-ready", () => {
    box.style.display = "block";
    loadStats();
  });

  box.addEventListener("click", async (e) => {
    const vote = e.target.dataset.vote;
    if (!vote) return;

    if (vote === "no") {
      pendingNo = true;
      noBox.style.display = "block";
      return;
    }

    submitVote({ vote });
  });

  document.getElementById("submit-no-reason")?.addEventListener("click", () => {
    const reason = document.querySelector("input[name='no-reason']:checked")?.value;
    if (!reason) {
      status.textContent = "Please select a reason.";
      return;
    }

    submitVote({ vote: "no", reason });
    noBox.style.display = "none";
  });

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

      status.textContent = `Thanks! Yes: ${data.yes} | No: ${data.no}`;
    } catch {
      status.textContent = "Failed to submit feedback.";
    }
  }

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
