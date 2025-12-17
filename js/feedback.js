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

    // 清除按钮高亮
    box.querySelectorAll("button[data-vote]").forEach(btn => btn.classList.remove("active"));
    box.querySelectorAll("input[name='no-reason']").forEach(r => r.checked = false);

    loadStats(); // 显示总票数
  });

  // Yes / No 点击逻辑
  box.querySelectorAll("button[data-vote]").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedVote = btn.dataset.vote;

      // 高亮按钮
      box.querySelectorAll("button[data-vote]").forEach(b => b.classList.toggle("active", b === btn));

      if (selectedVote === "no") {
        noBox.style.display = "block";
      } else {
        noBox.style.display = "none";
      }

      // 不显示默认提示文字
      status.textContent = "";
    });
  });

  // Submit 点击逻辑
  submitBtn.addEventListener("click", async () => {
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
    }

    // 提交到 Worker
    status.textContent = "Submitting...";
    try {
      const res = await fetch("https://paychecktools-feedback.zhouqiext.workers.dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, vote: selectedVote, reason: selectedReason })
      });

      const data = await res.json();
      if (!data.success) throw new Error();

      // 显示最新统计
      status.textContent = `Thanks! Yes: ${data.yes} | No: ${data.no}`;
    } catch {
      status.textContent = "Failed to submit feedback.";
    }

    // Reset
    selectedVote = null;
    selectedReason = null;
    noBox.style.display = "none";
    box.querySelectorAll("button[data-vote]").forEach(b => b.classList.remove("active"));
    box.querySelectorAll("input[name='no-reason']").forEach(r => r.checked = false);
  });

  // 拉取总票数
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
