(function () {
  const box = document.getElementById("feedback-box");
  if (!box) return;

  const status = document.getElementById("feedback-status");
  const noBox = document.getElementById("no-reason-box");
  const submitBtn = document.getElementById("feedback-submit");
  const page = location.pathname;

  let hasSubmitted = false; // 标记是否已提交
  let selectedVote = null;
  let selectedReason = null;

  // 显示 feedback 区域
  document.addEventListener("calculator:result-ready", () => {
    if (hasSubmitted) return; // 已提交则不再显示
    box.style.display = "block";
    noBox.style.display = "none";
    status.textContent = "";
    selectedVote = null;
    selectedReason = null;

    box.querySelectorAll("button[data-vote]").forEach(btn => btn.disabled = false);
    box.querySelectorAll("button[data-vote]").forEach(btn => btn.classList.remove("active"));
    box.querySelectorAll("input[name='no-reason']").forEach(r => r.checked = false);

    loadStats(); // 显示总票数
  });

  // Yes / No 按钮点击逻辑
  box.querySelectorAll("button[data-vote]").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (hasSubmitted) return; // 防止重复提交
      selectedVote = btn.dataset.vote;

      // 高亮按钮
      box.querySelectorAll("button[data-vote]").forEach(b => b.classList.toggle("active", b === btn));

      if (selectedVote === "yes") {
        noBox.style.display = "none";
        status.textContent = "Submitting...";
        try {
          await submitVote({ vote: "yes" });
          status.textContent = "Thanks! Feedback submitted.";
          await loadStats();
          finalizeFeedback(); // 禁用按钮，防止再次提交
        } catch {
          status.textContent = "Failed to submit feedback. Please try again.";
        }
      } else if (selectedVote === "no") {
        noBox.style.display = "block";
        status.textContent = ""; // 提示用户选择原因
      }
    });
  });

  // Submit 按钮点击逻辑（仅用于 No）
  submitBtn.addEventListener("click", async () => {
    if (hasSubmitted) return; // 防止重复提交
    if (selectedVote !== "no") return;

    const reason = document.querySelector("input[name='no-reason']:checked")?.value;
    if (!reason) {
      status.textContent = "Please select a reason for No before submitting.";
      return;
    }
    selectedReason = reason;

    status.textContent = "Submitting...";
    try {
      await submitVote({ vote: "no", reason: selectedReason });
      status.textContent = "Thanks! Feedback submitted.";
      await loadStats();
      finalizeFeedback(); // 禁用按钮
    } catch {
      status.textContent = "Failed to submit feedback. Please try again.";
    }
  });

  // 提交到 Worker
  async function submitVote(payload) {
    const res = await fetch("https://paychecktools-feedback.zhouqiext.workers.dev", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page, ...payload })
    });
    const data = await res.json();
    if (!data.success) throw new Error();
  }

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
        status.textContent += ` Current feedback: Yes: ${data.yes} | No: ${data.no}`;
      }
    } catch {}
  }

  // 提交成功后禁用所有按钮，防止重复提交
  function finalizeFeedback() {
    hasSubmitted = true;
    selectedVote = null;
    selectedReason = null;
    noBox.style.display = "none";
    box.querySelectorAll("button[data-vote]").forEach(btn => btn.disabled = true);
    box.querySelectorAll("input[name='no-reason']").forEach(r => r.disabled = true);
  }

})();
