(function () {
  const box = document.getElementById("feedback-box");
  if (!box) return;

  const status = document.getElementById("feedback-status");
  const noBox = document.getElementById("no-reason-box");
  const submitBtn = document.getElementById("feedback-submit");
  const page = location.pathname;

  let selectedVote = null;
  let selectedReason = null;

  // 显示 Feedback 区域
  document.addEventListener("calculator:result-ready", () => {
    box.style.display = "block";
    noBox.style.display = "none";
    status.textContent = "";
    selectedVote = null;
    selectedReason = null;

    box.querySelectorAll("button[data-vote]").forEach(btn => btn.classList.remove("active"));
    box.querySelectorAll("input[name='no-reason']").forEach(r => r.checked = false);

    loadStats(); // 显示当前总票数
  });

  // Yes / No 按钮点击逻辑
  box.querySelectorAll("button[data-vote]").forEach(btn => {
    btn.addEventListener("click", async () => {
      selectedVote = btn.dataset.vote;

      box.querySelectorAll("button[data-vote]").forEach(b => b.classList.toggle("active", b === btn));

      if (selectedVote === "yes") {
        noBox.style.display = "none";
        status.textContent = "Submitting...";
        await submitVote({ vote: "yes" });
        // 提交完成后刷新总票数
        await loadStats();
      } else if (selectedVote === "no") {
        noBox.style.display = "block";
        status.textContent = ""; // 提示用户选择原因
      }
    });
  });

  // Submit 按钮点击逻辑（仅用于 No）
  submitBtn.addEventListener("click", async () => {
    if (selectedVote !== "no") return; // 仅在 No 时使用 Submit

    const reason = document.querySelector("input[name='no-reason']:checked")?.value;
    if (!reason) {
      status.textContent = "Please select a reason for No before submitting.";
      return;
    }
    selectedReason = reason;
    status.textContent = "Submitting...";
    await submitVote({ vote: "no", reason: selectedReason });
    await loadStats();

    // Reset
    selectedVote = null;
    selectedReason = null;
    noBox.style.display = "none";
    box.querySelectorAll("button[data-vote]").forEach(b => b.classList.remove("active"));
    box.querySelectorAll("input[name='no-reason']").forEach(r => r.checked = false);
  });

  async function submitVote(payload) {
    try {
      const res = await fetch("https://paychecktools-feedback.zhouqiext.workers.dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, ...payload })
      });
      const data = await res.json();
      if (!data.success) throw new Error();
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
        status.textContent = `Current feedback: Yes: ${data.yes} | No: ${data.no}`;
      }
    } catch {}
  }
})();
